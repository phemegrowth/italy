/* Shiman: header, menu, anchors, reveals, count-up, product list that swaps the photo, installation line,
   phone bar, form validation, and the GSAP signature scene: a window built piece by piece
   (telaio, vetrocamera, guarnizioni, cassonetto e tapparella, zanzariera). */
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

  /* count-up (sourced numbers only: reviews, listings) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* products: list swaps the photo */
  var items = d.querySelectorAll('.pi'), pics = d.querySelectorAll('.prod__pics img');
  items.forEach(function (it) {
    it.querySelector('button').addEventListener('click', function () {
      var k = +it.getAttribute('data-img');
      items.forEach(function (o) { var on = o === it; o.classList.toggle('is-on', on); o.querySelector('button').setAttribute('aria-pressed', on ? 'true' : 'false'); });
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    });
  });

  /* installation line drawn by scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
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
    scene(window.innerWidth < 761);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var frame = q('.w-frame rect'), glass = q('.w-glass .g1'), glass2 = q('.w-glass .g2, .w-glass .g3'), seal = q('.w-seal'), handle = q('.w-handle'),
      box = q('.w-box'), shutter = sec.querySelector('.w-shutter'), net = sec.querySelector('.w-net'),
      parts = q('.part'), cnt = sec.querySelector('.build__count b');
    frame.forEach(function (r) { var L = r.getTotalLength(); r.style.strokeDasharray = L; r.style.strokeDashoffset = L; });
    gsap.set(glass, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(glass2, { autoAlpha: 0 });
    gsap.set([seal, handle], { autoAlpha: 0 });
    gsap.set(box, { autoAlpha: 0, y: -30 });
    gsap.set(shutter, { y: -160 });
    gsap.set(net, { scaleX: 0, transformOrigin: '0% 50%' });
    var cur = -1;
    function setPart(i) {
      if (i === cur) return; cur = i;
      parts.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
      if (cnt) cnt.textContent = '0' + (i + 1);
    }
    setPart(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { setPart(Math.min(4, Math.floor(s.progress * 5.2))); }
      }
    });
    tl.to(frame, { strokeDashoffset: 0, duration: 1.2, stagger: .25 })
      .to(glass, { autoAlpha: 1, scaleY: 1, duration: .8, stagger: .15, ease: 'power2.out' }, 1.8)
      .to(glass2, { autoAlpha: 1, duration: .4 }, 2.5)
      .to(seal, { autoAlpha: 1, duration: .5 }, 3.7)
      .to(handle, { autoAlpha: 1, duration: .4 }, 4)
      .to(box, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, 5.4)
      .to(shutter, { y: 0, duration: 1, ease: 'power1.inOut' }, 5.9)
      .to(net, { scaleX: 1, duration: 1, ease: 'power2.inOut' }, 7.4)
      .to({}, { duration: .6 });
  }
})();
