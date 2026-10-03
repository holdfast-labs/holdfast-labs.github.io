(() => {
  // Hero art: the Holdfast mark as a live current. Streamlines of a steady flow
  // bend around one fixed point (uniform flow past a cylinder), tilted like the logo.
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const angle = -38 * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
  let w = 0, h = 0, dpr = 1, raf = 0, R = 1, lines = [];
  const start = performance.now();
  const pointer = { x: .5, y: .5 };

  // y on the streamline psi = c, where psi = y (1 - R^2 / r^2), for c > 0.
  function solve(x, c) {
    let lo = c, hi = c + R;
    for (let i = 0; i < 22; i++) {
      const y = (lo + hi) / 2;
      if (y - R * R * y / (x * x + y * y) - c > 0) hi = y; else lo = y;
    }
    return (lo + hi) / 2;
  }
  function build() {
    R = Math.min(w, h) * .085;
    const reach = Math.hypot(w, h) * .62, gap = R * .62, count = Math.ceil(reach / gap);
    lines = [];
    for (let n = -count; n <= count; n++) {
      const segs = [];
      if (n === 0) {
        segs.push([[-reach, 0], [-R * 1.32, 0]], [[R * 1.32, 0], [reach, 0]]);
      } else {
        const pts = [];
        for (let x = -reach; x <= reach; x += Math.max(4, R / 7)) {
          const y = solve(x, Math.abs(n) * gap);
          pts.push([x, n > 0 ? y : -y]);
        }
        segs.push(pts);
      }
      lines.push({ n, segs });
    }
  }
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    build();
    draw(performance.now());
  }
  function draw(now) {
    cancelAnimationFrame(raf);
    const t = reduce.matches ? 0 : (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cx = w * .5 + (pointer.x - .5) * 16, cy = h * .5 + (pointer.y - .5) * 16;

    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 6);
    halo.addColorStop(0, 'rgba(217,249,119,.18)'); halo.addColorStop(1, 'rgba(217,249,119,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(cos, sin, -sin, cos, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const { n, segs } of lines) {
      const d = Math.abs(n);
      const hero = d <= 1;
      const fade = Math.max(0, 1 - d / 13);
      for (const pts of segs) {
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        // Base thread.
        ctx.setLineDash([]);
        ctx.strokeStyle = hero ? 'rgba(238,241,234,.92)' : `rgba(170,190,172,${.06 + fade * .2})`;
        ctx.lineWidth = hero ? R * .34 : 1;
        ctx.stroke();
        // Current moving along it.
        if (!hero && fade > 0) {
          const len = R * (.6 + (d % 3) * .35);
          ctx.setLineDash([len, R * (2.4 + (d % 4) * .7)]);
          ctx.lineDashOffset = -t * R * (1.1 + (d % 5) * .12) - d * 37;
          ctx.strokeStyle = `rgba(217,249,119,${.12 + fade * .5})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Signal rings leaving the held point.
    for (let k = 0; k < 3; k++) {
      const p = (t * .22 + k / 3) % 1;
      ctx.beginPath(); ctx.arc(cx, cy, R * (1 + p * 5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(217,249,119,${(1 - p) * .22})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
    const beat = reduce.matches ? 1 : .8 + Math.sin(t * 2) * .2;
    ctx.shadowColor = `rgba(217,249,119,${.8 * beat})`; ctx.shadowBlur = R * 1.4;
    const gem = ctx.createRadialGradient(cx - R * .3, cy - R * .35, 0, cx, cy, R);
    gem.addColorStop(0, '#f4ffd2'); gem.addColorStop(.55, '#d9f977'); gem.addColorStop(1, '#a9d630');
    ctx.fillStyle = gem;
    ctx.beginPath(); ctx.arc(cx, cy, R * .82, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    if (!reduce.matches && !document.hidden) raf = requestAnimationFrame(draw);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else { addEventListener('resize', resize, { passive: true }); resize(); }
  addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(performance.now()); else cancelAnimationFrame(raf); });
  reduce.addEventListener('change', () => draw(performance.now()));
})();
