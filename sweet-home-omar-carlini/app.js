/* Sweet Home di Omar Carlini: header, menu, anchors, reveals, hero count-up (15 years, from Omar's own intro),
   accordion, steps track, phone bar, form validation, and the GSAP signature scene: six real listings on a 3D ring
   that turns with the scroll, the front card edged in the logo red. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready', 'reduce');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), bar = d.querySelector('.bar'), hero = d.querySelector('.hero');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id === '#top' || id.length < 2) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: years of experience (Omar's own Facebook intro) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });


  /* accordion with height animation */
  d.querySelectorAll('.acc__i').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      det.classList.add('is-anim');
      if (det.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(function () { body.style.height = '0px'; });
        setTimeout(function () { det.open = false; body.style.height = ''; }, 400);
      } else {
        det.open = true;
        var h = body.scrollHeight; body.style.height = '0px';
        requestAnimationFrame(function () { body.style.height = h + 'px'; });
        setTimeout(function () { body.style.height = ''; }, 420);
      }
    });
  });

  d.querySelectorAll('[data-track]').forEach(function (l) {
    var st = l.querySelectorAll('.tk');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    scene(window.innerWidth < 900);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var spin = sec.querySelector('.ring__spin'), cards = sec.querySelectorAll('.card'), lots = sec.querySelectorAll('.lot'),
      cnt = sec.querySelector('.count b'), bar = sec.querySelector('.bar6 i'), n = cards.length, step = 360 / n;
    var R = function () { return cards[0].offsetWidth * 1.05; };
    var cur = -1, st = { a: 0 };
    function render() {
      var r = R();
      cards.forEach(function (c, i) {
        var ang = i * step + st.a;
        var rad = ang * Math.PI / 180, z = Math.cos(rad);
        c.style.transform = 'rotateY(' + ang + 'deg) translateZ(' + r + 'px)';
        c.style.opacity = (0.25 + 0.75 * Math.max(0, z)).toFixed(3);
      });
      spin.style.transform = 'translateZ(' + (-r) + 'px) rotateX(-4deg)';
      var i = ((Math.round(-st.a / step) % n) + n) % n;
      if (i !== cur) {
        cur = i;
        cards.forEach(function (c, k) { c.classList.toggle('is-front', k === i); });
        lots.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
        if (cnt) cnt.textContent = '0' + (i + 1);
      }
      if (bar) bar.style.transform = 'scaleX(' + ((-st.a / step + 1) / n).toFixed(3) + ')';
    }
    render();
    gsap.to(st, {
      a: -step * (n - 1), ease: 'none', onUpdate: render,
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%',
        pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: .2, max: .5 }, delay: .08, ease: 'power1.inOut' }
      }
    });
    window.addEventListener('resize', render);
  }
})();
