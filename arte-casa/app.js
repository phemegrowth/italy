/* Arte Casa: reel hero, 3D ring of property types, path bar, count-up, form. */
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

  /* count-up (years, sourced) */
  function countUp(el) {
    var to = +el.dataset.to, t0 = null;
    function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
    el.textContent = '0'; requestAnimationFrame(f);
  }
  var counts = $$('.count');
  if (!reduce && 'IntersectionObserver' in window) {
    var io3 = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); io3.unobserve(x.target); } }); }, { threshold: .6 });
    counts.forEach(function (c) { io3.observe(c); });
  }

  var ring = $('.ring'), cards = $$('.rc'), spin = $('.ring__spin'), countEl = $('.ring__count b');
  if (!hasG || reduce) { ring.classList.add('is-static'); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var n = cards.length, step = 360 / n;
      var cw = phone ? Math.min(window.innerWidth * 0.64, 270) : 360;
      var stageH = $('.ring__stage').getBoundingClientRect().height;
      if (stageH > 100) cw = Math.min(cw, (stageH - 20) / 1.32);
      spin.style.setProperty('--cw', cw + 'px');
      var R = (cw / 2) / Math.tan(Math.PI / n) + (phone ? 18 : 40);
      var st = { a: 0 };
      function place() {
        var front = Math.round(-st.a / step) % n; if (front < 0) front += n;
        cards.forEach(function (c, i) {
          var ang = i * step + st.a;
          var cos = Math.cos(ang * Math.PI / 180);
          c.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + ang + 'deg) translateZ(' + R + 'px)';
          c.style.opacity = (0.15 + 0.85 * Math.pow((cos + 1) / 2, 2)).toFixed(3);
          c.style.zIndex = Math.round((cos + 1) * 10);
          c.classList.toggle('is-front', i === front);
        });
        if (countEl) countEl.textContent = '0' + (front + 1);
      }
      place();
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: ring, pin: '.ring__pin', scrub: 0.7, start: 'top top',
          end: phone ? '+=140%' : '+=240%',
          snap: { snapTo: [0, .1 + .9 * 0.2, .1 + .9 * 0.4, .1 + .9 * 0.6, .1 + .9 * 0.8, 1], duration: { min: .2, max: .5 }, delay: .1, inertia: false, ease: 'power1.inOut' }
        }
      });
      tl.fromTo('.ring__head', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .1, ease: 'power2.out' }, 0)
        .fromTo(spin, { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: .1, ease: 'power2.out' }, 0)
        .to(st, { a: -step * (n - 1), duration: .9, ease: 'none', onUpdate: place }, .1);

      gsap.to('.reel__track', { xPercent: phone ? -38 : -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .4 } });
      if (!phone) gsap.fromTo('.path__bar span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.path__list', start: 'top 60%', end: 'bottom 60%', scrub: .4 } });
      return function () { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
