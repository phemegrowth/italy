/* GM Costruzioni: hero entrance (headline lines, photo wipes in from the right, slow parallax), header, phone menu, anchors,
   reveals, service list that swaps the photo, process line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: blueprint lines of one of their houses draw, then the real photo fills floor by floor. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
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

  /* process line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 8;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });


  /* hero parallax: the photo moves slower than the page */
  var par = d.querySelector('[data-par] img');
  if (par && !reduce) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
        tick = false;
      });
    }, { passive: true });
  }

  /* services: the active item swaps the photo (click, hover on desktop) */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var items = swap.querySelectorAll('li'), pics = d.querySelectorAll('.svc__pics img');
    var set = function (li) {
      items.forEach(function (o) { o.classList.toggle('is-on', o === li); o.querySelector('button').setAttribute('aria-pressed', o === li ? 'true' : 'false'); });
      var k = +li.getAttribute('data-img');
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
    };
    items.forEach(function (li) {
      var b = li.querySelector('button');
      b.addEventListener('click', function () { set(li); });
      if (window.matchMedia('(pointer: fine)').matches) li.addEventListener('mouseenter', function () { set(li); });
    });
    set(items[0]);
  }

  /* GSAP signature scene */
  var sec = d.querySelector('[data-scene]');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', function () { return bpScene(false); });
    mm.add('(max-width: 699px)', function () { return bpScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function bpScene(small) {
    var lines = sec.querySelectorAll('.bp__l'), photo = sec.querySelector('.bp__photo'), pct = sec.querySelector('[data-pct]'),
        steps = sec.querySelectorAll('.bp__steps li'), grid = sec.querySelector('.bp__grid'), bp = sec.querySelector('.bp');
    lines.forEach(function (l) { var n = l.getTotalLength(); l.style.strokeDasharray = n + ' ' + n; l.style.strokeDashoffset = n; });
    gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' });
    gsap.set(bp, { autoAlpha: 0, y: 30 });
    var st = { p: 0 };
    var paint = function () {
      var v = Math.round(st.p);
      pct.textContent = v;
      var c = v < 25 ? 0 : v < 55 ? 1 : v < 85 ? 2 : 3;
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i <= c); li.classList.toggle('is-cur', i === c); });
    };
    paint();
    var tl = gsap.timeline();
    tl.to(bp, { autoAlpha: 1, y: 0, duration: .4, ease: 'power2.out' }, 0)
      .to(lines, { strokeDashoffset: 0, duration: 1.2, stagger: .06, ease: 'none' }, .2)
      .to(st, { p: 30, duration: 1.4, ease: 'none', onUpdate: paint }, .2)
      .to(photo, { clipPath: 'inset(0% 0 0 0)', duration: 2, ease: 'none' }, 1.6)
      .to(st, { p: 100, duration: 2, ease: 'none', onUpdate: paint }, 1.6)
      .to(lines, { opacity: 0, duration: .5 }, 3.3)
      .to(grid, { opacity: 0, duration: .5 }, 3.3)
      .to({}, { duration: .4 });
    var stt = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    return function () {
      stt.kill(); tl.kill();
      lines.forEach(function (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; l.style.opacity = ''; });
      gsap.set([photo, bp, grid], { clearProps: 'all' });
    };
  }
})();
