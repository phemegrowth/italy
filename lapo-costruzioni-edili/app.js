/* Lapo Costruzioni Edili: drawn frame hero, reveals, timber house assembling from an exploded view, form. */
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

  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 6) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete cosa volete costruire.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the frame draws edge by edge, the photo fades in inside, the title rises (about 1.4 s) */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 110, duration: .8, stagger: .1 }, 0)
      .from('.hero .hl > span', { yPercent: 100, opacity: 0, duration: .6, stagger: .07 }, .2)
      .from('.fl--t', { scaleX: 0, transformOrigin: 'left', duration: .5, ease: 'power2.inOut' }, 0)
      .from('.fl--r', { scaleY: 0, transformOrigin: 'top', duration: .4, ease: 'power2.inOut' }, .35)
      .from('.fl--b', { scaleX: 0, transformOrigin: 'right', duration: .5, ease: 'power2.inOut' }, .6)
      .from('.fl--l', { scaleY: 0, transformOrigin: 'bottom', duration: .4, ease: 'power2.inOut' }, .9)
      .from('.dim', { opacity: 0, duration: .4, stagger: .1 }, .8)
      .from('.hero__pic', { opacity: 0, duration: .9 }, .25)
      .from('.hero__pic img', { scale: 1.12, duration: 1.8, ease: 'power2.out' }, .25);
  }

  function build() {
    if (!reduce) gsap.to('.hero__pic img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    var sc = $('.scene'); if (!sc || reduce) return;
    var pts = $$('.pt');
    function setP(k) { pts.forEach(function (p, i) { p.classList.toggle('is-on', i === k); }); }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live'); setP(0);
      var f = ctx.conditions.phone ? .7 : 1;
      var from = [
        ['.hp--0', { y: 80 * f, opacity: 0 }],
        ['.hp--1', { y: -170 * f, opacity: 0 }],
        ['.hp--2', { y: -230 * f, opacity: 0 }],
        ['.hp--3', { x: 190 * f, y: -30 * f, opacity: 0 }],
        ['.hp--4', { x: 260 * f, y: -60 * f, opacity: 0 }]
      ];
      from.forEach(function (p) { gsap.set(p[0], p[1]); });
      gsap.set('.ground', { scaleX: 0, transformOrigin: '50% 50%' });
      var t = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=130%' : '+=250%', pin: true, scrub: .6,
        onUpdate: function (s) { setP(Math.min(4, Math.floor(s.progress * 5 * 0.999))); } } });
      t.to('.ground', { scaleX: 1, duration: .5 }, 0);
      from.forEach(function (p, i) { t.to(p[0], { x: 0, y: 0, opacity: 1, duration: .8 }, .2 + i); });
      t.to({}, { duration: .4 });
      return function () { sc.classList.remove('is-live'); pts.forEach(function (p, i) { p.classList.toggle('is-on', i === 0); }); gsap.set('.hp, .ground', { clearProps: 'all' }); };
    });
  }

  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
