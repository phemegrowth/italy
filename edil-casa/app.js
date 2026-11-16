/* Edil Casa: header, menu, reveals, dealt card deck, accordion, form, and the pinned horizontal job strip (GSAP). */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* year */
  $$('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header shrink + mobile bar */
  var hdr = $('.hdr'), mbar = $('.mbar'), hero = $('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    if (mbar) mbar.classList.toggle('show', y > (hero ? hero.offsetHeight * 0.8 : 600));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* smooth anchors with header offset */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) { if (a.getAttribute('aria-disabled')) e.preventDefault(); return; }
      var t = $(id); if (!t) return; e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* hero entrance: starts on first frame, done well under 1.6 s */
  var lines = $$('.hero__title .ln > span');
  if (!reduce) {
    lines.forEach(function (s, i) {
      s.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 700, delay: 80 + i * 90, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    /* deck: the three cards arrive as one pile from below, then are dealt into the fan */
    $$('.deck__c').forEach(function (c, i) {
      var end = getComputedStyle(c).transform;
      var pile = 'translate(' + (i === 1 ? '58%' : i === 2 ? '-58%' : '0') + ',-30%) rotate(0deg)';
      c.animate([{ transform: pile + ' translateY(30%)', opacity: 0 }, { transform: pile, opacity: 1, offset: .35 }, { transform: end, opacity: 1 }], { duration: 1150, delay: 80 + i * 70, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' });
    });
  }

  /* reveals */
  var rv = $$('.svc__head, .acc__i, .city__card, .steps .eyebrow, .steps h2, .steps__list li, .contact__info, .form, .proof li');
  rv.forEach(function (e) { e.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { var e = en.target, sib = e.parentElement ? Array.prototype.indexOf.call(e.parentElement.children, e) : 0; e.style.transitionDelay = Math.min(sib, 5) * 80 + 'ms'; e.classList.add('in'); io.unobserve(e); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e); });
  }

  /* accordion: one open at a time, smooth height */
  $$('.acc__i').forEach(function (dt) {
    var sm = dt.querySelector('summary'), body = dt.querySelector('.acc__b');
    sm.addEventListener('click', function (e) {
      if (reduce) return; e.preventDefault();
      if (dt.open) { var h = body.offsetHeight; body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 300, easing: 'ease' }).onfinish = function () { dt.open = false; }; }
      else {
        $$('.acc__i').forEach(function (o) { if (o !== dt && o.open) o.open = false; });
        dt.open = true; var h2 = body.offsetHeight; body.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 320, easing: 'ease' });
      }
    });
  });

  /* form validation */
  var form = $('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var v = f.value.trim(), good = v.length > 1;
      if (f.type === 'email') good = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (f.type === 'tel') good = v.replace(/\D/g, '').length >= 6;
      f.parentElement.classList.toggle('bad', !good); if (!good) ok = false;
    });
    if (!ok) { e.preventDefault(); var b = $('.f.bad', form); if (b) b.querySelector('input,textarea').focus(); }
  });

  /* ---------- GSAP: pinned horizontal strip + city parallax ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var scene = $('.hz'), track = $('.hz__track'), cards = $$('.hz__c'), cur = $('.hz__cur'), bar = $('.hz__bar span');
    scene.classList.add('is-pinned');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var mm = gsap.matchMedia();
    function run(end) {
      var tween = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top top', end: end, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (s) { cur.textContent = '0' + Math.min(cards.length, 1 + Math.floor(s.progress * cards.length * 0.999)); gsap.set(bar, { scaleX: 0.25 + s.progress * 0.75 }); } } });
      /* each card unmasks as it slides in */
      cards.forEach(function (c, i) {
        if (i === 0) return;
        gsap.fromTo(c.querySelector('figure'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true } });
        gsap.fromTo(c.querySelector('img'), { scale: 1.25 }, { scale: 1, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 35%', scrub: true } });
      });
      return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
    }
    mm.add('(min-width: 761px)', function () { return run(function () { return '+=' + Math.round(dist() * 1.3); }); });
    mm.add('(max-width: 760px)', function () { return run(function () { return '+=' + Math.round(dist() * 1.1); }); });
    gsap.from(['.hz__head', '.hz__count'], { y: 40, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: scene, start: 'top 70%' } });
    /* city photo drifts slower than the page */
    gsap.fromTo('.city__ph img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.city', start: 'top bottom', end: 'bottom top', scrub: true } });
    ScrollTrigger.refresh();
  }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(build);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
