document.documentElement.classList.add('js');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
}
document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });
document.querySelectorAll('video').forEach((video) => video.addEventListener('error', () => { const fallback = video.closest('.video-frame')?.querySelector('.video-fallback'); if (fallback) fallback.hidden = false; }));
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const demos = document.querySelectorAll('[data-autoplay-demo]');
if (!motionReduced) {
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.35 });
    demos.forEach((video) => videoObserver.observe(video));
  } else demos.forEach((video) => video.play().catch(() => {}));
}
document.addEventListener('click', (event) => {
  document.querySelectorAll('.products-menu[open]').forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.querySelectorAll('.products-menu[open]').forEach((menu) => { menu.open = false; });
});
document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copyTarget);
    if (!source || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy commands'; }, 1800);
    } catch { button.textContent = 'Select commands to copy'; }
  });
});
const wakeTabs = document.querySelector('[data-wake-tabs]');
if (wakeTabs) {
  const tabs = [...wakeTabs.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  const select = (index) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      const video = panels[i].querySelector('video');
      if (active && !motionReduced) video.play().catch(() => {});
      else video.pause();
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = (i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
  select(0);
}
const modes = document.querySelector('[data-monitor-modes]');
if (modes) {
  const output = modes.querySelector('[data-monitor-output]');
  const tabs = [...modes.querySelectorAll('[data-monitor-tab]')];
  const frames = {
    events: 'Vanth monitor / Events\n\n358  metric      seekfs CLI query 179\n359  progress    Measured 179 of 180 queries\n360  metric      seekfs CLI query 180\n361  progress    Measured 180 of 180 queries\n362  completed   exit 0',
    logs: 'Vanth monitor / Log tail\n\nAGENT_EVENT  metric     seekfs CLI query 179\nAGENT_EVENT  progress   Measured 179 of 180 queries\nAGENT_EVENT  metric     seekfs CLI query 180\nAGENT_EVENT  progress   Measured 180 of 180 queries',
    slowest: 'Vanth monitor / Slowest runs\n\n1m01s  holdfast-live-search-metrics-4   completed\n1m01s  holdfast-live-search-metrics-5   completed\n0m34s  holdfast-live-search-metrics-3   completed\n0m27s  holdfast-live-search-metrics-2   completed'
  };
  let current = 0;
  const select = (index) => {
    current = index;
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === current));
    output.textContent = frames[tabs[current].dataset.monitorTab];
    output.classList.remove('flash');
    void output.offsetWidth;
    output.classList.add('flash');
  };
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
  select(0);
  if (!motionReduced) window.setInterval(() => select((current + 1) % tabs.length), 4500);
}
