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
        if (entry.isIntersecting && !video.closest('[role="tabpanel"][hidden]')) video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.35 });
    demos.forEach((video) => videoObserver.observe(video));
  } else demos.forEach((video) => video.play().catch(() => {}));
}
document.querySelectorAll('[data-agent-demo]').forEach((demo) => {
  const tabs = [...demo.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((item) => {
      const active = item === tab;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      item.setAttribute('aria-selected', String(active));
      item.classList.toggle('is-active', active);
      item.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      const video = panel.querySelector('video');
      if (active && !motionReduced) video.play().catch(() => {});
      else video.pause();
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
});
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
