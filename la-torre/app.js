/* La Torre Immobiliare: header, menu, anchors, reveals, count-up, list that drives the photo, form hand-off,
   phone bar, form validation, and the GSAP signature scene: a red street door with the number 53 unlocks
   (the key turns), the two leaves swing open with scroll and the empty, bright flat appears behind them
   while the four steps from first call to keys light up one by one. */
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

  /* count-up: Facebook recommendation share (sourced) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* types: the list drives the photo on desktop */
  var stage = d.querySelector('.types__stage');
  if (stage) {
    var layers = stage.querySelectorAll('img, .types__box'), btns = d.querySelectorAll('.ty__btn');
    var show = function (i) {
      layers.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    };
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); });
      b.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) show(i); });
      b.addEventListener('focus', function () { show(i); });
    });
  }

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
    var pin = sec.querySelector('.door__pin'), L = sec.querySelector('.door__leaf--l'), R = sec.querySelector('.door__leaf--r');
    var key = sec.querySelector('.door__key'), img = sec.querySelector('.door__in img'), steps = sec.querySelectorAll('.st');
    var head = sec.querySelector('.door__head'), frame = sec.querySelector('.door__frame');
    gsap.set(L, { rotateY: 0 }); gsap.set(R, { rotateY: 0 });
    gsap.set(img, { scale: 1.18 });
    gsap.set(key, { rotate: -90, scale: .6, opacity: 0 });
    gsap.set(steps, small ? { opacity: 0, y: 24 } : { opacity: .18 });

    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%', pin: pin, scrub: 0.6, anticipatePin: 1 } });
    tl.to(frame, { scale: 1.02, duration: .4 })
      .to(key, { opacity: 1, scale: 1, duration: .3 }, '<+.2')
      .to(key, { rotate: 0, duration: .5 })
      .to(steps[0], small ? { opacity: 1, y: 0, duration: .3 } : { opacity: 1, duration: .3 }, '<')
      .to(key, { opacity: 0, scale: 1.4, duration: .25 })
      .to(L, { rotateY: -104, duration: 1.4, ease: 'power1.inOut' }, '<')
      .to(R, { rotateY: 104, duration: 1.4, ease: 'power1.inOut' }, '<')
      .to(img, { scale: 1, duration: 1.8 }, '<');
    if (small) {
      tl.to(steps[0], { opacity: 0, y: -16, duration: .25 }, '<+.3')
        .to(steps[1], { opacity: 1, y: 0, duration: .3 })
        .to(steps[1], { opacity: 0, y: -16, duration: .25 }, '+=.25')
        .to(steps[2], { opacity: 1, y: 0, duration: .3 })
        .to(steps[2], { opacity: 0, y: -16, duration: .25 }, '+=.25')
        .to(steps[3], { opacity: 1, y: 0, duration: .3 })
        .to({}, { duration: .3 });
    } else {
      tl.to(steps[1], { opacity: 1, duration: .3 }, '<+.35')
        .to(steps[2], { opacity: 1, duration: .3 }, '<+.45')
        .to(steps[3], { opacity: 1, duration: .3 }, '<+.45')
        .to({}, { duration: .4 });
    }
  }
})();
