/* Sportello Casa Immobiliare: page behaviour. Vanilla JS + GSAP ScrollTrigger for the door scene. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isPhone = function () { return window.matchMedia('(max-width: 699px)').matches; };

  // hero entrance starts on the first frame
  requestAnimationFrame(function () { root.classList.add('ready'); });

  // footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // header shrink + phone bar
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 24);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  // disabled language link
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  // smooth anchors with header offset
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 64);
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // reveals
  var rv = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (el) { el.classList.add('is-in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(sib, 4) * 80 + 'ms';
        el.classList.add('is-in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  // count-up (4,6 on Google)
  document.querySelectorAll('.count').forEach(function (el) {
    if (reduce) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, done = false;
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || done) return; done = true; cio.disconnect();
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1200), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec).replace('.', ','); if (k < 1) requestAnimationFrame(step); })(t0);
    });
    cio.observe(el);
  });

  // drag strip (mouse only; touch scrolls natively)
  document.querySelectorAll('.strip').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; s.classList.add('is-drag'); } s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  // form validation
  var form = document.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    form.querySelectorAll('.f').forEach(function (f) { f.classList.remove('is-bad'); });
    function bad(name) { var i = form.querySelector('[name="' + name + '"]'); i.closest('.f').classList.add('is-bad'); if (ok) i.focus(); ok = false; }
    if (!form.elements['name'].value.trim()) bad('name');
    if (form.elements['phone'].value.replace(/\D/g, '').length < 6) bad('phone');
    var em = form.elements['email'].value.trim(); if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) bad('email');
    if (!ok) e.preventDefault();
  });

  // hero photo parallax (desktop)
  var heroImg = document.querySelector('.hero__pic img');

  // ===== signature scene: the door opens on a furnished flat =====
  var scene = document.querySelector('.door');
  var steps = scene ? scene.querySelectorAll('.door__steps li') : [];
  function setStep(i) { steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); }

  function build() {
    if (!window.gsap || !window.ScrollTrigger || reduce) { steps.forEach(function (li) { li.classList.add('is-on'); }); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (heroImg) gsap.to(heroImg, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var L = scene.querySelector('.door__leaf--l'), R = scene.querySelector('.door__leaf--r');
      var img = scene.querySelector('.door__room img');
      var head = scene.querySelector('.door__head');
      var num = scene.querySelector('.door__num');
      gsap.set([L, R], { rotationY: 0 });
      gsap.set(img, { scale: 1.18 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=130%' : '+=220%', pin: '.door__stage', scrub: 0.6,
          onUpdate: function (st) { var p = st.progress; setStep(p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3); }
        }
      });
      tl.from(head, { y: -24, opacity: 0, duration: 0.12 }, 0)
        .from(num, { y: -10, opacity: 0, duration: 0.1 }, 0.04)
        .to(L, { rotationY: -104, duration: 0.6 }, 0.18)
        .to(R, { rotationY: 104, duration: 0.6 }, 0.22)
        .to(img, { scale: 1, duration: 0.7 }, 0.2)
        .to({}, { duration: 0.1 });
      return function () { gsap.set([L, R, img, head, num], { clearProps: 'all' }); };
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
