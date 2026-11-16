/* Costruzioni Milazzo: hero F (grid lines draw, frame wipes open), line reveal, header, menu, phone bar, anchors, reveals,
   accordion (one open), steps line, magnetic buttons, form validation, and the GSAP signature scene:
   a blueprint elevation draws itself, then their finished house rises through it floor by floor with a % built counter. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  /* drag strip */
  d.querySelectorAll('.strip').forEach(function (s) {
    var bar = s.parentNode.querySelector('.strip__bar');
    function upd() { var m = s.scrollWidth - s.clientWidth; var p = m > 0 ? s.scrollLeft / m : 1; if (bar) bar.style.setProperty('--p', (0.15 + p * 0.85).toFixed(3)); }
    s.addEventListener('scroll', upd, { passive: true }); upd();
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
  });

  /* steps line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* accordion: one open at a time */
  var acc = d.querySelectorAll('.acc__it');
  acc.forEach(function (it) { it.addEventListener('toggle', function () { if (it.open) acc.forEach(function (o) { if (o !== it) o.open = false; }); }); });

  /* ---------- signature scene: blueprint to building ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var q = function (s) { return scene.querySelectorAll(s); };
  var stage = scene.querySelector('.bp__stage'), photo = scene.querySelector('.bp__photo'), level = scene.querySelector('.bp__level');
  var pct = scene.querySelector('.bp__pct'), steps = q('.bp__steps li'), svg = scene.querySelector('.bp__svg');
  function setStep(i) { steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); }); }
  function build() {
    var phone = window.innerWidth <= 999;
    var st = { v: 0 };
    function paint() {
      var v = st.v, h = stage.clientHeight;
      photo.style.clipPath = 'inset(' + ((1 - v) * 100).toFixed(2) + '% 0 0 0)';
      level.style.transform = 'translateY(' + (-v * (h - 2)).toFixed(1) + 'px)';
      pct.textContent = Math.round(v * 100);
      setStep(v <= 0 ? 0 : v < .2 ? 1 : v < .62 ? 2 : v < .9 ? 3 : 4);
    }
    gsap.set(q('.bp__draw path'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(q('.bp__copy > *, .bp .label, .bp h2, .bp__count, .bp__steps'), { opacity: 0, y: 24 });
    gsap.set(stage, { opacity: 0, y: 30 });
    paint();
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=230%', pin: scene.querySelector('.bp__pin'), scrub: .6, anticipatePin: 1,
        onToggle: function (s) { body.classList.toggle('in-scene', s.isActive); }
      }
    });
    tl.to(q('.bp .label, .bp h2, .bp__count, .bp__steps'), { opacity: 1, y: 0, duration: .4, stagger: .08, ease: 'power2.out' }, 0)
      .to(stage, { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, .1)
      .to(q('.bp__draw path'), { strokeDashoffset: 0, duration: .5, stagger: .14 }, .5)
      .to(level, { opacity: 1, duration: .1 }, 1.9)
      .to(st, { v: .2, duration: .5, onUpdate: paint }, 2.0)
      .to(st, { v: .62, duration: .8, onUpdate: paint }, 2.5)
      .to(st, { v: .9, duration: .6, onUpdate: paint }, 3.3)
      .to(st, { v: 1, duration: .4, onUpdate: paint }, 3.9)
      .to(svg, { opacity: .18, duration: .4 }, 3.9)
      .to(level, { opacity: 0, duration: .2 }, 4.3)
      .to({}, { duration: .4 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start, start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
