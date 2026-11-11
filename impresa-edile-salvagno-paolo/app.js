/* Impresa Edile Salvagno Paolo, Verona: page behaviour. Vanilla JS + GSAP ScrollTrigger for the blueprint scene. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* hero entrance starts on the first frame, no waiting for fonts or images */
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

  /* services: photo swap on desktop (hover, focus, or the row in the middle of the screen) */
  var items = $$('.svc__i'), pics = $$('.svc__pic img');
  var setSvc = function (i) {
    items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  };
  items.forEach(function (it, i) {
    it.addEventListener('mouseenter', function () { setSvc(i); });
    it.addEventListener('focusin', function () { setSvc(i); });
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting && window.innerWidth >= 1024) setSvc(items.indexOf(x.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { sio.observe(it); });
  }

  /* drag scrollers: review cards and work strip */
  function dragger(el) {
    if (!el) return;
    var down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; el.classList.add('is-drag'); } el.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; el.classList.remove('is-drag'); });
    el.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }
  var cards = $('.cards'), cq = $$('.cq'), cnt = $('.cards__i');
  dragger(cards); dragger($('.work__strip'));
  if (cards) {
    var idx = function () {
      var best = 0, d = 1e9;
      cq.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - cards.offsetLeft - cards.scrollLeft); if (dd < d) { d = dd; best = i; } });
      return best;
    };
    cards.addEventListener('scroll', function () { cnt.textContent = ('0' + (idx() + 1)).slice(-2); }, { passive: true });
    $$('.cbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = Math.max(0, Math.min(cq.length - 1, idx() + (+b.getAttribute('data-dir'))));
        cards.scrollTo({ left: cq[i].offsetLeft - cards.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
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

  /* sticky phone bar after the hero buttons */
  var bar = $('#bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }, { rootMargin: '-60px 0px 0px 0px' }).observe($('.hero__cta'));
  else bar.classList.add('is-on');

  /* steps line: from the first number to the last */
  var sl = $('.steps__line'), slist = $('.steps__list');
  var placeLine = function () {
    var lis = $$('li', slist); if (!lis.length) return;
    var desk = window.innerWidth >= 1024;
    if (desk) { sl.style.top = (slist.offsetTop + 19) + 'px'; sl.style.height = ''; sl.style.bottom = 'auto'; }
    else { sl.style.top = (slist.offsetTop + 14) + 'px'; sl.style.height = (lis[lis.length - 1].offsetTop) + 'px'; sl.style.bottom = 'auto'; }
  };
  placeLine(); window.addEventListener('resize', placeLine); window.addEventListener('load', placeLine);

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

  /* Blueprint to building: the elevation draws itself, then the real facade rises floor by floor */
  var paths = $$('.bp__g path'), photo = $('.bp__photo'), pct = $('.bp__pct'), meterBar = $('.bp__meter b'),
      steps = $$('.bp__steps li'), now = $('.bp__now'), lvl = $('.bp__lvl'), dims = $('.bp__dims');
  var names = steps.map(function (s) { return $('b', s).textContent; });
  var cl = function (v) { return Math.max(0, Math.min(1, v)); };
  var ease = function (v) { return 1 - Math.pow(1 - v, 3); };
  var lastStep = -1;
  function draw(p) {
    /* 0 to .34: lines draw, staggered */
    paths.forEach(function (el, i) {
      var t = ease(cl((p - i * .022) / .14));
      el.style.strokeDashoffset = (1 - t).toFixed(4);
    });
    /* .30 to .96: photo rises in three floors (ground .30-.52, middle .52-.74, top and roof .74-.96) */
    var floors = [[.30, .52, 1, .7], [.52, .74, .7, .36], [.74, .96, .36, 0]];
    var top = 1;
    floors.forEach(function (f) { var t = ease(cl((p - f[0]) / (f[1] - f[0]))); if (p >= f[0]) top = f[2] + (f[3] - f[2]) * t; });
    photo.style.clipPath = 'inset(' + (top * 100).toFixed(2) + '% 0 0 0)';
    lvl.style.setProperty('--lt', Math.max(3, top * 100).toFixed(2) + '%');
    /* lines fade back once the facade is there */
    var fade = 1 - .7 * ease(cl((p - .8) / .2));
    $('.bp__g').style.opacity = fade.toFixed(3);
    if (dims) dims.style.opacity = (cl(p / .1) * .6).toFixed(3);
    var built = Math.round(cl((p - .02) / .94) * 100);
    pct.textContent = built;
    meterBar.style.transform = 'scaleX(' + (built / 100).toFixed(3) + ')';
    lvl.textContent = built < 30 ? '+0,00' : built < 55 ? '+3,20' : built < 80 ? '+6,40' : '+9,60';
    var s = p < .3 ? 0 : p < .52 ? 1 : p < .74 ? 2 : 3;
    if (s !== lastStep) {
      lastStep = s;
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k === s); });
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
    var track = $('.strip__track');
    var mm = g.matchMedia();
    mm.add({ phone: '(max-width: 1023px)', desk: '(min-width: 1024px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      ST.create({ trigger: '.bp', pin: '.bp__pin', start: 'top top', end: phone ? '+=130%' : '+=220%', scrub: .4, anticipatePin: 1,
        onUpdate: function (s) { draw(s.progress); }, onRefresh: function (s) { draw(s.progress); } });
      setTimeout(function () { track.classList.add('is-gsap'); }, 1500);
      g.fromTo(track, { x: 0 }, { x: function () { return -window.innerWidth * (phone ? .45 : .2); }, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      g.fromTo('.steps__line i', { scaleX: phone ? 1 : 0, scaleY: phone ? 0 : 1 }, { scaleX: 1, scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    });
    window.addEventListener('load', function () { placeLine(); ST.refresh(); });
  }
  var start = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(scenes); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
