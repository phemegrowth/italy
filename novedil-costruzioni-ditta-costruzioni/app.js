/* Novedil Costruzioni: split hero, reveals, pinned horizontal residences, form. */
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
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete cosa cercate.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG || reduce) return;
  doc.classList.add('has-g');

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero entrance: lines rise, photo opens from the bottom (about 1.2 s) */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .09 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
    .fromTo('.hero__frame', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut' }, .05)
    .from('.hero__frame img', { scale: 1.25, duration: 1.4, ease: 'power2.out' }, .05);

  function parallax() {
    gsap.to('.hero__frame img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function reel() {
    var track = $('.reel__track'), cards = $$('.pc'), cur = $('[data-cur]'), bar = $('.reel__bar span');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var dist = function () { var l = track.parentElement.getBoundingClientRect().left; return -Math.max(0, track.scrollWidth + l - window.innerWidth + (phone ? 20 : 48)); };
      var tween = gsap.to(track, {
        x: dist, ease: 'none',
        scrollTrigger: {
          trigger: '.reel', start: 'top top', end: function () { return '+=' + Math.round(-dist() * (phone ? 1.1 : 1.3)); }, pin: true, scrub: .5, invalidateOnRefresh: true,
          onUpdate: function (s) {
            var n = Math.min(cards.length, Math.floor(s.progress * cards.length * 0.999) + 1);
            if (cur) cur.textContent = (n < 10 ? '0' : '') + n;
            if (bar) bar.style.setProperty('--p', s.progress.toFixed(3));
          }
        }
      });
      cards.forEach(function (c, i) {
        if (i === 0) return;
        gsap.fromTo(c.querySelector('.pc__img'), { clipPath: 'inset(0 0 0 100%)' }, {
          clipPath: 'inset(0 0 0 0%)', ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 102%', end: 'left 78%', scrub: true }
        });
        gsap.from(c.querySelector('.pc__img img'), { scale: 1.2, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 102%', end: 'left 60%', scrub: true } });
      });
      return function () { gsap.set(track, { x: 0 }); };
    });
    gsap.from('.reel__head > *', { y: 26, opacity: 0, duration: .6, stagger: .08, scrollTrigger: { trigger: '.reel', start: 'top 70%' } });
    gsap.from('.pc:first-child .pc__img', { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.reel', start: 'top 60%' } });
  }

  var go = function () { parallax(); reel(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
