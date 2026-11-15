/* Gruppo Musso: header, menu, hero fan, reveals, list photo swap, drag strip, blueprint scene, form. */
(function(){
  var d=document, w=window, html=d.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hero entrance on the first frame
  var hero=d.querySelector('.hero');
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ hero && hero.classList.add('is-in'); }); });

  // header shrink + phone bar
  var hd=d.querySelector('[data-hd]'), mbar=d.querySelector('[data-mbar]');
  function onScroll(){
    var y=w.scrollY||0;
    hd.classList.toggle('is-small', y>20);
    if(mbar){ var hb=hero?hero.offsetHeight*.7:400; mbar.classList.toggle('is-on', y>hb); }
  }
  w.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // menu
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded', open?'true':'false');
    burger.setAttribute('aria-label', open?'Chiudi il menu':'Apri il menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', open?'false':'true');
    d.body.style.overflow=open?'hidden':'';
  }
  burger.addEventListener('click', function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  d.addEventListener('keydown', function(e){ if(e.key==='Escape' && menu.classList.contains('is-open')){ setMenu(false); burger.focus(); } });

  // reveals
  var rs=[].slice.call(d.querySelectorAll('.r'));
  if(reduce || !('IntersectionObserver' in w)){ rs.forEach(function(el){ el.classList.add('is-v'); }); }
  else {
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ var el=e.target, sib=[].slice.call(el.parentNode.children).filter(function(c){return c.classList.contains('r');}); var i=Math.max(0,sib.indexOf(el)); el.style.transitionDelay=Math.min(i*80,400)+'ms'; el.classList.add('is-v'); io.unobserve(el); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    rs.forEach(function(el){ if(el.getBoundingClientRect().top<w.innerHeight*.92) el.classList.add('is-v'); else io.observe(el); });
  }

  // list drives the photo (desktop), active item on scroll
  var items=[].slice.call(d.querySelectorAll('[data-sw]')), phs=[].slice.call(d.querySelectorAll('[data-ph]'));
  function sw(i){ phs.forEach(function(p){ p.classList.toggle('is-on', p.getAttribute('data-ph')===String(i)); }); items.forEach(function(it){ it.classList.toggle('is-on', it.getAttribute('data-sw')===String(i)); }); }
  items.forEach(function(it){ it.addEventListener('mouseenter', function(){ sw(it.getAttribute('data-sw')); }); });
  if('IntersectionObserver' in w){
    var io2=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) sw(e.target.getAttribute('data-sw')); }); }, {rootMargin:'-45% 0px -45% 0px'});
    items.forEach(function(it){ io2.observe(it); });
  }

  // drag strip + progress bar
  var strip=d.querySelector('[data-drag]'), bar=d.querySelector('[data-bar]');
  if(strip){
    var down=false, sx=0, sl=0, moved=false;
    strip.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse') return; down=true; moved=false; sx=e.clientX; sl=strip.scrollLeft; strip.classList.add('is-drag'); });
    w.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; strip.scrollLeft=sl-dx; });
    w.addEventListener('pointerup', function(){ down=false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
    function pb(){ var m=strip.scrollWidth-strip.clientWidth; var p=m>0?strip.scrollLeft/m:1; bar.style.transform='scaleX('+(0.15+0.85*p)+')'; }
    strip.addEventListener('scroll', pb, {passive:true}); pb();
  }

  // blueprint scene
  var scene=d.querySelector('[data-scene]');
  var lines=scene?[].slice.call(scene.querySelectorAll('.bp__ln path')):[];
  lines.forEach(function(p){ p.setAttribute('pathLength','1'); });
  var photo=scene&&scene.querySelector('.bp__photo'), pct=scene&&scene.querySelector('[data-pct]');
  var steps=scene?[].slice.call(scene.querySelectorAll('.step')):[];
  var grid=scene&&scene.querySelector('.bp__grid');
  function setStep(i){ steps.forEach(function(s,k){ s.classList.toggle('is-on', k===i); }); }
  function finalState(){
    if(!scene) return;
    photo.style.clipPath='inset(0 0 0 0)'; lines.forEach(function(p){ p.style.strokeDashoffset='0'; p.style.opacity='0'; });
    if(grid) grid.style.opacity='0'; if(pct) pct.textContent='100'; setStep(2);
  }
  if(scene && (reduce || !w.gsap || !w.ScrollTrigger)){ finalState(); }
  else if(scene){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ignoreMobileResize:true});
    var build=function(){
      var mm=gsap.matchMedia();
      mm.add({desk:'(min-width: 861px)', mob:'(max-width: 860px)'}, function(ctx){
        var mob=ctx.conditions.mob;
        var state={b:0};
        gsap.set(lines,{strokeDashoffset:1,opacity:1}); gsap.set(photo,{clipPath:'inset(100% 0% 0% 0%)'}); gsap.set(grid,{opacity:1});
        var tl=gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:scene, start:'top top', end: mob?'+=130%':'+=220%', pin:true, scrub:.6,
          onUpdate:function(st){ var p=st.progress; setStep(p<.36?0:(p<.55?1:2)); }}});
        tl.to(lines,{strokeDashoffset:0,duration:.36,stagger:.012},0)
          .to(grid,{opacity:.25,duration:.15},.4)
          .to(state,{b:100,duration:.42,ease:'steps(5)',onUpdate:function(){ var v=state.b; photo.style.clipPath='inset('+(100-v)+'% 0% 0% 0%)'; if(pct) pct.textContent=Math.round(v); }},.52)
          .to(lines,{opacity:0,duration:.12},.86)
          .to(grid,{opacity:0,duration:.1},.88)
          .to({}, {duration:.06});
        return function(){ tl.kill(); };
      });
    };
    (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(function(){ build(); ScrollTrigger.refresh(); });
    w.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  }

  // form validation
  var form=d.querySelector('.form');
  if(form){
    form.addEventListener('submit', function(e){
      var ok=true;
      form.querySelectorAll('[required]').forEach(function(f){
        var fld=f.closest('.fld'), err=fld.querySelector('.err'), v=f.value.trim(), msg='';
        if(!v) msg='Campo obbligatorio';
        else if(f.type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg='Email non valida';
        else if(f.type==='tel' && v.replace(/\D/g,'').length<6) msg='Numero non valido';
        fld.classList.toggle('has-err', !!msg); err.textContent=msg; if(msg && ok){ ok=false; f.focus(); }
      });
      if(!ok) e.preventDefault();
    });
  }

  var y=d.querySelector('[data-year]'); if(y) y.textContent=new Date().getFullYear();
})();
