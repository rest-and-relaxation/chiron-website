(() => {
  const choices = [...document.querySelectorAll('.film-choice')];
  const container = document.querySelector('#featured-player');
  const title = document.querySelector('#featured-title');
  const label = document.querySelector('#player-label');
  const status = document.querySelector('.player-status');
  const featured = document.querySelector('#featured');
  const header = document.querySelector('.shell-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!container || !choices.length) return;
  const posterTemplate = container.querySelector('.player-poster').cloneNode(true);
  let selected = choices[0];
  let player;
  let loadTimer;
  let generation = 0;
  let apiPromise;
  const loadPlayerApi = () => {
    if (window.Vimeo?.Player) return Promise.resolve();
    return apiPromise ||= new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = script.onerror = resolve;
      document.head.append(script);
      // The embedded player can still play if the optional API is unavailable.
      window.setTimeout(resolve, 8000);
    });
  };

  const alignPlayer = () => featured.scrollIntoView({
    behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start'
  });
  if (header) {
    const updateHeaderHeight = () => document.body.style.setProperty('--video-header-height', `${header.getBoundingClientRect().height}px`);
    updateHeaderHeight();
    new ResizeObserver(updateHeaderHeight).observe(header);
  }

  const play = async () => {
    alignPlayer();
    const version = ++generation;
    clearTimeout(loadTimer);
    player?.destroy().catch(() => {});
    player = null;
    container.setAttribute('aria-busy', 'true');
    label.textContent = 'Selected video';
    status.textContent = 'Loading video…';
    const iframe = document.createElement('iframe');
    const embed = new URL(selected.dataset.embed);
    embed.searchParams.set('autoplay', '1');
    embed.searchParams.set('title', '0');
    embed.searchParams.set('byline', '0');
    embed.searchParams.set('portrait', '0');
    iframe.src = embed.href;
    iframe.title = selected.dataset.title;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const unavailable = () => {
      if (version !== generation) return;
      clearTimeout(loadTimer);
      container.setAttribute('aria-busy', 'false');
      status.textContent = 'The video could not load. Please refresh the page and try again.';
    };
    loadTimer = window.setTimeout(unavailable, 15000);
    iframe.addEventListener('error', unavailable);
    container.replaceChildren(iframe);
    await loadPlayerApi();
    if (version !== generation) return;
    if (window.Vimeo?.Player) {
      player = new window.Vimeo.Player(iframe);
      player.ready().then(() => {
        if (version !== generation) return;
        clearTimeout(loadTimer);
        container.setAttribute('aria-busy', 'false');
        status.textContent = '';
      }).catch(unavailable);
      player.on('error', unavailable);
      player.on('play', () => { if (version === generation) label.textContent = 'Now playing'; });
      player.on('pause', () => { if (version === generation) label.textContent = 'Paused'; });
      player.on('ended', () => { if (version === generation) label.textContent = 'Finished'; });
    } else {
      iframe.addEventListener('load', () => {
        if (version !== generation) return;
        clearTimeout(loadTimer);
        container.setAttribute('aria-busy', 'false');
        status.textContent = '';
      });
    }
  };
  const select = (choice, { autoplay = true, scroll = true } = {}) => {
    selected = choice;
    choices.forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    title.textContent = choice.dataset.title;
    if (autoplay) {
      play();
    } else {
      const poster = posterTemplate.cloneNode(true);
      const image = poster.querySelector('img');
      image.src = choice.dataset.poster;
      const thumbnail = choice.querySelector('.film-thumbnail img');
      image.srcset = thumbnail.srcset;
      poster.setAttribute('aria-label', `Play ${choice.dataset.title}`);
      container.replaceChildren(poster);
    }
    if (scroll && !autoplay) alignPlayer();
  };
  container.addEventListener('click', event => {
    if (event.target.closest('.player-poster')) play();
  });
  choices.forEach(choice => choice.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('video', choice.dataset.video);
    url.hash = 'featured';
    window.history.replaceState(null, '', url);
    select(choice);
  }));
  const requested = new URLSearchParams(window.location.search).get('video');
  const requestedChoice = choices.find(choice => choice.dataset.video === requested);
  if (requestedChoice) select(requestedChoice, { autoplay: false, scroll: true });
})();
