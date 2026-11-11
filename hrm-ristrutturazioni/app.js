/* HRM Ristrutturazioni: page behaviour. Vanilla JS + GSAP ScrollTrigger for the before / after scene. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header */
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

  /* reveals */
  var reveals = $$('.r, .area');
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

  /* accordion: one open at a time */
  var accs = $$('.acc__it');
  accs.forEach(function (it) {
    var b = $('button', it);
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* review cards: buttons + counter */
  var cards = $('.cards'), items = $$('.cardq'), cnt = $('.cards__i');
  if (cards) {
    var idx = function () {
      var x = cards.scrollLeft, best = 0, d = 1e9;
      items.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - cards.offsetLeft - x - parseFloat(getComputedStyle(cards).paddingLeft)); if (dd < d) { d = dd; best = i; } });
      return best;
    };
    cards.addEventListener('scroll', function () { cnt.textContent = ('0' + (idx() + 1)).slice(-2); }, { passive: true });
    $$('.cbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Math.max(0, Math.min(items.length - 1, idx() + (+b.getAttribute('data-dir'))));
        cards.scrollTo({ left: items[i].offsetLeft - cards.offsetLeft - parseFloat(getComputedStyle(cards).paddingLeft), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  /* rating count-up */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1200); el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    cio.observe(el);
  });

  /* sticky bar after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-80px 0px 0px 0px' }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
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

  /* GSAP: before / after scene, hero reel drift, steps line */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var caps = $$('.caps li'), after = $('.ba__after'), line = $('.ba__line'), frame = $('.ba__frame'), barI = $('.ba__bar i'), afterImg = $('img', after);
    if (!g || !ST || reduce) { caps.forEach(function (c) { c.classList.add('is-on'); }); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    var paint = function (p) {
      var w = Math.min(1, Math.max(0, (p - .06) / .8));            /* wipe fraction 0..1 */
      var e = w < .5 ? 2 * w * w : 1 - Math.pow(-2 * w + 2, 2) / 2; /* ease in-out */
      var left = (1 - e) * 100;
      after.style.clipPath = 'inset(0 0 0 ' + left.toFixed(2) + '%)';
      line.style.opacity = (e > .005 && e < .995) ? 1 : 0;
      line.style.transform = 'translateX(' + (frame.clientWidth * (1 - e) - 1.5).toFixed(1) + 'px)';
      afterImg.style.transform = 'scale(' + (1.08 - .08 * e).toFixed(4) + ')';
      var k = p < .34 ? 0 : p < .67 ? 1 : 2;
      caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); });
      barI.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    };
    paint(0);

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      ST.create({ trigger: '.ba', pin: true, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=220%', scrub: true, onUpdate: function (s) { paint(s.progress); }, onRefresh: function (s) { paint(s.progress); } });
      /* hero reel drifts left as the hero scrolls away */
      g.to('.reel__track', { xPercent: ctx.conditions.phone ? -38 : -26, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      /* steps progress line */
      g.fromTo('.steps__line i', { scaleX: ctx.conditions.phone && window.innerWidth < 700 ? 1 : 0, scaleY: ctx.conditions.phone && window.innerWidth < 700 ? 0 : 1 },
        { scaleX: 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
