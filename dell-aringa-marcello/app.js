/* Arch. Dell'Aringa: fanned photo cards hero, reveals, pinned 'where the heat escapes' scene, form. */
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }


  /* scene steps */
  var sts = $$('.as'), lbl = $('.scale__l'), CL = ['G', 'E', 'C', 'B'];
  function setStep(n) { sts.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); }); if (lbl) lbl.textContent = CL[n]; }

  if (!hasG || reduce) { setStep(3); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the four cards start as one pile in the middle and fan out into the collage (about 1.4 s) */
  var fan = $('.fan'), cards = $$('.fan__c'), fr = fan.getBoundingClientRect();
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__title .ln > span', { yPercent: 112, duration: .7, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .2);
  cards.forEach(function (c, i) {
    var r = c.getBoundingClientRect();
    var dx = (fr.left + fr.width / 2) - (r.left + r.width / 2), dy = (fr.top + fr.height / 2) - (r.top + r.height / 2);
    tl.from(c, { x: dx, y: dy + 30, rotation: [-8, 6, -3, 9][i], scale: .86, duration: .9, ease: 'power4.out' }, .05 + (3 - i) * .06);
  });
  tl.from(cards, { opacity: 0, duration: .25, stagger: .05 }, 0);
  if (window.matchMedia('(min-width: 761px)').matches) {
    cards.forEach(function (c, i) { gsap.to(c, { yPercent: [-10, 12, -6, 16][i], ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); });
  }

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone, row = phone ? 29 : 38;
      gsap.set('.h-heat .hh', { opacity: 1 });
      gsap.set('.h-coat rect', { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set('.h-roofins', { opacity: 0, y: -14 });
      gsap.set('.h-win2', { opacity: 0 });
      gsap.set('.h-pump', { opacity: 0, scale: .6, transformOrigin: '50% 50%' });
      gsap.set('.scale__ptr', { y: row * 6 });
      if (lbl) lbl.textContent = 'G';
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.ape', start: 'top top', end: phone ? '+=130%' : '+=230%', pin: true, scrub: .6,
          onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4))); } }
      });
      t.from('.ape__text .mono, .ape__text .h2', { y: 26, opacity: 0, duration: .3, stagger: .06, ease: 'power2.out' }, 0)
        .from('.house', { y: 24, duration: .4, ease: 'power2.out' }, 0)
        .to('.h-coat rect', { scaleX: 1, duration: .6, ease: 'power2.out' }, 1)
        .to('.hh--w', { opacity: 0, duration: .5 }, 1.2)
        .to('.scale__ptr', { y: row * 4, duration: .6 }, 1.1)
        .to('.h-roofins', { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, 2)
        .to('.h-win2', { opacity: 1, duration: .4 }, 2.2)
        .to('.hh--r, .hh--f', { opacity: 0, duration: .5 }, 2.2)
        .to('.scale__ptr', { y: row * 2, duration: .6 }, 2.1)
        .to('.h-pump', { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.6)' }, 3)
        .to('.scale__ptr', { y: row * 1, duration: .5 }, 3.1)
        .to({}, { duration: .4 });
      return function () { setStep(0); };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
