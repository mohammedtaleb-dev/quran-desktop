// Finds every ayah-end marker on the mushaf page images and turns them into per-ayah highlight boxes.
// Output: src/data/ayahs.js  window.AYAH_BOXES = { page: [["sura:aya", [[x, y, w, h], ...]], ...] }
// with coordinates as fractions of the page image (0..1), so they scale with the displayed page.
//
// How it works: every page ends at the end of an ayah, so the number of markers on a page equals the
// number of verses on it (known from the text data). Markers all share one ornament, found by
// normalized cross-correlation against a template cut from page 249 (the digits inside are masked out).
// Pages are cropped to the 15-line text block, so line k occupies the band [k, k+1) * height / 15.
//
// Usage: node tools/detect-ayahs.js [page ...]     (no pages = all 604; writes the data file only then)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src-tauri', 'pages');
const LINES = 15;

function loadGray(page) {
  const img = jpeg.decode(fs.readFileSync(path.join(PAGES_DIR, `${String(page).padStart(3, '0')}.jpg`)), { useTArray: true });
  const gray = new Float32Array(img.width * img.height);
  for (let i = 0; i < gray.length; i++) gray[i] = 0.299 * img.data[4 * i] + 0.587 * img.data[4 * i + 1] + 0.114 * img.data[4 * i + 2];
  return { w: img.width, h: img.height, gray };
}

function downscale({ w, h, gray }, f) {
  const W = Math.floor(w / f);
  const H = Math.floor(h / f);
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) s += gray[(y * f + dy) * w + x * f + dx];
      out[y * W + x] = s / (f * f);
    }
  }
  return { w: W, h: H, gray: out };
}

// Templates: the ① marker on page 249 and the ١٠٨ marker on page 304 (three-digit numbers reach into
// the ring), ring only — the inside ellipse holds the varying digits and is masked out.
const T_BOXES = [{ page: 249, x: 404, y: 299, w: 61, h: 67 }, { page: 304, x: 500, y: 1055, w: 58, h: 67 }];
const F = 2; // search at half resolution
function makeTemplate(scale = 1, which = 0) {
  const T_BOX = T_BOXES[which];
  const src = loadGray(T_BOX.page);
  const crop = { w: T_BOX.w, h: T_BOX.h, gray: new Float32Array(T_BOX.w * T_BOX.h) };
  for (let y = 0; y < T_BOX.h; y++) for (let x = 0; x < T_BOX.w; x++) crop.gray[y * T_BOX.w + x] = src.gray[(T_BOX.y + y) * src.w + T_BOX.x + x];
  // resample by scale/F with nearest neighbour (enough for a matching template)
  const k = scale / F;
  const w = Math.round(T_BOX.w * k);
  const h = Math.round(T_BOX.h * k);
  const pts = [];
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ex = (x - cx) / (w / 2);
      const ey = (y - cy) / (h / 2);
      const r = ex * ex + ey * ey;
      const inner = ((x - cx) / (w * 0.29)) ** 2 + ((y - cy) / (h * 0.29)) ** 2;
      if (r > 1 || inner < 1) continue;
      pts.push([x, y, crop.gray[Math.min(T_BOX.h - 1, Math.floor(y / k)) * T_BOX.w + Math.min(T_BOX.w - 1, Math.floor(x / k))]]);
    }
  }
  const mean = pts.reduce((s, p) => s + p[2], 0) / pts.length;
  let norm = 0;
  for (const p of pts) { p[2] -= mean; norm += p[2] * p[2]; }
  return { w, h, pts, norm: Math.sqrt(norm), scale };
}

function matchScores(img, tpl) {
  const { w, h, gray } = img;
  const n = tpl.pts.length;
  const scores = new Float32Array(w * h).fill(-1);
  const offs = tpl.pts.map(([x, y]) => y * w + x);
  const tv = tpl.pts.map((p) => p[2]);
  for (let y = 0; y + tpl.h <= h; y++) {
    for (let x = 0; x + tpl.w <= w; x++) {
      const base = y * w + x;
      let s = 0; let s2 = 0; let st = 0;
      for (let i = 0; i < n; i++) { const v = gray[base + offs[i]]; s += v; s2 += v * v; st += v * tv[i]; }
      const varI = s2 - (s * s) / n;
      if (varI < 1e3) continue; // blank area
      scores[base] = st / (Math.sqrt(varI) * tpl.norm);
    }
  }
  return scores;
}

function peaks(scores, w, h, tpl, minScore) {
  const found = [];
  const rx = Math.floor(tpl.w * 0.7);
  const ry = Math.floor(tpl.h * 0.7);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = scores[y * w + x];
      if (v < minScore) continue;
      let best = true;
      for (let dy = -ry; dy <= ry && best; dy++) {
        for (let dx = -rx; dx <= rx; dx++) {
          const yy = y + dy; const xx = x + dx;
          if (yy < 0 || xx < 0 || yy >= h || xx >= w) continue;
          const o = scores[yy * w + xx];
          if (o > v || (o === v && (dy < 0 || (dy === 0 && dx < 0)))) { best = false; break; }
        }
      }
      if (best) found.push({ x, y, score: v });
    }
  }
  return found.sort((a, b) => b.score - a.score);
}

// Verses per page from the generated text data: [[sura, aya, page, text], ...]
const textCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'data', 'text.js'), 'utf8'), textCtx);
const versesByPage = {};
for (const [sura, aya, page] of textCtx.window.QURAN_TEXT) (versesByPage[page] ??= []).push([sura, aya]);

const templates = {};
const templateFor = (scale, which = 0) => (templates[`${scale}/${which}`] ??= makeTemplate(scale, which));

// The two framed opening pages are set larger, in 7 lines (Baqarah: basmala on the first line).
// Their line grid is fitted from the markers, whose line in the Shami layout is known.
const OPENING = {
  1: { lines: 7, markerLines: [0, 1, 2, 2, 3, 4, 6], firstTextLine: 0, xmin: 30, xmax: 870 },
  2: { lines: 7, markerLines: [1, 2, 3, 5, 6], firstTextLine: 1, xmin: 30, xmax: 870 },
};

// Ink extents of one text line, measured in the middle of the band so diacritics of neighbours don't count.
function lineExtents(full, y0, y1, xmin = 0, xmax = full.w) {
  const a = Math.floor(y0 + (y1 - y0) * 0.2);
  const b = Math.floor(y1 - (y1 - y0) * 0.2);
  const cols = new Uint16Array(full.w);
  for (let y = a; y < b; y++) for (let x = xmin; x < xmax; x++) if (full.gray[y * full.w + x] < 120) cols[x]++;
  let l = xmin; while (l < xmax && cols[l] < 2) l++;
  let r = xmax - 1; while (r > xmin && cols[r] < 2) r--;
  return l < r ? { left: l, right: r + 1 } : null;
}

// Classifies a line band: surah header bands are dense ornament across the full width;
// a basmala line is a short centred line. Thin border lines (< 4px of ink per column) are ignored.
function lineKind(full, y0, y1) {
  const a = Math.floor(y0 + (y1 - y0) * 0.25);
  const b = Math.floor(y1 - (y1 - y0) * 0.25);
  const cols = new Uint16Array(full.w);
  let dark = 0;
  for (let y = a; y < b; y++) for (let x = 0; x < full.w; x++) if (full.gray[y * full.w + x] < 120) { cols[x]++; dark++; }
  let l = 0; while (l < full.w && cols[l] < 4) l++;
  let r = full.w - 1; while (r > 0 && cols[r] < 4) r--;
  const span = Math.max(0, r - l) / full.w;
  const density = dark / ((b - a) * full.w);
  return { header: density > 0.18 && span > 0.97, short: span < 0.75 && density > 0.02 };
}

// Best match per position over the templates; peaks remember which template matched (for the box size).
function findMarkers(small, n, scales, kinds) {
  let best = null;
  for (const scale of scales) {
    const tpls = kinds.map((k) => templateFor(scale, k));
    const scores = new Float32Array(small.w * small.h).fill(-1);
    const from = new Uint8Array(small.w * small.h);
    tpls.forEach((tpl, k) => {
      const sc = matchScores(small, tpl);
      for (let i = 0; i < sc.length; i++) if (sc[i] > scores[i]) { scores[i] = sc[i]; from[i] = k; }
    });
    const big = { w: Math.max(...tpls.map((t) => t.w)), h: Math.max(...tpls.map((t) => t.h)) };
    const all = peaks(scores, small.w, small.h, big, 0.28).map((p) => ({ ...p, tpl: tpls[from[p.y * small.w + p.x]] }));
    const total = all.slice(0, n).reduce((s, p) => s + p.score, 0);
    if (!best || total > best.total) best = { all, total };
  }
  return best;
}

function analysePage(page) {
  const verses = versesByPage[page] || [];
  const full = loadGray(page);
  const small = downscale(full, F);
  const open = OPENING[page];
  const n = verses.length;
  const { all } = findMarkers(small, n, open ? [1.1, 1.15, 1.2, 1.25] : [1], open ? [0] : [0, 1]);
  const chosen = all.slice(0, n);
  const margin = n < all.length ? chosen[n - 1].score - all[n].score : chosen[n - 1]?.score ?? 0;
  const H = full.h; const W = full.w;

  // markers in full-resolution pixels, in reading order (top to bottom, right to left)
  let markers = chosen.map((p) => ({ x0: p.x * F, x1: (p.x + p.tpl.w) * F, cy: (p.y + p.tpl.h / 2) * F, score: p.score }));
  let top = 0;
  let lineH = H / LINES;
  let nLines = LINES;
  if (open) {
    // least-squares fit of marker centres to their known lines: cy = a + b * (line + 0.5)
    markers.sort((m1, m2) => m1.cy - m2.cy || m2.x0 - m1.x0);
    const xs = open.markerLines.map((l) => l + 0.5);
    const ys = markers.map((m) => m.cy);
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
    const my = ys.reduce((s, v) => s + v, 0) / ys.length;
    lineH = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    top = my - lineH * mx;
    nLines = open.lines;
  }
  markers = markers.map((m) => ({ ...m, line: Math.floor((m.cy - top) / lineH) })).sort((a, b) => a.line - b.line || b.x0 - a.x0);
  const ext = Array.from({ length: nLines }, (_, l) => lineExtents(full, top + l * lineH, top + (l + 1) * lineH, open?.xmin, open?.xmax));
  const edge = (l, side) => ext[l]?.[side] ?? (side === 'left' ? 0 : W);

  // Before a surah's first ayah come its header band and basmala (At-Tawbah: header only); either may
  // also sit at the bottom of the previous page, so they are recognised on the image, not assumed.
  const kinds = Array.from({ length: nLines }, (_, l) => lineKind(full, top + l * lineH, top + (l + 1) * lineH));
  const markerLines = new Set(markers.map((m) => m.line));
  const boxes = [];
  const problems = [];
  let cur = { line: open ? open.firstTextLine : 0, x: null }; // where the next ayah starts (x null = line start)
  verses.forEach(([sura, aya], i) => {
    const m = markers[i];
    if (aya === 1 && !open) {
      let line = i === 0 ? 0 : markers[i - 1].line + 1;
      for (let skipped = 0; skipped < 2 && line < nLines; skipped++) {
        const k = kinds[line];
        if (k.header || (k.short && !markerLines.has(line))) line++;
        else break;
      }
      cur = { line, x: null };
    }
    if (!m) { problems.push(`no marker for ${sura}:${aya}`); return; }
    if (m.line < cur.line) problems.push(`${sura}:${aya} marker on line ${m.line} before its start line ${cur.line}`);
    const rects = [];
    for (let line = cur.line; line <= m.line; line++) {
      const x1 = Math.min(W, (line === cur.line && cur.x != null ? cur.x : edge(line, 'right')) + 4);
      const x0 = Math.max(0, (line === m.line ? m.x0 : edge(line, 'left')) - 4);
      if (x1 - x0 > 10) rects.push([x0, top + line * lineH, x1 - x0, lineH]);
    }
    boxes.push([`${sura}:${aya}`, rects]);
    // The next ayah starts just left of this marker, or on the next line when nothing follows it.
    cur = m.x0 - edge(m.line, 'left') < lineH * 0.5 ? { line: m.line + 1, x: null } : { line: m.line, x: m.x0 };
  });
  return { page, n, found: all.length, margin, minScore: chosen.length ? chosen[chosen.length - 1].score : 0, boxes, markers, problems, size: [W, H] };
}

// Debug aid: OVERLAY=<dir> writes each analysed page with its ayah boxes tinted in alternating colours.
function writeOverlay(dir, res) {
  const img = jpeg.decode(fs.readFileSync(path.join(PAGES_DIR, `${String(res.page).padStart(3, '0')}.jpg`)), { useTArray: true });
  const tints = [[255, 200, 0], [0, 170, 255], [0, 210, 120]];
  res.boxes.forEach(([, rects], i) => {
    const [tr, tg, tb] = tints[i % tints.length];
    for (const [x, y, w, h] of rects) {
      for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(img.height, y + h); yy++) {
        for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(img.width, x + w); xx++) {
          const o = (yy * img.width + xx) * 4;
          img.data[o] = img.data[o] * 0.65 + tr * 0.35; img.data[o + 1] = img.data[o + 1] * 0.65 + tg * 0.35; img.data[o + 2] = img.data[o + 2] * 0.65 + tb * 0.35;
        }
      }
    }
  });
  fs.writeFileSync(path.join(dir, `overlay-${res.page}.jpg`), jpeg.encode({ data: img.data, width: img.width, height: img.height }, 85).data);
}

const r4 = (v) => Math.round(v * 10000) / 10000;
function analyse(pages, verbose) {
  const out = {};
  const report = [];
  for (const page of pages) {
    const res = analysePage(page);
    if (process.env.OVERLAY) writeOverlay(process.env.OVERLAY, res);
    const [W, H] = res.size;
    out[page] = res.boxes.map(([key, rects]) => [key, rects.map(([x, y, w, h]) => [r4(x / W), r4(y / H), r4(w / W), r4(h / H)])]);
    report.push({ page, n: res.n, min: +res.minScore.toFixed(3), margin: +res.margin.toFixed(3), problems: res.problems });
    if (verbose || res.problems.length || res.margin < 0.05) {
      console.log(`page ${page}: verses ${res.n}, min score ${res.minScore.toFixed(3)}, margin ${res.margin.toFixed(3)}${res.problems.length ? ` | ${res.problems.join('; ')}` : ''}`);
      if (verbose) console.log('  markers', res.markers.map((m) => `L${m.line}@${Math.round(m.x0)}(${m.score.toFixed(2)})`).join(' '));
    }
  }
  return { out, report };
}

async function main() {
  const args = process.argv.slice(2);
  const t0 = Date.now();
  if (args[0] === '--worker') { // child: analyse a slice of pages and hand the result back
    process.send(analyse(args.slice(1).map(Number), false));
    return;
  }
  const only = args.map(Number).filter(Boolean);
  if (only.length) {
    analyse(only, true);
    console.log(`analysed ${only.length} pages in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    return;
  }
  // All pages, spread over worker processes.
  const { fork } = require('child_process');
  const workers = Math.max(1, Math.min(8, require('os').cpus().length));
  const slices = Array.from({ length: workers }, (_, w) => Array.from({ length: 604 }, (_, i) => i + 1).filter((p) => p % workers === w));
  const results = await Promise.all(slices.map((slice) => new Promise((resolve, reject) => {
    const child = fork(__filename, ['--worker', ...slice.map(String)]);
    child.on('message', resolve);
    child.on('exit', (code) => { if (code) reject(new Error(`worker exited with ${code}`)); });
  })));
  const out = {};
  const report = [];
  for (const r of results) { Object.assign(out, r.out); report.push(...r.report); }
  report.sort((a, b) => a.page - b.page);
  const sorted = Object.fromEntries(Object.keys(out).map(Number).sort((a, b) => a - b).map((p) => [p, out[p]]));
  const bad = report.filter((r) => r.problems.length || r.margin < 0.05);
  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'ayahs.js'), `// Generated by tools/detect-ayahs.js — do not edit.\nwindow.AYAH_BOXES = ${JSON.stringify(sorted)};\n`);
  fs.writeFileSync(path.join(__dirname, 'data', 'ayah-detect-report.json'), JSON.stringify(report));
  const ayahs = Object.values(sorted).reduce((s, list) => s + list.length, 0);
  console.log(`analysed 604 pages (${workers} workers) in ${((Date.now() - t0) / 1000).toFixed(1)}s; ${ayahs} ayahs`);
  console.log(`wrote src/data/ayahs.js; pages needing review: ${bad.length}${bad.length ? ` (${bad.map((b) => b.page).join(', ')})` : ''}`);
}
main().catch((err) => { console.error(err); process.exit(1); });
