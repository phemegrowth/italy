/* Impresa Edile Gertosio: cinematic hero, reveals, blueprint-to-building scene, process line, form. */
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

  /* scene state helpers */
  var phs = $$('.ph'), pct = $('[data-pct]');
  function setPhase(n, p) {
    phs.forEach(function (l, i) { l.classList.toggle('is-on', i === n); l.classList.toggle('is-done', i < n); });
    if (pct) pct.textContent = Math.round(p * 100);
  }

  if (!hasG || reduce) { setPhase(3, 1); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: panel lines rise (about 1.1 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__panel', { y: 40, opacity: 0, duration: .6 }, 0)
    .from('.hero__title .ln > span', { yPercent: 110, duration: .7, stagger: .08 }, .12)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .3)
    .from('.hero__tag', { opacity: 0, x: 20, duration: .5 }, .6);

  /* desktop: hero photo drifts slower than the page */
  gsap.matchMedia().add('(min-width: 761px)', function () {
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var g = function (k) { return $$('.dl[data-g="' + k + '"], [data-g="' + k + '"] .dl'); };
      gsap.set('.dl', { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set('.bp__photo', { clipPath: 'inset(100% 0 0 0)' });
      gsap.set('.bp__lbl', { opacity: 0 });
      setPhase(0, 0);
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=260%', pin: true, scrub: .5,
          onUpdate: function (s) { var p = s.progress; setPhase(Math.min(3, Math.floor(p * 4)), Math.min(1, p * 1.08)); }
        }
      });
      t.from('.bp__frame', { y: 50, opacity: 0, duration: .5, ease: 'power2.out' }, 0)
        .from('.bp__grid', { opacity: 0, duration: .5 }, .1)
        .to('.bp__lbl', { opacity: 1, duration: .3 }, .4);
      var cuts = [67, 48, 43, 0];
      for (var k = 0; k < 4; k++) {
        var at = .5 + k * 1.1;
        t.to(g(k), { strokeDashoffset: 0, duration: .6, stagger: .08 }, at)
          .to('.bp__photo', { clipPath: 'inset(' + cuts[k] + '% 0 0 0)', duration: .45 }, at + .55);
      }
      t.to('.bp__svg', { opacity: .35, duration: .5 }, 4.9)
        .to({}, { duration: .4 });
      return function () { setPhase(3, 1); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
