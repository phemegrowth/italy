/* Edilizia Genovese: hero entrance (name reveal, photo strip slides in from the right), header, menu, anchors, reveals,
   services list that swaps the side photo on hover or as you scroll, process line that draws with scroll, sticky phone
   bar, form validation, and the GSAP signature scene "Da Pegli ad Albaro": pinned, vertical scroll drives a horizontal
   strip of their real job names, each card unmasks as it enters, with a 01 / 06 counter and a progress bar. */
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

  /* services: hover or the row nearest the middle swaps the side photo */
  var sp = d.querySelector('[data-swap]'), rows = d.querySelectorAll('.svc__list li[data-img]');
  function swapTo(src) {
    if (!sp || sp.getAttribute('src') === src) return;
    sp.classList.add('is-fade');
    setTimeout(function () { sp.setAttribute('src', src); sp.classList.remove('is-fade'); }, reduce ? 0 : 220);
  }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { swapTo(r.getAttribute('data-img')); }); });
  if (!reduce && sp) {
    var lk = false;
    window.addEventListener('scroll', function () {
      if (lk) return; lk = true;
      requestAnimationFrame(function () {
        lk = false;
        var mid = window.innerHeight * .5, best = null, bd = 1e9;
        rows.forEach(function (r) { var b = r.getBoundingClientRect(), c = Math.abs(b.top + b.height / 2 - mid); if (c < bd) { bd = c; best = r; } });
        if (best && bd < window.innerHeight * .25) swapTo(best.getAttribute('data-img'));
      });
    }, { passive: true });
  }

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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('.prj__track'), cards = sec.querySelectorAll('.card');
    var cur = sec.querySelector('[data-cur]'), bar = sec.querySelector('[data-bar]');
    var n = cards.length, last = -1;
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth + (small ? 16 : 48)); }
    gsap.set(cards, { clipPath: 'inset(0 0 0 100%)' });
    gsap.set(cards[0], { clipPath: 'inset(0 0 0 0%)' });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(track, { x: function () { return -dist(); }, duration: 1 }, 0);
    var stRef = null;
    function check() {
      var vw = window.innerWidth, k = 0;
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        if (r.left < vw * .92 && !c._in) { c._in = true; gsap.to(c, { clipPath: 'inset(0 0 0 0%)', duration: .7, ease: 'power3.out' }); }
        if (r.left < vw * .5) k = i;
      });
      var p = tl.progress();
      if (p > .98) k = n - 1;
      if (k !== last) { last = k; cur.textContent = '0' + (k + 1); }
      bar.style.transform = 'scaleX(' + Math.max(1 / n, p).toFixed(3) + ')';
    }
    tl.eventCallback('onUpdate', check);
    stRef = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.1 : 1)); },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    check();
  }
})();
