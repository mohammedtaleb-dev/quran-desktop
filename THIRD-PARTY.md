# المواد التي ليست من عملنا (Third-party material)

رخصة MIT في ملف `LICENSE` تشمل كود البرنامج فقط. المواد التالية لها أصحابها وشروطها، وتبقى عليها.

| المادة | المكان في المشروع | المصدر | الرخصة / الوضع |
|---|---|---|---|
| صور صفحات المصحف (طبعة شامية بخط عثمان طه، الأسماء بالأحمر) | `src-tauri/pages/` | ملف «Quran with Allah's Name in Red» على [archive.org](https://archive.org/details/al-quran-with-allah-name-in-red-color-arabic) | لم تُذكر رخصة. دار النشر أخبرتنا أن النسخة مجانية ومسموحة؛ يُحفظ الإذن مكتوباً قبل أي نشر عام |
| بيانات السور والأجزاء والأحزاب والأرباع | `src/js/meta.js`، `tools/data/` | [Tanzil.net](https://tanzil.net) | CC BY 3.0: مسموح مع ذكر المصدر |
| نص الآيات المستخدم في البحث | `src/data/text.js` | مجمع الملك فهد، عبر [Quran.com API](https://api-docs.quran.com) | شروط Quran.com. يُطلب الإذن أو يُستبدل بنص Tanzil قبل النشر العام |
| التفسير الميسر | `src/data/muyassar.js` | مجمع الملك فهد، عبر Quran.com API | كما في السطر السابق |
| خط Amiri | `src/fonts/amiri-*.woff2` | [aliftype/amiri](https://github.com/aliftype/amiri) | SIL Open Font License 1.1، نصها في `src/fonts/OFL.txt` |
| خط أسماء السور | `src/fonts/sura_names.woff2` | Quran.com | رخصته غير مذكورة. يُتأكد منها أو يُستبدل قبل النشر العام |
| ملخص أحكام التجويد | `src-tauri/docs/tajweed.pdf` | ملف من صاحب المشروع | حسب إذن كاتبه |
| Tauri وإضافاته، ومكتبات Rust وnpm | `Cargo.toml`، `package.json` | [tauri.app](https://tauri.app) | MIT / Apache-2.0 |

## نص الذكر المختصر (يظهر أيضاً في «حول البرنامج»)

- صفحات المصحف: ملف «Quran with Allah's Name in Red» من أرشيف الإنترنت.
- بيانات السور والأجزاء والأحزاب: Tanzil.net (CC BY 3.0).
- نص الآيات للبحث، والتفسير الميسر (مجمع الملك فهد): عبر Quran.com.
- الخطوط: Amiri (OFL)، وخط أسماء السور من Quran.com.
