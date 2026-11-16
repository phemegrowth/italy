/* CHRI Coperture: header, menu, reveals, form, hero entrance (F, blueprint frame), roof section scene */
(function(){
  'use strict';
  var d=document, w=window, root=d.documentElement;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG=!!(w.gsap&&w.ScrollTrigger);

  /* year */
  d.querySelectorAll('.yr').forEach(function(e){e.textContent=new Date().getFullYear();});

  /* header shrink + phone bar */
  var hdr=d.querySelector('.hdr'), bar=d.querySelector('.bar'), hero=d.querySelector('.hero');
  function onScroll(){
    var y=w.scrollY;
    hdr.classList.toggle('is-small',y>30);
    if(bar&&hero) bar.classList.toggle('is-on',y>hero.offsetHeight*0.6);
  }
  w.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* menu */
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu');
  function setMenu(open){
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    if(open){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('is-open');});}
    else{menu.classList.remove('is-open');setTimeout(function(){if(!menu.classList.contains('is-open'))menu.hidden=true;},460);}
    d.body.classList.toggle('menu-open',open);
  }
  burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true');});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false);});});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&burger.getAttribute('aria-expanded')==='true'){setMenu(false);burger.focus();}});

  /* reveals */
  var rv=[].slice.call(d.querySelectorAll('.rv'));
  if(reduce||!('IntersectionObserver' in w)){rv.forEach(function(e){e.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          var sib=[].slice.call(en.target.parentNode.querySelectorAll(':scope > .rv'));
          var i=Math.max(0,sib.indexOf(en.target));
          en.target.style.transitionDelay=(Math.min(i,6)*80)+'ms';
          en.target.classList.add('in'); io.unobserve(en.target);
        }
      });
    },{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(e){ if(e.getBoundingClientRect().top<w.innerHeight){e.classList.add('in');} else io.observe(e); });
  }

  /* form validation */
  var form=d.querySelector('.form');
  if(form){
    var msgs={name:'Scrivete il vostro nome.',phone:'Serve un numero di telefono.',email:'Controllate l\'indirizzo email.',intervento:'Scegliete il tipo di intervento.',message:'Scrivete due righe sul lavoro.'};
    function check(el){
      var ok=el.checkValidity(); if(el.name==='phone') ok=ok&&/[0-9]{6,}/.test(el.value.replace(/\D/g,''));
      var f=el.closest('.f'); f.classList.toggle('is-bad',!ok); f.querySelector('small').textContent=ok?'':(msgs[el.name]||'Campo obbligatorio.');
      return ok;
    }
    var fields=[].slice.call(form.querySelectorAll('.f input,.f select,.f textarea'));
    fields.forEach(function(el){el.addEventListener('blur',function(){if(el.value)check(el);});el.addEventListener('input',function(){if(el.closest('.f').classList.contains('is-bad'))check(el);});});
    form.addEventListener('submit',function(e){
      var bad=fields.filter(function(el){return !check(el);});
      if(bad.length){e.preventDefault();bad[0].focus();}
    });
  }

  /* roof geometry (also needed without GSAP so the final state is drawn) */
  var A={x:40,y:375}, P={x:400,y:110}, B={x:760,y:375};
  var dx=P.x-A.x, dy=A.y-P.y, len=Math.sqrt(dx*dx+dy*dy);
  var nL={x:-dy/len,y:-dx/len}, nR={x:dy/len,y:-dx/len};
  function off(dd){
    return {a:{x:A.x+nL.x*dd,y:A.y+nL.y*dd}, p:{x:P.x,y:P.y-dd*len/dx}, b:{x:B.x+nR.x*dd,y:B.y+nR.y*dd}};
  }
  function pl(dd){var o=off(dd);return 'M'+o.a.x.toFixed(1)+' '+o.a.y.toFixed(1)+' L'+o.p.x.toFixed(1)+' '+o.p.y.toFixed(1)+' L'+o.b.x.toFixed(1)+' '+o.b.y.toFixed(1);}
  var svg=d.querySelector('.roof');
  if(svg){
    function set(sel,v){var e=svg.querySelector(sel); if(e) e.setAttribute('d',v);}
    set('.beam',pl(0)); set('.board',pl(13.5)); set('.memb',pl(19.5)); set('.insu',pl(31)); set('.batt',pl(43.5)); set('.tile',pl(54.5)); set('.tile2',pl(54.5));
    var t=off(54.5);
    set('.gutter','M'+(t.a.x-14).toFixed(1)+' '+(t.a.y+4).toFixed(1)+' q0 16 14 16 q14 0 14 -16 M'+(t.b.x-14).toFixed(1)+' '+(t.b.y+4).toFixed(1)+' q0 16 14 16 q14 0 14 -16');
    var r=off(64); set('.ridge','M'+(r.p.x-34)+' '+(r.p.y+26).toFixed(1)+' L'+r.p.x+' '+r.p.y.toFixed(1)+' L'+(r.p.x+34)+' '+(r.p.y+26).toFixed(1));
    var lv=off(96); var lvA={x:P.x-150,y:lv.p.y+150*dy/dx}, lvB={x:P.x+150,y:lv.p.y+150*dy/dx};
    set('.life','M'+lvA.x+' '+lvA.y.toFixed(1)+' L'+lv.p.x+' '+lv.p.y.toFixed(1)+' L'+lvB.x+' '+lvB.y.toFixed(1));
    var posts=svg.querySelector('.posts'), ns='http://www.w3.org/2000/svg';
    [[lvA.x,lvA.y],[lv.p.x,lv.p.y],[lvB.x,lvB.y]].forEach(function(q){
      var base=off(62); var by= q[0]<P.x ? base.p.y+(P.x-q[0])*dy/dx : base.p.y+(q[0]-P.x)*dy/dx;
      var rc=d.createElementNS(ns,'rect'); rc.setAttribute('x',q[0]-3); rc.setAttribute('y',q[1]); rc.setAttribute('width',6); rc.setAttribute('height',Math.max(4,by-q[1])); posts.appendChild(rc);
    });
  }

  if(!hasG||reduce) return;
  var gsap=w.gsap, ST=w.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ignoreMobileResize:true});

  /* hero entrance: grid lines, frame draws, photo settles, lines rise. Done by ~1.4 s */
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero__grid line',{scaleX:0,scaleY:0,transformOrigin:'0 0',duration:.9,stagger:.06},0)
    .from('.hero__title .ln > span',{yPercent:108,duration:.8,stagger:.09},.1)
    .from('.hero__eyebrow,.hero__lead,.hero__cta',{y:18,opacity:0,duration:.6,stagger:.08},.35)
    .from('.fr--t,.fr--b',{scaleX:0,duration:.7,ease:'power2.inOut'},.05)
    .from('.fr--l,.fr--r',{scaleY:0,duration:.7,ease:'power2.inOut'},.2)
    .from('.hero__img',{clipPath:'inset(100% 0 0 0)',duration:.9,ease:'power3.inOut'},.25)
    .from('.hero__img img',{scale:1.18,duration:1.6,ease:'power2.out'},.25)
    .from('.hero__cap,.dim',{opacity:0,y:10,duration:.5},.9)
    .from('.brand__roof path',{strokeDasharray:'0 120',duration:.8,stagger:.12},.1);
  gsap.to('.hero__img img',{yPercent:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

  function build(){
    /* roof scene */
    var layers=gsap.utils.toArray('.roof .L'), items=gsap.utils.toArray('.layers li'), cnt=d.querySelector('.sc-n'), segs=[].slice.call(d.querySelectorAll('.scene__bar i'));
    var mm=gsap.matchMedia();
    mm.add({desk:'(min-width: 761px)',phone:'(max-width: 760px)'},function(ctx){
      var phone=ctx.conditions.phone;
      gsap.set(layers,{opacity:0,y:-70});
      gsap.set('.scene__head, .scene__note',{opacity:0,y:30});
      var beam=svg.querySelector('.beam'), bl=beam.getTotalLength();
      gsap.set(beam,{strokeDasharray:bl,strokeDashoffset:bl});
      var stl=gsap.timeline({scrollTrigger:{trigger:'.scene',start:'top top',end:phone?'+=150%':'+=240%',pin:'.scene__pin',scrub:.6,anticipatePin:1,
        onUpdate:function(s){
          var i=Math.min(7,Math.max(0,Math.floor((s.progress-0.08)/0.86*8)));
          items.forEach(function(li,k){li.classList.toggle('is-on',k===i);li.classList.toggle('is-done',k<i);});
          if(cnt) cnt.textContent=('0'+(i+1)).slice(-2);
          segs.forEach(function(sg,k){sg.classList.toggle('on',k<=i);});
        }}});
      stl.to('.scene__head',{opacity:1,y:0,duration:.5})
         .to(layers[0],{opacity:1,y:0,duration:.4},'<')
         .to(beam,{strokeDashoffset:0,duration:.8,ease:'none'},'<');
      for(var k=1;k<layers.length;k++){ stl.to(layers[k],{opacity:1,y:0,duration:.7,ease:'power2.out'}); }
      stl.to('.scene__note',{opacity:1,y:0,duration:.4}).to({},{duration:.4});
      return function(){gsap.set(layers.concat([beam]),{clearProps:'all'});};
    });

    /* place parallax */
    gsap.fromTo('.place__img img',{yPercent:-8},{yPercent:4,ease:'none',scrollTrigger:{trigger:'.place',start:'top bottom',end:'bottom top',scrub:true}});
    /* steps line */
    var sl=d.querySelector('.steps__line span');
    if(sl) gsap.to(sl,{scaleX:1,ease:'none',scrollTrigger:{trigger:'.steps__track',start:'top 80%',end:'bottom 55%',scrub:true}});
    ST.refresh();
  }
  (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(build);
  w.addEventListener('load',function(){ST.refresh();});
})();
