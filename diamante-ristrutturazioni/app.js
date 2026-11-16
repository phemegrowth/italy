/* Diamante Ristrutturazioni: fanned photo cards hero, header, menu, anchors, reveals, service rows with a cursor photo,
   magnetic buttons, phone bar, form, and the GSAP scene: before/after revealed through a growing diamond. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 2);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  d.querySelectorAll('.h2, .lead, .row, .studio__q, .contact__list, .form').forEach(function (el) {
    if (!el.closest('.scene') && !el.closest('.hero')) el.classList.add('r');
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* service rows: a photo follows the cursor (desktop only) */
  var cp = d.querySelector('.cursor-pic');
  if (cp && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var cpi = cp.querySelector('img'), mx = 0, my = 0, cx = 0, cy = 0, run = false;
    var loop = function () { cx += (mx - cx) * .18; cy += (my - cy) * .18; cp.style.left = cx + 'px'; cp.style.top = cy + 'px'; if (run) requestAnimationFrame(loop); };
    d.querySelectorAll('.row').forEach(function (r) {
      r.addEventListener('mouseenter', function (e) { cpi.src = r.getAttribute('data-img'); cx = mx = e.clientX; cy = my = e.clientY; cp.classList.add('is-on'); cp.style.transform = 'translate(-50%,-50%) scale(1)'; if (!run) { run = true; loop(); } });
      r.addEventListener('mousemove', function (e) { mx = e.clientX + 40; my = e.clientY; });
      r.addEventListener('mouseleave', function () { cp.classList.remove('is-on'); cp.style.transform = ''; run = false; });
    });
  }

  /* hero cards drift a little with the pointer (desktop) */
  var fan = d.querySelector('.hero__fan');
  if (fan && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var cards = fan.querySelectorAll('.fc'), rot = [-5, 2, 3, -3];
    setTimeout(function () {
      fan.classList.add('is-drift');
      d.querySelector('.hero').addEventListener('mousemove', function (e) {
        var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
        cards.forEach(function (c, i) { var k = (i + 1) * 6; c.style.transform = 'translate(' + (x * k).toFixed(1) + 'px,' + (y * k).toFixed(1) + 'px) rotate(' + rot[i] + 'deg)'; });
      });
    }, 1600);
  }

  /* magnetic buttons (desktop only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Due righe su cosa cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP scene: before/after through a growing diamond */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    gemScene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function gemScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var after = sec.querySelector('[data-after]'), gem = sec.querySelector('[data-gem]'), caps = sec.querySelectorAll('[data-cap]');
    var stage = sec.querySelector('.stage'), tags = sec.querySelectorAll('.stage__tag');
    var st = { r: 0 };
    function draw() {
      var r = st.r, a = (50 - r) + '%', b = (50 + r) + '%';
      after.style.clipPath = 'polygon(50% ' + a + ', ' + b + ' 50%, 50% ' + b + ', ' + a + ' 50%)';
      gem.setAttribute('d', 'M50 ' + (50 - r) + ' L' + (50 + r) + ' 50 L50 ' + (50 + r) + ' L' + (50 - r) + ' 50 Z');
    }
    draw();
    gsap.set(stage, { scale: .92, autoAlpha: 0 });
    gsap.set(tags[1], { autoAlpha: 0 });
    var tl = gsap.timeline();
    tl.to(stage, { scale: 1, autoAlpha: 1, duration: .5, ease: 'power2.out' }, 0)
      .to(st, { r: 22, duration: .9, ease: 'none', onUpdate: draw }, .6)
      .to(tags[1], { autoAlpha: 1, duration: .2 }, .8)
      .to(st, { r: 100, duration: 1.4, ease: 'power1.in', onUpdate: draw }, 1.6)
      .to(gem, { autoAlpha: 0, duration: .3 }, 2.8)
      .to(tags[0], { autoAlpha: 0, duration: .2 }, 2.7)
      .to({}, { duration: .5 });
    var marks = [0, 1.2, 2.4], last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0;
      for (var k = 0; k < marks.length; k++) if (t >= marks[k]) s = k;
      if (s === last) return; last = s;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === s); });
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
  }
})();
