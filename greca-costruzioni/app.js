/* Greca Costruzioni: hero entrance (photo wipe, line reveal, greca band draws), hero photo parallax, header,
   full-screen menu, anchors, reveals, gallery drag strip, method line, magnetic buttons, phone bar, form,
   and the GSAP signature scene: a building section built stage by stage with scroll (scavo, fondazioni,
   vespaio, getto e pilastri, murature, solai e tetto), each stage paired with their own site photo. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.getElementById('header'), bar = d.querySelector('.mbar'), hero = d.querySelector('.hero');
  var par = d.querySelector('[data-parallax] img');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (bar && hero) bar.classList.toggle('is-on', y > hero.offsetHeight * .8);
    if (par && !reduce && y < window.innerHeight * 1.4) par.style.transform = 'translate3d(0,' + (-y * .12).toFixed(1) + 'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    html.classList.toggle('menu-open', open);
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : header.offsetHeight - 1);
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

  /* method line */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .1)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + .02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* drag strip (mouse) */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = l0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Controllate l\'indirizzo email.', message: 'Scrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
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

  /* GSAP scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    buildScene();
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function buildScene() {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var st = function (n) { return sec.querySelector('[data-st="' + n + '"]'); };
    var pct = sec.querySelector('[data-pct]'), barEl = sec.querySelector('[data-bar]');
    var stages = q('[data-stage]'), pics = q('[data-sp]'), head = sec.querySelector('.scene__head');

    var mm = gsap.matchMedia();
    mm.add({ small: '(max-width: 759px)', big: '(min-width: 760px)' }, function (ctx) {
      var small = ctx.conditions.small;
      var pit = st(1).querySelector('.pit'), L = pit.getTotalLength();
      gsap.set(head, { autoAlpha: 0, y: 20 });
      gsap.set(pit, { strokeDasharray: L, strokeDashoffset: L });
      gsap.set(st(2).querySelector('.conc'), { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(st(2).querySelectorAll('.rebar, .rebar-v'), { autoAlpha: 0 });
      gsap.set(st(3).querySelectorAll('path'), { autoAlpha: 0 });
      gsap.set(st(4).querySelector('.conc'), { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(st(4).querySelectorAll('.col'), { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(st(5).querySelectorAll('.brick'), { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(st(5).querySelector('.win'), { autoAlpha: 0 });
      gsap.set(st(6).querySelectorAll('.slab'), { autoAlpha: 0, y: -40 });
      var roof = st(6).querySelector('.roof'), RL = roof.getTotalLength(), rin = st(6).querySelector('.roof-in'), RI = rin.getTotalLength();
      gsap.set(roof, { strokeDasharray: RL, strokeDashoffset: RL });
      gsap.set(rin, { strokeDasharray: RI, strokeDashoffset: RI });
      gsap.set(barEl, { scaleX: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      var at = [0, .3, 1.2, 2.1, 3.0, 3.9, 5.0];
      tl.to(head, { autoAlpha: 1, y: 0, duration: .3 }, 0)
        .to(pit, { strokeDashoffset: 0, duration: .8, ease: 'none' }, at[1])
        .to(st(2).querySelector('.conc'), { scaleY: 1, duration: .5 }, at[2])
        .to(st(2).querySelectorAll('.rebar, .rebar-v'), { autoAlpha: 1, duration: .3, stagger: .03 }, at[2] + .3)
        .to(st(3).querySelectorAll('path'), { autoAlpha: 1, duration: .2 }, at[3])
        .to(st(4).querySelector('.conc'), { scaleX: 1, duration: .4, ease: 'power1.inOut' }, at[4])
        .to(st(4).querySelectorAll('.col'), { scaleY: 1, duration: .6, stagger: .1 }, at[4] + .3)
        .to(st(5).querySelectorAll('.brick'), { scaleY: 1, duration: .3, stagger: .12 }, at[5])
        .to(st(5).querySelector('.win'), { autoAlpha: 1, duration: .3 }, at[5] + .7)
        .to(st(6).querySelectorAll('.slab'), { autoAlpha: 1, y: 0, duration: .3, stagger: .18 }, at[6])
        .to(roof, { strokeDashoffset: 0, duration: .5, ease: 'none' }, at[6] + .6)
        .to(rin, { strokeDashoffset: 0, duration: .4, ease: 'none' }, at[6] + .8)
        .to(barEl, { scaleX: 1, duration: at[6] + 1.2, ease: 'none' }, 0)
        .to({}, { duration: .4 });

      var total = at[6] + 1.2, last = -1;
      function sync() {
        var t = tl.time(), s = 1;
        for (var k = 1; k <= 6; k++) if (t >= at[k] - .05) s = k;
        pct.textContent = Math.round(Math.min(1, t / total) * 100);
        if (s === last) return;
        last = s;
        stages.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-stage') === s); });
        pics.forEach(function (p) { p.classList.toggle('is-on', +p.getAttribute('data-sp') === s); });
      }
      tl.eventCallback('onUpdate', sync);
      var trig = ScrollTrigger.create({
        trigger: sec.querySelector('.scene__in'), start: 'top top', end: small ? '+=150%' : '+=260%',
        pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
        onToggle: function (self) { html.classList.toggle('in-scene', self.isActive); }
      });
      sync();
      return function () { trig.kill(); tl.kill(); };
    });
  }
})();
