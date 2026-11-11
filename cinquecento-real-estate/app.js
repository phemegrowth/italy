/* Cinquecento Real Estate: hero cards start stacked in the centre and fan out into a collage (then drift
   at different speeds on scroll), line-by-line headline, header, phone menu, anchors, reveals, accordion,
   count-up, process line, magnetic buttons, phone contact bar, form, and the GSAP signature scene:
   the word COMO is cut out of the page with Lake Como behind it; the scroll flies through a stroke of the M
   until the lake fills the screen, then a card rises. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero fan */
  var fan = d.querySelector('[data-fan]');
  var cards = fan ? Array.prototype.slice.call(fan.querySelectorAll('.card')) : [];
  var fanned = reduce;
  if (fan && !reduce) {
    var fr = fan.getBoundingClientRect(), cx = fr.width / 2, cy = fr.height * 0.42;
    var angles = [-8, 5, -3, 9, -6];
    cards.forEach(function (c, i) {
      var x = c.offsetLeft + c.offsetWidth / 2, y = c.offsetTop + c.offsetHeight / 2;
      c.classList.add('is-stacked');
      c.style.transform = 'translate(' + (cx - x).toFixed(1) + 'px,' + (cy - y + 30).toFixed(1) + 'px) rotate(' + angles[i] + 'deg) scale(.86)';
    });
    fan.offsetWidth; /* reflow */
    setTimeout(function () {
      cards.forEach(function (c, i) {
        c.classList.remove('is-stacked');
        c.classList.add('is-fanned');
        c.style.transitionDelay = (i * 70) + 'ms';
        c.style.transform = '';
      });
      setTimeout(function () {
        cards.forEach(function (c) { c.classList.remove('is-fanned'); c.style.transitionDelay = ''; });
        fanned = true; drift();
      }, 1700);
    }, 260);
  }
  var speeds = [0.10, 0.20, 0.06, 0.16, 0.24];
  function drift() {
    if (!fanned || reduce) return;
    var y = window.scrollY;
    if (y > window.innerHeight * 1.5) return;
    var k = window.innerWidth < 901 ? 0.45 : 1;
    cards.forEach(function (c, i) { c.style.transform = 'translate3d(0,' + (-y * speeds[i] * k).toFixed(1) + 'px,0) rotate(var(--r))'; });
  }

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; drift(); }); }
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
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('aria-disabled') === 'true') return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#zona' ? 0 : header.offsetHeight - 1);
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

  /* count-up (review count) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count'), dec = +(el.getAttribute('data-dec') || 0);
    var show = function (v) { el.textContent = dec ? v.toFixed(dec).replace('.', ',') : Math.round(v); };
    if (reduce) { show(to); return; }
    var t0 = null;
    var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); show(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa vi serve.' };
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

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    comoScene(window.innerWidth < 901);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function comoScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stage = sec.querySelector('.zona__stage'), svg = sec.querySelector('[data-mask]'), word = sec.querySelector('[data-word]');
    var img = sec.querySelector('.zona__img'), card = sec.querySelector('[data-card]'), kicker = sec.querySelector('[data-kicker]');
    var mask = svg.querySelector('mask'), rects = svg.querySelectorAll('rect');
    var W = stage.clientWidth, H = stage.clientHeight;
    /* svg in real pixels so the word keeps its shape */
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    mask.setAttribute('width', W); mask.setAttribute('height', H);
    rects.forEach(function (r) { r.setAttribute('width', W); r.setAttribute('height', H); });
    var fs = Math.min(W * (small ? 0.25 : 0.25), H * 0.42);
    word.setAttribute('x', W / 2); word.setAttribute('y', H / 2);
    word.setAttribute('font-size', fs.toFixed(0));

    /* find a point inside a stroke of the M: draw the word on a canvas and read the pixels on the middle row */
    var ox = W / 2, oy = H / 2;
    try {
      var cv = d.createElement('canvas'); cv.width = Math.ceil(W); cv.height = Math.ceil(H);
      var cx = cv.getContext('2d');
      cx.font = '700 ' + fs.toFixed(0) + 'px Cardo';
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';
      var bb = word.getBBox();
      cx.fillText('COMO', W / 2, H / 2);
      var row = Math.round(bb.y + bb.height * 0.55);
      var data = cx.getImageData(0, row, cv.width, 1).data, runs = [], inRun = false, s = 0;
      for (var x = 0; x < cv.width; x++) {
        var on = data[x * 4 + 3] > 128;
        if (on && !inRun) { inRun = true; s = x; }
        if (!on && inRun) { inRun = false; if (x - s > 3) runs.push([s, x]); }
      }
      /* runs: C, O left, O right, M stems..., O left, O right. Take the run nearest the word centre that is wide enough */
      var best = null, bd = 1e9;
      runs.forEach(function (r) { var c = (r[0] + r[1]) / 2, dd = Math.abs(c - W * 0.53); if (dd < bd && r[1] - r[0] > fs * 0.06) { bd = dd; best = r; } });
      if (best) { ox = (best[0] + best[1]) / 2; oy = row; }
    } catch (e) { /* keep the centre */ }

    gsap.set(svg, { transformOrigin: ox + 'px ' + oy + 'px', scale: 1 });
    gsap.set(img, { scale: 1.25 });
    gsap.set(card, { autoAlpha: 0, y: 60 });
    gsap.set(word, { autoAlpha: 0 });
    gsap.set(kicker, { autoAlpha: 0, y: 10 });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(word, { autoAlpha: 1, duration: .12, ease: 'power1.out' }, 0)
      .to(kicker, { autoAlpha: 1, y: 0, duration: .3, ease: 'power1.out' }, .05)
      .to(kicker, { autoAlpha: 0, duration: .2 }, .9)
      .to(svg, { scale: small ? 26 : 30, duration: 2.2, ease: 'power3.in' }, .6)
      .to(img, { scale: 1, duration: 2.4, ease: 'power1.out' }, .6)
      .to(svg, { autoAlpha: 0, duration: .25 }, 2.6)
      .to(card, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 2.8)
      .to({}, { duration: .5 }, 3.4);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: false
    });
  }
})();
