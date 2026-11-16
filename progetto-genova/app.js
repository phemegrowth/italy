/* Progetto Genova: header, full-screen menu, anchors, reveals, accordion, valley parallax, step line,
   phone contact bar, form validation, curtain hero and the GSAP signature scene (catalogue 5, layered wall). */
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

  /* accordion: animate the height of <details> */
  d.querySelectorAll('details.acc').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (det.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(function () { body.style.transition = 'height .4s ease'; body.style.height = '0px'; });
        body.addEventListener('transitionend', function te() { det.open = false; body.style.cssText = ''; body.removeEventListener('transitionend', te); });
      } else {
        det.open = true;
        var h = body.scrollHeight;
        body.style.height = '0px';
        requestAnimationFrame(function () { body.style.transition = 'height .45s ease'; body.style.height = h + 'px'; });
        body.addEventListener('transitionend', function te() { body.style.cssText = ''; body.removeEventListener('transitionend', te); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
      }
    });
  });

  /* valley photo drifts slower than the page; step line draws with scroll */
  var vimg = d.querySelector('.valley__pic img'), vbox = d.querySelector('.valley__pic');
  var steps = d.querySelector('.steps'), sline = steps;
  function onScroll2() {
    var vh = window.innerHeight;
    if (vimg && !reduce) {
      var r = vbox.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) { var t = (r.top + r.height) / (vh + r.height); vimg.style.transform = 'translate3d(0,' + (-t * 15).toFixed(2) + '%,0)'; }
    }
    if (steps && sline) {
      var s = steps.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - s.top) / (vh * 0.5)));
      sline.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll2, { passive: true });
  onScroll2();

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

  /* GSAP signature scene: a wall built layer by layer. Each finishing layer slides in over the one
     before and stops a step short, so at the end the cut shows all five: brick, rinzaffo, intonaco,
     rasatura, paint. The matching step in the list lights up. */
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
    var wall = sec.querySelector('.wall'), L = sec.querySelectorAll('.wall__l'), items = sec.querySelectorAll('.layers li');
    var head = sec.querySelector('.scene__head'), list = sec.querySelector('.layers');
    var stops = [0, 17, 34, 51, 68];
    var st = [{ v: 100 }, { v: 100 }, { v: 100 }, { v: 100 }, { v: 100 }];
    function paint(i) { return function () { L[i].style.clipPath = 'inset(0 0 0 ' + st[i].v.toFixed(2) + '%)'; }; }
    for (var i = 0; i < 5; i++) paint(i)();
    function setStep(k) { items.forEach(function (li, j) { li.classList.toggle('is-on', j === k); li.classList.toggle('is-done', j < k); }); }
    gsap.set(head, { opacity: 0, y: 30 });
    gsap.set(list, { opacity: 0 });
    gsap.set(wall, { scale: 0.92, opacity: 0.5 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=250%', pin: stage, scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.27 ? 0 : p < 0.44 ? 1 : p < 0.61 ? 2 : p < 0.78 ? 3 : 4); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(head, { opacity: 1, y: 0, duration: 0.06 }, 0)
      .to(list, { opacity: 1, duration: 0.06 }, 0.02)
      .to(wall, { scale: 1, opacity: 1, duration: 0.08 }, 0);
    for (var k = 0; k < 5; k++) tl.to(st[k], { v: stops[k], duration: 0.13, ease: 'power2.out', onUpdate: paint(k) }, 0.08 + k * 0.17);
    tl.to({}, { duration: 0.08 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([head, list, wall], { clearProps: 'all' });
      L.forEach(function (l) { l.style.clipPath = ''; });
      items.forEach(function (li) { li.classList.remove('is-on', 'is-done'); });
    };
  }
})();
