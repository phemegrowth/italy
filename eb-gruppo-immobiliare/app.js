/* EB Gruppo Immobiliare: hero entrance (line reveal, house-shaped photo wipes up, the figure counts to 6), header,
   full-screen menu, sticky phone bar, anchors, reveals, quote carousel, accordion, magnetic buttons, form, and the
   GSAP signature scene: a pinned list of the six specialists drives the photo (crossfade + slow scale), with a
   counter and a progress line. Phones get the photo on top and one large active item below. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + sticky phone bar */
  var header = d.querySelector('.header'), mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight - 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && menu.classList.contains('is-open')) setMenu(false); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#specialisti' ? 0 : header.offsetHeight - 1);
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

  /* rAF scroll helper */
  function onFrameScroll(fn) {
    var t = false;
    window.addEventListener('scroll', function () {
      if (t) return; t = true;
      requestAnimationFrame(function () { t = false; fn(); });
    }, { passive: true });
    fn();
  }

  /* hero figure counts up to the number of specialists */
  var fig = d.querySelector('[data-count]');
  if (fig && !reduce) {
    var target = +fig.getAttribute('data-count'), k = 0;
    fig.textContent = '0';
    var tick = setInterval(function () { k++; fig.textContent = k; if (k >= target) clearInterval(tick); }, 110);
  }

  /* reviews: one quote at a time, buttons + slow auto-advance (not with reduced motion) */
  var qs = d.querySelectorAll('[data-quotes] .q'), qi = 0, pos = d.querySelector('[data-rpos]'), auto = null;
  function showQ(n) {
    qi = (n + qs.length) % qs.length;
    qs.forEach(function (q, j) { q.classList.toggle('is-on', j === qi); });
    if (pos) pos.textContent = qi + 1;
  }
  var pv = d.querySelector('[data-prev]'), nx = d.querySelector('[data-next]');
  if (pv) pv.addEventListener('click', function () { showQ(qi - 1); stopAuto(); });
  if (nx) nx.addEventListener('click', function () { showQ(qi + 1); stopAuto(); });
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  if (!reduce && qs.length > 1) auto = setInterval(function () { showQ(qi + 1); }, 6500);

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, j, all) {
    var b = it.querySelector('.acc__b');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__b').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.05)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    onFrameScroll(draw);
    window.addEventListener('resize', draw);
  });

  /* drag strip for reviews (mouse only; touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete due righe su cosa vi serve.' };
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
    var mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', function () { return spScene(false); });
    mm.add('(max-width: 960px)', function () { return spScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function spScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var pics = Array.prototype.slice.call(sec.querySelectorAll('.pic')), items = Array.prototype.slice.call(sec.querySelectorAll('.splist li'));
    var cnt = sec.querySelector('[data-spc]'), bar = sec.querySelector('[data-spbar]'), N = pics.length;
    pics.forEach(function (p) { p.querySelector('img').loading = 'eager'; });
    gsap.set(pics.map(function (p) { return p.querySelector('img'); }), { scale: 1.12 });
    gsap.set(bar, { scaleX: 1 / N });
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    pics.forEach(function (p, i) { tl.to(p.querySelector('img'), { scale: 1, duration: 1 }, i); });
    tl.to(bar, { scaleX: 1, duration: N - .5 }, 0);
    var last = -1;
    function sync() {
      var k = Math.min(N - 1, Math.floor(tl.time()));
      if (k === last) return;
      last = k;
      cnt.textContent = '0' + (k + 1);
      pics.forEach(function (p, j) { p.classList.toggle('is-on', j === k); p.classList.toggle('is-done', j < k); });
      items.forEach(function (li, j) { li.classList.toggle('is-on', j === k); });
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=240%',
      pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () {
      st.kill(); tl.kill();
      gsap.set(pics.map(function (p) { return p.querySelector('img'); }).concat([bar]), { clearProps: 'all' });
      pics.concat(items).forEach(function (e) { e.classList.remove('is-on', 'is-done'); });
    };
  }
})();
