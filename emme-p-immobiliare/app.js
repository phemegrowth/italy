/* Emme&P Immobiliare: hero entrance, header, phone menu, anchors, reveals, services list drives the photo,
   process line, magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a schematic map of Bovisa draws itself from Piazza Bausan, routes run out to four places and pins drop in. */
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
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.8);
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

  /* anchors with header offset; the no-op language link does nothing */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 4);
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

  /* services: the item nearest the middle of the screen drives the photo (desktop), hover too */
  var items = d.querySelectorAll('.svc__item'), swaps = d.querySelectorAll('[data-swap]');
  function setSvc(i) {
    items.forEach(function (it) { it.classList.toggle('is-act', +it.dataset.i === i); });
    swaps.forEach(function (im) { im.classList.toggle('is-on', +im.dataset.swap === i); });
  }
  function svcScroll() {
    var mid = window.innerHeight * 0.5, best = 0, bd = 1e9;
    items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = +it.dataset.i; } });
    setSvc(best);
  }
  window.addEventListener('scroll', svcScroll, { passive: true });
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { setSvc(+it.dataset.i); }); });
  svcScroll();

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.3) / st.length || p === 1); });
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Due righe sulla vostra richiesta.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: the map of Bovisa */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return mapScene(false); });
    mm.add('(max-width: 699px)', function () { return mapScene(true); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var pin = sec.querySelector('.scene__pin');
    var streets = sec.querySelectorAll('.st'), blocks = sec.querySelectorAll('.m-blocks rect'), lbls = sec.querySelectorAll('.m-lbl text');
    var routes = sec.querySelectorAll('.m-route'), pins = sec.querySelectorAll('.pin'), piazza = sec.querySelector('.m-piazza');
    var caps = sec.querySelectorAll('.cap'), cur = sec.querySelector('.scene__cur'), bar = sec.querySelector('.scene__bar i');
    var last = -1;
    function setCap(i) {
      if (i === last) return; last = i;
      caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      pins.forEach(function (p, k) { p.classList.toggle('is-act', k === i); });
      cur.textContent = '0' + (i + 1);
    }
    function dash(el) { var L = el.getTotalLength(); el.style.strokeDasharray = L + ' ' + L; return L; }
    streets.forEach(function (s) { gsap.set(s, { strokeDashoffset: dash(s) }); });
    routes.forEach(function (s) { gsap.set(s, { strokeDashoffset: dash(s) }); });
    gsap.set(blocks, { opacity: 0 });
    gsap.set(lbls, { opacity: 0 });
    gsap.set(piazza, { opacity: 0 });
    gsap.set(pins, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });
    setCap(0);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, pin: pin, scrub: 0.6, start: 'top top', end: small ? '+=140%' : '+=230%', anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress;
          setCap(p < 0.4 ? 0 : p < 0.6 ? 1 : p < 0.8 ? 2 : 3);
        }
      }
    });
    tl.to(streets, { strokeDashoffset: 0, duration: 0.26, stagger: 0.012 }, 0)
      .to(blocks, { opacity: 1, duration: 0.12, stagger: 0.03 }, 0.1)
      .to(piazza, { opacity: 1, duration: 0.06 }, 0.18)
      .to(pins[0], { scale: 1, opacity: 1, duration: 0.06, ease: 'back.out(2)' }, 0.24)
      .to(lbls, { opacity: 1, duration: 0.1, stagger: 0.02 }, 0.26)
      .to(routes[0], { strokeDashoffset: 0, duration: 0.16 }, 0.4)
      .to(pins[1], { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, 0.54)
      .to(routes[1], { strokeDashoffset: 0, duration: 0.16 }, 0.6)
      .to(pins[2], { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, 0.74)
      .to(routes[2], { strokeDashoffset: 0, duration: 0.14 }, 0.8)
      .to(pins[3], { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, 0.92)
      .to(bar, { scaleX: 1, duration: 1 }, 0);
    return function () {
      streets.forEach(function (s) { s.style.strokeDasharray = ''; s.style.strokeDashoffset = ''; });
      routes.forEach(function (s) { s.style.strokeDasharray = ''; s.style.strokeDashoffset = ''; });
    };
  }
})();
