/* Karim Edile: curtain hero, reveals, his bathroom laid tile by tile, form. */
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

  /* split the bathroom photo into 6 x 7 tiles with grout lines */
  var COLS = 6, ROWS = 7, box = $('.tiles'), tiles = [];
  if (box) {
    box.classList.add('is-split');
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var d = document.createElement('div'); d.className = 'tl';
      d.style.backgroundPosition = (c / (COLS - 1) * 100) + '% ' + (r / (ROWS - 1) * 100) + '%';
      d.setAttribute('data-o', (ROWS - 1 - r) * 10 + c); /* laid from the bottom row up, left to right */
      box.appendChild(d); tiles.push(d);
    }
    tiles.sort(function (a, b) { return a.getAttribute('data-o') - b.getAttribute('data-o'); });
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: the cobalt curtain lifts, the K tile turns once, the lines rise (about 1.3 s) */
  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 110, duration: .8, stagger: .09 }, 0)
      .from('.hero .hl > span', { yPercent: 100, opacity: 0, duration: .6, stagger: .07 }, .2)
      .to('.curtain', { yPercent: -101, duration: 1, ease: 'power4.inOut' }, .2)
      .from('.hero__pic img', { scale: 1.2, duration: 1.6, ease: 'power2.out' }, .2)
      .from('.eyebrow .tile', { rotate: -180, scale: 0, duration: .7, ease: 'back.out(2)' }, .1)
      .from('.hero__tag', { opacity: 0, y: 10, duration: .4 }, 1.1);
  } else { gsap.set('.curtain', { yPercent: -101 }); }

  function build() {
    var sc = $('.scene'); if (!sc || reduce || !tiles.length) return;
    var cps = $$('.cp'), cnt = $('[data-c]');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live');
      gsap.set(tiles, { opacity: 0, scale: .4, rotate: function (i) { return (i % 2 ? 8 : -8); }, y: -30 });
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=140%' : '+=240%', pin: true, scrub: .5,
        onUpdate: function (s) {
          var p = s.progress, k = p < .12 ? 0 : p < .82 ? 1 : 2;
          cps.forEach(function (x, i) { x.classList.toggle('is-on', i === k); });
          if (cnt) cnt.textContent = Math.round(Math.min(1, Math.max(0, (p - .1) / .72)) * tiles.length);
        } } });
      t.to({}, { duration: .5 })
       .to(tiles, { opacity: 1, scale: 1, rotate: 0, y: 0, duration: .5, ease: 'power2.out', stagger: { each: .07 } }, .5)
       .to('.tiles', { gap: 1, padding: 1, duration: .6 })
       .to({}, { duration: .3 });
      return function () { sc.classList.remove('is-live'); gsap.set(tiles, { clearProps: 'all' }); gsap.set('.tiles', { clearProps: 'gap,padding' }); };
    });
  }

  var go = function () { build(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
