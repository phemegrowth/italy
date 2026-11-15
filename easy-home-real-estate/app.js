/* Easy Home Real Estate: curtain hero (coral panel with the wordmark lifts off the photo), header, full-screen menu, anchors,
   reveals, tabs, phone contact bar, form validation and the GSAP signature scene: a schematic map of Parma where the route
   draws from the office in Piazzale Ravenet to each zone of their listings, pins dropping in one by one. */
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
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
  reveal(d.querySelectorAll('.steps'), function (el) { el.classList.add('is-drawn'); });


  /* tabs: click and arrow keys */
  var tabs = [].slice.call(d.querySelectorAll('[role="tab"]'));
  function sel(t) {
    tabs.forEach(function (x) {
      var on = x === t, p = d.getElementById(x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      p.hidden = !on; p.classList.toggle('is-on', on);
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { sel(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!k) return;
      var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus(); e.preventDefault();
    });
  });

  /* phone contact bar: after the hero, hidden in the contact section and while the scene is pinned */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti'), scenePinned = false;
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
      if (ok && v && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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

  /* GSAP signature scene: a schematic map of Parma; from the office the route draws to each zone of their listings */
  var ZT = ['Il nostro ufficio, in zona Pablo.', 'Santa Croce: stanze libere per studenti.', 'Ospedale e Volturno: camere e appartamenti.', 'Centro: monolocali e camere.', 'San Leonardo: trilocali in affitto.', 'Cittadella: bilocali con box.', 'Montanara: camere per studenti.'];
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return mapScene(false); });
    mm.add('(max-width: 899px)', function () { return mapScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function mapScene(small) {
    var sec = d.querySelector('[data-scene]'), svg = sec.querySelector('.map');
    if (small) svg.setAttribute('viewBox', '105 80 470 420');
    var pins = sec.querySelectorAll('.pin'), labs = sec.querySelectorAll('.lab'), rts = sec.querySelectorAll('.rt');
    var base = sec.querySelectorAll('.ring, .emilia, .rail, .river, .road, .riv');
    var zn = sec.querySelector('[data-zn]'), zt = sec.querySelector('[data-zt]');
    rts.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, autoAlpha: 0 }); });
    gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(labs, { autoAlpha: 0, y: 8 });
    gsap.set(base, { autoAlpha: 0 });
    gsap.set(sec.querySelectorAll('.zone__copy > *, .zone__now, .zone__note'), { autoAlpha: 0, y: 20 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(sec.querySelectorAll('.zone__copy > *, .zone__now, .zone__note'), { autoAlpha: 1, y: 0, duration: .4, stagger: .05 }, 0);
    tl.to(base, { autoAlpha: 1, duration: .5, stagger: .05 }, .1);
    tl.to(pins[0], { scale: 1, duration: .4, ease: 'back.out(2)' }, .5);
    tl.to(labs[0], { autoAlpha: 1, y: 0, duration: .3 }, .6);
    var marks = [.5];
    for (var i = 1; i < pins.length; i++) {
      var t = .5 + i * .8; marks.push(t + .4);
      tl.set(rts[i - 1], { autoAlpha: 1 }, t);
      tl.to(rts[i - 1], { strokeDashoffset: 0, duration: .5, ease: 'none' }, t);
      tl.to(pins[i], { scale: 1, duration: .35, ease: 'back.out(2.4)' }, t + .45);
      tl.to(labs[i], { autoAlpha: 1, y: 0, duration: .3 }, t + .5);
    }
    tl.to({}, { duration: .4 });
    var total = tl.duration(), last = -1;
    function upd(self) {
      var tt = self.progress * total, n = 0;
      marks.forEach(function (m, k) { if (tt >= m) n = k; });
      if (n === last) return; last = n;
      zn.textContent = '0' + (n + 1); zt.textContent = ZT[n];
    }
    upd({ progress: 0 });
    ScrollTrigger.create({
      animation: tl, trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%',
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: upd, onToggle: function (s) { scenePinned = s.isActive; bar(); }
    });
    return function () { svg.setAttribute('viewBox', '0 0 800 600'); gsap.set([].slice.call(pins).concat([].slice.call(labs), [].slice.call(rts), [].slice.call(base)), { clearProps: 'all' }); };
  }
})();
