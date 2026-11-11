/* Qualità Immobiliare, Dalmine: hero survey-frame entrance, header, full-screen phone menu, anchors, reveals,
   accordion, drag strip for reviews, count-ups, magnetic buttons, phone bar, form, and the GSAP signature scene:
   the zone map, where routes draw from the office in Mariano to the seven towns and pins drop one by one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('rm', 'is-ready'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.classList.contains('scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion: height animation, one open at a time */
  d.querySelectorAll('.acc__it').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)' }).onfinish = function () { det.open = false; };
      } else {
        d.querySelectorAll('.acc__it[open]').forEach(function (o) { if (o !== det) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
  });

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('mousedown', function (e) { down = true; moved = false; x0 = e.pageX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* count-up (233 Google reviews) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
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
    mapScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var names = ['Mariano di Dalmine', 'Dalmine', 'Treviolo', 'Lallio', 'Levate', 'Osio Sopra', 'Osio Sotto', 'Boltiere'];
    var routes = q('.m-routes path'), pins = q('.m-pin'), home = sec.querySelector('.m-home');
    var ctx = q('.m-river, .m-road, .m-a4, .m-tag, .m-north'), grid = sec.querySelector('.m-grid');
    var num = sec.querySelector('[data-num]'), town = sec.querySelector('[data-town]'), chips = q('.towns li');
    routes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(ctx, { autoAlpha: 0 });
    gsap.set(home, { autoAlpha: 0, scale: .2, transformOrigin: '50% 50%' });
    gsap.set(pins, { autoAlpha: 0, y: -26 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(grid, { autoAlpha: 1, duration: .5 }, 0)
      .to(ctx, { autoAlpha: 1, duration: .6, stagger: .1 }, .2)
      .to(home, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, .6);
    var at = [];
    routes.forEach(function (r, i) {
      var t0 = 1.3 + i * 1.05;
      at[i] = t0 + .5;
      tl.to(r, { strokeDashoffset: 0, duration: .8, ease: 'power1.inOut' }, t0)
        .to(pins[i], { autoAlpha: 1, y: 0, duration: .45, ease: 'bounce.out' }, t0 + .55);
    });
    tl.to({}, { duration: .6 }, 1.3 + routes.length * 1.05);

    var last = -1;
    function sync() {
      var t = tl.time(), k = 0;
      for (var j = 0; j < at.length; j++) if (t >= at[j]) k = j + 1;
      if (k === last) return;
      last = k;
      num.textContent = (k < 10 ? '0' : '') + k;
      town.textContent = names[k];
      chips.forEach(function (c) { c.classList.toggle('is-on', +c.getAttribute('data-t') <= k); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
