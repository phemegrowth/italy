/* Agorà Costruzioni: hero entrance (drawn frame and grid, photo fades in, headline line reveal), header, full-screen menu,
   sticky phone bar, anchors, reveals, accordion, process line, form validation,
   and the GSAP signature scene: a blueprint elevation draws itself, then the building rises floor by floor inside it. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) { html.classList.add('rm', 'is-ready'); }
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  /* count-up (none on this page) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: .3 });
    io.observe(el);
  });

  /* accordion: one open at a time, height animated with grid rows */
  d.querySelectorAll('[data-acc] .acc__item').forEach(function (it, i, all) {
    var btn = it.querySelector('button');
    btn.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      setTimeout(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 600);
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* magnetic buttons, desktop only */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul progetto.' };
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

  /* ---------- signature scene: blueprint to building ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var pct = scene.querySelector('.bp__pct'), phases = scene.querySelectorAll('.bp__phases li');
  var ax = scene.querySelectorAll('.ax path'), st = scene.querySelectorAll('.st path'), wn = scene.querySelectorAll('.wn path'), dm = scene.querySelectorAll('.dm path, .dm text');
  var photo = scene.querySelector('.bp__photo'), img = photo.querySelector('img'), draw = scene.querySelector('.bp__draw');
  function build() {
    var phone = window.innerWidth <= 700;
    gsap.set([ax, st, wn], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(scene.querySelectorAll('.dm path'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(scene.querySelector('.dm text'), { opacity: 0 });
    gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(img, { scale: 1.15 });
    var state = { p: 0 };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=160%' : '+=240%', pin: scene.querySelector('.bp__pin'), scrub: .6, anticipatePin: 1,
        onToggle: function (s) { body.classList.toggle('in-scene', s.isActive); }
      }
    });
    tl.to(ax, { strokeDashoffset: 0, duration: .6, stagger: .1 }, 0)
      .to(st, { strokeDashoffset: 0, duration: 1, stagger: .12 }, .3)
      .to(wn, { strokeDashoffset: 0, duration: .4, stagger: .03 }, .9)
      .to(scene.querySelectorAll('.dm path'), { strokeDashoffset: 0, duration: .4 }, 1.4)
      .to(scene.querySelector('.dm text'), { opacity: 1, duration: .3 }, 1.6)
      /* the building rises floor by floor inside the drawing */
      .to(photo, { clipPath: 'inset(74% 0 0 0)', duration: .7 }, 2.0)
      .to(photo, { clipPath: 'inset(48% 0 0 0)', duration: .7 }, 2.8)
      .to(photo, { clipPath: 'inset(22% 0 0 0)', duration: .7 }, 3.6)
      .to(photo, { clipPath: 'inset(0% 0 0 0)', duration: .7 }, 4.4)
      .to(img, { scale: 1, duration: 3.1 }, 2.0)
      .to(wn, { opacity: .25, duration: .8 }, 4.4)
      .to(state, { p: 100, duration: 3.1, onUpdate: function () {
          var v = Math.round(state.p); pct.textContent = v;
          var k = v === 0 ? 0 : v < 30 ? 1 : v < 75 ? 2 : v < 100 ? 3 : 4;
          phases.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
        } }, 2.0)
      .to({}, { duration: .5 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
