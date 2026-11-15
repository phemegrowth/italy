/* Venturini Immobiliare: hero arch reveal + rating count-up, header, menu, anchors, reveals, accordion,
   steps line, phone bar, form validation, and the GSAP signature scene: the route from Via Pomba to the Sardinian coast. */
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

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
    html.classList.toggle('is-menu', open);
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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


  /* rating count-up: 0,0 to 4,6 (Google rating, sourced) */
  reveal(d.querySelectorAll('[data-rate]'), function (el) {
    var end = parseFloat(el.getAttribute('data-rate'));
    var fmt = function (v) { return v.toFixed(1).replace('.', ','); };
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = null;
    el.textContent = fmt(0);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 300);
  });

  /* accordion: one open at a time, height animated */
  var accs = d.querySelectorAll('.acc__it');
  accs.forEach(function (it) {
    var sum = it.querySelector('summary'), body = it.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (it.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' }).onfinish = function () { it.open = false; };
      } else {
        accs.forEach(function (o) { if (o !== it && o.open) o.open = false; });
        it.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'ease' });
      }
    });
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

  /* process line draws with scroll */
  var steps = d.querySelector('[data-how]');
  if (steps && !reduce) {
    var lt = false;
    var drawLine = function () {
      lt = false;
      var r = steps.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      steps.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(drawLine); } }, { passive: true });
    drawLine();
  }

  /* phone contact bar: after the hero, hidden in the scene pin and near the form */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1000px)', function () { scene(false); });
    mm.add('(max-width: 999px)', function () { scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    var q = function (s) { return sec.querySelector(s); };
    var shapes = sec.querySelectorAll('.m-sard, .m-isl, .m-coast');
    var routes = [q('.r1'), q('.r2'), q('.r3'), q('.r4')];
    var pins = [q('.p1'), q('.p2'), q('.p3'), q('.p4'), q('.p5')];
    var stops = sec.querySelectorAll('.stop'), cnt = q('[data-scount]');
    var copy = sec.querySelectorAll('.eyebrow, .h2');
    function dash(el) { var L = el.getTotalLength(); gsap.set(el, { strokeDasharray: L, strokeDashoffset: L }); return L; }
    shapes.forEach(dash);
    routes.forEach(dash);
    gsap.set(q('.m-land'), { autoAlpha: 0 });
    gsap.set(q('.m-sard'), { fillOpacity: 0 });
    gsap.set(q('.m-isl'), { fillOpacity: 0 });
    gsap.set(pins, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set(sec.querySelectorAll('.m-sea-t'), { autoAlpha: 0 });
    gsap.set(copy, { autoAlpha: 0, y: 20 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0];
    tl.to(copy, { autoAlpha: 1, y: 0, duration: .4, stagger: .08 }, 0)
      .to(shapes, { strokeDashoffset: 0, duration: 1.1, stagger: .12, ease: 'power1.inOut' }, 0)
      .to(q('.m-land'), { autoAlpha: 1, duration: .6 }, .6)
      .to([q('.m-sard'), q('.m-isl')], { fillOpacity: 1, duration: .6 }, .8)
      .to(sec.querySelectorAll('.m-sea-t'), { autoAlpha: 1, duration: .4 }, 1)
      .to(pins[0], { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(3)' }, .9);
    at[1] = 1.5; tl.to(routes[0], { strokeDashoffset: 0, duration: .5 }, 1.5).to(pins[1], { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(3)' }, 1.8);
    at[2] = 2.5; tl.to(routes[1], { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' }, 2.5).to(pins[2], { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(3)' }, 3.5);
    at[3] = 4.1; tl.to(routes[2], { strokeDashoffset: 0, duration: .5 }, 4.1).to(pins[3], { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(3)' }, 4.5);
    at[4] = 5.1; tl.to(routes[3], { strokeDashoffset: 0, duration: .7 }, 5.1).to(pins[4], { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(3)' }, 5.7)
      .to({}, { duration: .6 });
    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 0; k < at.length; k++) if (t >= at[k]) s = k;
      if (s === last) return; last = s;
      cnt.textContent = '0' + (s + 1);
      stops.forEach(function (li, k) { li.classList.toggle('is-on', k === s); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
  }
})();
