/* Edil Mursan: hero entrance (stacked photo cards fan out into a collage, headline lines rise), header, full-screen menu,
   anchors, reveals, accordion with photo swap, drag gallery, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: a house assembles floor by floor from the foundations, then pulls apart into
   roof, walls, systems and foundations, each labelled with the work they do. */
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

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    html.classList.toggle('menu-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

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

  /* hero collage: a slow parallax on the big card after the fan-out */
  var fan = d.querySelector('.fan');
  if (fan && !reduce) {
    var c1 = fan.querySelector('.fan__c--1 img'), c2 = fan.querySelector('.fan__c--2 img'), ft = false;
    window.addEventListener('scroll', function () {
      if (ft) return; ft = true;
      requestAnimationFrame(function () {
        ft = false;
        var y = Math.min(window.scrollY, window.innerHeight);
        c1.style.transform = 'translate3d(0,' + (y * 0.06).toFixed(1) + 'px,0) scale(1.08)';
        c2.style.transform = 'translate3d(0,' + (y * -0.05).toFixed(1) + 'px,0) scale(1.08)';
      });
    }, { passive: true });
  }

  /* accordion: one open at a time, photo follows */
  var items = d.querySelectorAll('.acc__it'), phs = d.querySelectorAll('.lavori__ph img');
  items.forEach(function (it) {
    it.addEventListener('toggle', function () {
      if (!it.open) return;
      items.forEach(function (o) { if (o !== it) o.open = false; });
      var i = it.getAttribute('data-i');
      phs.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-ph') === i); });
    });
  });

  /* gallery drag on desktop */
  var gal = d.querySelector('.gal');
  if (gal && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0;
    gal.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sl = gal.scrollLeft; gal.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; gal.classList.remove('is-drag'); });
    gal.addEventListener('pointermove', function (e) { if (down) gal.scrollLeft = sl - (e.clientX - sx); });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('preventivo'), scenePinned = false;
  function bar() {
    var past = hero.getBoundingClientRect().bottom < 0;
    var cr = contact.getBoundingClientRect(), inContact = cr.top < window.innerHeight * 0.6 && cr.bottom > 0;
    pbar.classList.toggle('is-on', past && !scenePinned && !inContact);
  }
  window.addEventListener('scroll', bar, { passive: true });
  bar();

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

  /* GSAP signature scene: the house builds up, then comes apart */
  var parts = [
    ['Tetto', 'Rifacimento, coibentazione, sottotetto, abbaini.'],
    ['Murature e facciate', 'Pareti, facciate, cappotto, impermeabilizzazioni.'],
    ['Impianti', 'Elettrico, gas, riscaldamento, idraulico, solare.'],
    ['Fondazioni e scavi', 'Sbancamenti, consolidamento, fognature.']
  ];
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var sec = d.querySelector('.casa');
    var phone = window.matchMedia('(max-width: 760px)').matches;
    var L = sec.querySelectorAll('.xp__l'), T = sec.querySelectorAll('.xp__t');
    var k = sec.querySelector('[data-k]'), dd = sec.querySelector('[data-d]'), now = sec.querySelector('.casa__now');
    var off = [-16, -5, 5, 16];
    gsap.set(L, { yPercent: 0, y: 0, opacity: 0, clearProps: 'transform' });
    gsap.set(L, { yPercent: 0, y: 60 });
    gsap.set(T, { opacity: 0, x: 16 });
    gsap.set(now, { opacity: 0 });
    var cur = -1;
    function setPart(i) {
      if (i === cur) return; cur = i;
      T.forEach(function (t, n) { t.classList.toggle('is-act', n === i); });
      if (i < 0) return;
      k.textContent = parts[i][0]; dd.textContent = parts[i][1];
      gsap.fromTo([k, dd], { y: 10, opacity: .2 }, { y: 0, opacity: 1, duration: .35, overwrite: true });
    }
    var tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: phone ? '+=180%' : '+=240%', pin: sec.querySelector('.casa__pin'), scrub: 0.6,
        onToggle: function (st) { scenePinned = st.isActive; bar(); },
        onUpdate: function (st) {
          var t = st.progress * tl.duration();
          setPart(t < 2.6 ? -1 : Math.min(3, Math.floor((t - 2.6) / 0.9)));
        }
      }
    });
    /* build from the ground up */
    tl.to(L[3], { y: 0, opacity: 1, duration: .5 }, 0)
      .to(L[2], { y: 0, opacity: 1, duration: .5 }, .35)
      .to(L[1], { y: 0, opacity: 1, duration: .5 }, .7)
      .to(L[0], { y: 0, opacity: 1, duration: .5 }, 1.05);
    /* explode */
    L.forEach(function (l, n) { tl.to(l, { yPercent: off[n], duration: .9, ease: 'power2.inOut' }, 1.7); });
    tl.to(T, { opacity: 1, x: 0, duration: .4, stagger: .12 }, 2.3)
      .to(now, { opacity: 1, duration: .3 }, 2.5)
      .to({}, { duration: 3.4 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
