/* Impresa di servizi FIT: header, menu, anchors, reveals, service list that swaps the photo, gallery thumbs,
   process tiles, phone bar, form validation, and the GSAP signature scene "Il getto": pinned, a beam
   formwork assembles, the rebar draws in, concrete rises with a moving wave edge, vibrates, cures, the forms come off. */
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
    if (bar && hero) bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
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

  /* service list swaps the photo: hover, focus or tap; on phones the item nearest the middle */
  var list = d.querySelector('[data-swap]');
  if (list) {
    var items = list.querySelectorAll('li'), pics = d.querySelectorAll('.svc__pics img');
    var setSvc = function (k) {
      items.forEach(function (it, i) { it.classList.toggle('is-act', i === k); });
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    };
    items.forEach(function (it, i) {
      var b = it.querySelector('button');
      it.addEventListener('mouseenter', function () { setSvc(i); });
      b.addEventListener('click', function () { setSvc(i); });
      b.addEventListener('focus', function () { setSvc(i); });
    });
  }

  /* gallery: thumbs swap the big photo */
  var gal = d.querySelector('[data-gal]');
  if (gal) {
    var big = gal.querySelector('[data-big]'), cap = gal.querySelector('[data-cap]'), th = gal.querySelectorAll('.gal__thumbs button');
    th.forEach(function (b) {
      b.addEventListener('click', function () {
        th.forEach(function (o) { o.classList.toggle('is-on', o === b); });
        big.classList.add('is-swap');
        setTimeout(function () {
          big.src = b.getAttribute('data-src'); big.alt = b.getAttribute('data-alt'); cap.textContent = b.getAttribute('data-c');
          big.classList.remove('is-swap');
        }, reduce ? 0 : 250);
      });
    });
  }

  /* process line drawn by scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.04 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul lavoro.' };
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
    scene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var steps = sec.querySelectorAll('.pour__steps li'), cur = sec.querySelector('[data-cur]'), fill = sec.querySelector('[data-bar]');
    var now = sec.querySelector('[data-now]'), conc = sec.querySelector('.conc'), wave = sec.querySelector('.conc__wave');
    var sides = sec.querySelectorAll('.mould__side, .mould__floor'), bars = sec.querySelectorAll('.rebar path'), inner = sec.querySelector('.mould__in');
    var cuts = [.2, .4, .66, .82], last = -1;
    function set(k) {
      if (k === last) return;
      last = k;
      steps.forEach(function (it, i) { it.classList.toggle('is-act', i === k); it.classList.toggle('is-done', i < k); });
      cur.textContent = '0' + (k + 1);
      var s = steps[k];
      now.innerHTML = s.querySelector('b').textContent + '<small>' + s.querySelector('small').textContent + '</small>';
      conc.classList.toggle('is-cured', k === 4);
    }
    bars.forEach(function (p) { p.setAttribute('pathLength', '1'); });
    gsap.set(bars, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(conc, { yPercent: 118 });
    gsap.set(sides, { autoAlpha: 0, y: 30 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (st) {
          var p = st.progress, k = 0;
          while (k < cuts.length && p >= cuts[k]) k++;
          set(k);
          fill.style.transform = 'scaleX(' + Math.max(.04, p).toFixed(3) + ')';
        }
      }
    });
    tl.to(sides, { autoAlpha: 1, y: 0, duration: .6, stagger: .12, ease: 'power2.out' }, 0)
      .to(bars, { strokeDashoffset: 0, duration: .7, stagger: .1, ease: 'none' }, .8)
      .to(conc, { yPercent: 0, duration: 1.6, ease: 'power1.inOut' }, 1.9)
      .fromTo(wave, { xPercent: 0 }, { xPercent: -50, duration: 2.6, ease: 'none' }, 1.9)
      .to(inner, { x: 3, duration: .06, repeat: 9, yoyo: true, ease: 'none' }, 3.55)
      .to(wave, { autoAlpha: 0, duration: .3 }, 4.1)
      .to(sec.querySelector('.mould__side--l'), { x: -40, autoAlpha: 0, duration: .5 }, 4.3)
      .to(sec.querySelector('.mould__side--r'), { x: 40, autoAlpha: 0, duration: .5 }, 4.3)
      .to(sec.querySelector('.mould__floor'), { y: 30, autoAlpha: 0, duration: .5 }, 4.3)
      .to({}, { duration: .5 });
    set(0);
  }
})();
