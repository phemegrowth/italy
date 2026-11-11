/* L'Angolo Immobiliare: type-first hero (the name fills the width, the corner from the logo draws, a reel of photos
   slides in from the right and drifts with scroll), header, circular phone menu, anchors, reveals, magnetic buttons,
   phone contact bar, form validation, and the GSAP signature scene: the word CASA cut out of the page with Bergamo
   behind it; the scroll flies through a letter stroke until the city fills the screen, then the card rises. */
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

  /* count-up (none on this page; kept for [data-count]) */
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

  /* hero reel: after its entrance it drifts left as the page scrolls */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false, armed = false;
    setTimeout(function () { armed = true; }, 1800);
    window.addEventListener('scroll', function () {
      if (rt || !armed) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        reel.classList.add('is-drift');
        if (y < window.innerHeight * 1.6) reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
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
    maskScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function maskScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var NS = 'http://www.w3.org/2000/svg';
    var stage = sec.querySelector('[data-stage]'), svg = sec.querySelector('[data-svg]'), words = sec.querySelector('[data-words]');
    var mrect = sec.querySelector('[data-mrect]'), cover = sec.querySelector('[data-cover]'), mg = sec.querySelector('[data-mg]');
    var zoom = { s: 1 };
    function applyZoom() {
      var s = zoom.s, ox = origin.x, oy = origin.y;
      mg.setAttribute('transform', 'translate(' + (ox - ox * s).toFixed(2) + ' ' + (oy - oy * s).toFixed(2) + ') scale(' + s.toFixed(4) + ')');
    }
    var photo = sec.querySelector('[data-photo] img'), intro = sec.querySelector('[data-intro]'), card = sec.querySelector('[data-card]');
    var FONT = '"Montserrat Alternates"', origin = { x: 0, y: 0 };

    /* lay out CASA (one line on wide screens, CA / SA on phones) and find a point inside the first letter's stroke */
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, small = W < 700;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      [mrect, cover].forEach(function (r) { r.setAttribute('width', W); r.setAttribute('height', H); });
      mrect.setAttribute('x', -W); mrect.setAttribute('y', -H); mrect.setAttribute('width', W * 3); mrect.setAttribute('height', H * 3);
      while (words.firstChild) words.removeChild(words.firstChild);
      var lines = small ? ['CA', 'SA'] : ['CASA'];
      var cv = d.createElement('canvas'), cx = cv.getContext('2d');
      var fs = small ? Math.min(W * .5, H * .26) : Math.min(W * .27, H * .42);
      cx.font = '800 ' + fs + 'px ' + FONT;
      var lh = fs * .86, total = lh * lines.length, top = (H - total) / 2 + fs * .06 + (small ? H * .03 : H * .04);
      lines.forEach(function (s, i) {
        var t = d.createElementNS(NS, 'text');
        t.setAttribute('x', W / 2); t.setAttribute('y', top + lh * (i + 1) - fs * .14);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('style', 'font: 800 ' + fs + 'px ' + FONT + '; letter-spacing: -0.02em');
        t.textContent = s; words.appendChild(t);
      });
      /* scan the first glyph on a canvas, at mid cap height, for the first run of ink */
      var s0 = lines[0], w0 = cx.measureText(s0).width * (1 - .02 * s0.length / s0.length), base = Math.ceil(fs * 1.1);
      cv.width = Math.ceil(cx.measureText(s0).width) + 20; cv.height = base + 10;
      cx.font = '800 ' + fs + 'px ' + FONT; cx.fillStyle = '#000'; cx.textBaseline = 'alphabetic';
      cx.fillText(s0, 10, base);
      var row = Math.round(base - fs * .36), data = cx.getImageData(0, row, cv.width, 1).data, a = -1, b = -1;
      for (var x = 0; x < cv.width; x++) { var on = data[x * 4 + 3] > 128; if (on && a < 0) a = x; if (!on && a >= 0) { b = x; break; } }
      if (a < 0) { a = 10; b = 10 + fs * .1; }
      var startX = W / 2 - w0 / 2;
      origin.x = startX + ((a + b) / 2 - 10) * .98;
      origin.y = top + lh - fs * .14 - fs * .36;
      applyZoom();
    }
    layout();

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(zoom, { s: 1 }, { s: 30, duration: 5, ease: 'power3.in', onUpdate: applyZoom }, 1)
      .fromTo(photo, { scale: 1.25 }, { scale: 1, duration: 6.4, ease: 'power1.out' }, 0)
      .fromTo(intro, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: .7 }, 1.1)
      .to(svg, { autoAlpha: 0, duration: .5 }, 5.6)
      .fromTo(card, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' }, 6.1)
      .to({}, { duration: .9 }, 7.1);
    gsap.set(card, { autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return window.innerWidth < 900 ? '+=140%' : '+=200%'; },
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onRefreshInit: function () { tl.progress(0); layout(); }
    });
  }
})();
