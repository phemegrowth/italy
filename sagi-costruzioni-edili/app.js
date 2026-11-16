/* SAGI: type-first hero, reveals, pour scene, drag strip, form. */
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
  var strip = $('.drag');
  if (strip && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
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

  /* hero: type first (C) */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (hasG && !reduce) {
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero__word span', { yPercent: 105, duration: .8, stagger: .07 }, 0)
      .from(lines, { yPercent: 110, duration: .7, stagger: .08, ease: 'power3.out' }, .2)
      .from(hls, { y: 16, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' }, .35)
      .from('.hstrip__i', { xPercent: 70, opacity: 0, duration: 1, stagger: .09, ease: 'expo.out' }, .3)
      .from('.hstrip__i img', { scale: 1.25, duration: 1.4, stagger: .09, ease: 'power2.out' }, .3);
    var ST0 = window.ScrollTrigger;
    if (ST0) { g.registerPlugin(ST0); g.to('.hero__word', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); }
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* signature scene: material stack, layers rise with a wavy edge */
  var lvs = $$('.lv li'), sc = $('[data-sc]'), cur = -1;
  function lv(k) { if (k === cur) return; cur = k; lvs.forEach(function (l, i) { l.classList.toggle('is-on', i === k); }); if (sc) sc.textContent = '0' + (k + 1); }
  function scene() {
    if (reduce) { lv(3); return; }
    lv(0);
    var layers = $$('.pour__l').slice(1);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      layers.forEach(function (l) { gsap.set(l, { yPercent: 100 }); gsap.set($('img', l), { yPercent: -100 }); });
      gsap.set('.pour__bar i', { scaleY: .25 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .6,
        onUpdate: function (s) { lv(Math.max(0, Math.min(3, Math.floor((s.progress - .08) * 4.4)))); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .from('.pour', { clipPath: 'inset(0% 0% 100% 0%)', duration: .5, ease: 'power2.out' }, 0)
        .from('.lv', { y: 20, opacity: 0, duration: .3 }, .15);
      layers.forEach(function (l, i) {
        var t = .8 + i * 1;
        tl.to(l, { yPercent: 0, duration: .8, ease: 'power1.inOut' }, t)
          .to($('img', l), { yPercent: 0, duration: .8, ease: 'power1.inOut' }, t)
          .to('.pour__bar i', { scaleY: .25 * (i + 2), duration: .8, ease: 'none' }, t);
      });
      tl.to({}, { duration: .4 });
      return function () { gsap.set(layers.concat($$('.pour__l img')), { clearProps: 'all' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
