(() => {
  const doc = document.documentElement;
  const menu = document.querySelector('.studio-menu');
  const summary = menu?.querySelector('summary');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = () => {
    doc.dataset.theme = systemTheme.matches ? 'dark' : 'light';
    window.dispatchEvent(new Event('themechange'));
  };
  applyTheme();
  systemTheme.addEventListener('change', applyTheme);
  document.querySelectorAll('[data-open-products]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!menu) return;
      menu.open = true;
      summary.focus({ preventScroll:true });
    });
  });
  if (menu) {
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !event.target.closest('[data-open-products]')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
    });
    menu.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !menu.contains(event.relatedTarget)) menu.open = false;
    });
  }
  document.querySelectorAll('[data-root-product]').forEach((link) => {
    const emit = (product) => window.dispatchEvent(new CustomEvent('holdfast:product', {detail:product}));
    link.addEventListener('pointerenter', () => emit(link.dataset.rootProduct));
    link.addEventListener('focus', () => emit(link.dataset.rootProduct));
    link.addEventListener('pointerleave', () => emit(''));
    link.addEventListener('blur', () => emit(''));
  });
  document.querySelectorAll('[data-copy]').forEach((button) => button.setAttribute('aria-live', 'polite'));
})();
