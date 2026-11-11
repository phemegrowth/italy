/* Promocasa: hero entrance (red curtain lifts off the photo, roof line draws, headline line reveal), header,
   full-screen menu, sticky phone bar, anchors, reveals, years count-up, listings drag strip, magnetic buttons, form,
   and the GSAP signature scene: a Torino portone in the logo blue; the key turns, light shows in the gap, the two
   leaves swing open in 3D and the room behind comes into focus while the four steps advance. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#porta' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* rAF scroll helper */
  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () {
      if (t) return; t = true;
      requestAnimationFrame(function () { t = false; fn(); });
    }, { passive: true });
    fn();
  }

  /* count-up of the years in business, when the number comes into view */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: .5 });
    io.observe(el);
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.05)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* drag strip for reviews (mouse only; touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons (desktop pointer only) */
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa vi serve.' };
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () { return doorScene(false); });
    mm.add('(max-width: 960px)', function () { return doorScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function doorScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var L = sec.querySelector('.leaf--l'), R = sec.querySelector('.leaf--r'), key = sec.querySelector('.key');
    var gap = sec.querySelector('.door__gap'), img = sec.querySelector('.door__in img'), msg = sec.querySelector('.door__msg');
    var steps = Array.prototype.slice.call(sec.querySelectorAll('.dsteps li')), bar = sec.querySelector('[data-dbar]');
    gsap.set([L, R], { rotationY: 0, '--sh': 0 });
    gsap.set(key, { rotation: 0 });
    gsap.set(gap, { opacity: 0, scaleY: .2 });
    gsap.set(img, { scale: 1.25, filter: 'brightness(.55)' });
    gsap.set(msg, { autoAlpha: 0, y: 14 });
    gsap.set(bar, { scaleX: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to(key, { rotation: 90, duration: .5 }, .2)
      .to(gap, { opacity: 1, scaleY: 1, duration: .5 }, .6)
      .to(L, { rotationY: 74, '--sh': .45, duration: 1.6 }, 1.1)
      .to(R, { rotationY: -74, '--sh': .45, duration: 1.6 }, 1.1)
      .to(gap, { opacity: 0, duration: .3 }, 1.2)
      .to(img, { scale: 1, filter: 'brightness(1)', duration: 2.1, ease: 'power1.out' }, 1.1)
      .to(msg, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, 3.1)
      .to(bar, { scaleX: 1, duration: 3.5, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 3.5);
    var at = [0, .9, 1.9, 2.8], last = -1;
    function sync() {
      var t = tl.time(), k = 0;
      for (var j = 0; j < at.length; j++) if (t >= at[j]) k = j;
      if (k === last) return;
      last = k;
      steps.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([L, R, key, gap, img, msg, bar], { clearProps: 'all' });
      steps.forEach(function (li) { li.classList.remove('is-on'); });
    };
  }
})();
