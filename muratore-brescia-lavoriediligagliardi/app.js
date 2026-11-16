/* Lavori Edili Gagliardi: header, menu, reveals, cursor photo on rows, drag strip, form, hero curtain (H), brick wall scene */
(function(){
  'use strict';
  var d=document, w=window;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasG=!!(w.gsap&&w.ScrollTrigger);

  d.querySelectorAll('.yr').forEach(function(e){e.textContent=new Date().getFullYear();});

  var hdr=d.querySelector('.hdr'), bar=d.querySelector('.bar'), hero=d.querySelector('.hero');
  function onScroll(){var y=w.scrollY;hdr.classList.toggle('is-small',y>30);if(bar)bar.classList.toggle('is-on',y>hero.offsetHeight*0.6);}
  w.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    if(open){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('is-open');});}
    else{menu.classList.remove('is-open');setTimeout(function(){if(!menu.classList.contains('is-open'))menu.hidden=true;},520);}
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true');});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus();}});

  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in w)){rv.forEach(function(e){e.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
      var sib=[].slice.call(en.target.parentNode.children).filter(function(x){return x.classList.contains('rv');});
      en.target.style.transitionDelay=(Math.min(Math.max(0,sib.indexOf(en.target)),6)*70)+'ms';
      en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(e){if(e.getBoundingClientRect().top<w.innerHeight)e.classList.add('in');else io.observe(e);});
  }

  /* rows: photo follows the cursor (desktop only) */
  var follow=d.querySelector('.follow'), fimg=follow&&follow.querySelector('img');
  if(fine&&follow&&!reduce){
    var fx=0,fy=0,tx=0,ty=0,raf=null;
    function loop(){fx+=(tx-fx)*.18;fy+=(ty-fy)*.18;follow.style.left=fx+'px';follow.style.top=fy+'px';raf=Math.abs(tx-fx)+Math.abs(ty-fy)>.5?requestAnimationFrame(loop):null;}
    d.querySelectorAll('.row').forEach(function(r){
      r.addEventListener('mouseenter',function(e){fimg.src=r.getAttribute('data-img');tx=fx=e.clientX;ty=fy=e.clientY;follow.classList.add('is-on');});
      r.addEventListener('mouseleave',function(){follow.classList.remove('is-on');});
      r.addEventListener('mousemove',function(e){tx=e.clientX+150;ty=e.clientY;if(!raf)raf=requestAnimationFrame(loop);});
    });
  }

  /* drag strip */
  var strip=d.querySelector('[data-drag]');
  if(strip&&fine){
    var down=false,sx=0,sl=0,moved=false;
    strip.addEventListener('mousedown',function(e){down=true;moved=false;sx=e.pageX;sl=strip.scrollLeft;strip.classList.add('is-drag');});
    w.addEventListener('mouseup',function(){down=false;strip.classList.remove('is-drag');});
    strip.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();var dx=e.pageX-sx;if(Math.abs(dx)>3)moved=true;strip.scrollLeft=sl-dx;});
  }

  /* form */
  var form=d.querySelector('.form');
  var msgs={name:'Scrivete il vostro nome.',phone:'Serve un numero di telefono.',email:'Controllate l\'indirizzo email.',lavoro:'Scegliete il tipo di lavoro.',message:'Due righe sul lavoro.'};
  function check(el){
    var ok=el.checkValidity(); if(el.name==='phone') ok=ok&&/[0-9]{6,}/.test(el.value.replace(/\D/g,''));
    var f=el.closest('.f'); f.classList.toggle('is-bad',!ok); f.querySelector('small').textContent=ok?'':msgs[el.name]; return ok;
  }
  var fields=[].slice.call(form.querySelectorAll('.f input,.f select,.f textarea'));
  fields.forEach(function(el){el.addEventListener('blur',function(){if(el.value)check(el);});el.addEventListener('input',function(){if(el.closest('.f').classList.contains('is-bad'))check(el);});});
  form.addEventListener('submit',function(e){var bad=fields.filter(function(el){return !check(el);});if(bad.length){e.preventDefault();bad[0].focus();}});

  /* wall: draw the brick courses (also without GSAP) */
  var ns='http://www.w3.org/2000/svg', cg=d.querySelector('.wall .courses'), courses=[];
  var X0=20,X1=620,Y1=390,BH=20,GAP=4,BL=56,P=BL+GAP,N=Math.floor((Y1-20)/(BH+GAP));
  for(var i=0;i<N;i++){
    var g=d.createElementNS(ns,'g'); g.setAttribute('class','course');
    var y=Y1-(i+1)*(BH+GAP)+GAP, off=(i%2)?-P/2:0;
    for(var x=X0+off;x<X1;x+=P){
      var r=d.createElementNS(ns,'rect'); r.setAttribute('x',Math.max(X0,x)); r.setAttribute('y',y);
      r.setAttribute('width',Math.min(x+BL,X1)-Math.max(X0,x)); r.setAttribute('height',BH);
      r.setAttribute('class','brick'+(((x/P|0)+i)%3===0?' alt':'')); g.appendChild(r);
    }
    cg.appendChild(g); courses.push(g);
  }
  var cnt=d.querySelector('.wc-n'); if(cnt) cnt.textContent=N;
  var stages=[].slice.call(d.querySelectorAll('.stages li'));

  if(!hasG||reduce){var cu=d.querySelector('.curtain');if(cu)cu.style.display='none';return;}
  var gsap=w.gsap, ST=w.ScrollTrigger;
  gsap.registerPlugin(ST); ST.config({ignoreMobileResize:true});

  /* hero H: yellow curtain wipes up off the photo, mark turns once, lines rise */
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.fromTo('.curtain',{yPercent:0},{yPercent:-101,duration:.9,ease:'expo.inOut'},.15)
    .from('.hero__media img',{scale:1.25,duration:1.6,ease:'power2.out'},.15)
    .from('.hero__title .ln > span',{yPercent:110,duration:.8,stagger:.1},.05)
    .from('.hero__eyebrow,.hero__lead,.hero__cta',{y:16,opacity:0,duration:.6,stagger:.08},.3)
    .from('.hero__stamp',{xPercent:100,duration:.6},.85)
    .from('.brand__mark',{rotation:-90,scale:.4,duration:.8,ease:'back.out(1.8)'},.1);

  function build(){
    gsap.to('.hero__media img',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

    var mm=gsap.matchMedia();
    mm.add({desk:'(min-width: 761px)',phone:'(max-width: 760px)'},function(ctx){
      var phone=ctx.conditions.phone;
      gsap.set('.scene__head',{opacity:0,y:30});
      gsap.set(courses,{opacity:0,y:-50});
      gsap.set('.wall .string',{opacity:0});
      gsap.set('.wall .lintel',{opacity:0,y:-60});
      gsap.set('.wall .opening',{opacity:0});
      if(cnt) cnt.textContent='0';
      gsap.set('.wall .plaster',{clipPath:'inset(0 100% 0 0)'});
      gsap.set('.wall .skim',{clipPath:'inset(0 100% 0 0)'});
      var shown={n:0};
      function stageAt(p){var i=p<.12?0:p<.55?1:p<.66?2:p<.83?3:4;stages.forEach(function(li,k){li.classList.toggle('is-on',k===i);li.classList.toggle('is-done',k<i);});}
      var stl=gsap.timeline({scrollTrigger:{trigger:'.scene',start:'top top',end:phone?'+=160%':'+=260%',pin:'.scene__pin',scrub:.6,anticipatePin:1,
        onUpdate:function(s){stageAt(s.progress);}}});
      stl.to('.scene__head',{opacity:1,y:0,duration:.4})
         .to('.wall .string',{opacity:1,duration:.3})
         .fromTo('.wall .string',{attr:{x2:10}},{attr:{x2:630},duration:.5,ease:'none'},'<')
         .to(courses,{opacity:1,y:0,duration:.35,stagger:.22,ease:'power2.out'})
         .to(shown,{n:N,duration:courses.length*.22,ease:'none',onUpdate:function(){if(cnt)cnt.textContent=Math.round(shown.n);}},'<')
         .to('.wall .opening',{opacity:1,duration:.4},'<1.2')
         .to('.wall .lintel',{opacity:1,y:0,duration:.6,ease:'bounce.out'})
         .to('.wall .plaster',{clipPath:'inset(0 14% 0 0)',duration:1.2,ease:'none'})
         .to('.wall .skim',{clipPath:'inset(0 32% 0 0)',duration:1.2,ease:'none'})
         .to({},{duration:.4});
      return function(){gsap.set(courses,{clearProps:'all'});};
    });

    var sl=d.querySelector('.steps__line span');
    if(sl) gsap.to(sl,{scaleX:1,ease:'none',scrollTrigger:{trigger:'.steps__track',start:'top 80%',end:'bottom 55%',scrub:true}});
    ST.refresh();
  }
  (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(build);
  w.addEventListener('load',function(){ST.refresh();});
})();
