/* Studio.4C: hero entrance (photo cards fan out from one stack, headline line by line), card parallax, header,
   full-screen menu, anchors, reveals, accordion, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: a route on the map from the studio in via Davila to each zone where they have listings
   (Selvazzano Dentro, Noventa Padovana, Venezia). Each pin brings its own real listings. */
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
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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

  /* hero cards drift apart a little as you scroll (desktop) */
  var fan = d.querySelectorAll('.fan__c');
  if (!reduce && window.matchMedia('(min-width: 900px)').matches) {
    var sp = [-0.06, -0.12, 0.05, -0.02], ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        fan.forEach(function (c, i) { c.style.translate = '0 ' + (y * sp[i]).toFixed(1) + 'px'; });
      });
    }, { passive: true });
  }

  /* accordion (one open at a time, height animated by grid rows) */
  var accs = d.querySelectorAll('.acc__it');
  accs.forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone bar */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Serve un indirizzo email valido.', message: 'Due righe su cosa cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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
    mm.add('(min-width: 900px)', function () { mapScene(false); });
    mm.add('(max-width: 899px)', function () { mapScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    var pins = gsap.utils.toArray(sec.querySelectorAll('.pin')), routes = gsap.utils.toArray(sec.querySelectorAll('.route'));
    var stops = gsap.utils.toArray(sec.querySelectorAll('.stop')), cnt = sec.querySelector('[data-count]');
    var map = sec.querySelector('.map'), note = sec.querySelector('.scene__note');
    routes.forEach(function (r) { var L = r.getTotalLength(); gsap.set(r, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(pins, { autoAlpha: 0 });
    pins.forEach(function (p) { gsap.set(p.querySelectorAll('circle'), { scale: 0, transformOrigin: '50% 50%' }); });
    gsap.set(stops, { autoAlpha: 0, y: 40 });
    gsap.set(map, { autoAlpha: 0, scale: .96 });
    gsap.set(note, { autoAlpha: 0 });
    var last = -1;
    function setActive(i) {
      if (i === last) return; last = i;
      cnt.textContent = '0' + (i + 1);
      pins.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    }
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(map, { autoAlpha: 1, scale: 1, duration: .5 }, 0)
      .to(pins[0], { autoAlpha: 1, duration: .2 }, .3)
      .to(pins[0].querySelectorAll('circle'), { scale: 1, duration: .4, ease: 'back.out(2)' }, .3)
      .to(stops[0], { autoAlpha: 1, y: 0, duration: .4 }, .45);
    var marks = [0];
    for (var i = 1; i < pins.length; i++) {
      var t0 = .6 + (i - 1) * 1.1;
      marks.push(t0 + .55);
      tl.to(routes[i - 1], { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut' }, t0)
        .to(pins[i], { autoAlpha: 1, duration: .15 }, t0 + .45)
        .to(pins[i].querySelectorAll('circle'), { scale: 1, duration: .35, ease: 'back.out(2.4)' }, t0 + .45)
        .to(stops[i - 1], { autoAlpha: 0, y: -30, duration: .35 }, t0 + .4)
        .to(stops[i], { autoAlpha: 1, y: 0, duration: .4 }, t0 + .6);
    }
    var endT = .6 + (pins.length - 1) * 1.1;
    tl.to(note, { autoAlpha: 1, duration: .3 }, endT - .2).to({}, { duration: .4 }, endT);
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), k = 0;
      for (var j = 0; j < marks.length; j++) if (t >= marks[j]) k = j;
      setActive(k);
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    setActive(0);
  }
})();
