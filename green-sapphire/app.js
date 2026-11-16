/* Green Sapphire: header, full-screen menu, anchors, reveals, marquee, accordion, split hero with parallax photo,
   phone contact bar, form validation and the GSAP signature scene (catalogue 11, material pour: a slab section where
   the formwork comes in, the rebar is drawn, then the concrete rises with a wavy edge and settles flat). */
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
  reveal(d.querySelectorAll('.steps'), function (el) { el.classList.add('is-drawn'); });

  /* proof marquee: duplicate the line once so the loop is seamless */
  var track = d.querySelector('.proof__track');
  if (track && !reduce) { Array.prototype.slice.call(track.children).forEach(function (n) { var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }); }

  /* accordion with height animation */
  d.querySelectorAll('.acc__i').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'ease' });
      }
    });
  });

  /* hero photo parallax: moves slower than the page */
  var hImg = d.querySelector('.hero__media img'), ticking = false;
  if (hImg && !reduce) {
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { var y = Math.min(window.scrollY, window.innerHeight * 1.2); hImg.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)'; ticking = false; });
    }, { passive: true });
  }

  /* phone contact bar: after the hero, hidden in contact and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
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
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return scene(false); });
    mm.add('(max-width: 760px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var form = sec.querySelector('.sl-form'), bl = sec.querySelector('.bar--l'), bs = sec.querySelector('.bar--s');
    var dots = sec.querySelectorAll('.bar-dots circle'), spac = sec.querySelector('.bar-spacers');
    var pour = sec.querySelector('.sl-pour'), wave = sec.querySelector('.sl-wave'), top = sec.querySelector('.sl-top');
    var tags = sec.querySelectorAll('.scene__tags li'), num = sec.querySelector('[data-n]'), lab = sec.querySelector('[data-l]');
    var txt = sec.querySelectorAll('.scene__text .eyebrow, .scene__text h2, .scene__now'), cur = -1;
    var labels = ['Cassero pronto', 'Armatura posata', 'Getto e solaio finito'];
    function setStep(k) {
      if (k === cur) return; cur = k;
      tags.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
      num.textContent = '0' + (k + 1); lab.textContent = labels[k];
    }
    gsap.set(form, { opacity: 0, y: 30 });
    gsap.set([bl, bs], { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } });
    gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(spac, { opacity: 0 });
    gsap.set(pour, { y: 200 });
    gsap.set(top, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(txt, { opacity: 0, y: 24 });
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.25 ? 0 : p < 0.55 ? 1 : 2); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(txt, { opacity: 1, y: 0, duration: 0.08, stagger: 0.02 }, 0)
      .to(form, { opacity: 1, y: 0, duration: 0.12 }, 0.06)
      .to(spac, { opacity: 1, duration: 0.05 }, 0.2)
      .to(bl, { attr: { 'stroke-dashoffset': 0 }, duration: 0.14, ease: 'none' }, 0.26)
      .to(bs, { attr: { 'stroke-dashoffset': 0 }, duration: 0.1, ease: 'none' }, 0.34)
      .to(dots, { scale: 1, duration: 0.08, stagger: 0.006 }, 0.4)
      .to(pour, { y: 0, duration: 0.3, ease: 'none' }, 0.56)
      .to(wave, { x: -240, duration: 0.3, ease: 'none' }, 0.56)
      .to(wave, { attr: { d: 'M-40 92 C 20 92, 60 92, 120 92 S 220 92, 280 92 S 380 92, 440 92 S 540 92, 600 92 S 700 92, 760 92 S 860 92, 920 92 S 1020 92, 1080 92 V 420 H -40 Z' }, duration: 0.08 }, 0.86)
      .to(top, { scaleX: 1, duration: 0.08 }, 0.88)
      .to({}, { duration: 0.06 });
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([form, bl, bs, spac, pour, wave, top].concat([].slice.call(dots), [].slice.call(txt)), { clearProps: 'all' }); setStep(2); };
  }
})();
