/* Adam S.r.l.: type-first hero entrance, header, full-screen menu, phone bar, anchors, reveals,
   drag strip, steps line, magnetic buttons, form validation,
   and the GSAP signature scene: before / after wipe driven by scroll, with three captions. */
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

  /* drag strip with progress bar */
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
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
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

  /* ---------- signature scene: before / after ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-scene'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var caps = scene.querySelectorAll('.ba__caps li');
  function setCap(i) { caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); }
  function build() {
    var phone = window.innerWidth <= 700;
    var stage = scene.querySelector('.ba__stage'), after = scene.querySelector('.ba__img--after'), line = scene.querySelector('.ba__line');
    var before = scene.querySelector('.ba__img--before img'), afterImg = after.querySelector('img');
    gsap.set(after, { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(line, { left: 0, x: function () { return stage.offsetWidth; } });
    gsap.set(scene.querySelectorAll('.ba__head, .ba__caps, .ba__note'), { opacity: 0, y: 30 });
    gsap.set(stage, { clipPath: 'inset(8% 8% 8% 8% round 6px)' });
    gsap.set(afterImg, { scale: 1.12 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=220%', pin: scene.querySelector('.ba__pin'), scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (st) { var p = st.progress; setCap(p < 0.38 ? 0 : p < 0.72 ? 1 : 2); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelectorAll('.ba__head, .ba__caps, .ba__note'), { opacity: 1, y: 0, duration: .5, stagger: .12, ease: 'power2.out' }, 0)
      .to(stage, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: .8, ease: 'power2.out' }, 0)
      .to(before, { scale: 1.08, duration: 3.2 }, .4)
      .to(after, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6 }, .9)
      .to(line, { x: 0, duration: 2.6 }, .9)
      .to(afterImg, { scale: 1, duration: 2.6 }, .9)
      .to(line, { opacity: 0, duration: .3 }, 3.5)
      .to({}, { duration: .4 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
