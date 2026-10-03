(() => {
  // Home stage: the Holdfast mark planted on a soil line. Its legs become a living
  // root system that grips buried stones; light flows down the roots like sap.
  // Roots brighten near the pointer; click to regrow.
  const canvas = document.getElementById('roots-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, DOWN = Math.PI / 2;
  const LIME = [217, 249, 119], VIOLET = [189, 169, 255], BONE = [236, 230, 212], SOIL = [11, 11, 9];
  // The mark, in the 32-unit space of /assets/mark.svg. The soil line sits at y = 19.4.
  const MARK = [
    'M10.5 4.8V20C10.5 23 10.9 25.2 11.4 27.6',
    'M10.5 14C10.5 11 13 9.8 15.8 9.8S21.5 11 21.5 14.5V19',
    'M10.5 19.6C10.3 22.4 8.6 23.8 6.6 25.4',
    'M21.5 19C21.5 22 23.4 23.6 25.6 25.2',
    'M21.5 19.6C21 22.4 19.4 23.8 18.6 26.6',
  ].map((d) => new Path2D(d));
  // The two legs of the h meet the soil here; each sends two roots down.
  const LEGS = [[10.5, DOWN + .5], [10.5, DOWN - .12], [21.5, DOWN - .5], [21.5, DOWN + .14]];

  let w = 0, h = 0, dpr = 1, seed = 11, raf = 0, visible = true;
  let soilY = 0, k = 1, cx = 0;
  let segs = [], roots = [], tips = [], stones = [], ticks = 1;
  let layer = null, drawn = 0, born = 0, pulses = [], motes = [];
  const pointer = { x: -1e4, y: -1e4 };

  const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const turn = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const mix = (c, a) => `rgb(${SOIL[0] + (c[0] - SOIL[0]) * a | 0},${SOIL[1] + (c[1] - SOIL[1]) * a | 0},${SOIL[2] + (c[2] - SOIL[2]) * a | 0})`;
  const X = (u) => cx + (u - 16) * k, Y = (u) => soilY + (u - 19.4) * k;

  function grow() {
    const r = rng(seed);
    const step = 4;
    segs = []; roots = []; tips = []; stones = [];
    const depth = h - soilY;
    const count = w < 700 ? 4 : 7;
    for (let i = 0; i < count; i++) {
      let x = w * (.06 + .88 * (i + .2 + r() * .6) / count);
      if (Math.abs(x - cx) < 16 * k) x += (x < cx ? -1 : 1) * 16 * k;
      stones.push({ x, y: soilY + depth * (.28 + r() * .5), r: (18 + r() * 38) * Math.max(.75, Math.min(1.3, w / 1300)), rot: r() * TAU, squash: .6 + r() * .3 });
    }
    const spawn = (x, y, a, width, tick, main) => { const root = { x, y, a, w: width, w0: width, tick, main, alive: true, pts: [[x, y]] }; roots.push(root); return root; };
    for (const [u, a] of LEGS) spawn(X(u) + (a - DOWN) * k * .9, soilY, a, 2.4 * k * .62, 0, true);
    const fibres = Math.round(w / 95);
    for (let i = 0; i < fibres; i++) {
      const x = w * (i + r()) / fibres;
      if (Math.abs(x - cx) < 9 * k) continue;
      spawn(x, soilY, DOWN + (r() - .5) * .9, 1.4 + r() * 3.2, 8 + Math.floor(r() * 40), false);
    }
    let tick = 0;
    while (roots.some((root) => root.alive) && tick < 2400) {
      tick++;
      for (let n = 0; n < roots.length; n++) {
        const root = roots[n];
        if (!root.alive || root.tick > tick) continue;
        let a = root.a + (r() - .5) * .4;
        a += turn(DOWN, a) * (root.main ? .03 : .035);
        for (const s of stones) {
          const dx = root.x - s.x, dy = (root.y - s.y) / s.squash, d = Math.hypot(dx, dy), edge = s.r + root.w * .5 + 3;
          if (d < edge + 10) {
            // Hug the stone: steer along its surface, the way a holdfast grips rock.
            const out = Math.atan2(dy, dx), t1 = out + Math.PI / 2, t2 = out - Math.PI / 2;
            a += turn(Math.abs(turn(t1, a)) < Math.abs(turn(t2, a)) ? t1 : t2, a) * .55;
            if (d < edge) { root.x = s.x + Math.cos(out) * edge; root.y = s.y + Math.sin(out) * edge * s.squash; }
          }
        }
        if (root.y < soilY + 6) a = Math.max(.25, Math.min(Math.PI - .25, a));
        const x = root.x + Math.cos(a) * step, y = root.y + Math.sin(a) * step;
        segs.push({ x0: root.x, y0: root.y, x1: x, y1: y, w: root.w, tick });
        root.x = x; root.y = y; root.a = a; root.pts.push([x, y]);
        root.w *= root.main ? .988 : .987;
        if (root.w > .8 && r() < (root.main ? .045 : .04)) spawn(x, y, a + (r() < .5 ? -1 : 1) * (.5 + r() * .7), root.w * (.38 + r() * .2), tick + 1, false);
        if (root.w < .35 || y > h + 10 || x < -30 || x > w + 30) { root.alive = false; tips.push({ x, y }); }
      }
    }
    ticks = tick;
    segs.sort((p, q) => p.tick - q.tick);
    roots = roots.filter((root) => root.pts.length > 12);
  }

  function paintSeg(c, s) {
    c.strokeStyle = mix(BONE, .16 + Math.min(1, s.w / 7) * .7);
    c.lineWidth = Math.max(.6, s.w);
    c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.stroke();
  }

  function paintStones(c) {
    for (const s of stones) {
      c.save(); c.translate(s.x, s.y); c.scale(1, s.squash); c.rotate(s.rot);
      const g = c.createRadialGradient(-s.r * .3, -s.r * .4, s.r * .1, 0, 0, s.r);
      g.addColorStop(0, '#29291f'); g.addColorStop(1, '#141410');
      c.fillStyle = g; c.beginPath();
      for (let i = 0; i <= 48; i++) {
        const t = i / 48 * TAU, rr = s.r * (.9 + .07 * Math.sin(t * 3 + s.rot * 5) + .03 * Math.sin(t * 7 + s.rot));
        if (i) c.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); else c.moveTo(Math.cos(t) * rr, Math.sin(t) * rr);
      }
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,246,221,.07)'; c.lineWidth = 1; c.stroke();
      c.restore();
    }
  }

  function reset() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    soilY = Math.round(h * (w < 700 ? .44 : .42));
    k = Math.max(5, Math.min(13, h * .3 / 15, w * .42 / 21));
    cx = w / 2;
    grow();
    layer = document.createElement('canvas');
    layer.width = canvas.width; layer.height = canvas.height;
    const l = layer.getContext('2d');
    l.setTransform(dpr, 0, 0, dpr, 0, 0); l.lineCap = 'round'; l.lineJoin = 'round';
    paintStones(l);
    drawn = 0; pulses = []; born = performance.now();
    motes = Array.from({ length: Math.round(w / 40) }, () => ({ x: Math.random() * w, y: soilY - Math.random() * soilY, v: 6 + Math.random() * 14, r: .6 + Math.random() * 1.4, p: Math.random() * TAU }));
    if (reduce.matches) while (drawn < segs.length) paintSeg(l, segs[drawn++]);
    frame(performance.now());
  }

  function drawMark(alpha, beat) {
    ctx.save();
    // Only the part above the soil: below it, the grown roots take over.
    ctx.beginPath(); ctx.rect(0, 0, w, soilY); ctx.clip();
    ctx.translate(X(0), Y(0)); ctx.scale(k, k);
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
    ctx.strokeStyle = `rgb(${BONE})`; ctx.lineWidth = 2.4;
    for (const p of MARK) ctx.stroke(p);
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = `rgba(${LIME},${.55 + .35 * beat})`; ctx.shadowBlur = 18 + 22 * beat;
    ctx.fillStyle = `rgb(${LIME})`;
    ctx.beginPath(); ctx.arc(10.5, 4.6, 2.3 + .25 * beat, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawSoil(reveal) {
    const half = w / 2 * reveal;
    const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
    g.addColorStop(0, `rgba(${LIME},0)`); g.addColorStop(.2, `rgba(${LIME},.75)`); g.addColorStop(.5, `rgba(${LIME},.95)`); g.addColorStop(.8, `rgba(${LIME},.75)`); g.addColorStop(1, `rgba(${LIME},0)`);
    ctx.save();
    ctx.shadowColor = `rgba(${LIME},.6)`; ctx.shadowBlur = 18;
    ctx.fillStyle = g; ctx.fillRect(cx - half, soilY - .75, half * 2, 1.5);
    ctx.restore();
  }

  function spawnPulse() {
    if (!roots.length) return;
    let pick = null;
    for (let tries = 0; tries < 6 && !pick; tries++) {
      const root = roots[Math.floor(Math.random() * roots.length)];
      if (Math.random() < Math.min(1, root.w0 / 4)) pick = root;
    }
    if (!pick) return;
    pulses.push({ root: pick, s: 0, v: 90 + Math.random() * 140, c: Math.random() < .22 ? VIOLET : LIME, r: Math.max(1.1, Math.min(2.4, pick.w0 * .3)) });
  }

  function frame(now) {
    cancelAnimationFrame(raf);
    const l = layer.getContext('2d');
    const age = (now - born) / 1000;
    const growth = reduce.matches ? 1 : Math.max(0, Math.min(1, (age - .7) / 3.6));
    const until = (1 - Math.pow(1 - growth, 2)) * ticks;
    while (drawn < segs.length && segs[drawn].tick <= until) paintSeg(l, segs[drawn++]);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Sky: a soft light behind the mark, and spores drifting up from the soil.
    const halo = ctx.createRadialGradient(cx, soilY, 0, cx, soilY, Math.max(w, h) * .55);
    halo.addColorStop(0, 'rgba(217,249,119,.10)'); halo.addColorStop(.5, 'rgba(217,249,119,.025)'); halo.addColorStop(1, 'rgba(217,249,119,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    const t = now / 1000;
    if (!reduce.matches) {
      for (const m of motes) {
        m.y -= m.v / 60; m.x += Math.sin(t * .6 + m.p) * .15;
        if (m.y < 0) { m.y = soilY - 2; m.x = Math.random() * w; }
        const fade = Math.min(1, (soilY - m.y) / 60) * (m.y / soilY);
        ctx.fillStyle = `rgba(${LIME},${.35 * fade})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
      }
    }

    ctx.drawImage(layer, 0, 0, w, h);

    if (growth < 1) {
      ctx.fillStyle = `rgba(${LIME},.9)`;
      for (let i = drawn - 1, n = 0; i >= 0 && n < 500 && segs[i].tick > until - 3; i--, n++) {
        ctx.beginPath(); ctx.arc(segs[i].x1, segs[i].y1, Math.max(1, segs[i].w * .5), 0, TAU); ctx.fill();
      }
    } else {
      for (const tip of tips) {
        const near = Math.max(0, 1 - Math.hypot(tip.x - pointer.x, tip.y - pointer.y) / 160);
        const pulse = reduce.matches ? .5 : .5 + .5 * Math.sin(t * 1.4 + tip.x * .05);
        ctx.fillStyle = `rgba(${LIME},${.1 + pulse * .14 + near * .8})`;
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 1.3 + near * 2, 0, TAU); ctx.fill();
      }
    }

    // Sap: light travelling down the roots.
    if (!reduce.matches && growth >= 1) {
      if (pulses.length < Math.min(70, w * h / 20000) && Math.random() < .5) spawnPulse();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const p of pulses) {
        p.s += p.v / 60;
        const i = Math.floor(p.s / 4), pts = p.root.pts;
        if (i >= pts.length - 1) { p.dead = true; continue; }
        for (let j = 0; j < 7 && i - j >= 0; j++) {
          const [x, y] = pts[i - j], a = (1 - j / 7) * .55;
          ctx.fillStyle = `rgba(${p.c},${a})`;
          ctx.beginPath(); ctx.arc(x, y, p.r * (1 - j / 10), 0, TAU); ctx.fill();
        }
        const near = Math.max(0, 1 - Math.hypot(pts[i][0] - pointer.x, pts[i][1] - pointer.y) / 160);
        ctx.fillStyle = `rgba(${p.c},${.25 + near * .5})`;
        ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], Math.min(6, p.r * 2.6), 0, TAU); ctx.fill();
      }
      ctx.restore();
      pulses = pulses.filter((p) => !p.dead);
    }

    drawSoil(reduce.matches ? 1 : Math.min(1, age / .9));
    const beat = reduce.matches ? .5 : .5 + .5 * Math.sin(t * 2.1);
    drawMark(reduce.matches ? 1 : Math.min(1, Math.max(0, (age - .25) / .6)), beat);

    if (visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
  }

  canvas.addEventListener('pointermove', (e) => { const b = canvas.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; });
  canvas.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1e4; });
  canvas.addEventListener('click', () => { seed = Math.floor(Math.random() * 1e9); reset(); });
  let lastSize = '';
  const onResize = () => { const size = canvas.clientWidth + 'x' + canvas.clientHeight; if (size !== lastSize) { lastSize = size; reset(); } };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(canvas); else { addEventListener('resize', onResize, { passive: true }); onResize(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && layer) frame(performance.now()); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && layer) frame(performance.now()); });
  reduce.addEventListener('change', reset);
})();
