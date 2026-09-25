document.documentElement.classList.add('js');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
}
document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });
document.querySelectorAll('video').forEach((video) => video.addEventListener('error', () => { const fallback = video.closest('.video-frame')?.querySelector('.video-fallback'); if (fallback) fallback.hidden = false; }));
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.preview-video').forEach((video) => { video.removeAttribute('autoplay'); video.pause(); });
}
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
