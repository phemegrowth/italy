/* Edificare: split hero with photo parallax, header, full-screen menu, anchors, reveals, field list that swaps the photo,
   method line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (their real jobs on a pinned horizontal strip, each photo unmasking as it arrives). */
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#lavori' ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var els = Array.prototype.slice.call(d.querySelectorAll('.r'));
  if (!('IntersectionObserver' in window) || reduce) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* hero photo parallax + method line, one rAF loop */
  var hImg = d.querySelector('.hero__ph img'), hBox = d.querySelector('.hero__ph');
  var mLine = d.querySelector('.met__line span'), mBox = d.querySelector('.met__line');
  var tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (hImg && hBox) {
      var r = hBox.getBoundingClientRect();
      if (r.bottom > 0) hImg.style.transform = 'translate3d(0,' + (-r.top * 0.12).toFixed(1) + 'px,0)';
    }
    if (mLine && mBox) {
      var m = mBox.getBoundingClientRect();
      mLine.style.transform = 'scaleX(' + Math.min(1, Math.max(0, (vh - m.top) / (vh * 0.6))).toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* fields: the item in the middle of the screen (or hovered) picks the photo */
  var items = d.querySelectorAll('.amb__list li'), pics = d.querySelectorAll('.amb__vis img');
  function pick(i) {
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  items.forEach(function (li, i) { li.addEventListener('mouseenter', function () { pick(i); }); });
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) pick(Array.prototype.indexOf.call(items, e.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { io2.observe(li); });
  }

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

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

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete un nome o il nome dell\'azienda.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
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

  /* signature scene: pinned horizontal strip of real jobs */
  var sec = d.querySelector('.reel');
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var track = sec.querySelector('.reel__track'), cards = sec.querySelectorAll('.card'), bar = sec.querySelector('.reel__bar span'), n = sec.querySelector('.reel__n');
    var small = window.matchMedia('(max-width: 760px)').matches;
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var cur = -1;
    var tween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.05 : 1.1)); },
        pin: sec.querySelector('.reel__pin'), scrub: 0.6, invalidateOnRefresh: true,
        onToggle: function (s) { var mb = d.querySelector('.mbar'); if (mb) mb.classList.toggle('is-hidden', s.isActive); },
        onUpdate: function (s) {
          gsap.set(bar, { scaleX: s.progress });
          var k = Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1)));
          if (k !== cur) { cur = k; n.textContent = (k < 9 ? '0' : '') + (k + 1); }
        }
      }
    });
    cards.forEach(function (c, i) {
      var ph = c.querySelector('.card__ph'), img = c.querySelector('img'), t = c.querySelector('.card__t');
      if (i < (small ? 1 : 2)) return;
      gsap.fromTo(ph, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 70%', scrub: true } });
      gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 62%', scrub: true } });
      gsap.fromTo(t, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 88%', end: 'left 70%', scrub: true } });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
