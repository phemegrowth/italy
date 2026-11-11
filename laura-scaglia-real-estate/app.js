/* Laura Scaglia Real Estate: Ken Burns hero with line reveal, header, full-screen phone menu, anchors, reveals,
   count-up, accordion, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   their real listings on a horizontal strip that the vertical scroll drives, each photo unmasking as it enters,
   with a 01 / 07 counter and a gold progress line (the rule from their logo). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.getElementById('header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 899 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick');
      if (pick) { var sel = d.getElementById('f-int'); if (sel) sel.value = pick; }
      setTimeout(function () {
        window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
      }, menu.classList.contains('is-open') ? 50 : 0);
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* count-up (sourced numbers only: Google score and review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* gold rules draw when they enter */
  reveal(d.querySelectorAll('.rule'), function (el) { el.classList.add('is-in'); });

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa vi serve.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    listingsScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function listingsScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('[data-track]'), view = sec.querySelector('.hs__view');
    var cards = track.querySelectorAll('.card'), cur = sec.querySelector('[data-cur]'), bar = sec.querySelector('[data-bar]');
    var head = sec.querySelector('.hs__head'), note = sec.querySelector('.hs__note');
    var n = cards.length;
    function dist() { return Math.max(0, track.scrollWidth - view.clientWidth); }

    gsap.set(head, { autoAlpha: 0, y: 30 });
    gsap.set(note, { autoAlpha: 0 });
    var intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 75%', end: 'top 15%', scrub: .5 } });
    intro.to(head, { autoAlpha: 1, y: 0, duration: 1 }).to(note, { autoAlpha: 1, duration: .5 }, .5);

    var move = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (window.innerWidth < 900 ? .9 : 1.05)); },
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var k = Math.min(n, Math.max(1, Math.round(self.progress * (n - 1)) + 1));
          cur.textContent = (k < 10 ? '0' : '') + k;
          bar.style.transform = 'scaleX(' + (0.14 + self.progress * 0.86).toFixed(3) + ')';
        }
      }
    });

    /* each photo unmasks from the left edge as its card comes in; the text rises after it */
    cards.forEach(function (c, i) {
      var pic = c.querySelector('.card__pic img, .card__cta'), body = c.querySelector('.card__body');
      if (i < 2 || (window.innerWidth < 900 && i < 1)) return;
      gsap.fromTo(pic, { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: move, start: 'left 100%', end: 'left 60%', scrub: true } });
      if (body) gsap.fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: move, start: 'left 85%', end: 'left 55%', scrub: true } });
    });
  }
})();
