/* SRSC Impresa Edile: header, full-screen menu, anchors, reveals, hero count-up, before/after wipe, step line,
   phone contact bar, form validation and the GSAP signature scene (catalogue 1, blueprint to building:
   the elevation draws itself, then the building photo rises floor by floor with a % built counter). */
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

  /* hero: count up to 41 (years since 1985, their own claim), starts on the first frame */
  var cnt = d.querySelector('.count');
  if (cnt && !reduce) {
    var to = +cnt.getAttribute('data-to'), t0 = null;
    cnt.textContent = '0';
    var tick = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1300); cnt.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  /* renovation photo: the finished room wipes over the raw one as the panel crosses the screen */
  var swap = d.querySelector('.job__pic--swap');
  var steps = d.querySelector('.steps__line'), stepsList = d.querySelector('.steps');
  function onFrame() {
    var vh = window.innerHeight;
    if (swap) {
      var s = swap.getBoundingClientRect();
      var q = reduce ? 0.5 : Math.min(1, Math.max(0, (vh * 0.8 - s.top) / (vh * 0.7)));
      swap.style.setProperty('--cut', ((1 - q) * 100).toFixed(1) + '%');
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
    var paths = sec.querySelectorAll('.bp__draw path'), grid = sec.querySelector('.bp__grid');
    var photo = sec.querySelector('.bp__photo'), dims = sec.querySelectorAll('.bp__dim');
    var items = sec.querySelectorAll('.scene__steps li'), pct = sec.querySelector('.pct');
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(photo, { '--rise': '100%' });
    gsap.set([grid, dims], { opacity: 0 });
    var cur = -1;
    function setStep(k) { if (k === cur) return; cur = k; items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); }); }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=230%', pin: stage, scrub: 0.6,
        onToggle: function (s) { scenePinned = s.isActive; pb(); },
        onUpdate: function (s) {
          var p = s.progress, built = Math.max(0, Math.min(100, Math.round((p - 0.32) / 0.6 * 100)));
          pct.textContent = built;
          setStep(p < 0.32 ? 0 : built < 25 ? 1 : built < 50 ? 2 : built < 80 ? 3 : 4);
        }
      }
    });
    tl.to(grid, { opacity: 1, duration: 0.06 }, 0);
    tl.to(paths, { strokeDashoffset: 0, duration: 0.24, stagger: 0.012 }, 0.02);
    tl.to(dims, { opacity: 1, duration: 0.05 }, 0.22);
    /* the photo rises floor by floor from the ground, in four steps */
    tl.to(photo, { '--rise': '75%', duration: 0.13 }, 0.32);
    tl.to(photo, { '--rise': '50%', duration: 0.13 }, 0.47);
    tl.to(photo, { '--rise': '25%', duration: 0.13 }, 0.62);
    tl.to(photo, { '--rise': '0%', duration: 0.15 }, 0.77);
    tl.to(sec.querySelector('.bp__draw'), { opacity: 0.35, duration: 0.1 }, 0.84);
    tl.to({}, { duration: 0.06 });
    return function () {
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill();
      gsap.set([photo, grid, dims, sec.querySelector('.bp__draw')].concat([].slice.call(paths)), { clearProps: 'all' });
    };
  }
})();
