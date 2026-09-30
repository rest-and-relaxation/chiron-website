(() => {
  document.querySelectorAll('.scroll-cue').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
})();
