/* EcoCoperture: survey-frame hero, service photo swap, capannone re-roofing scene, gallery, review count, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  /* count-up of the Google score */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    el.textContent = (0).toFixed(dec).replace('.', ',');
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

  /* services: the active row swaps the sticky photo */
  var rows = $$('.row'), pics = $$('.svc__pics img');
  function setRow(i) { rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); }); pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); }); }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { setRow(i); }); });
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) setRow(rows.indexOf(x.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { ro.observe(r); });
  }
  setRow(0);

  /* gallery thumbnails */
  var big = $('[data-big]'), cap = $('[data-cap]');
  $$('.gal__thumbs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.gal__thumbs button').forEach(function (x) { x.classList.remove('is-on'); }); b.classList.add('is-on');
      big.classList.add('is-swap');
      setTimeout(function () { big.src = b.dataset.src; big.alt = b.getAttribute('aria-label'); cap.textContent = b.dataset.cap; big.classList.remove('is-swap'); }, reduce ? 0 : 250);
    });
  });

  /* form */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di copertura.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero: the survey frame draws, the photo fades in inside it, the headline rises (about 1.3 s) */
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 110, duration: .7, stagger: .09 }, 0)
      .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
      .from('.fl--t, .fl--b', { scaleX: 0, duration: .8, ease: 'power2.inOut' }, 0)
      .from('.fl--l, .fl--r', { scaleY: 0, duration: .8, ease: 'power2.inOut' }, .1)
      .from('.tick', { opacity: 0, y: 6, duration: .4, stagger: .1 }, .6)
      .from('.hero__pic', { opacity: 0, duration: .8 }, .35)
      .from('.hero__pic img', { scale: 1.12, duration: 1.8, ease: 'power2.out' }, .35)
      .from('.hero__cap', { opacity: 0, y: 10, duration: .5 }, 1);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function scene() {
    var sc = $('.scene'); if (!sc || reduce) { var p0 = $('[data-pct]'); if (p0) p0.textContent = '100'; $$('.st').forEach(function (s) { s.classList.add('is-on'); }); return; }
    var steps = $$('.st'), pct = $('[data-pct]');
    var draws = $$('.shed .tin .draw,.shed .survey .draw:not(.dash)');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone; sc.classList.add('is-live');
      draws.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.set('.shed .sh', { y: 0, rotation: 0, opacity: 1 });
      gsap.set('.shed .np', { y: -150, opacity: 0 });
      gsap.set('.shed .lb, .shed .survey text, .shed .dash', { opacity: 0 });
      var surv = $$('.shed .survey .draw:not(.dash)'), tin = $$('.shed .tin .draw');
      function stepAt(p) { var k = p < .26 ? 0 : p < .52 ? 1 : p < .78 ? 2 : 3; steps.forEach(function (s, i) { s.classList.toggle('is-on', i === k); }); }
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sc, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (s) { stepAt(s.progress); var v = Math.round(Math.min(Math.max((s.progress - .26) / .68, 0), 1) * 100); pct.textContent = v; } } });
      t.to('.shed .dash', { opacity: 1, duration: .05 }, .06)
        .to(surv, { strokeDashoffset: 0, duration: .08, stagger: .02 }, .08)
        .to('.shed .survey text', { opacity: 1, duration: .04 }, .14)
        .to('.shed .lb--old', { opacity: 1, duration: .04 }, .16)
        .to('.shed .survey', { opacity: 0, duration: .05 }, .27)
        .to('.shed .lb--old', { opacity: 0, duration: .04 }, .44)
        .to('.shed .sh', { y: 260, rotation: function (i) { return i % 2 ? 14 : -12; }, opacity: 0, transformOrigin: '50% 50%', duration: .14, stagger: .025, ease: 'power1.in' }, .28)
        .to('.shed .np', { y: 0, opacity: 1, duration: .1, stagger: .03, ease: 'power2.out' }, .52)
        .to('.shed .lb--new', { opacity: 1, duration: .04 }, .6)
        .to('.shed .lb--new', { opacity: 0, duration: .04 }, .76)
        .to(tin, { strokeDashoffset: 0, duration: .1, stagger: .03 }, .78)
        .to('.shed .lb--tin', { opacity: 1, duration: .04 }, .86)
        .to({}, { duration: .06 }, .94);
      return function () { sc.classList.remove('is-live'); draws.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    if (reduce) { l.style.setProperty('--p', 1); return; }
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 78%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
