/* ArkHOME Ristrutturazioni: hero entrance (headline lines, cinematic photo opens and drifts), header, phone menu, anchors,
   reveals, process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a pinned horizontal strip of five of their own rooms; scroll drives the strip, each card unmasks as it enters, counter and bar follow. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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


  /* strip: native swipe fallback keeps the counter and bar in sync */
  var sec = d.querySelector('[data-scene]'), track = d.querySelector('[data-track]'), bar = d.querySelector('[data-bar]'), cur = d.querySelector('[data-cur]');
  var cards = track ? track.querySelectorAll('.card') : [];
  function setCount(p) {
    var i = Math.min(cards.length - 1, Math.round(p * (cards.length - 1)));
    if (cur) cur.textContent = (i < 9 ? '0' : '') + (i + 1);
    if (bar) bar.style.setProperty('--sp', Math.max(.2, p).toFixed(3));
  }
  if (track) track.addEventListener('scroll', function () {
    var m = track.scrollWidth - track.clientWidth; setCount(m > 0 ? track.scrollLeft / m : 1);
  }, { passive: true });

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return strip(false); });
    mm.add('(max-width: 699px)', function () { return strip(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function strip(small) {
    track.scrollLeft = 0;
    var imgs = track.querySelectorAll('.card__img'), caps = track.querySelectorAll('figcaption');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (small ? 20 : 56)); };
    gsap.set(imgs, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(imgs[0], { clipPath: 'inset(0 0% 0 0)' });
    if (!small) gsap.set(imgs[1], { clipPath: 'inset(0 0% 0 0)' });
    gsap.set(caps, { autoAlpha: 0, y: 12 });
    gsap.set(small ? caps[0] : [caps[0], caps[1]], { autoAlpha: 1, y: 0 });
    var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none' });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.25 : 1.1)); },
      pin: true, scrub: .6, anticipatePin: 1, animation: tw, invalidateOnRefresh: true,
      snap: small ? { snapTo: 1 / (cards.length - 1), directional: false, inertia: false, duration: { min: .2, max: .5 }, delay: .08, ease: 'power2.inOut' } : false,
      onUpdate: function (s) { setCount(s.progress); }
    });
    var reveals = [];
    imgs.forEach(function (im, i) {
      if (i === 0 || (!small && i === 1)) return;
      reveals.push(ScrollTrigger.create({
        trigger: im, containerAnimation: tw, start: 'left 92%',
        onEnter: function () { gsap.to(im, { clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'power3.out' }); gsap.to(caps[i], { autoAlpha: 1, y: 0, duration: .6, delay: .3 }); },
        onLeaveBack: function () { gsap.to(im, { clipPath: 'inset(0 100% 0 0)', duration: .5 }); gsap.to(caps[i], { autoAlpha: 0, y: 12, duration: .3 }); }
      }));
    });
    return function () { reveals.forEach(function (r) { r.kill(); }); stt.kill(); tw.kill(); gsap.set([track, imgs, caps], { clearProps: 'all' }); };
  }
})();
