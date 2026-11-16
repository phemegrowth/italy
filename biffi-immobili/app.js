/* Biffi Immobili: number-led hero with a house-shaped photo, service image swap, map scene, listing strip, form. */
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
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
  $$('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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

  /* services: the active row swaps the photo (hover on desktop, scroll position everywhere) */
  var rows = $$('.svc__list li'), pics = $$('.svc__pics img');
  function svcOn(i) {
    rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { svcOn(i); }); });
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) svcOn(rows.indexOf(x.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { io2.observe(r); });
  }

  /* listing strip: chips, drag, arrows, progress */
  var strip = $('.strip'), barIn = $('.strip__bar span');
  function prog() {
    var max = strip.scrollWidth - strip.clientWidth;
    var vis = strip.clientWidth / strip.scrollWidth;
    var p = max > 0 ? strip.scrollLeft / max : 1;
    barIn.style.transform = 'translateX(' + (p * (1 - vis) * 100 / Math.max(vis, .01)) + '%) scaleX(1)';
    barIn.style.width = Math.max(vis * 100, 8) + '%';
    barIn.style.transform = 'translateX(' + (p * (100 / Math.max(vis, .08) - 100)) + '%)';
  }
  strip.addEventListener('scroll', prog, { passive: true }); window.addEventListener('resize', prog); prog();
  $$('.arrow').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = $('.card:not(.is-out)', strip); var w = card ? card.getBoundingClientRect().width + 16 : 300;
      strip.scrollBy({ left: w * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  var down = false, sx = 0, sl = 0, moved = false;
  strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; });
  window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); } strip.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
  strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  var chips = $$('.chip'), cards = $$('.card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.f;
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cards.forEach(function (k, i) {
        var show = f === 'all' || k.dataset.k === f;
        k.classList.toggle('is-out', !show);
        if (show && !reduce && k.animate) k.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: i * 40, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
      strip.scrollLeft = 0; prog();
    });
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.26 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  /* scene step helper */
  var places = $$('.places li'), pins = $$('.pin'), tag = $('[data-step]'), cur = -1;
  function stepAt(k) {
    if (k === cur) return; cur = k;
    places.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    pins.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    if (tag) tag.textContent = ('0' + (k + 1)).slice(-2);
  }

  /* count-up (sourced number: Google reviews) */
  var numEl = $('.num__n');
  function countUp() {
    var end = Number(numEl.dataset.count), t0 = performance.now(), dur = 1400;
    numEl.textContent = '0';
    function f(t) { var p = Math.min(1, (t - t0) / dur); var e = 1 - Math.pow(1 - p, 3); numEl.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }

  if (!hasG) { if (!reduce) countUp(); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: lines rise, the house is raised from the ground, the roof line draws, the number counts */
  if (!reduce) {
    var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
    var roof = $('.house__roof path');
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .7, stagger: .08 }, 0)
      .from(hls, { y: 18, opacity: 0, duration: .5, stagger: .06 }, .12)
      .fromTo('.house__clip', { clipPath: 'polygon(50% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 100%)' }, { clipPath: 'polygon(50% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)', duration: 1.1, ease: 'power4.inOut' }, .1)
      .from('.house__roof', { y: 40, opacity: 0, duration: .7, ease: 'power3.out' }, .7)
      .from('.num', { y: 30, opacity: 0, duration: .6 }, .35)
      .add(countUp, .4);
    gsap.fromTo('.house__clip img', { scale: 1.18 }, { scale: 1.04, duration: 18, ease: 'none' });
    var mmH = gsap.matchMedia();
    mmH.add('(min-width: 761px)', function () {
      gsap.to('.house', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.num', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  /* signature scene: route on the map of the Lecco branch of the lake */
  function scene() {
    var routes = $$('.rt'), n = places.length;
    var lake = $$('.m-lake');
    if (reduce) { stepAt(0); return; }
    stepAt(0);
    lake.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    routes.forEach(function (p) { var L = p.getTotalLength(); p.dataset.len = L; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(pins, { opacity: 0, y: -14 });
      gsap.set('.office', { opacity: 0, scale: .4, transformOrigin: '50% 50%' });
      var t = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1,
        onUpdate: function (s) { var p = (s.progress - .22) / .74; stepAt(Math.max(0, Math.min(n - 1, Math.floor(p * n)))); } } });
      t.fromTo(lake, { opacity: 0 }, { opacity: 1, duration: .02 }, 0)
        .to(lake, { strokeDashoffset: 0, duration: .16, ease: 'none' }, 0)
        .from('.m-mount, .m-annone, .m-water', { opacity: 0, duration: .06 }, .1)
        .to('.office', { opacity: 1, scale: 1, duration: .05, ease: 'back.out(2)' }, .16);
      routes.forEach(function (r, i) {
        var at = .22 + i * (.74 / n);
        t.to(r, { strokeDashoffset: 0, duration: .07, ease: 'none' }, at)
          .to(pins[i], { opacity: 1, y: 0, duration: .04, ease: 'back.out(2.4)' }, at + .06);
      });
      t.to({}, { duration: .04 }, .96);
      return function () { gsap.set(pins, { clearProps: 'all' }); gsap.set('.office', { clearProps: 'all' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
