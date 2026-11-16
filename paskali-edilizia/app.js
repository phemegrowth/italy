/* Paskali Edilizia: split hero with parallax photo, accordion, pinned horizontal strip of their jobs, review count, form. */
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

  $$('.cnt').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; obs.disconnect();
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1100, 1); var v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); obs.observe(el);
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* accordion: one open at a time, height animated */
  var acs = $$('.ac');
  acs.forEach(function (d) {
    var s = $('summary', d), body = $('.ac__body', d);
    s.addEventListener('click', function (e) {
      e.preventDefault();
      var open = d.hasAttribute('open');
      acs.forEach(function (o) { if (o !== d && o.hasAttribute('open')) close(o); });
      if (open) close(d); else openIt(d);
    });
    function openIt(el) {
      el.setAttribute('open', ''); var b = $('.ac__body', el);
      if (reduce || !hasG) return;
      window.gsap.fromTo(b, { height: 0 }, { height: b.scrollHeight, duration: .45, ease: 'power2.out', clearProps: 'height' });
    }
    function close(el) {
      var b = $('.ac__body', el);
      if (reduce || !hasG) { el.removeAttribute('open'); return; }
      window.gsap.to(b, { height: 0, duration: .35, ease: 'power2.in', onComplete: function () { el.removeAttribute('open'); b.style.height = ''; } });
    }
    d._close = close;
  });

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

  /* hero entrance (about 1.2 s) */
  if (hasG && !reduce) {
    var g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__title .ln > span', { yPercent: 105, duration: .7, stagger: .09 }, 0)
      .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
      .from('.hero__pic', { clipPath: 'inset(0 0 0 100%)', duration: 1, ease: 'power4.inOut' }, 0)
      .from('.hero__pic img', { scale: 1.18, duration: 1.6, ease: 'power2.out' }, 0)
      .from('.hero__pic figcaption', { xPercent: -100, duration: .5 }, .9);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function parallax() {
    if (reduce) return;
    gsap.to('.hero__pic img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  function scene() {
    var sc = $('.scene'), wrap = $('.track-wrap'), track = $('.track'), cards = $$('.card'), q = $('[data-q]'), prog = $('.prog span');
    if (!sc) return;
    if (reduce) { prog.style.setProperty('--p', 1); return; }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', desk: '(min-width: 700px)' }, function (ctx) {
      wrap.style.overflow = 'visible';
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: sc, start: 'top top', end: function () { return '+=' + dist() * (ctx.conditions.phone ? 0.9 : 1.1); }, pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (s) { prog.style.setProperty('--p', s.progress); var k = Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1))); q.textContent = '0' + (k + 1); } } });
      cards.forEach(function (c, i) {
        var fig = $('figure', c), txt = $('.card__t', c);
        if (i < (ctx.conditions.phone ? 1 : 3)) return;
        gsap.fromTo(fig, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 100%', end: 'left 62%', scrub: true } });
        gsap.from(txt, { opacity: 0, y: 20, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 85%', end: 'left 60%', scrub: true } });
      });
      gsap.from('.scene__top', { y: 30, opacity: 0, duration: .8, scrollTrigger: { trigger: sc, start: 'top 75%' } });
      return function () { wrap.style.overflow = ''; };
    });
  }

  var go = function () { parallax(); scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
