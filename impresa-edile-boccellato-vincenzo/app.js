/* Boccellato: blueprint-frame hero, ticker, reveals, pinned services list that drives the photo, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero'), line = null, how = null;
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
    if (line && how && !reduce) {
      var r = how.getBoundingClientRect(), p = (window.innerHeight * 0.85 - r.top) / (r.height * 0.7);
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
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
      var sib = $$(':scope > .r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il lavoro.');
      if (!ok) e.preventDefault();
    });
  }


  /* services list <-> photo */
  var items = $$('.sl__i'), pics = $$('.ph__i'), cnt = $('.ph__count b'), cur = -1;
  function setActive(n) {
    if (n === cur) return; cur = n;
    items.forEach(function (x, i) { x.classList.toggle('is-on', i === n); });
    pics.forEach(function (x, i) { x.classList.toggle('is-on', i === n); });
    if (cnt) cnt.textContent = ('0' + (n + 1)).slice(-2);
  }
  items.forEach(function (x, i) { x.addEventListener('click', function () { setActive(i); }); });

  if (!hasG || reduce) { setActive(0); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the drawing frame draws itself, then the photo opens inside it (about 1.4 s) */
  gsap.set('.fl', { strokeDasharray: 1000, strokeDashoffset: 1000 });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 112, duration: .7, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .2)
    .to('.fl', { strokeDashoffset: 0, duration: .9, stagger: .08, ease: 'power2.inOut' }, 0)
    .fromTo('.frame__pic', { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'power4.inOut' }, .3)
    .from('.frame__pic img', { scale: 1.25, duration: 1.3, ease: 'power2.out' }, .3)
    .from('.frame__dim, .frame__corner', { opacity: 0, duration: .4, stagger: .08 }, .9);
  gsap.to('.frame__pic img', { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.coppi img', { yPercent: -18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.coppi', start: 'top bottom', end: 'bottom top', scrub: true } });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone, N = items.length;
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.list', start: 'top top', end: phone ? '+=170%' : '+=260%', pin: true, scrub: .4,
          onUpdate: function (s) { setActive(Math.min(N - 1, Math.floor(s.progress * N * 0.999))); } }
      });
      t.from('.list__left .tag, .list__left .h2', { y: 26, opacity: 0, duration: .4, stagger: .06, ease: 'power2.out' }, 0)
        .from('.sl__i', { x: -20, opacity: 0, duration: .4, stagger: .05, ease: 'power2.out' }, .1)
        .from('.ph', { y: 30, duration: .5, ease: 'power2.out' }, 0)
        .to({}, { duration: 3 });
      return function () { setActive(0); };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
