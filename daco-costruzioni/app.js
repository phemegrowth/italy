(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('.hdr');
  var bar = document.querySelector('.bar');
  var NS = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* menu */
  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* smooth anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || a.getAttribute('aria-disabled')) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - hdr.offsetHeight - 8, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = Array.prototype.indexOf.call(en.target.parentNode.children, en.target);
        en.target.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        en.target.classList.add('is-in'); io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }
  if ('IntersectionObserver' in window && bar) new IntersectionObserver(function (en) { bar.classList.toggle('is-on', !en[0].isIntersecting); }).observe(document.querySelector('.hero'));

  /* hero count-up: 100 years (their own "centenaria tradizione") */
  var num = document.querySelector('.num');
  if (num && !reduce) {
    var t0 = null, target = +num.dataset.count;
    num.textContent = '0';
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(e * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* form */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var first = null;
      form.querySelectorAll('.f [required]').forEach(function (f) {
        var ok = f.checkValidity() && f.value.trim() !== '';
        f.closest('.f').classList.toggle('is-bad', !ok); if (!ok && !first) first = f;
      });
      var chk = form.querySelector('input[name="privacy"]');
      form.querySelector('.err--chk').classList.toggle('is-bad', !chk.checked); if (!chk.checked && !first) first = chk;
      if (first) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('input', function (e) { var w = e.target.closest('.f'); if (w) w.classList.remove('is-bad'); if (e.target.name === 'privacy') form.querySelector('.err--chk').classList.remove('is-bad'); });
    form.addEventListener('change', function (e) { var w = e.target.closest('.f'); if (w) w.classList.remove('is-bad'); });
  }

  /* building drawings on the project cards (floors from the project list where stated) */
  var specs = [
    { f: 17, w: 44 }, { f: 20, w: 40, twin: true }, { f: 7, w: 92 }, { f: 6, w: 80, top: 1 },
    { f: 4, w: 108 }, { f: 6, w: 84 }, { f: 6, w: 70, top: 1 }, { f: 2, w: 112 }
  ];
  document.querySelectorAll('.rc .bld').forEach(function (svg, i) {
    var s = specs[i] || { f: 5, w: 80 }, g = svg.querySelector('.fl');
    var fh = Math.min(16, 188 / s.f), h = fh * s.f;
    var blocks = s.twin ? [[14, s.w], [66, s.w]] : [[(120 - s.w) / 2, s.w]];
    blocks.forEach(function (b) {
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', b[0]); r.setAttribute('y', 199 - h); r.setAttribute('width', b[1]); r.setAttribute('height', h);
      svg.insertBefore(r, g);
      if (s.top) { var a = document.createElementNS(NS, 'rect'); a.setAttribute('class', 'acc'); a.setAttribute('x', b[0] + 1); a.setAttribute('y', 199 - h + 1); a.setAttribute('width', b[1] - 2); a.setAttribute('height', fh - 1); svg.insertBefore(a, g); }
      for (var k = 1; k < s.f; k++) {
        var l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', b[0]); l.setAttribute('x2', b[0] + b[1]); l.setAttribute('y1', 199 - k * fh); l.setAttribute('y2', 199 - k * fh);
        g.appendChild(l);
      }
    });
    var gr = document.createElementNS(NS, 'line'); gr.setAttribute('x1', 0); gr.setAttribute('x2', 120); gr.setAttribute('y1', 199.5); gr.setAttribute('y2', 199.5); gr.setAttribute('stroke', '#d23f1f'); gr.setAttribute('stroke-width', '3'); svg.appendChild(gr);
  });

  /* signature scene: pinned horizontal projects */
  var reel = document.querySelector('.reel');
  if (reduce || !window.gsap || !window.ScrollTrigger) { reel.classList.add('is-static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var track = reel.querySelector('.reel__track');
    var cards = gsap.utils.toArray('.rc');
    var cur = reel.querySelector('.reel__cur');
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (phone ? 20 : 48)); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: reel, start: 'top top', end: function () { return '+=' + Math.round(dist() * (phone ? 1.05 : 1)); },
          pin: reel.querySelector('.reel__stage'), scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (st) {
            var n = Math.min(cards.length, 1 + Math.floor(st.progress * cards.length * 0.999));
            cur.textContent = (n < 10 ? '0' : '') + n;
          }
        }
      });
      gsap.fromTo('.reel__bar span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: reel, start: 'top top', end: function () { return '+=' + Math.round(dist() * (phone ? 1.05 : 1)); }, scrub: 0.6, invalidateOnRefresh: true } });
      cards.forEach(function (c, i) {
        var lines = c.querySelectorAll('.fl line');
        gsap.fromTo(c, { clipPath: 'inset(0% 0% 0% 100%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 98%', end: 'left 62%', scrub: true }
        });
        gsap.fromTo(lines, { opacity: 0 }, {
          opacity: 1, stagger: 0.04, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 90%', end: 'left 45%', scrub: true }
        });
      });
      return function () { gsap.set([track, cards, '.reel__bar span'], { clearProps: 'all' }); };
    });
    if (document.readyState !== 'complete') window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else window.addEventListener('load', build);
})();
