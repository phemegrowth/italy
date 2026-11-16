(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - hdr.offsetHeight - 8, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = Array.prototype.indexOf.call(en.target.parentNode.children, en.target);
        en.target.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
        en.target.classList.add('is-in'); io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }
  if ('IntersectionObserver' in window && bar) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(document.querySelector('.hero'));

  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var first = null;
      form.querySelectorAll('.f [required]').forEach(function (f) {
        var ok = f.checkValidity() && f.value.trim() !== '';
        f.closest('.f').classList.toggle('is-bad', !ok); if (!ok && !first) first = f;
      });
      var chk = form.querySelector('input[name="privacy"]');
      form.querySelector('.err--chk').classList.toggle('is-bad', !chk.checked); if (!chk.checked && !first) first = chk;
      if (first) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('input', function (e) { var w = e.target.closest('.f'); if (w) w.classList.remove('is-bad'); if (e.target.name === 'privacy') form.querySelector('.err--chk').classList.remove('is-bad'); });
    form.addEventListener('change', function (e) { var w = e.target.closest('.f'); if (w) w.classList.remove('is-bad'); });
  }

  /* signature scene: 3D card ring turned by scroll */
  var ring = document.querySelector('.ring');
  if (reduce || !window.gsap || !window.ScrollTrigger) { ring.classList.add('is-static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var wheel = ring.querySelector('.ring__wheel');
    var cards = gsap.utils.toArray('.rk');
    var cur = ring.querySelector('.ring__cur');
    var N = cards.length, step = 360 / N, R = 0;
    function layout() {
      var phone = window.innerWidth <= 700;
      var view = ring.querySelector('.ring__view').getBoundingClientRect();
      var cw = phone ? Math.round(window.innerWidth * 0.66) : 380;
      var ch = Math.round(Math.min(phone ? view.height * 0.92 : 520, view.height * 0.94));
      wheel.style.setProperty('--cw', cw + 'px'); wheel.style.setProperty('--ch', ch + 'px');
      R = Math.round(cw / (2 * Math.tan(Math.PI / N)) * (phone ? 1.08 : 1.18));
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    }
    layout();
    var state = { rot: 0 };
    function apply() {
      wheel.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + state.rot + 'deg)';
      var idx = ((Math.round(-state.rot / step) % N) + N) % N;
      cards.forEach(function (c, i) { c.classList.toggle('is-front', i === idx); });
      cur.textContent = '0' + (idx + 1);
    }
    apply();
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.to(state, {
        rot: -step * (N - 1), ease: 'none', onUpdate: apply,
        scrollTrigger: {
          trigger: ring, start: 'top top', end: phone ? '+=260%' : '+=320%',
          pin: ring.querySelector('.ring__stage'), scrub: 0.7,
          onRefreshInit: layout
        }
      });
    });
    if (document.readyState !== 'complete') window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else window.addEventListener('load', build);
})();
