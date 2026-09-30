(() => {
  const form = document.getElementById('contact-form');
  const message = document.getElementById('message');
  const count = document.getElementById('message-count');
  const panel = document.getElementById('review-panel');
  const review = document.getElementById('review-copy');
  const copyButton = document.getElementById('copy-enquiry');
  const copyStatus = document.getElementById('copy-status');
  if (!form || !message || !count || !panel || !review || !copyButton) return;

  message.addEventListener('input', () => { count.textContent = `${message.value.length} / 500 characters`; });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    review.textContent = [
      `Name: ${data.get('name')}`,
      `Organisation / company: ${data.get('organisation') || 'N/A'}`,
      `Title / rank: ${data.get('title') || 'N/A'}`,
      `Country: ${data.get('country') || 'N/A'}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone')}`,
      `Regarding: ${data.get('regarding')}`,
      '',
      'Enquiry:',
      String(data.get('message')).trim()
    ].join('\n');
    panel.hidden = false;
    copyStatus.textContent = '';
    panel.focus({preventScroll:true});
    panel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(review.textContent);
      copyStatus.textContent = 'Enquiry copied to clipboard.';
    } catch {
      copyStatus.textContent = 'Clipboard access is unavailable here. Select and copy the text above.';
    }
  });
})();
