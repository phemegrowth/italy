/* Treviso Restauri: cinematic hero (Ken Burns in CSS), reveals, pinned before/after scrub, form. */
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


  /* scene captions */
  var bcs = $$('.bc');
  function setStep(n) { bcs.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); }); }

  if (!hasG || reduce) { setStep(2); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: photo opens from a band, headline lines rise (about 1.2 s); the slow Ken Burns runs in CSS */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.hero__pic', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' }, 0)
    .from('.hero__title .ln > span', { yPercent: 112, duration: .7, stagger: .09 }, .15)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .3)
    .from('.hero__card', { y: 80, rotation: 10, opacity: 0, duration: .9, ease: 'back.out(1.4)' }, .35);
  gsap.to('.hero__pic', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.firm__big', { xPercent: -8 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.firm', start: 'top bottom', end: 'bottom top', scrub: true } });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone, st = { p: 0 };
      var vis = $('.ba__vis'), bef = $('.ba__before'), ln = $('.ba__line');
      function draw() {
        var p = st.p; bef.style.clipPath = 'inset(0 0 0 ' + (p * 100).toFixed(2) + '%)';
        ln.style.transform = 'translateX(' + (p * vis.clientWidth - 1.5).toFixed(1) + 'px)';
      }
      draw();
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.ba', start: 'top top', end: phone ? '+=120%' : '+=200%', pin: true, scrub: .5,
          onUpdate: function (s) { setStep(s.progress < .3 ? 0 : s.progress < .78 ? 1 : 2); } }
      });
      t.from('.ba__text .kick, .ba__text .h2', { y: 26, opacity: 0, duration: .25, stagger: .06, ease: 'power2.out' }, 0)
        .from('.ba__vis', { y: 30, duration: .3, ease: 'power2.out' }, 0)
        .to(st, { p: 1, duration: 1.4, ease: 'power1.inOut', onUpdate: draw }, .35)
        .to({}, { duration: .3 });
      return function () { st.p = 1; draw(); setStep(0); };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
