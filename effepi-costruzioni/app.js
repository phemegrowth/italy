(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* hero entrance: starts on the first frame, never waits for fonts or images */
  var hero = $('.hero');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });

  /* year */
  $$('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* header shrink + phone bar after the hero */
  var hdr = $('.hdr'), bar = $('.mbar');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 24);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && !menu.hidden) setMenu(false); });

  /* language placeholder */
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* reveals with above-the-fold guard */
  var rvs = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = $$('.rv', e.target.parentNode);
        e.target.style.setProperty('--d', (Math.max(0, sibs.indexOf(e.target)) % 5) * 0.08 + 's');
        e.target.classList.add('is-in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  }

  /* SOA cards: accent edge + count-up of the class amounts */
  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  $$('.soa__card').forEach(function (card) {
    var done = false;
    function run() {
      if (done) return; done = true; card.classList.add('is-in');
      var c = $('.count', card); if (!c || reduce) return;
      var to = +c.getAttribute('data-to'), t0 = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur); p = 1 - Math.pow(1 - p, 3);
        c.textContent = fmt(to * p);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if (reduce || !('IntersectionObserver' in window)) { card.classList.add('is-in'); return; }
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.4 }).observe(card);
  });

  /* sectors: the item in the middle of the screen (phone) or under the pointer (desktop) drives the photo */
  var imgs = $$('.sect__frame img'), items = $$('.slist li'), num = $('.sect__num');
  function setSector(li) {
    var k = li.getAttribute('data-k');
    items.forEach(function (x) { x.classList.toggle('is-on', x === li); });
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
    if (num) num.textContent = ('0' + (items.indexOf(li) + 1)).slice(-2);
  }
  if (items.length) {
    setSector(items[0]);
    items.forEach(function (li) { li.addEventListener('mouseenter', function () { if (window.innerWidth >= 1000) setSector(li); }); });
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setSector(e.target); }); }, { rootMargin: '-55% 0px -40% 0px' });
      items.forEach(function (li) { so.observe(li); });
    }
  }

  /* gallery: drag to scroll with the mouse (touch scrolls natively) */
  var track = $('.gal__track');
  if (track) {
    var down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('is-drag'); });
    track.addEventListener('pointermove', function (e) { if (!down) return; track.scrollLeft = sl - (e.clientX - sx); });
  }

  /* magnetic primary buttons, desktop pointer only */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.15 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = $('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono valido.', email: "Controllate l'indirizzo email.", message: 'Diteci in breve cosa c\'è da fare.' };
    function check(el) {
      var v = el.value.trim(), ok = true;
      if (el.name === 'name') ok = v.length > 1;
      if (el.name === 'phone') ok = v.replace(/[^\d]/g, '').length >= 6;
      if (el.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (el.name === 'message') ok = v.length > 3;
      var err = el.parentNode.querySelector('.f__err');
      el.classList.toggle('is-bad', !ok); el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.textContent = ok ? '' : msgs[el.name];
      return ok;
    }
    var fields = $$('[required]', form);
    fields.forEach(function (el) { el.addEventListener('blur', function () { if (el.value) check(el); }); });
    form.addEventListener('submit', function (e) {
      var bad = fields.filter(function (el) { return !check(el); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); }
    });
  }

  /* signature scene + method line: GSAP, after fonts, in page order */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    var ex = $('.ex'), slices = $$('.ex__slice'), labels = $$('.ex__labels li');
    var count = $('.ex__count'), barI = $('.ex__bar i');
    ex.classList.add('is-live');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 999px)', desk: '(min-width: 1000px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var gap = phone ? 14 : 30;
      gsap.set(slices, { y: 0, x: 0, opacity: 0, '--edge': 0 });
      var dim = phone ? 0 : 0.22;
      gsap.set(labels, { opacity: dim, y: phone ? 16 : 0 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ex, start: 'top top', end: phone ? '+=130%' : '+=240%', pin: '.ex__pin', scrub: 0.6,
          onUpdate: function (st) {
            var n = Math.min(5, Math.floor(st.progress * 5.2));
            count.textContent = '0' + n;
            barI.style.setProperty('--p', st.progress.toFixed(3));
          }
        }
      });
      /* 1: the building assembles, slice by slice, from the ground up */
      tl.fromTo(slices.slice().reverse(), { opacity: 0, y: function (i) { return 60 + i * 10; } }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' });
      /* 2: it pulls apart into its trades, the accent edge on each cut, labels from the foundations up */
      tl.to(slices, { y: function (i) { return (i - 2) * gap; }, x: function (i) { return phone ? 0 : (i % 2 ? 1 : -1) * 18; }, '--edge': 1, duration: 0.8, ease: 'power1.inOut' }, '+=0.1');
      var order = labels.slice().reverse();
      order.forEach(function (li, k) {
        var at = 1.3 + k * 0.5;
        tl.to(li, { opacity: 1, y: 0, duration: 0.18 }, at);
        tl.to(slices[4 - k], { scale: phone ? 1.03 : 1.04, duration: 0.18 }, at);
        if (k < order.length - 1) {
          tl.to(li, { opacity: dim, y: phone ? -12 : 0, duration: 0.18 }, at + 0.4);
          tl.to(slices[4 - k], { scale: 1, duration: 0.18 }, at + 0.4);
        }
      });
      /* 3: closes back into one building */
      tl.to(slices, { y: 0, x: 0, '--edge': 0, scale: 1, duration: 0.6, ease: 'power2.inOut' }, '+=0.15');
      tl.to(phone ? order[order.length - 1] : labels, { opacity: 1, duration: phone ? 0.01 : 0.3 }, '<');
      return function () { gsap.set(slices.concat(labels), { clearProps: 'transform,opacity,--edge' }); };
    });

    /* method: progress line draws with scroll */
    var steps = $('.steps');
    ScrollTrigger.create({ trigger: steps, start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (st) { steps.style.setProperty('--p', st.progress.toFixed(3)); } });
    steps.style.setProperty('--p', 0);

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
