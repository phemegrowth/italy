/* Imet: hero G (the sourced 5,0 rating counts up, the attic photo opens in a house-shaped mask, the yellow band drops),
   header, phone menu, anchors, reveals, gallery strip, phone contact bar, form, and the GSAP signature scene:
   a floor in isometric view, layer by layer (slab, insulation, screed, parquet) dropping in exploded, then pressed
   together into the finished floor. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* count-up of the Google rating (a sourced figure) */
  var n = d.querySelector('[data-count]');
  if (n && !reduce) {
    var to = parseFloat(n.getAttribute('data-count')), t0 = null, dur = 900;
    n.textContent = '0,0';
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      n.textContent = (to * e).toFixed(1).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

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
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  var strip = d.querySelector('[data-strip]');
  if (strip) strip.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
    if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
  });

  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero) {
    var mb = function () { mbar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60); };
    window.addEventListener('scroll', mb, { passive: true });
    mb();
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    floorScene(window.innerWidth <= 760);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function floorScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var lay = function (i) { return sec.querySelector('.lay[data-l="' + i + '"]'); };
    var tag = function (i) { return sec.querySelector('.tag[data-t="' + i + '"]'); };
    var done = sec.querySelector('[data-done]'), now = sec.querySelector('[data-now]'), steps = sec.querySelectorAll('.fsteps li');
    var gap = small ? 80 : 90;
    if (small) sec.querySelector('.iso').setAttribute('viewBox', '180 40 540 640');
    var names = ['', 'Solaio esistente', 'Sottofondo e isolamento', 'Massetto in piano', 'Il pavimento: parquet, plance o lastre', 'Pavimento finito'];
    var stepAt = [0, 0.3, 1.1, 1.9, 2.7, 4.0];

    for (var i = 1; i <= 4; i++) { gsap.set([lay(i), tag(i)], { autoAlpha: 0, y: -(i - 1) * gap - 160 }); }
    gsap.set(done, { autoAlpha: 0, y: 20 });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    for (var k = 1; k <= 4; k++) {
      var at = 0.3 + (k - 1) * 0.8;
      tl.to([lay(k), tag(k)], { autoAlpha: 1, y: -(k - 1) * gap, duration: 0.7 }, at);
    }
    tl.to([tag(1), tag(2), tag(3), tag(4)], { autoAlpha: 0, duration: 0.3, ease: 'none' }, 3.6);
    for (var j = 2; j <= 4; j++) tl.to(lay(j), { y: 0, duration: 0.7, ease: 'power2.inOut' }, 3.7);
    tl.to(done, { autoAlpha: 1, y: 0, duration: 0.4 }, 4.3)
      .to({}, { duration: 0.6 }, 4.7);

    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0;
      for (var q = 1; q < stepAt.length; q++) if (t >= stepAt[q]) s = q;
      if (s === last) return;
      last = s;
      steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s || (s === 5)); });
      if (now) now.innerHTML = s ? '<b>0' + Math.min(s, 4) + '</b>' + names[s] : '';
    });

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: 0.6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
