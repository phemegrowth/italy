/* Casa-in: curtain hero, reveals, door scene, form. */
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
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
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
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  var dss = $$('.ds');
  function setStep(n) { dss.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); }); }

  if (!hasG || reduce) { doc.classList.add('is-ready'); setStep(3); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the red panel (their sign colour) lifts off the photo, the house mark pops once (about 1.3 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 16, opacity: 0, duration: .55, stagger: .07 }, .18)
    .from('.curtain svg', { scale: .4, opacity: 0, rotation: -20, duration: .5, ease: 'back.out(2)' }, 0)
    .to('.curtain', { scaleY: 0, duration: .8, ease: 'power4.inOut' }, .5)
    .from('.hero__pic img', { scale: 1.2, duration: 1.5, ease: 'power2.out' }, .5)
    .from('.hero__tag', { y: 16, opacity: 0, duration: .45 }, 1.05);
  gsap.to('.hero__pic img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  function door() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var t = gsap.timeline({
        scrollTrigger: { trigger: '.door', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .5,
          onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4.2))); } }
      });
      t.from('.door__text .kicker, .door__text .h2', { y: 28, opacity: 0, duration: .4, stagger: .08 }, 0)
        .from('.portal', { y: 50, opacity: 0, duration: .5 }, 0)
        .from('.portal__key', { y: 30, opacity: 0, duration: .4 }, .4)
        .to('.portal__key', { rotation: 90, duration: .6, ease: 'power1.inOut' }, 1)
        .to('.portal__key', { opacity: 0, y: 20, duration: .3 }, 1.6)
        .to('.leaf--l', { rotationY: -100, duration: 1.6, ease: 'power2.inOut' }, 1.6)
        .to('.leaf--r', { rotationY: 100, duration: 1.6, ease: 'power2.inOut' }, 1.6)
        .from('.portal__in img', { scale: 1.25, duration: 2, ease: 'power1.out' }, 1.6)
        .to('.leaf', { opacity: 0, duration: .4 }, 3)
        .to({}, { duration: .5 });
      return function () { setStep(0); };
    });
  }

  var go = function () { door(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
