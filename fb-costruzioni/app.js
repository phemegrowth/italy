/* FB Costruzioni: split hero with blue wipe, reveals, drag strip, pinned "pour" scene, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero'), line = $('.how__line span'), how = $('.how');
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

  /* drag strip (mouse); touch scrolls natively */
  var strip = $('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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

  /* scene steps */
  var sts = $$('.st'), pct = $('.slab__pct');
  function setStep(n) { sts.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); }); }

  if (!hasG || reduce) { setStep(3); if (pct) pct.textContent = '100'; return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: lines rise, the blue panel drops off the photo (about 1.3 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .7, stagger: .08 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .5, stagger: .07 }, .2)
    .fromTo('.hero__wipe', { scaleY: 1 }, { scaleY: 0, transformOrigin: 'bottom', duration: .85, ease: 'power4.inOut' }, .15)
    .from('.hero__pic img', { scale: 1.22, duration: 1.4, ease: 'power2.out' }, .15)
    .from('.hero__tag', { x: -20, opacity: 0, duration: .45 }, .9);
  gsap.to('.hero__pic img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  function scene() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.form-l, .form-r', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.form-b', { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set('.props', { opacity: 0 });
      gsap.set('.bar', { strokeDashoffset: 470 });
      gsap.set('.pour__wave', { y: 260, x: 0 });
      gsap.set('.g-level', { opacity: 0 });
      gsap.set('.g-sheen', { opacity: 0, x: 0 });
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.pour', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: true, scrub: .6,
          onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4))); if (pct) pct.textContent = Math.round(s.progress * 100); } }
      });
      t.from('.pour__text .kick, .pour__text .h2', { y: 30, opacity: 0, duration: .3, stagger: .08, ease: 'power2.out' }, 0)
        .from('.slab', { y: 30, duration: .35, ease: 'power2.out' }, 0)
        .to('.form-b', { scaleX: 1, duration: .4 }, .2)
        .to('.form-l, .form-r', { scaleY: 1, duration: .5 }, .45)
        .to('.props', { opacity: 1, duration: .3 }, .75)
        .to('.bar', { strokeDashoffset: 0, duration: .9, stagger: .06 }, 1.1)
        .to('.pour__wave', { y: -14, duration: 1.3, ease: 'power1.inOut' }, 2.2)
        .to('.pour__wave', { x: -150, duration: 1.3 }, 2.2)
        .to('.g-level', { opacity: 1, duration: .2 }, 3.5)
        .to('.g-sheen', { opacity: 1, duration: .15 }, 3.6)
        .to('.g-sheen', { x: 348, duration: .8, ease: 'power1.inOut' }, 3.6)
        .to('.g-sheen', { opacity: 0, duration: .2 }, 4.2)
        .to({}, { duration: .3 });
      return function () { setStep(0); };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
