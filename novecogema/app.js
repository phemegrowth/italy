/* Novecogema: header, full-screen menu, anchors, reveals, step line, band parallax, phone contact bar,
   form validation, frame hero entrance and the GSAP signature scene (catalogue 6, pinned horizontal strip). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready'); html.classList.add('no-pin'); }
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

  /* step line and band parallax follow the scroll */
  var steps = d.querySelector('.steps'), band = d.querySelector('.band__pic img');
  function onFrame() {
    var vh = window.innerHeight;
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
    if (band && !reduce) {
      var b = band.parentNode.getBoundingClientRect();
      if (b.bottom > 0 && b.top < vh) {
        var q = (vh - b.top) / (vh + b.height);
        band.style.transform = 'translate3d(0,' + (-q * 15).toFixed(2) + '%,0)';
      }
    }
  }
  window.addEventListener('scroll', onFrame, { passive: true });
  onFrame();

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = d.querySelector('.scene').getBoundingClientRect(), inScene = sr.top < window.innerHeight * 0.5 && sr.bottom > window.innerHeight * 0.5;
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

  /* GSAP signature scene: the section pins, vertical scroll drives the strip of six site phases sideways;
     each card unmasks from the bottom as it comes in, the counter and the yellow bar follow. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-pin'); return; }
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
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage');
    var track = sec.querySelector('.scene__track'), cards = sec.querySelectorAll('.card');
    var imgs = sec.querySelectorAll('.card__img'), caps = sec.querySelectorAll('.card figcaption');
    var count = sec.querySelector('.scene__count b'), bar = sec.querySelector('.scene__bar span');
        var n = cards.length;
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
        gsap.set(imgs, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(caps, { opacity: 0, y: 12 });
    gsap.set(bar, { scaleX: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.05 : 1.15) + window.innerHeight * 0.4); },
        pin: stage, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var k = Math.min(n, 1 + Math.floor(s.progress * n * 0.999));
          count.textContent = (k < 10 ? '0' : '') + k;
        },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(track, { x: function () { return -dist(); }, duration: 1 }, 0.12)
      .to(bar, { scaleX: 1, duration: 1.12 }, 0);
    var intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 75%', end: 'top 5%', scrub: 0.5 } });
    /* each card unmasks as it reaches the screen */
    cards.forEach(function (c, i) {
      var at = Math.max(0, (c.offsetLeft - window.innerWidth * 0.85) / Math.max(1, track.scrollWidth - window.innerWidth));
      var t = 0.12 + Math.min(0.92, at);
      if (c.offsetLeft < window.innerWidth * 0.9) {
        /* cards already on screen unmask while the section scrolls in, before the pin */
        intro.to(imgs[i], { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power2.out' }, i * 0.15)
             .to(caps[i], { opacity: 1, y: 0, duration: 0.3 }, i * 0.15 + 0.3);
        return;
      }
      tl.to(imgs[i], { clipPath: 'inset(0% 0 0 0)', duration: 0.12, ease: 'power2.out' }, t)
        .to(caps[i], { opacity: 1, y: 0, duration: 0.08 }, t + 0.06);
    });
    tl.to({}, { duration: 0.05 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); intro.scrollTrigger && intro.scrollTrigger.kill(); intro.kill();
      gsap.set([imgs, caps, bar, track], { clearProps: 'all' });
    };
  }
})();
