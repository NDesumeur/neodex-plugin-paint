// Paint : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"ptBar\">\n        <span id=\"ptName\" class=\"ptName\"></span>\n        <button class=\"btn px\" id=\"ptNewBtn\">Nouveau</button><button class=\"btn px\" id=\"ptOpenBtn\">Ouvrir…</button><button class=\"btn px\" id=\"ptPasteBtn\" title=\"Coller une image du presse-papiers comme nouvelle image (Ctrl+V ; Ctrl+Maj+V : dans un nouveau calque)\">Coller</button><button class=\"btn main px\" id=\"ptSaveBtn\" title=\"Ctrl+S\">Enregistrer…</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptUndo\" title=\"Annuler (Ctrl+Z)\">↶</button><button class=\"btn px\" id=\"ptRedo\" title=\"Rétablir (Ctrl+Y)\">↷</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptZoomOut\" title=\"Zoom arrière (Ctrl+molette)\">−</button><span id=\"ptZoomVal\" class=\"hint\"></span><button class=\"btn px\" id=\"ptZoomIn\" title=\"Zoom avant\">+</button><button class=\"btn px\" id=\"ptZoomFit\">AJUSTER</button><span class=\"ptSep\"></span>\n        <button class=\"btn px\" id=\"ptRotL\" title=\"Tourner à gauche\">⟲</button><button class=\"btn px\" id=\"ptRotR\" title=\"Tourner à droite\">⟳</button><button class=\"btn px\" id=\"ptFlipH\" title=\"Miroir horizontal\">⇋</button><button class=\"btn px\" id=\"ptFlipV\" title=\"Miroir vertical\">⇵</button>\n        <button class=\"btn px\" id=\"ptResize\">Redimensionner</button><button class=\"btn px\" id=\"ptCrop\" title=\"Garder seulement la zone sélectionnée\">Recadrer</button>\n        <select class=\"f\" id=\"ptFilters\"></select>\n      </div>\n      <div class=\"ptMain\">\n        <div id=\"ptTools\"></div>\n        <div id=\"ptStage\"><div id=\"ptWrap\"><canvas id=\"ptOver\"></canvas></div></div>\n        <div class=\"ptSide\">\n          <div class=\"ptBox\"><span class=\"label\">Couleur</span><input type=\"color\" id=\"ptColor\"><div id=\"ptPal\"></div></div>\n          <div class=\"ptBox\"><span class=\"label\">Taille</span><input type=\"range\" id=\"ptSizeIn\" min=\"1\" max=\"80\"><span id=\"ptSizeVal\" class=\"hint\"></span>\n          <label class=\"check\"><input type=\"checkbox\" id=\"ptFillIn\"> Formes pleines</label>\n          <label class=\"check\"><input type=\"checkbox\" id=\"ptPixel\"> Mode net (sans lissage)</label></div>\n          <div class=\"ptBox\" id=\"ptLayers\"></div>\n          <div class=\"hint\" id=\"ptInfo\"></div>\n          <div class=\"hint\">Glisse une image ici pour l'ouvrir. Ctrl+molette : zoom. Suppr : effacer la sélection. Lettres B E L R O F I T S : outils. Ctrl+V : coller une image (Ctrl+Maj+V : dans un nouveau calque).</div>\n        </div>\n      </div>";
/*CSS-MOVED*/ const CSS = `.ptSep{width:3px;height:30px;background:var(--line);margin:0 6px;box-shadow:2px 0 0 #05010b}
.ptBar{box-shadow:0 3px 0 #05010b;position:relative;z-index:1}
.ptBox{display:flex;flex-direction:column;gap:8px;padding:10px;background:var(--bg0);box-shadow:inset 0 0 0 2px var(--line),4px 4px 0 #05010b}
.ptBox .label{margin:0}
.ptLayList{display:flex;flex-direction:column;gap:4px;max-height:clamp(120px,24vh,300px);overflow:auto}
.ptLay{display:flex;gap:4px;align-items:center}
.ptEye{width:34px;height:32px;padding:0!important;margin:0!important;font-size:15px}
.ptLayName{all:unset;flex:1;min-width:0;padding:7px 9px;font-size:15px;color:var(--lilac);background:rgba(255,255,255,.04);box-shadow:inset 0 -2px 0 rgba(0,0,0,.35);cursor:var(--cp,pointer);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ptLay.on .ptLayName{color:#fff;background:rgba(var(--mgr),.25);box-shadow:inset 0 0 0 2px var(--magenta)}
.ptLay.off .ptLayName{opacity:.5}
.ptLayActs{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
.ptLayActs .btn{margin:0;padding:6px 0;width:auto;font-size:15px;display:grid;place-items:center}
.ptOp{display:flex;gap:8px;align-items:center}.ptOp input{flex:1;min-width:0;accent-color:var(--magenta)}.ptOp .hint{white-space:nowrap}
.ptName{color:#fff;font-size:16px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px}
#ptTools{width:clamp(170px,12vw,200px);flex:none;display:flex;flex-direction:column;gap:2px;padding:10px;border-right:3px solid var(--line);overflow-y:auto}
.ptTool{height:42px;font-size:15px;margin:3px;display:flex;align-items:center;gap:9px;justify-content:flex-start;padding:0 9px}
.ptTool canvas{width:27px;height:27px;image-rendering:pixelated;flex:none}
.ptTool.on{--c:var(--magenta);--fill:rgba(var(--mgr),.25)}
#ptStage{flex:1;overflow:auto;display:grid;place-items:center;padding:26px;background:repeating-conic-gradient(#1a1030 0 25%,#140a26 0 50%) 0 0/32px 32px}
#ptWrap{position:relative;box-shadow:0 0 0 3px #05010b,0 0 0 6px var(--line2),0 0 0 9px #05010b,12px 12px 0 9px rgba(0,0,0,.45);background:repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/16px 16px}
#ptWrap canvas{position:absolute;left:0;top:0}
#ptWrap.crisp canvas{image-rendering:pixelated}
#ptOver{touch-action:none}
.ptSide{width:clamp(240px,18vw,320px);flex:none;display:flex;flex-direction:column;gap:14px;padding:14px;border-left:3px solid var(--line);overflow-y:auto}
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
const pt = {tool: 'brush', color: '#ff5ad9', size: 6, fill: false, pixel: false, zoom: 1, undo: [], redo: [], file: '', sel: null, dirty: false, layers: [], active: 0};
const ptO = $('ptOver'), ptOX = ptO.getContext('2d');  // ptO : l'aperçu des formes et la sélection, au-dessus des calques ; il donne aussi la taille de l'image
let ptC = null, ptX = null, ptLid = 0;  // le calque actif
function ptLayer(name, w = ptO.width, h = ptO.height) { const c = document.createElement('canvas'); c.width = w; c.height = h; ++ptLid; return {id: ptLid, name: name || 'Calque ' + ptLid, c, g: c.getContext('2d', {willReadFrequently: true}), visible: true, opacity: 1}; }
function ptMount() {  // les toiles dans l'ordre (le fond en bas), l'aperçu par-dessus
  $('ptWrap').replaceChildren(...pt.layers.map(L => { L.c.style.display = L.visible ? '' : 'none'; L.c.style.opacity = L.opacity; return L.c; }), ptO);
  pt.active = Math.max(0, Math.min(pt.active, pt.layers.length - 1)); ptC = pt.layers[pt.active].c; ptX = pt.layers[pt.active].g; ptZoom(pt.zoom);
}
function ptFlat(bg) {  // l'image vue : les calques visibles fondus avec leur opacité
  const f = document.createElement('canvas'); f.width = ptO.width; f.height = ptO.height; const g = f.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, f.width, f.height); }
  for (const L of pt.layers) if (L.visible) { g.globalAlpha = L.opacity; g.drawImage(L.c, 0, 0); }
  return f;
}
const PT_PALETTE = ['#000000', '#ffffff', '#7f7f7f', '#c3c3c3', '#130a20', '#2b2468', '#8a5cf0', '#d9c6ff', '#e01ec8', '#ff5ad9', '#ff4f6d', '#ff9a3c', '#ffd07a', '#8ee8a0', '#2fbf71', '#7fe0ee', '#1f8098', '#3b5bdb', '#8b5a2b', '#f3eaff'];
const PT_TOOLS = [['brush', 'Pinceau', 'B'], ['eraser', 'Gomme', 'E'], ['line', 'Ligne', 'L'], ['rect', 'Rectangle', 'R'], ['ellipse', 'Ellipse', 'O'], ['fill', 'Remplir', 'F'], ['picker', 'Pipette', 'I'], ['text', 'Texte', 'T'], ['select', 'Sélection', 'S']];
function ptZoom(z) {
  pt.zoom = Math.min(16, Math.max(.1, z));
  for (const c of [...pt.layers.map(L => L.c), ptO]) { c.style.width = ptO.width * pt.zoom + 'px'; c.style.height = ptO.height * pt.zoom + 'px'; }
  $('ptWrap').style.width = ptO.width * pt.zoom + 'px'; $('ptWrap').style.height = ptO.height * pt.zoom + 'px';
  $('ptWrap').classList.toggle('crisp', pt.zoom >= 2 || pt.pixel);
  $('ptZoomVal').textContent = Math.round(pt.zoom * 100) + ' %';
  ptInfo();
}
const ptFit = () => { const s = $('ptStage'); ptZoom(Math.min(1, (s.clientWidth - 60) / ptO.width, (s.clientHeight - 60) / ptO.height) || 1); };
const ptInfo = (x, y) => { $('ptInfo').textContent = ptO.width + ' × ' + ptO.height + ' px' + (x != null ? ' · ' + x + ', ' + y : '') + (pt.sel ? ' · sélection ' + Math.abs(pt.sel.w) + ' × ' + Math.abs(pt.sel.h) : ''); };
// annuler : chaque étape garde tous les calques (shortcut: 30 étapes × calques × taille en mémoire ; passer à des étapes par calque si de grandes images rament)
const ptState = () => ({w: ptO.width, h: ptO.height, active: pt.active, layers: pt.layers.map(L => ({id: L.id, name: L.name, visible: L.visible, opacity: L.opacity, d: L.g.getImageData(0, 0, ptO.width, ptO.height)}))});
function ptSnap() { pt.undo.push(ptState()); if (pt.undo.length > 30) pt.undo.shift(); pt.redo = []; pt.dirty = true; }
function ptRestore(from, to) {
  const s = from.pop(); if (!s) return;
  to.push(ptState()); ptO.width = s.w; ptO.height = s.h;
  pt.layers = s.layers.map(q => { const L = ptLayer(q.name, s.w, s.h); Object.assign(L, {id: q.id, visible: q.visible, opacity: q.opacity}); L.g.putImageData(q.d, 0, 0); return L; });
  pt.active = s.active; pt.sel = null; ptMount(); ptOverlay(); ptLayers();
}
function ptStart(w, h, name, draw) { pt.ready = true; pt.undo = []; pt.redo = []; pt.sel = null; ptO.width = w; ptO.height = h; const L = ptLayer(name, w, h); draw(L.g); pt.layers = [L]; pt.active = 0; ptMount(); pt.dirty = false; ptFit(); ptLayers(); }
function ptNew(w = 800, h = 600, bg = '#ffffff') { pt.file = ''; ptStart(w, h, 'Fond', g => { g.fillStyle = bg; g.fillRect(0, 0, w, h); }); $('ptName').textContent = 'Sans titre'; }
function ptLoad(src, name, file = '') {
  const img = new Image();
  img.onload = () => { pt.file = file; ptStart(img.naturalWidth, img.naturalHeight, 'Image', g => g.drawImage(img, 0, 0)); $('ptName').textContent = name; };
  img.onerror = () => toast("Impossible d'ouvrir cette image", true);
  img.src = src;
}
const ptOpenPath = p => neo.fileData(p).then(u => { ptLoad(u, p.split(/[\\/]/).pop(), p); newTab('neodex:paint'); }, e => toast(e.message, true));  // l'image, lue par NeoDex
async function ptSave() {
  const flat = ptFlat('#ffffff'), all = ptFlat();  // JPEG has no transparency: white behind
  const base = pt.file ? pt.file.replace(/\.[^.\\/]+$/, '') + ' (modifié).png' : (await neo.places()).known.find(k => k.name === 'Images').path + '\\dessin.png';
  const out = await neo.paintSave({png: all.toDataURL('image/png'), jpg: flat.toDataURL('image/jpeg', .92), webp: all.toDataURL('image/webp', .92), suggested: base});
  if (out) { pt.dirty = false; pt.file = out; $('ptName').textContent = out.split(/[\\/]/).pop(); toast('Image enregistrée : ' + out.split(/[\\/]/).pop()); }
}
// drawing
const ptPos = e => { const r = ptO.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / pt.zoom), Math.floor((e.clientY - r.top) / pt.zoom)]; };
function ptDot(x, y, k = 1) {  // k : la pression du stylet (1 à la souris)
  const s = Math.max(1, Math.round(pt.size * k * 10) / 10);
  if (pt.pixel) ptX.fillRect(Math.round(x - s / 2 + .5), Math.round(y - s / 2 + .5), s, s);
  else { ptX.beginPath(); ptX.arc(x + .5, y + .5, s / 2, 0, 6.2832); ptX.fill(); }
}
function ptStroke(a, b, ka = 1, kb = ka) {  // dots every pixel along the segment: same look in smooth and pixel mode ; la pression passe de ka à kb
  const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  for (let i = 0; i <= n; i++) ptDot(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n, ka + (kb - ka) * i / n);
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
const ptPress = e => e.pointerType === 'pen' ? Math.max(.1, e.pressure || .5) : 1;  // la souris dessine à pleine taille
ptO.onpointerdown = async e => {
  if (e.button) return;
  const p = ptPos(e), tool = pt.tool;
  if (tool === 'picker') { const d = ptFlat().getContext('2d').getImageData(p[0], p[1], 1, 1).data; pt.color = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); return ptSide(); }
  if (tool === 'fill') { ptSnap(); return ptFlood(p[0], p[1]); }
  if (tool === 'text') {
    const t = await ask('TEXTE', '', 'Le texte à écrire à cet endroit (taille : celle du pinceau × 4).');
    if (!t) return;
    ptSnap(); ptX.fillStyle = pt.color; ptX.font = `${pt.size * 4}px 'Pixelify Sans', sans-serif`; ptX.textBaseline = 'top'; ptX.fillText(t, p[0], p[1]); return;
  }
  try { ptO.setPointerCapture(e.pointerId); } catch {}
  if (tool === 'select') { pt.sel = {x: p[0], y: p[1], w: 0, h: 0}; ptDrag = {tool, a: p}; return ptOverlay(); }
  ptSnap(); ptDrag = {tool, a: p, last: p, k: ptPress(e)};
  if (tool === 'brush' || tool === 'eraser') {
    ptX.save(); ptX.fillStyle = pt.color; if (tool === 'eraser') ptX.globalCompositeOperation = 'destination-out';
    ptDot(...p, ptDrag.k);
  }
};
ptO.onpointermove = e => {
  const p = ptPos(e); ptInfo(p[0], p[1]);
  if (!ptDrag) return;
  if (ptDrag.tool === 'brush' || ptDrag.tool === 'eraser') { for (const c of e.pointerType === 'pen' && e.getCoalescedEvents ? e.getCoalescedEvents() : [e]) { const q = ptPos(c), k = ptPress(c); ptStroke(ptDrag.last, q, ptDrag.k, k); ptDrag.last = q; ptDrag.k = k; } }
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
function ptReplace(w, h, draw, only) {  // tourner, retourner, recadrer, redimensionner : tous les calques ; un filtre (only) : le calque actif
  ptSnap();
  for (const L of only ? [pt.layers[pt.active]] : pt.layers) { const tmp = document.createElement('canvas'); tmp.width = L.c.width; tmp.height = L.c.height; tmp.getContext('2d').drawImage(L.c, 0, 0); L.c.width = w; L.c.height = h; L.g.save(); draw(L.g, tmp); L.g.restore(); }
  ptO.width = w; ptO.height = h; pt.sel = null; ptZoom(pt.zoom); ptOverlay();
}
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
function ptFilter(f) { ptReplace(ptC.width, ptC.height, (g, t) => { g.filter = f; g.drawImage(t, 0, 0); }, true); }
const PT_ICONS = {  // 9 × 9 points par outil
  brush: '.......##......###.....###.....###.....###.....##......###.....####.....##.......', eraser: '.............####....#####...######..#####.#.#####.#..#...##....#.##......##.....',
  line: '........#.......#.......#.......#.......#.......#.......#.......#.......#........', rect: '.........##########.......##.......##.......##.......##.......##########.........',
  ellipse: '...###....##...##.#.......##.......##.......##.......#.##...##....###...', fill: '...#.......#.#.....#...#...#.....#...#...####..#.#####...#.####.......##........#',
  picker: '......##......####....#####.....###.....#.#.....#.#.....#.#.....#.#.....#........', text: '##################...###......###......###......###......###......###.....#####..',
  select: '##.##.##..........#.......##................##........#.......#...........##.##.##'};
function ptIcon(k) { const c = document.createElement('canvas'), m = (PT_ICONS[k] || '').padEnd(81, '.'), g = c.getContext('2d'); c.width = c.height = 9; g.fillStyle = '#f3eaff'; for (let i = 0; i < 81; i++) if (m[i] === '#') g.fillRect(i % 9, i / 9 | 0, 1, 1); return c; }
function ptAddLayer(name, src) { ptSnap(); const L = ptLayer(name || 'Calque ' + (pt.layers.length + 1)); if (src) L.g.drawImage(src, 0, 0); pt.layers.splice(pt.active + 1, 0, L); pt.active++; ptMount(); ptLayers(); return L; }
function ptDupLayer() { const A = pt.layers[pt.active], L = ptAddLayer(A.name + ' (copie)', A.c); L.opacity = A.opacity; ptMount(); }
function ptMoveLayer(d) { const i = pt.active, j = i + d; if (j < 0 || j >= pt.layers.length) return; ptSnap(); [pt.layers[i], pt.layers[j]] = [pt.layers[j], pt.layers[i]]; pt.active = j; ptMount(); ptLayers(); }
function ptMergeDown() { const i = pt.active; if (!i) return toast('Pas de calque en dessous', true); ptSnap(); const A = pt.layers[i], B = pt.layers[i - 1]; if (A.visible) { B.g.save(); B.g.globalAlpha = A.opacity; B.g.drawImage(A.c, 0, 0); B.g.restore(); } pt.layers.splice(i, 1); pt.active = i - 1; ptMount(); ptLayers(); }
function ptDelLayer() { if (pt.layers.length < 2) return toast('Il faut garder au moins un calque', true); ptSnap(); pt.layers.splice(pt.active, 1); pt.active = Math.max(0, pt.active - 1); ptMount(); ptLayers(); }
function ptLayers() {
  const box = $('ptLayers'); if (!box || !pt.layers.length) return;
  const list = el('div', 'ptLayList'), A = pt.layers[pt.active];
  for (let i = pt.layers.length - 1; i >= 0; i--) {  // le calque du dessus en haut de la liste
    const L = pt.layers[i], r = el('div', 'ptLay' + (i === pt.active ? ' on' : '') + (L.visible ? '' : ' off')), eye = el('button', 'btn px ptEye', L.visible ? '◉' : '○'), nm = el('button', 'ptLayName', L.name);
    eye.title = L.visible ? 'Cacher ce calque' : 'Montrer ce calque'; eye.onclick = () => { ptSnap(); L.visible = !L.visible; ptMount(); ptLayers(); };
    nm.title = 'Clic : dessiner sur ce calque. Double-clic : le renommer'; nm.onclick = () => { pt.active = i; ptMount(); ptLayers(); };
    nm.ondblclick = async () => { const v = await ask('NOM DU CALQUE', L.name, ''); if (v && v.trim()) { L.name = v.trim().slice(0, 40); ptLayers(); } };
    r.append(eye, nm); list.append(r);
  }
  const btn = (t, title, f, id) => { const x = el('button', 'btn px', t); x.title = title; x.onclick = f; if (id) x.id = id; return x; };
  const acts = el('div', 'ptLayActs'); acts.append(btn('+', 'Nouveau calque transparent', () => ptAddLayer(), 'ptLayAdd'), btn('⧉', 'Dupliquer le calque', ptDupLayer, 'ptLayDup'), btn('↑', 'Monter le calque', () => ptMoveLayer(1)), btn('↓', 'Descendre le calque', () => ptMoveLayer(-1)), btn('⤓', 'Fusionner avec le calque du dessous', ptMergeDown, 'ptLayMerge'), btn('✕', 'Supprimer le calque', ptDelLayer, 'ptLayDel'));
  const op = el('input'), opv = el('span', 'hint', Math.round(A.opacity * 100) + ' %'), opRow = el('div', 'ptOp'); op.type = 'range'; op.min = 0; op.max = 100; op.value = Math.round(A.opacity * 100); op.title = 'Opacité du calque';
  op.onpointerdown = () => ptSnap(); op.oninput = () => { A.opacity = op.value / 100; A.c.style.opacity = A.opacity; opv.textContent = op.value + ' %'; };
  opRow.append(el('span', 'hint', 'Opacité'), op, opv);
  box.replaceChildren(el('span', 'label', 'Calques (' + pt.layers.length + ')'), list, acts, opRow);
}
// coller une image du presse-papiers : nouvelle image (Ctrl+V), ou nouveau calque (Ctrl+Maj+V)
let ptPasteLayer = false;
async function ptPasteBlob(blob, asLayer) {
  const url = URL.createObjectURL(blob);
  if (asLayer && pt.ready) { const img = new Image(); img.onload = () => { const L = ptAddLayer('Image collée'); L.g.drawImage(img, 0, 0); URL.revokeObjectURL(url); toast('Image collée dans un nouveau calque'); }; img.src = url; return; }
  if (pt.dirty && !await nbConfirm("L'image actuelle n'est pas enregistrée. La remplacer par l'image collée ?")) return;
  ptLoad(url, 'Image collée');
}
document.addEventListener('paste', e => {
  if (!view.classList.contains('on') || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
  const it = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/')); const asLayer = ptPasteLayer; ptPasteLayer = false; if (!it) return;
  e.preventDefault(); ptPasteBlob(it.getAsFile(), asLayer);
});
$('ptPasteBtn').onclick = async () => {
  try { for (const item of await navigator.clipboard.read()) { const t = item.types.find(x => x.startsWith('image/')); if (t) return ptPasteBlob(await item.getType(t), false); } toast("Pas d'image dans le presse-papiers : copie une image, puis clique sur Coller (ou Ctrl+V)", true); }
  catch { toast('Copie une image, puis fais Ctrl+V ici', true); }
};
function ptSide() {
  $('ptTools').replaceChildren(...PT_TOOLS.map(([id, name, key]) => { const b = el('button', 'btn px ptTool' + (pt.tool === id ? ' on' : '')); b.append(ptIcon(id), name); b.title = name + ' (' + key + ')'; b.onclick = () => { pt.tool = id; ptSide(); }; return b; }));
  $('ptColor').value = pt.color; $('ptSizeIn').value = pt.size; $('ptSizeVal').textContent = pt.size + ' px'; $('ptFillIn').checked = pt.fill; $('ptPixel').checked = pt.pixel;
  $('ptPal').replaceChildren(...PT_PALETTE.map(c => { const s = el('button', 'sw' + (c === pt.color ? ' on' : '')); s.style.setProperty('--ec', c); s.title = c; s.onclick = () => { pt.color = c; ptSide(); }; return s; }));
  ptLayers();
  ptO.style.cursor = pt.tool === 'picker' || pt.tool === 'fill' ? 'var(--cp, pointer)' : pt.tool === 'text' ? 'text' : 'crosshair';
}
function ptFitHeight() { const m = view.querySelector('.ptMain'); if (m && view.classList.contains('on')) m.style.height = Math.max(320, innerHeight - m.getBoundingClientRect().top - 2) + 'px'; }  // le dessin, les outils et le côté tiennent dans la fenêtre ; chacun défile s'il le faut
addEventListener('resize', () => { ptFitHeight(); });
function ptOpen() { ptFitHeight(); if (!pt.ready) { pt.ready = true; if (!pt.file) ptNew(); } ptSide(); }
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
// ---------- OpenRaster (.ora) : un zip avec stack.xml, un PNG par calque, l'image fondue et une vignette ----------
const ptCrcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const ptCrc = b => { let c = ~0; for (const x of b) c = ptCrcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
function ptZip(files) {  // sans compression (le PNG l'est déjà) ; « mimetype » d'abord, comme le veut OpenRaster
  const parts = [], dir = []; let off = 0;
  for (const [name, b] of files) {
    const nm = new TextEncoder().encode(name), c = ptCrc(b), h = new DataView(new ArrayBuffer(30)), d = new DataView(new ArrayBuffer(46));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x800, 2], [14, c, 4], [18, b.length, 4], [22, b.length, 4], [26, nm.length, 2]].forEach(([o, v, n]) => n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x800, 2], [16, c, 4], [20, b.length, 4], [24, b.length, 4], [28, nm.length, 2], [42, off, 4]].forEach(([o, v, n]) => n === 4 ? d.setUint32(o, v, true) : d.setUint16(o, v, true));
    parts.push(new Uint8Array(h.buffer), nm, b); dir.push(new Uint8Array(d.buffer), nm); off += 30 + nm.length + b.length;
  }
  const size = dir.reduce((a, x) => a + x.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...dir, new Uint8Array(e.buffer)], {type: 'image/openraster'});
}
async function ptUnzip(buf) {  // lit le répertoire central ; entrées sans compression ou en deflate (Krita, GIMP)
  const u = new Uint8Array(buf), dv = new DataView(buf); let e = u.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('ce n\'est pas un fichier .ora'); const out = {}; let p = dv.getUint32(e + 16, true);
  for (let i = 0, n = dv.getUint16(e + 10, true); i < n; i++) {
    const meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u.subarray(p + 46, p + 46 + nl)), start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = u.subarray(start, start + csz);
    out[name] = meth === 8 ? new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()) : raw;
    p += 46 + nl + xl + cl;
  }
  return out;
}
const ptPng = c => new Promise(ok => c.toBlob(b => b.arrayBuffer().then(a => ok(new Uint8Array(a))), 'image/png'));
const ptXml = v => String(v).replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
async function ptOraBlob() {
  const files = [['mimetype', new TextEncoder().encode('image/openraster')]], W = ptO.width, H = ptO.height;
  const stack = [...pt.layers].reverse().map((L, i) => '<layer name="' + ptXml(L.name) + '" src="data/calque' + i + '.png" x="0" y="0" opacity="' + L.opacity + '" visibility="' + (L.visible ? 'visible' : 'hidden') + '"/>').join('');
  files.push(['stack.xml', new TextEncoder().encode('<?xml version="1.0" encoding="UTF-8"?><image version="0.0.3" w="' + W + '" h="' + H + '"><stack>' + stack + '</stack></image>')]);
  for (const [i, L] of [...pt.layers].reverse().entries()) files.push(['data/calque' + i + '.png', await ptPng(L.c)]);
  const flat = ptFlat(), th = document.createElement('canvas'), k = Math.min(1, 256 / Math.max(W, H)); th.width = Math.max(1, Math.round(W * k)); th.height = Math.max(1, Math.round(H * k)); th.getContext('2d').drawImage(flat, 0, 0, th.width, th.height);
  files.push(['mergedimage.png', await ptPng(flat)], ['Thumbnails/thumbnail.png', await ptPng(th)]);
  return ptZip(files);
}
async function ptOraLoad(buf, name) {
  const z = await ptUnzip(buf), xml = new DOMParser().parseFromString(new TextDecoder().decode(z['stack.xml'] || new Uint8Array()), 'application/xml'), im = xml.querySelector('image');
  if (!im) throw new Error('stack.xml absent'); const W = +im.getAttribute('w'), H = +im.getAttribute('h'); if (!(W > 0 && H > 0)) throw new Error('taille absente');
  const list = [...xml.querySelectorAll('stack > layer')].reverse(), layers = [];  // dans stack.xml, le calque du dessus vient en premier
  for (const q of list) { const b = z[q.getAttribute('src')]; if (!b) continue; const bmp = await createImageBitmap(new Blob([b], {type: 'image/png'})), L = ptLayer(q.getAttribute('name') || 'Calque', W, H);
    L.g.drawImage(bmp, +q.getAttribute('x') || 0, +q.getAttribute('y') || 0); L.opacity = q.hasAttribute('opacity') ? +q.getAttribute('opacity') : 1; L.visible = q.getAttribute('visibility') !== 'hidden'; layers.push(L); }
  if (!layers.length) throw new Error('aucun calque lisible');
  ptStart(W, H, layers[0].name, g => g.drawImage(layers[0].c, 0, 0)); Object.assign(pt.layers[0], {opacity: layers[0].opacity, visible: layers[0].visible});
  pt.layers.push(...layers.slice(1)); pt.active = pt.layers.length - 1; pt.file = ''; ptMount(); ptLayers(); $('ptName').textContent = name; return pt.layers.length;
}
{
  const oraIn = Object.assign(document.createElement('input'), {type: 'file', accept: '.ora', hidden: true});
  oraIn.onchange = async () => { const f = oraIn.files[0]; oraIn.value = ''; if (!f) return; if (pt.dirty && !await nbConfirm("L'image actuelle n'est pas enregistrée. Ouvrir ce fichier ?")) return;
    try { const n = await ptOraLoad(await f.arrayBuffer(), f.name); toast(f.name + ' ouvert : ' + n + ' calque(s)'); } catch (e) { toast('Impossible d\'ouvrir ce .ora : ' + e.message, true); } };
  const mk = (t, tip, fn) => { const b = el('button', 'btn px', t); b.title = tip; b.onclick = fn; return b; };
  $('ptSaveBtn').after(mk('Calques .ora', 'Enregistrer avec tous les calques (OpenRaster : Krita, GIMP, MyPaint)', async () => {
    const a = el('a'); a.href = URL.createObjectURL(await ptOraBlob()); a.download = ($('ptName').textContent || 'dessin').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]/g, '') + '.ora'; document.body.append(a); a.click(); a.remove(); pt.dirty = false; toast('Calques enregistrés dans Téléchargements (.ora)'); }),
    mk('Ouvrir .ora', 'Ouvrir un fichier à calques OpenRaster', () => oraIn.click()), oraIn);
}
view.__pt = {pt, oraBlob: ptOraBlob, oraLoad: ptOraLoad, unzip: ptUnzip, dot: ptDot, stroke: ptStroke};  // pour le test « local »
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
  if (e.ctrlKey && k === 'v') ptPasteLayer = e.shiftKey;  // le collage arrive juste après, par l'événement « paste »
  else if (e.ctrlKey && k === 'z') { e.preventDefault(); ptRestore(pt.undo, pt.redo); }
  else if (e.ctrlKey && k === 'y') { e.preventDefault(); ptRestore(pt.redo, pt.undo); }
  else if (e.ctrlKey && k === 's') { e.preventDefault(); ptSave(); }
  else if (k === 'delete') PT_OPS.clearSel();
  else if (k === 'escape') { pt.sel = null; ptOverlay(); }
  else if (!e.ctrlKey && !e.altKey) { const t = PT_TOOLS.find(t => t[2].toLowerCase() === k); if (t) { pt.tool = t[0]; ptSide(); } }
});  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onFiles(files => files[0] && ptOpenPath(files[0]));  // « ouvrir avec » : Fichiers, Visionneuse
  ptO.__pt = {pt, flat: ptFlat, ptNew};  // pour le test
  ctx.onOpen(() => { ptOpen(); });
}
