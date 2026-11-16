/* Impresa Iannece: number-led hero ("quasi 50 anni" counts up, photo unmasks into a house shape under the red roof
   line of their logo), header, full-screen menu, anchors, reveals, process line that draws with scroll, sticky phone
   bar, form validation, and the GSAP signature scene "Dal progetto alla realizzazione": pinned, an elevation drawing
   draws itself, then the building photo fills it floor by floor while a % counter and six phases advance. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); if (id === '#top' && a.getAttribute('aria-disabled') !== 'true') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* hero number counts up to 50 (quasi 50 anni, from their Instagram bio) */
  var big = d.querySelector('[data-count]');
  if (big && !reduce) {
    var to = +big.getAttribute('data-count'), t0 = null;
    big.textContent = '0';
    var tick = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      big.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* GSAP signature scene: the elevation draws itself, then the building fills floor by floor */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-st'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var sec = d.querySelector('[data-scene]');
    var lines = sec.querySelectorAll('.bp__l'), img = sec.querySelector('[data-fill] img');
    var pct = sec.querySelector('[data-pct]'), steps = sec.querySelectorAll('[data-bp-steps] li');
    var small = window.innerWidth < 701, st = { draw: 0, fill: 0 }, last = -1;
    lines.forEach(function (l) { var len = l.getTotalLength(); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; l._len = len; });
    function paint() {
      lines.forEach(function (l, i) {
        var a = Math.max(0, Math.min(1, st.draw * 1.4 - i * .1));
        l.style.strokeDashoffset = (l._len * (1 - a)).toFixed(1);
      });
      /* clip from the bottom up: inset top shrinks from 100% to 0 */
      img.style.clipPath = 'inset(' + (100 - st.fill * 100).toFixed(2) + '% 0 0 0)';
      var total = st.draw * .15 + st.fill * .85;
      pct.textContent = Math.round(total * 100);
      var k = st.fill <= 0 ? 0 : Math.min(steps.length - 1, 1 + Math.floor(st.fill * (steps.length - 1.001)));
      if (st.fill >= .999) k = steps.length - 1;
      if (k !== last) { last = k; steps.forEach(function (s, i) { s.classList.toggle('is-on', i === k); s.classList.toggle('is-past', i < k); }); }
    }
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(st, { draw: 1, duration: .3, onUpdate: paint }, 0)
      .to(st, { fill: 1, duration: .6, onUpdate: paint }, .3)
      .to({}, { duration: .1 });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    paint();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
