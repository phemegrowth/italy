/* Marsala Costruzioni Edili: hero E (reel of their own finished rooms slides in, then drifts left with scroll;
   headline held on the left), header, phone menu, anchors, reveals, accordion, process line, sticky phone bar,
   form validation, and the GSAP signature scene "Un palazzo, piano per piano" (catalogue 2, exploded floors):
   pinned, one Genova-style facade is cut in four bands that pull apart with scroll, each band gets a petrol
   edge and a label with the work done there (tetto, facciata, balconi e terrazzi, dentro casa). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.75);
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
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
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

  /* hero reel drift */
  var track = d.querySelector('.reel__track');
  if (track && !reduce) {
    var tick = false;
    var drift = function () {
      tick = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.4);
      track.style.transform = 'translate3d(' + (-y * 0.3).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  /* accordion: one open at a time, small open animation */
  var acc = d.querySelectorAll('.acc__it');
  acc.forEach(function (it) {
    it.addEventListener('toggle', function () {
      if (!it.open) return;
      it.classList.remove('is-anim'); void it.offsetWidth; it.classList.add('is-anim');
      acc.forEach(function (o) { if (o !== it) o.open = false; });
    });
  });

  /* process line */
  var wrapS = d.querySelector('.steps__wrap'), line = d.querySelector('.steps__line i');
  if (wrapS && line && !reduce) {
    var lp = function () {
      var r = wrapS.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener('scroll', lp, { passive: true });
    lp();
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
    mm.add('(max-width: 899px)', function () { return scene(true); });
    mm.add('(min-width: 900px)', function () { return scene(false); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var rows = sec.querySelectorAll('.exp__row'), imgs = sec.querySelectorAll('.exp__img'), labs = sec.querySelectorAll('.exp__lab');
    var gap = small ? 9 : 18, shift = small ? 0 : 28;
    gsap.set(labs, { opacity: 0, x: -16 });
    gsap.set(rows, { y: 0 });
    gsap.set(imgs, { x: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to({}, { duration: .2 });
    rows.forEach(function (r, i) {
      tl.to(r, { y: (i - 1.5) * gap * 2, x: (i % 2 ? shift : -shift), duration: 1 }, .2);
      tl.to(labs[i], { opacity: 1, x: 0, duration: .35, ease: 'power1.out' }, .5 + i * .22);
    });
    tl.to({}, { duration: .3 });
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=120%' : '+=200%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () { st.kill(); gsap.set([rows, imgs, labs], { clearProps: 'all' }); };
  }
})();
