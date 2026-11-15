/* Novegnolab: hero entrance (frame lines draw, photo wipes in inside the frame, headline lines rise),
   header, full-screen menu, anchors, reveals, works list that drives the photo, method line drawn by scroll,
   magnetic buttons, phone contact bar, form validation, and the GSAP signature scene:
   a 10-day schedule (cronoprogramma) that fills itself as you scroll, day by day, ending on the finished room. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
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
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
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

  /* works list drives the photo (tap on phones, hover or tap on desktop) */
  var items = d.querySelectorAll('.wl'), pics = d.querySelectorAll('.wp');
  function setWork(k) {
    items.forEach(function (li) {
      var on = li.getAttribute('data-k') === k;
      li.classList.toggle('is-on', on);
      li.querySelector('button').setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === k); });
  }
  items.forEach(function (li) {
    var k = li.getAttribute('data-k');
    li.querySelector('button').addEventListener('click', function () { setWork(k); });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) li.addEventListener('mouseenter', function () { setWork(k); });
  });

  /* hero photo drifts slower than the page; method line follows the scroll */
  var heroFig = d.querySelector('.frame'), stepsWrap = d.querySelector('.steps-wrap'), lineEl = d.querySelector('.steps__line');
  var ticking = false;
  function frameUpdate() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (heroFig && !reduce && y < vh * 1.2) heroFig.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0)';
    if (stepsWrap) {
      var r = stepsWrap.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
      lineEl.style.setProperty('--p', reduce ? 1 : Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frameUpdate); } }, { passive: true });
  frameUpdate();

  /* magnetic buttons, desktop only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone contact bar: after the hero, not during the scene, not over the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Indirizzo email non valido.', message: 'Due righe sul lavoro da fare.' };
    var fields = form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"], textarea');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: the schedule fills itself */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { ganttScene(false); });
    mm.add('(max-width: 899px)', function () { ganttScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  var NAMES = ['', 'Protezioni e demolizioni', 'Impianto idraulico', 'Impianto elettrico', 'Massetti e intonaci', 'Pavimenti e rivestimenti', 'Sanitari e cucina', 'Pulizia e consegna'];
  function ganttScene(small) {
    var sec = d.querySelector('[data-scene]');
    var rows = sec.querySelectorAll('.grow'), bars = sec.querySelectorAll('.gb'), days = sec.querySelectorAll('.gd');
    var today = sec.querySelector('[data-today]'), done = sec.querySelector('[data-done]');
    var dayEl = sec.querySelector('[data-day]'), nowEl = sec.querySelector('[data-now]');
    var fig = sec.querySelector('.scene__fig img'), figc = sec.querySelector('.scene__fig figcaption');
    var spans = [];
    bars.forEach(function (b) { var cs = getComputedStyle(b); spans.push([parseFloat(cs.getPropertyValue('--s')), parseFloat(cs.getPropertyValue('--e'))]); });

    gsap.set(bars, { scaleX: 0 });
    gsap.set(done, { autoAlpha: 0, y: 10 });
    gsap.set(today, { left: '0%' });
    if (!small && fig) { gsap.set(fig, { clipPath: 'inset(0% 0% 100% 0%)' }); gsap.set(figc, { autoAlpha: 0 }); }

    var tl = gsap.timeline();
    bars.forEach(function (b, i) { tl.to(b, { scaleX: 1, duration: spans[i][1] - spans[i][0], ease: 'none' }, spans[i][0]); });
    tl.to(today, { left: '100%', duration: 10, ease: 'none' }, 0);
    tl.to(done, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 10);
    if (!small && fig) tl.to(fig, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 10.1).to(figc, { autoAlpha: 1, duration: .4 }, 10.7);
    tl.to({}, { duration: .5 }, 11.1);

    var lastDay = -1, lastRow = -1;
    function sync() {
      var t = tl.time();
      var day = Math.min(10, Math.floor(t) + 1);
      var cur = 0;
      spans.forEach(function (s, i) { if (t >= s[0] - 0.001 && (t < s[1] || (i === spans.length - 1 && t >= s[0]))) cur = i + 1; });
      if (!cur) cur = 7;
      if (day !== lastDay) {
        lastDay = day;
        dayEl.textContent = day < 10 ? '0' + day : '' + day;
        days.forEach(function (g) { g.classList.toggle('is-on', +g.getAttribute('data-d') === day); });
      }
      if (cur !== lastRow) {
        lastRow = cur;
        nowEl.textContent = NAMES[cur];
        rows.forEach(function (r) {
          var n = +r.getAttribute('data-row');
          r.classList.toggle('is-on', n === cur);
          r.classList.toggle('is-done', t >= spans[n - 1][1]);
        });
      } else {
        rows.forEach(function (r) { var n = +r.getAttribute('data-row'); r.classList.toggle('is-done', t >= spans[n - 1][1] && n !== cur); });
      }
    }
    tl.eventCallback('onUpdate', sync);
    var st = ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=150%' : '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
      onToggle: function (self) { scenePinned = self.isActive; bar(); }
    });
    sync();
    return function () { st.kill(); tl.kill(); gsap.set([bars, done, today, fig, figc], { clearProps: 'all' }); };
  }
})();
