(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });


  /* smooth anchors (CSS smooth scroll fights the pinned scene) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - (hdr.offsetHeight + 8);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = Array.prototype.indexOf.call(en.target.parentNode.children, en.target);
        en.target.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  }

  /* phone bar after hero */
  if ('IntersectionObserver' in window && bar) {
    new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(document.querySelector('.hero'));
  }

  /* form */
  var form = document.querySelector('.form');
  if (form) {
    var chips = form.querySelector('.chips');
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      var picked = form.querySelector('input[name="type"]:checked');
      chips.classList.toggle('is-bad', !picked);
      if (!picked) { ok = false; first = form.querySelector('input[name="type"]'); }
      form.querySelectorAll('.f [required]').forEach(function (f) {
        var valid = f.checkValidity() && f.value.trim() !== '';
        f.closest('.f').classList.toggle('is-bad', !valid);
        if (!valid) { ok = false; first = first || f; }
      });
      var chk = form.querySelector('input[name="privacy"]');
      form.querySelector('.err--chk').classList.toggle('is-bad', !chk.checked);
      if (!chk.checked) { ok = false; first = first || chk; }
      if (!ok) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('input', function (e) {
      var w = e.target.closest('.f'); if (w) w.classList.remove('is-bad');
      if (e.target.name === 'type') chips.classList.remove('is-bad');
      if (e.target.name === 'privacy') form.querySelector('.err--chk').classList.remove('is-bad');
    });
    form.addEventListener('change', function (e) { if (e.target.name === 'type') chips.classList.remove('is-bad'); });
  }

  /* ---------- signature scene: the pour ---------- */
  var scene = document.querySelector('.scene');
  if (reduce || !window.gsap || !window.ScrollTrigger) { scene.classList.add('is-static'); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var steps = scene.querySelectorAll('.scene__steps li');
    var meterN = scene.querySelector('.meter__n');
    var lines = scene.querySelectorAll('.g-rebar path');
    lines.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var counter = { v: 0 };
    function setStep(p) {
      var k = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.76 ? 2 : 3;
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
    }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set('.g-form-l', { x: -240, opacity: 0 });
      gsap.set('.g-form-r', { x: 240, opacity: 0 });
      gsap.set('.g-pour', { y: 480 });
      gsap.set('.g-cured', { opacity: 0 });
      gsap.set('.g-dim', { opacity: 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: scene.querySelector('.scene__stage'), scrub: 0.6,
          onUpdate: function (st) { setStep(st.progress); }
        }
      });
      tl.to('.g-form-l', { x: 0, opacity: 1, ease: 'power2.out', duration: 0.16 }, 0.02)
        .to('.g-form-r', { x: 0, opacity: 1, ease: 'power2.out', duration: 0.16 }, 0.04)
        .to(scene.querySelectorAll('.g-rebar .rb'), { strokeDashoffset: 0, stagger: 0.02, duration: 0.12 }, 0.2)
        .to(scene.querySelectorAll('.g-rebar .st'), { strokeDashoffset: 0, stagger: 0.015, duration: 0.06 }, 0.28)
        .to('.g-pour', { y: 0, duration: 0.32 }, 0.43)
        .fromTo('.wave', { x: 0 }, { x: -160, duration: 0.32 }, 0.43)
        .to(counter, { v: 100, duration: 0.32, onUpdate: function () { meterN.textContent = Math.round(counter.v); } }, 0.43)
        .to('.g-dim', { opacity: 1, duration: 0.06 }, 0.7)
        .to('.g-form-l', { x: -200, opacity: 0, ease: 'power2.in', duration: 0.14 }, 0.78)
        .to('.g-form-r', { x: 200, opacity: 0, ease: 'power2.in', duration: 0.14 }, 0.78)
        .to('.g-cured', { opacity: 1, duration: 0.12 }, 0.8)
        .to({}, { duration: 0.06 });
      return function () { gsap.set(['.g-form-l', '.g-form-r', '.g-pour', '.g-cured', '.g-dim', '.wave'], { clearProps: 'all' }); };
    });
    if (document.readyState !== 'complete') window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else window.addEventListener('load', build);
})();
