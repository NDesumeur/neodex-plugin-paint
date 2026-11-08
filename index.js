// Paint : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"ptBar\">\n        <span id=\"ptName\" class=\"ptName\"></span>\n        <button class=\"btn px\" id=\"ptNewBtn\">Nouveau</button><button class=\"btn px\" id=\"ptOpenBtn\">Ouvrir…</button><button class=\"btn main px\" id=\"ptSaveBtn\" title=\"Ctrl+S\">Enregistrer…</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptUndo\" title=\"Annuler (Ctrl+Z)\">↶</button><button class=\"btn px\" id=\"ptRedo\" title=\"Rétablir (Ctrl+Y)\">↷</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptZoomOut\" title=\"Zoom arrière (Ctrl+molette)\">−</button><span id=\"ptZoomVal\" class=\"hint\"></span><button class=\"btn px\" id=\"ptZoomIn\" title=\"Zoom avant\">+</button><button class=\"btn px\" id=\"ptZoomFit\">AJUSTER</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptRotL\" title=\"Tourner à gauche\">⟲</button><button class=\"btn px\" id=\"ptRotR\" title=\"Tourner à droite\">⟳</button><button class=\"btn px\" id=\"ptFlipH\" title=\"Miroir horizontal\">⇋</button><button class=\"btn px\" id=\"ptFlipV\" title=\"Miroir vertical\">⇵</button>\n        <button class=\"btn px\" id=\"ptResize\">Redimensionner</button><button class=\"btn px\" id=\"ptCrop\" title=\"Garder seulement la zone sélectionnée\">Recadrer</button>\n        <select class=\"f\" id=\"ptFilters\"></select>\n      </div>\n      <div class=\"ptMain\">\n        <div id=\"ptTools\"></div>\n        <div id=\"ptStage\"><div id=\"ptWrap\"><canvas id=\"ptCanvas\"></canvas><canvas id=\"ptOver\"></canvas></div></div>\n        <div class=\"ptSide\">\n          <span class=\"label\">Couleur</span><input type=\"color\" id=\"ptColor\"><div id=\"ptPal\"></div>\n          <span class=\"label\">Taille</span><input type=\"range\" id=\"ptSizeIn\" min=\"1\" max=\"80\"><span id=\"ptSizeVal\" class=\"hint\"></span>\n          <label class=\"check\"><input type=\"checkbox\" id=\"ptFillIn\"> Formes pleines</label>\n          <label class=\"check\"><input type=\"checkbox\" id=\"ptPixel\"> Mode net (sans lissage)</label>\n          <div class=\"hint\" id=\"ptInfo\"></div>\n          <div class=\"hint\">Glisse une image ici pour l'ouvrir. Ctrl+molette : zoom. Suppr : effacer la sélection. Lettres B E L R O F I T S : outils.</div>\n        </div>\n      </div>";
/*CSS-MOVED*/ const CSS = `.ptSep{width:10px}
.ptName{color:#fff;font-size:15px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px}
#ptTools{width:130px;flex:none;display:flex;flex-direction:column;gap:2px;padding:10px;border-right:3px solid var(--line);overflow-y:auto}
.ptTool{height:36px;font-size:14px;margin:3px}
.ptTool.on{--c:var(--magenta);--fill:rgba(var(--mgr),.25)}
#ptStage{flex:1;overflow:auto;display:grid;place-items:center;padding:20px;background:repeating-conic-gradient(#1a1030 0 25%,#140a26 0 50%) 0 0/24px 24px}
#ptWrap{position:relative;box-shadow:0 0 0 3px var(--line2),0 10px 40px rgba(0,0,0,.5);background:repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/16px 16px}
#ptWrap canvas{position:absolute;left:0;top:0}
#ptWrap.crisp canvas{image-rendering:pixelated}
#ptOver{touch-action:none}
.ptSide{width:220px;flex:none;display:flex;flex-direction:column;gap:10px;padding:14px;border-left:3px solid var(--line);overflow-y:auto}
#ptColor{width:100%;height:40px;border:0;padding:0;background:none;cursor:var(--cp,pointer)}
#ptPal{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
#ptPal .sw{width:auto;aspect-ratio:1;height:auto}
#ptSizeIn{accent-color:var(--magenta)}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const nbConfirm = host.confirm;  // la boîte de confirmation de NeoDex, à la place de celle de Windows
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "paintApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  const money = s => { const v = parseFloat(String(s).replace(/[\s  €]/g, '').replace(',', '.')); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; };  // restés dans le cœur : Stats et d'autres applis s'en servent
  // ---- ton code d'origine ----
/* ---------- Paint app: one canvas (the picture) + one overlay (shape previews, selection); undo keeps whole snapshots ---------- */
const pt = {tool: 'brush', color: '#ff5ad9', size: 6, fill: false, pixel: false, zoom: 1, undo: [], redo: [], file: '', sel: null, dirty: false};
const ptC = $('ptCanvas'), ptO = $('ptOver'), ptX = ptC.getContext('2d', {willReadFrequently: true}), ptOX = ptO.getContext('2d');
const PT_PALETTE = ['#000000', '#ffffff', '#7f7f7f', '#c3c3c3', '#130a20', '#2b2468', '#8a5cf0', '#d9c6ff', '#e01ec8', '#ff5ad9', '#ff4f6d', '#ff9a3c', '#ffd07a', '#8ee8a0', '#2fbf71', '#7fe0ee', '#1f8098', '#3b5bdb', '#8b5a2b', '#f3eaff'];
const PT_TOOLS = [['brush', 'Pinceau', 'B'], ['eraser', 'Gomme', 'E'], ['line', 'Ligne', 'L'], ['rect', 'Rectangle', 'R'], ['ellipse', 'Ellipse', 'O'], ['fill', 'Remplir', 'F'], ['picker', 'Pipette', 'I'], ['text', 'Texte', 'T'], ['select', 'Sélection', 'S']];
function ptSize(w, h) { for (const c of [ptC, ptO]) { c.width = w; c.height = h; } ptZoom(pt.zoom); }
function ptZoom(z) {
  pt.zoom = Math.min(16, Math.max(.1, z));
  for (const c of [ptC, ptO]) { c.style.width = ptC.width * pt.zoom + 'px'; c.style.height = ptC.height * pt.zoom + 'px'; }
  $('ptWrap').style.width = ptC.width * pt.zoom + 'px'; $('ptWrap').style.height = ptC.height * pt.zoom + 'px';
  $('ptWrap').classList.toggle('crisp', pt.zoom >= 2 || pt.pixel);
  $('ptZoomVal').textContent = Math.round(pt.zoom * 100) + ' %';
  ptInfo();
}
const ptFit = () => { const s = $('ptStage'); ptZoom(Math.min(1, (s.clientWidth - 40) / ptC.width, (s.clientHeight - 40) / ptC.height) || 1); };
const ptInfo = (x, y) => { $('ptInfo').textContent = ptC.width + ' × ' + ptC.height + ' px' + (x != null ? ' · ' + x + ', ' + y : '') + (pt.sel ? ' · sélection ' + Math.abs(pt.sel.w) + ' × ' + Math.abs(pt.sel.h) : ''); };
function ptSnap() { pt.undo.push({w: ptC.width, h: ptC.height, d: ptX.getImageData(0, 0, ptC.width, ptC.height)}); if (pt.undo.length > 40) pt.undo.shift(); pt.redo = []; pt.dirty = true; }
function ptRestore(from, to) {
  const s = from.pop(); if (!s) return;
  to.push({w: ptC.width, h: ptC.height, d: ptX.getImageData(0, 0, ptC.width, ptC.height)});
  ptSize(s.w, s.h); ptX.putImageData(s.d, 0, 0); pt.sel = null; ptOverlay();
}
function ptNew(w = 800, h = 600, bg = '#ffffff') { pt.ready = true; pt.undo = []; pt.redo = []; pt.file = ''; pt.sel = null; ptSize(w, h); ptX.fillStyle = bg; ptX.fillRect(0, 0, w, h); pt.dirty = false; ptFit(); $('ptName').textContent = 'Sans titre'; }
function ptLoad(src, name, file = '') {
  const img = new Image();
  img.onload = () => { pt.ready = true; pt.undo = []; pt.redo = []; pt.sel = null; pt.file = file; ptSize(img.naturalWidth, img.naturalHeight); ptX.clearRect(0, 0, ptC.width, ptC.height); ptX.drawImage(img, 0, 0); pt.dirty = false; ptFit(); $('ptName').textContent = name; };
  img.onerror = () => toast("Impossible d'ouvrir cette image", true);
  img.src = src;
}
const ptOpenPath = p => neo.fileData(p).then(u => { ptLoad(u, p.split(/[\\/]/).pop(), p); newTab('neodex:paint'); }, e => toast(e.message, true));  // l'image, lue par NeoDex
async function ptSave() {
  const flat = document.createElement('canvas'); flat.width = ptC.width; flat.height = ptC.height;
  const f = flat.getContext('2d'); f.fillStyle = '#ffffff'; f.fillRect(0, 0, flat.width, flat.height); f.drawImage(ptC, 0, 0);  // JPEG has no transparency: white behind
  const base = pt.file ? pt.file.replace(/\.[^.\\/]+$/, '') + ' (modifié).png' : (await neo.places()).known.find(k => k.name === 'Images').path + '\\dessin.png';
  const out = await neo.paintSave({png: ptC.toDataURL('image/png'), jpg: flat.toDataURL('image/jpeg', .92), webp: ptC.toDataURL('image/webp', .92), suggested: base});
  if (out) { pt.dirty = false; pt.file = out; $('ptName').textContent = out.split(/[\\/]/).pop(); toast('Image enregistrée : ' + out.split(/[\\/]/).pop()); }
}
// drawing
const ptPos = e => { const r = ptC.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / pt.zoom), Math.floor((e.clientY - r.top) / pt.zoom)]; };
function ptDot(x, y) {
  const s = pt.size;
  if (pt.pixel) ptX.fillRect(Math.round(x - s / 2 + .5), Math.round(y - s / 2 + .5), s, s);
  else { ptX.beginPath(); ptX.arc(x + .5, y + .5, s / 2, 0, 6.2832); ptX.fill(); }
}
function ptStroke(a, b) {  // dots every pixel along the segment: same look in smooth and pixel mode
  const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  for (let i = 0; i <= n; i++) ptDot(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n);
}
function ptShape(g, tool, a, b) {
  g.save(); g.strokeStyle = g.fillStyle = pt.color; g.lineWidth = pt.size; g.lineCap = 'round'; g.imageSmoothingEnabled = !pt.pixel;
  const [x, y, w, h] = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])];
  g.beginPath();
  if (tool === 'line') { g.moveTo(a[0] + .5, a[1] + .5); g.lineTo(b[0] + .5, b[1] + .5); g.stroke(); }
  else { if (tool === 'rect') g.rect(x + .5, y + .5, w, h); else g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 6.2832); pt.fill ? g.fill() : g.stroke(); }
  g.restore();
}
function ptFlood(x, y) {  // scanline flood fill, colours within a small tolerance count as the same
  const w = ptC.width, h = ptC.height, img = ptX.getImageData(0, 0, w, h), d = img.data, i0 = (y * w + x) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const c = [parseInt(pt.color.slice(1, 3), 16), parseInt(pt.color.slice(3, 5), 16), parseInt(pt.color.slice(5, 7), 16), 255];
  if (t.every((v, k) => Math.abs(v - c[k]) < 3)) return;
  const same = i => Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) + Math.abs(d[i + 3] - t[3]) <= 48, stack = [[x, y]];
  while (stack.length) {
    let [px, py] = stack.pop(), i = (py * w + px) * 4;
    while (px > 0 && same(i - 4)) { px--; i -= 4; }
    let up = false, down = false;
    for (; px < w && same(i); px++, i += 4) {
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      if (py > 0) { const s = same(i - w * 4); if (s && !up) stack.push([px, py - 1]); up = s; }
      if (py < h - 1) { const s = same(i + w * 4); if (s && !down) stack.push([px, py + 1]); down = s; }
    }
  }
  ptX.putImageData(img, 0, 0);
}
function ptOverlay(prev) {  // shape preview and the dashed selection box
  ptOX.clearRect(0, 0, ptO.width, ptO.height);
  if (prev) ptShape(ptOX, ...prev);
  if (pt.sel) { const {x, y, w, h} = pt.sel; ptOX.save(); ptOX.setLineDash([4 / pt.zoom * 2, 4 / pt.zoom * 2]); ptOX.lineWidth = 1 / pt.zoom * 1.5; ptOX.strokeStyle = '#ff5ad9'; ptOX.strokeRect(Math.min(x, x + w) + .5, Math.min(y, y + h) + .5, Math.abs(w), Math.abs(h)); ptOX.restore(); }
  ptInfo();
}
let ptDrag = null;
ptO.onpointerdown = async e => {
  if (e.button) return;
  const p = ptPos(e), tool = pt.tool;
  if (tool === 'picker') { const d = ptX.getImageData(p[0], p[1], 1, 1).data; pt.color = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); return ptSide(); }
  if (tool === 'fill') { ptSnap(); return ptFlood(p[0], p[1]); }
  if (tool === 'text') {
    const t = await ask('TEXTE', '', 'Le texte à écrire à cet endroit (taille : celle du pinceau × 4).');
    if (!t) return;
    ptSnap(); ptX.fillStyle = pt.color; ptX.font = `${pt.size * 4}px 'Pixelify Sans', sans-serif`; ptX.textBaseline = 'top'; ptX.fillText(t, p[0], p[1]); return;
  }
  ptO.setPointerCapture(e.pointerId);
  if (tool === 'select') { pt.sel = {x: p[0], y: p[1], w: 0, h: 0}; ptDrag = {tool, a: p}; return ptOverlay(); }
  ptSnap(); ptDrag = {tool, a: p, last: p};
  if (tool === 'brush' || tool === 'eraser') {
    ptX.save(); ptX.fillStyle = pt.color; if (tool === 'eraser') ptX.globalCompositeOperation = 'destination-out';
    ptDot(...p);
  }
};
ptO.onpointermove = e => {
  const p = ptPos(e); ptInfo(p[0], p[1]);
  if (!ptDrag) return;
  if (ptDrag.tool === 'brush' || ptDrag.tool === 'eraser') { ptStroke(ptDrag.last, p); ptDrag.last = p; }
  else if (ptDrag.tool === 'select') { pt.sel.w = p[0] - pt.sel.x; pt.sel.h = p[1] - pt.sel.y; ptOverlay(); }
  else ptOverlay([ptDrag.tool, ptDrag.a, p]);
};
ptO.onpointerup = e => {
  if (!ptDrag) return;
  const p = ptPos(e), d = ptDrag; ptDrag = null;
  if (d.tool === 'brush' || d.tool === 'eraser') ptX.restore();
  else if (d.tool === 'select') { if (!pt.sel.w || !pt.sel.h) pt.sel = null; ptOverlay(); }
  else { ptShape(ptX, d.tool, d.a, p); ptOverlay(); }
};
// picture operations
function ptReplace(w, h, draw) { ptSnap(); const tmp = document.createElement('canvas'); tmp.width = ptC.width; tmp.height = ptC.height; tmp.getContext('2d').drawImage(ptC, 0, 0); ptSize(w, h); ptX.clearRect(0, 0, w, h); ptX.save(); draw(ptX, tmp); ptX.restore(); pt.sel = null; ptOverlay(); }
const PT_OPS = {
  rotL: () => ptReplace(ptC.height, ptC.width, (g, t) => { g.translate(0, t.width); g.rotate(-Math.PI / 2); g.drawImage(t, 0, 0); }),
  rotR: () => ptReplace(ptC.height, ptC.width, (g, t) => { g.translate(t.height, 0); g.rotate(Math.PI / 2); g.drawImage(t, 0, 0); }),
  flipH: () => ptReplace(ptC.width, ptC.height, (g, t) => { g.translate(t.width, 0); g.scale(-1, 1); g.drawImage(t, 0, 0); }),
  flipV: () => ptReplace(ptC.width, ptC.height, (g, t) => { g.translate(0, t.height); g.scale(1, -1); g.drawImage(t, 0, 0); }),
  crop: () => {
    if (!pt.sel) return toast("Choisis d'abord une zone avec l'outil Sélection", true);
    const x = Math.max(0, Math.min(pt.sel.x, pt.sel.x + pt.sel.w)), y = Math.max(0, Math.min(pt.sel.y, pt.sel.y + pt.sel.h)), w = Math.min(Math.abs(pt.sel.w), ptC.width - x), h = Math.min(Math.abs(pt.sel.h), ptC.height - y);
    ptReplace(w, h, (g, t) => g.drawImage(t, x, y, w, h, 0, 0, w, h));
  },
  clearSel: () => { if (!pt.sel) return; ptSnap(); const {x, y, w, h} = pt.sel; ptX.clearRect(Math.min(x, x + w), Math.min(y, y + h), Math.abs(w), Math.abs(h)); },
  resize: async () => {
    const v = await ask('REDIMENSIONNER', String(ptC.width), `Nouvelle largeur en pixels (la hauteur suit). Actuellement ${ptC.width} × ${ptC.height}.`);
    const w = Math.round(money(v || '')); if (!(w > 0 && w <= 8000)) return;
    const h = Math.max(1, Math.round(ptC.height * w / ptC.width));
    ptReplace(w, h, (g, t) => { g.imageSmoothingEnabled = !pt.pixel; g.imageSmoothingQuality = 'high'; g.drawImage(t, 0, 0, w, h); }); ptFit();
  },
};
const PT_FILTERS = {'Noir et blanc': 'grayscale(1)', 'Sépia': 'sepia(1)', 'Négatif': 'invert(1)', 'Plus lumineux': 'brightness(1.15)', 'Plus sombre': 'brightness(.87)', 'Plus de contraste': 'contrast(1.25)', 'Couleurs vives': 'saturate(1.5)', 'Flou': 'blur(2px)', 'Teinte néon': 'hue-rotate(40deg) saturate(1.3)'};
function ptFilter(f) { ptReplace(ptC.width, ptC.height, (g, t) => { g.filter = f; g.drawImage(t, 0, 0); }); }
function ptSide() {
  $('ptTools').replaceChildren(...PT_TOOLS.map(([id, name, key]) => { const b = el('button', 'btn px ptTool' + (pt.tool === id ? ' on' : ''), name); b.title = name + ' (' + key + ')'; b.onclick = () => { pt.tool = id; ptSide(); }; return b; }));
  $('ptColor').value = pt.color; $('ptSizeIn').value = pt.size; $('ptSizeVal').textContent = pt.size + ' px'; $('ptFillIn').checked = pt.fill; $('ptPixel').checked = pt.pixel;
  $('ptPal').replaceChildren(...PT_PALETTE.map(c => { const s = el('button', 'sw' + (c === pt.color ? ' on' : '')); s.style.setProperty('--ec', c); s.title = c; s.onclick = () => { pt.color = c; ptSide(); }; return s; }));
  ptO.style.cursor = pt.tool === 'picker' || pt.tool === 'fill' ? 'var(--cp, pointer)' : pt.tool === 'text' ? 'text' : 'crosshair';
}
function ptOpen() { if (!pt.ready) { pt.ready = true; if (!pt.file) ptNew(); } ptSide(); }
$('ptColor').oninput = e => { pt.color = e.target.value; ptSide(); };
$('ptSizeIn').oninput = e => { pt.size = +e.target.value; ptSide(); };
$('ptFillIn').onchange = e => { pt.fill = e.target.checked; };
$('ptPixel').onchange = e => { pt.pixel = e.target.checked; ptZoom(pt.zoom); };
$('ptNewBtn').onclick = async () => {
  if (pt.dirty && !await nbConfirm("L'image actuelle n'est pas enregistrée. Commencer une nouvelle image ?")) return;
  const v = await ask('NOUVELLE IMAGE', '800 x 600', 'Largeur x hauteur en pixels (ex : 256 x 256 pour une icône).'); if (!v) return;
  const [w, h] = v.split(/[x×*, ]+/).map(n => Math.round(+n)); if (w > 0 && h > 0 && w <= 8000 && h <= 8000) ptNew(w, h); else toast('Taille invalide', true);
};
$('ptOpenBtn').onclick = async () => { if (pt.dirty && !await nbConfirm("L'image actuelle n'est pas enregistrée. En ouvrir une autre ?")) return; const p = await neo.paintPick(); if (p) ptOpenPath(p); };
$('ptSaveBtn').onclick = ptSave;
$('ptUndo').onclick = () => ptRestore(pt.undo, pt.redo);
$('ptRedo').onclick = () => ptRestore(pt.redo, pt.undo);
$('ptZoomOut').onclick = () => ptZoom(pt.zoom / 1.25); $('ptZoomIn').onclick = () => ptZoom(pt.zoom * 1.25); $('ptZoomFit').onclick = ptFit;
for (const [id, op] of Object.entries({ptRotL: 'rotL', ptRotR: 'rotR', ptFlipH: 'flipH', ptFlipV: 'flipV', ptCrop: 'crop', ptResize: 'resize'})) $(id).onclick = () => PT_OPS[op]();
$('ptFilters').replaceChildren(new Option('Filtres…', ''), ...Object.keys(PT_FILTERS).map(n => new Option(n, n)));
$('ptFilters').onchange = e => { if (e.target.value) ptFilter(PT_FILTERS[e.target.value]); e.target.value = ''; };
$('ptStage').onwheel = e => { if (e.ctrlKey) { e.preventDefault(); ptZoom(pt.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); } };
$('paintApp').ondragover = e => e.preventDefault();
$('paintApp').ondrop = e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) neo.pathOf(f).then(ptOpenPath); };
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('#askModal.on')) return;
  const k = e.key.toLowerCase();
  if (e.ctrlKey && k === 'z') { e.preventDefault(); ptRestore(pt.undo, pt.redo); }
  else if (e.ctrlKey && k === 'y') { e.preventDefault(); ptRestore(pt.redo, pt.undo); }
  else if (e.ctrlKey && k === 's') { e.preventDefault(); ptSave(); }
  else if (k === 'delete') PT_OPS.clearSel();
  else if (k === 'escape') { pt.sel = null; ptOverlay(); }
  else if (!e.ctrlKey && !e.altKey) { const t = PT_TOOLS.find(t => t[2].toLowerCase() === k); if (t) { pt.tool = t[0]; ptSide(); } }
});  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onFiles(files => files[0] && ptOpenPath(files[0]));  // « ouvrir avec » : Fichiers, Visionneuse
  ctx.onOpen(() => { ptOpen(); });
}
