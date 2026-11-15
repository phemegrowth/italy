/* PN Casa: curtain hero (blue panel wipes up, badge spins in once, line reveal), header, circular menu, phone bar,
   anchors, reveals, rating count-up, process line, magnetic buttons, form validation,
   and the GSAP signature scene: from the office in Viale Grigoletti, lines draw out to the 13 comuni of their old search zones. */
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
  window.addEventListener('resize', function () { if (window.innerWidth >= 1060 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 64);
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

  /* rating count-up (4,7 from 35 Google reviews) */
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

  /* hero badge keeps turning slowly with scroll */
  var badge = d.querySelector('.hero__badge svg');
  if (badge && !reduce) onFrameScroll(function () {
    var y = window.scrollY; if (y > window.innerHeight * 1.4) return;
    badge.style.transform = 'rotate(' + (y * 0.18).toFixed(1) + 'deg)';
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete zona e cosa cercate.' };
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

  /* ---------- signature scene: the province map ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var lines = scene.querySelectorAll('.z-lines path'), pins = scene.querySelectorAll('.z-pin:not(.z-pin--home)');
  var chips = scene.querySelectorAll('.zone__chips li'), num = scene.querySelector('.zone__n');
  var N = lines.length;
  function setCount(k) {
    num.textContent = (k + 1 < 10 ? '0' : '') + (k + 1);
    chips.forEach(function (c, i) { c.classList.toggle('is-on', i < k); });
  }
  function build() {
    var phone = window.innerWidth < 900;
    var q = function (s) { return scene.querySelectorAll(s); };
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    var pinKids = []; pins.forEach(function (p) { pinKids.push(p.children); });
    pinKids.forEach(function (k) { gsap.set(k, { opacity: 0, y: -14 }); });
    gsap.set(q('.z-pin--home circle, .z-home'), { opacity: 0 });
    gsap.set(q('.z-mount, .z-river, .z-rlbl'), { opacity: 0 });
    gsap.set(q('.zone__head, .zone__chips'), { opacity: 0, y: 30 });
    gsap.to(q('.z-pulse'), { attr: { r: 26 }, opacity: 0, duration: 1.6, repeat: -1, ease: 'power1.out' });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=230%', pin: scene.querySelector('.zone__pin'), scrub: .6, anticipatePin: 1,
        onUpdate: function (st) {
          var k = Math.max(0, Math.min(N, Math.floor((st.progress - 0.18) / 0.72 * N + 0.0001)));
          setCount(k);
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(q('.zone__head, .zone__chips'), { opacity: 1, y: 0, duration: .4, stagger: .1, ease: 'power2.out' }, 0)
      .to(q('.z-mount, .z-river, .z-rlbl'), { opacity: 1, duration: .4 }, .1)
      .to(q('.z-pin--home circle:not(.z-pulse), .z-home'), { opacity: 1, duration: .3 }, .3).set(q('.z-pulse'), { opacity: .18 }, .3);
    var t = .7;
    lines.forEach(function (l, i) {
      tl.to(l, { strokeDashoffset: 0, duration: .22 }, t).to(pinKids[i], { opacity: 1, y: 0, duration: .14, ease: 'back.out(3)' }, t + .18);
      t += .22;
    });
    tl.to({}, { duration: .5 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
