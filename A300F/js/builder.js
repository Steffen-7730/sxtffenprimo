/* A300F Simulator · ULD Aufbau
   Eigene 3D Ansicht für eine ULD. Nutzt A300F.ULD, A300F.CONTOURS und A300F.rules.
   Verbindung zur Haupt App über ctx: {cats, catOrder, getBuild, setBuild, save, positions, assign, onChange} */
window.A300F = window.A300F || {};
(function (A) {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const kg = n => Math.round(n).toLocaleString('de-DE');
  const f1 = n => (Math.round(n * 10) / 10).toLocaleString('de-DE');
  const R = () => A.rules;
  let ctx = null, root = null, V = null, sel = null, drag = null, last = null;

  const SCEN = [
    {id:'s1', title:'PAG für das Hauptdeck links', goal:'Baue eine PAG für eine linke Position im Hauptdeck. Alles muss in die Kontur, die Maschine darf nichts tragen, am Ende Netz und Gurte anlegen und auf eine linke Position übernehmen.',
     uld:'PAG', contour:'MD_SBS_L', needAssign:true,
     pieces:[[120,80,100,180,3,'gen','Karton',true,false],[100,100,80,260,4,'gen','Kiste',true,false],[150,110,120,950,1,'gen','Kiste',false,true],[60,40,40,25,8,'xps','Karton',true,false]]},
    {id:'s2', title:'PMC mit einer zu hohen Kiste', goal:'Die lange Kiste ist 215 cm hoch, die Kontur erlaubt nur 208 cm. Finde eine Lösung, ohne die Kontur zu verletzen. Tipp: Die Kiste darf gekippt werden.',
     uld:'PMC', contour:'MD_SR', needAssign:false,
     pieces:[[100,60,215,320,1,'gen','Kiste',false,false],[120,100,100,410,6,'gen','Palette (Holz)',true,false],[80,60,60,90,6,'per','Karton',true,true]]},
    {id:'s3', title:'AKE mit Gefahrgut Klasse 9', goal:'Fülle einen AKE für das Unterdeck. Zwei Kartons sind Lithium Batterien (Klasse 9, UN3481). Trag Klasse und UN Nummer ein. Alles muss in die Innenkontur passen.',
     uld:'AKE', contour:'AKE', needAssign:false,
     pieces:[[50,40,40,15,10,'gen','Karton',true,false],[40,30,30,12,2,'dgr','Karton',true,true],[120,80,60,140,1,'gen','Kiste',true,false]]},
    {id:'s4', title:'Zu schwer für das Unterdeck', goal:'Diese PAG soll ins Unterdeck. Prüfe das Gesamtgewicht gegen die Grenze im Unterdeck. Nimm so viele Teile weg, bis es passt.',
     uld:'PAG', contour:'LD_PAL', needAssign:false,
     pieces:[[120,100,70,620,7,'gen','Kiste',true,false],[100,80,50,180,2,'gen','Kiste',true,false]]}
  ];

  function newBuild(uld, contour){ return {uld, contour, num:'', pieces:[], spreader:false, secured:false, straps:4, nextId:1, scenario:null}; }
  function B(){ let b = ctx.getBuild(); if (!b || !A.ULD[b.uld] || !A.CONTOURS[b.contour]){ b = newBuild('PAG', 'MD_SBS_L'); ctx.setBuild(b); } return b; }
  function contoursFor(uld){ return Object.entries(A.CONTOURS).filter(([, c]) => c.ulds.includes(uld)); }
  function changed(resettle){ const b = B(); if (resettle) R().settle(b.pieces); ctx.save(); refresh(); }

  /* ---------- 3D ---------- */
  function initView(){
    if (typeof THREE === 'undefined' || !THREE.OrbitControls) return null;
    const stage = root.querySelector('#b-stage');
    let renderer; try { renderer = new THREE.WebGLRenderer({antialias:true, alpha:true}); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0, 0);
    renderer.domElement.className = 'bgl'; stage.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.1; controls.screenSpacePanning = true; controls.minDistance = 1.2; controls.maxDistance = 20;
    scene.add(new THREE.HemisphereLight(0xe6f0ff, 0x223040, 1.0));
    const d = new THREE.DirectionalLight(0xffffff, 0.7); d.position.set(3, 6, 4); scene.add(d);
    const grid = new THREE.GridHelper(10, 20, 0x30475a, 0x1c2b38); grid.material.transparent = true; grid.material.opacity = 0.6; scene.add(grid);
    const v = {renderer, scene, camera, controls, stage, grp:new THREE.Group(), pcs:new THREE.Group(), deco:new THREE.Group(), meshes:{}, ray:new THREE.Raycaster(), dirty:true};
    scene.add(v.grp, v.pcs, v.deco);
    new ResizeObserver(() => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); v.dirty = true; }).observe(stage);
    const tick = () => { requestAnimationFrame(tick); if (controls.update()) v.dirty = true; if (v.dirty && !document.hidden){ v.dirty = false; renderer.render(scene, camera); } };
    requestAnimationFrame(tick);
    bindPointer(v);
    return v;
  }
  const M = () => ({len:A.CONTOURS[B().contour].len, wid:A.CONTOURS[B().contour].wid, th:(A.ULD[B().uld].thick || 0) / 100});
  function toW(x, y, z){ const m = M(); return new THREE.Vector3(x / 100 - m.len / 200, y / 100 + m.th, z / 100 - m.wid / 200); }

  function extrudePoly(poly, len, mat, edgeMat, th){
    const C = A.CONTOURS[B().contour], s = new THREE.Shape();
    poly.forEach((p, i) => { const u = -(p[0] / 100 - C.wid / 200), w = p[1] / 100 + th; if (i) s.lineTo(u, w); else s.moveTo(u, w); });
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth:len / 100, bevelEnabled:false}); g.rotateY(Math.PI / 2); g.translate(-len / 200, 0, 0);
    const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, mat)); if (edgeMat) grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), edgeMat));
    return grp;
  }
  function buildBase(){
    if (!V) return;
    V.grp.clear();
    const b = B(), U = A.ULD[b.uld], C = A.CONTOURS[b.contour], m = M();
    if (U.kind === 'pallet'){
      const plate = new THREE.Mesh(new THREE.BoxGeometry(C.len / 100, m.th, C.wid / 100), new THREE.MeshStandardMaterial({color:0xb7c2cc, metalness:0.6, roughness:0.4}));
      plate.position.y = m.th / 2; V.grp.add(plate);
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(plate.geometry), new THREE.LineBasicMaterial({color:0x5d6b78})); rim.position.y = m.th / 2; V.grp.add(rim);
    } else {
      V.grp.add(extrudePoly(C.outer, C.len + 4, new THREE.MeshStandardMaterial({color:0xb7c2cc, metalness:0.5, roughness:0.5, transparent:true, opacity:0.16, depthWrite:false, side:THREE.DoubleSide}), new THREE.LineBasicMaterial({color:0x9fb0bf}), 0));
    }
    V.grp.add(extrudePoly(C.poly, C.len, new THREE.MeshBasicMaterial({color:0xf2c200, transparent:true, opacity:0.07, depthWrite:false, side:THREE.DoubleSide}), new THREE.LineBasicMaterial({color:0xf2c200, transparent:true, opacity:0.75}), m.th));
    setView(V.view || 'iso', true);
  }
  function setView(name, instant){
    if (!V) return; V.view = name;
    const C = A.CONTOURS[B().contour], s = Math.max(C.len, C.wid) / 100;
    const P = {iso:[s * 1.25, s * 1.0, s * 1.35], front:[s * 1.9, 0.9, 0.001], top:[0.001, s * 2.1, 0.001], side:[0.001, 0.9, s * 2.0]}[name];
    V.camera.position.set(P[0], P[1], P[2]); V.controls.target.set(0, (C.hMax / 100) * 0.42, 0); V.controls.update(); V.dirty = true;
    root.querySelectorAll('[data-bview]').forEach(x => x.classList.toggle('on', x.dataset.bview === name));
  }
  function drawPieces(res){
    if (!V) return;
    V.pcs.clear(); V.deco.clear(); V.meshes = {};
    const b = B(), C = A.CONTOURS[b.contour];
    for (const p of b.pieces){
      if (p.unplaced) continue;
      const f = R().footprint(p), bad = (res.piece[p.id] || []).some(m => m.lvl === 'bad'), warn = (res.piece[p.id] || []).some(m => m.lvl === 'warn');
      const c = ctx.cats[p.cat] ? ctx.cats[p.cat].color : '#9AA6B2';
      const mat = new THREE.MeshStandardMaterial({color:bad ? 0xe23b3b : c, roughness:0.75, emissive:bad ? 0x6a0000 : 0x000000});
      const geo = new THREE.BoxGeometry(f.L / 100 - 0.004, p.h / 100 - 0.004, f.W / 100 - 0.004);
      const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(toW(p.x + f.L / 2, p.y + p.h / 2, p.z + f.W / 2)); mesh.userData.pid = p.id;
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:sel === p.id ? 0xffd43b : bad ? 0xffb3b3 : warn ? 0xffd28a : 0x0a1118}));
      e.position.copy(mesh.position); if (sel === p.id) e.renderOrder = 5;
      V.pcs.add(mesh, e); V.meshes[p.id] = mesh;
      if (b.spreader && p.y < 0.5 && p.kg / (f.L * f.W / 1e4) > A.TRAIN.floorLoad.v){
        const pl = new THREE.Mesh(new THREE.BoxGeometry(f.L / 100 + 0.12, 0.025, f.W / 100 + 0.12), new THREE.MeshStandardMaterial({color:0xb98a4e}));
        pl.position.copy(toW(p.x + f.L / 2, -0.5, p.z + f.W / 2)); V.deco.add(pl);
      }
    }
    if (b.secured && b.pieces.length && A.ULD[b.uld].kind === 'pallet'){
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, h = 0;
      b.pieces.forEach(p => { if (p.unplaced) return; const f = R().footprint(p); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x + f.L); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z + f.W); h = Math.max(h, p.y + p.h); });
      const a = toW(x0 - 1, 0, z0 - 1), c = toW(x1 + 1, h + 1.5, z1 + 1), pts = [], st = 0.25;
      for (let x = a.x; x <= c.x + 1e-6; x += st){ pts.push(x, c.y, a.z, x, c.y, c.z, x, a.y, a.z, x, c.y, a.z, x, a.y, c.z, x, c.y, c.z); }
      for (let z = a.z; z <= c.z + 1e-6; z += st){ pts.push(a.x, c.y, z, c.x, c.y, z, a.x, a.y, z, a.x, c.y, z, c.x, a.y, z, c.x, c.y, z); }
      for (let y = a.y; y <= c.y + 1e-6; y += st){ pts.push(a.x, y, a.z, c.x, y, a.z, a.x, y, c.z, c.x, y, c.z, a.x, y, a.z, a.x, y, c.z, c.x, y, a.z, c.x, y, c.z); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      V.deco.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({color:0x10241a, transparent:true, opacity:0.9})));
      const n = Math.max(2, b.straps || 4);
      for (let i = 0; i < n; i++){
        const x = a.x + (c.x - a.x) * (i + 0.5) / n, sm = new THREE.MeshBasicMaterial({color:0xff9f1a});
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, c.z - a.z + 0.02), sm); top.position.set(x, c.y + 0.006, (a.z + c.z) / 2); V.deco.add(top);
        [a.z, c.z].forEach(z => { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.05, c.y - a.y, 0.01), sm); sd.position.set(x, (a.y + c.y) / 2, z + (z === a.z ? -0.006 : 0.006)); V.deco.add(sd); });
      }
    }
    V.dirty = true;
  }
  function bindPointer(v){
    const el = v.renderer.domElement;
    const ndc = e => { const r = el.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    el.addEventListener('pointerdown', e => {
      v.ray.setFromCamera(ndc(e), v.camera);
      const h = v.ray.intersectObjects(Object.values(v.meshes), false)[0];
      down = {x:e.clientX, y:e.clientY};
      if (h){
        const id = h.object.userData.pid; sel = id; const p = B().pieces.find(q => q.id === id);
        plane.constant = -h.point.y;
        if (v.ray.ray.intersectPlane(plane, hit)){ const m = M(); drag = {id, dx:(hit.x + m.len / 200) * 100 - p.x, dz:(hit.z + m.wid / 200) * 100 - p.z, moved:false}; }
        v.controls.enabled = false; el.setPointerCapture && el.setPointerCapture(e.pointerId);
        refresh();
      }
    });
    let down = null;
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      v.ray.setFromCamera(ndc(e), v.camera);
      if (!v.ray.ray.intersectPlane(plane, hit)) return;
      const b = B(), p = b.pieces.find(q => q.id === drag.id), m = M(), f = R().footprint(p);
      let nx = Math.round(((hit.x + m.len / 200) * 100 - drag.dx) / 5) * 5, nz = Math.round(((hit.z + m.wid / 200) * 100 - drag.dz) / 5) * 5;
      nx = Math.max(-40, Math.min(m.len - f.L + 40, nx)); nz = Math.max(-40, Math.min(m.wid - f.W + 40, nz));
      if (nx !== p.x || nz !== p.z){ p.x = nx; p.z = nz; p.y = 9999; p.unplaced = false; drag.moved = true; R().settle(b.pieces); if (!last){ last = requestAnimationFrame(() => { last = null; refresh(); }); } }
    });
    const end = e => { if (drag){ drag = null; v.controls.enabled = true; ctx.save(); refresh(); } else if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6){ v.ray.setFromCamera(ndc(e), v.camera); if (!v.ray.intersectObjects(Object.values(v.meshes), false)[0]){ sel = null; refresh(); } } down = null; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  /* ---------- Oberfläche ---------- */
  function ruleTag(r){ const s = A.STATUS[r] || A.STATUS.ok; return `<span class="st ${s.cls}">${s.label}</span>`; }
  function shell(){
    const b = B();
    root.innerHTML = `
    <div class="card" style="display:flex;flex-direction:column;gap:12px">
      <h3 style="font-size:24px">ULD Aufbau</h3>
      <p class="lead">Wähle eine leere ULD, lade Packstücke darauf und prüfe die Kontur. Nach jeder Änderung rechnet das Programm neu. Rote Teile verletzen eine Regel.</p>
      <div class="field"><span class="flabel">ULD Typ</span><div class="chips" id="b-uld">${A.ULD_ORDER.map(k => `<button class="cchip" data-buld="${k}" style="--c:${A.ULD[k].color};--ci:#111B24"><i></i><b>${k}</b>${esc(A.ULD[k].baseIn)}</button>`).join('')}</div></div>
      <label class="field"><span class="flabel">Kontur für Position</span><select id="b-contour"></select></label>
      <div id="b-cinfo" class="src"></div>
      <div class="grid2">
        <label class="field"><span class="flabel">ULD Nummer</span><input type="text" id="b-num" maxlength="16" placeholder="z. B. PAG 12345 XX" autocomplete="off"></label>
        <div class="field"><span class="flabel">Sicherung</span>
          <label class="check"><input type="checkbox" id="b-sec"><span>Netz und Gurte angelegt</span></label>
          <label class="check"><input type="checkbox" id="b-spr"><span>Lastverteilplatte unter schweren Stücken</span></label></div>
      </div>
    </div>
    <div class="bstage" id="b-stage">
      <div class="ov bviews">${[['iso','Schräg'],['front','Kontur'],['top','Oben'],['side','Seite']].map(([k,l]) => `<button class="gbtn" data-bview="${k}">${l}</button>`).join('')}</div>
      <div class="ov bsel" id="b-sel" hidden></div>
      <div class="ov bnogl" id="b-nogl" hidden>3D startet hier nicht. Die Prüfung und die Liste funktionieren trotzdem.</div>
    </div>
    <div class="card" id="b-sum"></div>
    <div id="b-issues"></div>
    <div class="card" style="display:flex;flex-direction:column;gap:12px">
      <div class="sec-title">Packstück hinzufügen</div>
      <div class="grid4">
        <label class="field"><span class="flabel">Länge cm</span><input type="number" id="p-l" min="1" value="120" inputmode="decimal"></label>
        <label class="field"><span class="flabel">Breite cm</span><input type="number" id="p-w" min="1" value="80" inputmode="decimal"></label>
        <label class="field"><span class="flabel">Höhe cm</span><input type="number" id="p-h" min="1" value="100" inputmode="decimal"></label>
        <label class="field"><span class="flabel">Gewicht kg</span><input type="number" id="p-kg" min="0" value="150" inputmode="decimal"></label>
        <label class="field"><span class="flabel">Stückzahl</span><input type="number" id="p-n" min="1" max="60" value="1" inputmode="numeric"></label>
        <label class="field"><span class="flabel">Frachtart</span><select id="p-cat">${ctx.catOrder.filter(k => k !== 'uld').map(k => `<option value="${k}">${ctx.cats[k].code} ${esc(ctx.cats[k].name)}</option>`).join('')}</select></label>
        <label class="field"><span class="flabel">Verpackung</span><select id="p-pack">${A.PACK.map(x => `<option>${esc(x)}</option>`).join('')}</select></label>
        <label class="field"><span class="flabel">AWB Nummer</span><input type="text" id="p-awb" placeholder="z. B. 020-12345675" autocomplete="off"></label>
      </div>
      <div class="grid4" id="p-dgrow" hidden>
        <label class="field"><span class="flabel">Gefahrgut Klasse</span><select id="p-dg"><option value="">wählen</option>${['1.4S','2.1','2.2','3','4.1','4.2','4.3','5.1','5.2','6.1','6.2','7','8','9'].map(c => `<option>${c}</option>`).join('')}</select></label>
        <label class="field"><span class="flabel">UN Nummer</span><input type="text" id="p-un" placeholder="z. B. UN3481" autocomplete="off"></label>
      </div>
      <div class="pos-actions">
        <label class="check"><input type="checkbox" id="p-stack" checked><span>Stapelbar</span></label>
        <label class="check"><input type="checkbox" id="p-up"><span>Diese Seite oben (nicht kippen)</span></label>
      </div>
      <div class="pos-actions"><button class="btn primary" data-bact="add">Hinzufügen und stapeln</button><span class="lead" id="p-msg" style="font-size:13px"></span></div>
    </div>
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="sec-title">Packstücke</div>
      <div class="tablewrap" id="b-table"></div>
      <div class="pos-actions"><button class="btn" data-bact="auto">Automatisch neu stapeln</button><button class="btn danger" data-bact="clear">Alles leeren</button></div>
    </div>
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="sec-title">Auf Position übernehmen</div>
      <p class="lead" style="font-size:14px">Nur Positionen mit passender Kontur und passendem ULD Typ stehen zur Auswahl. Das Programm prüft Gewicht, Tür und Kontur.</p>
      <div class="pos-actions"><select id="b-pos" style="max-width:260px"></select><button class="btn primary" data-bact="assign">Übernehmen</button></div>
      <div id="b-assign"></div>
    </div>
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="sec-title">Lernmodus</div>
      <p class="lead" style="font-size:14px">Übungen mit echten Maßen und Gewichten. Löse sie selbst, dann auf Auswerten tippen.</p>
      <div class="scen">${SCEN.map(s => `<button class="btn" data-scen="${s.id}">${esc(s.title)}</button>`).join('')}</div>
      <div id="b-scen"></div>
    </div>`;
    root.querySelector('#b-num').value = b.num || '';
  }

  function refresh(){
    if (!root) return;
    const b = B(), U = A.ULD[b.uld], C = A.CONTOURS[b.contour];
    root.querySelectorAll('[data-buld]').forEach(x => x.classList.toggle('on', x.dataset.buld === b.uld));
    const sc = root.querySelector('#b-contour');
    sc.innerHTML = contoursFor(b.uld).map(([k, c]) => `<option value="${k}"${k === b.contour ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
    root.querySelector('#b-cinfo').innerHTML = `Grundfläche ${f1(C.len)} × ${f1(C.wid)} cm, Höhe bis ${f1(C.hMax)} cm ${ruleTag(C.st.h)} · Form ${ruleTag(C.st.shape)} · ${esc(C.note)}`;
    root.querySelector('#b-sec').checked = !!b.secured; root.querySelector('#b-spr').checked = !!b.spreader;
    root.querySelector('#b-sec').disabled = U.kind !== 'pallet';
    const res = R().checkBuild(b), T = res.totals;
    // Zusammenfassung
    const pct = T.mgw ? Math.min(100, T.gross / T.mgw * 100) : 0;
    root.querySelector('#b-sum').innerHTML = `
      <div class="sum-top"><span class="big-num">${kg(T.gross || 0)}</span><span class="big-unit">kg Gesamt von ${kg(T.mgw || 0)} kg erlaubt (${C.deck === 'main' ? 'Hauptdeck' : 'Unterdeck'}) ${ruleTag(U.mgw[C.deck].st)}</span></div>
      <div class="bar${T.gross > T.mgw ? ' over' : ''}"><span style="width:${pct}%"></span></div>
      <dl class="facts">
        <div><dt>Fracht</dt><dd class="num">${kg(T.cargo || 0)} kg, ${T.count || 0} Stück</dd></div>
        <div><dt>Eigengewicht ${b.uld}</dt><dd class="num">${kg(T.tare || 0)} kg ${ruleTag(U.tare.st)}</dd></div>
        <div><dt>Netz und Gurte</dt><dd class="num">${kg(T.net || 0)} kg ${ruleTag('train')}</dd></div>
        <div><dt>Lastverteilung</dt><dd class="num">${kg(T.spr || 0)} kg</dd></div>
        <div><dt>Volumen Fracht</dt><dd class="num">${f1(T.vol || 0)} m³ von ${f1(T.contourVol || 0)} m³ (${Math.round((T.util || 0) * 100)} %)</dd></div>
        <div><dt>Höchster Punkt</dt><dd class="num">${f1(T.top || 0)} cm von ${f1(C.hMax)} cm</dd></div>
      </dl>`;
    const iss = root.querySelector('#b-issues');
    iss.innerHTML = res.list.length ? `<ul class="warns">${res.list.map(m => `<li class="w w-${m.lvl}"><span class="w-pos">${m.lvl === 'bad' ? 'Stopp' : m.lvl === 'warn' ? 'Achtung' : 'Tipp'}</span><span>${esc(m.txt)} ${ruleTag(m.rule)}</span></li>`).join('')}</ul>`
      : (b.pieces.length ? `<ul class="warns"><li class="w w-ok"><span class="w-pos">OK</span><span>Alles in der Kontur. Gewicht, Auflage und Stapelung passen.</span></li></ul>` : '');
    // Tabelle
    root.querySelector('#b-table').innerHTML = b.pieces.length ? `<table><thead><tr><th>#</th><th>AWB</th><th class="r">L × B × H cm</th><th class="r">kg</th><th>Art</th><th>Verp.</th><th>Stapel</th><th>Status</th><th></th></tr></thead><tbody>${b.pieces.map(p => {
      const ms = res.piece[p.id] || [], bad = ms.some(m => m.lvl === 'bad'), warn = ms.some(m => m.lvl === 'warn'); const c = ctx.cats[p.cat];
      return `<tr data-pid="${p.id}" class="${sel === p.id ? 'sel' : ''}"><td class="mono"><b>${p.id}</b></td><td class="mono">${esc(p.awb || '')}</td><td class="r num">${f1(p.l)} × ${f1(p.w)} × ${f1(p.h)}</td><td class="r num">${kg(p.kg)}</td><td><span class="tchip" style="--c:${c.color};--ci:${c.ink}">${c.code}${p.dg ? ' ' + esc(p.dg) : ''}</span></td><td>${esc(p.pack)}</td><td>${p.stack ? 'ja' : 'nein'}${p.up ? ', oben' : ''}</td><td><span class="dotst ${bad ? 'bad' : warn ? 'warn' : 'ok'}">${bad ? 'Fehler' : warn ? 'Achtung' : 'OK'}</span></td><td><button class="btn sm" data-del="${p.id}" aria-label="Packstück ${p.id} löschen">✕</button></td></tr>`; }).join('')}</tbody></table>` : '<p class="lead" style="padding:12px">Noch keine Packstücke. Unten hinzufügen oder eine Übung im Lernmodus starten.</p>';
    // Auswahl Werkzeug
    const bs = root.querySelector('#b-sel'); const sp = b.pieces.find(p => p.id === sel);
    if (sp){ bs.hidden = false; bs.innerHTML = `<span class="bsel-id">#${sp.id}</span><button class="gbtn" data-mv="-x" aria-label="nach vorne">◀</button><button class="gbtn" data-mv="+x" aria-label="nach hinten">▶</button><button class="gbtn" data-mv="-z" aria-label="nach links">▲</button><button class="gbtn" data-mv="+z" aria-label="nach rechts">▼</button><button class="gbtn" data-mv="rot">Drehen</button><button class="gbtn" data-mv="tilt"${sp.up ? ' disabled' : ''}>Kippen</button><button class="gbtn" data-mv="del">Löschen</button>`; }
    else bs.hidden = true;
    // Positionen
    const ps = ctx.positions().filter(p => p.contour === b.contour && p.uld.includes(b.uld));
    const selPos = root.querySelector('#b-pos'); const prev = selPos.value;
    selPos.innerHTML = ps.length ? ps.map(p => `<option value="${p.id}"${p.id === prev ? ' selected' : ''}>${esc(p.label || p.id)} · ${p.deck === 'main' ? 'Hauptdeck' : 'Unterdeck'}${ctx.occupied(p.id) ? ' (belegt)' : ''}</option>`).join('') : '<option value="">Keine passende Position im gewählten Plan</option>';
    if (V){ if (V.key !== b.uld + b.contour){ V.key = b.uld + b.contour; buildBase(); } drawPieces(res); }
    root.querySelector('#p-dgrow').hidden = root.querySelector('#p-cat').value !== 'dgr';
    return res;
  }

  function addPieces(spec){
    const b = B(); const msg = root && root.querySelector('#p-msg');
    const n = Math.max(1, Math.min(60, Math.round(spec.n || 1)));
    if (!(spec.l > 0 && spec.w > 0 && spec.h > 0) || !(spec.kg >= 0)){ if (msg) msg.textContent = 'Bitte Länge, Breite, Höhe und Gewicht eintragen.'; return; }
    if (b.pieces.length + n > 120){ if (msg) msg.textContent = 'Höchstens 120 Packstücke pro ULD.'; return; }
    for (let i = 0; i < n; i++) b.pieces.push({id:b.nextId++, l:+spec.l, w:+spec.w, h:+spec.h, kg:+spec.kg, cat:spec.cat || 'gen', pack:spec.pack || 'Karton', awb:spec.awb || '', stack:spec.stack !== false, up:!!spec.up, dg:spec.dg || '', un:spec.un || '', x:0, y:9999, z:0, rot:0});
    R().autoPlace(b);
    const un = b.pieces.filter(p => p.unplaced).length;
    if (msg) msg.textContent = un ? `${un} Stück passen nicht mehr in die Kontur.` : `${n} Stück hinzugefügt.`;
    changed();
  }

  function evalScenario(){
    const b = B(), s = SCEN.find(x => x.id === b.scenario), box = root.querySelector('#b-scen'); if (!s) return;
    const res = R().checkBuild(b), bad = res.list.filter(m => m.lvl === 'bad');
    const notes = [];
    if (s.id === 's3') b.pieces.filter(p => p.cat === 'dgr').forEach(p => { if (p.dg !== '9' || !/3481/.test(p.un || '')) notes.push(`#${p.id} braucht Klasse 9 und UN3481. Ohne diese Angaben gibt es keine NOTOC.`); });
    if (s.id === 's1' && !b.assignedTo) notes.push('Noch nicht auf eine linke Hauptdeck Position übernommen.');
    if (A.ULD[b.uld].kind === 'pallet' && !b.secured) notes.push('Netz und Gurte fehlen. Ohne Sicherung fliegt keine Palette.');
    const ok = !bad.length && !notes.length && b.pieces.length;
    box.innerHTML = `<div class="explain" style="--c:${ok ? '#2BB673' : '#E23B3B'}"><i></i><span><b>${ok ? 'Geschafft.' : 'Noch nicht fertig.'}</b> ${ok ? 'Alle Regeln sind eingehalten. Denk dran: Das ist ein Training und keine Ladefreigabe.' : 'Das fehlt noch:'}</span></div>
      ${ok ? '' : `<ul class="plain">${bad.map(m => `<li>${esc(m.txt)} ${ruleTag(m.rule)}</li>`).join('')}${notes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`}`;
  }
  function startScenario(id){
    const s = SCEN.find(x => x.id === id); if (!s) return;
    const b = newBuild(s.uld, s.contour); b.scenario = id; ctx.setBuild(b); sel = null;
    s.pieces.forEach(([l, w, h, k, n, cat, pack, stack, up]) => { for (let i = 0; i < n; i++) b.pieces.push({id:b.nextId++, l, w, h, kg:k, cat, pack, awb:'', stack, up, dg:'', un:'', x:0, y:9999, z:0, rot:0}); });
    R().autoPlace(b); ctx.save(); refresh();
    root.querySelector('#b-scen').innerHTML = `<div class="explain" style="--c:#F2C200"><i></i><span><b>${esc(s.title)}.</b> ${esc(s.goal)}</span></div><div class="pos-actions"><button class="btn primary" data-bact="eval">Auswerten</button></div>`;
  }

  function bind(){
    root.addEventListener('click', e => {
      const t = e.target, b = B();
      const u = t.closest('[data-buld]'); if (u){ if (b.uld !== u.dataset.buld){ b.uld = u.dataset.buld; b.contour = contoursFor(b.uld)[0][0]; R().autoPlace(b); sel = null; changed(); } return; }
      const v = t.closest('[data-bview]'); if (v){ setView(v.dataset.bview); return; }
      const d = t.closest('[data-del]'); if (d){ b.pieces = b.pieces.filter(p => p.id !== +d.dataset.del); if (sel === +d.dataset.del) sel = null; changed(true); return; }
      const sc = t.closest('[data-scen]'); if (sc){ startScenario(sc.dataset.scen); return; }
      const tr = t.closest('tr[data-pid]'); if (tr){ sel = +tr.dataset.pid; refresh(); return; }
      const mv = t.closest('[data-mv]');
      if (mv){
        const p = b.pieces.find(q => q.id === sel); if (!p) return; const a = mv.dataset.mv;
        if (a === 'del'){ b.pieces = b.pieces.filter(q => q !== p); sel = null; changed(true); return; }
        if (a === 'rot') p.rot = p.rot ? 0 : 1;
        else if (a === 'tilt'){ if (p.up) return; const h = p.h; p.h = p.l; p.l = h; }
        else { const s = a[0] === '-' ? -5 : 5; if (a[1] === 'x') p.x += s; else p.z += s; }
        p.y = 9999; p.unplaced = false; changed(true); return;
      }
      const ac = t.closest('[data-bact]'); if (!ac) return; const a = ac.dataset.bact;
      if (a === 'add'){
        const g = id => root.querySelector(id);
        addPieces({l:parseFloat(g('#p-l').value), w:parseFloat(g('#p-w').value), h:parseFloat(g('#p-h').value), kg:parseFloat(g('#p-kg').value), n:parseInt(g('#p-n').value, 10), cat:g('#p-cat').value, pack:g('#p-pack').value, awb:g('#p-awb').value.trim(), stack:g('#p-stack').checked, up:g('#p-up').checked, dg:g('#p-cat').value === 'dgr' ? g('#p-dg').value : '', un:g('#p-cat').value === 'dgr' ? g('#p-un').value.trim() : ''});
      }
      if (a === 'auto'){ b.pieces.forEach(p => { p.y = 9999; }); R().autoPlace(b); changed(); }
      if (a === 'clear'){
        if (ac.classList.contains('armed')){ b.pieces = []; b.secured = false; sel = null; ac.classList.remove('armed'); ac.textContent = 'Alles leeren'; changed(); }
        else { ac.classList.add('armed'); ac.textContent = 'Wirklich leeren?'; setTimeout(() => { ac.classList.remove('armed'); ac.textContent = 'Alles leeren'; }, 3000); }
      }
      if (a === 'assign'){
        const pid = root.querySelector('#b-pos').value, out = root.querySelector('#b-assign');
        if (!pid){ out.innerHTML = '<p class="lead">Im aktuellen Ladeplan gibt es keine Position für diese Kontur. Stell oben im Modell einen anderen Plan ein.</p>'; return; }
        const res = R().checkBuild(b), bad = res.list.filter(m => m.lvl === 'bad');
        const r = ctx.assign(pid, b, res);
        b.assignedTo = pid; ctx.save();
        out.innerHTML = `<ul class="warns">${bad.length ? `<li class="w w-bad"><span class="w-pos">Stopp</span><span>Übernommen, aber der Aufbau hat noch ${bad.length} Fehler. Im echten Betrieb darf diese ULD so nicht fliegen.</span></li>` : ''}${r.map(m => `<li class="w w-${m.lvl}"><span class="w-pos">${m.lvl === 'bad' ? 'Stopp' : 'Tipp'}</span><span>${esc(m.txt)} ${ruleTag(m.rule)}</span></li>`).join('')}<li class="w w-ok"><span class="w-pos">${esc(pid)}</span><span>Im Ladeplan eingetragen mit ${kg(res.totals.gross)} kg brutto.</span></li></ul>`;
      }
      if (a === 'eval') evalScenario();
    });
    root.addEventListener('change', e => {
      const b = B(), t = e.target;
      if (t.id === 'b-contour'){ b.contour = t.value; R().autoPlace(b); sel = null; changed(); }
      if (t.id === 'b-sec'){ b.secured = t.checked; changed(); }
      if (t.id === 'b-spr'){ b.spreader = t.checked; changed(); }
      if (t.id === 'p-cat') root.querySelector('#p-dgrow').hidden = t.value !== 'dgr';
    });
    root.addEventListener('input', e => { if (e.target.id === 'b-num'){ B().num = e.target.value.trim().slice(0, 16); ctx.save(); } });
  }

  A.Builder = {
    mount(el, c){ root = el; ctx = c; B(); shell(); bind(); V = initView(); if (!V) root.querySelector('#b-nogl').hidden = false; refresh(); },
    refresh(){ if (root) refresh(); },
    resize(){ if (V){ const w = V.stage.clientWidth, h = V.stage.clientHeight; if (w && h){ V.renderer.setSize(w, h, false); V.camera.aspect = w / h; V.camera.updateProjectionMatrix(); V.dirty = true; } } },
    openFor(pos, entry){
      let b;
      if (entry && entry.build) b = JSON.parse(JSON.stringify(entry.build));
      else { const uld = entry && entry.uld && entry.uld !== 'BULK' && pos.uld.includes(entry.uld) ? entry.uld : pos.uld[0]; b = newBuild(uld, pos.contour); }
      b.assignedTo = null; ctx.setBuild(b); sel = null; ctx.save(); if (root) refresh();
    },
    scenarios:SCEN
  };
})(window.A300F);
