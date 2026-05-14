// Navigation + small enhancements.

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Belt-and-suspenders: ensure rel attributes on every target=_blank link.
document.querySelectorAll('a[target="_blank"]').forEach((a) => {
  const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
  if (!rel.includes('noopener')) rel.push('noopener');
  if (!rel.includes('noreferrer')) rel.push('noreferrer');
  a.setAttribute('rel', rel.join(' '));
});
