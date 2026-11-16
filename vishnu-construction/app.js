/* Vishnu Construction: header, full-screen menu, anchors, reveals, phone contact bar, form validation,
   cinematic hero and the GSAP signature scene (catalogue 11, rebar mat and concrete pour). */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul cantiere.' };
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

  /* GSAP signature scene (catalogue 11, material pour): bars are laid one way, then the other, the
     orange ties pop in, and the concrete rises over the mat with a moving wavy edge while a % counter
     follows; five stages light up beside it. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
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
    var bx = sec.querySelectorAll('.bars--x line'), by = sec.querySelectorAll('.bars--y line'), ties = sec.querySelectorAll('.ties circle');
    var conc = sec.querySelector('.pour__conc'), wave = sec.querySelector('.pour__wave'), pct = sec.querySelector('.pour__pct b');
    var pour = sec.querySelector('.pour'), head = sec.querySelector('.scene__head'), list = sec.querySelector('.stages'), items = sec.querySelectorAll('.stages li');
    var lines = [].slice.call(bx).concat([].slice.call(by));
    lines.forEach(function (l) { l.style.strokeDasharray = '100'; l.style.strokeDashoffset = '100'; });
    function setStep(k) { items.forEach(function (li, j) { li.classList.toggle('is-on', j === k); li.classList.toggle('is-done', j < k); }); }
    var st = { v: 0 };
    function paint() { conc.style.transform = 'translateY(' + (100 - st.v * 100).toFixed(2) + '%)'; pct.textContent = Math.round(st.v * 100); }
    paint();
    gsap.set(wave, { opacity: 0 });
    gsap.set(ties, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set(head, { opacity: 0, y: 30 });
    gsap.set(list, { opacity: 0 });
    gsap.set(pour, { scale: 0.92, opacity: 0.4 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=250%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.09 ? 0 : p < 0.25 ? 1 : p < 0.4 ? 2 : p < 0.5 ? 3 : 4); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.06 }, 0)
      .to(list, { opacity: 1, duration: 0.05 }, 0.02)
      .to(pour, { scale: 1, opacity: 1, duration: 0.1 }, 0)
      .to(bx, { strokeDashoffset: 0, duration: 0.08, stagger: 0.012 }, 0.09)
      .to(by, { strokeDashoffset: 0, duration: 0.08, stagger: 0.012 }, 0.25)
      .to(ties, { scale: 1, duration: 0.03, stagger: 0.005, ease: 'back.out(3)' }, 0.41)
      .to(wave, { opacity: 1, duration: 0.02 }, 0.5)
      .to(st, { v: 1, duration: 0.4, ease: 'power1.inOut', onUpdate: paint }, 0.52)
      .to(wave, { xPercent: -50, duration: 0.4 }, 0.52)
      .to({}, { duration: 0.06 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([head, list, pour, ties, wave], { clearProps: 'all' });
      lines.forEach(function (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; });
      conc.style.transform = '';
      items.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
    };
  }
})();
