(() => {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Mark geometry in the 32-unit space of /assets/mark.svg.
  const left = new Path2D('M6.5 10.5 10.5 6.5H12.5V25.5H6.5Z');
  const right = new Path2D('M25.5 21.5 21.5 25.5H19.5V6.5H25.5Z');
  const point = new Path2D('M16 12.4 19.6 16 16 19.6 12.4 16Z');
  let w = 0, h = 0, dpr = 1, raf = 0;
  const start = performance.now();
  const pointer = { x: .5, y: .5 };
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    draw(performance.now());
  }
  function diamond(cx, cy, r) {
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath();
  }
  function draw(now) {
    cancelAnimationFrame(raf);
    const t = reduce.matches ? 2 : (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const k = Math.min(w * .5, h * .6) / 20;
    const cx = w * .5 + (pointer.x - .5) * 14;
    const cy = h * .5 + (pointer.y - .5) * 14;
    const X = (u) => cx + (u - 16) * k, Y = (u) => cy + (u - 16) * k;

    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16 * k);
    halo.addColorStop(0, 'rgba(217,249,119,.16)'); halo.addColorStop(1, 'rgba(217,249,119,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);

    // Threads converging on each jaw.
    for (let i = -14; i <= 14; i++) {
      const f = i / 14;
      for (const side of [-1, 1]) {
        const endX = side < 0 ? X(6.5) : X(25.5);
        const endY = Y(16 + f * 8.5);
        const sway = Math.sin(t * .6 + i * .35 + side) * 6;
        const fromX = side < 0 ? -20 : w + 20;
        const fromY = cy + f * h * .9 + sway;
        ctx.beginPath(); ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(cx + side * w * .42, fromY, cx + side * 15 * k, endY, endX, endY);
        const major = i % 4 === 0;
        ctx.strokeStyle = major ? 'rgba(217,249,119,.26)' : 'rgba(170,190,172,.09)';
        ctx.lineWidth = major ? 1.2 : .7;
        ctx.stroke();
      }
    }

    // Signal pulses leaving the held point.
    for (let n = 0; n < 3; n++) {
      const p = ((t * .28 + n / 3) % 1);
      diamond(cx, cy, (4 + p * 26) * k);
      ctx.strokeStyle = `rgba(217,249,119,${(1 - p) * .28})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(X(0), Y(0)); ctx.scale(k, k);
    ctx.lineJoin = 'round'; ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const stoneL = ctx.createLinearGradient(6, 6, 13, 26);
    stoneL.addColorStop(0, '#f6f8f1'); stoneL.addColorStop(1, '#a9b2aa');
    ctx.fillStyle = stoneL; ctx.fill(left);
    const stoneR = ctx.createLinearGradient(19, 6, 26, 26);
    stoneR.addColorStop(0, '#e9ede4'); stoneR.addColorStop(1, '#8f988f');
    ctx.fillStyle = stoneR; ctx.fill(right);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = stoneL; ctx.stroke(left);
    ctx.strokeStyle = stoneR; ctx.stroke(right);
    const beat = reduce.matches ? 1 : .75 + Math.sin(t * 2.2) * .25;
    ctx.shadowColor = `rgba(217,249,119,${.75 * beat})`; ctx.shadowBlur = 50; ctx.shadowOffsetY = 0;
    const gem = ctx.createLinearGradient(16, 12, 16, 20);
    gem.addColorStop(0, '#f1ffc4'); gem.addColorStop(.5, '#d9f977'); gem.addColorStop(1, '#b6e03a');
    ctx.fillStyle = gem; ctx.strokeStyle = gem; ctx.fill(point); ctx.shadowColor = 'transparent'; ctx.stroke(point);
    ctx.restore();

    if (!reduce.matches && !document.hidden) raf = requestAnimationFrame(draw);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(performance.now()); else cancelAnimationFrame(raf); });
  reduce.addEventListener('change', () => draw(performance.now()));
  if (!('ResizeObserver' in window)) resize();
})();
