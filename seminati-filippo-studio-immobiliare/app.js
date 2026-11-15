/* Bergamo Building: hero entrance and reel drift, header, menu, anchors, reveals, accordion, listing filter chips,
   process line, magnetic buttons, sticky phone bar, form validation, and the GSAP signature scene:
   "Da Dalmine, tredici comuni", a map where a red line runs from Dalmine to each comune and its pin drops in. */
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
  var bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* hero reel drifts left as you scroll */
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

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* listing filter chips */
  var chips = d.querySelectorAll('.chip'), rows = d.querySelectorAll('[data-rows] .row');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var k = 0;
      rows.forEach(function (r) {
        var show = f === 'all' || r.getAttribute('data-k') === f;
        r.classList.toggle('is-out', !show);
        if (show && !reduce) {
          r.classList.add('is-in');
          r.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: (k++) * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
        }
      });
    });
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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
    mapScene(window.innerWidth < 861);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var spokes = q('.sp'), pins = q('.pin'), chipsZ = q('.zone__chips li[data-i]');
    var ring = sec.querySelector('.home__ring'), home = sec.querySelector('.home');
    var cnt = sec.querySelector('[data-count]'), now = sec.querySelector('[data-now]');
    var names = ['Dalmine'];
    pins.forEach(function (p) { names[+p.getAttribute('data-i')] = p.querySelector('text').textContent.replace('S. B.', 'San Bartolomeo'); });
    var N = pins.length;
    if (small) sec.querySelector('.map').setAttribute('viewBox', '40 30 720 560');

    spokes.forEach(function (s) { var L = s.getTotalLength(); s.style.strokeDasharray = L; s.style.strokeDashoffset = L; });
    gsap.set(pins, { autoAlpha: 0, y: -24 });
    gsap.set(home, { autoAlpha: 0, scale: .6, transformOrigin: '300px 343px' });
    gsap.set(q('.map__river, .map__road, .map__tag'), { autoAlpha: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(q('.map__river, .map__road, .map__tag'), { autoAlpha: 1, duration: .5, stagger: .1 }, 0)
      .to(home, { autoAlpha: 1, scale: 1, duration: .5 }, .2)
      .fromTo(ring, { scale: .4, transformOrigin: '300px 343px' }, { scale: 1.6, autoAlpha: 0, duration: 1, ease: 'power1.out' }, .5);
    var at = [];
    var step = small ? .55 : .7;
    for (var i = 1; i <= N; i++) {
      var t0 = 1 + (i - 1) * step;
      at[i] = t0 + step * .5;
      var s = sec.querySelector('.sp[data-i="' + i + '"]'), p = sec.querySelector('.pin[data-i="' + i + '"]');
      tl.to(s, { strokeDashoffset: 0, duration: step * .8, ease: 'power1.inOut' }, t0)
        .to(p, { autoAlpha: 1, y: 0, duration: step * .6, ease: 'back.out(2)' }, t0 + step * .5);
    }
    tl.to(spokes, { opacity: .35, duration: .6 }, 1 + N * step)
      .to({}, { duration: .5 });

    var last = -1;
    function sync() {
      var t = tl.time(), c = 0;
      for (var k = 1; k <= N; k++) if (t >= at[k]) c = k;
      if (c === last) return;
      last = c;
      var n = c + 1;
      cnt.textContent = (n < 10 ? '0' : '') + n;
      now.textContent = names[c];
      chipsZ.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-i') <= c); });
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
