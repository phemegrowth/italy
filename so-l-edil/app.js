/* So.L.Edil: blueprint hero, reveals, wall-section scene, method line, form. */
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
  var wls = $$('.wl'), lys = $$('.layers li'), lyl = $('.layers');
  function setOn(n) {
    wls.forEach(function (w, i) { w.classList.toggle('is-on', n === -1 || i === n); });
    lys.forEach(function (l, i) { l.classList.toggle('is-on', n === -1 || i === n); });
    if (lyl) lyl.classList.toggle('is-all', n === -1);
  }

  if (!hasG || reduce) { setOn(-1); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero F: grid and frame draw in, photo opens inside the frame (about 1.4 s) */
  function prep(sel) { $$(sel).forEach(function (p) { var L = 1600; try { L = p.getTotalLength ? Math.ceil(p.getTotalLength()) + 2 : L; } catch (e) {} p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }); }
  prep('.bp__lines path'); prep('.bp__frame'); prep('.bp__ticks path');
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .1 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
    .to('.bp__lines path', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to('.bp__frame', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, .1)
    .to('.bp__ticks path', { strokeDashoffset: 0, duration: .5 }, .7)
    .fromTo('.bp__photo', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power4.inOut' }, .35)
    .from('.bp__photo img', { scale: 1.2, duration: 1.4, ease: 'power2.out' }, .35)
    .from('.bp__dim', { opacity: 0, y: 8, duration: .5 }, 1);

  function drift() {
    gsap.to('.bp__photo img', { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      setOn(0);
      var t = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=230%', pin: true, scrub: .5,
          onUpdate: function (s) { var p = s.progress; setOn(p > .9 ? -1 : Math.min(3, Math.max(0, Math.floor((p - .05) / .21)))); }
        }
      });
      t.from('.scene__text > *', { y: 30, opacity: 0, duration: .4, stagger: .08 }, 0)
        .from('.wl--0', { xPercent: -30, opacity: 0, duration: .6 }, .2)
        .from('.wl--1', { x: 200, opacity: 0, duration: .8 }, 1)
        .from('.wl--2', { x: 160, opacity: 0, duration: .8 }, 1.9)
        .from('.wl--3', { x: 120, opacity: 0, duration: .8 }, 2.8)
        .to('.wall__arrows span', { opacity: 1, duration: .3, stagger: .1 }, 3.6)
        .fromTo('.wall__arrows span', { x: -40 }, { x: 0, duration: .6, stagger: .1 }, 3.6)
        .to({}, { duration: .4 });
      return function () { setOn(0); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 80%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { drift(); scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
