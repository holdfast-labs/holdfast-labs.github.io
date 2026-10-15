// Holdfast Labs — site behaviour. No dependencies.
(() => {
const doc = document.documentElement;
doc.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const onVisible = (el, fn, threshold = 0.2) => {
  if (!('IntersectionObserver' in window)) return fn(true);
  new IntersectionObserver((entries) => entries.forEach((e) => fn(e.isIntersecting)), { threshold }).observe(el);
};

/* ---------- Menu ---------- */
const header = $('.site-header');
const menuBtn = $('.menu-btn');
if (header && menuBtn) {
  const panel = $('#site-menu');
  const background = [$('#main'), $('.site-footer'), ...$$('.nav-row > :not(.menu-btn)', header)].filter(Boolean);
  panel.inert = true;
  const set = (open) => {
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-is-open', open);
    panel.inert = !open;
    background.forEach((el) => { el.inert = open; });
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
    if (open) panel.querySelector('a')?.focus({ preventScroll: true });
    else menuBtn.focus({ preventScroll: true });
  };
  menuBtn.addEventListener('click', () => set(!header.classList.contains('menu-open')));
  $('.menu-scrim')?.addEventListener('click', () => set(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.classList.contains('menu-open')) { set(false); menuBtn.focus(); } });
  header.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !header.classList.contains('menu-open')) return;
    const stops = [menuBtn, ...$$('a[href], button:not([disabled])', panel)];
    const index = stops.indexOf(document.activeElement);
    if (e.shiftKey && index === 0) { e.preventDefault(); stops.at(-1).focus(); }
    else if (!e.shiftKey && index === stops.length - 1) { e.preventDefault(); menuBtn.focus(); }
  });
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
}

/* ---------- Year ---------- */
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Particle wave ----------
   A band of fine grain that drifts along an S-curve, moss green into amber. */
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const SHAPES = {
  hero: { y0: 0.6, amp: 0.27, c: 0.48, freq: 1.15, thick: 0.2, wig: 0.05 },
  cta: { y0: 0.55, amp: -0.22, c: 0.5, freq: 1.0, thick: 0.2, wig: 0.04 },
  soft: { y0: 0.55, amp: 0.2, c: 0.5, freq: 0.9, thick: 0.16, wig: 0.03 },
};
$$('[data-wave]').forEach((host) => {
  const canvas = document.createElement('canvas');
  host.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const shape = SHAPES[host.dataset.wave] || SHAPES.hero;
  const a = hex(host.dataset.from || '#4a8a63'), b = hex(host.dataset.to || '#d4893a'), mid = hex(host.dataset.mid || '#6f8fb8');
  let W = 0, H = 0, parts = null, img = null, running = false, raf = 0, t0 = performance.now();
  const build = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W; canvas.height = H;
    img = ctx.createImageData(W, H);
    const n = Math.min(90000, Math.round((W * H) / 15));
    parts = new Float32Array(n * 5);
    for (let i = 0; i < n; i++) {
      const k = i * 5;
      parts[k] = Math.random() * 1.2 - 0.1; // u along the band
      const strand = Math.floor(Math.random() * 14);
      let g = 0; for (let j = 0; j < 3; j++) g += Math.random(); g = (g / 3 - 0.5) * 2; // ~gaussian -1..1
      parts[k + 1] = g; parts[k + 2] = strand; parts[k + 3] = 0.25 + Math.random() * 0.75; parts[k + 4] = Math.random() * 6.283;
    }
  };
  const draw = (now) => {
    const t = (now - t0) / 1000;
    const d = img.data; d.fill(0);
    const n = parts.length / 5, s = shape;
    for (let i = 0; i < n; i++) {
      const k = i * 5;
      let u = parts[k] + t * 0.004 * parts[k + 3];
      u = ((u + 0.1) % 1.2 + 1.2) % 1.2 - 0.1;
      const v = parts[k + 1], strand = parts[k + 2];
      const cy = s.y0 - s.amp * Math.sin((u - s.c) * Math.PI * s.freq + Math.sin(t * 0.13) * 0.25) - s.wig * Math.sin(u * Math.PI * 3 + t * 0.2);
      const thick = s.thick * (0.7 + 0.45 * Math.sin(Math.min(1, Math.max(0, u)) * Math.PI));
      const ripple = Math.sin(u * 26 + strand * 0.9 + t * 0.5 + parts[k + 4] * 0.15) * 0.012;
      const y = (cy + v * thick + ripple + (strand / 14 - 0.5) * thick * 0.25) * H;
      const x = u * W;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      const p = ((y | 0) * W + (x | 0)) * 4;
      const m = Math.min(1, Math.max(0, u));
      const c = m < 0.5 ? [a, mid, m * 2] : [mid, b, (m - 0.5) * 2];
      const f = c[2];
      d[p] = c[0][0] + (c[1][0] - c[0][0]) * f; d[p + 1] = c[0][1] + (c[1][1] - c[0][1]) * f; d[p + 2] = c[0][2] + (c[1][2] - c[0][2]) * f;
      const alpha = (1 - Math.abs(v) * 0.75) * 255 * parts[k + 3];
      d[p + 3] = Math.min(255, d[p + 3] + alpha);
    }
    ctx.putImageData(img, 0, 0);
  };
  const loop = (now) => { if (!running) return; draw(now); raf = requestAnimationFrame(loop); };
  build();
  draw(performance.now() + 30000);
  if (!reduced) onVisible(host, (vis) => { running = vis; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(loop); }, 0);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(performance.now()); }, 150); });
});

/* ---------- Desktop wallpaper (generated dusk ridgeline) ---------- */
$$('[data-wallpaper]').forEach((host) => {
  const c = document.createElement('canvas'); host.appendChild(c);
  const paint = () => {
    const r = host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const W = c.width = Math.round(r.width * dpr), H = c.height = Math.round(r.height * dpr);
    const x = c.getContext('2d');
    const sky = x.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#24384a'); sky.addColorStop(0.45, '#8c6a5a'); sky.addColorStop(0.72, '#e2a066'); sky.addColorStop(1, '#f3c98d');
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    const sun = x.createRadialGradient(W * 0.68, H * 0.66, 0, W * 0.68, H * 0.66, W * 0.35);
    sun.addColorStop(0, 'rgba(255,226,170,.95)'); sun.addColorStop(0.08, 'rgba(255,210,150,.6)'); sun.addColorStop(1, 'rgba(255,200,140,0)');
    x.fillStyle = sun; x.fillRect(0, 0, W, H);
    const layers = [['#6d5a5a', 0.6, 0.05], ['#4c4550', 0.68, 0.06], ['#33343c', 0.76, 0.07], ['#22262a', 0.86, 0.06], ['#171a1b', 0.95, 0.05]];
    layers.forEach(([col, base, amp], i) => {
      x.beginPath(); x.moveTo(0, H);
      for (let px = 0; px <= W; px += 4) {
        const u = px / W;
        const y = base + amp * (Math.sin(u * (3 + i) + i * 1.7) * 0.6 + Math.sin(u * (9 + i * 2) + i) * 0.25 + Math.sin(u * 23 + i * 3) * 0.08);
        x.lineTo(px, y * H);
      }
      x.lineTo(W, H); x.closePath(); x.fillStyle = col; x.fill();
    });
    const g = x.getImageData(0, 0, W, H), d = g.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(g, 0, 0);
  };
  paint();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 200); });
});

/* ---------- seekfs search demo ---------- */
const QUERIES = [
  { q: 'ext:go dir:cmd main', scope: 'F:\\git', ms: 23.3, total: '23.7M', rows: [
    ['main.go', 'F:\\git\\seekfs\\cmd\\seekfs', '6 KB', 'Today 9:14', 'go'],
    ['main.go', 'F:\\git\\seekfs\\cmd\\seekfs-ui', '4 KB', 'Today 9:02', 'go'],
    ['main.go', 'F:\\git\\vanth\\cmd\\vanth-monitor', '9 KB', 'Yesterday', 'go'],
    ['main.go', 'F:\\git\\seekfs\\scripts\\ui-rsrcgen', '3 KB', '9/24/26', 'go'],
    ['main_test.go', 'F:\\git\\vanth\\cmd\\vanth-monitor', '12 KB', 'Yesterday', 'go'],
  ] },
  { q: '*_test.go dm:today', scope: 'F:\\git\\seekfs', ms: 22.8, total: '23.7M', rows: [
    ['cli_compat_test.go', 'cmd\\seekfs', '18 KB', 'Today 10:41', 'go'],
    ['dirsize_test.go', 'cmd\\seekfs', '7 KB', 'Today 10:38', 'go'],
    ['fuzzy_test.go', 'cmd\\seekfs', '11 KB', 'Today 10:02', 'go'],
    ['global_rank_test.go', 'cmd\\seekfs', '9 KB', 'Today 9:55', 'go'],
    ['direct_builder_test.go', 'cmd\\seekfs', '21 KB', 'Today 9:31', 'go'],
    ['bench_stats_test.go', 'cmd\\seekfs', '5 KB', 'Today 9:12', 'go'],
  ] },
  { q: 'size:>1gb ext:mkv|mp4', scope: 'All volumes', ms: 31.3, total: '23.7M', rows: [
    ['opencode-real-wake.mkv', 'F:\\captures', '1.8 GB', 'Oct 2', 'exe'],
    ['codex-final-launch.mkv', 'F:\\captures', '1.4 GB', 'Oct 2', 'exe'],
    ['vanth-monitor-long.mp4', 'F:\\captures\\vanth', '1.2 GB', 'Oct 1', 'exe'],
    ['keynote-rehearsal.mp4', 'C:\\Users\\abhi\\Videos', '3.6 GB', 'Sep 18', 'exe'],
  ] },
  { q: 'report !draft ext:md', scope: 'C:\\Users\\abhi', ms: 24.1, total: '23.7M', rows: [
    ['benchmark-report.md', 'Documents\\holdfast', '14 KB', 'Today 8:20', 'md'],
    ['incident-report.md', 'Documents\\ops', '6 KB', 'Sep 30', 'md'],
    ['q3-report.md', 'Documents\\holdfast', '22 KB', 'Sep 29', 'md'],
  ] },
];
const tokenize = (q) => q.split(/(\s+)/).map((w) => /^[!\-]|^[a-z]+:|\*/.test(w) ? `<span class="tok">${esc(w)}</span>` : esc(w)).join('');
$$('[data-seek-demo]').forEach((root) => {
  const qEl = $('.q', root), list = $('.res-list', root), status = $('.status-bar', root), scope = $('.scope', root);
  const json = $('.json-card', root), jsonBody = $('.json-card .term-body', root), flash = $('.ms-flash', root);
  let idx = 0, timer = 0, active = false;
  const sleep = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
  const showResult = (Q, typedLen) => {
    qEl.innerHTML = typedLen ? tokenize(Q.q.slice(0, typedLen)) + (typedLen < Q.q.length || !reduced ? '<span class="caret"></span>' : '') : '<span class="ph">Search 23.7M files…</span><span class="caret"></span>';
  };
  const fill = (Q, instant) => {
    scope.textContent = Q.scope;
    list.innerHTML = Q.rows.map((r, i) => `<div class="res-row${i === 0 ? ' hl' : ''}${instant ? ' in' : ''}"><span class="nm"><i class="fi ${r[4]}"></i>${esc(r[0])}</span><span class="pth">${esc(r[1])}</span><span class="sz">${r[2]}</span><span class="dt">${r[3]}</span></div>`).join('');
    status.innerHTML = `<span>${Q.rows.length} results</span><span><b>${Q.ms.toFixed(1)} ms</b> · ${Q.total} indexed</span>`;
    const first = Q.rows[0];
    jsonBody.innerHTML = `<span class="t-dim">$ seekfs search --json "${esc(Q.q)}"</span>\n{\n  <span class="t-key">"ok"</span>: <span class="t-ok">true</span>,\n  <span class="t-key">"count"</span>: <span class="t-acc">${Q.rows.length}</span>,\n  <span class="t-key">"results"</span>: [{\n    <span class="t-key">"name"</span>: <span class="t-ok">"${esc(first[0])}"</span>,\n    <span class="t-key">"path"</span>: <span class="t-ok">"${esc((first[1].includes(':') ? first[1] : Q.scope + '\\' + first[1]) + '\\' + first[0]).replace(/\\/g, '\\\\')}"</span>,\n    <span class="t-key">"is_dir"</span>: <span class="t-blue">false</span>\n  }, …]\n}`;
    if (flash) flash.innerHTML = `<span class="pill glass"><span class="dot"></span><b>${Q.ms.toFixed(1)} ms</b> median, complete CLI call</span>`;
  };
  const run = async () => {
    while (active) {
      const Q = QUERIES[idx++ % QUERIES.length];
      list.innerHTML = ''; status.innerHTML = '<span>Ready</span><span>23.7M indexed</span>';
      json.classList.remove('in'); flash?.classList.remove('in');
      showResult(Q, 0); await sleep(700);
      for (let i = 1; i <= Q.q.length && active; i++) { showResult(Q, i); await sleep(55 + Math.random() * 60); }
      if (!active) return;
      fill(Q, false);
      const rows = $$('.res-row', list);
      for (const row of rows) { row.classList.add('in'); await sleep(45); }
      flash?.classList.add('in');
      await sleep(400); json.classList.add('in');
      await sleep(3800);
    }
  };
  if (reduced) { const Q = QUERIES[0]; showResult(Q, Q.q.length); fill(Q, true); json.classList.add('in'); return; }
  onVisible(root, (vis) => { if (vis && !active) { active = true; run(); } else if (!vis && active) { active = false; clearTimeout(timer); } }, 0.25);
});

/* ---------- Wake scene: agent → (seekfs →) vanth → monitor → wake ---------- */
// The "combined" scene (home) finds the tests with seekfs first; the "direct" scene
// (vanth page) starts the job straight away, so seekfs never looks like a prerequisite.
const WAKE_TAIL = [
  [16600, '\n<span class="t-acc">⏰ Woken by vanth</span> <span class="t-dim">· job_7f3a2c completed · exit 0</span>', false],
  [17400, '<span class="t-blue">●</span> <span class="t-fg">vanth.job_run_summary</span>(job_id="job_7f3a2c")', false],
  [18100, 'All <span class="t-ok">412</span> payments integration tests passed in 3m 12s.\nNothing to fix. The summary and full log are attached to the job.', false],
];
const SCENES = {
  combined: {
    idleAt: 7600,
    phases: [[0, 'Search'], [5200, 'Hand off'], [8800, 'Monitor'], [16200, 'Wake']],
    lines: [
      // [start ms, html, type?]
      [300, '<span class="t-dim">F:\\git\\shop</span>  <span class="t-fg">agent</span>', false],
      [700, '<span class="t-acc">›</span> Find the payments integration tests, run them with vanth, and wake me when they finish.', true],
      [3300, '<span class="t-blue">●</span> <span class="t-fg">seekfs</span> --under F:\\git\\shop "*_test.go dir:payments"', false],
      [3800, '  <span class="t-dim">4 files · 21 ms</span>\n  payments\\checkout_test.go  payments\\refund_test.go\n  payments\\ledger_test.go    payments\\webhook_test.go', false],
      [5400, '<span class="t-blue">●</span> <span class="t-fg">vanth.job_start</span>(command="go test ./payments/... -tags integration",\n                  wake_me=true)', false],
      [6100, '  <span class="t-ok">job_7f3a2c</span> <span class="t-dim">started · wake target: this session</span>', false],
      [6900, 'Handed off. I\'ll pick this up when vanth wakes me.', false],
      [7600, '<span class="t-dim">◌ idle — no polling</span>', false],
      ...WAKE_TAIL,
    ],
  },
  direct: {
    idleAt: 5600,
    phases: [[0, 'Ask'], [3100, 'Hand off'], [8800, 'Monitor'], [16200, 'Wake']],
    lines: [
      [300, '<span class="t-dim">F:\\git\\shop</span>  <span class="t-fg">agent</span>', false],
      [700, '<span class="t-acc">›</span> Run the payments integration tests with vanth. Wake me when they finish.', true],
      [3300, '<span class="t-blue">●</span> <span class="t-fg">vanth.job_start</span>(command="go test ./payments/... -tags integration",\n                  wake_me=true)', false],
      [4100, '  <span class="t-ok">job_7f3a2c</span> <span class="t-dim">started · wake target: this session</span>', false],
      [4900, 'Handed off. I\'ll pick this up when vanth wakes me.', false],
      [5600, '<span class="t-dim">◌ idle — no polling</span>', false],
      ...WAKE_TAIL,
    ],
  },
};
const LOOP = 24500;
$$('[data-wake-scene]').forEach((root) => {
  const { lines: LINES, phases: PHASES, idleAt } = SCENES[root.dataset.wakeScene] || SCENES.combined;
  const term = $('.desk-agent .term-body', root), mon = $('.desk-monitor', root), agent = $('.desk-agent', root);
  const toast = $('.toast', root), bar = $('.bar>i', root), pct = $('[data-pct]', root), passed = $('[data-passed]', root), elapsed = $('[data-elapsed]', root);
  const path = $('.mon-chart path.line', root), area = $('.mon-chart path.area', root), clock = $('[data-clock]', root);
  const tabs = $$('.scene-tabs button', root);
  let start = performance.now(), running = false, raf = 0, lastHtml = '';
  const curve = Array.from({ length: 60 }, (_, i) => 0.9 - 0.75 * (1 - Math.exp(-i / 14)) + Math.sin(i * 1.7) * 0.025);
  const render = (t) => {
    let html = '';
    for (const [at, line, typed] of LINES) {
      if (t < at) break;
      if (typed) {
        const plain = line.replace(/<[^>]+>/g, '');
        const prefixLen = line.indexOf('</span>') + 7;
        const body = line.slice(prefixLen);
        const n = Math.min(body.length, Math.floor((t - at) / 26));
        html += line.slice(0, prefixLen) + esc(body.slice(0, n).replace(/&#39;/g, "'")) + (n < body.length ? '<span class="caret"></span>' : '') + '\n';
        void plain;
      } else html += line + '\n';
    }
    if (t > idleAt && t < 16600) html += '<span class="caret"></span>';
    if (html !== lastHtml) { term.innerHTML = html; lastHtml = html; }
    const monIn = t >= 8800;
    mon.classList.toggle('in', monIn); agent.classList.toggle('back', monIn && t < 16200);
    const p = Math.min(1, Math.max(0, (t - 9300) / 6600));
    bar.style.width = (p * 100).toFixed(1) + '%';
    pct.textContent = Math.round(p * 100) + '%';
    passed.textContent = Math.round(p * 412);
    const secs = Math.round(p * 192); elapsed.textContent = `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, '0')}s`;
    const pts = Math.max(2, Math.round(p * curve.length));
    const d = curve.slice(0, pts).map((y, i) => `${(i / (curve.length - 1) * 100).toFixed(2)},${(y * 100).toFixed(2)}`);
    path.setAttribute('d', 'M' + d.join(' L'));
    area.setAttribute('d', 'M0,100 L' + d.join(' L') + ` L${((pts - 1) / (curve.length - 1) * 100).toFixed(2)},100 Z`);
    toast.classList.toggle('in', t >= 16200 && t < 23600);
    const phase = PHASES.reduce((acc, ph, i) => (t >= ph[0] ? i : acc), 0);
    tabs.forEach((b, i) => b.setAttribute('aria-selected', String(i === phase)));
    if (clock) { const m = 46 + Math.floor((t / LOOP) * 4); clock.textContent = `10:${String(m).padStart(2, '0')} AM`; }
  };
  const loop = (now) => { if (!running) return; let t = now - start; if (t > LOOP) { start = now; t = 0; } render(t); raf = requestAnimationFrame(loop); };
  tabs.forEach((b, i) => b.addEventListener('click', () => { start = performance.now() - PHASES[i][0] - (i === 2 ? 3500 : i === 3 ? 2400 : i === 1 ? 2000 : 2600); if (reduced || !running) render(performance.now() - start); }));
  if (reduced) { render(19500); return; }
  render(0);
  onVisible(root, (vis) => { if (vis && !running) { running = true; start = performance.now() - (root._t || 0); raf = requestAnimationFrame(loop); } else if (!vis && running) { running = false; root._t = performance.now() - start; cancelAnimationFrame(raf); } }, 0.25);
});

/* ---------- Segmented toggles (changelog filter) ---------- */
$$('[data-seg]').forEach((seg) => {
  const target = $(seg.dataset.seg);
  const buttons = $$('button', seg);
  const pick = (btn) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    target.dataset.filter = btn.dataset.value;
    $$('[data-show]', target).forEach((el) => { el.hidden = !(el.dataset.show.split(' ').includes(btn.dataset.value) || btn.dataset.value === 'all'); });
  };
  buttons.forEach((b) => b.addEventListener('click', () => pick(b)));
  const def = buttons.find((b) => b.dataset.value === seg.dataset.default) || buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
  pick(def);
});
const os = /Windows/i.test(navigator.userAgent) ? 'win' : /Mac/i.test(navigator.userAgent) ? 'mac' : /Linux|X11/i.test(navigator.userAgent) ? 'linux' : 'win';
$$('[data-seg-os]').forEach((seg) => { const b = $(`button[data-value="${os}"]`, seg); b?.click(); });
$$('[data-os-name]').forEach((el) => { el.textContent = { win: 'Windows', mac: 'macOS', linux: 'Linux' }[os]; });
$$('[data-os-only]').forEach((el) => { el.hidden = !el.dataset.osOnly.split(' ').includes(os); });

/* ---------- Tabs (ARIA) ---------- */
$$('[data-tabs]').forEach((root) => {
  const tabs = $$('[role="tab"]', root);
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (panel) { panel.hidden = !on; const v = $('video', panel); if (v) { if (on && !reduced) v.play().catch(() => {}); else v.pause(); } }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); select(e.key === 'Home' ? tabs[0] : tabs.at(-1), true); return; }
      if (!dir) return; e.preventDefault(); select(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
});

/* ---------- Videos: play only while visible ---------- */
$$('video[data-autoplay]').forEach((v) => {
  if (reduced) return;
  onVisible(v, (vis) => { if (vis && !v.closest('[hidden]')) v.play().catch(() => {}); else v.pause(); }, 0.35);
});

/* ---------- Copy ---------- */
$$('[data-copy]').forEach((btn) => {
  const label = btn.textContent;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Copied'; }
    catch { btn.textContent = 'Select to copy'; }
    setTimeout(() => { btn.textContent = label; }, 1600);
  });
});

/* ---------- Benchmark bars ---------- */
$$('[data-bench]').forEach((root) => {
  const bars = $$('.track i', root);
  const max = Math.max(...bars.map((i) => +i.dataset.ms));
  const go = () => bars.forEach((i) => { i.style.width = (+i.dataset.ms / max * 100).toFixed(1) + '%'; });
  if (reduced) return go();
  onVisible(root, (vis) => vis && go(), 0.3);
});

/* ---------- Search syntax explorer ---------- */
$$('[data-syntax]').forEach((root) => {
  const out = $('.syntax-out .term-body', root), buttons = $$('[role="tab"]', root);
  const panel = $('.syntax-out', root), list = $('[role="tablist"]', root);
  const orientation = matchMedia('(min-width:900px)');
  const orient = () => list.setAttribute('aria-orientation', orientation.matches ? 'vertical' : 'horizontal');
  orient(); orientation.addEventListener('change', orient);
  const show = (b) => {
    buttons.forEach((x) => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
    panel.setAttribute('aria-labelledby', b.id);
    out.innerHTML = $(`template#${b.dataset.tpl}`).innerHTML;
  };
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => show(b));
    b.addEventListener('keydown', (e) => {
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      const n = e.key === 'Home' ? buttons[0] : e.key === 'End' ? buttons.at(-1) : dir ? buttons[(i + dir + buttons.length) % buttons.length] : null;
      if (!n) return; e.preventDefault(); show(n); n.focus();
    });
  });
  show(buttons[0]);
});

/* ---------- Doc nav highlighting ---------- */
const docLinks = $$('.doc-nav a[href^="#"]');
if (docLinks.length && 'IntersectionObserver' in window) {
  const map = new Map(docLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { docLinks.forEach((a) => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
  }), { rootMargin: '-20% 0px -70% 0px' });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

/* ---------- Latest release badges (public GitHub API; hidden on failure) ---------- */
$$('[data-release]').forEach(async (el) => {
  const repo = el.dataset.release, key = `release:${repo}`;
  let rel = null;
  try { rel = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch {}
  if (!rel) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) return;
      const j = await res.json(); rel = { tag: j.tag_name, url: j.html_url };
      try { sessionStorage.setItem(key, JSON.stringify(rel)); } catch {}
    } catch { return; }
  }
  if (!rel?.tag) return;
  $('b', el).textContent = rel.tag; el.href = rel.url; el.hidden = false;
});
})();
