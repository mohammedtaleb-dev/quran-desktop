// Copies the 604 mushaf page JPEGs out of the source PDF, byte-for-byte (no re-encoding).
// PDF page index N (1..604) is mushaf page N; index 0 and 605 are the covers and are skipped.
// Usage: node tools/extract-pages.js <file.pdf> <outdir>
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const [pdfPath, outDir] = process.argv.slice(2);
if (!pdfPath || !outDir) {
  console.error('usage: node tools/extract-pages.js <file.pdf> <outdir>');
  process.exit(1);
}
const buf = fs.readFileSync(pdfPath);
const s = buf.toString('latin1');

// Index every object body, including objects packed inside compressed object streams.
const objs = {};
const streams = {};
const objRe = /(\d+) 0 obj\s*([\s\S]*?)endobj/g;
let m;
while ((m = objRe.exec(s))) {
  objs[m[1]] = m[2];
  const st = /^\s*<<([\s\S]*?)>>\s*stream\r?\n/.exec(m[2]);
  if (st) streams[m[1]] = { dict: st[1], start: m.index + m[0].indexOf(m[2]) + st[0].length };
}
for (const { dict, start } of Object.values(streams)) {
  if (!/\/Type\s*\/ObjStm/.test(dict)) continue;
  const len = +/\/Length\s+(\d+)/.exec(dict)[1];
  const n = +/\/N\s+(\d+)/.exec(dict)[1];
  const first = +/\/First\s+(\d+)/.exec(dict)[1];
  const data = zlib.inflateSync(buf.subarray(start, start + len)).toString('latin1');
  const head = data.slice(0, first).trim().split(/\s+/).map(Number);
  for (let i = 0; i < n; i++) {
    const end = i + 1 < n ? head[2 * i + 3] : data.length - first;
    objs[head[2 * i]] = data.slice(first + head[2 * i + 1], first + end);
  }
}

const ref = (body, key) => (new RegExp(`/${key}\\s+(\\d+)\\s+0\\s+R`).exec(body) || [])[1];
const deref = (body) => { const r = /^\s*(\d+)\s+0\s+R\s*$/.exec(body); return r ? objs[r[1]] : body; };

// Page objects in reading order.
const pages = [];
(function walk(num) {
  const body = objs[num];
  if (/\/Type\s*\/Pages/.test(body)) {
    /\/Kids\s*\[([^\]]*)\]/.exec(body)[1].match(/\d+\s+0\s+R/g).forEach((k) => walk(k.split(/\s+/)[0]));
  } else pages.push(num);
})(ref(objs[/\/Root\s+(\d+)\s+0\s+R/.exec(s)[1]], 'Pages'));

// The page's own JPEG: a direct image XObject (the shared border is a Form XObject and is ignored).
function pageJpeg(num) {
  const body = objs[num];
  const resRef = /\/Resources\s*(\d+\s+0\s+R)/.exec(body);
  const res = resRef ? deref(resRef[1]) : ((/\/Resources\s*(<<[\s\S]*>>)/.exec(body) || [])[1] || '');
  const xoRef = /\/XObject\s*(\d+\s+0\s+R)/.exec(res);
  const xo = xoRef ? deref(xoRef[1]) : ((/\/XObject\s*<<([\s\S]*?)>>/.exec(res) || [])[1] || '');
  const images = [...xo.matchAll(/\/\w+\s+(\d+)\s+0\s+R/g)]
    .map((x) => x[1])
    .filter((n) => streams[n] && /\/Subtype\s*\/Image/.test(streams[n].dict) && /\/DCTDecode/.test(streams[n].dict));
  if (images.length !== 1) throw new Error(`page object ${num}: expected 1 JPEG, found ${images.length}`);
  const { dict, start } = streams[images[0]];
  return buf.subarray(start, start + +/\/Length\s+(\d+)/.exec(dict)[1]);
}

if (pages.length !== 606) throw new Error(`expected 606 PDF pages, found ${pages.length}`);
fs.mkdirSync(outDir, { recursive: true });
let bytes = 0;
for (let p = 1; p <= 604; p++) {
  const jpg = pageJpeg(pages[p]);
  if (jpg[0] !== 0xff || jpg[1] !== 0xd8 || jpg[jpg.length - 2] !== 0xff || jpg[jpg.length - 1] !== 0xd9) {
    throw new Error(`page ${p}: not a complete JPEG`);
  }
  fs.writeFileSync(path.join(outDir, `${String(p).padStart(3, '0')}.jpg`), jpg);
  bytes += jpg.length;
}
console.log(`wrote 604 pages to ${outDir} (${(bytes / 1e6).toFixed(1)} MB)`);
