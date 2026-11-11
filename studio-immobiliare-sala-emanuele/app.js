/* Studio Immobiliare Sala Emanuele: curtain hero, header, full-screen phone menu, anchors, reveals, Vendo/Compro switch,
   count-up, parallax, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a door in an arched doorway turns its handle and swings open, then the room behind it opens out to fill the screen
   while the four steps of working with the studio light up one by one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.getElementById('header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 899 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick');
      if (pick) { var sel = d.getElementById('f-int'); if (sel) sel.value = pick; }
      setTimeout(function () {
        window.scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
      }, menu.classList.contains('is-open') ? 50 : 0);
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (sourced numbers only: the Google score and review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  });

  /* Vendo / Compro switch */
  var sw = d.querySelector('.switch');
  if (sw) {
    var tabs = sw.querySelectorAll('[role=tab]'), pics = d.querySelectorAll('[data-pic]'), cap = d.querySelector('[data-cap]');
    var setTab = function (k) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('aria-controls') === 'pan-' + k;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var pan = d.getElementById(t.getAttribute('aria-controls'));
        pan.hidden = !on;
        pan.classList.toggle('is-anim', on && !reduce);
      });
      sw.classList.toggle('is-c', k === 'c');
      pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
      if (cap) cap.textContent = k === 'c' ? 'Per chi compra' : 'Per chi vende';
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('aria-controls').slice(4)); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var k = t.getAttribute('aria-controls') === 'pan-v' ? 'c' : 'v'; setTab(k); sw.querySelector('[aria-controls="pan-' + k + '"]').focus(); }
      });
    });
  }

  /* parallax on the plain photo */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var doPar = function () {
      pt = false;
      var r = par.parentElement.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + (-p * 16).toFixed(2) + '%,0)';
    };
    window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(doPar); } }, { passive: true });
    doPar();
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa vi serve.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
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
    doorScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function doorScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stage = sec.querySelector('.scene__stage'), room = sec.querySelector('[data-room]'), img = room.querySelector('img');
    var frame = sec.querySelector('[data-frame]'), wrap = sec.querySelector('[data-doorwrap]'), door = sec.querySelector('[data-door]');
    var knob = sec.querySelector('[data-knob]'), copy = sec.querySelector('.scene__copy'), end = sec.querySelector('[data-end]');
    var steps = sec.querySelectorAll('[data-step]'), bar = sec.querySelector('[data-bar]');
    var R = {};

    /* the doorway: left half on desktop, centred above the caption card on phones */
    function measure() {
      var W = stage.clientWidth, H = stage.clientHeight, small = W < 900;
      var w, h, l, t;
      if (small) {
        var cardH = copy.offsetHeight + 28;
        h = Math.min(H - cardH - 92, W * 1.25);
        w = Math.round(h * 0.5);
        l = Math.round((W - w) / 2);
        t = Math.round(H - cardH - h - 10);
      } else {
        h = Math.round(H * 0.76);
        w = Math.round(h * 0.5);
        var cr = copy.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        var x0 = cr.right - sr.left, free = W - x0;
        l = Math.round(x0 + Math.max(40, (free - w) / 2));
        t = Math.round(H * 0.15);
      }
      R = { W: W, H: H, w: w, h: h, l: l, t: t, r: W - l - w, b: H - t - h, rad: Math.round(w / 2) };
      [frame, wrap].forEach(function (el) { el.style.left = l + 'px'; el.style.top = t + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px'; });
    }
    function clipStart() { return 'inset(' + R.t + 'px ' + R.r + 'px ' + R.b + 'px ' + R.l + 'px round ' + R.rad + 'px ' + R.rad + 'px 0px 0px)'; }
    measure();

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var stepAt = [0, 0.4, 2.9, 5.2, 7.4];
    gsap.set(room, { clipPath: clipStart });
    tl.fromTo(frame, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .5 }, 0)
      .fromTo(wrap, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .5 }, 0.05)
      .fromTo(room, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 }, 0.5)
      .fromTo(copy, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .5 }, 0.1)
      .to(knob, { rotate: -38, duration: .5, ease: 'power1.inOut' }, 1.2)
      .to(knob, { rotate: 0, duration: .3 }, 2.6)
      .fromTo(door, { rotateY: 0 }, { rotateY: -108, duration: 2.6, ease: 'power2.inOut' }, 1.6)
      .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 6, ease: 'none' }, 2)
      .to(wrap, { autoAlpha: 0, duration: .4 }, 4.6)
      .fromTo(room, { clipPath: clipStart }, { clipPath: 'inset(0px 0px 0px 0px round 0px 0px 0px 0px)', duration: 2.8, ease: 'power2.inOut', immediateRender: false }, 4.6)
      .to(frame, { autoAlpha: 0, scale: 1.6, duration: 1.6, ease: 'power2.in' }, 4.6)
      .fromTo(end, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .5 }, 8.1)
      .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 8.6, ease: 'none' }, 0.1)
      .to({}, { duration: .5 }, 8.7);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < stepAt.length; j++) if (t >= stepAt[j]) s = j;
      if (s !== last) { last = s; steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); }); }
    }
    tl.eventCallback('onUpdate', sync);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return R.W < 900 ? '+=160%' : '+=230%'; },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onRefreshInit: function () { tl.progress(0); measure(); }
    });
    sync();
  }
})();
