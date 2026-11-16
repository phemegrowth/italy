/* MIGA Costruzioni: header, full-screen menu, anchors, reveals, phone contact bar, form validation,
   split hero with parallax photo and the GSAP signature scene (catalogue 4, before / after). */
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

  /* GSAP: hero photo parallax (slower than the page) and the signature scene (catalogue 4, before / after scrub):
     pinned, the scroll wipes from the old graniglia floor to the tile laying, then to the finished floor. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    gsap.to('.hero__pic img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return scene(false); });
    mm.add('(max-width: 760px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('.ba'), stage = sec.querySelector('.ba__stage'), fig = sec.querySelector('.ba__fig');
    var i2 = sec.querySelector('.ba__img--2'), i3 = sec.querySelector('.ba__img--3'), edge = sec.querySelector('.ba__edge');
    var caps = sec.querySelectorAll('.ba__caps li'), label = sec.querySelector('[data-label]'), bar = sec.querySelector('.ba__bar span');
    var txt = sec.querySelectorAll('.ba__text .eyebrow, .ba__text h2'), names = ['Prima', 'Durante', 'Dopo'], cur = -1;
    function setStep(k) { if (k === cur) return; cur = k; caps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); }); label.textContent = names[k]; }
    var W = function () { return fig.offsetWidth; };
    gsap.set([i2, i3], { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(edge, { x: W(), opacity: 0 });
    gsap.set(fig, { scale: 0.92, opacity: 0.4 });
    gsap.set(txt, { opacity: 0, y: 30 });
    gsap.set(bar, { scaleX: 0 });
    setStep(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: stage, scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.33 ? 0 : p < 0.68 ? 1 : 2); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(txt, { opacity: 1, y: 0, duration: 0.1 }, 0)
      .to(fig, { scale: 1, opacity: 1, duration: 0.12 }, 0)
      .to(bar, { scaleX: 1, duration: 1 }, 0)
      .set(edge, { opacity: 1 }, 0.16)
      .to(i2, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.28 }, 0.16)
      .to(edge, { x: 0, duration: 0.28 }, 0.16)
      .set(edge, { x: function () { return W(); } }, 0.5)
      .to(i3, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.28 }, 0.52)
      .to(edge, { x: 0, duration: 0.28 }, 0.52)
      .to(edge, { opacity: 0, duration: 0.05 }, 0.82)
      .to({}, { duration: 0.12 });
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([i2, i3, edge, fig, txt, bar], { clearProps: 'all' }); setStep(2); };
  }
})();
