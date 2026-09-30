// Keep the page fully visible if the optional motion scripts are unavailable.
if (window.gsap && window.ScrollTrigger) {
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // matchMedia creates a GSAP context for each layout and reverts its animations
  // when the breakpoint or reduced-motion preference changes.
  const motion = gsap.matchMedia();
  motion.add({
    desktop: '(min-width: 801px) and (prefers-reduced-motion: no-preference)',
    compact: '(max-width: 800px) and (prefers-reduced-motion: no-preference)',
  }, ({ conditions }) => {
    const desktop = conditions.desktop;
    const travel = desktop ? 28 : 16;
    const reveal = (target, trigger, options = {}) => {
      gsap.from(target, {
        autoAlpha: 0,
        y: travel,
        duration: desktop ? 0.85 : 0.65,
        ease: 'power3.out',
        stagger: options.stagger || 0,
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: {
          trigger,
          start: 'top 88%',
          once: true,
        },
      });
    };

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.shell-header', { autoAlpha: 0, y: -16, duration: 0.65, clearProps: 'transform,opacity,visibility' })
      .from('.hero .section-kicker', { autoAlpha: 0, y: 12, duration: 0.55, clearProps: 'transform,opacity,visibility' }, 0.12)
      .from('.hero h1', { autoAlpha: 0, y: desktop ? 34 : 20, duration: 0.9, clearProps: 'transform,opacity,visibility' }, 0.2)
      .from('.hero-bottom p', { autoAlpha: 0, y: 18, duration: 0.7, clearProps: 'transform,opacity,visibility' }, 0.45)
      .from('.hero-actions .button', { autoAlpha: 0, y: 14, duration: 0.62, stagger: 0.09, clearProps: 'transform,opacity,visibility' }, 0.55)
      .from('.hero-data span', { autoAlpha: 0, y: 8, duration: 0.45, stagger: 0.06, clearProps: 'transform,opacity,visibility' }, 0.7)
      .from('.hero-image', { autoAlpha: 0, y: 24, duration: 0.9, clearProps: 'transform,opacity,visibility' }, 0.64);

    const heroImage = document.querySelector('.hero-image--layered');
    if (heroImage) {
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'hero-layer-parallax',
          trigger: heroImage,
          start: 'clamp(top bottom)',
          end: 'bottom top',
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      })
        .fromTo('.hero-layer--background', { yPercent: desktop ? -3 : -2 }, { yPercent: desktop ? 3 : 2 }, 0)
        .fromTo('.hero-layer--foreground', { yPercent: 0 }, { yPercent: desktop ? 8 : 4 }, 0);
      heroImage.querySelectorAll('img').forEach(image => {
        if (!image.complete) image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      });
    }

    reveal('.pathways .section-head', '.pathways');
    document.querySelectorAll('.path-row').forEach((row) => {
      reveal(row.children, row, { stagger: desktop ? 0.08 : 0.055 });
    });

    reveal('.product-feature__content > *', '.product-feature', { stagger: 0.1 });
    reveal('.product-data > *', '.product-data', { stagger: 0.055 });
    if (desktop) {
      gsap.fromTo('.product-feature__image',
        { yPercent: -3, scale: 1.07 },
        {
          yPercent: 3,
          scale: 1.07,
          ease: 'none',
          scrollTrigger: {
            trigger: '.product-feature',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
    }

    reveal('.footage-head > *', '.footage-head', { stagger: 0.1 });
    document.querySelectorAll('.video-card').forEach((card) => reveal(card, card));
    reveal('.site-enquiry > *', '.site-enquiry', { stagger: 0.12 });
    reveal('.global-footer__links > *, .global-footer__wordmark, .global-footer__bottom', '.global-footer', { stagger: 0.08 });
  }, document.body);

  window.addEventListener('pagehide', () => motion.revert(), { once: true });
}
