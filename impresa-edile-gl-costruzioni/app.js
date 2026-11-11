/* GL Costruzioni: hero entrance (photo wipe, line reveal, Ken Burns in CSS), header, full-screen menu,
   anchors, reveals, services image swap (desktop), drag strip, method line, magnetic buttons, phone bar,
   form validation, and the GSAP signature scene: a cartongesso ceiling built in five steps with scroll
   (solaio, orditura, lastre, stucco, luce). Reduced motion and no-JS show the finished ceiling. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.getElementById('header'), bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * .75);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#soffitto' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: hover swaps the photo (desktop only extra) */
  var pic = d.querySelector('[data-swap]');
  if (pic && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cur = pic.getAttribute('src'), tm;
    d.querySelectorAll('.srv__i[data-img]').forEach(function (it) {
      var im = new Image(); im.src = it.getAttribute('data-img');
      it.addEventListener('mouseenter', function () {
        var src = it.getAttribute('data-img');
        if (src === cur) return;
        cur = src;
        pic.parentNode.classList.add('is-swap');
        clearTimeout(tm);
        tm = setTimeout(function () { pic.src = src; pic.parentNode.classList.remove('is-swap'); }, reduce ? 0 : 260);
      });
    });
  }

  /* method line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.ms');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * .8 - r.top) / (r.height + vh * .15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + .02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* drag strip (mouse) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    s.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    buildScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function buildScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var one = function (s) { return sec.querySelector(s); };
    var steps = q('.step'), count = one('[data-count]'), barEl = one('[data-bar]');
    var paths = q('.s-frame .dr');
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var joints = q('.s-joints line');

    gsap.set(one('.s-bulb'), { opacity: 0 });
    gsap.set(q('.bd'), { y: 120, opacity: 0 });
    gsap.set(one('.s-finish'), { opacity: 0 });
    gsap.set(joints, { opacity: 0 });
    gsap.set(one('.s-light'), { opacity: 0 });
    gsap.set(one('.s-dark'), { opacity: 0 });
    gsap.set(q('.tag'), { opacity: 0, y: 8 });
    gsap.set(barEl, { scaleX: 0 });

    var current = 0;
    function setStep(n) {
      if (n === current) return;
      current = n;
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n - 1); });
      if (count) count.textContent = '0' + n;
    }
    setStep(1);

    var mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, function (ctx) {
      var wide = ctx.conditions.wide;
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, pin: one('.scene__pin'), start: 'top top', end: wide ? '+=260%' : '+=140%', scrub: .6,
          onUpdate: function (self) {
            var p = self.progress;
            setStep(p < .2 ? 1 : p < .42 ? 2 : p < .62 ? 3 : p < .8 ? 4 : 5);
          }
        }
      });
      tl.to(one('.s-bulb'), { opacity: 1, duration: .3 }, .1)
        .to(q('[data-tag="1"]'), { opacity: 1, y: 0, duration: .3 }, .5)
        /* 2: frame */
        .to(q('[data-tag="1"]'), { opacity: 0, duration: .2 }, 1.1)
        .to(paths, { strokeDashoffset: 0, duration: .9, stagger: .15 }, 1.1)
        .to(q('[data-tag="2"]'), { opacity: 1, y: 0, duration: .3 }, 1.4)
        /* 3: boards */
        .to(q('[data-tag="2"]'), { opacity: 0, duration: .2 }, 2.3)
        .to(one('.s-bulb'), { opacity: 0, duration: .3 }, 2.3)
        .to(q('.bd'), { y: 0, opacity: 1, duration: .6, stagger: .08, ease: 'power2.out' }, 2.3)
        .to(q('[data-tag="3"]'), { opacity: 1, y: 0, duration: .3 }, 2.8)
        /* 4: joints, then finish */
        .to(q('[data-tag="3"]'), { opacity: 0, duration: .2 }, 3.5)
        .to(joints, { opacity: 1, duration: .25, stagger: .06 }, 3.5)
        .to(one('.s-finish'), { opacity: 1, duration: .5 }, 3.9)
        .to(joints, { opacity: 0, duration: .3 }, 4.2)
        .to(q('[data-tag="4"]'), { opacity: 1, y: 0, duration: .3 }, 3.8)
        /* 5: light */
        .to(q('[data-tag="4"]'), { opacity: 0, duration: .2 }, 4.6)
        .to(one('.s-dark'), { opacity: .55, duration: .5 }, 4.6)
        .to(one('.s-light'), { opacity: 1, duration: .6 }, 4.9)
        .to(q('[data-tag="5"]'), { opacity: 1, y: 0, duration: .3 }, 5.3)
        .to({}, { duration: .4 });
      tl.to(barEl, { scaleX: 1, duration: tl.duration() }, 0);
      return function () { setStep(1); };
    });
  }
})();
