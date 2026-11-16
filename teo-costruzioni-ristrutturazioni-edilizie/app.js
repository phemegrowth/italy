(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // footer year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // header shrink + sticky bar after the hero
  var hdr = $('#hdr'), bar = $('#bar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // hero entrance: starts on the first frame, done well inside 1.6 s
  if (hero) {
    $$('.ln > span', hero).forEach(function (s, i) { s.style.setProperty('--d', (i * 80) + 'ms'); });
    requestAnimationFrame(function () { hero.classList.add('is-go'); setTimeout(function () { hero.classList.add('is-settled'); }, 1500); });
  }

  // reveals with the above-the-fold guard
  var rv = $$('.reveal');
  rv.forEach(function (el, i) { el.style.setProperty('--d', ((i % 4) * 80) + 'ms'); });
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  }

  // services: photo swaps with the active line (desktop hover + scroll position)
  var photos = $$('.srv__photo img'), items = $$('.srv__it');
  function setSrv(k, it) {
    photos.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === k); });
    items.forEach(function (x) { x.classList.toggle('is-on', x === it); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { setSrv(it.getAttribute('data-k'), it); });
  });
  if ('IntersectionObserver' in window && photos.length) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setSrv(e.target.getAttribute('data-k'), e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { io2.observe(it); });
  }

  // drag strip (mouse); touch scrolls natively
  var drag = $('.drag');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); drag.scrollLeft = sl - (e.pageX - sx); });
  }

  // process line draws with scroll
  var steps = $('.steps');
  function stepLine() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
  }
  window.addEventListener('scroll', stepLine, { passive: true });
  stepLine();

  // form validation
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        var wrap = f.closest('.f'), msg = wrap && $('.err', wrap), bad = false, txt = '';
        if (!f.value.trim()) { bad = true; txt = 'Campo obbligatorio.'; }
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { bad = true; txt = 'Controllate l\'indirizzo email.'; }
        else if (f.type === 'tel' && f.value.replace(/\D/g, '').length < 8) { bad = true; txt = 'Numero troppo corto.'; }
        if (wrap) wrap.classList.toggle('is-bad', bad);
        if (msg) msg.textContent = txt;
        if (bad && ok) { ok = false; f.focus(); }
      });
      if (!ok) e.preventDefault();
    });
  }

  // hero strip drifts left with scroll (desktop and phone)
  var track = $('.strip__track');
  if (track && !reduce) {
    window.addEventListener('scroll', function () {
      var y = Math.min(window.scrollY, 900);
      track.style.setProperty('--sx', (-y * 0.12).toFixed(1) + 'px');
    }, { passive: true });
  }

  // signature scene: the wall builds layer by layer
  var steps5 = $$('.wall__steps li'), count = $('.wall__count b'), tag = $('.room__tag');
  var names = ['Profili metallici', 'Lastre in cartongesso', 'Stucco e rasatura', 'Tinteggiatura', 'Pavimento'];
  function setStep(i) {
    steps5.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    if (count) count.textContent = '0' + (i + 1);
    if (tag) tag.innerHTML = 'Fase <b>0' + (i + 1) + '</b> · ' + names[i];
  }
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    steps5.forEach(function (li) { li.classList.add('is-on'); });
    if (tag) tag.innerHTML = 'Parete <b>finita</b>';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var build = function () {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', big: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.wall__pin', start: 'top top', end: phone ? '+=130%' : '+=240%', pin: true, scrub: 0.6,
          onUpdate: function (st) { setStep(Math.min(4, Math.floor(st.progress * 5 * 0.999))); }
        }
      });
      tl.fromTo('.l-studs', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
        .fromTo('.l-board span', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, stagger: 0.12 }, '>')
        .fromTo('.l-plaster', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '>')
        .fromTo('.l-paint', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '>')
        .fromTo('.l-floor', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '>')
        .fromTo('.l-floor img', { xPercent: -6 }, { xPercent: 0, duration: 1 }, '<');
      gsap.set(['.l-board', '.l-plaster', '.l-paint'], { clipPath: 'inset(0% 0% 0% 0%)' });
      return function () { tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
