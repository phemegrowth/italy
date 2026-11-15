/* TraianoCasa: hero deck that fans into a collage, header, full-screen menu, anchors, reveals, count-up (years since 1985),
   tabs (vendo / compro / affitto), phone contact bar, form validation, and the GSAP signature scene:
   the five services on a ring that the scroll turns, the front card edged in their red, counter 01 / 05. */
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

  /* count-up: years in business (sourced: "Dal 1985") */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    if (reduce) return;
    var to = +el.getAttribute('data-count'), t0 = null;
    el.textContent = '0';
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* tabs */
  var tabs = Array.prototype.slice.call(d.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab, panel = d.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on && !reduce) { panel.classList.remove('is-in-anim'); void panel.offsetWidth; panel.classList.add('is-in-anim'); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sulla casa.' };
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

  /* GSAP signature scene: service ring */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { ringScene(false); });
    mm.add('(max-width: 899px)', function () { ringScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    var cards = Array.prototype.slice.call(sec.querySelectorAll('.rc'));
    var cnt = sec.querySelector('[data-ring-count]'), barEl = sec.querySelector('[data-ring-bar]');
    var N = cards.length, step = 360 / N;
    var state = { a: 0, intro: 0.4 };
    function radius() { return small ? Math.min(window.innerWidth * 0.5, 230) : 440; }
    function draw() {
      var R = radius(), front = Math.round(-state.a / step);
      cards.forEach(function (c, i) {
        var th = (i * step + state.a) * Math.PI / 180;
        var cs = Math.cos(th), sn = Math.sin(th);
        var x = sn * R, z = (cs - 1) * R * 0.9;
        var s = (0.72 + 0.28 * (cs + 1) / 2) * (0.85 + 0.15 * state.intro);
        var o = cs > -0.1 ? 0.35 + 0.65 * Math.max(0, cs) : 0;
        if (!small && cs > -0.6) o = Math.max(o, 0.25);
        c.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + ((1 - state.intro) * 60).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (sn * -28).toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
        c.style.opacity = (o * state.intro).toFixed(3);
        c.style.zIndex = String(Math.round(cs * 100) + 100);
        c.classList.toggle('is-front', i === front);
      });
      cnt.textContent = '0' + (Math.min(N - 1, Math.max(0, front)) + 1);
    }
    gsap.set(barEl, { scaleX: 0 });
    var tl = gsap.timeline({ onUpdate: draw });
    tl.to(state, { intro: 1, duration: .5, ease: 'power2.out' }, 0);
    for (var k = 0; k < N; k++) tl.addLabel('c' + k, .5 + k);
    tl.to(state, { a: -(N - 1) * step, duration: N - 1, ease: 'none' }, .5)
      .to(barEl, { scaleX: 1, duration: N - .5, ease: 'none' }, 0)
      .to({}, { duration: .4 }, N - .5);
    draw();
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); },
      onRefresh: draw
    });
    return function () {
      st.kill();
      cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.classList.remove('is-front'); });
    };
  }
})();
