/* Edi.cos, Torino: hero drawing entrance (grid, frame, photo, headline lines), header, full-screen phone menu,
   anchors, reveals, services photo follows the active item, drag strip, count-up, client-quote line, phone bar, form,
   and the GSAP signature scene: an apartment plan renovated with scroll (survey, demolition, walls and services,
   herringbone floors and bathroom tiles, furniture and handover), with a progress meter and the step list. */
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

  /* services: hover, or the item nearest the middle of the screen, picks the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * (window.innerWidth < 961 ? 0.6 : 0.5), best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

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

  /* client-quote line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.why__it');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Scrivete un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Raccontateci in due righe il lavoro.' };
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
    planScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function planScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var draws = q('.p-walls .p-draw, .p-new .p-draw, .p-water .p-draw');
    draws.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var outer = q('.p-walls .p-draw'), news = q('.p-new .p-draw'), water = q('.p-water .p-draw');
    var elec = q('.p-elec path'), nodes = q('.p-node'), old = sec.querySelector('.p-old'), xs = q('.p-x path');
    var win = q('.p-win, .p-doors'), furn = q('.p-furn > *'), labs = q('.p-labels text'), dots = sec.querySelector('.p-dots');
    var wipe = sec.querySelector('.p-wipe'), twipe = sec.querySelector('.p-twipe');
    var pct = sec.querySelector('[data-pct]'), bar = sec.querySelector('[data-bar]'), steps = q('.steps2 li');

    gsap.set(dots, { autoAlpha: 0 });
    gsap.set(win, { autoAlpha: 0 });
    gsap.set(old, { autoAlpha: 0 });
    gsap.set(xs, { autoAlpha: 0, scale: .3, transformOrigin: '50% 50%' });
    gsap.set(elec, { autoAlpha: 0 });
    gsap.set(nodes, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    gsap.set(wipe, { attr: { height: 0 } });
    gsap.set(twipe, { attr: { height: 0 } });
    gsap.set(furn, { autoAlpha: 0, y: 8 });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var stepAt = [0, 2.1, 3.4, 5.6, 7.6];
    tl.to(dots, { autoAlpha: 1, duration: .4 }, 0)
      .to(outer, { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut' }, .1)
      .to(win, { autoAlpha: 1, duration: .4 }, 1.2)
      .to(old, { autoAlpha: 1, duration: .4 }, 1.3)
      .to(xs, { autoAlpha: 1, scale: 1, duration: .3, stagger: .12 }, 2.1)
      .to(old, { autoAlpha: 0, duration: .7, ease: 'power1.in' }, 2.8)
      .to(news, { strokeDashoffset: 0, duration: 1, stagger: .2, ease: 'power1.inOut' }, 3.4)
      .to(elec, { autoAlpha: 1, duration: .6 }, 4.1)
      .to(nodes, { autoAlpha: 1, scale: 1, duration: .3, stagger: .08, ease: 'back.out(2)' }, 4.4)
      .to(water, { strokeDashoffset: 0, duration: .8 }, 4.6)
      .to(wipe, { attr: { height: 540 }, duration: 1.6, ease: 'power1.inOut' }, 5.6)
      .to(twipe, { attr: { height: 200 }, duration: .9, ease: 'power1.inOut' }, 6.3)
      .to(q('.p-elec, .p-water'), { autoAlpha: 0, duration: .6 }, 6.8)
      .to(furn, { autoAlpha: 1, y: 0, duration: .4, stagger: .05 }, 7.6)
      .to(labs, { autoAlpha: 1, duration: .4, stagger: .1 }, 8.3)
      .to(bar, { scaleX: 1, duration: 9.2, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.2);

    var lastS = -1, lastP = -1;
    function sync() {
      var t = tl.time(), s = 1;
      for (var j = 0; j < stepAt.length; j++) if (t >= stepAt[j]) s = j + 1;
      var p = Math.min(100, Math.round(t / 9.2 * 100));
      if (p !== lastP) { lastP = p; pct.textContent = p + '%'; }
      if (s !== lastS) { lastS = s; steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); }); }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
