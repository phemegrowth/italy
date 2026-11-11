/* Marc Impresa Artigiana Edile: hero curtain (blue panel with the roof line wipes up to reveal the photo),
   line reveal, header, full-screen menu, anchors, reveals, service photo swap, drag strip with progress,
   process line, magnetic buttons, sticky phone bar, form validation, and the GSAP signature scene:
   a sound-proofing counter-wall built layer by layer with scroll while the neighbours' noise fades. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('[data-header]');
  var bar = d.querySelector('[data-bar]');
  var hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar) bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
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

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: hover or the item nearest the middle swaps the photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt || window.innerWidth < 980) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.55, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* cantiere strip: drag on desktop, progress bar */
  var strip = d.querySelector('[data-strip]'), sbar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (sbar) sbar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', upd, { passive: true });
    upd();
    if (window.matchMedia('(pointer: fine)').matches) {
      var down = false, sx = 0, sl = 0, moved = false;
      strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; strip.style.scrollSnapType = 'none'; strip.style.cursor = 'grabbing'; });
      window.addEventListener('mouseup', function () { if (!down) return; down = false; strip.style.scrollSnapType = ''; strip.style.cursor = ''; });
      strip.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); var dx = e.pageX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
      strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    }
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (desktop pointer only) */
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
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    wallScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pin = sec.querySelector('.scene__pin');
    var q = function (s) { return sec.querySelectorAll(s); };
    var lis = q('[data-layers] li'), now = sec.querySelector('[data-now]'), meter = sec.querySelector('[data-meter]');
    var waves = q('[data-waves] path'), inw = q('[data-in] path'), wall = sec.querySelector('[data-wall]');
    var names = [];
    lis.forEach(function (li) { names.push(li.textContent.replace(/^\s*\d+\s*/, '').trim()); });
    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 979px)', big: '(min-width: 980px)' }, function (ctx) {
      var small = ctx.conditions.small;
      if (small) wall.setAttribute('viewBox', '0 0 560 520');
      var layers = [];
      for (var i = 1; i <= 6; i++) layers.push(sec.querySelector('[data-l="' + i + '"]'));
      gsap.set(layers, { autoAlpha: 0, x: 140 });
      gsap.set(q('[data-lab]'), { autoAlpha: 0, x: 12 });
      gsap.set(q('[data-room], .w-side'), { autoAlpha: 0 });
      gsap.set(waves, { autoAlpha: 1, scale: 1, transformOrigin: '100% 50%' });
      gsap.set(meter, { scaleX: 1 });
      gsap.set(sec.querySelector('[data-in]'), { autoAlpha: 1 });
      gsap.set(inw, { autoAlpha: 1, scale: 1, transformOrigin: '0% 50%' });
      var state = -1;
      function setStep(k) {
        if (k === state) return; state = k;
        lis.forEach(function (li, j) { li.classList.toggle('is-on', j <= k); li.classList.toggle('is-now', j === k); });
        if (now) now.textContent = k < 0 ? '' : ('0' + (k + 1) + ' · ' + names[k]);
      }
      setStep(-1);
      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: pin, pin: true, scrub: 0.6, start: 'top top', end: small ? '+=130%' : '+=220%',
          onUpdate: function (self) {
            var t = self.progress * tl.duration(), k = -1;
            for (var j = 0; j < at.length; j++) if (t >= at[j]) k = j;
            setStep(k);
          }
        }
      });
      var at = [];
      tl.to(q('[data-room], .w-side'), { autoAlpha: 1, duration: .3 }, 0);
      tl.to(waves, { x: 18, duration: .5, stagger: .08, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
      var lvl = [0.92, 0.78, 0.42, 0.26, 0.2, 0.12];
      layers.forEach(function (L, k) {
        var t0 = 0.4 + k * 0.7;
        at.push(t0);
        tl.to(L, { autoAlpha: 1, x: 0, duration: .55 }, t0);
        tl.to(meter, { scaleX: lvl[k], duration: .55, ease: 'power1.out' }, t0);
        tl.to(inw, { autoAlpha: [0.85, 0.7, 0.3, 0.15, 0.08, 0][k], scale: [0.95, 0.88, 0.7, 0.6, 0.55, 0.5][k], duration: .5 }, t0);
        var lab = sec.querySelector('[data-lab="' + (k + 1) + '"]');
        if (lab && !small) tl.to(lab, { autoAlpha: 1, x: 0, duration: .35 }, t0 + .3);
      });
      tl.to({}, { duration: .4 });
      return function () { setStep(5); wall.setAttribute('viewBox', '0 0 640 520'); };
    });
  }
})();
