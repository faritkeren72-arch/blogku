// main.js

// 1) Mobile navigation toggle (aksesibel, non-blocking dengan defer)
(() => {
  const btn = document.querySelector('[data-toggle="nav"]');
  const panel = document.querySelector('[data-nav-panel]');
  if (!btn || !panel) return;

  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.setAttribute('data-open', String(open));
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const open = btn.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  }, { passive: true });
})();

// 2) Touch-friendly passive listeners (menghindari blocking scroll)
window.addEventListener('touchstart', () => {}, { passive: true });
window.addEventListener('touchmove',  () => {}, { passive: true });

// 3) Lazy loading gambar (browser-level + IO fallback)
(() => {
  const imgs = document.querySelectorAll('img');
  // Set atribut default untuk performa
  imgs.forEach(img => {
    if (!img.hasAttribute('loading'))  img.setAttribute('loading', 'lazy'); // browser-level lazy
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async'); // decode non-blocking
  }); // [8][11]

  const lazyImgs = document.querySelectorAll('img[loading="lazy"]');

  const markLoaded = (img) => {
    img.classList.add('is-loaded');
  }; // [8]

  // Jika browser mendukung loading="lazy"
  if ('loading' in HTMLImageElement.prototype) {
    lazyImgs.forEach(img => {
      if (img.dataset && img.dataset.src) img.src = img.dataset.src; // isi sumber saat diperlukan
      if (img.complete) markLoaded(img); // jika sudah lengkap, tandai loaded
      else img.addEventListener('load', () => markLoaded(img), { once: true, passive: true });
    });
    return;
  } // [8][17]

  // Fallback: IntersectionObserver
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        if (img.dataset && img.dataset.src) img.src = img.dataset.src;
        img.addEventListener('load', () => markLoaded(img), { once: true, passive: true });
        obs.unobserve(img);
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    lazyImgs.forEach(img => io.observe(img));
  } else {
    // Tanpa IO: muat segera dengan graceful degradation
    lazyImgs.forEach(img => {
      if (img.dataset && img.dataset.src) img.src = img.dataset.src;
      img.addEventListener('load', () => markLoaded(img), { once: true, passive: true });
    });
  } // [15][12]
})();
