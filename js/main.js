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

// Scrollspy: highlight nav link of section currently in view.
const navLinkMap = new Map();
document.querySelectorAll('.nav-link[href^="#"]').forEach((link) => {
  const id = link.getAttribute('href').slice(1);
  if (id) navLinkMap.set(id, link);
});

if (navLinkMap.size && 'IntersectionObserver' in window) {
  const setActive = (id) => {
    navLinkMap.forEach((link, key) => {
      const isActive = key === id;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // Pick the entry with the largest visible area.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  navLinkMap.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
