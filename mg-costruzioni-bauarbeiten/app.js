/* MG costruzioni: header, menu, anchors, reveals, drag strip, process line, phone bar, form validation,
   and the GSAP signature scene "Dal disegno al cantiere": pinned, the elevation draws itself in red lines,
   then the real building fills in floor by floor from the ground up, with a % built counter. */
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

  /* drag strip (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) s.scrollLeft = l0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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
    var steps = sec.querySelectorAll('.bp__steps li'), pct = sec.querySelector('[data-pct]'), fill = sec.querySelector('[data-bar]');
    var now = sec.querySelector('[data-now]'), photo = sec.querySelector('.bp__photo'), q = sec.querySelector('.bp__q');
    var paths = sec.querySelectorAll('.bp__lines path');
    var cuts = [.30, .46, .62, .80];
    var last = -1;
    function set(k) {
      if (k === last) return;
      last = k;
      steps.forEach(function (it, i) { it.classList.toggle('is-act', i === k); it.classList.toggle('is-done', i < k); });
      var s = steps[k];
      now.innerHTML = s.querySelector('b').textContent + '<small>' + s.querySelector('small').textContent + '</small>';
    }
    paths.forEach(function (p) { p.setAttribute('pathLength', '1'); });
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(q, { autoAlpha: 0, y: 8 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (st) {
          var p = st.progress, k = 0;
          while (k < cuts.length && p >= cuts[k]) k++;
          set(k);
          pct.textContent = Math.round(p * 100);
          fill.style.transform = 'scaleX(' + Math.max(.04, p).toFixed(3) + ')';
        }
      }
    });
    tl.to(sec.querySelectorAll('.ln1, .ln4'), { strokeDashoffset: 0, duration: .5, ease: 'none' }, 0)
      .to(sec.querySelectorAll('.ln2'), { strokeDashoffset: 0, duration: .5, stagger: .08, ease: 'none' }, .35)
      .to(sec.querySelectorAll('.ln3'), { strokeDashoffset: 0, duration: .55, stagger: .06, ease: 'none' }, .7)
      .to(q, { autoAlpha: 1, y: 0, duration: .2 }, 1.1)
      .to(photo, { clipPath: 'inset(80% 0% 0% 0%)', duration: .45, ease: 'power1.inOut' }, 1.4)
      .to(photo, { clipPath: 'inset(56% 0% 0% 0%)', duration: .45, ease: 'power1.inOut' }, 1.95)
      .to(photo, { clipPath: 'inset(33% 0% 0% 0%)', duration: .45, ease: 'power1.inOut' }, 2.5)
      .to(photo, { clipPath: 'inset(0% 0% 0% 0%)', duration: .55, ease: 'power1.inOut' }, 3.05)
      .to(paths, { opacity: .28, duration: .5 }, 3.2)
      .to({}, { duration: .4 });
    pct.textContent = '0';
    set(0);
  }
})();
