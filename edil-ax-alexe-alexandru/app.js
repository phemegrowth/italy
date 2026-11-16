/* Edil Ax: type-first hero with photo strip, reveals, before/after scrub scene, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('reduced');
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

  /* count-up: the Google rating only */
  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    el.textContent = (0).toFixed(dec).replace('.', ',');
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1100, 1); var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
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

    /* scene captions */
  var caps = $$('.cap');
  function setCap(n) { caps.forEach(function (c, i) { c.classList.toggle('is-on', i === n); }); }

  if (!hasG || reduce) return;

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: the name slides together, lines rise, strip comes in from the right (about 1.2 s) */
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.mega__l', { xPercent: -40, opacity: 0, duration: .9 }, 0)
    .from('.mega__r', { xPercent: 60, opacity: 0, duration: .9 }, .05)
    .from('.hero__line .ln > span', { yPercent: 110, duration: .7, stagger: .08, ease: 'power3.out' }, .2)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07, ease: 'power3.out' }, .35)
    .from('.card', { xPercent: 60, opacity: 0, duration: 1, stagger: .08 }, .2);

  function strip() {
    var track = $('.strip__track');
    gsap.to(track, {
      x: function () { return -Math.max(0, track.scrollWidth - window.innerWidth * 0.8); }, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6, invalidateOnRefresh: true }
    });
  }

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var stage = $('.ba__stage');
      gsap.set(stage, { '--w': '0%' });
      setCap(0);
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.ba', start: 'top top', end: phone ? '+=120%' : '+=220%', pin: true, scrub: .5,
          onUpdate: function (s) { setCap(s.progress < .34 ? 0 : s.progress < .72 ? 1 : 2); }
        }
      });
      t.from(stage, { scale: .94, opacity: .4, duration: .5, ease: 'power2.out' }, 0)
        .to(stage, { '--w': '100%', duration: 2.4, ease: 'power1.inOut' }, .5)
        .from('.ba__after', { scale: 1.08, duration: 2.4 }, .5)
        .to({}, { duration: .4 });
      return function () { gsap.set(stage, { clearProps: '--w' }); setCap(0); };
    });
  }

  var go = function () { strip(); scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
