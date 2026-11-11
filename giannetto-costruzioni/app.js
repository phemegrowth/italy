/* Giannetto Costruzioni: hero drafting-line entrance, header, full-screen menu, anchors, reveals, count-up, accordion with height
   animation, drag strip, process rail, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene (the floor plan draws itself, then each room is finished and shown with their own photo). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var hd = d.getElementById('hd');
  function onScroll() { hd.classList.toggle('is-small', window.scrollY > 40); }
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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#pianta' ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up: number of reviews */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* accordion: one open at a time, height animated */
  var items = d.querySelectorAll('.acc__i');
  items.forEach(function (det) {
    var sum = det.querySelector('summary'), body = det.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease' }).onfinish = function () { det.open = false; };
      } else {
        items.forEach(function (o) { if (o !== det && o.open) o.open = false; });
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
  });

  /* scroll-linked: process rail */
  var rail = d.querySelector('.steps__rail span'), list = d.querySelector('[data-line]');
  var tick = false;
  function frame() {
    tick = false;
    if (rail && list) {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      rail.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* phone contact bar */
  var mbar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  if (mbar && hero && 'IntersectionObserver' in window) new IntersectionObserver(function (en) { mbar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(hero);
  else if (mbar) mbar.classList.add('is-on');

  /* drag strip */
  var strip = d.querySelector('[data-drag]'), sbar = d.querySelector('.strip__bar span');
  if (strip) {
    var prog = function () { if (sbar) sbar.style.transform = 'scaleX(' + Math.min(1, (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) + ')'; };
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    var down = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = strip.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) strip.classList.add('is-drag'); strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero per richiamarvi.', email: 'Scrivete un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* signature scene */
  var sec = d.querySelector('.plan');
  function scene() {
    if (!sec) return;
    if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var walls = qa('.wl'), doors = qa('.dr'), wins = qa('.pl-win path'), rooms = qa('.rm'), labels = qa('.pl-labels text');
    var pics = qa('.pp'), head = q('.plan__head'), svg = q('.plan__svg'), box = q('.plan__photos');
    var num = q('.plan__num'), room = q('.plan__room');
    var names = ['Soggiorno', 'Cucina e pranzo', 'Studio', 'Bagno'];
    walls.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    gsap.set([doors, wins, labels], { autoAlpha: 0 });
    gsap.set(box, { autoAlpha: 0 });
    gsap.set(pics, { clipPath: 'inset(100% 0% 0% 0%)' });
    var cur = -2;
    function setRoom(k) {
      if (k === cur) return; cur = k;
      rooms.forEach(function (r, i) { r.classList.toggle('is-on', i === k); r.classList.toggle('is-done', k >= 0 && i < k); });
      if (k < 0) { num.textContent = '00'; room.textContent = 'La pianta'; return; }
      num.textContent = '0' + (k + 1); room.textContent = names[k];
    }
    setRoom(-1);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=140%' : '+=240%', pin: q('.plan__pin'), scrub: 0.6,
        onUpdate: function (s) { var t = s.progress * tl.duration(); setRoom(t < 2.2 ? -1 : Math.min(3, Math.floor((t - 2.2) / 1.2))); }
      }
    });
    walls.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 1.2 }, 0.2 + i * 0.12); });
    tl.to(wins, { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, 1.3)
      .to(doors, { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, 1.5)
      .to(labels, { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, 1.7)
      .to(box, { autoAlpha: 1, duration: 0.3 }, 2.1);
    pics.forEach(function (p, i) {
      var t0 = 2.2 + i * 1.2;
      tl.to(p, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.out' }, t0);
      tl.fromTo(p.querySelector('img'), { scale: 1.15 }, { scale: 1, duration: 1.2 }, t0);
    });
    tl.to({}, { duration: 0.6 });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
