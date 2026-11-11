/* Ditta Artigiano Edile Udine: hero entrance and count-up, header, phone menu, anchors, reveals, services accordion with
   photo swap, process line, drag strip, scan line, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: the new floor laid over the old one, layer by layer (tiles, cork, waterproof core, wood). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* year */
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

  /* anchors with header offset */
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
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* scan line */
  var scan = d.querySelector('.scan');
  if (scan) {
    var setH = function () { scan.style.setProperty('--h', scan.offsetHeight + 'px'); };
    setH(); w.addEventListener('resize', setH);
    reveal([scan], function (el) { el.classList.add('is-in'); });
  }

  /* hero count-up (17 years since 2009) */
  var num = d.querySelector('[data-count]');
  if (num && !reduce) {
    var to = +num.getAttribute('data-count');
    num.textContent = '0';
    setTimeout(function () {
      var t0 = performance.now(), dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, 450);
  }

  /* services accordion + photo swap */
  var items = d.querySelectorAll('.svc__it'), pics = d.querySelectorAll('[data-pic]'), tag = d.querySelector('[data-tag]');
  function showPic(k) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    if (tag) tag.textContent = '0' + k + ' / 07';
  }
  function openItem(it) {
    items.forEach(function (o) {
      var on = o === it;
      o.classList.toggle('is-act', on);
      o.querySelector('.svc__btn').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    showPic(it.getAttribute('data-k'));
  }
  items.forEach(function (it) {
    var b = it.querySelector('.svc__btn');
    b.addEventListener('click', function () {
      if (it.classList.contains('is-act') && w.innerWidth <= 860) {
        it.classList.remove('is-act'); b.setAttribute('aria-expanded', 'false'); return;
      }
      openItem(it);
    });
    if (w.matchMedia('(hover: hover) and (min-width: 861px)').matches) {
      b.addEventListener('mouseenter', function () { openItem(it); });
    }
  });

  /* drag strip */
  var strip = d.querySelector('[data-drag]'), bar = d.querySelector('[data-strip-bar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    w.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = sl - dx;
    });
    w.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var vis = strip.clientWidth / strip.scrollWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      if (bar) bar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    };
    if (bar) { bar.style.transformOrigin = 'left'; bar.style.width = '100%'; }
    strip.addEventListener('scroll', upd, { passive: true }); w.addEventListener('resize', upd); upd();
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 300, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -300, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* magnetic buttons (mouse only) */
  if (!reduce && w.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone bar: hidden until the hero is passed */
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
      message: function (v) { return v.trim().length > 4 ? '' : 'Descrivete il lavoro in poche parole.'; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value), box = el.closest('.f');
      box.classList.toggle('is-bad', !!msg);
      box.querySelector('.f__err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    form.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.f') && el.closest('.f').classList.contains('is-bad')) check(el); });
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

  /* ---------- GSAP: parallax, process line, signature scene ---------- */
  if (!w.gsap || !w.ScrollTrigger) return;
  var gsap = w.gsap, ST = w.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });

  var floor = d.querySelector('.floor'), layers = d.querySelectorAll('.ly'), steps = d.querySelectorAll('.floor__steps li');
  var cap = d.querySelector('[data-cap]'), layN = d.querySelector('[data-layer-n]'), done = d.querySelector('.floor__done');
  var capTexts = Array.prototype.map.call(steps, function (li) { return li.querySelector('span').innerHTML; });

  if (reduce) {
    steps.forEach(function (li) { li.classList.add('is-on'); });
    if (layN) layN.textContent = '4';
    if (cap) cap.innerHTML = capTexts[3];
    return;
  }

  function build() {
    /* hero photo moves slower than the page */
    gsap.to('[data-par]', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* process line */
    var mm0 = gsap.matchMedia();
    mm0.add('(min-width: 861px)', function () {
      gsap.fromTo('[data-line]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.how__track', start: 'top 75%', end: 'bottom 55%', scrub: .6 } });
    });
    mm0.add('(max-width: 860px)', function () {
      gsap.fromTo('[data-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.how__track', start: 'top 70%', end: 'bottom 60%', scrub: .6 } });
    });

    /* signature scene */
    if (!floor) return;
    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 861px)', phone: '(max-width: 860px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var t = parseFloat(getComputedStyle(d.querySelector('.slab')).getPropertyValue('--t')) || 20;
      var lift = phone ? 120 : 220;
      var cur = -1;
      function setStep(i) {
        if (i === cur) return; cur = i;
        steps.forEach(function (li, k) { li.classList.toggle('is-on', k <= i); });
        if (layN) layN.textContent = String(i + 1);
        if (cap) cap.innerHTML = capTexts[i];
      }
      layers.forEach(function (ly, k) { gsap.set(ly, { z: k * t }); });
      gsap.set(layers[0], { opacity: 0, z: -40 });
      gsap.set([layers[1], layers[2], layers[3]], { opacity: 0, z: function (k) { return (k + 1) * t + lift; } });
      gsap.set(done, { opacity: 0, scale: .6 });
      gsap.set('.slab', { rotationX: 58, rotationZ: -52, scale: .92 });
      setStep(0);

      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: floor, pin: '.floor__pin', start: 'top top', end: phone ? '+=140%' : '+=230%', scrub: .7, anticipatePin: 1,
          onUpdate: function (self) {
            var p = self.progress;
            setStep(p < .3 ? 0 : p < .53 ? 1 : p < .76 ? 2 : 3);
          }
        }
      });
      tl.to(layers[0], { opacity: 1, z: 0, duration: .45 }, 0)
        .to('.slab', { rotationZ: -40, scale: 1, duration: 3.6, ease: 'none' }, 0)
        .to(layers[1], { opacity: 1, duration: .25 }, .9)
        .to(layers[1], { z: t, duration: .8, ease: 'power3.in' }, .9)
        .to(layers[2], { opacity: 1, duration: .25 }, 1.8)
        .to(layers[2], { z: 2 * t, duration: .8, ease: 'power3.in' }, 1.8)
        .to(layers[3], { opacity: 1, duration: .25 }, 2.7)
        .to(layers[3], { z: 3 * t, duration: .8, ease: 'power3.in' }, 2.7)
        .to(done, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2)' }, 3.5)
        .to({}, { duration: .4 });
      return function () { gsap.set([layers, done, '.slab'], { clearProps: 'all' }); };
    });
  }

  var go = function () { build(); w.addEventListener('load', function () { ST.refresh(); }); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
})();
