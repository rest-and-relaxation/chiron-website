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

    reveal('.manifesto .section-label', '.manifesto', { y: 26 });

    function revealManifestoLines() {
      const copy = document.querySelector('.manifesto h2');
      if (!copy || copy.dataset.linesReady) return;

      const text = copy.textContent.trim();
      copy.dataset.linesReady = 'true';
      copy.setAttribute('aria-label', text);
      copy.innerHTML = text.split(/\s+/).map(word => `<span class="manifesto-word" aria-hidden="true">${word}&nbsp;</span>`).join('');

      const groups = [];
      Array.from(copy.children).forEach(word => {
        const lastGroup = groups.at(-1);
        if (!lastGroup || Math.abs(lastGroup.top - word.offsetTop) > 1) {
          groups.push({ top: word.offsetTop, words: [word] });
        } else {
          lastGroup.words.push(word);
        }
      });

      const lines = document.createDocumentFragment();
      groups.forEach(group => {
        const line = document.createElement('span');
        const inner = document.createElement('span');
        line.className = 'manifesto-line';
        inner.className = 'manifesto-line__inner';
        group.words.forEach(word => inner.append(word));
        line.append(inner);
        lines.append(line);
      });
      copy.replaceChildren(lines);

      gsap.from(copy.querySelectorAll('.manifesto-line__inner'), {
        autoAlpha: 0,
        yPercent: 105,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform,visibility,willChange',
        scrollTrigger: {
          trigger: copy,
          start: 'top 80%',
          once: true,
          refreshPriority: -1
        }
      });
    }

    const startManifestoLines = () => {
      revealManifestoLines();
      ScrollTrigger.refresh();
    };
    document.fonts?.ready ? document.fonts.ready.then(startManifestoLines) : startManifestoLines();

    reveal('.gallery-card', '.gallery', { stagger: 0.12, y: 38, duration: 0.9, start: 'top 85%' });
    reveal('.footage-heading > *', '.footage', { stagger: 0.12, y: 28 });
    reveal('.video-card', '.video-grid', { stagger: 0.12, y: 32, start: 'top 84%' });
    reveal('.enquiry-title, .enquiry-action', '.enquiry', { stagger: 0.14, y: 28 });
    reveal('.footer-brand, .footer-links', '.site-footer', { stagger: 0.12, y: 22, duration: 0.75 });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pagehide', () => context.revert(), { once: true });
})();
