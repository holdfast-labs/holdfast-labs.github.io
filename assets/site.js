document.documentElement.classList.add('js');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}
document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });
document.querySelectorAll('video').forEach((video) => video.addEventListener('error', () => { const fallback = video.closest('.video-frame')?.querySelector('.video-fallback'); if (fallback) fallback.hidden = false; }));
