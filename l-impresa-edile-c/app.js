/* L'impresa Edile C.S.: Ken Burns hero with line reveal, pinned horizontal strip of works, form. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var hdr = $('.hdr'), bar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle('is-small', y > 30);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  var rs = $$('.r');
  if (reduce || !('IntersectionObserver' in window)) { rs.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (e) {
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 6) * 0.07 + 's');
      if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); else io.observe(e);
    });
  }

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) { var el = $(id), f = el.closest('.fld'), er = $('.err', f); var good = test(el.value.trim()); f.classList.toggle('bad', !good); er.textContent = good ? '' : msg; if (!good && ok) el.focus(); ok = ok && good; }
      check('#f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('#f-phone', function (v) { return v.replace(/\D/g, '').length >= 8; }, 'Serve un numero per richiamarvi.');
      check('#f-email', function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Questa email non sembra corretta.');
      check('#f-type', function (v) { return !!v; }, 'Scegliete che lavoro è.');
      if (!ok) e.preventDefault();
    });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the panel slides up, lines reveal with an 80 ms stagger (about 1.2 s); the photo drifts in CSS */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__media', { opacity: 0, duration: .9 }, 0)
      .from('.hero__panel', { y: 30, opacity: 0, duration: .7 }, 0)
      .from('.hero__title .ln > span', { yPercent: 110, duration: .8, stagger: .08 }, .1)
      .from('.hero .hl > span', { yPercent: 100, opacity: 0, duration: .6, stagger: .07 }, .3);
  }

  function build() {
    var sc = $('.scene'); if (!sc || reduce) return;
    var track = $('.track'), cards = $$('.card'), k = $('[data-k]'), bars = $('.scene__bar span');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live'); track.scrollLeft = 0;
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth + (ctx.conditions.phone ? 16 : 48)); }
      gsap.set(cards, { clipPath: 'inset(0 0 0 100%)' });
      gsap.set(cards[0], { clipPath: 'inset(0 0 0 0%)' });
      if (bars) bars.style.setProperty('--p', '0');
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: function () { return '+=' + (dist() * (ctx.conditions.phone ? 1.1 : 1.3) + window.innerHeight * .3); },
        pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (s) {
          if (k) k.textContent = '0' + Math.min(cards.length, 1 + Math.floor(s.progress * cards.length * 0.999));
          if (bars) bars.style.setProperty('--p', s.progress.toFixed(3));
        } } });
      t.to(track, { x: function () { return -dist(); }, duration: 1 }, 0);
      cards.forEach(function (c, i) { if (i) t.to(c, { clipPath: 'inset(0 0 0 0%)', duration: .22, ease: 'power2.out' }, Math.max(0, (i - 1.6) / (cards.length - 1))); });
      return function () { sc.classList.remove('is-live'); gsap.set(cards, { clearProps: 'clipPath' }); gsap.set(track, { clearProps: 'transform' }); if (bars) bars.style.removeProperty('--p'); };
    });
  }

  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
