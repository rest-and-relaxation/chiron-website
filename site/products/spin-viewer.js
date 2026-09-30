(() => {
  const viewer = document.querySelector('[data-spin-viewer]');
  if (!viewer) return;
  const stage = viewer.querySelector('[data-spin-stage]');
  const dismissHint = () => viewer.classList.add('has-interacted');
  const image = stage.querySelector('img');
  const controls = viewer.querySelector('[data-spin-controls]');
  const status = viewer.querySelector('[data-spin-status]');
  const actions = viewer.querySelector('[data-spin-actions]');
  const slider = viewer.querySelector('[data-spin-range]');
  const buttons = [...actions.querySelectorAll('button')];
  const total = 18;
  const frames = new Array(total);
  const base = new URL('assets/x1-360/', document.currentScript.src);
  let frame = 0;
  let ready = false;
  let loading = false;
  let pointer = null;
  let position = 0;
  let target = 0;
  let previousTime = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paint = 0;

  controls.hidden = false;
  actions.hidden = false;
  stage.setAttribute('role', 'group');
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-disabled', 'true');
  const show = index => {
    const nextFrame = (Math.round(index) % total + total) % total;
    frame = nextFrame;
    if (!frames[frame]) return;
    if (image.src !== frames[frame].src) image.src = frames[frame].src;
    slider.value = String(frame + 1);
    const view = frame === 0 ? ', front' : frame === 4 ? ', side' : frame === 9 ? ', back' : '';
    slider.setAttribute('aria-valuetext', `Armour view ${frame + 1} of ${total}${view}`);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.spinView) === frame)));
  };
  const tick = time => {
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 16;
    previousTime = time;
    position += (target - position) * (1 - Math.exp(-elapsed / 65));
    if (Math.abs(target - position) < .015) position = target;
    show(position);
    if (position !== target) paint = requestAnimationFrame(tick);
    else { paint = 0; previousTime = 0; }
  };
  const queue = index => {
    target = index;
    if (reducedMotion.matches) {
      if (paint) cancelAnimationFrame(paint);
      paint = 0;
      previousTime = 0;
      position = target;
      show(position);
    } else if (!paint) paint = requestAnimationFrame(tick);
  };
  const goTo = index => {
    // Follow the shortest route to the chosen photographed viewpoint.
    const current = (position % total + total) % total;
    const delta = ((index - current + total * 1.5) % total) - total / 2;
    queue(position + delta);
  };
  const load = async () => {
    if (loading || ready) return;
    loading = true;
    viewer.dataset.state = 'loading';
    buttons.forEach(button => { button.disabled = true; });
    slider.disabled = true;
    status.textContent = 'Loading rotation…';
    let next = 0;
    const worker = async () => {
      while (next < total) {
        const index = next++;
        const photo = new Image();
        photo.decoding = 'async';
        photo.src = new URL(`x1-spin-${String(index + 1).padStart(3, '0')}.webp`, base).href;
        await photo.decode();
        frames[index] = photo;
      }
    };
    try {
      // Limit simultaneous decoding, especially on phones.
      const results = await Promise.allSettled([worker(), worker(), worker()]);
      if (results.some(result => result.status === 'rejected')) throw new Error('Frame unavailable');
      ready = true;
      viewer.dataset.state = 'ready';
      stage.setAttribute('aria-disabled', 'false');
      buttons.forEach(button => { button.disabled = false; });
      slider.disabled = false;
      status.textContent = 'Rotation ready.';
      show(frame);
    } catch {
      viewer.dataset.state = 'error';
      status.textContent = 'Rotation unavailable. Select Front to retry.';
      actions.querySelector('[data-spin-front]').disabled = false;
    } finally {
      loading = false;
    }
  };
  stage.addEventListener('pointerdown', event => {
    if (!ready || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dismissHint();
    pointer = { id: event.pointerId, x: event.clientX, position };
    stage.setPointerCapture(event.pointerId);
    viewer.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const distance = event.clientX - pointer.x;
    const step = Math.max(16, stage.clientWidth / total);
    queue(pointer.position - distance / step);
  });
  const release = () => {
    pointer = null;
    viewer.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('keydown', event => {
    if (!ready) { load(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    dismissHint();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? total - 1 : frame + (event.key === 'ArrowRight' ? 1 : -1));
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    if (ready) { dismissHint(); goTo(Number(button.dataset.spinView)); } else load();
  }));
  slider.addEventListener('input', () => { if (ready) { dismissHint(); goTo(Number(slider.value) - 1); } });
  stage.addEventListener('focus', load);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
    }, { rootMargin: '300px' });
    observer.observe(viewer);
  } else load();
})();
