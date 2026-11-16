/* Impresa Edile Mattalia: card fan hero, reveals, exploded house scene, story line, form. */
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
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
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

  /* scene state */
  var sls = $$('.sl'), legs = $$('.exp__legend li'), now = $('[data-now]');
  function setOn(n) {
    sls.forEach(function (s, i) { s.classList.toggle('is-on', n === -1 || i === n); });
    legs.forEach(function (l, i) { l.classList.toggle('is-on', n === -1 || i === n); });
    var lg = $('.exp__legend'); if (lg) lg.classList.toggle('is-all', n === -1);
    if (now) now.textContent = n >= 0 ? (n + 1) + ' di 4 · ' + sls[n].getAttribute('data-lab') : 'Dal tetto al piano terra.';
  }

  if (!hasG || reduce) { setOn(-1); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: lines rise, cards start stacked in the middle and fan out to the collage (about 1.3 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .09 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .2)
    .from('.card', {
      x: function (i, el) { var f = el.parentElement.getBoundingClientRect(), r = el.getBoundingClientRect(); return (f.left + f.width / 2) - (r.left + r.width / 2); },
      y: function (i, el) { var f = el.parentElement.getBoundingClientRect(), r = el.getBoundingClientRect(); return (f.top + f.height / 2) - (r.top + r.height / 2) + 30; },
      rotation: function (i) { return [-7, 6, -3][i]; }, scale: .7, opacity: 0, duration: 1.1, stagger: .08, ease: 'power4.out'
    }, .05);

  /* slow drift of the cards while the hero scrolls away */
  function drift() {
    gsap.to('.card--1', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
    gsap.to('.card--2', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
    gsap.to('.card--3', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
  }

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone, k = phone ? 1 : 1.7;
      var gaps = [-30 * k, -10 * k, 10 * k, 30 * k];
      setOn(0);
      var t = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: .5,
          onUpdate: function (s) { var p = s.progress; setOn(p > .92 ? -1 : Math.min(3, Math.max(0, Math.floor((p - .12) / .2)))); }
        }
      });
      t.from('.scene__text > *', { y: 30, opacity: 0, duration: .4, stagger: .08, ease: 'power2.out' }, 0)
        .from('.sl', { opacity: 0, y: 40, duration: .5, stagger: .06, ease: 'power2.out' }, .1)
        .to('.sl', { y: function (i) { return gaps[i]; }, duration: 1, stagger: 0 }, .7)
        .to('.sl--0', { x: phone ? 0 : -14, duration: 1 }, .7)
        .to('.sl--2', { x: phone ? 0 : 14, duration: 1 }, .7)
        .to('.sl', { scale: function (i) { return 1 - Math.abs(1.5 - i) * 0.015; }, duration: 1 }, .7)
        .to({}, { duration: 2.4 })
        .to('.sl', { y: 0, x: 0, scale: 1, duration: .8 }, '>-0.2');
      return function () { setOn(0); };
    });
  }

  function line() {
    var l = $('.story__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.story__list', start: 'top 80%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { drift(); scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
