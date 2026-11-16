/* Luca Conte: double-frame hero, reveals, sticky list of finishes driving his photos, form. */
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
      var sib = $$('.r', e.parentElement).indexOf(e); e.style.setProperty('--d', Math.min(Math.max(sib, 0), 5) * 0.08 + 's');
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

  /* hero: outer frame draws, inner gold frame follows, the photo fades in inside, the title rises (about 1.3 s) */
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .09 }, 0)
      .from('.hero .hl > span', { y: 16, opacity: 0, duration: .5, stagger: .07 }, .2)
      .from('.fr--o', { clipPath: 'inset(0 100% 100% 0)', duration: .9, ease: 'power2.inOut' }, 0)
      .from('.fr--i', { clipPath: 'inset(100% 0 0 100%)', duration: .9, ease: 'power2.inOut' }, .15)
      .from('.hero__pic', { opacity: 0, duration: .8 }, .3)
      .from('.hero__pic img', { scale: 1.12, duration: 1.8, ease: 'power2.out' }, .3)
      .from('.hero__cap', { opacity: 0, y: 8, duration: .5 }, 1);
  }

  /* scene: the active finish switches the photo */
  var fs = $$('.f'), sps = $$('.sp'), q = $('[data-q]');
  function setF(k) { fs.forEach(function (f, i) { f.classList.toggle('is-on', i === k); }); sps.forEach(function (s, i) { s.classList.toggle('is-on', i === k); }); if (q) q.textContent = '0' + (k + 1); }
  if (reduce) { fs.forEach(function (f) { f.classList.add('is-on'); }); }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function scene() {
    var sc = $('.scene'); if (!sc || reduce) return;
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', desk: '(min-width: 900px)' }, function (ctx) {
      sc.classList.add('is-live'); setF(0);
      var n = fs.length;
      var t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sc, start: 'top top', end: ctx.conditions.phone ? '+=150%' : '+=260%', pin: true, scrub: .5,
        onUpdate: function (s) { setF(Math.min(n - 1, Math.floor(s.progress * n * 0.9999))); } } });
      t.fromTo('.scene__pics', { scale: .94 }, { scale: 1, duration: 1 }, 0);
      return function () { sc.classList.remove('is-live'); };
    });
  }

  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
