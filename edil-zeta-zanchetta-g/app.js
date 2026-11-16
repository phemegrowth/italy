/* Edil Zeta: header, full-screen menu, anchors, reveals, hero photo parallax, phone contact bar, form validation,
   and the GSAP signature scene (energy class scale: the house gains insulation, windows and renewables while the
   pointer climbs the APE scale from G to A4). */
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
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla casa, per favore.' };
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

  /* GSAP: hero parallax + signature scene */
  var sec = d.querySelector('.ape');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('ape--static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.to('.hero__pic img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return build(false); });
    mm.add('(max-width: 760px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var stage = sec.querySelector('.ape__stage');
    var shell = sec.querySelector('.h-shell'), ground = sec.querySelector('.h-ground');
    var ins = sec.querySelector('.h-ins'), win = sec.querySelector('.h-win'), sun = sec.querySelector('.h-sun'), probe = sec.querySelector('.h-probe');
    var labs = sec.querySelectorAll('.h-lab');
    var rows = sec.querySelectorAll('.scale .row'), ptr = sec.querySelector('.scale__ptr'), ptrB = ptr.querySelector('b');
    var steps = sec.querySelectorAll('.ape__steps li'), headEls = sec.querySelectorAll('.ape__head > *');
    var classes = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'];
    var curK = -1;
    function set(k) {
      if (k === curK) return; curK = k;
      steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    var state = { y: 0 };
    function rowY(i) { return rows[i].offsetTop; }
    function drawPtr() {
      ptr.style.transform = 'translateY(' + state.y + 'px)';
      var best = 0, dist = 1e9;
      rows.forEach(function (r, i) { var dd = Math.abs(r.offsetTop - state.y); if (dd < dist) { dist = dd; best = i; } });
      ptrB.textContent = classes[best];
      ptrB.style.background = getComputedStyle(rows[best]).getPropertyValue('--c');
    }
    shell.setAttribute('pathLength', '1');
    gsap.set(shell, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(ground, { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set([ins, win, sun, probe, labs], { opacity: 0 });
    gsap.set(ins, { scale: 1.08, transformOrigin: '50% 60%' });
    gsap.set(sun, { y: -20 });
    gsap.set(headEls, { opacity: 0, y: 24 });
    gsap.set(rows, { opacity: .35 });
    state.y = rowY(9); drawPtr();
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=250%', pin: true, scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (s) { var p = s.progress; set(p < 0.34 ? 0 : p < 0.56 ? 1 : p < 0.8 ? 2 : 3); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(headEls, { opacity: 1, y: 0, duration: 0.06, stagger: 0.02, ease: 'power2.out' }, 0)
      .to(ground, { scaleX: 1, duration: 0.06 }, 0.02)
      .to(shell, { strokeDashoffset: 0, duration: 0.14 }, 0.05)
      .to(rows, { opacity: 1, duration: 0.1, stagger: { each: 0.01, from: 'end' } }, 0.06)
      .to(ins, { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, 0.2)
      .to(labs[0], { opacity: 1, duration: 0.06 }, 0.24)
      .to(state, { y: function () { return rowY(6); }, duration: 0.14, onUpdate: drawPtr }, 0.2)
      .to(win, { opacity: 1, duration: 0.1 }, 0.42)
      .to(labs[1], { opacity: 1, duration: 0.06 }, 0.44)
      .to(state, { y: function () { return rowY(4); }, duration: 0.12, onUpdate: drawPtr }, 0.42)
      .to(sun, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.6)
      .to(probe, { opacity: 1, duration: 0.08 }, 0.66)
      .to(state, { y: function () { return rowY(2); }, duration: 0.14, onUpdate: drawPtr }, 0.6)
      .to(state, { y: function () { return rowY(0); }, duration: 0.1, onUpdate: drawPtr }, 0.82)
      .to({}, { duration: 0.06 });
    set(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([shell, ground, ins, win, sun, probe, labs, headEls, rows], { clearProps: 'all' });
      ptr.style.transform = ''; ptrB.textContent = 'A4'; ptrB.style.background = '';
    };
  }
})();
