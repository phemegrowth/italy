/* Immobiliare Due Pomi: hero card fan, header, full-screen menu, anchors, reveals, count-up, services photo swap,
   new-builds line, sticky phone bar, magnetic buttons, form validation, and the GSAP signature scene
   (a 3D ring of six real listings turned by the scroll). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('is-ready', 'rm'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky bar */
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
      var off = (id === '#immobili' && html.classList.contains('is-ring')) ? 0 : header.offsetHeight - 1;
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

  /* count-up: years in business (a quantity, sourced: founded 1967) */
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

  /* services: the sticky photo follows the hovered or centred row (desktop) */
  var servPic = d.querySelector('.serv__pic img'), rows = d.querySelectorAll('.serv__list li');
  function setRow(li) {
    rows.forEach(function (x) { x.classList.toggle('is-act', x === li); });
    var src = li.getAttribute('data-img');
    if (!servPic || !src || servPic.getAttribute('src') === src) return;
    if (reduce) { servPic.src = src; return; }
    servPic.style.opacity = '0';
    setTimeout(function () { servPic.onload = function () { servPic.style.opacity = '1'; }; servPic.src = src; setTimeout(function () { servPic.style.opacity = '1'; }, 600); }, 200);
  }
  if (window.matchMedia('(min-width: 900px)').matches) {
    rows.forEach(function (li) { li.addEventListener('mouseenter', function () { setRow(li); }); });
    if ('IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) setRow(x.target); }); }, { rootMargin: '-45% 0px -45% 0px' });
      rows.forEach(function (li) { rio.observe(li); });
    }
  }

  /* new-builds line draws with scroll */
  var list = d.querySelector('[data-line]'), fill = d.querySelector('.sites__line i'), tick = false;
  function frame() {
    tick = false;
    if (!list || !fill) return;
    var r = list.getBoundingClientRect(), vh = window.innerHeight, wide = window.innerWidth >= 900;
    var p = Math.min(1, Math.max(0, (vh * (wide ? 0.85 : 0.7) - r.top) / (wide ? vh * 0.45 : r.height)));
    fill.style.transform = (wide ? 'scaleX(' : 'scaleY(') + p.toFixed(3) + ')';
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true }); window.addEventListener('resize', frame); frame(); }

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

  /* signature scene: six listings on a 3D ring, the scroll turns it one card at a time */
  function scene() {
    var sec = d.querySelector('.ring');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('is-ring');
    sec.classList.add('is-ring');
    var pin = sec.querySelector('.ring__pin'), stage = sec.querySelector('.ring__stage'), track = sec.querySelector('.ring__track');
    var cards = Array.prototype.slice.call(sec.querySelectorAll('.lst')), n = cards.length, step = 360 / n;
    var head = sec.querySelector('.ring__head'), foot = sec.querySelector('.ring__foot');
    var now = sec.querySelector('.ring__now'), barI = sec.querySelector('.ring__bar i');
    var st = { a: 0 }, R = 300, front = -1;
    track.classList.add('is-3d');
    cards.forEach(function (c) { c.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; }); });

    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, small = W < 700;
      var cw = small ? Math.min(W * 0.7, H * 0.66) : Math.min(440, H * 0.64);
      var ch = Math.min(H * 0.96, cw * (small ? 1.42 : 1.32));
      track.style.setProperty('--cw', cw + 'px');
      track.style.setProperty('--ch', ch + 'px');
      R = (cw / 2) / Math.tan(Math.PI / n) * (small ? 1.04 : 1.12);
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
      draw();
    }
    function draw() {
      track.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-st.a) + 'deg)';
      var idx = Math.round(st.a / step) % n;
      cards.forEach(function (c, i) {
        var rel = ((i * step - st.a) % 360 + 540) % 360 - 180, ab = Math.abs(rel);
        c.style.opacity = ab > 100 ? 0 : (1 - Math.min(ab, 90) / 140).toFixed(3);
      });
      if (idx !== front) {
        front = idx;
        cards.forEach(function (c, i) { c.classList.toggle('is-front', i === idx); c.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
        now.textContent = ('0' + (idx + 1)).slice(-2);
      }
      barI.style.transform = 'scaleX(' + Math.min(1, (st.a / (step * (n - 1))) || 0).toFixed(3) + ')';
    }
    layout();

    var total = step * (n - 1), A = 0.04, B = 0.96;
    var points = []; for (var k = 0; k < n; k++) points.push(A + (B - A) * k / (n - 1));
    /* entrance: the heading and the ring come in while the section scrolls up, so the pin never opens on an empty screen */
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 5%', scrub: 0.5 } })
      .fromTo(head, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .fromTo(stage, { autoAlpha: 0, scale: 0.82, rotateX: 8 }, { autoAlpha: 1, scale: 1, rotateX: 0, duration: 0.8, ease: 'power2.out' }, 0.2)
      .fromTo(foot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.7);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return window.innerWidth < 700 ? '+=170%' : '+=260%'; },
        pin: pin, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        snap: { snapTo: points, inertia: false, duration: { min: 0.2, max: 0.45 }, delay: 0.1, ease: 'power2.inOut' },
        onRefresh: layout
      }
    });
    tl.to(st, { a: total, duration: B - A, ease: 'none', onUpdate: draw }, A);
    tl.to({}, { duration: 1 - B });
    window.addEventListener('resize', function () { layout(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
