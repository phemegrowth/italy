/* Progetto Immobiliare Genova: page behaviour. Vanilla JS + GSAP ScrollTrigger for the service ring. */
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

  // drag strip (unused here)
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


  // ===== signature scene: ring of six services turned by scroll =====
  var scene = document.querySelector('.ring');
  var wheel = scene ? scene.querySelector('.ring__wheel') : null;
  var cards = scene ? scene.querySelectorAll('.rc') : [];
  var idx = scene ? scene.querySelector('.ring__i') : null;
  function front(i) { cards.forEach(function (c, k) { c.classList.toggle('is-front', k === i); }); if (idx) idx.textContent = '0' + (i + 1); }
  front(0);

  function build() {
    if (!window.gsap || !window.ScrollTrigger || reduce || !wheel) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.to('.hero__pic img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.sestri__pic img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.sestri', start: 'top bottom', end: 'top top', scrub: true } });

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var st = { a: 0 };
      function rad() { return parseFloat(getComputedStyle(wheel).getPropertyValue('--card')) ? wheel.offsetWidth * (phone ? 0.95 : 1.05) : 300; }
      function draw() {
        wheel.style.transform = 'translateZ(' + (-rad()) + 'px) rotateY(' + st.a + 'deg)';
        var i = ((Math.round(-st.a / 60) % 6) + 6) % 6; front(i);
      }
      draw();
      var head = scene.querySelector('.ring__head');
      var tl = gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: phone ? '+=160%' : '+=260%', pin: '.ring__stage', scrub: 0.7 } });
      tl.from(head, { opacity: 0, y: -24, duration: 0.08 }, 0)
        .from('.ring__view', { opacity: 0, scale: 0.85, duration: 0.1 }, 0)
        .to({}, { duration: 0.25 }, 0);
      for (var k = 1; k <= 5; k++) tl.to(st, { a: -60 * k, duration: 0.6, ease: 'power2.inOut', onUpdate: draw }).to({}, { duration: 0.35 });
      window.addEventListener('resize', draw);
      return function () { window.removeEventListener('resize', draw); wheel.style.transform = ''; gsap.set([head, '.ring__view'], { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
