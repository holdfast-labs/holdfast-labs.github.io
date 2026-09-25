(() => {
  const canvas = document.getElementById('landing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const left = new Path2D('M190 247 388 49q15-15 36-15h96q27 0 27 27v214q0 22-16 38l-66 66q-18 18-18 44v64q0 30 30 34l300 34q34 4 34 38v38q0 35-35 35H488q-68 0-105 39-28 29-28 70 0 47 38 72l75 47q19 12 19 35v167q0 29-29 29H343q-16 0-28-12L189 973q-13-13-13-31V281q0-20 14-34Z');
  const right = new Path2D('M772 279q0-31 31-31h91q22 0 37 15l136 137q13 13 13 31v516q0 20-14 34L943 1105q-13 13-32 13H791q-31 0-31-31V922q0-20-17-31l-46-30q-18-12-39-15l-217-35q-28-5-28-33v-40q0-29 29-29h311q55 0 91-36 31-31 31-76 0-47-38-79l-47-39q-18-15-18-38V279Z');
  const bridge = new Path2D('M463 548h323q25 0 25 25v64q0 25-25 25H463q-26 0-26-26v-62q0-26 26-26Z');
  let w = 0, h = 0, dpr = 1, raf = 0, start = performance.now();
  const pointer = { x: .5, y: .5 };
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    draw(performance.now());
  }
  function draw(now) {
    cancelAnimationFrame(raf);
    const t = reduce.matches ? 1.2 : (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b100d'; ctx.fillRect(0, 0, w, h);
    const s = Math.min(w / 1430, h / 1140) * (w < 680 ? 1.32 : 1);
    const cx = w * (.5 + (pointer.x - .5) * .012);
    const cy = h * (.54 + (pointer.y - .5) * .012);
    const x0 = cx - 600 * s, y0 = cy - 600 * s;
    const yBridge = y0 + 605 * s;
    const leftEdge = x0 + 176 * s, rightEdge = x0 + 1080 * s;
    const halo = ctx.createRadialGradient(cx, cy, 40 * s, cx, cy, 660 * s);
    halo.addColorStop(0, '#9ce73720'); halo.addColorStop(.55, '#16311d30'); halo.addColorStop(1, '#0b100d00');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
    for (let i = -18; i <= 18; i++) {
      const spread = i / 18;
      const endY = yBridge + spread * 103 * s;
      const originY = yBridge + spread * Math.max(h * .75, 510 * s);
      for (const side of [-1, 1]) {
        const xStart = side < 0 ? -35 : w + 35;
        const xEnd = side < 0 ? leftEdge : rightEdge;
        const sway = Math.sin(t * .7 + i * .32) * 8;
        ctx.beginPath(); ctx.moveTo(xStart, originY + sway);
        ctx.bezierCurveTo(cx + side * 790 * s, originY * .75 + endY * .25, cx + side * 520 * s, endY, xEnd, endY);
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(199,247,102,.29)' : 'rgba(132,184,139,.105)';
        ctx.lineWidth = i % 5 === 0 ? 1.4 : .75;
        ctx.stroke();
      }
    }
    ctx.save(); ctx.translate(x0, y0); ctx.scale(s, s);
    ctx.shadowColor = '#000'; ctx.shadowBlur = 64; ctx.shadowOffsetY = 35;
    const metal = ctx.createLinearGradient(160, 100, 800, 1100);
    metal.addColorStop(0, '#49564b'); metal.addColorStop(.45, '#28372e'); metal.addColorStop(1, '#141e19');
    ctx.fillStyle = metal; ctx.strokeStyle = '#627263'; ctx.lineWidth = 5;
    ctx.fill(left); ctx.stroke(left);
    const porcelain = ctx.createLinearGradient(750, 260, 1040, 1080);
    porcelain.addColorStop(0, '#f7f8ef'); porcelain.addColorStop(.58, '#e3e9dd'); porcelain.addColorStop(1, '#aab7a9');
    ctx.fillStyle = porcelain; ctx.strokeStyle = '#f7fff3';
    ctx.fill(right); ctx.stroke(right);
    ctx.shadowBlur = 55; ctx.shadowOffsetY = 0; ctx.shadowColor = '#ceff4eaa';
    const signal = ctx.createLinearGradient(437, 0, 811, 0);
    signal.addColorStop(0, '#a8d82b'); signal.addColorStop(.48, '#e6ff79'); signal.addColorStop(1, '#b4e839');
    ctx.fillStyle = signal; ctx.fill(bridge);
    ctx.shadowBlur = 0;
    ctx.save(); ctx.clip(bridge);
    const scan = reduce.matches ? 625 : 437 + ((t * 145) % 440);
    const light = ctx.createLinearGradient(scan - 110, 0, scan + 110, 0);
    light.addColorStop(0, '#ffffff00'); light.addColorStop(.5, '#ffffffb0'); light.addColorStop(1, '#ffffff00');
    ctx.fillStyle = light; ctx.fillRect(437, 548, 374, 114);
    ctx.restore(); ctx.restore();
    if (!reduce.matches && !document.hidden) raf = requestAnimationFrame(draw);
  }
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(performance.now()); else cancelAnimationFrame(raf); });
  reduce.addEventListener('change', () => draw(performance.now()));
  resize();
})();
