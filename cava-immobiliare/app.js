/* Cava Immobiliare, Varese. Vanilla JS + GSAP ScrollTrigger (local copies). */
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hero entrance: start on the first frame, no waiting for fonts or images */
  requestAnimationFrame(function () { root.classList.add('is-ready'); });

  /* footer year */
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* header shrink + phone bar after the hero */
  var header = document.querySelector('.header');
  var bar = document.querySelector('.bar');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* language switch is a placeholder */
  document.querySelectorAll('.lang__off').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* count-up (quantities only) */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* reveals with an above-the-fold guard */
  var targets = document.querySelectorAll('.reveal, .about__media, [data-count]');
  function show(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          setTimeout(function () { show(el); }, Math.min(sibs, 5) * 80);
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  } else {
    targets.forEach(show);
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var field = inp.closest('.field');
        var err = field ? field.querySelector('.field__err') : null;
        var msg = '';
        var v = inp.value.trim();
        if (!v) msg = 'Campo obbligatorio.';
        else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Controllate l\'indirizzo email.';
        else if (inp.type === 'tel' && v.replace(/\D/g, '').length < 6) msg = 'Controllate il numero di telefono.';
        if (field) field.classList.toggle('is-bad', !!msg);
        if (err) err.textContent = msg;
        if (msg && ok) { ok = false; inp.focus(); }
      });
      if (!ok) e.preventDefault();
    });
  }

  /* GSAP: hero parallax, the 3D ring (signature scene), steps line */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();

    /* hero photo moves slower than the page */
    gsap.to('.hero__img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ring of listings */
    var vet = document.querySelector('.vetrina');
    var track = document.querySelector('.ring__track');
    var cards = track ? Array.prototype.slice.call(track.children) : [];
    var cur = document.querySelector('.vetrina__cur');
    var barFill = document.querySelector('.vetrina__bar span');
    if (vet && track && cards.length) {
      var n = cards.length, stepDeg = 360 / n;
      mm.add({ phone: '(max-width: 700px)', big: '(min-width: 701px)' }, function (ctx) {
        vet.classList.add('ring-on');
        var R = 0;
        function layout() {
          var w = track.offsetWidth;
          R = Math.round((w / 2) / Math.tan(Math.PI / n) * (ctx.conditions.phone ? 1.08 : 1.18));
          cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * stepDeg) + 'deg) translateZ(' + R + 'px)'; });
        }
        layout();
        var last = -1;
        function render(p) {
          var ang = -p * stepDeg * (n - 1);
          track.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + ang + 'deg)';
          var front = Math.round(-ang / stepDeg);
          cards.forEach(function (c, i) {
            var rel = ((i * stepDeg + ang) % 360 + 540) % 360 - 180;
            var a = Math.abs(rel);
            c.style.opacity = a < 1 ? 1 : Math.max(0, 1 - a / (ctx.conditions.phone ? 70 : 110));
            c.classList.toggle('is-front', i === front);
          });
          if (front !== last) {
            last = front;
            if (cur) cur.textContent = String(front + 1).padStart(2, '0');
          }
          if (barFill) barFill.style.transform = 'scaleX(' + ((front + 1) / n) + ')';
        }
        render(0);
        var st = ScrollTrigger.create({
          trigger: vet,
          start: 'top top',
          end: ctx.conditions.phone ? '+=190%' : '+=280%',
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.45 }, delay: 0.08, ease: 'power2.inOut' },
          onUpdate: function (self) { render(self.progress); },
          onRefresh: function (self) { layout(); render(self.progress); }
        });
        return function () {
          st.kill();
          vet.classList.remove('ring-on');
          track.style.transform = '';
          cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.classList.remove('is-front'); });
        };
      });
    }

    /* steps: progress line draws with scroll (desktop) */
    mm.add('(min-width: 1081px)', function () {
      gsap.fromTo('.steps__line span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps__wrap', start: 'top 80%', end: 'bottom 55%', scrub: true } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
