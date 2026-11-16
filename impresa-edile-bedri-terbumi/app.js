/* Bedri Terbumi: fanned cards hero, reveals, accordion, before/after scene, form. */
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

  /* accordion: one open at a time */
  var accs = $$('.acc__i');
  accs.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) accs.forEach(function (o) { if (o !== d) o.open = false; }); }); });

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

  /* hero: stacked cards fan out (D) */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span'), cards = $$('.fan__c'), fan = $('.fan');
  if (hasG && !reduce) {
    var g = window.gsap;
    var fr = fan.getBoundingClientRect();
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .5, stagger: .06 }, .2);
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dx = (fr.left + fr.width / 2) - (r.left + r.width / 2), dy = (fr.top + fr.height / 2) - (r.top + r.height / 2);
      var rot = g.getProperty(c, 'rotation');
      g.set(c, { x: dx, y: dy, rotation: (i % 2 ? 7 : -7) + i, scale: .84, opacity: 0 });
      tl.to(c, { opacity: 1, scale: .9, duration: .25, ease: 'power1.out' }, .05 + i * .06);
      tl.to(c, { x: 0, y: 0, rotation: rot, scale: 1, duration: .85, ease: 'expo.out' }, .45 + i * .05);
    });
    g.to('.fan__c--1 img', { scale: 1.06, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      fan.addEventListener('mousemove', function (e) { var b = fan.getBoundingClientRect(), mx = (e.clientX - b.left) / b.width - .5, my = (e.clientY - b.top) / b.height - .5;
        cards.forEach(function (c, i) { g.to(c, { x: mx * (8 + i * 6), y: my * (8 + i * 6), duration: .6, overwrite: 'auto' }); }); });
      fan.addEventListener('mouseleave', function () { cards.forEach(function (c) { g.to(c, { x: 0, y: 0, duration: .6, overwrite: 'auto' }); }); });
    }
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* signature scene: before / after scrub */
  var caps = $$('.cap li'), cur = -1;
  function cap(k) { if (k === cur) return; cur = k; caps.forEach(function (l, i) { l.classList.toggle('is-on', i === k); }); }
  function scene() {
    if (reduce) { cap(2); return; }
    cap(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone, ba = $('.ba');
      gsap.set('.ba__after', { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set('.ba__line', { x: 0, left: 0 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .6,
        onUpdate: function (s) { cap(s.progress < .4 ? 0 : s.progress < .72 ? 1 : 2); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .from(ba, { scale: .9, opacity: 0, duration: .4 }, 0)
        .from('.cap', { y: 20, opacity: 0, duration: .3 }, .15)
        .to('.ba__after', { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: 'none' }, .6)
        .fromTo('.ba__line', { x: 0 }, { x: function () { return ba.offsetWidth - 3; }, duration: 2, ease: 'none' }, .6)
        .to('.ba__line', { opacity: 0, duration: .2 }, 2.6)
        .to({}, { duration: .4 });
      return function () { gsap.set(['.ba__after', '.ba__line'], { clearProps: 'all' }); };
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
