/* Edil Ivan Monza: number-led hero, reveals, sticky room list scene, form. */
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

  /* form */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete cosa volete rifare.');
      if (!ok) e.preventDefault();
    });
  }

  /* hero: number-led (G) */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span'), num = $('[data-count]');
  if (hasG && !reduce) {
    var g = window.gsap, o = { v: 0 };
    num.textContent = '0,0';
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from(hls, { y: 16, opacity: 0, duration: .5, stagger: .06 }, .2)
      .from('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 14px 14px)', duration: 1.1, ease: 'power3.inOut' }, .05)
      .from('.arch__img', { scale: 1.2, duration: 1.6, ease: 'power2.out' }, .05)
      .to(o, { v: 5, duration: 1.2, ease: 'power2.out', onUpdate: function () { num.textContent = o.v.toFixed(1).replace('.', ','); } }, .2)
      .from('.score__stars i', { scale: 0, duration: .3, stagger: .08, ease: 'back.out(2)' }, .5);
    g.to('.arch__img', { yPercent: -4, scale: 1.04, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* signature scene: sticky list drives the photo */
  var imgs = $$('.rooms__i'), items = $$('.rlist li'), rc = $('[data-rc]'), cur = -1;
  function show(k) {
    if (k === cur) return; cur = k;
    imgs.forEach(function (im, i) { im.classList.toggle('is-on', i === k); });
    items.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    if (rc) rc.textContent = '0' + (k + 1);
  }
  function scene() {
    if (reduce) { show(0); return; }
    show(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=150%' : '+=260%', pin: true, scrub: .5,
        onUpdate: function (s) { show(Math.max(0, Math.min(4, Math.floor(s.progress * 5)))); } } });
      tl.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .from('.rooms', { clipPath: 'inset(12% 12% 12% 12% round 14px)', duration: .6, ease: 'power2.out' }, 0)
        .from('.rlist', { y: 24, opacity: 0, duration: .3 }, .15)
        .to({}, { duration: 3 });
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
