/* Nord Edil: blueprint-frame hero, header, full-screen menu, phone bar, anchors, reveals, count-up,
   before/after slider, steps line, magnetic buttons, form validation,
   and the GSAP signature scene: an x-ray house section that fills trade by trade with the scroll. */
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
  var sl = d.querySelector('.steps__line');
  if (sl) onFrameScroll(function () {
    var r = sl.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (vh * 0.55)));
    sl.style.setProperty('--p', p.toFixed(3));
  });

  /* before / after */
  var ba = d.querySelector('[data-ba]');
  if (ba) {
    var range = ba.querySelector('.ba__range');
    var setX = function (v) { ba.style.setProperty('--x', v + '%'); };
    range.addEventListener('input', function () { setX(range.value); });
    setX(range.value);
    if (!reduce && 'IntersectionObserver' in window) {
      var hinted = false;
      new IntersectionObserver(function (en, o) {
        if (!en[0].isIntersecting || hinted) return; hinted = true; o.disconnect();
        var t0 = null;
        (function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1600); var v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p); range.value = v; setX(v); if (p < 1) requestAnimationFrame(step); })(performance.now());
      }, { threshold: .5 }).observe(ba);
    }
  }

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

  /* ---------- signature scene: x-ray house ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  html.classList.add('js-scene');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var items = scene.querySelectorAll('.xlist li'), lays = scene.querySelectorAll('.lay');
  var cnt = scene.querySelector('.xray__count b'), bar = scene.querySelector('.xray__bar');
  var nowB = scene.querySelector('.xray__now b'), nowS = scene.querySelector('.xray__now span');
  var cur = -1, n = lays.length;
  function setI(i) {
    if (i === cur) return; cur = i;
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    lays.forEach(function (g, k) { g.classList.toggle('is-on', k === i); });
    cnt.textContent = '0' + (i + 1);
    var li = items[i];
    if (li) { nowB.textContent = li.querySelector('h3').textContent; nowS.textContent = li.querySelector('p').textContent; }
  }
  function build() {
    var phone = window.innerWidth < 700;
    var paths = scene.querySelectorAll('.lay path');
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(scene.querySelector('.xray__side'), { opacity: 0, y: 26 });
    gsap.set(scene.querySelector('.xray__card'), { opacity: 0, scale: .94 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=160%' : '+=260%', pin: scene.querySelector('.xray__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) {
          var p = st.progress;
          setI(Math.max(0, Math.min(n - 1, Math.floor((p - 0.08) / 0.86 * n))));
          bar.style.setProperty('--p', Math.max(0.03, Math.min(1, (p - 0.08) / 0.86)).toFixed(3));
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelector('.xray__side'), { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, 0)
      .to(scene.querySelector('.xray__card'), { opacity: 1, scale: 1, duration: .35, ease: 'power2.out' }, 0);
    lays.forEach(function (g, k) { tl.to(g.querySelectorAll('path'), { strokeDashoffset: 0, duration: .8, stagger: .06 }, .4 + k); });
    tl.to({}, { duration: .5 });
    setI(0);
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
