/* Deca Costruzioni e Ristrutturazioni: hero entrance, header, full-screen menu, anchors, reveals, service photo that
   follows the active item, work filter, count-up, process line, magnetic buttons, phone dock, form validation,
   and the GSAP signature scene: a section of a palazzina that draws itself, then the camera walks through
   roof, facade and balconies, one apartment and the ground-floor structure, each lit in red with a real review. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + dock */
  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight - 120);
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
  reveal(d.querySelectorAll('.r, .about__pic'), function (el) { el.classList.add('is-in'); });

  /* services: the photo follows the hovered item, or the item in the reading zone while scrolling */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it'), cap = d.querySelector('[data-cap]');
  var curPic = 'a';
  function showPic(item) {
    var k = item.getAttribute('data-for');
    if (k === curPic) return;
    curPic = k;
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
    if (cap) cap.textContent = item.querySelector('h3').textContent;
  }
  if (window.matchMedia('(hover: hover)').matches) items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it); }); });
  var lt = false;
  function pickItem() {
    lt = false;
    var small = window.innerWidth <= 1080;
    var line = small ? window.innerHeight * 0.66 : window.innerHeight * 0.5, best = null, bd = 1e9;
    items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - line); if (c < bd) { bd = c; best = it; } });
    if (best && bd < window.innerHeight * 0.3) showPic(best);
  }
  window.addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(pickItem); } }, { passive: true });

  /* work filter */
  var chips = d.querySelectorAll('.chip'), works = d.querySelectorAll('.idx__it');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      works.forEach(function (w) {
        var show = f === 'all' || w.getAttribute('data-k') === f;
        w.classList.toggle('is-off', !show);
        if (show && !reduce) { w.classList.remove('is-in'); void w.offsetWidth; w.classList.add('is-in'); }
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* count-up (sourced numbers only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height * 0.9)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
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
    mm.add('(min-width: 1081px)', function () { return sectionScene(false); });
    mm.add('(max-width: 1080px)', function () { return sectionScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function sectionScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var svg = sec.querySelector('.sec'), bar = sec.querySelector('[data-bar]');
    var cards = q('.card'), steps = q('.scene__steps li');
    var draws = Array.prototype.slice.call(q('.d path, .d line'));
    var rects = q('.d rect');
    var zones = [null], marks = [null];
    for (var i = 1; i <= 4; i++) { zones.push(sec.querySelector('.z[data-z="' + i + '"]')); marks.push(sec.querySelector('.mk[data-m="' + i + '"]')); }
    /* camera focus points in drawing units (viewBox 40 96 770 740), and zoom */
    var focus = small
      ? [null, [400, 214, 1.9], [690, 500, 2.1], [400, 520, 1.75], [400, 704, 1.75]]
      : [null, [400, 214, 1.7], [680, 500, 1.9], [400, 520, 1.6], [400, 704, 1.6]];
    function cam(f) { var fx = (f[0] - 40) / 770, fy = (f[1] - 96) / 740; return { scale: f[2], xPercent: -(fx - .5) * 100 * f[2], yPercent: -(fy - .5) * 100 * f[2] }; }

    draws.forEach(function (p) {
      var L = p.getTotalLength ? p.getTotalLength() : 1000;
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });
    gsap.set(rects, { autoAlpha: 0 });
    gsap.set(zones.slice(1), { autoAlpha: 0 });
    gsap.set(marks.slice(1), { autoAlpha: 0, scale: .3, transformOrigin: '50% 50%' });
    gsap.set(svg, { scale: 1, xPercent: 0, yPercent: 0, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to(draws, { strokeDashoffset: 0, duration: 1.2, ease: 'none', stagger: { each: 0.8 / draws.length } }, 0)
      .to(rects, { autoAlpha: 1, duration: .5, stagger: { each: .6 / rects.length } }, .4);
    var at = [0], T = 1.8, SEG = 1.9;
    for (var z = 1; z <= 4; z++) {
      var t0 = T + (z - 1) * SEG;
      at[z] = t0 + .35;
      tl.to(svg, Object.assign({ duration: .8 }, cam(focus[z])), t0)
        .to(zones[z], { autoAlpha: 1, duration: .45, ease: 'power1.out' }, t0 + .45)
        .to(marks[z], { autoAlpha: 1, scale: 1, duration: .4, ease: 'back.out(2)' }, t0 + .5);
    }
    var tEnd = T + 4 * SEG;
    tl.to(svg, { scale: 1, xPercent: 0, yPercent: 0, duration: .9 }, tEnd)
      .to({}, { duration: .5 }, tEnd + .9)
      .to(bar, { scaleX: 1, duration: tEnd + 1.4, ease: 'none' }, 0);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var k = 1; k < at.length; k++) if (t >= at[k]) s = k;
      if (s === last) return;
      last = s;
      cards.forEach(function (c) {
        var on = +c.getAttribute('data-card') === s;
        gsap.to(c, { autoAlpha: on ? 1 : 0, y: on ? 0 : (+c.getAttribute('data-card') < s ? -16 : 16), duration: .35, overwrite: true });
      });
      steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
    }
    cards.forEach(function (c) { gsap.set(c, { autoAlpha: +c.getAttribute('data-card') === 0 ? 1 : 0 }); });
    tl.eventCallback('onUpdate', sync);

    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=190%' : '+=300%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([svg, bar].concat(draws, Array.prototype.slice.call(rects), zones.slice(1), marks.slice(1), Array.prototype.slice.call(cards)), { clearProps: 'all' });
    };
  }
})();
