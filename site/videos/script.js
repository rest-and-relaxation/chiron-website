(() => {
  const choices = [...document.querySelectorAll('.film-choice')];
  const container = document.querySelector('#featured-player');
  const title = document.querySelector('#featured-title');
  const label = document.querySelector('#player-label');
  const watch = document.querySelector('#watch-vimeo');
  const status = document.querySelector('.player-status');
  const featured = document.querySelector('#featured');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!container || !choices.length) return;
  const posterTemplate = container.querySelector('.player-poster').cloneNode(true);
  let selected = choices[0];
  let player;
  let loadTimer;
  let generation = 0;

  const play = () => {
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
      status.textContent = 'If the video does not load, use “Watch on Vimeo” to open it directly.';
    };
    loadTimer = window.setTimeout(unavailable, 15000);
    iframe.addEventListener('error', unavailable);
    container.replaceChildren(iframe);
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
    const embed = new URL(choice.dataset.embed);
    const hash = embed.searchParams.get('h');
    watch.href = `https://vimeo.com/${embed.pathname.split('/').pop()}${hash ? `/${hash}` : ''}`;
    if (autoplay) {
      play();
    } else {
      const poster = posterTemplate.cloneNode(true);
      poster.querySelector('img').src = choice.dataset.poster;
      poster.setAttribute('aria-label', `Play ${choice.dataset.title}`);
      container.replaceChildren(poster);
    }
    if (scroll) featured.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
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
