/* MVR Arte Edile: header, full-screen menu, anchors, reveals, services list with a floating photo (desktop),
   process line that grows with scroll, phone contact bar, form validation, and the GSAP signature scene
   (invented after catalogue 5, seen from the front: a drywall partition builds up with scroll:
   steel frame, insulation, boards, joints, paint). */
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

  function reveal(els, cb, margin) {
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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * .9) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), sceneEl = d.querySelector('.scene'), scenePinned = false;
  function pb() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    var sr = sceneEl.getBoundingClientRect(), inScene = sr.top < 2 && sr.bottom > window.innerHeight - 2;
    pbar.classList.toggle('is-on', past && !scenePinned && !inScene && !inContact);
  }
  window.addEventListener('scroll', pb, { passive: true });
  pb();

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


  /* services: floating photo follows the hovered row (desktop) */
  var rows = d.querySelectorAll('.svc__row'), flt = d.querySelector('.svc__float'), fimgs = flt.querySelectorAll('img');
  var fine = window.matchMedia('(hover: hover) and (min-width: 901px)').matches;
  rows.forEach(function (r) {
    r.addEventListener('mouseenter', function () {
      if (!fine) return;
      rows.forEach(function (x) { x.classList.toggle('is-on', x === r); });
      var k = +r.getAttribute('data-img');
      fimgs.forEach(function (im, j) { im.classList.toggle('is-on', j === k); });
      flt.style.setProperty('--fy', (r.offsetTop - flt.offsetHeight / 2 + r.offsetHeight / 2) + 'px');
      flt.classList.add('is-on');
    });
  });
  d.querySelector('.svc__list').addEventListener('mouseleave', function () { flt.classList.remove('is-on'); rows.forEach(function (x) { x.classList.remove('is-on'); }); });

  /* process line grows with scroll */
  var sl = d.querySelector('.steps__list');
  function prog() {
    var r = sl.getBoundingClientRect(), h = window.innerHeight;
    var p = Math.min(1, Math.max(0, (h * .75 - r.top) / r.height));
    sl.style.setProperty('--prog', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', prog, { passive: true }); prog();

  /* GSAP signature scene: the partition */
  var sec = sceneEl, lis = sec.querySelectorAll('.steps5 li');
  function setStep(k) { lis.forEach(function (l, j) { l.classList.toggle('is-on', j <= k); l.classList.toggle('is-cur', j === k); }); }
  function staticScene() { sec.classList.add('scene--static'); }
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) { staticScene(); return; }
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
    var q = function (s) { return sec.querySelectorAll(s); };
    var guides = q('.w-g1, .w-g2'), studs = q('.w-studs rect'), wool = q('.w-wool rect'), boards = q('.w-boards rect'),
        screws = q('.w-screws circle'), joints = q('.w-joints rect'), paint = q('.w-paint'), fin = q('.w-final');
    gsap.set(guides, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(studs, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(wool, { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' });
    gsap.set(boards, { x: 640, opacity: 0 });
    gsap.set(screws, { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set([joints, paint, fin], { opacity: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=240%', pin: sec.querySelector('.scene__stage'), scrub: 0.6,
        onUpdate: function (s) { var p = s.progress; setStep(p < 0.22 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.78 ? 3 : 4); },
        onToggle: function (s) { scenePinned = s.isActive; pb(); }
      }
    });
    tl.to(guides, { scaleX: 1, duration: .08, stagger: .02 }, 0)
      .to(studs, { scaleY: 1, duration: .08, stagger: .02 }, .07)
      .to(wool, { scaleY: 1, opacity: 1, duration: .1, stagger: .025 }, .24)
      .to(boards, { x: 0, opacity: 1, duration: .12, stagger: .05, ease: 'power2.out' }, .42)
      .to(screws, { opacity: 1, scale: 1, duration: .04, stagger: .006 }, .56)
      .to(joints, { opacity: 1, duration: .08, stagger: .01 }, .62)
      .to(paint, { opacity: 1, duration: .1 }, .8)
      .to(fin, { opacity: 1, duration: .06 }, .88)
      .to({}, { duration: .06 });
    setStep(0);
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([guides, studs, wool, boards, screws, joints, paint, fin], { clearProps: 'all' });
    };
  }
})();
