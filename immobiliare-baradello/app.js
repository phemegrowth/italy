/* Immobiliare Baradello, Como: page behaviour. Vanilla JS + GSAP ScrollTrigger for the door scene. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* hero: curtain lifts on the first frames, no waiting for fonts or images */
  var hero = $('.hero');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* header shrink */
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-small', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* phone menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && !menu.hidden) setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var reveals = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (e) {
      var sib = $$(':scope > .r', e.parentElement).indexOf(e);
      e.style.transitionDelay = (Math.max(0, Math.min(sib, 3)) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* accordion */
  $$('.acc__i button').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc__i'), open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* listing cards: drag with the mouse on narrow screens */
  var cards = $('.cards');
  if (cards) {
    var down = false, sx = 0, sl = 0;
    cards.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = cards.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (down) cards.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; });
  }

  /* count-up (years on the territory) */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count'));
    el.textContent = '0';
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .5 });
    cio.observe(el);
  });

  /* sticky phone bar after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-60px 0px 0px 0px' }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete zona e tipo di immobile.' };
    var check = function (inp) {
      var f = inp.closest('.f'), e = $('.err', f), v = inp.value.trim(), ok;
      if (inp.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      else if (inp.name === 'phone') ok = v.replace(/\D/g, '').length >= 6;
      else ok = v.length > 1;
      f.classList.toggle('bad', !ok); e.textContent = ok ? '' : msgs[inp.name]; return ok;
    };
    var req = $$('[required]', form);
    req.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); i.addEventListener('input', function () { if (i.closest('.f').classList.contains('bad')) check(i); }); });
    form.addEventListener('submit', function (e) { var bad = req.filter(function (i) { return !check(i); }); if (bad.length) { e.preventDefault(); bad[0].focus(); } });
  }

  /* The door: two leaves swing open, the room behind grows to fill the frame, four steps light up */
  var leafL = $('.door__leaf--l'), leafR = $('.door__leaf--r'), shadeL = $('.door__leaf--l span'), shadeR = $('.door__leaf--r span'),
      room = $('.door__room'), roomImg = $('.door__room img'), steps = $$('.door__steps li'), now = $('.door__now');
  var names = steps.map(function (s) { return $('b', s).textContent; });
  var cl = function (v) { return Math.max(0, Math.min(1, v)); };
  var ease = function (v) { return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  var last = -1;
  var IN = [22.93, 18.67, 8.54, 18.67];
  function draw(p) {
    var o = ease(cl((p - .12) / .42));
    leafL.style.transform = 'rotateY(' + (100 * o).toFixed(2) + 'deg)';
    leafR.style.transform = 'rotateY(' + (-100 * o).toFixed(2) + 'deg)';
    shadeL.style.opacity = shadeR.style.opacity = (o * .55).toFixed(3);
    var g = ease(cl((p - .5) / .4));
    room.style.clipPath = 'inset(' + IN.map(function (v) { return (v * (1 - g)).toFixed(2) + '%'; }).join(' ') + ')';
    roomImg.style.transform = 'scale(' + (1.25 - .25 * g).toFixed(4) + ')';
    $('.door__open').style.visibility = g > .98 ? 'hidden' : 'visible';
    var s = p < .2 ? 0 : p < .45 ? 1 : p < .7 ? 2 : 3;
    if (s !== last) {
      last = s;
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k <= s && k === s); });
      if (now) { $('i', now).textContent = '0' + (s + 1); $('span', now).textContent = names[s]; }
    }
  }
  function finalState() { draw(1); steps.forEach(function (li) { li.classList.add('is-on'); }); }

  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    if (!g || !ST || reduce) { finalState(); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    draw(0);
    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      ST.create({ trigger: '.door', pin: '.door__pin', start: 'top top', end: phone ? '+=130%' : '+=220%', scrub: .5, anticipatePin: 1,
        onUpdate: function (s) { draw(s.progress); }, onRefresh: function (s) { draw(s.progress); } });
      g.fromTo('.hero__pic picture', { yPercent: 0 }, { yPercent: phone ? 8 : 6, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
