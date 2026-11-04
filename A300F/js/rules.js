/* A300F Simulator · Prüfregeln
   Reine Funktionen ohne 3D und ohne Oberfläche. Maße in cm, Gewichte in kg.
   Jede Meldung trägt rule: 'ok' (aus geprüften Daten), 'doc', 'conflict', 'train' oder 'unver'. */
window.A300F = window.A300F || {};
(function (A) {
  'use strict';
  const R = {};
  const f1 = n => (Math.round(n * 10) / 10).toLocaleString('de-DE');
  const kg = n => Math.round(n).toLocaleString('de-DE');

  /* Erlaubter Bereich quer [min, max] in einer Höhe h für ein konvexes Polygon */
  R.spanAt = function (poly, h) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
      if (h < y0 - 1e-6 || h > y1 + 1e-6) continue;
      if (Math.abs(b[1] - a[1]) < 1e-9) { lo = Math.min(lo, a[0], b[0]); hi = Math.max(hi, a[0], b[0]); continue; }
      const t = (h - a[1]) / (b[1] - a[1]), x = a[0] + (b[0] - a[0]) * t;
      lo = Math.min(lo, x); hi = Math.max(hi, x);
    }
    return lo === Infinity ? null : [lo, hi];
  };

  /* Liegt der Querschnitt eines Packstücks in der Kontur? Prüft Unter und Oberkante und alle Knickhöhen dazwischen. */
  R.contourFit = function (poly, z0, z1, y0, y1) {
    const hs = [y0, y1];
    poly.forEach(p => { if (p[1] > y0 && p[1] < y1) hs.push(p[1]); });
    let worst = null;
    for (const h of hs) {
      const s = R.spanAt(poly, h);
      if (!s) { worst = {side:'oben', over:h - Math.max(...poly.map(p => p[1])), h}; continue; }
      const left = s[0] - z0, right = z1 - s[1];
      if (left > 0.05 && (!worst || left > worst.over)) worst = {side:'links', over:left, h};
      if (right > 0.05 && (!worst || right > worst.over)) worst = {side:'rechts', over:right, h};
    }
    return worst;
  };

  R.footprint = p => p.rot ? {L:p.w, W:p.l} : {L:p.l, W:p.w};

  /* Schwerkraft: Packstücke von unten nach oben absetzen */
  R.settle = function (pieces) {
    const order = pieces.filter(p => !p.unplaced).sort((a, b) => (a.y - b.y) || (a.id - b.id));
    const done = [];
    for (const p of order) {
      const f = R.footprint(p); let y = 0;
      for (const q of done) {
        const g = R.footprint(q);
        if (p.x < q.x + g.L - 0.01 && p.x + f.L > q.x + 0.01 && p.z < q.z + g.W - 0.01 && p.z + f.W > q.z + 0.01) y = Math.max(y, q.y + q.h);
      }
      p.y = y; done.push(p);
    }
    return pieces;
  };

  /* Auflage: welcher Anteil der Unterseite liegt auf, und auf wem */
  R.support = function (p, pieces) {
    if (p.y < 0.5) return {ratio:1, on:[]};
    const f = R.footprint(p); let area = 0; const on = [];
    for (const q of pieces) {
      if (q === p || q.unplaced || Math.abs(q.y + q.h - p.y) > 0.5) continue;
      const g = R.footprint(q);
      const ox = Math.min(p.x + f.L, q.x + g.L) - Math.max(p.x, q.x), oz = Math.min(p.z + f.W, q.z + g.W) - Math.max(p.z, q.z);
      if (ox > 0 && oz > 0) { area += ox * oz; on.push(q); }
    }
    return {ratio:Math.min(1, area / (f.L * f.W)), on};
  };

  /* Automatisch stapeln. Probiert mehrere Reihenfolgen, packt von der Innenwand aus (unten, vorne, innen)
     und nimmt das Ergebnis mit den wenigsten übrigen Teilen und dem niedrigsten Aufbau. Raster 5 cm. */
  function placeAll(list, C){
    const step = 5, placed = [];
    for (const p of list){
      let best = null;
      for (const rot of [0, 1]){
        const L = rot ? p.w : p.l, W = rot ? p.l : p.w;
        if (L > C.len + 0.1 || W > C.wid + 0.1) continue;
        for (let x = 0; x <= C.len - L + 0.01; x += step) for (let z = 0; z <= C.wid - W + 0.01; z += step){
          let y = 0;
          for (const q of placed){ const g = R.footprint(q); if (x < q.x + g.L - 0.01 && x + L > q.x + 0.01 && z < q.z + g.W - 0.01 && z + W > q.z + 0.01){ const t = q.y + q.h; if (t > y) y = t; } }
          if (best && y * 10000 + x * 10 + z >= best.score) continue;
          if (y > 0){
            let area = 0, ok = true;
            for (const q of placed){
              if (Math.abs(q.y + q.h - y) > 0.5) continue; const g = R.footprint(q);
              const ox = Math.min(x + L, q.x + g.L) - Math.max(x, q.x), oz = Math.min(z + W, q.z + g.W) - Math.max(z, q.z);
              if (ox > 0 && oz > 0){ area += ox * oz; if (!q.stack) ok = false; }
            }
            if (!ok || area / (L * W) < A.TRAIN.support.v) continue;
          }
          if (R.contourFit(C.poly, z, z + W, y, y + p.h)) continue;
          best = {score:y * 10000 + x * 10 + z, x, z, y, rot};
        }
      }
      if (best){ p.x = best.x; p.z = best.z; p.y = best.y; p.rot = best.rot; p.unplaced = false; placed.push(p); }
      else { p.unplaced = true; p.x = 0; p.z = 0; p.y = 0; p.rot = 0; }
    }
  }
  R.autoPlace = function (build) {
    const C = A.CONTOURS[build.contour]; if (!C) return build;
    const area = p => p.l * p.w, vol = p => p.l * p.w * p.h;
    const orders = [
      (a, b) => (b.kg - a.kg) || (area(b) - area(a)),
      (a, b) => (area(b) - area(a)) || (b.kg - a.kg),
      (a, b) => (vol(b) - vol(a)) || (b.kg - a.kg),
      (a, b) => (a.stack === b.stack ? 0 : a.stack ? -1 : 1) || (b.kg - a.kg),
      (a, b) => ((!b.stack && b.kg > 300) - (!a.stack && a.kg > 300)) || (area(b) - area(a)) || (b.h - a.h),
      (a, b) => (b.h - a.h) || (area(b) - area(a))
    ];
    let best = null;
    for (const cmp of orders){
      const pcs = build.pieces.map(p => Object.assign({}, p));
      placeAll(pcs.slice().sort(cmp), C);
      const un = pcs.filter(p => p.unplaced).length, top = pcs.reduce((m, p) => p.unplaced ? m : Math.max(m, p.y + p.h), 0);
      const score = un * 1e6 + top;
      if (!best || score < best.score) best = {score, pcs};
    }
    build.pieces.forEach((p, i) => { const q = best.pcs[i]; p.x = q.x; p.y = q.y; p.z = q.z; p.rot = q.rot; p.unplaced = q.unplaced; });
    R.settle(build.pieces);
    return build;
  };

  /* Volle Prüfung eines Aufbaus */
  R.checkBuild = function (build) {
    const U = A.ULD[build.uld], C = A.CONTOURS[build.contour];
    const res = {piece:{}, list:[], totals:{}};
    if (!U || !C) return res;
    const add = (id, lvl, txt, rule) => { const m = {id, lvl, txt, rule}; res.list.push(m); if (id != null) (res.piece[id] = res.piece[id] || []).push(m); };
    const pcs = build.pieces;
    let cargo = 0, vol = 0, mx = 0, mz = 0, top = 0;
    let unKg = 0, unN = 0;
    for (const p of pcs) {
      const f = R.footprint(p), tag = '#' + p.id;
      if (p.unplaced){ unKg += p.kg; unN++; add(p.id, 'bad', `${tag} passt nicht mehr in die Kontur und ist nicht geladen. Kleiner packen, drehen, kippen oder eine andere ULD nehmen.`, 'ok'); continue; }
      cargo += p.kg; vol += p.l * p.w * p.h / 1e6; mx += p.kg * (p.x + f.L / 2); mz += p.kg * (p.z + f.W / 2); top = Math.max(top, p.y + p.h);
      if (p.x < -0.05) add(p.id, 'bad', `${tag} steht ${f1(-p.x)} cm vorne über die Kante.`, 'ok');
      if (p.x + f.L > C.len + 0.05) add(p.id, 'bad', `${tag} steht ${f1(p.x + f.L - C.len)} cm hinten über die Kante (Länge erlaubt ${f1(C.len)} cm).`, 'ok');
      if (p.z < -0.05) add(p.id, 'bad', `${tag} steht ${f1(-p.z)} cm seitlich über die Kante.`, 'ok');
      if (p.z + f.W > C.wid + 0.05) add(p.id, 'bad', `${tag} steht ${f1(p.z + f.W - C.wid)} cm seitlich über die Kante (Breite erlaubt ${f1(C.wid)} cm).`, 'ok');
      if (p.y + p.h > C.hMax + 0.05) add(p.id, 'bad', `${tag} ist ${f1(p.y + p.h - C.hMax)} cm zu hoch. Oberkante ${f1(p.y + p.h)} cm, erlaubt ${f1(C.hMax)} cm.`, C.st.h);
      else {
        const w = R.contourFit(C.poly, Math.max(0, p.z), Math.min(C.wid, p.z + f.W), p.y, p.y + p.h);
        if (w && w.side !== 'oben') add(p.id, 'bad', `${tag} ragt ${f1(w.over)} cm ${w.side} über die Konturschräge (in ${f1(w.h)} cm Höhe).`, C.st.shape);
      }
      const sup = R.support(p, pcs);
      if (p.y > 0.5 && sup.ratio < A.TRAIN.support.v) add(p.id, 'warn', `${tag} liegt nur zu ${Math.round(sup.ratio * 100)} % auf. Kippgefahr.`, 'train');
      sup.on.forEach(q => { if (!q.stack) add(p.id, 'bad', `${tag} steht auf #${q.id}. Das ist nicht stapelbar.`, 'ok'); });
      const load = p.kg / (f.L * f.W / 1e4);
      if (load > A.TRAIN.floorLoad.v && !(build.spreader && p.y < 0.5)) add(p.id, 'warn', `${tag} drückt mit ${kg(load)} kg/m² auf den Boden. Über ${kg(A.TRAIN.floorLoad.v)} kg/m² eine Lastverteilplatte nutzen.`, 'train');
      if (p.cat === 'dgr' && !p.dg) add(p.id, 'info', `${tag} ist Gefahrgut ohne Klasse.`, 'ok');
      if (p.awb) { const a = A.awbCheck(p.awb); if (!a.ok) add(p.id, 'info', `${tag} ${a.msg}.`, 'ok'); }
    }
    // Überlappung bei gleicher Höhe (nach Handverschiebung)
    for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) {
      const a = pcs[i], b = pcs[j]; if (a.unplaced || b.unplaced) continue; const fa = R.footprint(a), fb = R.footprint(b);
      const ox = Math.min(a.x + fa.L, b.x + fb.L) - Math.max(a.x, b.x), oz = Math.min(a.z + fa.W, b.z + fb.W) - Math.max(a.z, b.z), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 0.5 && oz > 0.5 && oy > 0.5) add(b.id, 'bad', `#${a.id} und #${b.id} stecken ineinander.`, 'ok');
    }
    // Gewichte
    const tare = U.tare.v;
    const net = pcs.length && U.kind === 'pallet' ? U.net.v + (build.straps || 0) * A.TRAIN.strap.v : 0;
    let spr = 0;
    if (build.spreader) pcs.forEach(p => { if (!p.unplaced && p.y < 0.5) { const f = R.footprint(p); if (p.kg / (f.L * f.W / 1e4) > A.TRAIN.floorLoad.v) spr += A.TRAIN.spreader.v * f.L * f.W / 1e4; } });
    const gross = cargo + tare + net + spr;
    const mgw = U.mgw[C.deck];
    if (gross > mgw.v) add(null, 'bad', `ULD wiegt ${kg(gross)} kg. Erlaubt sind ${kg(mgw.v)} kg für ${build.uld} im ${C.deck === 'main' ? 'Hauptdeck' : 'Unterdeck'}.`, mgw.st);
    if (cargo > 0) {
      const zc0 = C.container ? (C.poly[0][0] + C.poly[1][0]) / 2 : C.wid / 2, zw = C.container ? C.poly[1][0] - C.poly[0][0] : C.wid;
      const cx = mx / cargo / C.len - 0.5, cz = (mz / cargo - zc0) / zw;
      if (Math.abs(cx) > A.TRAIN.cgOffset.v || Math.abs(cz) > A.TRAIN.cgOffset.v) add(null, 'warn', `Schwerpunkt der Ladung liegt ${Math.round(Math.abs(cx) * 100)} % längs und ${Math.round(Math.abs(cz) * 100)} % quer neben der Mitte. Schwere Stücke mittiger stellen.`, 'train');
      res.totals.cg = {x:mx / cargo, z:mz / cargo};
    }
    const contourVol = R.polyArea(C.poly) * C.len / 1e6;
    res.totals = Object.assign(res.totals, {cargo, tare, net, spr, gross, mgw:mgw.v, vol, contourVol, util:contourVol ? vol / contourVol : 0, top, count:pcs.length - unN, unN, unKg});
    if (pcs.length - unN > 0 && U.kind === 'pallet' && !build.secured) add(null, 'info', 'Ladung noch nicht gesichert. Netz und Gurte anlegen.', 'ok');
    const rank = {bad:0, warn:1, info:2};
    res.list.sort((a, b) => rank[a.lvl] - rank[b.lvl]);
    return res;
  };

  R.polyArea = function (poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };

  /* Passt die ULD durch die Tür? */
  R.doorCheck = function (uld, contourId, loadH, door) {
    const U = A.ULD[uld], C = A.CONTOURS[contourId], D = A.AIRCRAFT.doors[door];
    if (!U || !D) return null;
    const shortSide = Math.min(U.base.a, U.base.b), h = U.kind === 'container' ? U.height : (loadH || (C ? C.hMax : 0)) + U.thick;
    const okW = shortSide <= D.w * 100, okH = h <= D.h * 100;
    return {ok:okW && okH, st:D.st, msg:okW && okH
      ? `Passt durch die Tür (${f1(shortSide)} cm von ${f1(D.w * 100)} cm Breite, ${f1(h)} cm von ${f1(D.h * 100)} cm Höhe).`
      : `Passt nicht durch die Tür. ${okW ? '' : `Breite ${f1(shortSide)} cm, Tür ${f1(D.w * 100)} cm. `}${okH ? '' : `Höhe ${f1(h)} cm, Tür ${f1(D.h * 100)} cm.`}`};
  };

  /* Darf diese ULD auf diese Position? */
  R.positionCheck = function (pos, entry) {
    const out = [];
    if (!entry || !entry.uld || entry.uld === 'BULK') return out;
    const U = A.ULD[entry.uld];
    if (!pos.uld.includes(entry.uld)) out.push({lvl:'bad', txt:`${entry.uld} ist auf ${pos.id} nicht erlaubt. Erlaubt ${pos.uld.join(', ')}.`, rule:'ok'});
    if (entry.contour && pos.contour && entry.contour !== pos.contour) out.push({lvl:'bad', txt:`Die ULD wurde für "${(A.CONTOURS[entry.contour] || {}).name}" gebaut. ${pos.id} braucht "${(A.CONTOURS[pos.contour] || {}).name}".`, rule:'unver'});
    if (U) {
      const m = U.mgw[pos.deck === 'main' ? 'main' : 'lower'];
      if (+entry.kg > m.v) out.push({lvl:'bad', txt:`${kg(entry.kg)} kg ist mehr als erlaubt für ${entry.uld} im ${pos.deck === 'main' ? 'Hauptdeck' : 'Unterdeck'} (${kg(m.v)} kg).`, rule:m.st});
      if (entry.kg && +entry.kg < U.tare.v) out.push({lvl:'info', txt:`Das Gewicht ist kleiner als das Eigengewicht der ${entry.uld} (${kg(U.tare.v)} kg). Bruttogewicht eintragen.`, rule:'ok'});
      const d = R.doorCheck(entry.uld, pos.contour, entry.loadH, pos.door || pos.comp);
      if (d && !d.ok) out.push({lvl:'bad', txt:d.msg, rule:d.st});
    }
    return out;
  };

  /* Gewicht und Schwerpunkt, Trainingsrechnung */
  R.weights = function (items, inp) {
    const AC = A.AIRCRAFT;
    const deck = {main:0, lfwd:0, laft:0, bulk:0};
    let payload = 0, mom = 0;
    items.forEach(it => { deck[it.zone] += it.kg; payload += it.kg; mom += it.kg * it.arm; });
    const oew = +inp.oew || 0, tof = +inp.tof || 0, trip = +inp.trip || 0;
    const zfw = oew + payload, tow = zfw + tof, lw = tow - trip;
    const cg = (oew * inp.oewArm + mom + tof * inp.fuelArm) / Math.max(1, oew + payload + tof);
    return {deck, payload, zfw, tow, lw, cg, payloadCg:payload ? mom / payload : null,
      lim:{mzfw:AC.mzfw.v, mtow:AC.mtow.v, mlw:AC.mlw.v},
      over:{zfw:zfw > AC.mzfw.v, tow:tow > AC.mtow.v, lw:lw > AC.mlw.v},
      maxPayload:AC.mzfw.v - oew};
  };

  A.rules = R;
})(window.A300F);
