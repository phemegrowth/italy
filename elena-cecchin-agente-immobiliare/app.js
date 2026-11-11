/* Elena Cecchin: hero entrance (arched photo rises out of a clip, headline line by line, badge), arch photo
   parallax, header, full-screen phone menu, anchors, reveals, count-ups (sourced quantities only), accordion
   with height animation, drag strip of reviews, magazine covers fan out, phone contact bar, form validation,
   and the GSAP signature scene: an arched front door opens with the scroll onto a bright room (Open House),
   while the four steps of her method light up one by one. */
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
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      if (id === '#open-house' && window.ScrollTrigger) { var st = ScrollTrigger.getById('door'); if (st) top = st.start + 2; }
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* count-ups: rating, review count, days (all sourced) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var fmt = function (v) { return dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }, { threshold: 0.02 }).observe(hero);
  } else if (mbar) mbar.classList.add('is-on');

  /* arched hero photo moves slower than the page */
  var par = d.querySelector('[data-parallax] img');
  if (par && !reduce) {
    var pt = false;
    window.addEventListener('scroll', function () {
      if (pt) return; pt = true;
      requestAnimationFrame(function () {
        pt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) par.style.transform = 'translate3d(0,' + (-Math.min(y * 0.12, 90)).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* accordion: one open at a time, animated height */
  d.querySelectorAll('[data-acc] details').forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var open = det.hasAttribute('open');
      d.querySelectorAll('[data-acc] details[open]').forEach(function (o) { if (o !== det) close(o); });
      if (open) close(det); else openIt(det);
    });
    function openIt(el) {
      el.setAttribute('open', '');
      var b = el.querySelector('.acc__body');
      if (reduce || !b.animate) return;
      var h = b.scrollHeight;
      b.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.1,1)' });
    }
    function close(el) {
      var b = el.querySelector('.acc__body');
      if (reduce || !b.animate) { el.removeAttribute('open'); return; }
      var a = b.animate([{ height: b.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease-in' });
      a.onfinish = function () { el.removeAttribute('open'); };
    }
  });

  /* reviews strip: drag with the mouse (touch scrolls natively) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa.' };
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
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene: the door */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { doorScene(false); });
    mm.add('(max-width: 899px)', function () { doorScene(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function doorScene(small) {
    var sec = d.querySelector('[data-scene]');
    var L = sec.querySelector('.door__leaf--l'), R = sec.querySelector('.door__leaf--r');
    var room = sec.querySelector('.door__room img'), knobs = sec.querySelectorAll('.door__knob');
    var steps = sec.querySelectorAll('[data-dsteps] li'), now = sec.querySelector('[data-now]');
    var text = sec.querySelector('.door-sec__text'), frame = sec.querySelector('.door__frame');
    var names = ['01 · La casa preparata', '02 · Annuncio e contenuti', '03 · Porte aperte, un giorno', '04 · Proposte e rogito'];

    gsap.set([L, R], { rotationY: 0 });
    gsap.set(room, { scale: 1.18, autoAlpha: .5 });
    gsap.set(text, { autoAlpha: 0, y: 30 });
    gsap.set(frame, { autoAlpha: 0, y: 40 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to(text, { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 0)
      .to(frame, { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, .1)
      .to(knobs, { rotation: 90, duration: .4 }, 1.4)
      .to(L, { rotationY: 78, duration: 2.2 }, 1.7)
      .to(R, { rotationY: -78, duration: 2.2 }, 1.7)
      .to(room, { scale: 1, autoAlpha: 1, duration: 2.6, ease: 'power1.out' }, 1.7)
      .to({}, { duration: .8 });
    var at = [.4, 1.2, 2.2, 3.6];

    var last = -1;
    function sync() {
      var t = tl.time(), s = 0;
      for (var i = 0; i < at.length; i++) if (t >= at[i]) s = i + 1;
      if (s === last) return; last = s;
      steps.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
      if (now) now.textContent = names[Math.max(0, s - 1)];
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({
      id: 'door', trigger: sec, start: 'top top', end: small ? '+=130%' : '+=200%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
    return function () { gsap.set([L, R, room, text, frame, knobs], { clearProps: 'all' }); };
  }
})();
