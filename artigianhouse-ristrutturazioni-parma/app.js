/* ArtigianHouse, Parma: page behaviour. Vanilla JS + GSAP ScrollTrigger for the "inside the wall" scene. */
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
      e.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* services: hover swaps the sticky photo (desktop only) */
  var phs = $$('.serv__ph img'), items = $$('.slist li');
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () {
      var i = +li.getAttribute('data-i');
      phs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      items.forEach(function (o) { o.classList.toggle('is-on', o === li); });
    });
  });

  /* gallery: mouse drag + progress bar */
  var rail = $('.gal__rail'), gbar = $('.gal__bar i');
  if (rail) {
    var upd = function () {
      var max = rail.scrollWidth - rail.clientWidth, k = max > 0 ? rail.scrollLeft / max : 0;
      var w = Math.max(.12, rail.clientWidth / rail.scrollWidth);
      gbar.style.width = (w * 100) + '%';
      gbar.style.transform = 'translateX(' + (k * (1 / w - 1) * 100) + '%)';
    };
    rail.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    var down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); rail.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; rail.classList.remove('is-drag'); });
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

  /* sticky phone bar, after the hero buttons scroll away */
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

  /* The wall: brick, then pipes and conduits draw, plaster rises, paint sweeps, the finished room opens */
  var names = ['Muratura', 'Impianti', 'Intonaco', 'Pittura', 'Casa finita'];
  var marks = [0, .06, .36, .58, .78];
  function scenes() {
    var g = window.gsap, ST = window.ScrollTrigger;
    var caps = $$('.caps li'), frame = $('.wall__frame');
    if (!g || !ST || reduce) { caps.forEach(function (c) { c.classList.add('is-on'); }); $('.w-n').textContent = '05'; $('.w-name').textContent = names[4]; $('.wall__bar i').style.transform = 'none'; return; }
    g.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    var paths = $$('.w-sys .d'), boxes = $$('.w-sys .box, .w-sys .tap');
    var lens = paths.map(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return L; });
    var plaster = $('.w-plaster'), pEdge = $('.w-edge', plaster), paint = $('.w-paint'), qEdge = $('.w-edge', paint), room = $('.w-room');
    var nEl = $('.w-n'), nameEl = $('.w-name'), barI = $('.wall__bar i'), last = -1;
    var cl = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (v) { return v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; };

    var draw = function (p) {
      var H = frame.clientHeight, W = frame.clientWidth;
      var a = ease(cl((p - .06) / .24));
      paths.forEach(function (el, i) { var d = cl(a * 1.25 - i * .05); el.style.strokeDashoffset = (lens[i] * (1 - d)).toFixed(1); });
      boxes.forEach(function (b) { b.style.opacity = a > .8 ? 1 : 0; });
      var b = ease(cl((p - .33) / .18));
      plaster.style.clipPath = 'inset(' + ((1 - b) * 100).toFixed(2) + '% 0 0 0)';
      pEdge.style.transform = 'translateY(' + ((1 - b) * H).toFixed(1) + 'px)';
      pEdge.style.opacity = b > 0 && b < 1 ? .55 : 0;
      var c = ease(cl((p - .55) / .16));
      paint.style.clipPath = 'inset(0 ' + ((1 - c) * 100).toFixed(2) + '% 0 0)';
      qEdge.style.transform = 'translateX(' + (-(1 - c) * W).toFixed(1) + 'px)';
      qEdge.style.opacity = c > 0 && c < 1 ? 1 : 0;
      var d = ease(cl((p - .75) / .2));
      room.style.clipPath = 'circle(' + (d * 80).toFixed(2) + '% at 50% 55%)';
      var k = 0; marks.forEach(function (m, i) { if (p >= m) k = i; });
      if (k !== last) { last = k; caps.forEach(function (c, i) { c.classList.toggle('is-on', i === k); }); nEl.textContent = '0' + (k + 1); nameEl.textContent = names[k]; }
      barI.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    };
    draw(0);

    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      ST.create({ trigger: '.wall', pin: true, start: 'top top', end: phone ? '+=160%' : '+=240%', scrub: .4, onUpdate: function (s) { draw(s.progress); }, onRefresh: function (s) { draw(s.progress); } });
      g.to('.strip', { xPercent: phone ? -12 : -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.fromTo('.steps__line i', phone ? { scaleY: 0 } : { scaleX: 0 }, { scaleY: 1, scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 60%', scrub: true } });
    });
    window.addEventListener('load', function () { ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
