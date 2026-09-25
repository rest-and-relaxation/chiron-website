document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
}

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
mobileNav.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 800) setMenu(false);
});
