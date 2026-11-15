/* BNF Costruzioni: header, full-screen menu, anchors, reveals, count-up, hero reel drift, service photo swap,
   phone contact bar, form validation and the GSAP signature scene (catalogue 2, exploded floors). */
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

  /* count-up (sourced quantities only: rating, review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* hero reel: drifts left as the page scrolls (transform only) */
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var rq = false;
    var drift = function () {
      rq = false;
      var y = window.scrollY;
      if (y < window.innerHeight * 1.5) track.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!rq) { rq = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  /* services: hovering or focusing a service swaps the photo (desktop) */
  var pics = d.querySelectorAll('.svc__pic img'), svcs = d.querySelectorAll('.svc__list li');
  function showPic(k) {
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === k); });
    svcs.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
  }
  svcs.forEach(function (li) {
    var k = +li.getAttribute('data-pic');
    li.addEventListener('mouseenter', function () { showPic(k); });
  });

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

  /* GSAP signature scene: exploded floors. One building photo in five slices; the scroll pulls them apart,
     each layer gets its accent edge and a label on a leader line. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', function () { return explode(false); });
    mm.add('(max-width: 760px)', function () { return explode(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function explode(small) {
    var sec = d.querySelector('.scene'), stage = sec.querySelector('.scene__stage'), fig = sec.querySelector('.scene__fig');
    var slices = sec.querySelectorAll('.slice'), labels = sec.querySelectorAll('.scene__labels li');
    var head = sec.querySelector('.scene__head'), end = sec.querySelector('.scene__end');
    var gap = function () { return fig.offsetHeight * (small ? 0.16 : 0.1); };
    gsap.set(head, { opacity: 0, y: 30 });
    gsap.set(fig, { opacity: 0, scale: 0.92 });
    gsap.set(labels, { opacity: 0, x: 24 });
    gsap.set(end, { opacity: 0, y: 20 });
    gsap.set(slices, { boxShadow: '0 -3px 0 rgba(88,184,216,0)' });
    gsap.set(fig, { transformOrigin: '50% 50%' });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: stage, scrub: 0.6, invalidateOnRefresh: true,
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.1 }, 0)
      .to(fig, { opacity: 1, scale: 1, duration: 0.12 }, 0.04);
    slices.forEach(function (s, i) {
      var off = function () { return (i - 2) * gap(); };
      tl.to(s, { y: off, x: (i % 2 ? 1 : -1) * (small ? 4 : 10), boxShadow: i ? '0 -3px 0 rgba(88,184,216,1)' : 'none', duration: 0.45, ease: 'power2.inOut' }, 0.18);
      tl.to(labels[i], { y: off, duration: 0.45, ease: 'power2.inOut' }, 0.18);
      tl.to(labels[i], { opacity: 1, x: 0, duration: 0.1 }, 0.36 + i * 0.06);
    });
    tl.to(end, { opacity: 1, y: 0, duration: 0.1 }, 0.82).to({}, { duration: 0.08 });
    return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set([head, fig, end, slices, labels], { clearProps: 'all' }); };
  }
})();
