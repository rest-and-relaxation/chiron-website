/* Chiron v1 motion: composed entrances, then restrained scroll reveals. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.context(() => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    intro
      .from('.hero-image', { scale: 1.045, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.site-header .brand, .site-header .desktop-nav a, .site-header .header-contact, .site-header .menu-toggle', {
        autoAlpha: 0, y: -12, duration: 0.65, stagger: 0.065
      }, 0.2)
      .from('.hero-content .eyebrow', { autoAlpha: 0, y: 14, duration: 0.6 }, 0.42)
      .from('.hero h1', { autoAlpha: 0, y: 36, duration: 0.95 }, 0.54)
      .from('.hero-content .button', { autoAlpha: 0, y: 16, duration: 0.72 }, 0.82)
      .from('.hero-inset', { autoAlpha: 0, y: 24, duration: 0.85 }, 0.93);

    function reveal(targets, trigger, options = {}) {
      gsap.from(targets, {
        autoAlpha: 0,
        y: options.y ?? 30,
        duration: options.duration ?? 0.85,
        stagger: options.stagger ?? 0,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform',
        scrollTrigger: {
          trigger,
          start: options.start ?? 'top 82%',
          once: true
        }
      });
    }

    reveal('.manifesto .section-label, .manifesto h2', '.manifesto', { stagger: 0.14, y: 26 });
    reveal('.gallery-card', '.gallery', { stagger: 0.12, y: 38, duration: 0.9, start: 'top 85%' });
    reveal('.footage-heading > *', '.footage', { stagger: 0.12, y: 28 });
    reveal('.video-card', '.video-grid', { stagger: 0.12, y: 32, start: 'top 84%' });
    reveal('.enquiry-title, .enquiry-action', '.enquiry', { stagger: 0.14, y: 28 });
    reveal('.footer-brand, .footer-links', '.site-footer', { stagger: 0.12, y: 22, duration: 0.75 });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pagehide', () => context.revert(), { once: true });
})();
