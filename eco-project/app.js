(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('rm');

  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  var hdr = document.querySelector('.hdr');
  var dock = document.querySelector('.dock');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 30);
    if (dock) dock.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  /* accordion: one open at a time */
  var items = [].slice.call(document.querySelectorAll('.acc__i'));
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) {
      var idx = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(idx, 5) * 80) + 'ms';
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  }

  /* count-up on the Google rating */
  var cnt = document.querySelector('.cnt');
  if (cnt && !reduce && 'IntersectionObserver' in window) {
    var to = +cnt.getAttribute('data-to');
    cnt.textContent = '0';
    var co = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      co.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 900);
        cnt.textContent = Math.round(to * k);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.8 });
    co.observe(cnt);
  }

  var form = document.querySelector('.form');
  if (form) form.addEventListener('submit', function (e) {
    var ok = true;
    function check(id, test, msg) {
      var input = document.getElementById(id), f = input.closest('.f'), err = f.querySelector('.f__err');
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

  var yr = document.querySelector('.yr');
  if (yr) yr.textContent = new Date().getFullYear();

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    /* hero photo drifts inside the drawn frame */
    gsap.to('.hero__ph img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* signature scene: the house opens layer by layer */
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var gap = phone ? 18 : 30;
      var s = gsap.utils.toArray('.exp__s');
      var l = gsap.utils.toArray('.exp__lbl li');
      gsap.set(l, { opacity: 0, x: 24, y: 0 });
      gsap.set(s, { y: 0 });
      gsap.set('.exp', { y: gap * 1.5 });
      gsap.set('.exp__stack', { opacity: 0, y: 40 });
      gsap.set('.cantiere__head > *', { opacity: 0, y: 24 });
      var tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: '.cantiere', start: 'top top', end: phone ? '+=130%' : '+=230%', pin: '.cantiere__pin', scrub: 0.6, anticipatePin: 1 }
      });
      tl.to('.cantiere__head > *', { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 }, 0)
        .to('.exp__stack', { opacity: 1, y: 0, duration: 0.6 }, 0.1);
      /* bottom slice first: foundations, then upward */
      for (var k = 3; k >= 1; k--) {
        var at = 0.8 + (3 - k) * 0.6;
        for (var j = 0; j < k; j++) { tl.to(s[j], { y: '-=' + gap, duration: 0.6 }, at); tl.to(l[j], { y: '-=' + gap, duration: 0.6 }, at); }
        tl.to(l[k], { opacity: 1, x: 0, duration: 0.5 }, at + 0.1);
      }
      tl.to(l[0], { opacity: 1, x: 0, duration: 0.5 }, 0.8 + 3 * 0.6);
      tl.to({}, { duration: 0.6 });
    });

    /* steps line */
    var steps = document.querySelector('.steps');
    gsap.fromTo(steps, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 55%', scrub: true } });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
