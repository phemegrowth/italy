/* Artedil: header, full-screen menu, anchors, reveals, count-up (31 years, sourced: since 1995), accordion,
   phone contact bar, form validation, and the GSAP signature scene (catalogue 2, exploded floors:
   one building photo in five bands that pull apart, labelled from the foundations to the roof). */
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

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true' || id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (already-visible elements show at once) */
  function reveal(els, cb, margin) {
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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });


  /* count-up: only the sourced figure (31 years since 1995) */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1100;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);

  /* accordion: one open at a time, height animated */
  var dets = d.querySelectorAll('.acc details');
  dets.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (det.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(function () { body.style.transition = 'height .4s ease'; body.style.height = '0px'; });
        setTimeout(function () { det.open = false; body.style.cssText = ''; }, 400);
      } else {
        dets.forEach(function (o) { if (o !== det && o.open) o.querySelector('summary').click(); });
        det.open = true;
        var h = body.scrollHeight;
        body.style.height = '0px';
        requestAnimationFrame(function () { body.style.transition = 'height .45s ease'; body.style.height = h + 'px'; });
        setTimeout(function () { body.style.cssText = ''; }, 460);
      }
    });
  });

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false, sceneEl = d.querySelector('.scene');
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = sceneEl.getBoundingClientRect(), inScene = sr.top < 2 && sr.bottom > window.innerHeight - 2;
    pbar.classList.toggle('is-on', past && !scenePinned && !inScene && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  var sec = d.querySelector('.scene');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('scene--static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var stage = sec.querySelector('.scene__stage'), stack = sec.querySelector('.stack');
    var slices = sec.querySelectorAll('.stack__s'), tags = sec.querySelectorAll('.tags li');
    var cur = -1;
    function set(k) {
      if (k === cur) return; cur = k;
      tags.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    gsap.set(stack, { scale: 1 });
    gsap.set(slices, { opacity: 0, y: 40 });
    gsap.set(slices, { yPercent: 0, xPercent: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: stage, scrub: 0.6,
        onUpdate: function (s) {
          var p = s.progress;
          /* light the labels from the bottom (foundations, index 4) to the top (roof, index 0) */
          set(p < 0.3 ? 4 : p < 0.45 ? 3 : p < 0.6 ? 2 : p < 0.75 ? 1 : 0);
        },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(slices, { opacity: 1, y: 0, duration: 0.1, stagger: { each: 0.02, from: 'end' }, ease: 'power2.out' }, 0)
      .to(stack, { scale: small ? 0.74 : 0.7, duration: 0.5 }, 0.2)
      .to(slices, {
        yPercent: function (i) { return (i - 2) * (small ? 34 : 42); },
        xPercent: function (i) { return i % 2 ? (small ? -3 : -5) : (small ? 3 : 5); },
        duration: 0.5, ease: 'power1.inOut'
      }, 0.2)
      .to(slices, { xPercent: 0, duration: 0.2, ease: 'power1.inOut' }, 0.78)
      .to({}, { duration: 0.04 });
    set(4);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([stack, slices], { clearProps: 'all' });
    };
  }
})();
