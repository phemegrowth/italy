/* Deko Costruzioni: header, full-screen menu, anchors, reveals, step line, band parallax, phone contact bar,
   form validation, curtain hero entrance, accordion and the GSAP signature scene (catalogue 2, exploded floors). */
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
  var steps = d.querySelector('.steps__line'), stepsList = d.querySelector('.steps'), band = null;
  function onFrame() {
    var vh = window.innerHeight;
    if (steps) {
      var r = stepsList.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
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

  /* accordion: one open at a time, height animated */
  var accs = d.querySelectorAll('.acc__i');
  accs.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var opening = !det.open;
      accs.forEach(function (o) { if (o !== det && o.open) close(o); });
      if (opening) open(det); else close(det);
    });
  });
  function open(det) {
    var b = det.querySelector('.acc__b');
    det.open = true;
    if (reduce) return;
    var h = b.scrollHeight; b.style.height = '0px';
    requestAnimationFrame(function () { b.style.transition = 'height .4s ease'; b.style.height = h + 'px'; });
    setTimeout(function () { b.style.height = ''; b.style.transition = ''; }, 450);
  }
  function close(det) {
    var b = det.querySelector('.acc__b');
    if (reduce) { det.open = false; return; }
    b.style.height = b.scrollHeight + 'px';
    requestAnimationFrame(function () { b.style.transition = 'height .35s ease'; b.style.height = '0px'; });
    setTimeout(function () { det.open = false; b.style.height = ''; b.style.transition = ''; }, 380);
  }

  /* GSAP signature scene: one building photo cut into five floors. Pinned, the scroll pulls the floors apart
     from the top down, each floor gets its label on a leader line and the list on the right follows. */
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
    var bld = sec.querySelector('.scene__build'), slices = sec.querySelectorAll('.slice');
    var labels = sec.querySelectorAll('.slice em');
        var gap = small ? 16 : 22;
    gsap.set(labels, { opacity: 0, x: -10 });
    var imgs = sec.querySelectorAll('.slice__img');
    gsap.set(imgs, { clipPath: 'inset(100% 0 0 0)' });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: stage, scrub: 0.6,
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    /* the building rises into view, ground floor first */
    /* the building rises floor by floor while the section scrolls in, before the pin */
    var intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 70%', end: 'top 5%', scrub: 0.5 } });
    for (var q = 4; q >= 0; q--) intro.to(imgs[q], { clipPath: 'inset(0% 0 0 0)', duration: 0.2, ease: 'none' }, (4 - q) * 0.2);
    tl.to(bld, { scale: small ? 0.92 : 0.86, duration: 0.2 }, 0.1);
    /* floors separate: the ground floor stays, the others lift by a growing gap */
    for (var step = 0; step < 5; step++) {
      var at = 0.12 + step * 0.15;
      /* slice index from the bottom: foundations first */
      var idx = 4 - step;
      for (var j = Math.max(idx, 1); j <= 4; j++) {
        /* the current floor and every floor below it drop by one more gap: the building opens from the bottom */
        tl.to(slices[j], { y: '+=' + gap, duration: 0.1, ease: 'power2.out' }, at);
      }
      tl.to(labels[idx], { opacity: 1, x: 0, duration: 0.07 }, at + 0.03);
    }
    tl.to({}, { duration: 0.08 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); intro.scrollTrigger && intro.scrollTrigger.kill(); intro.kill();
      gsap.set([labels, bld, slices, imgs], { clearProps: 'all' });
    };
  }
})();
