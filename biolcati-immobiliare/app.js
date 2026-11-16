/* Studio Biolcati Immobiliare: header, menu, anchors, reveals, count-up (22 listings online), hero and about parallax,
   services list that swaps the photo, steps track, phone bar, form validation, and the GSAP signature scene:
   a schematic of the M4 and M1 lines draws itself and a listing lights up at each stop. */
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

  /* parallax: hero photo moves slower than the page, about photo drifts */
  var hp = d.querySelector('.hero__pic img'), ap = d.querySelector('.about__pic img');
  if (!reduce) {
    var pt = function () {
      var y = window.scrollY;
      if (hp && y < window.innerHeight * 1.5) hp.style.transform = 'translate3d(0,' + (y * 0.12) + 'px,0)';
      if (ap) { var r = ap.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < window.innerHeight) ap.style.transform = 'translate3d(0,' + ((r.top - window.innerHeight / 2) * -0.06) + 'px,0) scale(1.12)'; }
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(pt); }, { passive: true });
    pt();
  }

  /* services: hover (desktop) or scroll position (phone) picks the photo */
  var rows = d.querySelectorAll('.row[data-pic]'), pics = d.querySelectorAll('.svc__pic img');
  function pick(i) { pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); }); rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); }); }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { pick(+r.getAttribute('data-pic')); }); });
  if ('IntersectionObserver' in window && window.matchMedia('(max-width: 899px)').matches) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) pick(+e.target.getAttribute('data-pic')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { rio.observe(r); });
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

  /* count-up: listings online (idealista, Nov 2026) */
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
    var lines = sec.querySelectorAll('.line'), stops = sec.querySelectorAll('.stop'), lots = sec.querySelectorAll('.lot'),
      dots = sec.querySelectorAll('.dots circle'), here = sec.querySelector('.here'), tags = sec.querySelector('.tags'),
      cnt = sec.querySelector('.count b'), n = lots.length;
    lines.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    var circles = [].map.call(stops, function (s) { return s.querySelector('circle'); }), labels = [].map.call(stops, function (s) { return s.querySelector('text'); });
    gsap.set(circles.concat([].slice.call(dots)), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labels.concat([here, tags]), { autoAlpha: 0 });
    var cur = -1;
    function setLot(i) {
      if (i === cur) return; cur = i;
      lots.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      stops.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
      if (cnt) cnt.textContent = '0' + (i + 1);
    }
    setLot(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { var p = (s.progress - 0.22) / 0.72; setLot(Math.max(0, Math.min(n - 1, Math.floor(p * n)))); }
      }
    });
    tl.to(lines[1], { strokeDashoffset: 0, duration: 1 }, 0)
      .to(lines[0], { strokeDashoffset: 0, duration: 1 }, .3)
      .to(tags, { autoAlpha: 1, duration: .3 }, .9)
      .to(dots, { scale: 1, duration: .3, stagger: .08 }, .6)
      .to(circles[0], { scale: 1, duration: .3, ease: 'back.out(2)' }, 1)
      .to([labels[0], here], { autoAlpha: 1, duration: .3 }, 1.1);
    for (var i = 1; i < n; i++) {
      tl.to(circles[i], { scale: 1, duration: .3, ease: 'back.out(2)' }, 1.2 + i * .9)
        .to(labels[i], { autoAlpha: 1, duration: .3 }, 1.3 + i * .9);
    }
    tl.to(here, { autoAlpha: 0.0001, duration: .3 }, 2).to({}, { duration: 1.2 });
  }
})();
