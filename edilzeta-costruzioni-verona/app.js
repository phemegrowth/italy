/* Edilzeta Costruzioni Verona: hero entrance (grid and frame draw in, photo fades in the frame, headline lines rise),
   header, full-screen phone menu, anchors, reveals, service photo follows the active item, drag strip with progress,
   process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a facade wall gets its thermal coat layer by layer while the heat-loss arrows shrink. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var mbar = d.querySelector('.mbar');
  var hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 56);
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* services: the item nearest the middle of the screen (or hovered) is active, the photo follows */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function act(item) {
    var k = item.getAttribute('data-for');
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { act(it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.3) act(best);
    });
  }, { passive: true });

  /* drag strip with progress */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    var prog = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      if (sbar) sbar.style.setProperty('--sp', Math.max(.12, max > 0 ? (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth : 1).toFixed(3));
    };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      strip.scrollLeft = sl - (e.clientX - sx);
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { wallScene(false); });
    mm.add('(max-width: 699px)', function () { wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var layers = q('.w-layer'), labs = q('.w-lab'), arrows = q('.w-arrow'), steps = q('.layers li');
    var bar = sec.querySelector('[data-bar]');
    var head = sec.querySelector('.scene__head');
    var svg = sec.querySelector('.wall');
    svg.setAttribute('viewBox', small ? '96 60 440 450' : '40 0 740 560');

    gsap.set(layers, { autoAlpha: 0, x: function (i) { return i === 0 ? 0 : 260; }, y: function (i) { return i === 0 ? 40 : 0; } });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(arrows, { scaleX: 1, transformOrigin: '0% 50%' });
    gsap.set(bar, { scaleX: 1 });
    gsap.set(head, { autoAlpha: 0, y: 30 });
    steps.forEach(function (li) { li.classList.remove('is-on'); });

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(head, { autoAlpha: 1, y: 0, duration: .5 }, 0);
    var arrowLen = [1, .62, .5, .46, .4];
    var stepAt = [];
    for (var i = 0; i < layers.length; i++) {
      var t0 = .5 + i * 1.1;
      stepAt.push(t0);
      tl.to(layers[i], { autoAlpha: 1, x: 0, y: 0, duration: .8 }, t0)
        .to(labs[i], { autoAlpha: 1, duration: .35 }, t0 + .5)
        .to(arrows, { scaleX: arrowLen[i], duration: .8, ease: 'power2.inOut' }, t0 + .2)
        .to(bar, { scaleX: arrowLen[i], duration: .8, ease: 'power2.inOut' }, t0 + .2);
    }
    tl.to({}, { duration: .7 });

    var last = -1;
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), s = 0;
      for (var j = 0; j < stepAt.length; j++) if (t >= stepAt[j] + .2) s = j + 1;
      if (s !== last) { last = s; steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') <= s); }); }
    });

    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=130%' : '+=220%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { stt.kill(); tl.kill(); gsap.set([layers, labs, arrows, bar, head], { clearProps: 'all' }); };
  }
})();
