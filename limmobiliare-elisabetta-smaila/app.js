/* L'Immobiliare di Elisabetta Smaila: page behaviour. Vanilla JS + GSAP ScrollTrigger for the portone scene and the hero reel. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink */
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-small', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* full-screen phone menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && !menu.hidden) setMenu(false); });

  /* hero entrance: starts on the first frame, done in about 1.3 s */
  var hero = $('.hero');
  if (reduce) hero.classList.add('is-in');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* scroll reveals; anything already on screen shows at once */
  var reveals = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (e) {
      var sib = $$(':scope > .r', e.parentElement).indexOf(e);
      e.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* count-ups (rating and number of reviews, both sourced) */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1300); var v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    cio.observe(el);
  });

  /* listings: filter chips and drag strip */
  var strip = $('.strip'), sline = $('.strip__line i');
  var upd = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; sline.style.transform = 'scaleX(' + (0.2 + 0.8 * p).toFixed(3) + ')'; };
  strip.addEventListener('scroll', upd, { passive: true }); upd();
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      $$('.chip').forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $$('.lc').forEach(function (l) { l.classList.toggle('is-out', f !== 'all' && l.getAttribute('data-k') !== f); });
      strip.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(upd, 450);
    });
  });
  var down = false, sx = 0, sl = 0;
  strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
  window.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
  window.addEventListener('pointerup', function () { if (down) { down = false; strip.classList.remove('is-drag'); } });
  strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') strip.scrollBy({ left: 340, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -340, behavior: 'smooth' }); });

  /* sticky contact bar on phones, after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa cercate.' };
  var check = function (inp) {
    var f = inp.closest('.f'), e = $('.err', f), v = inp.value.trim(), ok;
    if (inp.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    else if (inp.name === 'phone') ok = v.replace(/\D/g, '').length >= 6;
    else ok = v.length > 1;
    f.classList.toggle('bad', !ok); e.textContent = ok ? '' : msgs[inp.name];
    return ok;
  };
  var req = $$('[required]', form);
  req.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); i.addEventListener('input', function () { if (i.closest('.f').classList.contains('bad')) check(i); }); });
  form.addEventListener('submit', function (e) { var bad = req.filter(function (i) { return !check(i); }); if (bad.length) { e.preventDefault(); bad[0].focus(); } });

  /* GSAP: hero reel drift, portone scene, city band parallax */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var porta = $('.porta'), steps = $$('.steps li'), num = $('.porta__n'), pbar = $('.porta__bar i');
    if (!g || !ST || reduce) { steps.forEach(function (li) { li.classList.add('is-on'); }); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    porta.classList.add('is-live');
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === 0); });

    /* hero reel: drifts left as the page scrolls (transform only) */
    g.to('.reel', { x: function () { return -Math.min(window.innerWidth * .35, 420); }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
    g.to('.city__fig img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.city', start: 'top bottom', end: 'bottom top', scrub: true } });

    var setStep = function (p) {
      var k = p < .3 ? 0 : p < .55 ? 1 : p < .78 ? 2 : 3;
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
      num.textContent = '0' + (k + 1);
      pbar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    };
    g.set('.leaf--l', { rotationY: 0 }); g.set('.leaf--r', { rotationY: 0 });
    g.set('.door__inside', { scale: 1.25 });
    pbar.style.transform = 'scaleX(0)';

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var tl = g.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.porta', pin: '.porta__pin', start: 'top top', end: ctx.conditions.phone ? '+=130%' : '+=220%', scrub: .6, onUpdate: function (s) { setStep(s.progress); } }
      });
      tl.to('.leaf--l', { rotationY: 80, duration: 5, ease: 'power1.inOut' }, 1)
        .to('.leaf--r', { rotationY: -80, duration: 5, ease: 'power1.inOut' }, 1.2)
        .to('.door__inside', { scale: 1.04, duration: 6 }, 1)
        .to('.door__inside', { scale: 1, duration: 2.5 }, 7)
        .to({}, { duration: 1 }, 9.5);
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
