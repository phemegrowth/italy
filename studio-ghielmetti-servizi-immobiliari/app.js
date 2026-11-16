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
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

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

  /* hero figure counts up (5 cantieri, from their site) */
  var cnt = document.querySelector('.cnt');
  if (cnt && !reduce) {
    var to = +cnt.getAttribute('data-to');
    cnt.textContent = '0';
    setTimeout(function () {
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 900);
        cnt.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, 600);
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
    gsap.to('.hero__mask img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* signature scene: Condominio Maiorca 1, from class F to class A */
    var phases = gsap.utils.toArray('.phases li');
    var cells = gsap.utils.toArray('.cls__c');           /* A..G */
    var val = document.querySelector('.cls__val');
    var steps = ['F', 'E', 'D', 'C', 'B', 'A2'];
    var idx = { F: 5, E: 4, D: 3, C: 2, B: 1, A2: 0 };
    function setClass(v) {
      val.textContent = v;
      cells.forEach(function (c, i) { c.classList.toggle('is-on', i === idx[v]); });
    }
    function setPhase(n) { phases.forEach(function (p, i) { p.classList.toggle('is-on', i < n); }); }
    setClass('F'); setPhase(0);

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var scaf = document.querySelectorAll('.bld__scaf path');
      var len = 3000;
      gsap.set(scaf, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set('.bld__coat rect', { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set('.roof1', { y: -60, opacity: 0 });
      gsap.set('.roof0', { fill: '#6e6a66' });
      gsap.set('.cantieri__head > *, .side', { opacity: 0, y: 24 });
      gsap.set('.bld', { opacity: 0, y: 30 });
      var state = { p: 0 };
      var tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.cantieri', start: 'top top', end: phone ? '+=140%' : '+=240%', pin: '.cantieri__pin', scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) {
            var p = st.progress;
            setPhase(p < 0.18 ? 0 : p < 0.38 ? 1 : p < 0.62 ? 2 : p < 0.8 ? 3 : 4);
            var k = Math.max(0, Math.min(1, (p - 0.3) / 0.6));
            setClass(steps[Math.min(steps.length - 1, Math.floor(k * steps.length))]);
          }
        }
      });
      tl.to('.cantieri__head > *', { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0)
        .to('.bld', { opacity: 1, y: 0, duration: 0.5 }, 0.05)
        .to('.side', { opacity: 1, y: 0, duration: 0.5 }, 0.15)
        .to(scaf, { strokeDashoffset: 0, duration: 0.9, stagger: 0.04 }, 0.5)
        .to('.bld__coat rect', { scaleX: 1, duration: 0.7, stagger: { each: 0.25, from: 'end' } }, 1.3)
        .to('.roof1', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 2.6)
        .to('.roof0', { fill: '#b9583d', duration: 0.5 }, 2.9)
        .to(scaf, { opacity: 0, duration: 0.5 }, 3.4)
        .to({}, { duration: 0.6 });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
