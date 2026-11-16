/* Impresa Edile Fantasia: hero entrance (headline lines rise, the photo opens with a clip-path, slow Ken Burns),
   header, phone menu, anchors, reveals, service tabs that swap the photo, big image with thumbnails, process line,
   magnetic buttons, phone contact bar, form validation, and the GSAP signature scene: a concrete pour rising over the rebar. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var mbar = d.querySelector('.mbar');
  var hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
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

  /* service tabs swap the photo */
  var tabs = d.querySelectorAll('.tab'), pics = d.querySelectorAll('[data-pic]');
  function tab(t) {
    var k = t.getAttribute('data-for');
    tabs.forEach(function (x) { x.classList.toggle('is-act', x === t); x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { tab(t); });
    t.addEventListener('mouseenter', function () { if (window.matchMedia('(pointer: fine)').matches) tab(t); });
  });

  /* big image with thumbnails */
  var caps = ['Struttura in corso', 'Il getto sul solaio', 'Ferri e pilastri'];
  var thumbs = d.querySelectorAll('.thumb'), bigs = d.querySelectorAll('[data-b]'), cap = d.querySelector('[data-cap]');
  thumbs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.getAttribute('data-big');
      thumbs.forEach(function (x) { x.classList.toggle('is-act', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      bigs.forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-b') === k); });
      if (cap) cap.textContent = caps[+k];
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return pourScene(false); });
    mm.add('(max-width: 899px)', function () { return pourScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function pourScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pour = sec.querySelector('.pour'), fill = sec.querySelector('.pour__fill'), mesh = sec.querySelector('.pour__mesh');
    var pct = sec.querySelector('[data-pct]'), steps = sec.querySelectorAll('.pour__steps li');
    var done = sec.querySelector('.pour__done');
    var st = { p: 0 };
    var mark = function (k) {
      steps.forEach(function (li) { var i = +li.getAttribute('data-p'); li.classList.toggle('is-on', i <= k); li.classList.toggle('is-cur', i === k); });
    };
    mark(0);
    gsap.set(pour, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(mesh, { scale: 1.12 });
    gsap.set(fill, { yPercent: 101 });
    gsap.set(done, { autoAlpha: 0 });
    var tl = gsap.timeline();
    tl.to(pour, { clipPath: 'inset(0 0 0% 0)', duration: .6, ease: 'power2.inOut' }, 0)
      .to(mesh, { scale: 1, duration: 1.4, ease: 'none' }, 0)
      .to(fill, { yPercent: 0, duration: 2, ease: 'none' }, 1.1)
      .to(st, { p: 100, duration: 2, ease: 'none', onUpdate: function () { pct.textContent = Math.round(st.p); } }, 1.1)
      .to(done, { autoAlpha: 1, duration: .3 }, 3.1)
      .to({}, { duration: .5 });
    tl.eventCallback('onUpdate', function () {
      var t = tl.time();
      mark(t < .9 ? 0 : t < 1.4 ? 1 : t < 3 ? 2 : 3);
    });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=210%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { stt.kill(); tl.kill(); gsap.set([pour, mesh, fill, done], { clearProps: 'all' }); };
  }
})();
