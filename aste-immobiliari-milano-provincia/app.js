/* AstaGeniale: hero with a big 10% count-up and a round photo reveal, header, menu, anchors, reveals, accordion,
   reviews marquee, magnetic buttons, phone bar, form and the GSAP signature scene: the price ladder of a judicial
   sale, bars filling one by one with scroll while the price counts down. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (mbar) mbar.classList.toggle('is-on', y > hero.offsetHeight * .75);
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
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 60), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already in view shows at once */
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

  /* magnetic buttons (desktop only) */
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe su cosa cercate.' };
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

  /* count-up (years in business, sourced) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = null;
      var step = function (t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* reviews marquee (duplicated row, transform only) */
  var row = d.querySelector('[data-marquee]');
  if (row && !reduce) {
    row.innerHTML += row.innerHTML;
    row.querySelectorAll('blockquote').forEach(function (b, i, all) { if (i >= all.length / 2) b.setAttribute('aria-hidden', 'true'); });
    var x = 0, paused = false, half = 0, last = 0;
    row.addEventListener('mouseenter', function () { paused = true; });
    row.addEventListener('mouseleave', function () { paused = false; });
    var tick = function (t) {
      if (!half) half = row.scrollWidth / 2;
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!paused) { x -= dt * .04; if (-x >= half) x += half; row.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else if (row) { row.parentNode.style.overflowX = 'auto'; }

  /* GSAP */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    ladderScene(window.innerWidth < 701);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  function ladderScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var plabel = sec.querySelector('[data-plabel]'), labels = ['Valore di perizia', 'Offerta minima, 1ª asta', 'Nuovo prezzo base', 'Offerta minima, 2ª asta'];
    var bars = sec.querySelectorAll('.bar'), fills = sec.querySelectorAll('.bar__f i'), price = sec.querySelector('[data-price]');
    var vals = [200000, 150000, 150000, 112500], N = bars.length;
    var st = { p: vals[0] }, lastI = -1;
    gsap.set(fills, { scaleX: 0 });
    gsap.set(sec.querySelector('.ladder'), { opacity: 0, y: 40 });
    var tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%', pin: true, scrub: .6, anticipatePin: 1 }
    });
    tl.to(sec.querySelector('.ladder'), { opacity: 1, y: 0, duration: .08, ease: 'power2.out' }, 0);
    fills.forEach(function (f, i) {
      var at = .08 + i * .22;
      tl.to(f, { scaleX: 1, duration: .16, ease: 'power2.out', onStart: function () { setOn(i); }, onReverseComplete: function () { setOn(i - 1); } }, at);
      tl.to(st, { p: vals[i], duration: .16, ease: 'none', onUpdate: function () { price.textContent = fmt(st.p); } }, at);
    });
    tl.fromTo(sec.querySelector('.ladder__pic img'), { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, 0);
    function setOn(i) {
      i = Math.max(0, i);
      if (i === lastI) return; lastI = i;
      bars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
      plabel.textContent = labels[i];
    }
  }
})();
