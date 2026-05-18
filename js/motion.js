/* motion.js — Lenis smooth scroll + scroll-reveal IntersectionObserver + hero parallax */

(function () {
  var io = null;

  // ── IntersectionObserver ──
  function createObserver() {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  }

  var SELECTORS = [
    '.reveal',
    '.rm-phase',
    '.about-features .feature-item',
    '.features-grid .feature-item',
    '.talk-card',
    '.profile-card',
  ].join(', ');

  function scan() {
    if (!io) return;
    document.querySelectorAll(SELECTORS + ':not([data-mo])').forEach(function (el) {
      el.setAttribute('data-mo', '1');
      io.observe(el);
    });
  }

  // ── Lenis smooth scroll ──
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    var lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // ── Hero parallax ──
  function initParallax() {
    var heroBg   = document.querySelector('.hero-bg');
    var heroGrid = document.querySelector('.hero-grid');
    if (!heroBg && !heroGrid) return;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (heroBg)   heroBg.style.transform   = 'translateY(' + (y * 0.25) + 'px)';
      if (heroGrid) heroGrid.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }, { passive: true });
  }

  // ── Init on load ──
  window.addEventListener('load', function () {
    createObserver();
    initLenis();
    initParallax();
    scan();

    // Watch for React mounting new elements
    var mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
  });

  // Expose for App.jsx to call after page transitions
  window.motionScan = scan;
})();