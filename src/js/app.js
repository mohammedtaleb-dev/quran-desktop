// القرآن الكريم — desktop reader for the Shami (Uthman Taha) mushaf page images.
const META = window.META;
const LAST = 604;
const $ = (id) => document.getElementById(id);
const pad3 = (n) => String(n).padStart(3, '0');
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

const UNITS = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع'];
const juzWord = (j) => (j < 10 ? UNITS[j] : j === 10 ? 'العاشر' : j === 11 ? 'الحادي عشر' : j < 20 ? `${UNITS[j - 10]} عشر`
  : j === 20 ? 'العشرون' : j === 21 ? 'الحادي والعشرون' : j < 30 ? `${UNITS[j - 20]} والعشرون` : 'الثلاثون');
const juzName = (j) => `الجزء ${juzWord(j)}`;
const UNITS_V = ['', 'الأَوَّلُ', 'الثَّانِي', 'الثَّالِثُ', 'الرَّابِعُ', 'الخَامِسُ', 'السَّادِسُ', 'السَّابِعُ', 'الثَّامِنُ', 'التَّاسِعُ'];
const juzTitle = (j) => `الجُزْءُ ${j < 10 ? UNITS_V[j] : j === 10 ? 'العَاشِرُ' : j === 11 ? 'الحَادِي عَشَرَ' : j < 20 ? `${UNITS_V[j - 10]} عَشَرَ`
  : j === 20 ? 'العِشْرُونَ' : j === 21 ? 'الحَادِي وَالعِشْرُونَ' : j < 30 ? `${UNITS_V[j - 20]} وَالعِشْرُونَ` : 'الثَّلَاثُونَ'}`;

const suraAt = (page) => { let s = 0; META.suras.forEach((x, i) => { if (x.page <= page) s = i; }); return s; };
const juzAt = (page) => META.juz.filter((p) => p <= page).length;
const quarterAt = (page) => META.quarters.filter((p) => p <= page).length; // 1..240

const ICONS = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
  mark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  markGo: '<path d="M6 3h12v18l-6-4.5L6 21z" fill="currentColor"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  pie: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/><path d="M12 12 5.6 18.4"/>',
  pages: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 12h8M9 16h8"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  book: '<path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2z"/><path d="M12 6v14"/>',
  dots: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  back: '<path d="M9 5l7 7-7 7"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  compress: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  zoomIn: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/>',
  zoomOut: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h6"/>',
  scroll: '<path d="M7 3h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 6v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h10v1a3 3 0 0 0 3 3"/><path d="M7 3a2 2 0 0 0-2 2v12M9 8h4M9 12h4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 20h14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.9"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
};
const icon = (name) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
const KAABA = '<svg viewBox="0 0 40 40"><polygon points="5,12 21,7.5 35,11.5 19,16.5" fill="#444"/><polygon points="5,12 19,16.5 19,36 5,31" fill="#0d0d0d"/><polygon points="19,16.5 35,11.5 35,31 19,36" fill="#222"/><polygon points="5,15 19,19.5 19,22 5,17.5" fill="#dcb44c"/><polygon points="19,19.5 35,14.5 35,17 19,22" fill="#dcb44c"/><polygon points="25,23.5 29,22.3 29,32.2 25,33.4" fill="#c9a23c"/></svg>';
const DOME = '<svg viewBox="0 0 40 40"><rect x="8" y="26" width="24" height="10" fill="#ece6d3" stroke="#b9b096"/><rect x="10.5" y="23" width="19" height="4" fill="#d9d2bc" stroke="#b9b096" stroke-width=".6"/><path d="M11 23.2Q10.6 9.5 20 7q9.4 2.5 9 16.2z" fill="#2f9d4e" stroke="#1c7436"/><path d="M14.2 21.5q0-9 5.8-12" stroke="#86d8a0" fill="none" stroke-width="1.3"/><path d="M20 7V2.6" stroke="#c9a23c" stroke-width="1.3"/><circle cx="20" cy="2.4" r="1.4" fill="#c9a23c"/><rect x="12" y="29" width="3" height="5" fill="#b9b096"/><rect x="18.5" y="29" width="3" height="5" fill="#b9b096"/><rect x="25" y="29" width="3" height="5" fill="#b9b096"/></svg>';

// ---------- persisted state ----------
const KEY = 'quran.state.v1';
const state = { page: 1, mode: 'spread', night: false, bright: 100, mark: null, awake: true, fill: false };
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* first run or storage unavailable */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };

// ---------- page images ----------
let pageUrl = (n) => `pages/${pad3(n)}.jpg`;
async function initSource() {
  const T = window.__TAURI__;
  if (!T) return;
  const dir = await T.path.resolveResource('pages');
  const sep = dir.includes('\\') ? '\\' : '/';
  pageUrl = (n) => T.core.convertFileSrc(`${dir}${sep}${pad3(n)}.jpg`);
}

// ---------- page loader ----------
// Each page image is fetched once and kept in memory as a blob URL (the last PAGE_CACHE_MAX pages).
// Fetches go through a small queue: the pages on screen first, then the pages ahead in the reading direction.
// When the reader moves on, queued pages that are no longer near are dropped, so quick clicks never pile up.
const PAGE_CACHE_MAX = 40;
const MAX_FETCHES = 2;
const pageCache = new Map(); // page -> { url, done, promise, resolve }, oldest first
const fetchQueue = [];
let fetching = 0;

function loadPage(p) {
  let e = pageCache.get(p);
  if (e) { pageCache.delete(p); pageCache.set(p, e); return e.promise; } // mark as recently used
  e = { url: null, done: false };
  e.promise = new Promise((resolve) => { e.resolve = resolve; });
  pageCache.set(p, e);
  fetchQueue.push(p);
  pumpFetches();
  return e.promise;
}
function pumpFetches() {
  while (fetching < MAX_FETCHES && fetchQueue.length) {
    const p = fetchQueue.shift();
    const e = pageCache.get(p);
    if (!e) continue;
    fetching++;
    fetch(pageUrl(p))
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then((blob) => { e.url = URL.createObjectURL(blob); })
      .catch(() => { e.url = pageUrl(p); }) // fall back to loading the file directly
      .finally(() => { e.done = true; e.resolve(e.url); fetching--; trimPageCache(); pumpFetches(); });
  }
}
// wanted: pages to show now; ahead: pages to have ready next. Everything else still queued is dropped.
function planPages(wanted, ahead) {
  const order = [...wanted, ...ahead];
  const keep = new Set(order);
  for (let i = fetchQueue.length - 1; i >= 0; i--) {
    const p = fetchQueue[i];
    if (keep.has(p)) continue;
    fetchQueue.splice(i, 1);
    const e = pageCache.get(p);
    pageCache.delete(p);
    e?.resolve(null);
  }
  order.forEach(loadPage);
  const rank = new Map(order.map((p, i) => [p, i]));
  fetchQueue.sort((a, b) => rank.get(a) - rank.get(b));
}
function trimPageCache() {
  for (const [p, e] of pageCache) {
    if (pageCache.size <= PAGE_CACHE_MAX) break;
    if (!e.done || document.querySelector(`.page[data-page="${p}"]`)) continue; // keep pages on screen
    if (e.url?.startsWith('blob:')) URL.revokeObjectURL(e.url);
    pageCache.delete(p);
  }
}
let readingDir = 1;
function pagesAhead(pages) {
  const step = pages.length;
  const first = pages[0];
  const last = pages[pages.length - 1];
  const fwd = Array.from({ length: 2 * step }, (_, i) => last + 1 + i);
  const back = Array.from({ length: step }, (_, i) => first - 1 - i);
  const list = readingDir >= 0 ? [...fwd, ...back] : [...back, ...Array.from({ length: step }, (_, i) => first - step - 1 - i), ...fwd.slice(0, step)];
  return list.filter((p) => p >= 1 && p <= LAST);
}

const shownPages = () => {
  if (state.mode === 'single') return [state.page];
  const right = state.page % 2 ? state.page : state.page - 1;
  return [right, right + 1].filter((p) => p <= LAST);
};

function quarterText(q) {
  const hizb = Math.ceil(q / 4);
  const k = (q - 1) % 4;
  if (k === 0) return hizb % 2 ? `الجزء ${(hizb + 1) / 2}\nالحزب ${hizb}` : `الحزب ${hizb}`;
  return `${['', '¼', '½', '¾'][k]} الحزب ${hizb}`;
}

let toastTimer;
function toast(text, host = document.body) {
  document.querySelectorAll('.page .toast').forEach((t) => t.remove());
  const t = host === document.body ? $('toast') : host.appendChild(Object.assign(document.createElement('div'), { className: 'toast' }));
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { if (t === $('toast')) t.hidden = true; else t.remove(); }, 2200);
}

// One "leaf" = the page(s) on screen. Turning builds a new leaf and animates it over the old one.
function buildLeaf(pages, urls) {
  const leaf = document.createElement('div');
  leaf.className = 'leaf';
  leaf.append(...pages.map((p, i) => {
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.page = p;
    const img = new Image();
    img.decoding = 'async';
    img.draggable = false;
    img.alt = `صفحة ${p}`;
    img.src = urls[i] || pageUrl(p);
    page.append(img);
    return page;
  }));
  if (pages.includes(state.mark)) {
    leaf.firstElementChild.append(Object.assign(document.createElement('i'), { className: 'ribbon', title: `العلامة: صفحة ${state.mark}` }));
  }
  return leaf;
}
const currentLeaf = () => $('pages').lastElementChild;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let renderSeq = 0;
// dir: 1 = next page (the book moves right, as in an Arabic mushaf), -1 = previous; jump: fade (index, search…)
async function render({ announce = true, dir = 0, jump = false, atEnd = false } = {}) {
  const seq = ++renderSeq;
  clearSelection();
  const pages = shownPages();
  const box = $('pages');
  const last = pages[pages.length - 1];
  $('bar-sura').textContent = `سورة ${META.suras[suraAt(last)].name}`;
  $('bar-page').innerHTML = pages.map((p) => `<bdi>${p}</bdi>`).join(' - ');
  $('bar-juz').textContent = juzName(juzAt(last));
  for (const b of [$('mark-btn'), $('list-mark')]) {
    b.disabled = !state.mark;
    b.title = state.mark ? `انتقال إلى العلامة (صفحة ${state.mark})` : 'لا توجد علامة محفوظة بعد';
  }

  // The bar above already shows the new place; the pages follow as soon as they are in memory.
  if (dir) readingDir = dir;
  planPages(pages, pagesAhead(pages));
  const urls = await Promise.all(pages.map(loadPage));
  if (seq !== renderSeq) return; // a newer turn replaced this one
  const leaf = buildLeaf(pages, urls);

  // Quick repeated clicks skip the motion: while the previous turn is still moving, the new pages appear at once.
  const moving = box.lastElementChild?.getAnimations().some((a) => a.playState === 'running');
  const animate = box.childElementCount > 0 && (dir || jump) && !moving && !reducedMotion.matches;
  if (animate) {
    // A short moment to decode the images (they are already in memory) so the motion never shows a blank page.
    const decoded = Promise.all([...leaf.querySelectorAll('img')].map((img) => img.decode().catch(() => {})));
    await Promise.race([decoded, new Promise((r) => setTimeout(r, 150))]);
    if (seq !== renderSeq) return;
  }
  const old = [...box.children];
  old.slice(0, -1).forEach((l) => l.remove());
  const prev = old[old.length - 1];
  box.append(leaf);
  if (prev && animate) {
    const timing = { duration: dir ? 240 : 200, easing: 'cubic-bezier(.2, .7, .2, 1)' };
    const shift = (pct) => `translateX(${pct}%) scale(${pct ? 0.985 : 1})`;
    prev.style.pointerEvents = 'none';
    prev.animate(dir ? [{ transform: shift(0), opacity: 1 }, { transform: shift(7 * dir), opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }], timing)
      .finished.finally(() => prev.remove());
    leaf.animate(dir ? [{ transform: shift(-7 * dir), opacity: 0 }, { transform: shift(0), opacity: 1 }] : [{ opacity: 0 }, { opacity: 1 }], timing);
  } else prev?.remove();
  if (state.fill) box.scrollTop = atEnd ? box.scrollHeight : 0;

  if (announce) {
    for (const p of pages) {
      const q = META.quarters.indexOf(p) + 1;
      if (q) { toast(quarterText(q), leaf.querySelector(`[data-page="${p}"]`)); break; }
    }
  }
  if (panelKind === 'tafsir' && window.MUYASSAR) renderTafsir();
  return leaf;
}

function go(page, opts) {
  state.page = Math.min(LAST, Math.max(1, page));
  save();
  return render(opts);
}
const turn = (dir, { atEnd = false } = {}) => {
  const pages = shownPages();
  if ((dir < 0 && pages[0] === 1) || (dir > 0 && pages[pages.length - 1] === LAST)) return;
  go(dir > 0 ? pages[pages.length - 1] + 1 : pages[0] - (state.mode === 'single' ? 1 : 2), { dir, atEnd });
};

// ---------- settings ----------
function applySettings() {
  document.body.classList.toggle('single', state.mode === 'single');
  document.body.classList.toggle('spread', state.mode !== 'single');
  document.body.classList.toggle('night', !!state.night);
  document.documentElement.style.setProperty('--bright', state.bright / 100);
  $('mode-btn').lastChild.textContent = state.mode === 'single' ? 'صفحتان' : 'صفحة واحدة';
  document.body.classList.toggle('fill', !!state.fill);
  $('zoom-btn').innerHTML = icon(state.fill ? 'zoomOut' : 'zoomIn');
  $('zoom-btn').title = state.fill ? 'إلغاء التكبير' : 'تكبير للقراءة: الصفحة بعرض الشاشة';
  $('zoom-btn').classList.toggle('on', !!state.fill);
  $('zoom-tile').classList.toggle('on', !!state.fill);
  document.body.classList.toggle('lite', weakDevice);
}

// On very weak PCs (2 GB or less, or two cores) the glass is drawn without live blur, automatically.
// 4 GB machines keep the full glass, which the GPU handles well. (deviceMemory rounds down: 6 GB reports 4.)
const weakDevice = (navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 4) <= 2;

// The window always opens maximized; F11 / the top-bar button switch to full screen and back for this session
// (full screen is not remembered, so the app never starts without its window frame).
const tauriWindow = () => window.__TAURI__?.window?.getCurrentWindow();
let fullscreen = false;
async function setFullscreen(on) {
  try {
    const win = tauriWindow();
    if (win) await win.setFullscreen(on);
    else if (on) await document.documentElement.requestFullscreen();
    else if (document.fullscreenElement) await document.exitFullscreen();
  } catch (err) { console.error('fullscreen', err); return; }
  fullscreen = on;
  $('fs-tile').classList.toggle('on', on);
  const btn = $('fs-btn');
  btn.innerHTML = icon(on ? 'compress' : 'expand');
  btn.title = on ? 'الخروج من ملء الشاشة (F11 أو Esc)' : 'ملء الشاشة (F11)';
}
document.addEventListener('fullscreenchange', () => { if (!tauriWindow() && !document.fullscreenElement && fullscreen) setFullscreen(false); });

// ---------- showing and hiding overlays with motion ----------
const SPRING = 'cubic-bezier(.2, 1.2, .4, 1)';
const animOK = () => !reducedMotion.matches;
function show(el) {
  el.getAnimations().forEach((a) => a.cancel());
  delete el.dataset.closing;
  el.style.pointerEvents = '';
  el.hidden = false;
}
// Plays the element's exit motion, then hides it (a re-open during the motion wins).
// While it fades out it no longer takes clicks, so the page underneath responds at once.
async function hide(el) {
  if (el.hidden || el.dataset.closing) return;
  el.dataset.closing = '1';
  el.style.pointerEvents = 'none';
  if (animOK()) {
    const card = el.matches('.dialog') ? el.firstElementChild : el.matches('.list-view') ? el.querySelector('.list-scroll, .doc-frame') : null;
    const parts = [el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' })];
    if (card) {
      const to = el.matches('.dialog') ? 'scale(.94) translateY(8px)' : 'translateY(36px)';
      parts.push(card.animate([{ transform: 'none' }, { transform: to }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
    }
    if (el.id === 'panel') parts.push(el.animate([{ transform: 'none' }, { transform: 'translateX(-30px)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }));
    await Promise.all(parts.map((a) => a.finished.catch(() => {})));
  }
  if (!el.dataset.closing) return;
  el.hidden = true;
  el.style.pointerEvents = '';
  delete el.dataset.closing;
  if (el.id === 'doc-view') { // let the PDF viewer go, so it uses no memory while closed
    const frame = $('doc-frame');
    frame.src = 'about:blank';
    delete frame.dataset.src;
  }
  el.getAnimations().forEach((a) => a.cancel());
  el.querySelectorAll('.list-scroll, .doc-frame').forEach((c) => c.getAnimations().forEach((a) => a.cancel()));
  if (el.matches('.dialog')) el.firstElementChild.getAnimations().forEach((a) => a.cancel());
}
// Entrance for full-screen views (index, juz, tajweed): the backdrop fades, the header drops in, the card rises.
function enterView(view) {
  const wasHidden = view.hidden || view.dataset.closing;
  show(view);
  if (!wasHidden || !animOK()) return;
  view.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
  view.querySelector('.list-head').animate([{ opacity: 0, transform: 'translateY(-14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: SPRING });
  view.querySelector('.list-scroll, .doc-frame').animate([{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }], { duration: 460, easing: SPRING });
}
function placeTabPill(animate = true) {
  const tabs = document.querySelector('#list-view .tabs');
  const on = tabs.querySelector('button.on');
  const pill = tabs.querySelector('.tab-pill');
  if (!on) return;
  if (!animate) pill.style.transition = 'none';
  pill.style.left = `${on.offsetLeft}px`;
  pill.style.width = `${on.offsetWidth}px`;
  if (!animate) { pill.getBoundingClientRect(); pill.style.transition = ''; }
}

// ---------- indexes ----------
let listKind = null;
function openList(kind) {
  const list = $('list');
  const view = $('list-view');
  const open = !view.hidden && !view.dataset.closing;
  if (open && listKind === kind) return;
  const switching = open && listKind && listKind !== kind;
  closeAll({ except: 'list-view' });
  listKind = kind;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.act === kind));
  const markSura = state.mark ? suraAt(state.mark) : -1;
  const curSura = suraAt(state.page);
  if (kind === 'index') {
    list.innerHTML = META.suras.map((s, i) => `
      <div class="srow${i === curSura ? ' cur' : ''}" data-page="${s.page}">
        <div class="blk">${i + 1}</div><div class="name">${pad3(i + 1)}</div>
        <div class="mark">${i === markSura ? '<i title="العلامة"></i>' : ''}</div>
        <div class="meta"><small>آياتها</small>${s.ayas}</div>
        <div class="icon" title="${s.medinan ? 'مدنية' : 'مكية'}">${s.medinan ? DOME : KAABA}</div>
        <div class="blk">${s.page}</div>
      </div>`).join('');
  } else {
    const cur = quarterAt(state.page);
    const cell = (q, label) => `<button data-page="${META.quarters[q - 1]}" class="${q === cur ? 'cur' : ''}" title="صفحة ${META.quarters[q - 1]}"><small>${label}</small><span>الحِزْب</span></button>`;
    list.innerHTML = Array.from({ length: 30 }, (_, i) => {
      const j = i + 1;
      const rows = [2 * j - 1, 2 * j].map((h) => {
        const q = (h - 1) * 4 + 1;
        return `<div class="jrow">
          <div class="blk">${h % 2 ? j : ''}</div>
          <button class="hz${q === cur ? ' cur' : ''}" data-page="${META.quarters[q - 1]}" title="صفحة ${META.quarters[q - 1]}">الحِزْبُ <b>${AR(h)}</b></button>
          ${cell(q + 1, 'ربع')}${cell(q + 2, 'نصف')}${cell(q + 3, 'ثلاثة أرباع')}
          <div class="blk">${h % 2 ? META.juz[i] : ''}</div></div>`;
      }).join('');
      // the juz title opens the start of that juz
      return `<div class="jz" data-juz="${j}"><div class="jhead"><div class="blk"></div><button class="title" data-page="${META.juz[i]}" title="الانتقال إلى ${juzName(j)} (صفحة ${META.juz[i]})">${juzTitle(j)}</button><div class="blk"></div></div>${rows}</div>`;
    }).join('');
  }
  enterView(view);
  placeTabPill(open);
  const target = kind === 'index' ? list.querySelector('.srow.cur') : list.querySelector(`[data-juz="${juzAt(state.page)}"]`);
  target?.scrollIntoView({ block: kind === 'index' ? 'center' : 'start' });
  // Switching tabs: the new list slides in from the side of its tab (the index tab is on the right, juz on the left).
  if (switching && animOK()) {
    const from = kind === 'juz' ? -48 : 48;
    list.animate([{ opacity: 0, transform: `translateX(${from}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, easing: SPRING });
  }
}

// ---------- text data: verse text (search, tafsir, share) and Tafsir Al-Muyassar, loaded on first use ----------
const scripts = {};
const loadScript = (src) => (scripts[src] ??= new Promise((ok, fail) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = ok;
  s.onerror = () => { delete scripts[src]; fail(new Error(src)); };
  document.head.append(s);
}));
const loadText = () => loadScript('data/text.js');
const versesOn = (pages) => window.QURAN_TEXT.filter((v) => pages.includes(v[2])); // [sura, aya, page, text]

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/;
const FOLD = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ئ': 'ي', 'ؤ': 'و', 'ة': 'ه' };
// Letters-only form for matching, with each kept letter's index in the original text (for highlighting).
function fold(text) {
  let out = '';
  const map = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (MARKS.test(c)) continue;
    if (/\s/.test(c)) { if (out && !out.endsWith(' ')) { out += ' '; map.push(i); } continue; }
    out += FOLD[c] || c;
    map.push(i);
  }
  return { out, map };
}
let searchIndex;

const el = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text != null ? { textContent: text } : {});

// ---------- side panel ----------
let panelKind = null;
function openPanel(kind, title) {
  closeAll({ except: 'panel' });
  panelKind = kind;
  document.body.classList.add('panel-open');
  show($('panel'));
  $('panel-title').textContent = title;
  $('search-form').hidden = kind !== 'search';
  $('panel-note').textContent = '';
  $('panel-body').replaceChildren();
}

function runSearch(query) {
  const body = $('panel-body');
  const note = $('panel-note');
  const needle = fold(query).out.trim();
  if (needle.length < 2) { body.replaceChildren(); note.textContent = query.trim() ? 'اكتب حرفين على الأقل' : ''; return; }
  searchIndex ??= window.QURAN_TEXT.map((v) => ({ v, ...fold(v[3]) }));
  const hits = [];
  for (const e of searchIndex) { const at = e.out.indexOf(needle); if (at >= 0) hits.push([e, at]); }
  note.textContent = hits.length ? `عدد النتائج: ${hits.length}${hits.length > 300 ? ' — تظهر أول 300' : ''}` : 'لا توجد نتائج';
  body.replaceChildren(...hits.slice(0, 300).map(([e, at]) => {
    const [sura, aya, page, text] = e.v;
    const start = e.map[at];
    let end = e.map[at + needle.length - 1] + 1;
    while (end < text.length && MARKS.test(text[end])) end++;
    const hit = el('button', 'hit');
    hit.dataset.page = page;
    hit.dataset.ayah = `${sura}:${aya}`;
    const ayah = el('div', 'ayah');
    ayah.append(text.slice(0, start), el('mark', '', text.slice(start, end)), text.slice(end));
    hit.append(el('span', 'ref', `سورة ${META.suras[sura - 1].name} • الآية ${aya} • صفحة ${page}`), ayah);
    return hit;
  }));
  body.scrollTop = 0;
}

function renderTafsir() {
  const pages = shownPages();
  $('panel-title').textContent = `التفسير الميسر — ${pages.length > 1 ? 'الصفحتان' : 'صفحة'} ${pages.join(' و ')}`;
  // Al-Muyassar explains some verses together; show each explanation once under its verses.
  const groups = [];
  for (const [sura, aya, , text] of versesOn(pages)) {
    const tafsir = window.MUYASSAR[`${sura}:${aya}`];
    const g = groups[groups.length - 1];
    if (g && g.sura === sura && g.tafsir === tafsir) g.verses.push([aya, text]);
    else groups.push({ sura, tafsir, verses: [[aya, text]] });
  }
  $('panel-note').textContent = '';
  $('panel-body').replaceChildren(...groups.map((g) => {
    const first = g.verses[0][0];
    const lastAya = g.verses[g.verses.length - 1][0];
    const item = el('div', 'tafsir-item');
    item.dataset.ayahs = ` ${g.verses.map(([aya]) => `${g.sura}:${aya}`).join(' ')} `;
    const ayah = el('div', 'ayah');
    g.verses.forEach(([aya, text]) => ayah.append(`${text} `, el('span', 'num', `﴿${AR(aya)}﴾ `)));
    item.append(el('span', 'ref', `سورة ${META.suras[g.sura - 1].name} • ${first === lastAya ? `الآية ${first}` : `الآيات ${first}–${lastAya}`}`), ayah, el('p', '', g.tafsir));
    return item;
  }));
  $('panel-body').scrollTop = 0;
}

async function showTafsir(focusKey) {
  openPanel('tafsir', 'التفسير الميسر');
  $('panel-note').textContent = 'جارٍ التحميل…';
  try {
    await Promise.all([loadText(), loadScript('data/muyassar.js')]);
    if (panelKind !== 'tafsir') return;
    renderTafsir();
    const item = focusKey && [...$('panel-body').children].find((it) => it.dataset.ayahs.includes(` ${focusKey} `));
    if (item) {
      item.scrollIntoView({ block: 'start' });
      item.classList.add('focus');
      setTimeout(() => item.classList.remove('focus'), 2500);
    }
  } catch { $('panel-note').textContent = 'تعذر تحميل التفسير'; }
}

// ---------- ayah positions on the page images (tools/detect-ayahs.js) ----------
const loadBoxes = () => loadScript('data/ayahs.js');
const verseText = (key) => window.QURAN_TEXT?.find(([s, a]) => `${s}:${a}` === key);

function highlightLayer(pageEl, key, cls) {
  const entry = window.AYAH_BOXES?.[pageEl.dataset.page]?.find(([k]) => k === key);
  if (!entry) return null;
  const layer = el('div', `ayah-hl ${cls}`);
  for (const [x, y, w, h] of entry[1]) {
    const r = el('i');
    r.style.cssText = `left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%`;
    layer.append(r);
  }
  pageEl.append(layer);
  return layer;
}

// Shows a search result: the ayah glows on its page for a few seconds, then fades away.
async function flashAyah(leaf, key) {
  if (!leaf || !key) return;
  try { await loadBoxes(); } catch { return; }
  for (const pageEl of leaf.querySelectorAll('.page')) {
    const layer = highlightLayer(pageEl, key, 'flash');
    layer?.addEventListener('animationend', () => layer.remove());
  }
}

// Right-click (or double-click) an ayah on the page to select it and copy it or read its tafsir.
let selected = null; // { key, layer }
function clearSelection() {
  selected?.layer.remove();
  selected = null;
  $('ayah-menu').hidden = true;
}
function ayahAt(pageEl, clientX, clientY) {
  const r = pageEl.getBoundingClientRect();
  const fx = (clientX - r.left) / r.width;
  const fy = (clientY - r.top) / r.height;
  const entry = window.AYAH_BOXES?.[pageEl.dataset.page]?.find(([, rects]) => rects.some(([x, y, w, h]) => fx >= x && fx <= x + w && fy >= y && fy <= y + h));
  return entry?.[0];
}
async function selectAyahAt(e) {
  const pageEl = e.target.closest('.page');
  if (!pageEl) return;
  e.preventDefault();
  clearTimeout(barsTimer); // selecting an ayah never shows or hides the bars
  try { await Promise.all([loadBoxes(), loadText()]); } catch { return; }
  clearSelection();
  const key = ayahAt(pageEl, e.clientX, e.clientY);
  if (!key) return;
  selected = { key, layer: highlightLayer(pageEl, key, 'sel') };
  const [sura, aya] = key.split(':').map(Number);
  $('ayah-menu-ref').textContent = `سورة ${META.suras[sura - 1].name} • الآية ${aya}`;
  const menu = $('ayah-menu');
  menu.hidden = false;
  // Keep the menu fully visible: above the bottom menu bar when it is shown, and above the pointer near the bottom.
  const { width, height } = menu.getBoundingClientRect();
  const bottom = document.body.classList.contains('bars-hidden') ? innerHeight - 8 : $('menu').getBoundingClientRect().top - 8;
  const top = e.clientY + height > bottom ? e.clientY - height - 6 : e.clientY;
  menu.style.left = `${Math.max(8, Math.min(e.clientX, innerWidth - width - 8))}px`;
  menu.style.top = `${Math.max(8, top)}px`;
}
async function copyAyah() {
  if (!selected) return;
  const v = verseText(selected.key);
  if (!v) return;
  const [sura, aya, , text] = v;
  const ok = await copyText(`${text} ﴿${AR(aya)}﴾\n[سورة ${META.suras[sura - 1].name}: ${aya}]`);
  toast(ok ? `تم نسخ الآية ${aya} من سورة ${META.suras[sura - 1].name}` : 'تعذر النسخ');
  clearSelection();
}

async function copyText(text) {
  // In the app the system clipboard is written from Rust, so it never depends on browser permissions.
  const T = window.__TAURI__;
  if (T) {
    try { await T.core.invoke('plugin:clipboard-manager|write_text', { text }); return true; } catch (err) { console.error('clipboard', err); }
  }
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = el('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

async function sharePage() {
  await loadText();
  const pages = shownPages();
  const bySura = [];
  for (const [sura, aya, , text] of versesOn(pages)) {
    const g = bySura[bySura.length - 1];
    if (g && g.sura === sura) g.verses.push([aya, text]); else bySura.push({ sura, verses: [[aya, text]] });
  }
  const body = bySura.map((g) => {
    const a = g.verses[0][0];
    const b = g.verses[g.verses.length - 1][0];
    return `سورة ${META.suras[g.sura - 1].name} (${a === b ? a : `${a}–${b}`})\n${g.verses.map(([aya, t]) => `${t} ﴿${AR(aya)}﴾`).join(' ')}`;
  }).join('\n\n');
  const ok = await copyText(`${body}\n\n— القرآن الكريم، ${pages.length > 1 ? 'الصفحتان' : 'صفحة'} ${pages.join(' و ')}`);
  toast(ok ? 'تم نسخ آيات الصفحة\nيمكنك لصقها في أي مكان' : 'تعذر النسخ');
}

// ---------- tajweed summary (bundled PDF) ----------
const TAJWEED_PREVIEW = 'docs/tajweed.pdf'; // browser preview only
async function openTajweed() {
  closeAll({ except: 'doc-view' });
  const T = window.__TAURI__;
  let path = null;
  try {
    if (T) path = await T.core.invoke('tajweed_pdf_path');
    else path = (await fetch(TAJWEED_PREVIEW, { method: 'HEAD' })).ok ? TAJWEED_PREVIEW : null;
  } catch (err) { console.error('tajweed', err); }
  const frame = $('doc-frame');
  frame.hidden = !path;
  $('doc-missing').hidden = !!path;
  $('doc-save').disabled = !path;
  const src = path ? (T ? T.core.convertFileSrc(path) : path) : '';
  if (path && frame.dataset.src !== src) { frame.src = `${src}#view=FitH`; frame.dataset.src = src; }
  enterView($('doc-view'));
}
async function saveTajweed() {
  const T = window.__TAURI__;
  if (!T) { const a = el('a'); a.href = TAJWEED_PREVIEW; a.download = 'ملخص أحكام التجويد.pdf'; a.click(); return; }
  try {
    if (await T.core.invoke('save_tajweed_pdf')) toast('تم حفظ نسخة من ملخص التجويد');
  } catch (err) { console.error(err); toast('تعذر حفظ الملف'); }
}

// Keeps the display awake while the app is open (Windows; handled by the Rust side).
const applyAwake = () => window.__TAURI__?.core.invoke('keep_screen_on', { on: !!state.awake }).catch((e) => console.error(e));

// ---------- actions ----------
const DIALOGS = ['list-view', 'doc-view', 'goto', 'light', 'more', 'about', 'welcome'];
function closeAll({ except } = {}) {
  DIALOGS.forEach((id) => { if (id !== except) hide($(id)); });
  if (except !== 'list-view') listKind = null;
  if (except !== 'panel') {
    hide($('panel'));
    panelKind = null;
    document.body.classList.remove('panel-open');
  }
}
const openDialog = (id) => { closeAll({ except: id }); show($(id)); };
const overlayOpen = () => DIALOGS.some((id) => !$(id).hidden && !$(id).dataset.closing);

const actions = {
  next: () => turn(1),
  prev: () => turn(-1),
  index: () => openList('index'),
  juz: () => openList('juz'),
  close: closeAll,
  'save-mark': () => { state.mark = state.mode === 'single' ? state.page : shownPages()[0]; save(); render({ announce: false }); toast(`تم حفظ العلامة\nصفحة ${state.mark}`); },
  'go-mark': () => {
    if (!state.mark) { toast('لا توجد علامة محفوظة'); return; }
    closeAll();
    go(state.mark, { jump: true });
  },
  fullscreen: () => { if (!$('more').hidden) closeAll(); setFullscreen(!fullscreen); },
  zoom: () => {
    if (!$('more').hidden) closeAll();
    state.fill = !state.fill;
    save();
    applySettings();
    render({ announce: false, jump: true });
    toast(state.fill ? 'تكبير للقراءة\nمرّر بعجلة الفأرة، وقلّب بالأسهم' : 'العرض العادي');
  },
  tajweed: () => openTajweed(),
  'save-tajweed': () => saveTajweed(),
  goto: () => {
    openDialog('goto');
    const input = $('goto-input');
    input.value = gotoValue = String(state.page);
    gotoHint(false);
    input.select();
    input.focus();
  },
  light: () => { $('night-input').checked = !!state.night; $('bright-input').value = state.bright; paintRange($('bright-input')); openDialog('light'); },
  mode: () => { state.mode = state.mode === 'single' ? 'spread' : 'single'; save(); applySettings(); render({ announce: false, jump: true }); },
  search: () => {
    openPanel('search', 'البحث في القرآن');
    const input = $('search-input');
    input.focus();
    input.select();
    loadText().then(() => { if (panelKind === 'search' && input.value) runSearch(input.value); })
      .catch(() => { $('panel-note').textContent = 'تعذر تحميل نص القرآن'; });
  },
  tafsir: () => showTafsir(),
  'copy-ayah': copyAyah,
  'tafsir-ayah': () => { const key = selected?.key; clearSelection(); showTafsir(key); },
  share: () => sharePage().catch(() => toast('تعذر النسخ')),
  more: () => { $('awake-input').checked = !!state.awake; openDialog('more'); },
  about: () => openDialog('about'),
  help: () => openDialog('welcome'),
};

// Page arrows turn the page the moment the mouse button goes down, so a press is never lost even if the
// pointer drifts before release. Keyboard activation (Enter on a focused arrow) still works through click.
for (const arrow of document.querySelectorAll('.turn')) {
  arrow.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    arrow.classList.add('pressed');
    turn(+arrow.dataset.turn);
  });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) arrow.addEventListener(type, () => arrow.classList.remove('pressed'));
}

document.addEventListener('click', (e) => {
  const arrow = e.target.closest('.turn');
  if (arrow) { if (e.detail === 0) turn(+arrow.dataset.turn); return; } // mouse presses were handled on pointerdown
  const btn = e.target.closest('[data-act]');
  if (selected && !e.target.closest('#ayah-menu')) {
    clearSelection();
    if (!btn) return; // a click on the page only dismisses the selection
  }
  if (btn) { actions[btn.dataset.act]?.(); return; }
  const hit = e.target.closest('.hit');
  if (hit) {
    closeAll();
    go(+hit.dataset.page, { jump: true }).then((leaf) => flashAyah(leaf, hit.dataset.ayah));
    return;
  }
  const row = e.target.closest('#list [data-page]');
  if (row) { closeAll(); go(+row.dataset.page, { jump: true }); return; }
  if (e.target.classList.contains('dialog')) { closeAll(); return; }
  // A single click on the page shows/hides the bars. It waits a moment, so a double-click (selecting an
  // ayah) never toggles them — otherwise the bottom menu would pop up over the ayah being selected.
  if (e.target.closest('#reader')) {
    clearTimeout(barsTimer);
    if (e.detail > 1) return;
    barsTimer = setTimeout(() => document.body.classList.toggle('bars-hidden'), 280);
  }
});
let barsTimer = 0;

// Go-to-page accepts only a whole page number 1..604 (Arabic-Indic digits are accepted and converted).
let gotoValue = '';
const gotoHint = (warn) => {
  $('goto-hint').classList.toggle('warn', warn);
  $('goto-ok').disabled = !gotoValue;
};
$('goto-input').addEventListener('input', (e) => {
  const digits = e.target.value
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/\D/g, '')
    .replace(/^0+/, '');
  const ok = digits.length <= String(LAST).length && +digits <= LAST;
  if (ok) gotoValue = digits;
  e.target.value = gotoValue;
  gotoHint(!ok || digits !== e.target.value);
});
$('goto-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!gotoValue) { gotoHint(true); return; }
  closeAll();
  go(+gotoValue, { jump: true });
});
$('night-input').addEventListener('change', (e) => { state.night = e.target.checked; save(); applySettings(); });
const paintRange = (r) => r.style.setProperty('--val', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
$('bright-input').addEventListener('input', (e) => { state.bright = +e.target.value; paintRange(e.target); save(); applySettings(); });
$('awake-input').addEventListener('change', (e) => { state.awake = e.target.checked; save(); applyAwake(); });
let searchTimer;
$('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { if (window.QURAN_TEXT) runSearch(e.target.value); }, 200);
});
$('search-form').addEventListener('submit', (e) => { e.preventDefault(); if (window.QURAN_TEXT) runSearch($('search-input').value); });

document.addEventListener('keydown', (e) => {
  if (selected && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') { e.preventDefault(); copyAyah(); return; }
  if (e.key === 'Escape') {
    if (selected) clearSelection();
    else if (overlayOpen() || panelKind) closeAll();
    else if (fullscreen) setFullscreen(false);
    else document.body.classList.toggle('bars-hidden');
    return;
  }
  if (e.key === 'F11') { e.preventDefault(); setFullscreen(!fullscreen); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); actions.search(); return; }
  if (overlayOpen() || e.target.matches('input, textarea')) return;
  if (state.fill && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
    e.preventDefault();
    const box = $('pages');
    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
    const step = e.key.startsWith('Arrow') ? 90 : box.clientHeight * 0.85;
    // reading zoom: these keys only scroll; at the end of the page they stop and never turn it
    if (atPageEdge(down)) edgeHint(down);
    else box.scrollBy({ top: down ? step : -step, behavior: 'smooth' });
    return;
  }
  const keys = { ArrowLeft: 1, PageDown: 1, ArrowRight: -1, PageUp: -1, ' ': e.shiftKey ? -1 : 1 };
  if (e.key in keys) { e.preventDefault(); turn(keys[e.key]); }
  else if (e.key === 'Home') go(1, { jump: true });
  else if (e.key === 'End') go(LAST, { jump: true });
});

$('reader').addEventListener('contextmenu', selectAyahAt);
$('reader').addEventListener('dblclick', selectAyahAt);
// No browser context menu in the app, except where text can be selected.
document.addEventListener('contextmenu', (e) => { if (!e.target.closest('input, textarea, .panel')) e.preventDefault(); });

let wheelAt = 0;
let lastWheel = 0;
let hintAt = 0;
function atPageEdge(down) {
  const box = $('pages');
  return down ? box.scrollTop + box.clientHeight >= box.scrollHeight - 2 : box.scrollTop <= 0;
}
function edgeHint(down) {
  if (Date.now() - hintAt < 2500) return;
  hintAt = Date.now();
  toast(down ? 'نهاية الصفحة\nللتقليب استخدم الأسهم على الجانبين' : 'أعلى الصفحة\nللرجوع استخدم الأسهم على الجانبين');
}
$('reader').addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) < 4) return;
  if (state.fill) {
    // Reading zoom: the wheel only scrolls the page. Reaching the end stops there and never turns the page;
    // a fresh roll against the edge just reminds the reader how to turn (side arrows or keyboard arrows).
    const down = e.deltaY > 0;
    const now = Date.now();
    const newGesture = now - lastWheel > 400;
    lastWheel = now;
    if (newGesture && atPageEdge(down)) edgeHint(down);
    return;
  }
  if (Date.now() - wheelAt < 350) return;
  wheelAt = Date.now();
  turn(e.deltaY > 0 ? 1 : -1);
}, { passive: true });

// ---------- start ----------
// Buttons with a data-tone get a small coloured glass badge behind their icon; the rest keep a plain icon.
const badge = (name, tone) => `<span class="ic tone-${tone}">${icon(name)}</span>`;
document.querySelectorAll('[data-icon]').forEach((b) => b.insertAdjacentHTML('afterbegin', b.dataset.tone ? badge(b.dataset.icon, b.dataset.tone) : icon(b.dataset.icon)));
document.querySelector('.turn.next').innerHTML = `<span class="turn-face">${icon('left')}</span>`;
document.querySelector('.turn.prev').innerHTML = `<span class="turn-face">${icon('right')}</span>`;
// Browser previews only (not in the app): ?page=249&mode=single&night=1&view=index|juz|goto|light
const preview = window.__TAURI__ ? new URLSearchParams() : new URLSearchParams(location.search);
if (preview.has('page')) state.page = +preview.get('page');
if (preview.has('mode')) state.mode = preview.get('mode');
if (preview.has('night')) state.night = preview.get('night') === '1';
if (preview.has('mark')) state.mark = +preview.get('mark');
if (preview.has('fill')) state.fill = preview.get('fill') === '1';
applySettings();
applyAwake();
$('fs-btn').innerHTML = icon('expand');
$('fs-btn').title = 'ملء الشاشة (F11)';
delete state.fullscreen; // older versions remembered full screen
initSource().catch((err) => console.error('page source', err)).finally(() => {
  go(state.page);
  const view = preview.get('view');
  if (view) actions[view]?.();
  // First run of the app: show the short guide once.
  const WELCOME_KEY = 'quran.welcome.v1';
  try {
    if ((window.__TAURI__ || preview.has('welcome')) && !view && !localStorage.getItem(WELCOME_KEY)) {
      localStorage.setItem(WELCOME_KEY, '1');
      setTimeout(() => openDialog('welcome'), 700);
    }
  } catch { /* storage unavailable: skip the guide */ }
  if (preview.get('bars') === '0') document.body.classList.add('bars-hidden');
  if (preview.has('flash')) flashAyah(currentLeaf(), preview.get('flash'));
  if (preview.has('select')) { // right-clicks the middle of the given ayah, as a user would
    loadBoxes().then(() => {
      const key = preview.get('select');
      const pageEl = [...currentLeaf().querySelectorAll('.page')].find((p) => window.AYAH_BOXES[p.dataset.page]?.some(([k]) => k === key));
      const [x, y, w, h] = window.AYAH_BOXES[pageEl.dataset.page].find(([k]) => k === key)[1][0];
      const r = pageEl.getBoundingClientRect();
      pageEl.querySelector('img').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left + (x + w / 2) * r.width, clientY: r.top + (y + h / 2) * r.height }));
    });
  }
  // Ayah positions are needed for selecting/copying ayahs; load them once the first pages are up.
  setTimeout(() => loadBoxes().catch(() => {}), 1500);
});
