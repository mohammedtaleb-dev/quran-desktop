// The reader is entirely in the web frontend (src/); pages ship as bundled resources
// and are loaded through Tauri's asset protocol.
use std::path::PathBuf;

use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;

#[cfg(windows)]
#[link(name = "kernel32")]
extern "system" {
    fn SetThreadExecutionState(flags: u32) -> u32;
}

#[cfg(windows)]
const ES_CONTINUOUS: u32 = 0x8000_0000;
#[cfg(windows)]
const ES_SYSTEM_REQUIRED: u32 = 0x0000_0001;
#[cfg(windows)]
const ES_DISPLAY_REQUIRED: u32 = 0x0000_0002;

/// Keeps the screen from dimming or sleeping while the reader is open.
/// A synchronous command runs on the main thread, which holds this state for the app's lifetime.
#[tauri::command]
fn keep_screen_on(on: bool) {
    #[cfg(windows)]
    unsafe {
        let flags = if on {
            ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
        } else {
            ES_CONTINUOUS
        };
        SetThreadExecutionState(flags);
    }
    #[cfg(not(windows))]
    let _ = on;
}

/// The bundled tajweed summary (resources/docs/tajweed.pdf), if it has been added to the app.
fn tajweed_pdf(app: &AppHandle) -> Option<PathBuf> {
    let path = app.path().resource_dir().ok()?.join("docs").join("tajweed.pdf");
    path.is_file().then_some(path)
}

#[tauri::command]
fn tajweed_pdf_path(app: AppHandle) -> Option<String> {
    tajweed_pdf(&app).map(|p| p.to_string_lossy().into_owned())
}

/// Asks where to save a copy of the tajweed summary and writes it there.
/// Returns false when the user cancels.
#[tauri::command]
async fn save_tajweed_pdf(app: AppHandle) -> Result<bool, String> {
    let source = tajweed_pdf(&app).ok_or("ملخص التجويد غير موجود")?;
    let picked = app
        .dialog()
        .file()
        .set_title("حفظ ملخص أحكام التجويد")
        .set_file_name("ملخص أحكام التجويد.pdf")
        .add_filter("PDF", &["pdf"])
        .blocking_save_file();
    let Some(target) = picked else { return Ok(false) };
    let target = target.into_path().map_err(|e| e.to_string())?;
    std::fs::copy(&source, &target).map_err(|e| e.to_string())?;
    Ok(true)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![keep_screen_on, tajweed_pdf_path, save_tajweed_pdf])
        .run(tauri::generate_context!())
        .expect("error while running the Quran app");
}
