/* Maurizio Costruzioni: hero curtain (green panel lifts off their own house, roof mark scales in, line reveal),
   header, menu, anchors, reveals, service list that swaps the sticky photo, drag strip with progress,
   sticky phone bar, form validation, and the GSAP signature scene "Il muro, strato per strato": pinned, the
   scroll builds a cappotto wall section layer by layer (stone, insulation panel, mesh and render, finish)
   and ends by opening onto their finished facade over the river-stone base. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* services: the active item swaps the sticky photo (hover/focus on desktop, scroll position everywhere) */
  var items = d.querySelectorAll('.svc__it'), pics = d.querySelectorAll('.svc__pics img');
  function setSvc(i) {
    items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  items.forEach(function (it, k) {
    it.addEventListener('mouseenter', function () { setSvc(k); });
  });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setSvc(+e.target.getAttribute('data-i')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { so.observe(it); });
  }

  /* drag strip + progress */
  var strip = d.querySelector('.strip'), sbar = d.querySelector('.strip__bar span');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    var prog = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (sbar) sbar.style.setProperty('--p', Math.max(.12, p).toFixed(3));
    };
    strip.addEventListener('scroll', prog, { passive: true });
    prog();
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
    var mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', function () { scene(true); });
    mm.add('(min-width: 900px)', function () { scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var box = sec.querySelector('.wall__box');
    var stone = sec.querySelector('.ly--stone'), panel = sec.querySelector('.ly--panel'), mesh = sec.querySelector('.ly--mesh'), fin = sec.querySelector('.ly--finish');
    var done = sec.querySelector('.wall__done'), sides = sec.querySelectorAll('.wall__side');
    var steps = sec.querySelectorAll('.wall__steps li');
    var W = function () { return box.offsetWidth; };
    gsap.set(stone, { x: function () { return -W() * .5; }, autoAlpha: 0 });
    gsap.set([panel, mesh, fin], { x: function () { return W(); } });
    gsap.set(sides, { autoAlpha: 0 });
    gsap.set(done, { clipPath: 'inset(0% 0% 0% 100%)' });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(stone, { x: 0, autoAlpha: 1, duration: .8 }, 0)
      .to(sides, { autoAlpha: 1, duration: .4 }, .4)
      .to(panel, { x: 0, duration: .8 }, 1)
      .to(mesh, { x: 0, duration: .8 }, 2)
      .to(fin, { x: 0, duration: .8 }, 3)
      .to(sides, { autoAlpha: 0, duration: .3 }, 4)
      .to(done, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power1.inOut' }, 4)
      .to({}, { duration: .4 });
    var last = -1;
    function upd() {
      var t = tl.time(), c = Math.min(4, Math.floor(t + .15));
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); s.classList.toggle('is-now', i === c); });
    }
    tl.eventCallback('onUpdate', upd);
    upd();
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { gsap.set([stone, panel, mesh, fin, done, sides], { clearProps: 'all' }); };
  }
})();
