(() => {
  if (!window.gsap || !window.ScrollTrigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const features = document.querySelector('.products-features');
  if (!features) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(features.querySelectorAll('li'), {
    y: 16,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.055,
    ease: 'power2.out',
    clearProps: 'all',
    scrollTrigger: { trigger: features, start: 'top 82%', once: true }
  });
})();
