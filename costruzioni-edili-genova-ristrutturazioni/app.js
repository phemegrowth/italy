(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  var hdr = document.querySelector('.hdr'), bar = document.querySelector('.bar');
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-small', y > 40);
    bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  function setMenu(o) { burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Chiudi il menu' : 'Apri il menu'); menu.hidden = !o; document.body.style.overflow = o ? 'hidden' : ''; }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (el) { el.classList.add('is-vis'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = [].slice.call(e.target.parentNode.children).filter(function (c) { return c.classList.contains('rv'); });
        e.target.style.transitionDelay = sib.indexOf(e.target) * 90 + 'ms';
        e.target.classList.add('is-vis'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-vis'); else io.observe(el); });
  }

  /* before / after slider */
  var box = document.querySelector('.ba__box'), range = document.querySelector('.ba__range');
  if (box && range) {
    var setX = function () { box.style.setProperty('--x', range.value + '%'); };
    range.addEventListener('input', setX); setX();
  }

  /* form */
  var form = document.querySelector('.form');
  var msg = { name: 'Scrivi il tuo nome.', phone: 'Serve un numero per richiamarti.', email: 'Email non valida.', lavoro: 'Scegli il tipo di lavoro.', message: 'Scrivi due righe sul lavoro.' };
  function check(el) {
    var f = el.closest('.f'); if (!f) return true;
    var v = el.value.trim(), ok = !(el.required && !v);
    if (ok && el.type === 'email' && v) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (ok && el.name === 'phone') ok = v.replace(/\D/g, '').length >= 8;
    f.classList.toggle('bad', !ok); f.querySelector('.err').textContent = ok ? '' : msg[el.name];
    return ok;
  }
  form.addEventListener('submit', function (e) {
    var bad = [].slice.call(form.querySelectorAll('.f input,.f select,.f textarea')).filter(function (el) { return !check(el); });
    if (bad.length) { e.preventDefault(); bad[0].focus(); }
  });
  form.addEventListener('blur', function (e) { if (e.target.closest('.f')) check(e.target); }, true);
  var yr = document.querySelector('.yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* signature scene: the plan draws itself, rooms fill with their own job photos */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  function build() {
    var scene = document.querySelector('.plan');
    var walls = gsap.utils.toArray('.walls path'), doors = gsap.utils.toArray('.doors path');
    var phs = gsap.utils.toArray('.rooms .ph'), letters = gsap.utils.toArray('.letters text');
    var items = [].slice.call(document.querySelectorAll('.plan__list li'));
    var nowL = document.querySelector('.plan__now span'), nowB = document.querySelector('.plan__now b');
    var pct = document.querySelector('.plan__pct'), barI = document.querySelector('.plan__bar i');
    var names = items.map(function (li) { return li.textContent.replace(/^[A-F]/, '').trim(); });
    var last = -2;
    function setRoom(i) {
      if (i === last) return; last = i;
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); });
      if (i >= 0) { nowL.textContent = 'ABCDEF'[i]; nowB.textContent = names[i]; }
      else { nowL.textContent = '·'; nowB.textContent = 'La pianta'; }
    }
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 700px)', desk: '(min-width: 701px)' }, function (c) {
      var phone = c.conditions.phone;
      gsap.set(walls.concat(doors), { strokeDashoffset: 1 });
      gsap.set(letters, { opacity: 0 });
      gsap.set(phs, { opacity: 0, y: 24 });
      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scene, start: 'top top', end: phone ? '+=140%' : '+=240%', pin: '.plan__pin', scrub: 0.6, anticipatePin: 1,
          onUpdate: function (st) {
            var p = st.progress;
            barI.style.transform = 'scaleX(' + p.toFixed(3) + ')';
            pct.textContent = Math.round(p * 100) + '%';
            setRoom(p < 0.28 ? -1 : Math.min(5, Math.floor((p - 0.28) / 0.115)));
          }
        }
      });
      tl.to(walls, { strokeDashoffset: 0, duration: 0.2, stagger: 0.04 })
        .to(doors, { strokeDashoffset: 0, duration: 0.06, stagger: 0.01 }, '>-0.04')
        .to(letters, { opacity: 1, duration: 0.04, stagger: 0.005 }, '<');
      phs.forEach(function (ph, i) {
        tl.to(ph, { opacity: 1, y: 0, duration: 0.09, ease: 'power1.out' }, 0.3 + i * 0.115);
      });
      tl.to(letters, { opacity: 0.85, duration: 0.02 }, 0.98);
      return function () { gsap.set(walls.concat(doors, phs, letters), { clearProps: 'all' }); };
    });
    setRoom(-1);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
