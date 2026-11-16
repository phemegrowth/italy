/* Impresa edile Xibraku Egri: header, full-screen menu, anchors, reveals, hero reel drift, step line,
   phone contact bar, form validation and the GSAP signature scene (a block wall built course by course,
   window opening, lintel, then the plaster pulled over it). */
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

  /* hero reel drifts left as the page scrolls; the photos inside move a little slower (parallax) */
  var track = d.querySelector('.reel__track'), reelImgs = d.querySelectorAll('.reel__card img');
  var steps = d.querySelector('.steps__line'), stepsList = d.querySelector('.steps');
  function onFrame() {
    var vh = window.innerHeight, y = window.scrollY;
    if (track && !reduce && y < vh * 1.4) {
      track.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      for (var i = 0; i < reelImgs.length; i++) reelImgs[i].style.transform = 'scale(1.08) translate3d(' + (y * 0.05).toFixed(1) + 'px,0,0)';
    }
    if (steps) {
      var r = stepsList.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { onFrame(); ticking = false; }); } }, { passive: true });
  onFrame();

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

  /* GSAP signature scene */
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
    var rows = sec.querySelectorAll('.wrow'), lintel = sec.querySelector('.wall__lintel');
    var view = sec.querySelector('.wall__view'), plaster = sec.querySelector('.wall__plaster');
    var items = sec.querySelectorAll('.scene__steps li'), num = sec.querySelector('.wall__n');
    var blocks = [];
    rows.forEach(function (row, r) {
      var bs = row.querySelectorAll('.wb:not(.wb--gap) i');
      blocks.push(bs);
      if (r > 0) gsap.set(bs, { opacity: 0, x: (r % 2 ? 1 : -1) * (small ? 40 : 90), y: -30 });
    });
    gsap.set(lintel, { opacity: 0, y: small ? -60 : -120 });
    gsap.set(view, { opacity: 0 });
    gsap.set(plaster, { clipPath: 'inset(0 100% 0 0)' });
    var state = { row: 0, step: 0 };
    function setStep(k) {
      if (k === state.step) return;
      state.step = k;
      items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: stage, scrub: 0.6,
        onToggle: function (s) { scenePinned = s.isActive; pb(); },
        onUpdate: function (s) {
          var p = s.progress;
          var rowsDone = Math.min(8, Math.max(1, 1 + Math.floor(p / 0.56 * 7)));
          num.textContent = (rowsDone < 10 ? '0' : '') + rowsDone;
          setStep(p < 0.12 ? 0 : p < 0.3 ? 1 : p < 0.56 ? 2 : p < 0.7 ? 3 : 4);
        }
      }
    });
    /* eight courses, bottom to top, each block slides in from alternating sides */
    for (var r = 1; r < 8; r++) {
      tl.to(blocks[r], { opacity: 1, x: 0, y: 0, duration: 0.075, stagger: 0.006, ease: 'power2.out' }, (r - 1) * 0.08);
      if (r === 5) tl.to(view, { opacity: 1, duration: 0.1 }, r * 0.08);
    }
    tl.to(lintel, { opacity: 1, y: 0, duration: 0.07, ease: 'power3.out' }, 0.5);
    tl.to(plaster, { clipPath: 'inset(0 0% 0 0)', duration: 0.24 }, 0.72);
    tl.to({}, { duration: 0.06 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([lintel, view, plaster].concat([].slice.call(sec.querySelectorAll('.wb i'))), { clearProps: 'all' });
    };
  }
})();
