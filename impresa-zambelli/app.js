/* Impresa Zambelli: hero reel entrance + drift, header, menu, anchors, reveals, count-up, services photo swap,
   drag strips, chip filter, process line, magnetic buttons, phone bar, form, and the GSAP signature scene:
   a map from Verona up the Valpantena to the Lessinia where their building sites drop in and the homes add up. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var yr = d.querySelector('.js-year'); if (yr) yr.textContent = new Date().getFullYear();

  /* header + phone bar */
  var header = d.querySelector('.header'), hero = d.querySelector('.hero'), mbar = d.querySelector('.mbar');
  function onScroll() {
    header.classList.toggle('is-small', window.scrollY > 40);
    if (mbar) mbar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.6);
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

  /* anchors with header offset; data-pick preselects the form */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id); if (!t) return;
      e.preventDefault();
      var pick = a.getAttribute('data-pick'), sel = d.getElementById('f-type');
      if (pick && sel) sel.value = pick;
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
  reveal(d.querySelectorAll('.r, .clip'), function (el) { el.classList.add('is-in'); });

  /* count-up (years in business, sourced) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  });

  /* hero reel drifts left with the scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.4) reel.style.transform = 'translate3d(' + (-y * 0.4).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* services: photo follows hover or the item in the middle of the screen (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.slist__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt || window.innerWidth < 961) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* drag strips (mouse); touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, sx = 0, sl = 0;
    s.addEventListener('mousedown', function (e) { down = true; sx = e.pageX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('mousemove', function (e) { if (!down) return; e.preventDefault(); s.scrollLeft = sl - (e.pageX - sx); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* chips filter the work strip */
  var chips = d.querySelectorAll('.chip'), cards = d.querySelectorAll('.wcard'), track = d.querySelector('.work__track');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      var k = 0;
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-t') === f;
        card.classList.toggle('is-out', !show);
        card.classList.remove('is-pop');
        if (show && !reduce) { void card.offsetWidth; card.style.animationDelay = (k++ * 60) + 'ms'; card.classList.add('is-pop'); }
      });
      track.scrollLeft = 0;
    });
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it) { it.classList.toggle('is-lit', it.getBoundingClientRect().top < vh * 0.75 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (mouse only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Scrivete il vostro nome.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 6 ? '' : 'Serve un numero di telefono valido.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Controllate l\'indirizzo email.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'Diteci in breve cosa cercate.'; }
    };
    function check(inp) {
      var fn = rules[inp.name]; if (!fn) return true;
      var msg = fn(inp.value), box = inp.closest('.f');
      box.classList.toggle('is-bad', !!msg); box.querySelector('.f__err').textContent = msg;
      inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, textarea').forEach(function (i) { i.addEventListener('blur', function () { if (i.value) check(i); }); });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      ['name', 'phone', 'email', 'message'].forEach(function (n) { var i = form.elements[n]; if (!check(i)) { ok = false; first = first || i; } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- signature scene ---------- */
  var scene = d.querySelector('.scene');
  var countEl = d.querySelector('.js-count');
  var stages = d.querySelectorAll('.stage');
  function setStage(i) { stages.forEach(function (s, k) { s.classList.toggle('is-act', k === i); }); }
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (!scene || reduce || !hasGsap) { if (scene) scene.classList.add('scene--static'); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var river = scene.querySelector('.map__river'), road = scene.querySelector('.map__road');
    var rl = river.getTotalLength(), dl = road.getTotalLength();
    // where Quinto and Cerro sit along the road
    function near(x, y) { var best = 0, bd = 1e9; for (var s = 0; s <= dl; s += 2) { var p = road.getPointAtLength(s), dd = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (dd < bd) { bd = dd; best = s; } } return best; }
    var atQuinto = near(222, 374), atCerro = near(290, 172);
    var p0 = scene.querySelectorAll('.pins--0 .pin'), p1 = scene.querySelectorAll('.pins--1 .pin'), p2 = scene.querySelectorAll('.pins--2 .pin');
    var allPins = scene.querySelectorAll('.pin');
    var cnt = { n: 0 };
    function paint() { countEl.textContent = Math.round(cnt.n); }

    gsap.set(river, { strokeDasharray: rl, strokeDashoffset: rl });
    gsap.set(road, { strokeDasharray: dl, strokeDashoffset: dl });
    gsap.set(allPins, { opacity: 0 });
    gsap.set(scene.querySelectorAll('.pin circle'), { scale: 0, transformOrigin: '50% 50%' });
    function pop(g, at, stg) {
      var list = g.length !== undefined ? g : [g];
      var circles = Array.prototype.map.call(list, function (x) { return x.querySelector('circle'); });
      tl.to(list, { opacity: 1, stagger: stg || 0, duration: 0.3 }, at)
        .to(circles, { scale: 1, stagger: stg || 0, duration: 0.45, ease: 'back.out(2.4)' }, at);
    }
    gsap.set('.map__hills path', { opacity: 0, y: 12 });
    gsap.set('.scene__count, .stages', { opacity: 0, y: 20 });
    paint(); setStage(0);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scene, start: 'top top', pin: '.scene__pin', scrub: 0.6, anticipatePin: 1,
        end: function () { return '+=' + Math.round(window.innerHeight * (window.innerWidth < 961 ? 1.4 : 2.2)); },
        invalidateOnRefresh: true,
        onToggle: function (self) { if (mbar) mbar.classList.toggle('is-hid', self.isActive); },
        onUpdate: function (self) { var p = self.progress; setStage(p < 0.5 ? 0 : (p < 0.7 ? 1 : 2)); }
      }
    });
    tl.to('.map__hills path', { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, 0)
      .to('.scene__count, .stages', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2)
      .to(river, { strokeDashoffset: 0, duration: 1.4 }, 0.2)
      .to(cnt, { n: 475, duration: 2.4, onUpdate: paint }, 1.4)
      .to(road, { strokeDashoffset: dl - atQuinto, duration: 0.9 }, 4.2)
      .to(cnt, { n: 484, duration: 0.5, onUpdate: paint }, 5.0)
      .to(road, { strokeDashoffset: dl - atCerro, duration: 1.3 }, 5.7)
      .to(road, { strokeDashoffset: 0, duration: 0.8 }, 7.0)
      .to(cnt, { n: 753, duration: 1.4, onUpdate: paint }, 6.9)
      .to({}, { duration: 1.2 });
    pop(p0, 1.4, 0.35); pop(p1, 5.0); pop(p2[0], 6.9); pop(p2[1], 7.7);
  }

  function start() { build(); ScrollTrigger.refresh(); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else start();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
