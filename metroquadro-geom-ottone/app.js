/* Metroquadro: hero card fan, header, full-screen menu, anchors, reveals, count-up, magnetic buttons,
   phone bar, form validation, and the GSAP signature scene (a floor plan that draws itself, rooms fill
   one by one, then the finished room photo rises inside the plan). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'rm');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = id === '#metodo' ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
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

  /* count-up: years on the market (sourced: since 1991) */
  d.querySelectorAll('.count[data-to]').forEach(function (c) {
    var to = parseInt(c.getAttribute('data-to'), 10);
    if (reduce || !('IntersectionObserver' in window)) { c.textContent = to; return; }
    c.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        c.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    io.observe(c);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* signature scene */
  function scene() {
    var sec = d.querySelector('.plan');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var pin = sec.querySelector('.plan__pin');
    var walls = sec.querySelectorAll('.walls path'), doors = sec.querySelectorAll('.doors path, .dims path');
    var rooms = sec.querySelectorAll('.room'), tags = sec.querySelectorAll('.tags text');
    var photo = sec.querySelector('.plan__photo'), roomsG = sec.querySelector('.rooms');
    var steps = sec.querySelectorAll('.plan__steps li'), meter = sec.querySelector('.plan__meter i');
    var copy = sec.querySelector('.plan__copy'), box = sec.querySelector('.plan__box');
    photo.loading = 'eager';

    walls.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(doors, { opacity: 0 });
    gsap.set(tags, { opacity: 0, y: 8 });
    gsap.set(roomsG, { opacity: 1 });
    gsap.set(rooms, { opacity: 0 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(meter, { scaleX: 0 });
    gsap.set([copy, box], { autoAlpha: 0, y: 30 });
    if (window.innerWidth < 700) gsap.set(copy, { autoAlpha: 1, y: 0 });

    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    }
    setStep(0);

    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 10%', scrub: 0.5 } })
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
      .to(box, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.15)
      .to(walls[0], { strokeDashoffset: 0, duration: 0.6 }, 0.2);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', pin: pin, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        end: function () { return window.innerWidth < 700 ? '+=140%' : '+=240%'; },
        onUpdate: function (s) {
          var p = s.progress;
          setStep(p < 0.28 ? 0 : p < 0.55 ? 1 : p < 0.78 ? 2 : 3);
        }
      }
    });
    tl.to(meter, { scaleX: 1, duration: 1 }, 0);
    walls.forEach(function (p, i) { if (i) tl.to(p, { strokeDashoffset: 0, duration: 0.16 }, 0.02 + i * 0.045); });
    tl.to(doors, { opacity: 1, duration: 0.06, stagger: 0.015 }, 0.24);
    rooms.forEach(function (r, i) {
      tl.to(r, { opacity: 1, duration: 0.06 }, 0.33 + i * 0.06);
      tl.to(tags[i], { opacity: 1, y: 0, duration: 0.06 }, 0.34 + i * 0.06);
    });
    tl.to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.22, ease: 'power1.inOut' }, 0.7);
    tl.to(rooms, { opacity: 0, duration: 0.12 }, 0.78);
    tl.to(tags, { opacity: 0, duration: 0.08 }, 0.86);
    tl.to({}, { duration: 0.04 }, 0.96);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
