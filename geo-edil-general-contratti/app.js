/* Geo.Edil: hero entrance (the name rises letter by letter, headline lines, photo strip slides in from the right),
   strip drifts left on scroll, header, menu, anchors, reveals, process line, magnetic buttons, phone bar, form,
   and the GSAP signature scene: one building photo cut into five floors that pull apart with scroll,
   each phase lighting up from the foundations to the roof, then the building closes again. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* the giant name fills the column width exactly */
  var giant = d.querySelector('.giant');
  function fitGiant() {
    if (!giant) return;
    giant.style.fontSize = '';
    var w = giant.parentNode.clientWidth, sw = giant.scrollWidth;
    if (sw > 0) giant.style.fontSize = (parseFloat(getComputedStyle(giant).fontSize) * w / sw * 0.995).toFixed(2) + 'px';
  }
  fitGiant();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fitGiant);
  window.addEventListener('resize', fitGiant);

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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

  /* language switch placeholder */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('aria-disabled') === 'true') return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var t = id.length > 1 ? d.querySelector(id) : null;
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* hero strip drifts left as you scroll */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.6) strip.style.transform = 'translate3d(' + (-y * 0.3).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.03 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (pointer devices only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* GSAP signature scene */
  var started = false;
  function start() {
    if (started) return; started = true;
    if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.add('no-st'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    floorsScene(window.innerWidth <= 760);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
  setTimeout(start, 2500);

  function floorsScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var top = sec.querySelector('.scene__top'), exp = sec.querySelector('.exp'), list = sec.querySelector('.layers');
    var sl = sec.querySelectorAll('.exp__s'), lis = sec.querySelectorAll('.layers li'), note = sec.querySelector('.scene__note');
    var gap = small ? 12 : 26;
    var order = [4, 3, 2, 1, 0], t0 = 1.6, step = .6;
    function setOn(k) { lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-l') === k); }); }
    gsap.set([top, exp, list, note], { autoAlpha: 0, y: 40 });
    setOn(4);

    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to(top, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, 0)
      .to(exp, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, .08)
      .to([list, note], { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, .2);
    sl.forEach(function (s, i) {
      tl.to(s, { y: (i - 1) * gap, x: (i % 2 ? 1 : -1) * gap * 0.35, duration: .8 }, .7);
    });
    order.forEach(function (k, n) {
      sl.forEach(function (s, i) { tl.to(s, { opacity: i === k ? 1 : .35, duration: .25 }, t0 + n * step); });
    });
    var tEnd = t0 + order.length * step;
    tl.to(sl, { opacity: 1, y: 0, x: 0, duration: .8 }, tEnd)
      .to({}, { duration: .4 }, tEnd + .8);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=160%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    tl.eventCallback('onUpdate', function () {
      var t = tl.time(), n = Math.floor((t - t0) / step);
      list.classList.toggle('is-all', t >= t0 + order.length * step);
      if (t < t0) setOn(4);
      else if (n < order.length) setOn(order[n]);
      else setOn(small ? 0 : -1);
    });
  }
})();
