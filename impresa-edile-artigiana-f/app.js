/* F.C.M. Faggion: type-first hero with photo strip, reveals, blueprint-to-building scene, form. */
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

  /* scene readout */
  var pctEl = $('[data-pct]'), stEl = $('[data-stage]');
  var stages = ['Il disegno', 'Le fondamenta', 'I muri', 'Il tetto', 'La casa finita'];
  function readout(p) {
    if (pctEl) pctEl.textContent = Math.round(p * 100);
    if (stEl) stEl.textContent = stages[p >= .99 ? 4 : p < .4 ? 0 : p < .6 ? 1 : p < .8 ? 2 : 3];
  }

  if (!hasG || reduce) { readout(1); return; }
  doc.classList.add('has-g');

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero C: the name rises, lines follow, the photo strip slides in from the right (about 1.3 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.ln--giant > span', { yPercent: 105, duration: .8 }, 0)
    .from('.ln--sub > span', { yPercent: 110, duration: .7, stagger: .08 }, .15)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .25)
    .from('.strip__it', { xPercent: 60, opacity: 0, duration: 1.1, stagger: .09, ease: 'power4.out' }, .1)
    .from('.strip__it img', { scale: 1.25, duration: 1.4, ease: 'power2.out' }, .1);

  function strip() {
    gsap.to('.strip', { x: function () { return -Math.min(260, window.innerWidth * .3); }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
  }

  function scene() {
    var paths = $$('.bld__draw path');
    paths.forEach(function (p) { var L = 1200; try { L = Math.ceil(p.getTotalLength()) + 2; } catch (e) {} p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      readout(0);
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.scene', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .5,
          onUpdate: function (s) { readout(Math.min(1, s.progress / .95)); }
        }
      });
      t.from('.scene__text > *', { y: 30, opacity: 0, duration: .4, stagger: .08, ease: 'power2.out' }, 0)
        .to(paths, { strokeDashoffset: 0, duration: 1.6, stagger: .12 }, .1)
        .to('.bld__photo', { clipPath: 'inset(80% 0 0 0)', duration: .6 }, 2.2)
        .to('.bld__photo', { clipPath: 'inset(45% 0 0 0)', duration: .7 }, 2.8)
        .to('.bld__photo', { clipPath: 'inset(15% 0 0 0)', duration: .7 }, 3.5)
        .to('.bld__photo', { clipPath: 'inset(0% 0 0 0)', duration: .5 }, 4.2)
        .to('.bld__draw path', { opacity: .25, duration: .5 }, 4.2)
        .to({}, { duration: .3 });
      return function () { readout(0); };
    });
  }

  var go = function () { strip(); scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
