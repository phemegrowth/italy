/* D.L.F Edilizia e Restauri, Parma: page behaviour. Vanilla JS + GSAP ScrollTrigger for the exploded palazzo. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

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

  /* review cards: drag, buttons, counter */
  var cards = $('.cards'), items = $$('.cq'), cnt = $('.cards__i');
  if (cards) {
    var pad = function () { return parseFloat(getComputedStyle(cards).paddingLeft) || 0; };
    var idx = function () {
      var best = 0, d = 1e9;
      items.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - cards.offsetLeft - pad() - cards.scrollLeft); if (dd < d) { d = dd; best = i; } });
      return best;
    };
    cards.addEventListener('scroll', function () { cnt.textContent = ('0' + (idx() + 1)).slice(-2); }, { passive: true });
    $$('.cbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Math.max(0, Math.min(items.length - 1, idx() + (+b.getAttribute('data-dir'))));
        cards.scrollTo({ left: items[i].offsetLeft - cards.offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    var down = false, sx = 0, sl = 0;
    cards.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = cards.scrollLeft; cards.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) cards.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; cards.classList.remove('is-drag'); });
  }

  /* rating count-up */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
    el.textContent = (0).toFixed(dec).replace('.', ',');
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1300); el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .5 });
    cio.observe(el);
  });

  /* sticky phone bar */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-60px 0px 0px 0px' }).observe($('.hero__cta'));
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

  /* keep the stage height in step with the real photo height */
  var stage = $('.xp__stage'), build = $('.xp__build');
  var sizeStage = function () { stage.style.setProperty('--h', build.offsetHeight + 'px'); };
  sizeStage(); window.addEventListener('resize', sizeStage);

  /* Exploded palazzo: the facade wipes in, then its four bands pull apart and each gets its label */
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var slices = $$('.xp__s'), labels = $$('.xp__labels li'), xp = $('.xp'), num = $('.xp__i');
    if (!g || !ST || reduce) { labels.forEach(function (l) { l.classList.add('is-on'); }); xp.classList.add('is-open'); if (num) num.textContent = '04'; return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    var cl = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (v) { return 1 - Math.pow(1 - v, 3); };
    var gap = function () { return parseFloat(getComputedStyle(stage).getPropertyValue('--gap')) || 40; };
    var last = -1;
    var draw = function (p) {
      var w = ease(cl(p / .14));
      build.style.clipPath = w > .999 ? 'none' : 'inset(0 0 ' + ((1 - w) * 100).toFixed(2) + '% 0)';
      var G = gap(), shown = 0;
      slices.forEach(function (s, i) {
        if (i === 0) return;
        var e = ease(cl((p - .16 - (i - 1) * .17) / .22));
        s.style.transform = 'translateY(' + (i * G * e).toFixed(1) + 'px)';
      });
      labels.forEach(function (l, i) {
        var at = .2 + i * .17;
        var on = p >= at;
        l.classList.toggle('is-on', on);
        if (on) shown = i + 1;
      });
      xp.classList.toggle('is-open', p > .18);
      if (shown !== last && num) { last = shown; num.textContent = '0' + shown; }
    };
    draw(0);
    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      ST.create({ trigger: '.xp', pin: true, start: 'top top', end: phone ? '+=150%' : '+=200%', scrub: .4, onUpdate: function (s) { draw(s.progress); }, onRefresh: function (s) { sizeStage(); draw(s.progress); } });
      g.to('.reel__track', { x: function () { return -window.innerWidth * (phone ? .32 : .14); }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      g.fromTo('.steps__line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    });
    window.addEventListener('load', function () { sizeStage(); ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
