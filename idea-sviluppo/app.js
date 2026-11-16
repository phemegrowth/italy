/* Idea e Sviluppo: cinematic hero, service photo swap, pinned map scene, drawn steps line, form. */
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
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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

  /* services: active row swaps the photo (hover on desktop, scroll position everywhere) */
  var rows = $$('.svc__list li'), pics = $$('.svc__pics img');
  function svcOn(i) {
    rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { svcOn(i); }); });
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) svcOn(rows.indexOf(x.target)); });
    }, { rootMargin: '-40% 0px -45% 0px' });
    rows.forEach(function (r) { io2.observe(r); });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  /* map scene + steps line */
  var steps = $$('.scene__steps li'), countEl = $('.scene__count b');
  function stepOn(i) {
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    if (countEl) countEl.textContent = '0' + (i + 1);
  }
  if (!hasG || reduce) { steps.forEach(function (s) { s.classList.add('is-on'); }); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var svg = document.querySelector('.scene__map svg');
      svg.setAttribute('viewBox', phone ? '30 70 560 445' : '0 0 600 520');
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.scene', pin: '.scene__pin', scrub: 0.6, start: 'top top',
          end: phone ? '+=130%' : '+=230%',
        },
        onUpdate: function () { var t = this.time(); stepOn(t < 1.2 ? 0 : t < 2.2 ? 1 : t < 3 ? 2 : 3); }
      });
      gsap.set('.route:not(.dash)', { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
      gsap.set('.pin, .tag', { transformOrigin: '50% 50%', transformBox: 'fill-box', scale: 0, opacity: 0 });
      gsap.set('.route.dash', { opacity: 0 });
      gsap.set('.town', { opacity: 0 });
      gsap.set('.scene__map svg', { scale: 1.06, transformOrigin: '42% 55%' });
      tl.to('.scene__map svg', { scale: 1, duration: 4 }, 0)
        .to('.t-nova', { opacity: 1, duration: .3 }, 0)
        .to('.p-nova, .tg-nova', { scale: 1, opacity: 1, duration: .35, ease: 'back.out(2)' }, .1)
        .to('.t-desio', { opacity: 1, duration: .3 }, .8)
        .set('.r1', { opacity: 1 }, .9).to('.r1', { strokeDashoffset: 0, duration: .5 }, .9)
        .to('.p-desio, .tg-desio', { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2)' }, 1.35)
        .to('.t-varedo', { opacity: 1, duration: .3 }, 1.8)
        .set('.r2', { opacity: 1 }, 1.9).to('.r2', { strokeDashoffset: 0, duration: .5 }, 1.9)
        .to('.p-varedo, .tg-varedo', { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2)' }, 2.35)
        .to('.t-monza', { opacity: 1, duration: .3 }, 2.8)
        .to('.route.dash', { opacity: 1, duration: .4 }, 2.9)
        .to('.p-monza, .tg-monza, .tg-milano', { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2)' }, 3.2)
        .to({}, { duration: .5 }, 3.5);

      if (!phone) {
        gsap.fromTo('.steps__line span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 55%', scrub: .5 } });
      }
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
