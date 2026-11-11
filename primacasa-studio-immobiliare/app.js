/* PrimaCasa Studio Immobiliare: hero entrance (photo wipe + Ken Burns, headline line by line), header, full-screen menu,
   anchors, reveals, service photo swap, process line, count-up, magnetic buttons, phone contact bar, form validation,
   and the GSAP signature scene: the latest listings, each with a small building elevation where its floor lights up.
   Desktop: the strip runs sideways with the scroll. Phone: the cards stack one over the other. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* building elevations: 7 levels (0 = piano rialzato ... 6), the listing's floors marked */
  d.querySelectorAll('.card[data-floors]').forEach(function (card) {
    var g = card.querySelector('.bld__fl'), on = card.getAttribute('data-floors').split(',').map(Number);
    var ns = 'http://www.w3.org/2000/svg', top = 14, h = 18.6, out = '';
    for (var lv = 6; lv >= 0; lv--) {
      var y = top + (6 - lv) * h, cls = on.indexOf(lv) > -1 ? ' on' : '';
      out += '<rect class="fl' + cls + '" data-lv="' + lv + '" x="18" y="' + y.toFixed(1) + '" width="84" height="' + h.toFixed(1) + '"/>';
      if (lv > 0) for (var k = 0; k < 4; k++) out += '<rect class="w' + cls + '" x="' + (26 + k * 19) + '" y="' + (y + 5).toFixed(1) + '" width="10" height="9"/>';
    }
    g.innerHTML = out;
    void ns;
  });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* full-screen menu */
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

  /* reveals (anything already in view shows at once) */
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

  /* count-up (sourced quantities only) */
  reveal(d.querySelectorAll('[data-countup]'), function (el) {
    var to = +el.getAttribute('data-countup');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* services: hover or the item nearest the middle swaps the photo (desktop) */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) { it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); }); });
  var lt = false;
  window.addEventListener('scroll', function () {
    if (lt) return; lt = true;
    requestAnimationFrame(function () {
      lt = false;
      var mid = window.innerHeight * (window.innerWidth < 961 ? 0.68 : 0.5), best = null, bd = 1e9;
      items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
      if (best && bd < window.innerHeight * 0.35) showPic(best.getAttribute('data-for'), best);
    });
  }, { passive: true });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* phone contact bar: after the hero, hidden while the listings scene is pinned and over the contact section */
  var pbar = d.querySelector('.pbar'), hero = d.querySelector('.hero'), contact = d.getElementById('contatti');
  var scenePinned = false;
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
    var msgs = { name: 'Scrivete nome e cognome.', phone: 'Serve un numero per richiamarvi.', email: 'Serve un indirizzo email valido.', message: 'Due righe sulla casa o su cosa cercate.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    html.classList.add('st-on');
    var mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', function () { return listings(false); });
    mm.add('(max-width: 899px)', function () { return listings(true); });
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function listings(small) {
    var sec = d.querySelector('[data-scene]');
    var deck = sec.querySelector('[data-deck]'), cards = gsap.utils.toArray(sec.querySelectorAll('.card'));
    var cnt = sec.querySelector('[data-count]'), barEl = sec.querySelector('[data-bar]');
    var head = sec.querySelectorAll('.scene__head > *'), note = sec.querySelector('.scene__note');
    var n = cards.length, last = -1;
    var lit = function (i) {
      cards.forEach(function (c, k) { c.querySelectorAll('.bld__fl rect').forEach(function (r) { r.classList.toggle('on', k <= i && r.hasAttribute('data-on')); }); });
    };
    /* remember which rects are the listing's floors, then switch them off until the card is reached */
    cards.forEach(function (c) { c.querySelectorAll('.bld__fl rect.on').forEach(function (r) { r.setAttribute('data-on', ''); r.classList.remove('on'); }); });
    function setActive(i) {
      if (i === last) return; last = i;
      cnt.textContent = '0' + (i + 1);
      lit(i);
    }
    gsap.set(note, { autoAlpha: 0 });
    gsap.set(barEl, { scaleX: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (!small) {
      gsap.set(cards, { autoAlpha: 0, y: 80, clipPath: 'inset(100% 0 0 0 round 14px)' });
      var dist = function () { return Math.max(0, deck.scrollWidth - deck.clientWidth + 48); };
      tl.to(cards.slice(0, 3), { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 14px)', duration: .6, stagger: .15 }, .05)
        .to(deck, { x: function () { return -dist(); }, duration: 3, ease: 'none' }, 1.1)
        .to(cards.slice(3), { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 14px)', duration: .7, stagger: .5 }, 1.6)
        .to(note, { autoAlpha: 1, duration: .4 }, 3.6)
        .to(barEl, { scaleX: 1, duration: 4.1, ease: 'none' }, 0)
        .to({}, { duration: .4 }, 4.1);
      var win = sec.querySelector('.deck-win');
      /* the counter is how many listings you have seen: a card counts once it is mostly inside the window */
      tl.eventCallback('onUpdate', function () {
        var wr = win.getBoundingClientRect().right, i = 0;
        cards.forEach(function (c, k) {
          var r = c.getBoundingClientRect();
          if (+gsap.getProperty(c, 'opacity') > .5 && r.left < wr - r.width * .6) i = k;
        });
        setActive(i);
      });
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: '+=260%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    } else {
      gsap.set(cards[0], { autoAlpha: 0, y: 60 });
      gsap.set(cards.slice(1), { y: function () { return window.innerHeight; }, autoAlpha: 1 });
      tl.to(cards[0], { autoAlpha: 1, y: 0, duration: .4 }, .05);
      var at = [0.4];
      for (var i = 1; i < n; i++) {
        var t0 = .8 + (i - 1) * 1;
        at.push(t0 + .5);
        tl.to(cards[i], { y: 0, duration: .9, ease: 'power2.inOut' }, t0)
          .to(cards[i - 1], { scale: .92, y: -18, autoAlpha: .35, duration: .9, ease: 'power2.inOut' }, t0);
      }
      var endT = .8 + (n - 1) * 1;
      tl.to(note, { autoAlpha: 1, duration: .3 }, endT - .2)
        .to(barEl, { scaleX: 1, duration: endT, ease: 'none' }, 0)
        .to({}, { duration: .3 }, endT);
      tl.eventCallback('onUpdate', function () {
        var t = tl.time(), k2 = 0;
        for (var k = 0; k < at.length; k++) if (t >= at[k]) k2 = k;
        setActive(k2);
      });
      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: '+=180%', pin: true, scrub: .5, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
        onToggle: function (self) { scenePinned = self.isActive; bar(); }
      });
    }
    setActive(0);
    return function () {
      cards.forEach(function (c) { c.querySelectorAll('.bld__fl rect[data-on]').forEach(function (r) { r.classList.add('on'); r.removeAttribute('data-on'); }); });
      last = -1;
    };
  }
})();
