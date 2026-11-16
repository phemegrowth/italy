/* SF Real Estate: header, menu, anchors, reveals, hero reel that drifts left with scroll, form hand-off,
   phone bar, form validation, and the GSAP signature scene: a giant VICENZA (CASA on phones) cut out of a
   deep navy layer shows a bright living room; scroll flies through the stroke of one letter until the room
   fills the screen, then a panel rises. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { html.classList.add('is-ready'); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick'), sel = d.getElementById('f-type');
      if (pick && sel) sel.value = pick;
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  /* hero reel: drifts left as the page scrolls (transform only) */
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var max = Math.max(0, track.scrollWidth - track.parentElement.clientWidth * 0.6);
      var p = Math.min(1, window.scrollY / (hero.offsetHeight * 1.1));
      track.style.transform = 'translate3d(' + (-p * Math.min(max, window.innerWidth * 0.45)).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var svg = sec.querySelector('.fly__mask'), word = sec.querySelector('#word'), photo = sec.querySelector('.fly__photo img'), copy = sec.querySelector('.fly__copy'), hint = sec.querySelector('.fly__hint');
    var rects = svg.querySelectorAll('rect'), mask = svg.querySelector('mask'), ci = 1, fx = .5, fy = .5;
    if (small) {
      svg.setAttribute('viewBox', '0 0 900 1600');
      mask.setAttribute('width', '900'); mask.setAttribute('height', '1600');
      rects.forEach(function (r) { r.setAttribute('width', '900'); r.setAttribute('height', '1600'); });
      word.textContent = 'CASA'; word.setAttribute('x', '450'); word.setAttribute('y', '900');
      word.style.fontSize = '250px'; word.style.letterSpacing = '-10px';
      ci = 0; fx = .1; fy = .5;
    }
    /* zoom origin: inside the stroke of one letter (the I of VICENZA, the left stroke of the C of CASA) */
    function origin() {
      var b = word.getExtentOfChar(ci), m = word.getScreenCTM(), pt = svg.createSVGPoint();
      pt.x = b.x + b.width * fx; pt.y = b.y + b.height * fy;
      var s = pt.matrixTransform(m), r = svg.getBoundingClientRect();
      return (s.x - r.left) + 'px ' + (s.y - r.top) + 'px';
    }
    gsap.set(svg, { transformOrigin: origin(), scale: 1 });
    gsap.set(copy, { autoAlpha: 0, y: 40 });
    gsap.set(photo, { scale: 1.2 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: function () { gsap.set(svg, { transformOrigin: origin() }); }
      }
    });
    tl.to({}, { duration: .3 })
      .to(hint, { autoAlpha: 0, duration: .2 }, .2)
      .to(svg, { scale: small ? 26 : 30, duration: 2, ease: 'power3.in' }, .3)
      .to(photo, { scale: 1, duration: 2.2, ease: 'power1.out' }, .3)
      .to(svg, { autoAlpha: 0, duration: .25 }, 2.1)
      .to(copy, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.3)
      .to({}, { duration: .6 });
  }
})();
