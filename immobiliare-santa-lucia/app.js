(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* hero entrance on the first frames */
  var hero = $('.hero');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
  $$('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 24);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && !menu.hidden) setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var rvs = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) rvs.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = $$(':scope > .rv', e.target.parentNode);
        e.target.style.setProperty('--d', (Math.max(0, sibs.indexOf(e.target)) % 6) * 0.07 + 's');
        e.target.classList.add('is-in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* accordion */
  $$('.acc__it').forEach(function (it) {
    var b = $('button', it), p = $('.acc__panel', it);
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      it.classList.toggle('is-open', !open);
      if (open) p.hidden = true; else p.hidden = false;
    });
  });

  /* listing filter chips */
  var chips = $$('.chip'), cards = $$('.card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var k = 0;
      cards.forEach(function (card) {
        var show = f === 'tutti' || card.getAttribute('data-t') === f;
        card.classList.toggle('is-out', !show); card.classList.remove('is-pop');
        if (show) { card.classList.add('is-in'); if (!reduce) { void card.offsetWidth; card.style.animationDelay = (k++ * 0.05) + 's'; card.classList.add('is-pop'); } }
      });
    });
  });

  /* magnetic buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono valido.', email: "Controllate l'indirizzo email.", message: 'Scriveteci due righe.' };
    var check = function (el) {
      var v = el.value.trim(), ok = true;
      if (el.name === 'name') ok = v.length > 1;
      if (el.name === 'phone') ok = v.replace(/\D/g, '').length >= 6;
      if (el.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (el.name === 'message') ok = v.length > 3;
      var err = el.parentNode.querySelector('.f__err');
      el.classList.toggle('is-bad', !ok); el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.textContent = ok ? '' : msgs[el.name];
      return ok;
    };
    var fields = $$('[required]', form);
    fields.forEach(function (el) { el.addEventListener('blur', function () { if (el.value) check(el); }); });
    form.addEventListener('submit', function (e) { var bad = fields.filter(function (el) { return !check(el); }); if (bad.length) { e.preventDefault(); bad[0].focus(); } });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
    /* hero reel drifts left as the page scrolls */
    var track = $('.reel__track');
    gsap.to(track, { x: function () { return -Math.min(track.scrollWidth - window.innerWidth * 0.6, window.innerWidth * 0.35); }, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true } });

    /* signature scene: routes draw from the office to each town, pins drop, the card follows */
    var zone = $('.zone'), routes = $$('.route'), pinG = $$('.pin[data-p]'), pins = pinG.map(function (g) { return $('.pin__in', g); }), zcs = $$('.zc'), home = $('.pin--home .pin__in');
    zone.classList.add('is-live');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      routes.forEach(function (r) { var L = r.getTotalLength(); r.style.strokeDasharray = L + ' ' + L; r.style.strokeDashoffset = L; r._L = L; });
      gsap.set(pins, { opacity: 0, y: -18 });
      gsap.set(home, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(zcs, { opacity: 0, y: 16 });
      gsap.set('.map__prov', { opacity: 0.3 });
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: zone, start: 'top top', end: phone ? '+=140%' : '+=260%', pin: '.zone__pin', scrub: 0.6 } });
      tl.eventCallback('onUpdate', function () { var a = Math.floor((tl.time() - 0.8) / 0.7); pinG.forEach(function (g, k) { g.classList.toggle('is-on', k === Math.min(a, pinG.length - 1)); }); });
      tl.to('.map__prov', { opacity: 1, duration: 0.3 });
      tl.to(home, { scale: 1, duration: 0.25, ease: 'back.out(2)' }, '<0.1');
      routes.forEach(function (r, i) {
        var at = 0.5 + i * 0.7;
        tl.to(r, { strokeDashoffset: 0, duration: 0.4 }, at);
        tl.to(pins[i], { opacity: 1, y: 0, duration: 0.2, ease: 'back.out(2)' }, at + 0.3);
        tl.to(zcs[i], { opacity: 1, y: 0, duration: 0.18 }, at + 0.3);
        if (i < routes.length - 1) tl.to(zcs[i], { opacity: 0, y: -12, duration: 0.15 }, at + 0.62);
      });
      tl.to({}, { duration: 0.4 });
      return function () { routes.forEach(function (r) { r.style.strokeDasharray = ''; r.style.strokeDashoffset = ''; }); gsap.set(pins.concat(zcs, [home]), { clearProps: 'opacity,transform' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
