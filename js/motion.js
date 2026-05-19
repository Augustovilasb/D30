/* motion.js — Lenis smooth scroll + scroll-reveal + hero parallax + magnetic effect */

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
    refreshMagnetic();
    initCardTilt();
  }

  // ── Lenis smooth scroll — pausa em páginas fullpage ──
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    var lenis = null;
    var rafRunning = false;

    function rafLoop(t) {
      if (lenis) lenis.raf(t);
      requestAnimationFrame(rafLoop);
    }

    function maybeToggle() {
      var fp = document.documentElement.classList.contains('fp-active');
      if (fp && lenis) {
        lenis.destroy();
        lenis = null;
      } else if (!fp && !lenis) {
        lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
        if (!rafRunning) { rafRunning = true; requestAnimationFrame(rafLoop); }
      }
    }

    new MutationObserver(maybeToggle).observe(document.documentElement, {
      attributes: true, attributeFilter: ['class']
    });

    maybeToggle();
  }

  // ── Fullpage ──
  function initFullpage() {
    var sections = [];
    var locked   = false;
    var animRaf  = null;

    function refresh() {
      var found = Array.from(document.querySelectorAll('.fp-section'));
      if (found.length) sections = found;
    }

    // Deriva seção atual do scroll real — nunca fica dessincronizado
    function getCurrent() {
      var mid = window.scrollY + window.innerHeight * 0.4;
      var idx = 0;
      sections.forEach(function(s, i) { if (s.offsetTop <= mid) idx = i; });
      return idx;
    }

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateTo(targetY) {
      if (animRaf) cancelAnimationFrame(animRaf);
      var startY = window.scrollY;
      var start  = null;
      var dur    = 420;

      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        window.scrollTo(0, startY + (targetY - startY) * easeOut(p));
        if (p < 1) animRaf = requestAnimationFrame(step);
        else { animRaf = null; locked = false; }
      })(performance.now());
    }

    function goTo(idx) {
      refresh();
      if (!sections.length || idx < 0 || idx >= sections.length) return;
      locked = true;
      animateTo(sections[idx].offsetTop);
    }
    window.fpGoTo = goTo;

    window.addEventListener('wheel', function(e) {
      refresh();
      if (!sections.length) return;
      if (locked) { e.preventDefault(); return; }
      e.preventDefault();
      goTo(getCurrent() + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    var touchY = 0;
    window.addEventListener('touchstart', function(e) {
      touchY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchend', function(e) {
      refresh();
      if (!sections.length || locked) return;
      var dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) goTo(getCurrent() + (dy > 0 ? 1 : -1));
    }, { passive: true });

    new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
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

  // ── Card tilt 3D ──
  var TILT_SEL = '.about-features .feature-item';

  function initCardTilt() {
    document.querySelectorAll(TILT_SEL + ':not([data-tilt])').forEach(function(el) {
      el.setAttribute('data-tilt', '1');

      el.addEventListener('mousemove', function(e) {
        var r  = el.getBoundingClientRect();
        var x  = (e.clientX - r.left)  / r.width  - 0.5;
        var y  = (e.clientY - r.top)   / r.height - 0.5;
        el.style.transition  = 'transform 0.06s ease-out, box-shadow 0.1s';
        el.style.transform   = 'perspective(700px) rotateX(' + (-y * 14) + 'deg) rotateY(' + (x * 14) + 'deg) translateZ(10px) scale(1.02)';
        el.style.boxShadow   = '0 24px 48px rgba(0,0,0,0.13)';
      });

      el.addEventListener('mouseleave', function() {
        el.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s';
        el.style.transform  = '';
        el.style.boxShadow  = '';
      });
    });
  }

  function refreshMagnetic() {}
  function initMagnetic() {}

  // ── Init on load ──
  window.addEventListener('load', function () {
    createObserver();
    initLenis();
    initParallax();
    initMagnetic();
    initCardTilt();
    initFullpage();
    scan();

    var mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
  });

  window.motionScan = scan;
})();
