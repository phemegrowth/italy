/* Magelli S.a.s.: hero entrance (name rises, rule draws, their work slides in), strip drift, header, menu,
   anchors, reveals, count-up, service photo follows the active item, drag strip, process line, magnetic
   buttons, phone contact bar, form, and the GSAP signature scene: a wall section where the cappotto is
   built layer by layer and the heat that escaped through the bare wall is held back. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* the name fills the width exactly (CSS vw size is the fallback) */
  var nm = d.querySelector('.hn > span'), nmBox = d.querySelector('.hero__name');
  function fitName() {
    if (!nm) return;
    nm.style.fontSize = '';
    var w = nm.offsetWidth, target = nmBox.clientWidth;
    if (w > 0 && target > 0) nm.style.fontSize = (parseFloat(getComputedStyle(nm).fontSize) * target / w * 0.995).toFixed(2) + 'px';
  }
  fitName();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitName);
  window.addEventListener('resize', fitName);

  /* header */
  var header = d.querySelector('.header');
  var hero = d.querySelector('.hero');
  var mbar = d.querySelector('.mbar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
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

  /* count-up (sourced quantities only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* hero strip drifts left as you scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: hover, or the item nearest the middle of the screen, swaps the photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.slist__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt || window.innerWidth < 961) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, sx = 0, sl = 0;
    s.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = sl - (e.pageX - sx); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* process line draws with scroll */
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
    mm.add('(min-width: 961px)', function () { return wallScene(false); });
    mm.add('(max-width: 960px)', function () { return wallScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var svg = sec.querySelector(small ? '.wall--m' : '.wall--d');
    var q = function (s) { return svg.querySelectorAll(s); };
    var L = function (n) { return q('.w-layer[data-l="' + n + '"]'); };
    var dowels = q('.w-dowel'), hin = q('.w-heat-in'), hout = q('.w-heat-out'), hback = q('.w-heat-back');
    var list = sec.querySelectorAll('.layers li'), cnt = sec.querySelector('[data-count-step]');
    var bar = sec.querySelector('[data-bar]'), now = sec.querySelector('[data-now]'), end = sec.querySelector('[data-end]');
    var names = ['', 'Muratura esistente', 'Collante e pannello isolante', 'Tasselli e rete', 'Rasatura', 'Finitura e colore'];
    var from = small ? { y: 46, x: 0 } : { x: 90, y: 0 };

    /* every element starts out of sight */
    gsap.set(q('.w-layer'), { autoAlpha: 0, x: from.x, y: from.y });
    gsap.set(dowels, { autoAlpha: 0, x: small ? 0 : 40, y: small ? 30 : 0 });
    gsap.set(hin, { autoAlpha: 0 });
    gsap.set(hout, { autoAlpha: 0 });
    gsap.set(hback, { autoAlpha: 0 });
    gsap.set(end, { autoAlpha: 0, y: 12 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var at = [0, 0.2, 2.2, 4.2, 5.8, 7.0];
    tl.to(L(1), { autoAlpha: 1, x: 0, y: 0, duration: .8, stagger: .1 }, at[1])
      .to(hin, { autoAlpha: 1, duration: .5, stagger: .1 }, .9)
      .to(hout, { autoAlpha: 1, duration: .5, stagger: .1 }, 1.3)
      .to(L(2), { autoAlpha: 1, x: 0, y: 0, duration: .8, stagger: .15 }, at[2])
      .to(hout, { autoAlpha: .14, duration: .5 }, 3.0)
      .to(hback, { autoAlpha: 1, duration: .5, stagger: .1 }, 3.2)
      .to(dowels, { autoAlpha: 1, x: 0, y: 0, duration: .5, stagger: .1 }, at[3])
      .to(L(3), { autoAlpha: 1, x: 0, y: 0, duration: .6 }, 4.7)
      .to(L(4), { autoAlpha: 1, x: 0, y: 0, duration: .6 }, at[4])
      .to(L(5), { autoAlpha: 1, x: 0, y: 0, duration: .6 }, at[5])
      .to(end, { autoAlpha: 1, y: 0, duration: .4 }, 7.6)
      .to(bar, { scaleX: 1, duration: 8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 8.0);

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var j = 1; j < at.length; j++) if (t >= at[j]) s = j;
      if (s === last) return;
      last = s;
      list.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
      cnt.textContent = '0' + s;
      if (now) now.textContent = s ? '0' + s + ' ' + names[s] : 'Scorrete';
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { if (mbar) mbar.classList.toggle('is-hush', small && self.isActive); }
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set([q('.w-layer'), dowels, hin, hout, hback, end, bar], { clearProps: 'all' });
      list.forEach(function (li) { li.classList.remove('is-on'); });
    };
  }
})();
