/* Immobiliare Giuliani: hero entrance (headline lines, photo cards fan out from a stack into a collage), header, phone menu,
   anchors, reveals, count-up, process line, magnetic buttons, phone bar, form validation, and the GSAP signature scene:
   the Adige valley map, where the river draws north to south and the places of their past listings drop in one by one. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* hero collage: cards start stacked in the middle, then fan out to their place */
  var collage = d.querySelector('[data-collage]');
  var cards = collage ? Array.prototype.slice.call(collage.querySelectorAll('[data-card]')) : [];
  function stackCards() {
    var cr = collage.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    cards.forEach(function (c, k) {
      var r = c.getBoundingClientRect();
      var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      c.style.transition = 'none';
      c.style.transform = 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) rotate(' + ((k - 1.5) * 4) + 'deg) scale(.82)';
    });
  }
  if (collage && !reduce) {
    stackCards();
    collage.classList.add('is-set');
    collage.offsetWidth;
    requestAnimationFrame(function () {
      cards.forEach(function (c, k) {
        c.style.transition = '';
        c.style.transitionDelay = (0.25 + k * 0.09) + 's';
        c.style.transform = '';
      });
    });
  } else if (collage) collage.classList.add('is-set');

  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* header */
  var hd = d.querySelector('.hd');
  function onScroll() { hd.classList.toggle('is-small', w.scrollY > 30); }
  w.addEventListener('scroll', onScroll, { passive: true });
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + w.scrollY - (hd.offsetHeight - 1);
      w.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in w) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) cb(el); else io.observe(el); });
  }

  /* count-up (20+ years) */
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 1200;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  d.querySelectorAll('[data-count]').forEach(function (el) { if (!reduce) el.textContent = '0'; });
  reveal(d.querySelectorAll('.r'), function (el) {
    el.classList.add('is-in');
    var c = el.querySelector('[data-count]');
    if (c) countUp(c);
  });

  /* magnetic buttons */
  if (!reduce && w.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .16).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in w) {
    new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0 }).observe(hero);
  } else if (mbar) mbar.classList.add('is-on');

  /* form */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Scrivete il vostro nome.'; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 8 ? '' : 'Serve un numero di telefono valido.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : "Controllate l'indirizzo email."; },
      message: function (v) { return v.trim().length > 4 ? '' : 'Scrivete due righe su cosa cercate.'; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value), box = el.closest('.f');
      box.classList.toggle('is-bad', !!msg);
      box.querySelector('.f__err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    form.querySelectorAll('.f input, .f textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.f').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      ['name', 'phone', 'email', 'message'].forEach(function (n) {
        var el = form.elements[n];
        if (!check(el)) { ok = false; first = first || el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- scene data ---------- */
  var what = ['Moderno trilocale', 'Appartamento, 70 m²', 'Appartamenti in vendita', 'Bilocali e trilocali, da 50 a 97 m²', 'Nuova costruzione in classe A+, Cristo Re', 'Due stanze eleganti, 100 m²', 'Casa a schiera, 234 m²', 'Ampio quadrilocale', 'Tre stanze, 90 m²'];
  var pins = Array.prototype.slice.call(d.querySelectorAll('[data-pin]'));
  var listItems = d.querySelectorAll('[data-list] li');
  var zn = d.querySelector('[data-zn]'), zplace = d.querySelector('[data-zplace]'), zwhat = d.querySelector('[data-zwhat]');
  var cur = -1;
  function setPlace(i) {
    if (i === cur) return; cur = i;
    pins.forEach(function (p, k) { p.classList.toggle('is-cur', k === i); });
    listItems.forEach(function (li, k) { li.classList.toggle('is-on', k <= i); li.classList.toggle('is-cur', k === i); });
    if (i < 0) return;
    zn.textContent = (i < 9 ? '0' : '') + (i + 1);
    zplace.textContent = pins[i].textContent;
    zwhat.textContent = what[i];
  }

  if (!w.gsap || !w.ScrollTrigger || reduce) {
    setPlace(4);
    listItems.forEach(function (li) { li.classList.add('is-on'); });
    return;
  }
  var gsap = w.gsap, ST = w.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  function build() {
    /* collage drifts on scroll */
    gsap.to('[data-collage]', { yPercent: -7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* process line */
    gsap.fromTo('[data-line]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-how]', start: 'top 80%', end: 'bottom 50%', scrub: .6 } });

    /* signature scene */
    var river = d.querySelector('[data-river]'), branch = d.querySelector('[data-branch]');
    var rl = river.getTotalLength(), bl = branch.getTotalLength();
    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 861px)', phone: '(max-width: 860px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      river.style.strokeDasharray = rl; river.style.strokeDashoffset = rl;
      branch.style.strokeDasharray = bl; branch.style.strokeDashoffset = bl;
      gsap.set(pins, { opacity: 0, y: -18 });
      gsap.set('.zcard', { opacity: 0, y: 16 });
      gsap.set('.map__ridge', { opacity: 0 });
      cur = -2; setPlace(-1);
      var shown = pins.map(function () { return false; });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.zone', pin: '.zone__pin', start: 'top top', end: phone ? '+=150%' : '+=240%', scrub: .6, anticipatePin: 1,
          onUpdate: function (self) {
            var p = Math.max(0, (self.progress - .08) / .84), last = -1;
            pins.forEach(function (pin, k) {
              var on = p >= +pin.getAttribute('data-at');
              if (on) last = k;
              if (on !== shown[k]) { shown[k] = on; gsap.to(pin, { opacity: on ? 1 : 0, y: on ? 0 : -18, duration: .35, ease: on ? 'back.out(2.2)' : 'power1.in', overwrite: true }); }
            });
            setPlace(last);
            river.style.strokeDashoffset = (rl * (1 - Math.min(1, p))).toFixed(1);
            var bp = Math.min(1, Math.max(0, (p - .40) / .07));
            branch.style.strokeDashoffset = (bl * (1 - bp)).toFixed(1);
          }
        }
      });
      tl.to('.map__ridge', { opacity: 1, duration: .08, stagger: .02 }, 0)
        .to('.zcard', { opacity: 1, y: 0, duration: .06 }, .06)
        .to({}, { duration: .94 });
      return function () { river.style.strokeDasharray = river.style.strokeDashoffset = branch.style.strokeDasharray = branch.style.strokeDashoffset = ''; gsap.set([pins, '.zcard', '.map__ridge'], { clearProps: 'all' }); };
    });
  }
  var go = function () { build(); w.addEventListener('load', function () { ST.refresh(); }); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
})();
