/* È Casa Parma: hero entrance (photo wipe, line reveal), header, full-screen menu, anchors, reveals, accordion,
   property cards preselect the form, steps line, review drag strip, magnetic buttons, phone bar, form validation,
   and the GSAP signature scene: the word CASA cut out of the page; scroll flies through the S into a living room. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.getElementById('header'), bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * .85);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick');
      if (pick) { var r = d.querySelector('input[name="intent"][value="' + pick + '"]'); if (r) r.checked = true; }
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* accordion (one open at a time) */
  var accs = d.querySelectorAll('.acc__it');
  accs.forEach(function (it) {
    var b = it.querySelector('.acc__btn');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* steps line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * .8 - r.top) / (r.height + vh * .1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + .02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* drag strip (mouse) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Serve un numero per richiamarti.', email: 'Controlla l\'indirizzo email.', message: 'Scrivi due righe su cosa cerchi.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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
    maskScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function maskScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stage = sec.querySelector('.scene__stage'), svg = sec.querySelector('.scene__mask'), word = sec.querySelector('.m-word');
    var photo = sec.querySelector('.scene__photo img'), top = sec.querySelector('.scene__top'), end = sec.querySelector('.scene__end');
    var origin = { x: 0, y: 0 };

    /* lay the word out in pixels and find a point inside the middle stroke of the S */
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var fs = Math.min(W * (W < 700 ? .34 : .3), H * .42);
      var font = '700 ' + fs + 'px Arvo, Georgia, serif';
      var c = d.createElement('canvas'); c.width = W; c.height = H;
      var ctx = c.getContext('2d'); ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      var m = ctx.measureText('CASA'), asc = m.actualBoundingBoxAscent, des = m.actualBoundingBoxDescent;
      var x0 = (W - m.width) / 2, base = H / 2 + (asc - des) / 2;
      word.setAttribute('x', x0); word.setAttribute('y', base);
      word.setAttribute('text-anchor', 'start'); word.removeAttribute('dominant-baseline');
      word.setAttribute('font-size', fs);
      ctx.fillText('CASA', x0, base);
      var sx = Math.round(x0 + ctx.measureText('CA').width + ctx.measureText('S').width / 2);
      var y1 = Math.max(0, Math.floor(base - asc)), y2 = Math.min(H - 1, Math.ceil(base + des));
      var col = ctx.getImageData(sx, y1, 1, y2 - y1 + 1).data, runs = [], inR = false, rs = 0;
      for (var i = 0; i < col.length / 4; i++) {
        var on = col[i * 4 + 3] > 140;
        if (on && !inR) { inR = true; rs = i; }
        if (!on && inR) { inR = false; runs.push([rs, i - 1]); }
      }
      if (inR) runs.push([rs, col.length / 4 - 1]);
      var mid = (y2 - y1) / 2, best = runs[0] || [mid, mid];
      runs.forEach(function (r) { if (Math.abs((r[0] + r[1]) / 2 - mid) < Math.abs((best[0] + best[1]) / 2 - mid)) best = r; });
      origin.x = sx; origin.y = y1 + (best[0] + best[1]) / 2;
      svg.style.transformOrigin = origin.x + 'px ' + origin.y + 'px';
    }
    layout();

    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 699px)', big: '(min-width: 700px)' }, function (ctx) {
      var small = ctx.conditions.small;
      gsap.set(svg, { scale: 1, autoAlpha: 1 });
      gsap.set(photo, { scale: 1.3, transformOrigin: '50% 50%' });
      gsap.set(top, { autoAlpha: 1, y: 0 });
      gsap.set(end, { autoAlpha: 0, y: 40 });
      var tl = gsap.timeline();
      tl.to(top, { autoAlpha: 0, y: -30, duration: .25, ease: 'power1.in' }, .05)
        .to(svg, { scale: 24, duration: 1, ease: 'power2.in' }, .1)
        .to(photo, { scale: 1, duration: 1.1, ease: 'power1.out' }, .1)
        .to(svg, { autoAlpha: 0, duration: .15 }, .98)
        .to(end, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, 1.15)
        .to({}, { duration: .25 });
      var st = ScrollTrigger.create({
        trigger: stage, start: 'top top', end: small ? '+=130%' : '+=200%',
        pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
        onRefreshInit: layout,
        onToggle: function (self) { html.classList.toggle('in-scene', self.isActive); }
      });
      return function () { st.kill(); tl.kill(); };
    });
  }
})();
