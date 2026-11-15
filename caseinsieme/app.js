/* CaseInsieme: hero entrance (photo unmask + slow scale, line reveal), header, menu, anchors, reveals, review strip with
   drag, sticky phone bar, form validation, and the GSAP signature scene "Due parti, una casa": the two halves of one home
   (chi vende, chi cerca casa) slide together with scroll, a green seam draws, "Insieme." lands and the three steps light up. */
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

  /* review strip: mouse drag (touch scrolls natively) */
  var strip = d.querySelector('.rev__strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

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
    var L = sec.querySelector('.half--l'), R = sec.querySelector('.half--r'), seam = sec.querySelector('.seam'), word = sec.querySelector('.ins__word');
    var steps = sec.querySelectorAll('.ins__steps li');
    var pills = sec.querySelectorAll('.pill');
    gsap.set(L, { xPercent: -42 });
    gsap.set(R, { xPercent: 42 });
    gsap.set(seam, { scaleY: 0 });
    gsap.set(word, { autoAlpha: 0, y: 20, xPercent: -50 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(L, { xPercent: 0, duration: 2, ease: 'power1.inOut' }, 0)
      .to(R, { xPercent: 0, duration: 2, ease: 'power1.inOut' }, 0)
      .to(pills, { autoAlpha: 0, duration: .3 }, 1.7)
      .to(seam, { scaleY: 1, duration: .6 }, 1.9)
      .to(word, { autoAlpha: 1, y: 0, duration: .6 }, 2.3)
      .to(seam, { autoAlpha: 0, duration: .5 }, 3)
      .to({}, { duration: .6 });
    var at = [0.05, 1.1, 2.3];
    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), c = -1;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= c); s.style.color = i <= c ? 'var(--ink)' : ''; });
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=120%' : '+=200%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
  }
})();
