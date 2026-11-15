/* Punto Impresa: type-first hero (CSS entrance on the first frame), reel drift, header, menu, anchors, reveals,
   cursor photo on the work index, magnetic buttons, mobile bar, form, and the GSAP signature scene: their own
   Via Botero photo sliced in five bands that pull apart, each part of the condominium labelled. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* hero reel drifts left as you scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* work index: a photo follows the cursor over rows that have one (desktop only) */
  var fl = d.querySelector('.idx__float'), flImg = fl && fl.querySelector('img');
  if (fl && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var fx = 0, fy = 0, tx = 0, ty = 0, on = false, raf = 0;
    var loop = function () { fx += (tx - fx) * .18; fy += (ty - fy) * .18; fl.style.transform = 'translate(' + (fx + 24).toFixed(1) + 'px,' + (fy - 120).toFixed(1) + 'px)'; raf = on ? requestAnimationFrame(loop) : 0; };
    d.querySelectorAll('.idx__it[data-img]').forEach(function (it) {
      it.addEventListener('mouseenter', function (e) { flImg.src = it.getAttribute('data-img'); fx = tx = e.clientX; fy = ty = e.clientY; on = true; fl.classList.add('is-on'); if (!raf) loop(); });
      it.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
      it.addEventListener('mouseleave', function () { on = false; fl.classList.remove('is-on'); });
    });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    exScene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function exScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var bands = sec.querySelectorAll('.ex__band'), labs = sec.querySelectorAll('.ex__lab'), cnt = sec.querySelector('[data-count]');
    var G = small ? 30 : 40;
    gsap.set(bands, { y: 0 });
    gsap.set(labs, { autoAlpha: 0, x: -10 });
    gsap.set(sec.querySelectorAll('.ex__img'), { borderTopColor: 'rgba(224,82,76,0)' });
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to({}, { duration: .3 }, 0);
    bands.forEach(function (b, i) {
      tl.to(b, { y: small ? i * G : (i - 2) * G, duration: 1.6 }, .3);
    });
    tl.to(sec.querySelectorAll('.ex__img'), { borderTopColor: 'rgba(224,82,76,1)', duration: .6 }, 1.2);
    var at = [];
    labs.forEach(function (l, i) { at[i] = 1.6 + i * .55; tl.to(l, { autoAlpha: 1, x: 0, duration: .4, ease: 'power2.out' }, at[i]); });
    tl.to({}, { duration: .8 }, at[labs.length - 1] + .4);
    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), n = 0;
      at.forEach(function (a) { if (t >= a) n++; });
      if (n !== last) { last = n; cnt.textContent = '0' + n; }
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
  }
})();
