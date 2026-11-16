/* Shaba Costruzioni: header, menu, marquee, reveals, reel hero, roof scene (GSAP), form. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  d.querySelectorAll('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  var hdr = d.querySelector('.hdr'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = d.querySelector('.burger'), nav = d.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); d.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu'); d.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // marquee: duplicate content once for a seamless loop
  var mq = d.querySelector('.proof__track');
  if (mq) { mq.innerHTML += mq.innerHTML.replace(/<p>/g, '<p aria-hidden="true">'); }

  // accordion: only one open at a time
  var acc = d.querySelectorAll('.acc__item');
  acc.forEach(function (it) { it.addEventListener('toggle', function () { if (it.open) acc.forEach(function (o) { if (o !== it) o.open = false; }); }); });

  // reveals
  var rv = d.querySelectorAll('.sechead, .acc__item, .family__media, .family__text, .q, .contact__info, .form');
  rv.forEach(function (n) { n.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (n) { n.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var n = e.target, i = Array.prototype.indexOf.call(n.parentNode.children, n); n.style.transitionDelay = Math.min(i, 4) * 80 + 'ms'; n.classList.add('is-in'); io.unobserve(n); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('is-in'); else io.observe(n); });
  }

  // form validation
  var form = d.querySelector('.form');
  form.addEventListener('submit', function (e) {
    var bad = false;
    form.querySelectorAll('.f').forEach(function (f) {
      var inp = f.querySelector('input, textarea'); if (!inp) return;
      var ok = inp.checkValidity() && (!inp.required || inp.value.trim() !== '');
      if (inp.type === 'tel' && inp.value.replace(/\D/g, '').length < 6) ok = false;
      f.classList.toggle('is-bad', !ok); if (!ok && !bad) { bad = true; inp.focus(); }
    });
    if (bad) e.preventDefault();
  });

  if (reduce || !window.gsap) return;
  var gsap = window.gsap;

  // hero: lines rise, cards slide in from the right (under 1.4 s)
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__title .ln > span', { yPercent: 105, duration: .75, stagger: .08 }, 0)
    .from('.hero__kicker, .hero__sub, .hero__cta', { opacity: 0, y: 14, duration: .55, stagger: .07 }, .25)
    .from('.reel__card', { xPercent: 60, opacity: 0, duration: 1, stagger: .08 }, .1);

  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    // reel drifts left with scroll (transform only, no scroll-jacking)
    gsap.to('.reel__track', { x: function () { return -Math.min(420, window.innerWidth * .32); }, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // count-up of the Google score (5)
    var sc = d.querySelector('.js-count');
    ScrollTrigger.create({ trigger: sc, start: 'top 85%', once: true, onEnter: function () { var o = { v: 0 }; gsap.to(o, { v: 5, duration: 1, ease: 'power2.out', onUpdate: function () { sc.textContent = Math.round(o.v); } }); } });

    // family photo wipe
    gsap.from('.family__media img', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: '.family', start: 'top 70%' } });

    // signature scene: a roof builds up layer by layer
    var names = ['Travi in legno', 'Tavolato', 'Barriera al vapore', 'Isolante', 'Guaina impermeabile', 'Coppi'];
    var lis = d.querySelectorAll('.layers li'), ln = d.querySelector('.js-ln'), lt = d.querySelector('.js-lt');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (c) {
      var cur = -1;
      function setL(i) { if (i === cur) return; cur = i; lis.forEach(function (li, k) { li.classList.toggle('is-on', k <= i); }); ln.textContent = i + 1; lt.textContent = names[i]; }
      setL(0);
      var t = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: '.roof', pin: '.roof__pin', start: 'top top', end: c.conditions.phone ? '+=140%' : '+=260%', scrub: .6,
          onUpdate: function (s) { setL(Math.max(0, Math.min(5, Math.floor(s.progress * 6.2 - .1)))); } }
      });
      t.from('.roof__copy .num, .roof__copy .h2, .roof__lead', { opacity: 0, y: 30, duration: .3, stagger: .08 }, 0)
       .from('.house', { opacity: 0, y: 40, duration: .4 }, 0)
       .from('.ly--1', { opacity: 0, y: -120, duration: .5 }, .2);
      ['.ly--2', '.ly--3', '.ly--4', '.ly--5', '.ly--6'].forEach(function (s, i) { t.from(s, { opacity: 0, y: -140, duration: .5 }, .8 + i * .6); });
      t.fromTo('.drop', { y: -40, opacity: 0 }, { y: 30, opacity: 1, duration: .8, stagger: .15, ease: 'none' }, 2.6)
       .to('.drop', { y: 60, opacity: 0, duration: .5, stagger: .1 }, 3.5)
       .to({}, { duration: .4 });
      return function () { setL(5); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
