/* L.P. Group Costruzioni: hero entrance (blueprint frame and grid draw, photo fades in inside the frame, headline rises on the frame edge),
   header, full-screen menu, anchors, reveals, drag strip, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: a wall section built layer by layer with the scroll
   (masonry, water pipes and cables, plasterboard, skim coat, paint with sockets, switch and lamp). */
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
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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

  /* drag strip on desktop */
  var strip = d.querySelector('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene: the wall builds up */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var sec = d.querySelector('.parete');
    var phone = window.matchMedia('(max-width: 760px)').matches;
    var L = [0, 1, 2, 3, 4].map(function (i) { return sec.querySelector('.w-l' + i); });
    var lis = sec.querySelectorAll('.layers li');
    var cap = sec.querySelector('[data-cap]'), capd = sec.querySelector('[data-capd]');
    var lines = sec.querySelectorAll('.w-pipe, .w-cable');
    lines.forEach(function (p) { var n = p.getTotalLength(); p.style.strokeDasharray = n + ' ' + n; p.style.strokeDashoffset = n; });
    gsap.set(L, { opacity: 0 });
    gsap.set([L[0], L[2], L[3], L[4]], { y: 40 });
    gsap.set(sec.querySelectorAll('.w-box'), { opacity: 0 });
    gsap.set(sec.querySelectorAll('.w-plate, .w-sw, .w-l4 circle'), { opacity: 0, scale: .6, transformOrigin: '50% 50%' });
    gsap.set(sec.querySelector('.w-glow'), { opacity: 0 });
    var cur = -1;
    function setL(i) {
      if (i === cur) return; cur = i;
      lis.forEach(function (li, k) { li.classList.toggle('is-act', k === i); li.classList.toggle('is-done', k < i); });
      if (i < 0) return;
      cap.textContent = lis[i].querySelector('b').textContent; capd.textContent = lis[i].querySelector('span').textContent;
      gsap.fromTo([cap, capd], { y: 8, opacity: .2 }, { y: 0, opacity: 1, duration: .3, overwrite: true });
    }
    var at = [0, 1.1, 2.3, 3.3, 4.2];
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: phone ? '+=190%' : '+=260%', pin: sec.querySelector('.parete__pin'), scrub: 0.6,
        onToggle: function (st) { scenePinned = st.isActive; bar(); },
        onUpdate: function (st) {
          var t = st.progress * tl.duration(), i = 0;
          for (var k = 0; k < at.length; k++) if (t >= at[k]) i = k;
          setL(i);
        }
      }
    });
    tl.to(L[0], { opacity: 1, y: 0, duration: .7 }, at[0])
      .to(L[1], { opacity: 1, duration: .1 }, at[1])
      .to(lines, { strokeDashoffset: 0, duration: .8, stagger: .15, ease: 'none' }, at[1])
      .to(sec.querySelectorAll('.w-box'), { opacity: 1, duration: .2 }, at[1] + .6)
      .to(L[2], { opacity: 1, y: 0, duration: .7 }, at[2])
      .to(L[3], { opacity: 1, y: 0, duration: .6 }, at[3])
      .to(L[4], { opacity: 1, y: 0, duration: .6 }, at[4])
      .to(sec.querySelectorAll('.w-plate, .w-sw, .w-l4 circle'), { opacity: 1, scale: 1, duration: .35, stagger: .05, ease: 'back.out(2)' }, at[4] + .4)
      .to(sec.querySelector('.w-glow'), { opacity: .55, duration: .4 }, at[4] + .7)
      .to({}, { duration: .8 });
    setL(0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
