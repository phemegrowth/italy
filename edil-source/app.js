/* Edil Source: hero H (red curtain lifts off their own plant-room photo, house mark turns away), line reveal,
   header, menu, phone bar, anchors, reveals, sticky service list that swaps the photo, process line,
   magnetic buttons, form validation, and the GSAP signature scene: a house section that is built
   (structure), finished (rooms) and plumbed (hot, cold, electric) as you scroll. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); setTimeout(function () { html.classList.add('kb'); }, 2400); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
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
  window.addEventListener('resize', function () { if (window.innerWidth >= 1080 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
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

  /* service list: the item nearest the middle of the screen is active and drives the photo */
  var items = d.querySelectorAll('.svc__item'), pics = d.querySelectorAll('.svc__pic img');
  if (items.length) {
    var cur = -1;
    var act = function (k) {
      if (k === cur) return; cur = k;
      items.forEach(function (it) { it.classList.toggle('is-act', +it.getAttribute('data-k') === k); });
      pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-k') === k); });
    };
    onFrameScroll(function () {
      var mid = window.innerHeight * 0.55, best = 0, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(); var dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bd) { bd = dd; best = +it.getAttribute('data-k'); } });
      act(best);
    });
    items.forEach(function (it) { it.addEventListener('mouseenter', function () { act(+it.getAttribute('data-k')); }); });
  }

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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
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

  /* ---------- signature scene: costruiamo, rinnoviamo, interveniamo ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var caps = scene.querySelectorAll('.scene__caps li'), bar = scene.querySelector('.scene__bar');
  var last = -1;
  function setI(i) { if (i === last) return; last = i; caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); }
  function build() {
    var phone = window.innerWidth < 900;
    var struct = scene.querySelectorAll('.h-struct path');
    var fin = scene.querySelectorAll('.h-fin > *');
    var pipes = scene.querySelectorAll('.p-cold, .p-hot');
    var el = scene.querySelector('.p-el'), boiler = scene.querySelector('.boiler'), pulse = scene.querySelector('.h-pulse');
    gsap.set(scene.querySelectorAll('.scene__art, .scene__caps'), { opacity: 0, y: 30 });
    gsap.set(struct, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(fin, { opacity: 0 });
    gsap.set(pipes, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set([el, boiler, pulse], { opacity: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { invalidateOnRefresh: true,
        trigger: scene, start: 'top top', end: phone ? '+=150%' : '+=240%', pin: scene.querySelector('.scene__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) { var p = st.progress; setI(p < 0.38 ? 0 : p < 0.68 ? 1 : 2); bar.style.setProperty('--p', p.toFixed(3)); },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(scene.querySelectorAll('.scene__art, .scene__caps'), { opacity: 1, y: 0, duration: .4, stagger: .06, ease: 'power2.out' }, 0)
      .to(struct, { strokeDashoffset: 0, duration: 2.2, stagger: .25 }, .3)
      .to(fin, { opacity: 1, duration: .5, stagger: .12 }, 3.4)
      .to(pipes, { strokeDashoffset: 0, duration: 1.6, stagger: .2 }, 5.6)
      .to(boiler, { opacity: 1, duration: .3 }, 5.8)
      .to(el, { opacity: 1, duration: .6 }, 6.4)
      .to(pulse, { opacity: 1, duration: .3 }, 7.3)
      .to({}, { duration: .7 });
  }
  var started = false;
  function start() {
    if (started) return; started = true; build(); ScrollTrigger.refresh();
    if ('ResizeObserver' in window) { var rt, lh = d.body.offsetHeight; new ResizeObserver(function () { var h = d.body.offsetHeight; if (Math.abs(h - lh) < 2) return; lh = h; clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); lh = d.body.offsetHeight; }, 200); }).observe(d.body); }
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
