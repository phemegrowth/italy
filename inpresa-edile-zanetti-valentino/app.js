/* Impresa Edile Zanetti Valentino: header, phone menu, anchors, reveals, accordion with photo swap, hero reel drift, process line,
   magnetic buttons, phone bar, form validation, and the GSAP signature scene: an exploded house. */
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already on screen shows at once) */
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

  /* drag strip with progress */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0;
    var prog = function () {
      if (sbar) sbar.style.setProperty('--sp', Math.max(.12, strip.scrollWidth > 0 ? (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth : 1).toFixed(3));
    };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) { if (down) strip.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* process line drawing on scroll */
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

  /* form validation */
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

  /* GSAP signature scene (built after fonts, in page order) */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return scene(false); });
    mm.add('(max-width: 899px)', function () { return scene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* accordion with photo swap */
  var acc = d.querySelector('[data-acc]'), phs = d.querySelectorAll('.works__ph img');
  if (acc) acc.querySelectorAll('.acc__it').forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      acc.querySelectorAll('.acc__it').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) {
        it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true');
        phs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-ph') === b.getAttribute('data-i')); });
      }
    });
  });

  /* hero reel: slow drift plus scroll drift (transform only) */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var t0 = performance.now(), ticking = false;
    var paint = function (now) {
      var idle = Math.min(90, (now - t0) / 1000 * 7);
      var sy = Math.min(window.scrollY, window.innerHeight * 1.2);
      reel.style.transform = 'translate3d(' + (-(idle + sy * 0.35)).toFixed(1) + 'px,0,0)';
      if (idle < 90) requestAnimationFrame(paint); else ticking = false;
    };
    requestAnimationFrame(paint);
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function (n) { paint(n); ticking = false; }); } }, { passive: true });
  }

  /* Scene: exploded house. Scroll pulls the roof, walls, frame and foundations apart, labels on leader lines */
  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pcs = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.pc--' + i); });
    var tags = [0, 1, 2, 3].map(function (i) { return sec.querySelector('.tag--' + i); });
    var lis = sec.querySelectorAll('.parts li');
    var off = small ? [46, 14, -12, -44] : [70, 20, -22, -70];
    function mark(k) { lis.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-p') <= k); }); }
    mark(-1);
    gsap.set(tags, { autoAlpha: 0, x: 16 });
    gsap.set(sec.querySelector('.house__svg'), { autoAlpha: 0, scale: .92, transformOrigin: '50% 50%' });
    var tl = gsap.timeline();
    tl.to(sec.querySelector('.house__svg'), { autoAlpha: 1, scale: 1, duration: .5, ease: 'power2.out' });
    [0, 1, 2, 3].forEach(function (i) {
      tl.to(pcs[i], { y: off[i], duration: 1, ease: 'power1.inOut' }, .5 + i * .35);
      tl.to(tags[i], { autoAlpha: 1, x: 0, duration: .4, onStart: function () { mark(i); }, onReverseComplete: function () { mark(i - 1); } }, .7 + i * .35);
    });
    tl.to({}, { duration: .6 });
    var stt = ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=130%' : '+=230%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    return function () { stt.kill(); tl.kill(); gsap.set(pcs.concat(tags), { clearProps: 'all' }); mark(3); };
  }

})();
