/* Impresa di Costruzioni Milia Gigi: header, full-screen menu, anchors, reveals, phone contact bar, form validation,
   cinematic hero (CSS) and the GSAP signature scene (catalogue 10, 3D card arc of the four trades). */
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

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
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

  /* GSAP signature scene: the four trades on a 3D ring. Scroll turns the ring a quarter at a time,
     the card in front gets the light edge, its name and line appear on the right, counter and bar follow. */
  function start() {
    var sec = d.querySelector('.scene');
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('scene--static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return ring(false); });
    mm.add('(max-width: 760px)', function () { return ring(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ring(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage'), rg = sec.querySelector('.ring');
    var cards = sec.querySelectorAll('.card'), desc = sec.querySelectorAll('.scene__desc li');
    var count = sec.querySelector('.scene__count b'), bar = sec.querySelector('.scene__bar span');
    var R = getComputedStyle(rg).getPropertyValue('--R');
    var st = { a: 0 }, cur = -1;
    function paint() {
      rg.style.transform = 'translateZ(calc(' + R + ' * -1)) rotateY(' + (-st.a) + 'deg)';
      cards.forEach(function (c, i) {
        var rel = i * 50 - st.a;
        c.style.opacity = String(Math.max(0, 1 - Math.abs(rel) / 115));
      });
      var k = Math.min(3, Math.round(st.a / 50));
      if (k !== cur) {
        cur = k;
        cards.forEach(function (c, i) { c.classList.toggle('is-front', i === k); });
        desc.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        count.textContent = '0' + (k + 1);
      }
    }
    gsap.set(bar, { scaleX: 0 });
    gsap.set(rg, { scale: 0.8 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: stage, scrub: 0.6,
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(rg, { scale: 1, duration: 0.12, ease: 'power2.out' }, 0)
      .to(st, { a: 150, duration: 0.75, ease: 'none', onUpdate: paint }, 0.12)
      .to(bar, { scaleX: 1, duration: 0.87 }, 0)
      .to({}, { duration: 0.13 });
    paint();
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([bar, rg], { clearProps: 'all' }); rg.style.transform = '';
      cards.forEach(function (c) { c.style.opacity = ''; });
    };
  }
})();
