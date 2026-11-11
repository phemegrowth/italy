/* Area Media: hero entrance (name lines, strip slides in), strip drift, header, full-screen menu, anchors, reveals,
   accordion, listing cards drag + counter, timeline line, count-up, magnetic buttons, phone dock, form validation,
   and the GSAP signature scene: Piemonte and Liguria draw themselves, then a red route links the five zones. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header'), dock = d.querySelector('.dock'), hero = d.querySelector('.hero');
  var strip = d.querySelector('[data-strip]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 30);
    if (dock && hero) dock.classList.toggle('is-on', y > hero.offsetHeight - 120);
    if (strip && !reduce && html.classList.contains('is-ready') && y < window.innerHeight * 1.4) {
      strip.style.transition = 'none';
      strip.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    }
  }
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
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

  /* count-up: Google score and review count only */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    if (reduce) return;
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0), t0 = null;
    function fmt(v) { return v.toFixed(dec).replace('.', ','); }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end);
    }
    requestAnimationFrame(step);
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

  /* listing cards: mouse drag, counter */
  var cards = d.querySelector('[data-drag]'), cn = d.querySelector('[data-cards-n]');
  if (cards) {
    var its = cards.querySelectorAll('.card'), down = false, sx = 0, sl = 0;
    cards.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = cards.scrollLeft; cards.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) cards.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (down) { down = false; cards.classList.remove('is-drag'); } });
    var ct = false;
    cards.addEventListener('scroll', function () {
      if (ct) return; ct = true;
      requestAnimationFrame(function () {
        ct = false;
        var c = cards.getBoundingClientRect(), mid = c.left + Math.min(c.width / 2, 220), best = 0, bd = 1e9;
        its.forEach(function (it, i) { var r = it.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < bd) { bd = dd; best = i; } });
        if (cn) cn.textContent = ('0' + (best + 1)).slice(-2);
      });
    }, { passive: true });
    cards.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { cards.scrollBy({ left: 340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { cards.scrollBy({ left: -340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* timeline draws with scroll */
  d.querySelectorAll('[data-time]').forEach(function (l) {
    var st = l.querySelectorAll('li');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.78 - r.top) / r.height));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.15) / st.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla richiesta.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err'), ok = f.value.trim() !== '';
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

  /* GSAP signature scene: the zones */
  function zonesScene() {
    var sec = d.querySelector('.zones'), svg = sec.querySelector('.map');
    var regs = svg.querySelectorAll('.reg'), route = svg.querySelector('.route');
    var pins = svg.querySelectorAll('.pin'), tags = svg.querySelectorAll('.tag');
    var stops = sec.querySelectorAll('.stop');
    var capN = sec.querySelector('.zones__n'), capName = sec.querySelector('.zones__name'), capWhat = sec.querySelector('.zones__what');
    var L = route.getTotalLength();
    // length along the route at each pin
    var at = Array.prototype.map.call(pins, function (p) {
      var m = p.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/), px = +m[1], py = +m[2], best = 0, bd = 1e9;
      for (var s = 0; s <= L; s += 4) { var q = route.getPointAtLength(s), dd = (q.x - px) * (q.x - px) + (q.y - py) * (q.y - py); if (dd < bd) { bd = dd; best = s; } }
      return best;
    });
    at[0] = 0;
    regs.forEach(function (r) { var l = r.getTotalLength(); r.style.strokeDasharray = l; r.dataset.len = l; });
    route.style.strokeDasharray = L;
    var cur = -1;
    function setStop(i) {
      if (i === cur) return; cur = i;
      stops.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
      capN.textContent = '0' + (i + 1) + ' / 05';
      capName.textContent = stops[i].querySelector('h3').textContent;
      capWhat.textContent = stops[i].querySelector('p').textContent;
    }

    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 960px)', desk: '(min-width: 961px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      gsap.set(regs, { strokeDashoffset: function (i, el) { return el.dataset.len; }, fillOpacity: 0 });
      gsap.set(['.sea', '.sea__t', '.reg__t', '.po'], { opacity: 0 });
      gsap.set(route, { strokeDashoffset: L });
      gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(tags, { opacity: 0 });
      cur = -1; setStop(0);
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: phone ? '+=150%' : '+=220%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (s) {
            var t = s.progress * tl.duration(), i = 0;
            for (var k = 0; k < 5; k++) if (t >= 1 + k * 1 - 0.05) i = k;
            setStop(i);
          }
        }
      });
      tl.to(regs, { strokeDashoffset: 0, duration: 0.7 }, 0);
      tl.to(regs, { fillOpacity: 1, duration: 0.3 }, 0.55);
      tl.to(['.sea', '.sea__t', '.reg__t', '.po'], { opacity: 1, duration: 0.3 }, 0.6);
      // stop k is reached at time 1 + k
      for (var k = 0; k < 5; k++) {
        if (k > 0) tl.to(route, { strokeDashoffset: L - at[k], duration: 0.75, ease: 'power1.inOut' }, k + 0.25);
        tl.to(pins[k], { scale: 1, duration: 0.2, ease: 'back.out(3)' }, k + 1);
        tl.to(tags[k], { opacity: 1, duration: 0.2 }, k + 1.02);
      }
      tl.to(route, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' }, 5.2);
      tl.to({}, { duration: 0.3 }, 5.8);
      return function () { cur = -1; };
    });
  }

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    zonesScene();
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) {
    var started = false, go = function () { if (!started) { started = true; start(); } };
    d.fonts.ready.then(go);
    setTimeout(go, 1500);
  } else start();
})();
