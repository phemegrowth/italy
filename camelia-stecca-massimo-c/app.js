/* Camelia: curtain hero, reveals, blueprint scene, drag strip, steps line, form. */
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
    hdr.classList.toggle('is-small', y > 40);
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

  /* magnetic buttons (desktop only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.16 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* drag strip */
  var strip = $('.strip');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
  }

  /* steps line */
  var steps = $('.steps');
  function stepLine() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true }); stepLine();

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

  /* hero: curtain wipe (H) */
  var curtain = $('.curtain'), lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (hasG && !reduce) {
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .5, stagger: .06 }, .2)
      .from('.curtain svg', { rotate: -90, scale: .6, duration: .55, ease: 'back.out(1.6)' }, 0)
      .to(curtain, { yPercent: -101, duration: .8, ease: 'power3.inOut' }, .45)
      .from('.hero__img', { scale: 1.18, duration: 1.6, ease: 'power2.out' }, .45)
      .add(function () { curtain.classList.add('is-gone'); });
    g.to('.hero__img', { scale: 1.06, duration: 20, ease: 'none', delay: 2.1, yoyo: true, repeat: -1 });
  } else if (curtain) { curtain.classList.add('is-gone'); }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* signature scene: blueprint to building */
  var lis = $$('.fl li'), pct = $('[data-pct]');
  function setL(k) { lis.forEach(function (l, i) { l.classList.toggle('is-on', i === k); l.classList.toggle('was', i < k); }); }
  function scene() {
    var paths = $$('.bp-l'), photo = $('.bp__photo');
    if (reduce) { setL(4); if (pct) pct.textContent = '100'; return; }
    setL(0);
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(photo, { clipPath: 'polygon(0% 100%, 50% 100%, 100% 100%, 100% 100%, 0% 100%)' });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (s) { var p = s.progress; setL(Math.max(0, Math.min(4, Math.floor(p * 5.2 - .05)))); if (pct) pct.textContent = Math.round(Math.max(0, (p - .2) / .75) * 100 > 100 ? 100 : Math.max(0, (p - .2) / .75) * 100); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .from('.fl', { y: 20, opacity: 0, duration: .3 }, .1)
        .to(paths, { strokeDashoffset: 0, duration: 1, stagger: .06, ease: 'none' }, .2)
        .to(photo, { clipPath: 'polygon(0% 79%, 50% 79%, 100% 79%, 100% 100%, 0% 100%)', duration: .6, ease: 'power1.inOut' }, 1.9)
        .to(photo, { clipPath: 'polygon(0% 57%, 50% 57%, 100% 57%, 100% 100%, 0% 100%)', duration: .6, ease: 'power1.inOut' }, 2.6)
        .to(photo, { clipPath: 'polygon(0% 36%, 50% 36%, 100% 36%, 100% 100%, 0% 100%)', duration: .6, ease: 'power1.inOut' }, 3.3)
        .to(photo, { clipPath: 'polygon(0% 14.8%, 50% 0%, 100% 14.8%, 100% 100%, 0% 100%)', duration: .7, ease: 'power1.inOut' }, 4.0)
        .to('.bp__svg', { opacity: .35, duration: .5 }, 4.3)
        .to({}, { duration: .4 });
      return function () { gsap.set(photo, { clearProps: 'clipPath' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
