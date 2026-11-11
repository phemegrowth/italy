/* C.M. Costruzioni: hero entrance (line reveal, reel slides in), reel drifts left on scroll, header, full-screen menu,
   anchors, reveals, sticky service photo driven by the list, drag strip, process line, magnetic buttons, phone bar, form,
   and the GSAP signature scene: one wall built with scroll, from bare brick to finished (impianti, cartongesso and
   controsoffitto, pittura, boiserie, LED light). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-shown', y > hero.offsetHeight - 120);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 57;
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero reel drifts left with scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) reel.style.transform = 'translate3d(' + (-y * (window.innerWidth < 700 ? 0.5 : 0.35)).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: the item at reading height (or hovered) picks the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  function pickItem() {
    lt = false;
    var mid = window.innerHeight * (window.innerWidth < 1024 ? 0.66 : 0.5), best = null, bd = 1e9;
    items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
    if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
  }
  window.addEventListener('scroll', function () { if (!lt) { lt = true; requestAnimationFrame(pickItem); } }, { passive: true });

  /* drag strip (mouse); touch scrolls natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); } strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (mouse only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    mm.add('(max-width: 1023px)', function () { return wallScene(true); });
    mm.add('(min-width: 1024px)', function () { return wallScene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var rows = q('.w-row'), pipes = q('.w-pipe'), boxes = q('.w-box'), sheets = q('.w-sheet'), ceil = q('.w-ceil');
    var paint = q('.w-paint rect'), moulds = q('.w-mould'), niche = q('.w-niche'), strip = q('.w-strip'), wash = q('.w-wash'), nlight = q('.w-nlight');
    var lis = q('.phases li'), num = sec.querySelector('[data-phase]'), bar = sec.querySelector('[data-bar]');

    pipes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(rows, { autoAlpha: 0, y: 14 });
    gsap.set(boxes, { autoAlpha: 0, scale: .4, transformOrigin: '50% 50%' });
    gsap.set(sheets, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(ceil, { autoAlpha: 0, y: -30 });
    gsap.set(paint, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(moulds, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(niche, { autoAlpha: 0 });
    gsap.set(strip, { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set([wash, nlight], { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, .2, 2.3, 4.2, 6.3, 7.8];
    tl.to(rows, { autoAlpha: 1, y: 0, duration: .3, stagger: 1.7 / rows.length }, .2)
      .to(pipes, { strokeDashoffset: 0, duration: 1.1, stagger: .15, ease: 'power1.inOut' }, 2.3)
      .to(boxes, { autoAlpha: 1, scale: 1, duration: .3, stagger: .12 }, 3.1)
      .to(ceil, { autoAlpha: 1, y: 0, duration: .5 }, 4.2)
      .to(sheets, { scaleY: 1, duration: .5, stagger: .28, ease: 'power3.out' }, 4.4)
      .to(paint, { scaleY: 1, duration: 1.3, ease: 'power1.inOut' }, 6.3)
      .to(moulds, { strokeDashoffset: 0, duration: .9, stagger: .08, ease: 'power1.inOut' }, 7.8)
      .to(niche, { autoAlpha: 1, duration: .5 }, 8.4)
      .to(strip, { scaleX: 1, duration: .6, ease: 'power2.inOut' }, 9.1)
      .to([wash, nlight], { autoAlpha: 1, duration: .7 }, 9.5)
      .to(bar, { scaleX: 1, duration: 10.2, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 10.2);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 1;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s !== last) {
        last = s;
        num.textContent = '0' + s;
        lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
      }
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=260%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      pipes.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
      gsap.set([rows, boxes, sheets, ceil, paint, moulds, niche, strip, wash, nlight, bar], { clearProps: 'all' });
    };
  }
})();
