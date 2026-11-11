/* B.A. Ristrutturazioni Edili: page behaviour. Vanilla JS + GSAP ScrollTrigger for the building scene. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* year */
  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink */
  var hdr = $('#hdr');
  var onScroll = function () { hdr.classList.toggle('is-small', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* phone menu: full screen, closes on tap and Escape */
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

  /* hero, mechanic D: the cards start stacked in the middle and fan out into the collage */
  var hero = $('.hero'), stack = $('.hero__stack'), cards = $$('.card', stack);
  if (reduce) { hero.classList.add('is-in', 'is-done'); }
  else {
    var sr = stack.getBoundingClientRect(), cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
    var rot = [-7, 5, -3, 8];
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      c.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + rot[i] + 'deg) scale(.9)';
      c.style.transitionDelay = (i * 70) + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-in');
        cards.forEach(function (c) { c.style.transform = ''; });
        setTimeout(function () { hero.classList.add('is-done'); cards.forEach(function (c) { c.style.transitionDelay = ''; c.style.transition = 'none'; }); }, 1400);
      });
    });
  }

  /* scroll reveals; anything already on screen shows at once */
  var reveals = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (e, i) {
      var sib = e.parentElement ? $$(':scope > .r', e.parentElement).indexOf(e) : 0;
      e.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* services: the item in the middle of the screen drives the photo (desktop) and its own top rule */
  var items = $$('.serv__list li'), pics = $$('.serv__pic .sp');
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

  /* work strip: drag with the mouse, native swipe on touch, progress line */
  var strip = $('.strip'), sline = $('.strip__line i');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; strip.classList.remove('is-drag'); });
    var upd = function () { var m = strip.scrollWidth - strip.clientWidth; var p = m > 0 ? strip.scrollLeft / m : 1; sline.style.transform = 'scaleX(' + (0.18 + 0.82 * p).toFixed(3) + ')'; };
    strip.addEventListener('scroll', upd, { passive: true }); upd();
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: 'smooth' }); });
  }

  /* count-up of the Google rating */
  $$('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
    var cio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; cio.disconnect();
      var t0 = performance.now();
      (function tick(t) { var k = Math.min(1, (t - t0) / 1200); var v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(tick); })(t0);
    }, { threshold: .6 });
    cio.observe(el);
  });

  /* sticky contact bar on phones, after the hero */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }, { rootMargin: '-120px 0px 0px 0px' }).observe($('.hero__cta'));
  } else bar.classList.add('is-on');

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
    var check = function (inp) {
      var f = inp.closest('.f'), e = f && $('.err', f), ok = true, v = inp.value.trim();
      if (inp.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      else if (inp.name === 'phone') ok = v.replace(/\D/g, '').length >= 6;
      else ok = v.length > 1;
      if (f) f.classList.toggle('bad', !ok);
      if (e) e.textContent = ok ? '' : msgs[inp.name];
      return ok;
    };
    var req = $$('[required]', form);
    req.forEach(function (i) { i.addEventListener('blur', function () { check(i); }); i.addEventListener('input', function () { if (i.closest('.f').classList.contains('bad')) check(i); }); });
    form.addEventListener('submit', function (e) {
      var bad = req.filter(function (i) { return !check(i); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); }
    });
  }

  /* signature scene: blueprint to building (GSAP) */
  function scene() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var steps = $$('.steps li'), num = $('.build__n'), bari = $('.build__bar i');
    var setStep = function (p) {
      var cut = [0, .2, .4, .6, .8], k = 0;
      cut.forEach(function (c, i) { if (p >= c) k = i; });
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    };
    if (!g || !ST || reduce) { num.textContent = '100'; steps.forEach(function (li) { li.classList.add('is-on'); }); return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    var lines = $$('.ln-d:not(.ln-dim)'), dims = $$('.ln-dim');
    lines.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var ground = { y: 472, height: 0 };
    g.set(['.cl--frame', '.cl--brick', '.cl--plaster'], { attr: ground });
    g.set(dims, { opacity: 0 });
    g.set('.win, .bp-door, .bp-doorline, .bp-rail', { opacity: 0 });
    g.set('.ph--roof', { opacity: 0, y: -36 });
    var full = { y: 160, height: 312 };
    var cnt = { v: 0 };

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var tl = g.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.build', pin: true, start: 'top top', end: ctx.conditions.phone ? '+=150%' : '+=230%', scrub: .6,
          onUpdate: function (s) { setStep(s.progress); bari.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')'; }
        }
      });
      tl.to(lines, { strokeDashoffset: 0, duration: 2, stagger: .12 }, 0)
        .to(dims, { opacity: .7, duration: .8 }, .8)
        .to('.cl--frame', { attr: full, duration: 2 }, 2)
        .to('.cl--brick', { attr: full, duration: 2 }, 4)
        .to('.cl--plaster', { attr: full, duration: 1.6 }, 6)
        .to('.win, .bp-door, .bp-doorline, .bp-rail', { opacity: 1, duration: .5, stagger: .12 }, 6.8)
        .to('.ph--roof', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 8)
        .to('.ph--lines', { opacity: .18, duration: 1 }, 8.6)
        .to(cnt, { v: 100, duration: 9.4, onUpdate: function () { num.textContent = Math.round(cnt.v); } }, 0)
        .to({}, { duration: .6 }, 9.4);
      return function () { };
    });

    /* desktop: the collage cards drift at different speeds as the hero scrolls away */
    var para = function () { mm.add('(min-width: 1024px)', function () {
      g.to('.card--a', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.card--c', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.card--b', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }); };
    if (hero.classList.contains('is-done')) para(); else setTimeout(para, 1500);

    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scene); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
