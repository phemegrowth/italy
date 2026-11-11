/* Agenzia Immobiliare Stefan: hero entrance, header, full-screen menu, anchors, reveals, count-up, steps line,
   sticky phone bar, magnetic buttons, form validation, and the GSAP signature scene (fly through the word PORTELLO). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), bar = d.querySelector('.bar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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

  /* anchors with header offset (the pinned scene starts at its own top) */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (id === '#portello' || id === '#top') ? 0 : header.offsetHeight - 1;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* count-up: years of activity (a quantity) */
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
    }, { threshold: 0.6 });
    io.observe(c);
  });

  /* steps line draws with scroll */
  var steps = d.querySelector('[data-line]'), fill = d.querySelector('.steps__line i'), tick = false;
  function frame() {
    tick = false;
    if (!steps || !fill) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }

  /* magnetic buttons (desktop pointer only) */
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
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
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

  /* signature scene: PORTELLO cut out of the page, the scroll flies through the stem of the T into the porticoes */
  function scene() {
    var sec = d.querySelector('.fly');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var pin = sec.querySelector('.fly__pin'), svg = sec.querySelector('.fly__mask'), word = sec.querySelector('.fly__word');
    var photo = sec.querySelector('.fly__photo img'), over = sec.querySelector('.fly__over'), hint = sec.querySelector('.fly__hint');
    var card = sec.querySelector('.fly__card'), zones = sec.querySelectorAll('.fly__zones li');
    var origin = { x: 0, y: 0 };

    function layout() {
      var W = pin.clientWidth, H = pin.clientHeight, small = W < 700;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      word.setAttribute('x', W / 2); word.setAttribute('y', H / 2);
      word.setAttribute('font-size', 100);
      var len = word.getComputedTextLength() || 600;
      var fs = 100 * (W * (small ? 0.88 : 0.8)) / len;
      word.setAttribute('font-size', fs.toFixed(1));
      var e;
      try { e = word.getExtentOfChar(3); } catch (err) { e = null; }
      if (e && e.width) { origin.x = e.x + e.width / 2; origin.y = e.y + e.height * 0.68; }
      else { origin.x = W * 0.43; origin.y = H / 2 + fs * 0.2; }
      over.style.top = (H / 2 - fs * 0.62 - 28) + 'px';
      over.style.bottom = 'auto';
    }
    layout();

    gsap.set(card, { autoAlpha: 0, y: 48 });
    gsap.set(zones, { autoAlpha: 0, y: 10 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=130%' : '+=200%'; },
        pin: pin, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1,
        onRefreshInit: layout
      }
    });
    tl.to([over, hint], { autoAlpha: 0, y: -10, duration: 0.08 }, 0.02);
    tl.fromTo(svg, { scale: 1 }, {
      scale: 70, duration: 0.62, ease: 'power3.in',
      transformOrigin: function () { return origin.x + 'px ' + origin.y + 'px'; }
    }, 0.06);
    tl.fromTo(photo, { scale: 1.28 }, { scale: 1, duration: 0.7, ease: 'power1.out' }, 0);
    tl.to(svg, { autoAlpha: 0, duration: 0.06 }, 0.62);
    tl.to(card, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.7);
    tl.to(zones, { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.03, ease: 'power2.out' }, 0.78);
    tl.to({}, { duration: 0.1 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
