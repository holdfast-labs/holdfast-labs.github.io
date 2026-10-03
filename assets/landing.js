(() => {
  // Hero art: a holdfast. Roots grow down from the soil line, grip buried stones,
  // and two taproots reach for the product cards below. Click to regrow.
  const canvas = document.getElementById('roots-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2, DOWN = Math.PI / 2;
  const colors = { seekfs: [217, 249, 119], vanth: [189, 169, 255] };
  let w = 0, h = 0, dpr = 1, seed = 7, raf = 0;
  let segs = [], tips = [], stones = [], labels = [], ticks = 1;
  let layer = null, drawn = 0, growStart = 0, visible = true;
  const pointer = { x: -1e4, y: -1e4 };

  function rng(a) {
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const turn = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

  function targets() {
    const box = canvas.getBoundingClientRect();
    const cards = [...document.querySelectorAll('.product-card')].map((card) => card.getBoundingClientRect());
    const xs = cards.length === 2 && Math.abs(cards[0].left - cards[1].left) > 40
      ? cards.map((r) => r.left + r.width * .5 - box.left)
      : [w * .3, w * .7];
    return [{ x: xs[0], key: 'seekfs' }, { x: xs[1], key: 'vanth' }];
  }

  function grow() {
    const r = rng(seed);
    const k = Math.max(.7, Math.min(1.25, w / 1200));
    const step = 4;
    segs = []; tips = []; labels = []; stones = [];
    const stoneCount = w < 700 ? 3 : 5;
    for (let i = 0; i < stoneCount; i++) {
      stones.push({ x: w * (.1 + .8 * (i + r() * .6) / stoneCount), y: h * (.3 + r() * .45), r: (22 + r() * 34) * k, rot: r() * TAU, squash: .62 + r() * .3 });
    }
    const roots = [];
    const spawn = (x, y, a, width, tick, target) => roots.push({ x, y, a, w: width, tick, target, alive: true });
    // Fibrous roots across the surface.
    const origins = w < 700 ? 6 : 11;
    for (let i = 0; i < origins; i++) {
      const x = w * (.04 + .92 * (i + r()) / origins);
      spawn(x, 0, DOWN + (r() - .5) * .8, (2.2 + r() * 3.2) * k, Math.floor(r() * 30));
    }
    // Two taproots that reach for the products.
    for (const t of targets()) spawn(t.x + (r() - .5) * w * .18, 0, DOWN, 6.5 * k, 0, t);
    let tick = 0;
    while (roots.some((root) => root.alive) && tick < 2000) {
      tick++;
      for (const root of roots) {
        if (!root.alive || root.tick > tick) continue;
        let a = root.a + (r() - .5) * .42;
        a += turn(DOWN, a) * (root.target ? .05 : .035);
        if (root.target && root.y > h * .08) a += turn(Math.atan2(h * .9 - root.y, root.target.x - root.x), a) * (.06 + root.y / h * .25);
        for (const s of stones) {
          const dx = root.x - s.x, dy = (root.y - s.y) / s.squash, d = Math.hypot(dx, dy), edge = s.r + root.w + 3;
          if (d < edge + 10) {
            // Hug the stone: steer along its surface, the way a holdfast grips rock.
            const out = Math.atan2(dy, dx);
            const t1 = out + Math.PI / 2, t2 = out - Math.PI / 2;
            const tan = Math.abs(turn(t1, a)) < Math.abs(turn(t2, a)) ? t1 : t2;
            a += turn(tan, a) * .55;
            if (d < edge) { root.x = s.x + Math.cos(out) * edge; root.y = s.y + Math.sin(out) * edge * s.squash; }
          }
        }
        const x = root.x + Math.cos(a) * step, y = root.y + Math.sin(a) * step;
        segs.push({ x0: root.x, y0: root.y, x1: x, y1: y, w: root.w, tick, key: root.target && root.target.key });
        root.x = x; root.y = y; root.a = a;
        root.w *= root.target ? .9975 : .988;
        if (!root.target && root.w > .7 && r() < .045) spawn(x, y, a + (r() < .5 ? -1 : 1) * (.45 + r() * .7), root.w * (.5 + r() * .2), tick + 1);
        if (root.target && r() < .05) spawn(x, y, a + (r() < .5 ? -1 : 1) * (.6 + r() * .6), root.w * .4, tick + 1);
        if (root.w < .32 || y > h + 8 || x < -30 || x > w + 30 || (root.target && y > h * .84)) {
          root.alive = false;
          tips.push({ x, y, w: root.w, tick, key: root.target && root.target.key });
          if (root.target) labels.push({ x, y, key: root.target.key });
        }
      }
    }
    ticks = tick;
    segs.sort((p, q) => p.tick - q.tick);
  }

  // Opaque colours pre-blended with the soil, so overlapping segments never bead.
  const SOIL = [15, 16, 12];
  const blend = ([r, g, b], a) => `rgb(${SOIL[0] + (r - SOIL[0]) * a | 0},${SOIL[1] + (g - SOIL[1]) * a | 0},${SOIL[2] + (b - SOIL[2]) * a | 0})`;
  function paintSeg(c, s) {
    if (s.key) {
      const [r, g, b] = colors[s.key];
      const mix = Math.min(1, s.y1 / h * 1.4);
      c.strokeStyle = blend([236 + (r - 236) * mix, 230 + (g - 230) * mix, 212 + (b - 212) * mix], .95);
    } else {
      c.strokeStyle = blend([236, 230, 212], .18 + Math.min(1, s.w / 5) * .62);
    }
    c.lineWidth = Math.max(.6, s.w);
    c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.stroke();
  }

  function paintStones(c) {
    for (const s of stones) {
      c.save(); c.translate(s.x, s.y); c.scale(1, s.squash); c.rotate(s.rot);
      const g = c.createRadialGradient(-s.r * .3, -s.r * .4, s.r * .1, 0, 0, s.r);
      g.addColorStop(0, '#2a2a22'); g.addColorStop(1, '#16160f');
      c.fillStyle = g; c.beginPath();
      for (let i = 0; i <= 48; i++) {
        const t = i / 48 * TAU, rr = s.r * (.9 + .07 * Math.sin(t * 3 + s.rot * 5) + .03 * Math.sin(t * 7 + s.rot));
        if (i) c.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); else c.moveTo(Math.cos(t) * rr, Math.sin(t) * rr);
      }
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,246,221,.08)'; c.lineWidth = 1; c.stroke();
      c.restore();
    }
  }

  function reset() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    grow();
    layer = document.createElement('canvas');
    layer.width = canvas.width; layer.height = canvas.height;
    const l = layer.getContext('2d');
    l.setTransform(dpr, 0, 0, dpr, 0, 0); l.lineCap = 'round';
    paintStones(l);
    drawn = 0;
    growStart = performance.now();
    if (reduce.matches) while (drawn < segs.length) paintSeg(l, segs[drawn++]);
    frame(performance.now());
  }

  function frame(now) {
    cancelAnimationFrame(raf);
    const l = layer.getContext('2d');
    const growth = reduce.matches ? 1 : Math.min(1, (now - growStart) / 3200);
    const until = (1 - Math.pow(1 - growth, 2.2)) * ticks;
    while (drawn < segs.length && segs[drawn].tick <= until) paintSeg(l, segs[drawn++]);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(layer, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = now / 1000;
    if (growth < 1) {
      // Glowing growth tips at the front of every root.
      ctx.fillStyle = 'rgba(217,249,119,.9)';
      for (let i = drawn - 1, n = 0; i >= 0 && n < 400 && segs[i].tick > until - 3; i--, n++) {
        ctx.beginPath(); ctx.arc(segs[i].x1, segs[i].y1, Math.max(1, segs[i].w * .55), 0, TAU); ctx.fill();
      }
    } else {
      // Finished tips glow, brighter near the pointer.
      for (const tip of tips) {
        if (tip.key) continue;
        const near = Math.max(0, 1 - Math.hypot(tip.x - pointer.x, tip.y - pointer.y) / 140);
        const pulse = reduce.matches ? .5 : .5 + .5 * Math.sin(t * 1.6 + tip.x * .05);
        ctx.fillStyle = `rgba(217,249,119,${.12 + pulse * .15 + near * .75})`;
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 1.4 + near * 1.6, 0, TAU); ctx.fill();
      }
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      for (const lab of labels) {
        const [r, g, b] = colors[lab.key];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.shadowColor = `rgba(${r},${g},${b},.8)`; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(lab.x, lab.y, 4, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
        const tw = ctx.measureText(lab.key).width + 14, ty = lab.y - 30;
        ctx.fillStyle = 'rgba(11,11,9,.92)'; ctx.strokeStyle = `rgba(${r},${g},${b},.45)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lab.x - tw / 2, ty, tw, 19, 6) : ctx.rect(lab.x - tw / 2, ty, tw, 19); ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.textBaseline = 'middle';
        ctx.fillText(lab.key, lab.x, ty + 10);
      }
    }
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
  if (document.fonts) document.fonts.ready.then(() => { if (layer) frame(performance.now()); });
})();
