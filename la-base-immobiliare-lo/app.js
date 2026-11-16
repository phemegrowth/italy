/* La Base Immobiliare: header, menu, anchors, reveals, count-up, steps track, phone bar, form validation,
   hero photo strip drift, and the GSAP signature scene: from the agency in Via Mazzini, routes draw out
   across a schematic of the Cuneo plateau to the five areas where their listings are. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* hero strip: slow drift with scroll once the entrance is over */
  var frames = d.querySelectorAll('.strip__f');
  if (!reduce && frames.length) {
    setTimeout(function () {
      frames.forEach(function (f) { f.classList.add('drift'); });
      var speeds = [0.06, -0.04, 0.1];
      var tick = function () {
        var y = Math.min(window.scrollY, 1200);
        frames.forEach(function (f, i) { f.style.transform = 'translate3d(' + (-y * speeds[i] * 0.6) + 'px,' + (-y * speeds[i]) + 'px,0)'; });
      };
      window.addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
      tick();
    }, 1700);
  }

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

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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

  /* count-up: Google rating and review count only */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  d.querySelectorAll('[data-track]').forEach(function (l) {
    var st = l.querySelectorAll('.tk');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
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
    scene(window.innerWidth < 900);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var routes = sec.querySelectorAll('.route'), pins = sec.querySelectorAll('.pin'), zones = sec.querySelectorAll('.zone'),
      home = sec.querySelector('.home'), homeLab = sec.querySelector('.map__home-lab'), plateau = sec.querySelector('.map__plateau'),
      rivers = sec.querySelectorAll('.map__river'), rlabs = sec.querySelectorAll('.map__rlab'), cnt = sec.querySelector('.map__count b'),
      svg = sec.querySelector('.map__svg');
    /* routes: solid stroke revealed through a dash offset, then the dotted look is restored per segment */
    routes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    rivers.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    var dots = [].map.call(pins, function (p) { return p.querySelector('circle'); }),
      labs = [].map.call(pins, function (p) { return p.querySelector('.pin__lab'); });
    gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(home.querySelectorAll('circle'), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([homeLab, plateau].concat([].slice.call(rlabs)), { autoAlpha: 0 });
    gsap.set(svg, { scale: 1.12, transformOrigin: '60% 40%' });
    var cur = -1;
    function setZone(i) {
      if (i === cur) return; cur = i;
      zones.forEach(function (z, k) { z.classList.toggle('is-on', k === i); });
      pins.forEach(function (p, k) { p.classList.toggle('is-cur', k === i); });
      if (cnt) cnt.textContent = '0' + (i + 1);
    }
    setZone(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { var p = (s.progress - 0.18) / 0.78; setZone(Math.max(0, Math.min(4, Math.floor(p * 5)))); }
      }
    });
    tl.to(plateau, { autoAlpha: 1, duration: .4 }, 0)
      .to(rivers, { strokeDashoffset: 0, duration: .8, stagger: .15 }, 0)
      .to(rlabs, { autoAlpha: 1, duration: .3 }, .6)
      .to(svg, { scale: 1, duration: 1 }, 0)
      .to(home.querySelectorAll('circle'), { scale: 1, duration: .3, ease: 'back.out(2)' }, .7)
      .to(homeLab, { autoAlpha: 1, duration: .3 }, .8);
    routes.forEach(function (r, i) {
      var at = 1.2 + i * 1;
      tl.to(r, { strokeDashoffset: 0, duration: .7 }, at)
        .to(dots[i], { scale: 1, duration: .3, ease: 'back.out(2.2)' }, at + .6)
        .to(labs[i], { autoAlpha: 1, duration: .25 }, at + .7);
    });
    tl.to({}, { duration: .5 });
    /* on phones only the current pin keeps its label, to avoid crowding */
    if (small) sec.classList.add('is-small');
  }
})();
