/* Immobiliare Petrarca: hero entrance (plate rises, headline line by line, slow scale on the photo), header,
   full-screen phone menu, anchors, reveals, process line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: their real listings. Desktop: the strip of cards is pinned and driven sideways
   by the scroll, each photo unmasks as it enters, counter and progress bar follow. Phone: the same cards as
   a deck; each scroll step slides the top card away and the next one rises. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      if (id === '#vendita' && window.ScrollTrigger) { var st = ScrollTrigger.getById('sale'); if (st) top = st.start + 2; }
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* phone contact bar: shows once the hero is scrolled past */
  var bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0.02 }).observe(hero);
  } else if (bar) bar.classList.add('is-on');

  /* about photo: slow parallax */
  var ap = d.querySelector('.about__photo img');
  if (ap && !reduce) {
    var pt = false;
    window.addEventListener('scroll', function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        pt = false;
        var r = ap.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        ap.style.transform = 'translate3d(0,' + (-p * 15).toFixed(2) + '%,0)';
      });
    }, { passive: true });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { stripScene(); });
    mm.add('(max-width: 899px)', function () { deckScene(); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  var sec = d.querySelector('[data-scene]');
  var countEl = sec.querySelector('[data-count]'), totalEl = sec.querySelector('[data-total]'), barEl = sec.querySelector('[data-bar]');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setMeter(i, n, p) {
    countEl.textContent = pad(i);
    totalEl.textContent = pad(n);
    barEl.style.transform = 'scaleX(' + Math.max(1 / n, p).toFixed(3) + ')';
  }

  function stripScene() {
    var track = sec.querySelector('[data-track]'), cards = sec.querySelectorAll('[data-card]'), n = cards.length;
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var tw = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        id: 'sale', trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.1); },
        pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { setMeter(Math.min(n, 1 + Math.floor(s.progress * n * .999)), n, s.progress); }
      }
    });
    cards.forEach(function (c) {
      var img = c.querySelector('.card__img'), body = c.querySelector('.card__body');
      gsap.fromTo(img, { clipPath: 'inset(0% 0% 0% 100%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 98%', end: 'left 62%', scrub: true }
      });
      gsap.fromTo(body, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 90%', end: 'left 66%', scrub: true }
      });
    });
    setMeter(1, n, 0);
    return function () { gsap.set(track, { clearProps: 'transform' }); };
  }

  function deckScene() {
    var cards = Array.prototype.slice.call(sec.querySelectorAll('[data-card]')).slice(0, 5), n = cards.length;
    cards.forEach(function (c, i) {
      c.style.zIndex = String(10 - i);
      gsap.set(c, { scale: i === 0 ? 1 : (i === 1 ? .94 : .88), y: i === 0 ? 0 : (i === 1 ? 18 : 36), autoAlpha: i < 3 ? 1 : 0, transformOrigin: '50% 0%' });
    });
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    for (var i = 0; i < n - 1; i++) {
      var t = i * 1.2 + .3;
      tl.to(cards[i], { xPercent: -118, rotation: -7, duration: 1 }, t)
        .to(cards[i + 1], { scale: 1, y: 0, duration: 1 }, t);
      if (cards[i + 2]) tl.to(cards[i + 2], { scale: .94, y: 18, autoAlpha: 1, duration: 1 }, t);
      if (cards[i + 3]) tl.to(cards[i + 3], { autoAlpha: 1, duration: .4 }, t + .6);
    }
    tl.to({}, { duration: .4 });
    var total = tl.duration();
    ScrollTrigger.create({
      id: 'sale', trigger: sec, start: 'top top', end: '+=' + Math.round((n - 1) * 34) + '%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onUpdate: function () {
        var k = 1;
        for (var j = 0; j < n - 1; j++) if (tl.time() >= j * 1.2 + .8) k = j + 2;
        setMeter(k, n, tl.time() / total);
      }
    });
    setMeter(1, n, 0);
    return function () { cards.forEach(function (c) { c.style.zIndex = ''; gsap.set(c, { clearProps: 'all' }); }); };
  }
})();
