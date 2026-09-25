(() => {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, dpr = 1, frame = 0, raf = 0;
  let mouse = { x: .5, y: .5 }, target = { x: .5, y: .5 };
  const resize = () => {
    cancelAnimationFrame(raf);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  function draw() {
    ctx.fillStyle = '#0d1110'; ctx.fillRect(0, 0, w, h);
    const t = reduced.matches ? 0 : frame * .009;
    mouse.x += (target.x - mouse.x) * .035;
    mouse.y += (target.y - mouse.y) * .035;
    const centerX = w * (.5 + (mouse.x - .5) * .05);
    const centerY = h * (.5 + (mouse.y - .5) * .04);
    const span = Math.max(w, h) * .64;
    for (let i = -56; i <= 56; i++) {
      const y0 = centerY + i * Math.max(12, h / 68);
      const highlight = Math.exp(-Math.abs(i) / 11);
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 11) {
        const distance = Math.abs(x - centerX) / span;
        const well = Math.exp(-distance * distance * 7);
        const wave = Math.sin(x * .0045 + t * (i % 2 ? 1 : -1) + i * .22) * (14 + 35 * well);
        const y = y0 + wave * (1 - well * .72) + Math.sign(i || 1) * well * (28 + 15 * Math.sin(t + i * .06));
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const lime = i % 9 === 0;
      ctx.strokeStyle = lime ? 'rgba(208,250,96,' + (.085 + highlight * .17) + ')' : 'rgba(174,205,174,' + (.045 + highlight * .09) + ')';
      ctx.lineWidth = lime ? 1.35 : .72;
      ctx.stroke();
    }
    const scanX = reduced.matches ? w * .25 : ((t * 47) % (w + 480)) - 240;
    const beam = ctx.createLinearGradient(scanX - 190, 0, scanX + 190, 0);
    beam.addColorStop(0, '#d9f97700'); beam.addColorStop(.5, '#d9f97715'); beam.addColorStop(1, '#d9f97700');
    ctx.fillStyle = beam; ctx.fillRect(scanX - 190, 0, 380, h);
    ctx.fillStyle = '#d9f9779c'; ctx.fillRect(scanX, 0, 1, h);
    if (!reduced.matches && !document.hidden) { frame++; raf = requestAnimationFrame(draw); }
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', e => { target = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }; }, { passive: true });
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) draw(); });
  reduced.addEventListener('change', () => { cancelAnimationFrame(raf); draw(); });
  resize();
})();
