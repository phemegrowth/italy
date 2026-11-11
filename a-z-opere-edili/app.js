/* A.Z Opere Edili: page behaviour. Vanilla JS + GSAP ScrollTrigger for the before / after scene. */
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

  /* hero entrance + count-up of the sourced figure (28 Google reviews) */
  var hero = $('.hero'), big = $('.big__n');
  var countUp = function (el, to, ms) {
    var t0 = performance.now();
    (function tick(t) { var k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
  };
  if (reduce) hero.classList.add('is-in');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); big.textContent = '0'; countUp(big, 28, 1400); }); });

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

  /* services: the item in the middle of the screen drives the photo */
  var items = $$('.serv__list li'), pics = $$('.serv__pics .sp');
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        items.forEach(function (li) { li.classList.toggle('is-on', li === x.target); });
        var i = +x.target.getAttribute('data-i');
        pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { sio.observe(li); });
  }
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () {
      var i = +li.getAttribute('data-i');
      items.forEach(function (x) { x.classList.toggle('is-on', x === li); });
      pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    });
  });

  /* sticky contact bar on phones, after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
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

  /* GSAP: before / after scrub, process line */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var pd = $('.pd'), caps = $$('.caps li'), line = $('.ba__line'), after = $('.ba__after'), ba = $('.ba');
    var sline = $('.steps__line i');
    if (!g || !ST || reduce) { caps.forEach(function (li) { li.classList.add('is-on'); }); line.style.display = 'none'; return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    pd.classList.add('is-live');

    var setCap = function (p) {
      var k = p < .3 ? 0 : p < .72 ? 1 : 2;
      caps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    };
    var state = { v: 100 };
    var draw = function () {
      after.style.clipPath = 'inset(0 0 0 ' + state.v.toFixed(2) + '%)';
      line.style.transform = 'translateX(' + (ba.clientWidth * state.v / 100 - 1).toFixed(1) + 'px)';
      line.style.opacity = state.v > 99.5 || state.v < .5 ? 0 : 1;
    };
    draw();

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var tl = g.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.pd', pin: '.pd__pin', start: 'top top', end: ctx.conditions.phone ? '+=120%' : '+=200%', scrub: .6, onUpdate: function (s) { setCap(s.progress); } }
      });
      tl.to({}, { duration: 1.5 })
        .to(state, { v: 0, duration: 7, ease: 'power1.inOut', onUpdate: draw })
        .to({}, { duration: 1.5 });
    });

    g.fromTo(sline, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    window.addEventListener('resize', draw);
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
