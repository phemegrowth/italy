/* Immobiliare Italia: name fitted to the width, hero entrance and strip drift, header, phone menu, anchors, reveals,
   count-up, accordion, sticky phone bar, magnetic buttons, form, and the GSAP signature scene (pinned horizontal listings). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* fit "IMMOBILIARE" and "Italia" to the container width */
  var nameA = d.querySelector('.hero__a'), nameB = d.querySelector('.hero__b');
  function fit() {
    if (!nameA) return;
    var box = nameA.parentElement, w = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
    var inner = nameA.firstElementChild;
    nameA.style.fontSize = '100px';
    var tw = inner.scrollWidth || inner.getBoundingClientRect().width;
    if (tw) nameA.style.fontSize = Math.min(190, (100 * w / tw) * 0.995).toFixed(2) + 'px';
    if (nameB) nameB.style.fontSize = (parseFloat(nameA.style.fontSize) * 0.52).toFixed(2) + 'px';
  }
  fit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  window.addEventListener('resize', fit);

  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header, phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 120);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* phone menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#immobili' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* count-up (years in the trade, a quantity) */
  d.querySelectorAll('.count[data-to]').forEach(function (c) {
    var to = parseInt(c.getAttribute('data-to'), 10);
    if (reduce || !('IntersectionObserver' in window)) { c.textContent = to; return; }
    c.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        c.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(c);
  });

  /* hero strip drifts left a little as the page scrolls */
  var hsImgs = d.querySelectorAll('.hs img'), tick = false;
  function drift() {
    tick = false;
    var y = Math.min(window.scrollY, 900);
    hsImgs.forEach(function (im, i) { im.style.transform = 'translateX(' + (-y * (0.03 + i * 0.015)).toFixed(1) + 'px) scale(1.08)'; });
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(drift); } }, { passive: true }); drift(); }

  /* accordion */
  d.querySelectorAll('.acc__item').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      d.querySelectorAll('.acc__item').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* signature scene: vertical scroll drives the listings sideways; each card unmasks as it arrives */
  function scene() {
    var sec = d.querySelector('.reel');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    sec.classList.add('is-pinned');
    var pin = sec.querySelector('.reel__pin'), vp = sec.querySelector('.reel__vp'), track = sec.querySelector('.reel__track');
    var cards = sec.querySelectorAll('.card'), num = sec.querySelector('.reel__n'), fillBar = sec.querySelector('.reel__bar i');
    var n = cards.length;
    function dist() { return Math.max(0, track.scrollWidth - vp.clientWidth); }

    var move = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        end: function () { return '+=' + Math.round(dist() * (window.innerWidth < 700 ? 0.85 : 1.1)); },
        onUpdate: function (s) {
          var k = Math.min(n - 1, Math.round(s.progress * (n - 1)));
          num.textContent = (k < 9 ? '0' : '') + (k + 1);
          fillBar.style.transform = 'scaleX(' + (1 / n + s.progress * (1 - 1 / n)).toFixed(3) + ')';
        }
      }
    });
    cards.forEach(function (c, i) {
      var pic = c.querySelector('.card__pic img'), bodyEl = c.querySelector('.card__body');
      if (c.getBoundingClientRect().left < window.innerWidth * 0.95 && i < 2) return;
      gsap.fromTo(pic, { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.15 }, {
        clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: move, start: 'left 100%', end: 'left 55%', scrub: true }
      });
      gsap.fromTo(bodyEl, { autoAlpha: 0, y: 16 }, {
        autoAlpha: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: move, start: 'left 85%', end: 'left 50%', scrub: true }
      });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
