/* Nogara Servizi Immobiliari: hero entrance (name and headline rise, three photos slide in from the right and drift), header, phone menu,
   anchors, reveals, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a Cremona front door whose two leaves open with the scroll onto a bright living room, while the three steps light up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js', 'no-st');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* count-ups: sourced quantities only */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1300;
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  reveal(d.querySelectorAll('[data-count]'), countUp);


  /* reel drift on scroll */
  var reelImgs = d.querySelectorAll('.strip__f img');
  if (!reduce) {
    var drift = function () { var y = window.scrollY; if (y > window.innerHeight * 1.5) return; reelImgs.forEach(function (im, i) { im.style.setProperty('--py', (y * (0.04 + i * 0.03)).toFixed(1) + 'px'); }); };
    window.addEventListener('scroll', drift, { passive: true });
  }

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: the door opens */
  var sec = d.querySelector('[data-scene]');
  html.classList.add('no-st');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.remove('no-st');
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return build(false); });
    mm.add('(max-width: 699px)', function () { return build(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function build(small) {
    var L = sec.querySelector('.leaf--l'), R = sec.querySelector('.leaf--r'), zoom = sec.querySelector('.door__zoom'),
        room = sec.querySelector('.door__room'), steps = sec.querySelectorAll('.door-steps li'), last = -1;
    gsap.set([L, R], { rotateY: 0 });
    gsap.set(room, { scale: 1.25 });
    var tl = gsap.timeline();
    tl.to(L, { rotateY: -84, ease: 'power2.inOut', duration: .5 }, .08)
      .to(R, { rotateY: 84, ease: 'power2.inOut', duration: .5 }, .12)
      .to(room, { scale: 1, ease: 'none', duration: .9 }, .1)
      .to(zoom, { scale: small ? 1 : 1.6, ease: 'power2.in', duration: .4 }, .6);
    var set = function (p) {
      var i = p < .34 ? 0 : (p < .67 ? 1 : 2);
      if (i === last) return; last = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    };
    set(0);
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true, onUpdate: function (s) { set(s.progress); } });
    return function () { st.kill(); tl.kill(); gsap.set([L, R, zoom, room], { clearProps: 'all' }); };
  }
})();
