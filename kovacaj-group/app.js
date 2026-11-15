/* Kovacaj Group: drafting-frame hero, header, full-screen menu, anchors, reveals, process rail, phone contact bar, form validation,
   and the GSAP signature scene (exploded floors: one building photo in five bands that pull apart, labelled from the foundations up). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var hd = d.getElementById('hd');
  function onScroll() { hd.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
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
      var top = t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('xf') ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (only sourced quantities) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      el.textContent = '0';
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* process rail */
  var rail = d.querySelector('.steps__rail span'), list = d.querySelector('[data-line]'), tick = false;
  function frame() {
    tick = false;
    if (!rail || !list) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    rail.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar, after the hero */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
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

  /* signature scene: exploded floors */
  var sec = d.querySelector('.xf');
  function scene() {
    if (!sec) return;
    var bands = Array.prototype.slice.call(sec.querySelectorAll('.band')).reverse(); /* b0 (bottom) first */
    var tags = bands.map(function (b) { return b.querySelector('.tag'); });
    var num = sec.querySelector('.xf__num'), name = sec.querySelector('.xf__name');
    var names = ['Fondazioni', 'Struttura', 'Muri e serramenti', 'Impianti', 'Copertura'];
    if (reduce || !window.gsap || !window.ScrollTrigger) {
      sec.classList.add('is-static');
      bands.forEach(function (b, i) { b.style.transform = 'translateY(' + ((2 - i) * 6) + '%)'; });
      if (num) { num.textContent = '05'; name.textContent = 'Copertura'; }
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var cur = -1;
    function setK(k) {
      if (k === cur) return; cur = k;
      if (num) num.textContent = '0' + (k + 1);
      if (name) name.textContent = names[k];
      bands.forEach(function (b, i) { b.style.opacity = (!sec.classList.contains('is-open') || i <= k) ? 1 : 0.55; });
    }
    var small = window.matchMedia('(max-width: 760px)').matches;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: sec.querySelector('.xf__pin'), scrub: 0.6,
        onUpdate: function (s) { sec.classList.toggle('is-open', s.progress > 0.12); cur = -1; setK(Math.min(4, Math.floor(s.progress * 5.6))); }
      }
    });
    setK(0);
    /* 1. the building pulls apart: each band moves away from the middle */
    bands.forEach(function (b, i) { tl.to(b, { yPercent: (2 - i) * (small ? 30 : 42), duration: 1.2, ease: 'power2.inOut' }, 0); });
    /* 2. labels on leader lines, from the foundations up (desktop) */
    tags.forEach(function (t, i) { tl.fromTo(t, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.35 }, 1 + i * 0.45); });
    /* 3. hold, then close a little so the building reads whole again */
    tl.to(bands, { yPercent: function (i) { return (2 - i) * (small ? 12 : 16); }, duration: 0.8, ease: 'power2.inOut' }, 3.6)
      .to({}, { duration: 0.4 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
