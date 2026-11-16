/* Mayaplast: split hero, service photo swap, wall-builds-up scene, drag strip, process line, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar + process line */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero'), how = $('.how__list');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 40);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
    if (how && !reduce) {
      var r = how.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      how.style.setProperty('--lp', p.toFixed(3));
    }
  }
  if (reduce && how) how.style.setProperty('--lp', 1);
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

  /* services: active row swaps the photo (scroll on all screens, hover on desktop) */
  var rows = $$('.svc__list li'), pics = $$('.svc__img');
  function setSvc(k) {
    rows.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-k') === String(k)); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === String(k)); });
  }
  rows.forEach(function (li) { li.addEventListener('mouseenter', function () { setSvc(li.getAttribute('data-k')); }); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) setSvc(x.target.getAttribute('data-k')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (li) { so.observe(li); });
  }
  setSvc(0);

  /* drag strip + progress */
  var strip = $('.strip'), sbar = $('.strip__bar i');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    var upd = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; sbar.style.setProperty('--p', (0.2 + p * 0.8).toFixed(3)); };
    strip.addEventListener('scroll', upd, { passive: true }); upd();
    strip.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete il tipo di lavoro.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: split screen (B) */
  if (!reduce) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .08 }, 0)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .5, stagger: .06 }, .2)
      .from('.hero__frame', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'power3.inOut' }, 0)
      .to('.hero__img', { scale: 1.02, duration: 1.6, ease: 'power2.out' }, 0)
      .from('.hero__tag', { x: -20, opacity: 0, duration: .5 }, .9);
    /* slower parallax on the photo */
    gsap.to('.hero__img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* signature scene: the wall builds up layer by layer */
  var steps = $$('.steps li'), wc = $('[data-wc]'), cur = -1;
  function show(k) {
    if (k === cur) return; cur = k;
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    if (wc) wc.textContent = '0' + (k + 1);
  }
  function scene() {
    if (reduce) { show(4); return; }
    show(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 900px)', desk: '(min-width: 901px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var wall = $('.wall');
      var t = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=170%' : '+=280%', pin: true, scrub: .6,
        onUpdate: function (s) { show(Math.max(0, Math.min(4, Math.floor(s.progress * 5.2)))); } } });
      t.from('.scene__head', { y: 24, opacity: 0, duration: .3 }, 0)
        .from('.steps', { y: 24, opacity: 0, duration: .3 }, .1)
        .fromTo('.wall__l--brick', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, .05)
        .fromTo('.wall__l--mesh', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 1.1)
        .fromTo('.wall__l--rasa', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 2.1)
        .fromTo('.wall__l--stucco', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 3.1)
        .fromTo('.wall__l--paint', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 4.1)
        .fromTo('.wall__roller', { y: 0, opacity: 0 }, { y: function () { return wall.offsetHeight; }, opacity: 1, duration: 1, ease: 'none', immediateRender: true }, 4.1)
        .to('.wall__roller', { opacity: 0, duration: .15 }, 5.1)
        .to({}, { duration: .3 });
      var tags = $$('.wall__tags span').reverse();
      tags.forEach(function (tg, i) { t.from(tg, { opacity: 0, y: 10, duration: .25 }, .8 + i); });
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
