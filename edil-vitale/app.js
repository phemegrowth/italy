/* Edil Vitale: hero B (split, photo opens and parallaxes slower than the page), line reveal, header, menu, phone bar,
   anchors, reveals, accordion, process line, magnetic buttons, form validation, and the GSAP signature scene:
   one wall that changes finish with scroll (liscio, veneziano, tamponato, spennellato, spatolato), ending as a sample board. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm', 'is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && menu.classList.contains('is-open')) setMenu(false); });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : 60);
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

  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () { if (t) return; t = true; requestAnimationFrame(function () { t = false; fn(); }); }, { passive: true });
    fn();
  }

  /* accordion */
  d.querySelectorAll('.acc__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentNode, open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* hero parallax: photo moves slower than the page */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) onFrameScrollLater(function () {
    var y = window.scrollY, h = hero.offsetHeight;
    if (y > h) return;
    par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
  });
  function onFrameScrollLater(fn) { setTimeout(function () { onFrameScroll(fn); }, 0); }

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe sul lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
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

  /* ---------- signature scene: one wall, five finishes ---------- */
  var scene = d.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var q = function (s) { return scene.querySelectorAll(s); };
  var items = q('.fin__list li'), cur = scene.querySelector('.fin__cur'), tex = q('.fin__t'), edge = scene.querySelector('.fin__edge');
  var last = -1;
  function setI(i) {
    if (i === last) return; last = i;
    items.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    cur.textContent = '0' + (i + 1);
  }
  var marks = [0, 1.2, 2.2, 3.2, 4.2];
  function build() {
    var phone = window.innerWidth <= 700;
    gsap.set(Array.prototype.slice.call(tex, 1), { clipPath: 'inset(0% 0% 0% 100%)' });
    gsap.set(q('.fin__head, .fin__wall, .fin__list, .fin__note'), { opacity: 0, y: 30 });
    gsap.set(edge, { left: '100%', opacity: 0 });
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', end: phone ? '+=200%' : '+=280%', pin: scene.querySelector('.fin__pin'), scrub: .5, anticipatePin: 1,
        onUpdate: function (st) {
          var t = st.progress * tl.duration(), i = 0;
          marks.forEach(function (m, k) { if (t >= m - .3) i = k; });
          setI(i);
        },
        onToggle: function (st) { body.classList.toggle('in-scene', st.isActive); }
      }
    });
    tl.to(q('.fin__head, .fin__wall, .fin__list, .fin__note'), { opacity: 1, y: 0, duration: .6, stagger: .1, ease: 'power2.out' }, 0);
    for (var k = 1; k < 5; k++) {
      var at = marks[k] - .6;
      tl.set(edge, { opacity: 1, left: '100%' }, at)
        .to(tex[k], { clipPath: 'inset(0% 0% 0% 0%)', duration: .6, ease: 'power1.inOut' }, at)
        .to(edge, { left: '0%', duration: .6, ease: 'power1.inOut' }, at)
        .set(edge, { opacity: 0 }, at + .6);
    }
    /* end: the wall becomes a sample board of all five */
    tl.to(tex[1], { clipPath: 'inset(0% 60% 0% 20%)', duration: .7, ease: 'power2.inOut' }, 4.6)
      .to(tex[2], { clipPath: 'inset(0% 40% 0% 40%)', duration: .7, ease: 'power2.inOut' }, 4.6)
      .to(tex[3], { clipPath: 'inset(0% 20% 0% 60%)', duration: .7, ease: 'power2.inOut' }, 4.6)
      .to(tex[4], { clipPath: 'inset(0% 0% 0% 80%)', duration: .7, ease: 'power2.inOut' }, 4.6)
      .to({}, { duration: .4 });
  }
  var started = false;
  function start() { if (started) return; started = true; build(); ScrollTrigger.refresh(); }
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1500);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
