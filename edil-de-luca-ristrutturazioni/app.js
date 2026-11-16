/* Edil De Luca: header, full-screen menu, anchors, reveals, cursor-following photo on the services list (desktop only),
   phone contact bar, form validation, and the GSAP signature scene (catalogue 12, key turn / door open: "chiavi in mano"). */
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


  /* services: a photo follows the cursor over the rows (fine pointers only) */
  var svc = d.querySelector('.svc'), cur = d.querySelector('.cursor-img'), curImg = cur.querySelector('img');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var tx = 0, ty = 0, x = 0, y = 0, raf = null;
    function loop() { x += (tx - x) * .18; y += (ty - y) * .18; cur.style.left = x + 'px'; cur.style.top = y + 'px'; raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : null; }
    svc.querySelectorAll('.svc__list li').forEach(function (li) {
      li.addEventListener('mouseenter', function () { curImg.src = li.querySelector('.svc__thumb').getAttribute('src'); cur.classList.add('is-on'); });
      li.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    });
    svc.addEventListener('mousemove', function (e) {
      var r = svc.getBoundingClientRect(); tx = e.clientX - r.left + 170; ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false, sceneEl = d.querySelector('.door');
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
  var sec = d.querySelector('.door');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('door--static'); return; }
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
    var stage = sec.querySelector('.door__stage'), frame = sec.querySelector('.door__frame');
    var key = sec.querySelector('.lock__key'), lock = sec.querySelector('.lock');
    var leafL = sec.querySelector('.leaf--l'), leafR = sec.querySelector('.leaf--r');
    var room = sec.querySelector('.door__room img'), steps = sec.querySelectorAll('.door__steps li');
    var curK = -1;
    function set(k) {
      if (k === curK) return; curK = k;
      steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    gsap.set(frame, { opacity: 0, y: 40 });
    gsap.set(key, { x: 40, opacity: 0, rotation: 0 });
    gsap.set([leafL, leafR], { rotationY: 0 });
    gsap.set(room, { scale: 1.25 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; set(p < 0.3 ? 0 : p < 0.55 ? 1 : p < 0.78 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(frame, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0)
      .to(key, { x: 0, opacity: 1, duration: 0.1, ease: 'power2.out' }, 0.06)
      .to(key, { rotation: 90, duration: 0.1, ease: 'power1.inOut' }, 0.18)
      .to(lock, { opacity: 0, duration: 0.04 }, 0.3)
      .to(leafL, { rotationY: -104, duration: 0.42, ease: 'power1.inOut' }, 0.3)
      .to(leafR, { rotationY: 104, duration: 0.42, ease: 'power1.inOut' }, 0.32)
      .to(room, { scale: 1, duration: 0.6, ease: 'power1.out' }, 0.3)
      .to({}, { duration: 0.1 });
    set(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([frame, key, lock, leafL, leafR, room], { clearProps: 'all' });
    };
  }
})();
