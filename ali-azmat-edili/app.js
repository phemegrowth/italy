/* Ali Azmat Edili: number-led hero with an arch-shaped photo, header, menu, phone bar, anchors, reveals,
   count-up (7 five-star reviews), magnetic buttons, form validation, and the GSAP signature scene:
   a Bologna facade drawn as a blueprint that fills in from the ground up with the scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
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
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
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

  /* ---------- signature scene: blueprint to facade ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  html.classList.add('js-scene');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var steps = scene.querySelectorAll('.bp__steps li'), pct = scene.querySelector('.bp__pct b');
  var photo = scene.querySelector('.bp__photo'), paths = scene.querySelectorAll('.bp__svg path');
  var cur = -1;
  function setI(i) { if (i === cur) return; cur = i; steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }
  function build() {
    var phone = window.innerWidth < 700;
    var st0 = { v: 0 };
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 });
    gsap.set(scene.querySelector('.bp__side'), { opacity: 0, y: 24 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=240%', pin: scene.querySelector('.bp__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) { var p = st.progress; setI(p < .3 ? 0 : p < .55 ? 1 : p < .8 ? 2 : 3); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelector('.bp__side'), { opacity: 1, y: 0, duration: .25, ease: 'power2.out' }, 0)
      .to(paths, { strokeDashoffset: 0, duration: .5, stagger: .09 }, .05)
      .to(photo, { clipPath: 'inset(66% 0% 0% 0%)', duration: .3, ease: 'power1.inOut' }, 1)
      .to(photo, { clipPath: 'inset(36% 0% 0% 0%)', duration: .3, ease: 'power1.inOut' }, 1.4)
      .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .35, ease: 'power1.inOut' }, 1.8)
      .to(paths, { opacity: .28, duration: .4 }, 1.9)
      .to(st0, { v: 100, duration: 1.15, onUpdate: function () { pct.textContent = Math.round(st0.v); } }, 1)
      .to({}, { duration: .3 });
    setI(0);
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
