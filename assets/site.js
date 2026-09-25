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
const autoPlayed = new WeakSet();
if (!motionReduced) {
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (!autoPlayed.has(video)) {
            autoPlayed.add(video);
            video.play().catch(() => {});
          }
        }
      });
    }, { threshold: 0.35 });
    demos.forEach((video) => videoObserver.observe(video));
  } else demos.forEach((video) => { autoPlayed.add(video); video.play().catch(() => {}); });
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
