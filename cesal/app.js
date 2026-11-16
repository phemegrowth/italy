/* CESAL: deck hero, reveals, accordion, pinned projects strip, timeline line, form. */
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
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

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

  /* accordion: one open at a time, animated height */
  var items = $$('.acc__i');
  items.forEach(function (d) {
    var sum = $('summary', d), body = $('.acc__b', d);
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) { if (!d.open) items.forEach(function (o) { if (o !== d) o.open = false; }); return; }
      e.preventDefault();
      if (d.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 320, easing: 'ease-out' }).onfinish = function () { d.open = false; };
      } else {
        items.forEach(function (o) { if (o !== d && o.open) o.open = false; });
        d.open = true; var h2 = body.offsetHeight;
        body.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 380, easing: 'cubic-bezier(.22,.8,.2,1)' });
      }
    });
  });

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

  if (!hasG || reduce) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: cards start stacked in the middle of the deck, then fan out to the collage */
  var deck = $('.deck'), cards = $$('.card');
  var dr = deck.getBoundingClientRect();
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__title .ln > span', { yPercent: 110, duration: .75, stagger: .09 }, 0)
    .from('.hero .hl > span', { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15);
  cards.forEach(function (c, i) {
    var r = c.getBoundingClientRect();
    var dx = (dr.left + dr.width / 2) - (r.left + r.width / 2), dy = (dr.top + dr.height / 2) - (r.top + r.height / 2);
    tl.from(c, { x: dx, y: dy, rotation: (i % 2 ? -8 : 8), scale: .82, opacity: 0, duration: 1.05, ease: 'power4.out' }, .12 + i * .07);
  });
  /* slow drift of the deck while the hero scrolls away */
  cards.forEach(function (c, i) {
    gsap.to(c, { yPercent: (i % 2 ? -10 : -4) * (1 + i * .3), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
  });

  function works() {
    var track = $('.works__track'), pjs = $$('.pj'), num = $('[data-n]'), pb = $('.works__bar span');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var move = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: '.works', start: 'top top', end: function () { return '+=' + Math.round(dist() * (phone ? 1.05 : 1.2)); },
          pin: true, scrub: .5, invalidateOnRefresh: true,
          onUpdate: function (s) {
            var n = Math.min(pjs.length, Math.max(1, Math.round(s.progress * (pjs.length - 1)) + 1));
            if (num) num.textContent = (n < 10 ? '0' : '') + n;
            if (pb) pb.style.setProperty('--p', s.progress);
          }
        }
      });
      pjs.forEach(function (p, i) {
        if (i === 0 || (!phone && i < 3)) return;
        gsap.fromTo($('.pj__img', p), { clipPath: 'inset(0 0 0 100%)' }, {
          clipPath: 'inset(0 0 0 0%)', ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: move, start: 'left 100%', end: 'left 55%', scrub: true }
        });
      });
      if (pb) pb.style.setProperty('--p', 0);
    });
  }

  function line() {
    var l = $('.tl__line span'); if (!l) return;
    l.style.setProperty('--p', 0);
    ST.create({ trigger: '.tl', start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { l.style.setProperty('--p', s.progress); } });
  }

  var go = function () { works(); line(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
