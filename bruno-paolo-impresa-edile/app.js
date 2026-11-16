/* Bruno Paolo Impresa Edile: reel hero, reveals, works list, floor scene, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* count-up (sourced rating only) */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1100, 1); var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* works list: hover (desktop) or scroll position picks the photo */
  var wks = $$('.wk'), wps = $$('.wp');
  function setWk(n) { wks.forEach(function (w, i) { w.classList.toggle('is-on', i === n); }); wps.forEach(function (p, i) { p.classList.toggle('is-on', i === n); }); }
  wks.forEach(function (w, i) { w.addEventListener('mouseenter', function () { setWk(i); }); });
  if ('IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) setWk(wks.indexOf(x.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
    wks.forEach(function (w) { wio.observe(w); });
  }

  /* form */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  var lys = $$('.ly'), pct = $('[data-pct]');
  function setLayer(n, p) {
    lys.forEach(function (l, i) { l.classList.toggle('is-on', i === n); l.classList.toggle('is-done', i < n); });
    if (pct) pct.textContent = Math.round(p * 100);
  }

  if (!hasG || reduce) {
    setLayer(3, 1);
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: lines rise, reel slides in from the right (about 1.2 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 108, duration: .75, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .18)
    .from('.reel__card', { xPercent: 40, opacity: 0, duration: 1, stagger: .08, ease: 'power4.out' }, .1)
    .from('.reel__card img', { scale: 1.2, duration: 1.4, ease: 'power2.out' }, .1);

  function reel() {
    var track = $('.reel__track');
    gsap.to(track, {
      x: function () { return -Math.max(0, track.scrollWidth - track.parentElement.clientWidth * 0.75); }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6, invalidateOnRefresh: true }
    });
  }

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.slab__photo', { clipPath: 'inset(100% 0 0 0)' });
      var t = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .5,
          onUpdate: function (s) { var p = s.progress; setLayer(Math.min(3, Math.floor(p * 4.4)), Math.min(1, p * 1.1)); }
        }
      });
      t.from('.scene__text .kicker, .scene__text .h2', { y: 30, opacity: 0, duration: .5, stagger: .1 }, 0)
        .from('.slab__stage', { y: 60, opacity: 0, duration: .6 }, 0)
        .from('.sl--0', { y: 40, opacity: 0, duration: .5 }, .2)
        .from('.sl--1', { y: -120, opacity: 0, duration: 1 }, .6)
        .from('.sl--2', { y: -120, opacity: 0, duration: 1 }, 1.6)
        .from('.sl--3', { y: -120, opacity: 0, duration: 1 }, 2.6)
        .from('.sl--4', { y: -120, opacity: 0, duration: 1 }, 3.6)
        .to('.slab__photo', { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'none' }, 4.4)
        .from('.slab__photo img', { scale: 1.15, duration: 1.4, ease: 'none' }, 4.4)
        .to({}, { duration: .4 });
      return function () { setLayer(0, 0); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { reel(); scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
