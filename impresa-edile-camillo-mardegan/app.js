/* Camillo Mardegan: hero entrance (split, photo wipes down and parallaxes), header, full-screen menu, anchors,
   reveals, list hover swaps the photo (desktop), method line, magnetic buttons, phone bar, form validation,
   and the GSAP signature scene: vertical scroll drives a horizontal strip of their own restorations,
   each card unmasks as it enters, counter 01 / 08 and a progress bar. */
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
    html.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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
  reveal(d.querySelectorAll('.steps__line'), function (el) { el.classList.add('is-in'); });

  /* hero photo moves slower than the page (desktop) */
  var himg = d.querySelector('.hero__frame picture');
  if (himg && !reduce && window.matchMedia('(min-width: 900px)').matches) {
    var hr = false;
    window.addEventListener('scroll', function () {
      if (hr) return; hr = true;
      requestAnimationFrame(function () {
        hr = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.3) himg.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* hovering a service swaps the photo beside the list (desktop only, extra) */
  var simg = d.querySelector('[data-swap-img]'), scap = d.querySelector('[data-swap-cap]');
  if (simg && window.matchMedia('(hover: hover) and (min-width: 900px)').matches) {
    var cur = simg.getAttribute('src'), tm;
    d.querySelectorAll('.list li[data-img]').forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        var src = li.getAttribute('data-img');
        scap.textContent = li.getAttribute('data-cap');
        if (src === cur) return;
        cur = src;
        clearTimeout(tm);
        simg.classList.add('is-fading');
        tm = setTimeout(function () { simg.src = src; simg.onload = function () { simg.classList.remove('is-fading'); }; }, 180);
      });
    });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return scene(false); });
    mm.add('(max-width: 899px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]'), track = sec.querySelector('[data-track]');
    var cards = sec.querySelectorAll('.card'), imgs = sec.querySelectorAll('.card__img img'), txts = sec.querySelectorAll('.card__txt');
    var cnt = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]'), n = cards.length;
    function dist() { return Math.max(0, track.scrollWidth - sec.querySelector('.scene__viewport').clientWidth); }
    var vw = sec.querySelector('.scene__viewport').clientWidth, D = dist() || 1;
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(track, { x: function () { return -dist(); }, duration: n - 1 }, 0)
      .fromTo(barEl, { scaleX: 1 / n }, { scaleX: 1, duration: n - 1 }, 0);
    cards.forEach(function (c, i) {
      var enter = (c.offsetLeft - vw * 0.92) / D * (n - 1);
      if (enter <= 0) return; /* visible at the start: shown as is */
      tl.fromTo(c, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: .7, ease: 'power2.out' }, enter)
        .fromTo(imgs[i], { scale: 1.18 }, { scale: 1, duration: 1.1, ease: 'power2.out' }, enter)
        .fromTo(txts[i], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, enter + .3);
    });
    tl.to({}, { duration: .3 });

    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var k = Math.min(n, Math.round(tl.time()) + 1);
      if (k === last) return; last = k;
      cnt.textContent = (k < 10 ? '0' : '') + k;
    });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=260%' : '+=320%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    return function () { st.kill(); tl.kill(); gsap.set([cards, imgs, txts, track, barEl], { clearProps: 'all' }); };
  }
})();
