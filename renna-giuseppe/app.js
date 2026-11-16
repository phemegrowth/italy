(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('rm');

  /* hero entrance: starts on the first frame */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* header shrink + phone dock */
  var hdr = document.querySelector('.hdr');
  var dock = document.querySelector('.dock');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* reveals with the above-the-fold guard */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el, i) {
      var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(sib, 5) * 80) + 'ms';
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* rating count-up */
  var rn = document.querySelector('.rating__n');
  if (rn && !reduce && 'IntersectionObserver' in window) {
    var target = parseFloat(rn.getAttribute('data-count'));
    rn.textContent = '0,0';
    var ro = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      ro.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1200);
        var v = target * (1 - Math.pow(1 - k, 3));
        rn.textContent = v.toFixed(1).replace('.', ',');
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    ro.observe(rn);
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      function check(id, test, msg) {
        var input = document.getElementById(id);
        var f = input.closest('.f');
        var err = f.querySelector('.f__err');
        var good = test(input.value.trim());
        f.classList.toggle('is-bad', !good);
        if (err) err.textContent = good ? '' : msg;
        if (!good && ok) { input.focus(); ok = false; }
      }
      check('f-name', function (v) { return v.length > 1; }, 'Scrivete il vostro nome.');
      check('f-phone', function (v) { return v.replace(/\D/g, '').length >= 6; }, 'Serve un numero per richiamarvi.');
      check('f-email', function (v) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, 'Controllate l\'indirizzo email.');
      if (!ok) e.preventDefault();
    });
  }

  var yr = document.querySelector('.yr');
  if (yr) yr.textContent = new Date().getFullYear();

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    /* hero photo drifts slower than the page */
    gsap.to('.hero__img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* signature scene: the agency window, card after card */
    var cards = gsap.utils.toArray('.card');
    var rail = gsap.utils.toArray('.rail li');
    var countN = document.querySelector('.count__n');
    var n = cards.length;
    function mark(i) {
      countN.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      var z = cards[i].getAttribute('data-zone');
      rail.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-z') === z); });
    }
    mark(0);

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      cards.forEach(function (c, i) {
        gsap.set(c, { zIndex: n - i, y: i === 0 ? 0 : -Math.min(i, 3) * (phone ? 10 : 16), scale: 1 - Math.min(i, 3) * 0.04, rotation: 0, opacity: i > 3 ? 0 : 1 });
      });
      var head = gsap.from('.vetrina__head > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.6, scrollTrigger: { trigger: '.vetrina', start: 'top 70%' } });
      gsap.from('.deck', { y: 80, opacity: 0, duration: 0.8, scrollTrigger: { trigger: '.vetrina', start: 'top 60%' } });

      var tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.vetrina', start: 'top top', end: phone ? '+=' + (n * 32) + '%' : '+=' + (n * 45) + '%',
          pin: '.vetrina__pin', scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) { mark(Math.min(n - 1, Math.round(st.progress * (n - 1)))); }
        }
      });
      for (var i = 0; i < n - 1; i++) {
        var at = i;
        tl.to(cards[i], { xPercent: phone ? -118 : -135, y: phone ? 20 : 40, rotation: phone ? -10 : -14, duration: 1 }, at);
        tl.set(cards[i], { autoAlpha: 0 }, at + 1);
        for (var k = i + 1; k < Math.min(n, i + 5); k++) {
          var d = k - i - 1;
          tl.to(cards[k], { y: -Math.min(d, 3) * (phone ? 10 : 16), scale: 1 - Math.min(d, 3) * 0.04, opacity: d > 3 ? 0 : 1, duration: 1 }, at);
        }
      }
      return function () { head.kill(); };
    });

    /* zone photo drifts inside its frame */
    gsap.fromTo('.zone__media img', { yPercent: -10 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.zone__media', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* steps line draws with scroll */
    var phoneQ = window.matchMedia('(max-width: 760px)').matches;
    gsap.fromTo('.steps__line span', phoneQ ? { scaleY: 0 } : { scaleX: 0 }, Object.assign(phoneQ ? { scaleY: 1 } : { scaleX: 1 }, { ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: true } }));

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
