/* Unitas Immobiliare: fanned card deck hero, exploded palazzo scene, listing showcase, reviews row, form. */
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
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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
  $$('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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

  /* listing showcase: list swaps the large image and caption */
  var btns = $$('.show__list button'), imgs = $$('.show__fig img'), cap = $('.show__cap');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = Number(b.dataset.i);
      btns.forEach(function (o) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      cap.innerHTML = '<span class="tag"></span><h3></h3><p></p>';
      $('.tag', cap).textContent = b.dataset.t; $('h3', cap).textContent = b.dataset.h; $('p', cap).textContent = b.dataset.p;
      if (!reduce && cap.animate) cap.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false');
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.26 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    /* cards in the deck lean toward the cursor */
    var deck = $('.deck');
    deck.addEventListener('mousemove', function (e) {
      var r = deck.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      $$('.deck__c', deck).forEach(function (c, i) { c.style.translate = (dx * (8 + i * 5)) + 'px ' + (dy * (8 + i * 5)) + 'px'; });
    });
    deck.addEventListener('mouseleave', function () { $$('.deck__c', deck).forEach(function (c) { c.style.translate = ''; }); });
  }

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

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var slices = $$('.slice'), tags = $$('.tags li');

  if (reduce) {
    /* final state, static */
    slices.forEach(function (s, i) { gsap.set([s, tags[i]], { yPercent: 0, y: (i - 1.5) * 14 }); });
    return;
  }

  /* hero: the four cards start stacked in the middle, fan out, then settle */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from(lines, { yPercent: 110, duration: .7, stagger: .08 }, 0)
    .from(hls, { y: 18, opacity: 0, duration: .5, stagger: .06 }, .12)
    .from('.deck__c', { x: function (i, el) { var d = el.parentNode.getBoundingClientRect(), r = el.getBoundingClientRect(); return d.left + d.width / 2 - (r.left + r.width / 2); }, y: function (i, el) { var d = el.parentNode.getBoundingClientRect(), r = el.getBoundingClientRect(); return d.top + d.height / 2 - (r.top + r.height / 2); }, rotation: function (i) { return [-2, 2, -1, 1][i]; }, scale: .9, duration: 1.1, stagger: .07, ease: 'power4.out' }, .1)
    .from('.deck__c', { opacity: 0, duration: .3, stagger: .07 }, .1)
    .from('.deck__badge', { scale: 0, rotation: -90, duration: .6, ease: 'back.out(1.8)' }, .9);
  gsap.fromTo('.deck__c img', { scale: 1.12 }, { scale: 1, duration: 14, ease: 'none' });

  function scenes() {
    gsap.to('.deck__c--1', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.deck__c--2', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.deck__c--4', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(tags, { opacity: 0, x: phone ? -10 : 30 });
      var t = gsap.timeline({ scrollTrigger: { trigger: '.floors', start: 'top top', end: phone ? '+=130%' : '+=220%', pin: true, scrub: .6, anticipatePin: 1 } });
      t.from('.stack', { scale: .92, opacity: .4, duration: .15 }, 0);
      slices.forEach(function (s, i) {
        var dy = (i - 1.5) * (phone ? 30 : 46);
        var dx = phone ? 0 : (i % 2 ? 22 : -22);
        t.to(s, { y: dy, x: dx, duration: .45, ease: 'power2.inOut' }, .15)
          .to(tags[i], { y: dy, duration: .45, ease: 'power2.inOut' }, .15)
          .to(tags[i], { opacity: 1, x: 0, duration: .12 }, .3 + i * .12);
      });
      t.to({}, { duration: .1 }, .9);
    });
  }
  var go = function () { scenes(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
