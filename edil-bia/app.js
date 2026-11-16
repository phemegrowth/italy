/* Edil Bia: curtain hero, reveals, wall built layer by layer, drag strip, process line, form. */
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
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete che lavoro è.');
      if (!ok) e.preventDefault();
    });
  }

  /* drag strip (mouse); touch scrolls natively */
  var strip = $('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* hero: the yellow panel lifts, the photo settles, the EB stamp drops in (about 1.3 s) */
  var curtain = $('.curtain');
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 108, duration: .7, stagger: .09 }, 0)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .55, stagger: .07 }, .15)
      .fromTo(curtain, { scaleY: 1 }, { scaleY: 0, duration: .9, ease: 'power4.inOut' }, .05)
      .from('.hero__pic img', { scale: 1.16, duration: 1.6, ease: 'power2.out' }, .05)
      .from('.hero__stamp b', { y: -60, opacity: 0, duration: .6, stagger: .1, ease: 'back.out(1.8)' }, .7);
  } else if (curtain) { curtain.style.transform = 'scaleY(0)'; }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var names = ['Struttura', 'Impianti', 'Isolante', 'Lastre', 'Finitura'];
  function scene() {
    var sc = $('.scene'), lys = $$('.ly'), nEl = $('[data-n]'), nameEl = $('[data-name]');
    function setStep(k) {
      lys.forEach(function (l, i) { l.classList.toggle('is-on', i === k); l.classList.toggle('is-done', i < k); });
      nEl.textContent = k + 1; nameEl.textContent = names[k];
    }
    if (reduce) { setStep(4); return; }
    var draws = $$('.wall .dr');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live');
      draws.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.set('.wall .box', { opacity: 0 });
      gsap.set('.wall .wool', { opacity: 0, x: -40 });
      gsap.set('.wall .bd', { y: 420 });
      gsap.set('.wall .boards .plate', { opacity: 0 });
      gsap.set('.wall .tape', { opacity: 0 });
      gsap.set('.wall .paint', { opacity: 0 });
      gsap.set('.wall .plate--f', { opacity: 0 });
      setStep(0);
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=260%', pin: true, scrub: .6,
        onUpdate: function (s) { setStep(Math.min(4, Math.floor(s.progress * 5 * 0.999))); } } });
      t.to('.wall .studs .dr', { strokeDashoffset: 0, duration: .14, stagger: .02 }, 0)
        .to('.wall .mep .dr', { strokeDashoffset: 0, duration: .12, stagger: .02 }, .2)
        .to('.wall .box', { opacity: 1, duration: .03, stagger: .02 }, .3)
        .to('.wall .wool', { opacity: 1, x: 0, duration: .14 }, .42)
        .to('.wall .bd', { y: 0, duration: .14, stagger: .03, ease: 'power2.out' }, .6)
        .to('.wall .boards .plate', { opacity: 1, duration: .03 }, .74)
        .to('.wall .tape', { opacity: 1, duration: .05 }, .8)
        .fromTo('.wall .paint', { opacity: 0 }, { opacity: 1, duration: .12 }, .86)
        .to('.wall .plate--f', { opacity: 1, duration: .03 }, .95)
        .to({}, { duration: .02 }, .98);
      return function () { sc.classList.remove('is-live'); draws.forEach(function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); };
    });
  }

  function line() {
    var l = $('.how__line span'); if (!l) return;
    if (reduce) { l.style.setProperty('--p', 1); return; }
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.how__list', start: 'top 80%', end: 'bottom 55%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { scene(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
