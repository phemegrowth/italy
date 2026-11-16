/* Studio Immobiliare Veneto: header, menu, reveals, type-first hero, map scene (GSAP), form. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  d.querySelectorAll('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  var hdr = d.querySelector('.hdr'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
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

  var rv = d.querySelectorAll('.proof p, .serv__side, .slist li, .sell__photo, .steps li, .studio__text, .studio__img, .contact__info, .form');
  rv.forEach(function (n) { n.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (n) { n.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var n = e.target, i = Array.prototype.indexOf.call(n.parentNode.children, n); n.style.transitionDelay = Math.min(i, 4) * 80 + 'ms'; n.classList.add('is-in'); io.unobserve(n); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('is-in'); else io.observe(n); });
  }

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

  // hero: name rises line by line, photo strip slides in from the right
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__name .ln > span', { yPercent: 105, duration: .8, stagger: .09 }, 0)
    .from('.hero__kicker, .hero__sub, .hero__cta', { opacity: 0, y: 14, duration: .55, stagger: .07 }, .3)
    .from('.strip figure', { xPercent: 70, opacity: 0, duration: 1, stagger: .08 }, .2);

  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    // strip: gentle parallax per figure (desktop)
    gsap.matchMedia().add('(min-width: 761px)', function () {
      d.querySelectorAll('.strip img').forEach(function (im, i) {
        gsap.fromTo(im, { yPercent: -4 - i * 2 }, { yPercent: 4 + i * 2, ease: 'none', scrollTrigger: { trigger: '.strip', start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });

    // count-up of the 20 listings
    var c = d.querySelector('.js-count');
    ScrollTrigger.create({ trigger: c, start: 'top 90%', once: true, onEnter: function () { var o = { v: 0 }; gsap.to(o, { v: 20, duration: 1.2, ease: 'power2.out', onUpdate: function () { c.textContent = Math.round(o.v); } }); } });

    // sell steps progress line
    var bar = d.querySelector('.steps__bar');
    ScrollTrigger.create({ trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: true, onUpdate: function (s) { bar.style.setProperty('--p', s.progress.toFixed(3)); } });
    bar.style.setProperty('--p', 0);

    // signature scene: route on the map, one listing at a time
    var pins = d.querySelectorAll('.pin[data-i]'), routes = d.querySelectorAll('.route'), cards = d.querySelectorAll('.card');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (cx) {
      var cur = -1;
      function setI(i) { if (i === cur) return; cur = i; cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); }); pins.forEach(function (p, k) { p.classList.toggle('is-on', k === i); }); }
      setI(0);
      gsap.set(pins, { opacity: 0, y: -26 });
      gsap.set(routes, { opacity: 0 });
      var t = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.mapsec', pin: '.mapsec__pin', start: 'top top', end: cx.conditions.phone ? '+=170%' : '+=260%', scrub: .5,
          onUpdate: function (s) { setI(Math.max(0, Math.min(5, Math.floor((s.progress - .08) / .9 * 6)))); } }
      });
      t.from('.mapsec__head', { opacity: 0, y: 24, duration: .3 }, 0)
       .from('.map__walls, .map__river', { opacity: 0, duration: .3 }, 0)
       .from('.pin--home', { opacity: 0, scale: .4, transformOrigin: '50% 50%', duration: .2 }, .15);
      for (var i = 0; i < 6; i++) {
        t.to(routes[i], { opacity: 1, duration: .15 }, .3 + i * .5)
         .to(pins[i], { opacity: 1, y: 0, duration: .2, ease: 'back.out(2)' }, .38 + i * .5);
      }
      t.to({}, { duration: .4 });
      return function () { gsap.set(pins, { clearProps: 'all' }); gsap.set(routes, { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
