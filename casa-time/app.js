/* Casa Time: hero A (Ken Burns, red block wipes in, headline lines rise, the brush house draws), header, phone menu,
   anchors, reveals, listings strip, phone contact bar, form, and the GSAP signature scene: the word CASA cut out of
   the red of their logo; scroll flies through a stroke of the C into a Modena square, then the card rises. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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
        setTimeout(function () { cb(el); }, (k++) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* listings strip: keyboard arrows */
  var strip = d.querySelector('[data-strip]');
  if (strip) strip.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); }
    if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); }
  });

  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero) {
    var mb = function () { mbar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60); };
    window.addEventListener('scroll', mb, { passive: true });
    mb();
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Diteci in due righe che cosa cercate.' };
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    flyScene(window.innerWidth <= 760);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function flyScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var zoom = sec.querySelector('[data-zoom]'), word = sec.querySelector('[data-word]'), mask = sec.querySelector('[data-mask]');
    var card = sec.querySelector('[data-card]'), intro = sec.querySelector('[data-intro]'), photo = sec.querySelector('.fly__photo img');
    /* a point inside the left stroke of the C */
    var ext = word.getExtentOfChar(0);
    var ox = ext.x + ext.width * 0.2, oy = ext.y + ext.height * 0.5;
    sec.setAttribute('data-origin', ox.toFixed(1) + ',' + oy.toFixed(1));

    var z = { s: 1 };
    var setZ = function () { zoom.setAttribute('transform', 'translate(' + ox + ' ' + oy + ') scale(' + z.s.toFixed(4) + ') translate(' + (-ox) + ' ' + (-oy) + ')'); };
    setZ();
    gsap.set(word, { autoAlpha: 0 });
    gsap.set(card, { autoAlpha: 0, y: 60 });
    gsap.set(photo, { scale: 1.25 });

    var tl = gsap.timeline();
    tl.to(word, { autoAlpha: 1, duration: 0.4 }, 0)
      .to(z, { s: small ? 26 : 24, duration: 3, ease: 'power3.in', onUpdate: setZ }, 0.5)
      .to(intro, { autoAlpha: 0, duration: 0.4 }, 0.6)
      .to(photo, { scale: 1, duration: 3.4, ease: 'power2.out' }, 0.5)
      .to(mask, { autoAlpha: 0, duration: 0.3 }, 3.3)
      .to(card, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 3.5)
      .to({}, { duration: 0.6 }, 4.2);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: 0.6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
