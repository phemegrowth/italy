/* Jo&Jo Ristrutturazioni: header, menu, reveals, hero grid, scene (GSAP), form. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // year
  d.querySelectorAll('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // header shrink + phone bar
  var hdr = d.querySelector('.hdr'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 40);
    if (mbar && hero) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu
  var burger = d.querySelector('.burger'), nav = d.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); d.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // reveals (above-the-fold guard)
  var rv = d.querySelectorAll('.works__head, .wlist li, .method__photo, .track li, .owner__score, .owner__text, .contact__info, .form, .proof p');
  rv.forEach(function (n) { n.classList.add('rv'); });
  if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (n) { n.classList.add('is-in'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var n = e.target, i = Array.prototype.indexOf.call(n.parentNode.children, n); n.style.transitionDelay = Math.min(i, 5) * 80 + 'ms'; n.classList.add('is-in'); io.unobserve(n); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('is-in'); else io.observe(n); });
  }

  // works list: hover / tap swaps the photo
  var peek = d.querySelectorAll('.works__peek img'), items = d.querySelectorAll('.wlist li');
  function setK(k) { peek.forEach(function (im) { im.classList.toggle('is-on', im.dataset.k === k); }); items.forEach(function (li) { li.classList.toggle('is-on', li.dataset.k === k); }); }
  items.forEach(function (li) { li.addEventListener('mouseenter', function () { setK(li.dataset.k); }); li.addEventListener('click', function () { setK(li.dataset.k); }); });

  // count-up (sourced: 15 Google reviews)
  function countUp(el) {
    var to = +el.dataset.to, t0 = null;
    if (reduce) { el.textContent = to; return; }
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var cnt = d.querySelectorAll('.js-count');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); } }); }, { threshold: .6 });
    cnt.forEach(function (c) { io2.observe(c); });
  }

  // form validation
  var form = d.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
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

  // hero entrance: grid lines draw, frame + photo reveal, headline lines rise. All within 1.4 s.
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__grid .g--h', { scaleX: 0, transformOrigin: '0 50%', duration: 1, stagger: .1 }, 0)
    .from('.hero__grid .g--v', { scaleY: 0, transformOrigin: '50% 0', duration: 1, stagger: .08 }, 0.05)
    .from('.hero__title .ln > span', { yPercent: 110, duration: .8, stagger: .09 }, 0.1)
    .from('.eyebrow, .hero__sub, .hero__cta', { opacity: 0, y: 16, duration: .6, stagger: .08 }, 0.35)
    .from('.hero__frame', { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power2.inOut' }, 0.15)
    .from('.hero__img img', { scale: 1.18, duration: 1.6 }, 0.15)
    .from('.tick', { opacity: 0, scale: .4, duration: .5, stagger: .1 }, 0.8);
  gsap.to('.hero__img img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    // method: progress line draws with scroll
    var track = d.querySelector('.track');
    ScrollTrigger.create({ trigger: track, start: 'top 75%', end: 'bottom 60%', scrub: true, onUpdate: function (s) { track.style.setProperty('--p', s.progress.toFixed(3)); } });
    track.style.setProperty('--p', 0);

    // signature scene: the room goes from demolition to finished, photos rise like a wall going up
    var steps = d.querySelectorAll('.steps li'), tag = d.querySelector('.js-tag'), pct = d.querySelector('.js-pct');
    var names = ['01 Demolizione', '02 Muri e cartongesso', '03 Pittura e pavimenti', '04 Chiavi in mano'];
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (c) {
      var phone = c.conditions.phone;
      gsap.set('.sf--2, .sf--3, .sf--4', { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.gauge__bar', { scaleX: 0 });
      var cur = -1;
      var st = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.scene', pin: '.scene__pin', start: 'top top', end: phone ? '+=130%' : '+=240%', scrub: .6,
          onUpdate: function (s) {
            var p = s.progress, i = Math.min(3, Math.floor(p * 4 * 0.999 + (p > .97 ? 1 : 0)));
            i = p < .22 ? 0 : p < .5 ? 1 : p < .78 ? 2 : 3;
            pct.textContent = Math.round(p * 100);
            if (i !== cur) { cur = i; steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); }); tag.textContent = names[i]; }
          }
        }
      });
      st.from('.scene__copy .label, .scene__copy .h2', { opacity: 0, y: 30, duration: .08, stagger: .02 }, 0)
        .from('.scene__frame', { scale: .9, opacity: 0, duration: .1 }, 0)
        .to('.gauge__bar', { scaleX: 1, duration: 1 }, 0)
        .to('.sf--2', { clipPath: 'inset(0% 0% 0% 0%)', duration: .2 }, .2)
        .to('.sf--3', { clipPath: 'inset(0% 0% 0% 0%)', duration: .2 }, .48)
        .to('.sf--4', { clipPath: 'inset(0% 0% 0% 0%)', duration: .2 }, .76)
        .fromTo('.sf', { scale: 1.08 }, { scale: 1, duration: 1 }, 0);
      return function () { gsap.set('.sf', { clearProps: 'all' }); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(build); else build();
})();
