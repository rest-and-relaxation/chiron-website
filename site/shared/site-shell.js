(() => {
  const siteRoot = new URL('../', document.currentScript.src);
  // The homepage and interior pages share one navigation template.
  const mount = document.querySelector('[data-site-header]');
  if (mount) {
    const page = mount.dataset.page || '';
    const links = [
      ['home', 'Home', siteRoot.href],
      ['about', 'About us', '../about/'],
      ['products', 'Products', '../products/'],
      ['videos', 'Videos', '../videos/'],
      ['partners', 'Our partners', '../partners/'],
    ];
    const navLinks = links.map(([key, label, href]) =>
      `<a href="${key === 'home' ? href : new URL(href.replace('../', ''), siteRoot).href}"${page === key ? ' aria-current="page"' : ''}>${label}</a>`
    ).join('');
    mount.outerHTML = `<header class="shell-header" id="top">
      <a class="shell-brand" href="${siteRoot.href}" aria-label="Chiron Global Tech home"><img src="${new URL('assets/chiron-logo.png', siteRoot).href}" alt="Chiron Global Tech"></a>
      <button class="shell-menu" type="button" aria-expanded="false" aria-controls="shell-nav" data-shell-menu><span>Menu</span><i aria-hidden="true"></i><i aria-hidden="true"></i></button>
      <nav class="shell-nav" id="shell-nav" aria-label="Primary navigation" data-shell-nav>
        ${navLinks}<a class="shell-contact ui-button ui-button--secondary" href="mailto:?subject=Chiron%20Global%20Tech%20enquiry"${page === 'contact' ? ' aria-current="page"' : ''}>Contact <span aria-hidden="true">↗</span></a>
      </nav>
    </header>`;
  }

  const enquiryMount = document.querySelector('[data-site-enquiry]');
  if (enquiryMount) {
    enquiryMount.outerHTML = `<section class="site-enquiry interior-reveal" id="contact" aria-labelledby="enquiry-title">
      <div><h2 id="enquiry-title">Need to assess the right path for your team?</h2></div>
      <div class="site-enquiry__action"><p>Tell Chiron about your use case, organisation and timing.</p><a class="ui-button ui-button--secondary" href="mailto:?subject=Chiron%20Global%20Tech%20enquiry">Discuss your requirements <span aria-hidden="true">↗</span></a></div>
    </section>`;
  }

  const footerMount = document.querySelector('[data-site-footer]');
  if (footerMount) {
    footerMount.outerHTML = `<footer class="global-footer">
      <div class="global-footer__links">
        <div class="global-footer__statement"><p>Protect those who serve.<br>Prepare them to perform.</p><p class="global-footer__trademark">Chiron-X™ Series, Chiron-X1™, Chiron-X1R™ and Chiron-X3™ are trademarks of Chiron Global Tech. Pty Ltd.</p></div>
        <div><span>Explore</span><a href="${new URL('products/', siteRoot).href}">Products</a><a href="${new URL('about/#combatives', siteRoot).href}">Training &amp; capabilities</a><a href="${new URL('about/#technical', siteRoot).href}">Technical</a><a href="${new URL('videos/', siteRoot).href}">Videos</a></div>
        <div><span>Get in touch</span><a href="https://www.linkedin.com/company/chironglobal/home/?viewAsMember=true" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://x.com/chirongt" target="_blank" rel="noopener noreferrer">X ↗</a><a href="https://www.facebook.com/ChironGlobalTech" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>
      </div>
      <div class="global-footer__wordmark" aria-hidden="true"><img src="${new URL('assets/chiron-horse.png', siteRoot).href}" alt=""><span>CHIRON</span><strong>GLOBAL</strong><em>TECH</em></div>
      <div class="global-footer__bottom"><small>© CHIRON GLOBAL TECH</small><small>© 2024 Chiron Global Tech. Pty Ltd, ABN 82 643 458 539, All rights reserved.</small></div>
    </footer>`;
  }
  const button = document.querySelector('[data-shell-menu]');
  const nav = document.querySelector('[data-shell-nav]');
  if (!button || !nav) return;
  const close = () => { button.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') !== 'true'; button.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 800) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
