/* Il Piacere di Abitare: split hero, accordion, door scene, listing chips, form. */
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
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.55);
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

  /* accordion: one open at a time, height animated */
  var accs = $$('.acc__i');
  accs.forEach(function (d) {
    var sum = $('summary', d), body = $('.acc__b', d);
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) { accs.forEach(function (o) { if (o !== d) o.open = false; }); return; }
      e.preventDefault();
      if (d.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = function () { d.open = false; };
      } else {
        accs.forEach(function (o) { if (o !== d && o.open) o.open = false; });
        d.open = true; var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    });
  });

  /* listing chips */
  var chips = $$('.chip'), cards = $$('.card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.f;
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cards.forEach(function (k) {
        var show = f === 'all' || k.dataset.k === f;
        k.classList.toggle('is-out', !show);
        if (show && !reduce && k.animate) k.animate([{ opacity: 0, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
    });
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.26 + 'px)'; });
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
      check('#f-type', function (v) { return !!v; }, 'Scegliete una voce.');
      if (!ok) e.preventDefault();
    });
  }

  var steps = $$('.steps li'), tag = $('[data-step]'), cur = -1;
  function stepAt(k) {
    if (k === cur) return; cur = k;
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
    if (tag) tag.textContent = ('0' + (k + 1)).slice(-2);
  }

  if (!hasG) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  /* hero: lines rise, photo wipes in from the right edge, stamp rolls in, big word slides */
  var lines = $$('.hero__title .ln > span'), hls = $$('.hero .hl > span');
  if (!reduce) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(lines, { yPercent: 115, duration: .75, stagger: .09 }, 0)
      .from(hls, { y: 18, opacity: 0, duration: .55, stagger: .07 }, .15)
      .from('.hero__clip', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.1, ease: 'power4.inOut' }, .05)
      .from('.hero__clip img', { scale: 1.2, duration: 1.6 }, .05)
      .from('.stamp', { scale: 0, rotate: -120, duration: .7, ease: 'back.out(1.8)' }, .8)
      .from('.hero__big span', { xPercent: -30, opacity: 0, duration: 1.2 }, .3);
    var mmH = gsap.matchMedia();
    mmH.add('(min-width: 761px)', function () {
      gsap.to('.hero__clip img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__big span', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
  }

  function scene() {
    if (reduce) { stepAt(steps.length - 1); return; }
    stepAt(0);
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone, n = steps.length;
      var t = gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: phone ? '+=140%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1,
        onUpdate: function (s) { stepAt(Math.min(n - 1, Math.floor(s.progress * n * 0.999))); } } });
      t.from('.door', { y: 40, opacity: .3, duration: .08 }, 0)
        .fromTo('.key', { opacity: 0, x: -80, rotate: 0 }, { opacity: 1, x: 0, duration: .1 }, .04)
        .to('.key', { rotate: 90, duration: .1, transformOrigin: '18% 50%' }, .16)
        .to('.key', { opacity: 0, duration: .05 }, .27)
        .to('.door__knob', { scale: 1.6, duration: .04, yoyo: true, repeat: 1 }, .22)
        .to('.door__leaf--l', { rotateY: -104, duration: .42, ease: 'power1.inOut' }, .3)
        .to('.door__leaf--r', { rotateY: 104, duration: .42, ease: 'power1.inOut' }, .3)
        .fromTo('.door__room img', { scale: 1.25 }, { scale: 1, duration: .6, ease: 'none' }, .3)
        .to({}, { duration: .08 }, .92);
    });
  }
  var go = function () { scene(); ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  window.addEventListener('load', function () { ST.refresh(); });
})();
