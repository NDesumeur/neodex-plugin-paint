// lancé par le test « local » de NeoDex : coller une image (nouvelle image, puis dans un calque), puis les calques : dessiner sur deux calques, cacher, annuler, fusionner
module.exports = async ({ pj, sleep }) => {
  const T = `document.getElementById('ptOver').__pt`;
  await sleep(900);
  const paste = (w, h, col) => pj(`(async () => { const c = document.createElement('canvas'); c.width = ${w}; c.height = ${h}; const g = c.getContext('2d'); g.fillStyle = '${col}'; g.fillRect(0, 0, ${w}, ${h});
    const b = await new Promise(r => c.toBlob(r, 'image/png')), dt = new DataTransfer(); dt.items.add(new File([b], 'x.png', {type: 'image/png'})); document.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true})); return 1; })()`);
  const info = () => pj(`(() => { const t = ${T}; return {n: t.pt.layers.length, w: t.pt.layers[0].c.width, names: t.pt.layers.map(L => L.name).join(','), active: t.pt.active}; })()`);
  const px = (x, y) => pj(`[...${T}.flat().getContext('2d').getImageData(${x}, ${y}, 1, 1).data].slice(0, 3).join()`);
  const click = id => pj(`document.getElementById('${id}').click(), 0`);
  await paste(64, 48, '#00ff00'); await sleep(500);
  let s = await info(); if (s.n !== 1 || s.w !== 64 || s.names !== 'Image') throw new Error('coller comme nouvelle image : ' + JSON.stringify(s));
  await pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'V', ctrlKey: true, shiftKey: true, bubbles: true})), 0`); await paste(20, 20, '#ff0000'); await sleep(500);
  s = await info(); if (s.n !== 2 || s.names !== 'Image,Image collée') throw new Error('coller dans un calque : ' + JSON.stringify(s));
  if (await px(5, 5) !== '255,0,0' || await px(40, 40) !== '0,255,0') throw new Error('image collée mal placée');
  // une nouvelle image, deux calques
  await pj(`${T}.ptNew(800, 600), 0`); await sleep(200);
  const drag = (tool, color, a, b2, fill) => pj(`(() => { const t = ${T}, o = document.getElementById('ptOver'), r = o.getBoundingClientRect(), z = t.pt.zoom; Object.assign(t.pt, {tool: '${tool}', color: '${color}', fill: ${!!fill}, size: 14});
    const ev = (k, [x, y]) => o.dispatchEvent(new PointerEvent(k, {clientX: r.left + (x + .5) * z, clientY: r.top + (y + .5) * z, button: 0, pointerId: 1, bubbles: true}));
    ev('pointerdown', ${JSON.stringify(a)}); ev('pointermove', ${JSON.stringify(b2)}); ev('pointerup', ${JSON.stringify(b2)}); })(), 0`);
  await drag('brush', '#e01ec8', [80, 120], [700, 120]);
  await click('ptLayAdd'); await drag('rect', '#3b5bdb', [300, 260], [520, 480], true);
  if (await px(400, 400) !== '59,91,219' || await pj(`[...${T}.pt.layers[0].g.getImageData(400, 400, 1, 1).data].slice(0, 3).join()`) !== '255,255,255') throw new Error('le rectangle n\'est pas dans le calque 2');
  await pj(`document.querySelector('#ptLayers .ptEye').click(), 0`);
  if (await px(400, 400) !== '255,255,255') throw new Error('calque caché encore visible');
  await click('ptUndo'); if (await px(400, 400) !== '59,91,219') throw new Error('annuler ne remontre pas le calque');
  await click('ptLayAdd'); await drag('ellipse', '#ffd07a', [120, 200], [360, 420], true);
  s = await info(); if (s.n !== 3) throw new Error('trois calques attendus : ' + JSON.stringify(s));
  await click('ptLayMerge'); s = await info();
  if (s.n !== 2 || await pj(`[...${T}.pt.layers[1].g.getImageData(240, 310, 1, 1).data].slice(0, 3).join()`) !== '255,208,122') throw new Error('fusion : ' + JSON.stringify(s));
  const over = await pj(`[...document.querySelectorAll('.ptSide *, .ptBar *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length`);
  if (over) throw new Error(over + ' élément(s) débordent à droite');
  return 'coller (image et calque), deux calques, cacher, annuler, fusionner ok';
};
