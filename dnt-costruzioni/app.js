/* DNT Costruzioni: hero entrance (name and headline rise, photo strip slides in from the right and drifts on scroll),
   header, full-screen phone menu, anchors, reveals, service photo follows the active row, drag strip, method line,
   magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a ceiling section built layer by layer with scroll (slab, hangers, insulation, metal frame, boards, skim and paint, light on). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  var mbar = d.querySelector('.mbar');
  var hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero strip drifts left as you scroll */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) strip.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: hover or the row nearest the middle of the screen picks the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(item) {
    var k = item.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt || window.innerWidth < 961) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best);
      });
    }, { passive: true });
  }

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, s0 = 0;
    s.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; s0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = s0 - (e.pageX - x0); });
  });

  /* method line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
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
    ceilingScene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ceilingScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var slab = q('.c-slab'), hang = qa('.c-hang line'), wool = q('.c-wool'), main = q('.c-main'), studs = qa('.c-studs rect');
    var boards = qa('.c-boards rect'), skim = q('.c-skim'), paint = q('.c-paint'), light = q('.c-light'), room = q('.c-room');
    var roller = q('.c-roller'), edge = q('.c-edge');
    var cnt = q('[data-count]'), bar = q('[data-bar]'), steps = qa('.steps2 li');

    if (small) q('.ceil').setAttribute('viewBox', '20 20 620 590');
    gsap.set(slab, { autoAlpha: 0, y: -30 });
    gsap.set(hang, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(wool, { autoAlpha: 0, y: -40 });
    gsap.set(main, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(studs, { autoAlpha: 0, y: 10 });
    gsap.set(boards, { autoAlpha: 0, y: 60 });
    gsap.set([skim, paint], { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(light, { autoAlpha: 0 });
    gsap.set(edge, { autoAlpha: 0 });
    gsap.set(roller, { autoAlpha: 0, x: 40 });
    gsap.set(room, { autoAlpha: .35 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .2, 1.2, 2.2, 3.2, 4.4, 5.6];
    tl.to(slab, { autoAlpha: 1, y: 0, duration: .7 }, at[1])
      .to(hang, { scaleY: 1, duration: .6, stagger: .08, ease: 'power1.inOut' }, at[2])
      .to(wool, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, at[3])
      .to(main, { scaleX: 1, duration: .6, ease: 'power1.inOut' }, at[4])
      .to(studs, { autoAlpha: 1, y: 0, duration: .25, stagger: .05 }, at[4] + .4)
      .to(boards, { autoAlpha: 1, y: 0, duration: .5, stagger: .22, ease: 'power3.out' }, at[5])
      .to(skim, { scaleX: 1, duration: .5, ease: 'none' }, at[6])
      .to(roller, { autoAlpha: 1, duration: .15 }, at[6] + .2)
      .to(paint, { scaleX: 1, duration: .9, ease: 'none' }, at[6] + .3)
      .to(roller, { x: small ? 620 : 960, duration: .9, ease: 'none' }, at[6] + .3)
      .to(roller, { autoAlpha: 0, duration: .15 }, at[6] + 1.2)
      .to(edge, { autoAlpha: 1, duration: .3 }, at[6] + 1.2)
      .to(light, { autoAlpha: 1, duration: .5 }, 6.8)
      .to(room, { autoAlpha: 1, duration: .5 }, 6.8)
      .to(bar, { scaleX: 1, duration: 7.3, ease: 'none' }, 0)
      .to({}, { duration: .4 }, 7.3);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s === last) return;
      last = s;
      cnt.textContent = '0' + s;
      steps.forEach(function (li) {
        var n = +li.getAttribute('data-step');
        li.classList.toggle('is-on', n === s || (s === 0 && n === 1));
        li.classList.toggle('is-done', n < s);
      });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
