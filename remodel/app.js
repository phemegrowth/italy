/* Remodel: blueprint frame hero, service swap, plan-to-bathroom scene, drag strip, form. */
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

  /* services: the item in the middle of the screen (or hovered) picks the photo */
  var sItems = $$('.svc__list li'), sPics = $$('.svc__pic .sp'), sCur = -1;
  function sPick(k) {
    if (k === sCur) return; sCur = k;
    sItems.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    sPics.forEach(function (im, i) { im.classList.toggle('is-on', i === k); });
  }
  sPick(0);
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) sPick(+x.target.dataset.i); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sItems.forEach(function (li) { sio.observe(li); });
  }
  sItems.forEach(function (li) { li.addEventListener('mouseenter', function () { sPick(+li.dataset.i); }); });

  /* drag strip */
  var strip = $('.strip'), prog = $('.strip__prog i');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    var upd = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; prog.style.transform = 'scaleX(' + (0.15 + p * 0.85) + ')'; };
    strip.addEventListener('scroll', upd, { passive: true }); upd();
  }

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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  /* scene helpers (also used without GSAP) */
  var steps = $$('.steps li'), pct = $('[data-pct]'), barI = $('.plan__bar i'), stCur = -1;
  function stepAt(k) {
    if (k === stCur) return; stCur = k;
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
  }
  function meter(p) { if (pct) pct.textContent = Math.round(p * 100); if (barI) barI.style.transform = 'scaleX(' + p + ')'; }

  if (!hasG) { if (pct) pct.textContent = '100'; return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: frame draws, photo opens inside it, lines rise, pins pop */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (!reduce) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 112, duration: .75, stagger: .09 }, 0)
      .from(hls, { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
      .from('.frame__l--t, .frame__l--b', { scaleX: 0, duration: .7, ease: 'power2.inOut' }, 0)
      .from('.frame__l--l, .frame__l--r', { scaleY: 0, duration: .7, ease: 'power2.inOut' }, .1)
      .from('.frame__tick', { scale: 0, duration: .4, ease: 'back.out(2.5)', stagger: .08 }, .45)
      .from('.frame__tab', { y: 8, opacity: 0, duration: .4 }, .5)
      .from('.frame__img', { clipPath: 'inset(0% 0% 100% 0%)', duration: .9, ease: 'power3.inOut' }, .2)
      .from('.frame__img img', { scale: 1.18, duration: 1.3 }, .2)
      .from('.pin', { scale: .6, opacity: 0, duration: .45, ease: 'back.out(2)', stagger: .12 }, 1.0);
    gsap.to('.frame__img img', { scale: 1.06, xPercent: -1.5, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
    gsap.to('.frame', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function scene() {
    if (reduce) { stepAt(steps.length - 1); meter(1); steps.forEach(function (li) { li.classList.add('is-done'); }); return; }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone, n = steps.length;
      var paths = $$('.plan__svg path');
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      var t = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .6, anticipatePin: 1,
        onUpdate: function (s) { var p = s.progress; stepAt(Math.min(n - 1, Math.floor(p * n * 0.999))); meter(Math.min(1, Math.max(0, (p - 0.05) / 0.85))); } } });
      t.from('.plan', { opacity: .25, scale: .94, duration: .1 }, 0)
        .to('.pl--wall path', { strokeDashoffset: 0, duration: .14, stagger: .03 }, .08)
        .to('.pl--win path, .pl--door path', { strokeDashoffset: 0, duration: .1 }, .2)
        .to('.pl--fix path', { strokeDashoffset: 0, duration: .16, stagger: .02 }, .26)
        .to('.pl--dim path', { strokeDashoffset: 0, duration: .08 }, .36)
        .from('.pl__t', { opacity: 0, y: 6, duration: .06, stagger: .015 }, .4)
        .fromTo('.plan__photo', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .34, ease: 'none' }, .52)
        .fromTo('.plan__photo img', { scale: 1.12 }, { scale: 1, duration: .4, ease: 'none' }, .52)
        .to('.plan__svg', { opacity: 0, duration: .1 }, .8)
        .from('.plan__meter', { y: 20, opacity: 0, duration: .06 }, .04)
        .to({}, { duration: .06 }, .94);
      return function () { gsap.set(paths, { clearProps: 'all' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
