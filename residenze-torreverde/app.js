/* Montipò: framed cinematic hero, pinned horizontal timeline of their buildings, Torreverde plan, activity photo swap, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header + phone bar */
  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals */
  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.26 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  /* count-up (30 villas, sourced) */
  function countUp(el) {
    var to = +el.dataset.to, t0 = null;
    function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
    el.textContent = '0'; requestAnimationFrame(f);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var io3 = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); io3.unobserve(x.target); } }); }, { threshold: .6 });
    $$('.count').forEach(function (c) { io3.observe(c); });
  }

  /* activities: active row swaps the photo */
  var rows = $$('.act__list li'), pics = $$('.act__pics img');
  function actOn(i) {
    rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
    pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { actOn(i); }); });
  if ('IntersectionObserver' in window) {
    var io4 = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) actOn(rows.indexOf(x.target)); }); }, { rootMargin: '-40% 0px -45% 0px' });
    rows.forEach(function (r) { io4.observe(r); });
  }

  var tlSec = $('.tl'), strip = $('.tl__strip'), cards = $$('.tc'), yearEl = $('.tl__year');
  if (!hasG || reduce) { tlSec.classList.add('is-static'); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      function dist() { return Math.max(0, strip.scrollWidth - $('.tl__view').clientWidth + (phone ? 20 : 0)); }
      var tween = gsap.to(strip, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: tlSec, pin: '.tl__pin', scrub: .6, start: 'top top', invalidateOnRefresh: true,
          end: function () { return '+=' + Math.round(dist() * (phone ? 1.1 : 1.25)); },
          onUpdate: function (st) {
            gsap.set('.tl__bar span', { scaleX: st.progress });
            var i = Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1)));
            if (yearEl.textContent !== cards[i].dataset.y) yearEl.textContent = cards[i].dataset.y;
          }
        }
      });
      cards.forEach(function (c, i) {
        if (i === 0) return;
        gsap.fromTo($('figure', c), { clipPath: 'inset(0 0 0 100%)' }, {
          clipPath: 'inset(0 0 0 0%)', ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 98%', end: 'left 60%', scrub: true }
        });
      });
      return function () { gsap.set(strip, { x: 0 }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
