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
document.querySelectorAll('[data-copy-target]').forEach((button) => {
  const label = button.textContent;
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copyTarget);
    if (!source || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(source.textContent.replace(/^\$\s*/gm, '').trim());
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = label; }, 1800);
    } catch { button.textContent = 'Select to copy'; }
  });
});
// Latest-release badge on product pages, from the public GitHub API. Stays hidden on any failure.
document.querySelectorAll('[data-release]').forEach(async (badge) => {
  const repo = badge.dataset.release, key = `release:${repo}`;
  let release = null;
  try { release = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch {}
  if (!release) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) return;
      const data = await res.json();
      release = { tag: data.tag_name, url: data.html_url, at: data.published_at };
      try { sessionStorage.setItem(key, JSON.stringify(release)); } catch {}
    } catch { return; }
  }
  if (!release || !release.tag) return;
  const days = Math.floor((Date.now() - new Date(release.at)) / 864e5);
  const when = days <= 0 ? 'today' : days === 1 ? 'yesterday' : days < 30 ? `${days} days ago` : new Date(release.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  badge.querySelector('b').textContent = release.tag;
  badge.querySelector('span').textContent = `released ${when}`;
  if (release.url) badge.href = release.url;
  badge.hidden = false;
});
