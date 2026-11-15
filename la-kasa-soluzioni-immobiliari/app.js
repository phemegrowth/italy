/* La Kasa: type-first hero (letters rise, photo reel slides in from the right and drifts on scroll), header, menu,
   phone bar, anchors, reveals, rating count-up, animated accordion, process line, magnetic buttons, form validation,
   and the GSAP signature scene: a red plate with KASA cut out; scroll flies through the K's stem into the photo. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
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

  /* rating count-up (4,8 from 30 Google reviews) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(1).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: .5 });
    io.observe(el);
  });

  /* accordion with height animation, one open at a time */
  var acc = d.querySelectorAll('.acc__it');
  acc.forEach(function (det) {
    var sum = det.querySelector('summary'), bodyEl = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce || !bodyEl.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = bodyEl.offsetHeight;
        var a = bodyEl.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease-in' });
        a.onfinish = function () { det.open = false; };
      } else {
        acc.forEach(function (o) { if (o !== det && o.open) o.open = false; });
        det.open = true;
        var h2 = bodyEl.offsetHeight;
        bodyEl.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
  });

  /* hero reel drifts left as the page scrolls */
  var reel = d.querySelectorAll('.reel__it');
  if (reel.length && !reduce) onFrameScroll(function () {
    var y = window.scrollY; if (y > window.innerHeight * 1.5 || !html.classList.contains('is-ready')) return;
    reel.forEach(function (it, i) { it.style.transform = y > 2 ? 'translate3d(' + (-y * (0.06 + i * 0.05)).toFixed(1) + 'px,0,0)' : ''; });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.15)));
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe: zona, tipo di casa, tempi.' };
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

  /* ---------- signature scene: KASA ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var svg = scene.querySelector('.mask__svg'), word = scene.querySelector('.mask__word'), plate = scene.querySelector('.mask__plate');
  var cap = scene.querySelector('.mask__cap'), top = scene.querySelector('.mask__top'), photo = scene.querySelector('.mask__photo img');
  function layout() {
    var W = svg.clientWidth, H = svg.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    word.setAttribute('x', W / 2); word.setAttribute('y', H / 2);
    word.style.fontSize = Math.min(W * 0.36, H * 0.42) + 'px';
    /* origin: the middle of the K's vertical stem */
    var ext = word.getExtentOfChar(0);
    return { x: ext.x + ext.width * 0.17, y: ext.y + ext.height * 0.52 };
  }
  function build() {
    var phone = window.innerWidth < 900;
    var o = layout();
    var zs = { s: 1 };
    var applyZ = function () { word.setAttribute('transform', 'translate(' + o.x + ' ' + o.y + ') scale(' + zs.s + ') translate(' + (-o.x) + ' ' + (-o.y) + ')'); };
    applyZ();
    gsap.set(photo, { scale: 1.25 });
    gsap.set(cap, { opacity: 0, y: 30 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=220%', pin: scene.querySelector('.mask__pin'), scrub: .6, anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(top, { opacity: 0, duration: .3 }, .1)
      .to(zs, { s: 24, duration: 2.2, ease: 'power2.in', onUpdate: applyZ }, .15)
      .to(photo, { scale: 1, duration: 2.6, ease: 'power1.out' }, .15)
      .to(plate, { opacity: 0, duration: .35 }, 2.05)
      .to(cap, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, 2.3)
      .to({}, { duration: .6 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
