var PAGES={home:{t:'JC Ocampo',s:'Electronics Engineer · Manila, PH'},experience:{t:'Experience',s:'Roles, internships, and work history'},projects:{t:'Projects',s:'IEEE research, robots, and AI apps'},certs:{t:'Certifications',s:'PRC · Cisco · Google Cloud · Huawei'}};
var NAV_URLS={home:'index.html',experience:'experience.html',projects:'projects.html',certs:'certifications.html'};
var isDark=false,curId=window.__navActive||'home';

/* ── Nav physics ── */
var G={iL:0,iLv:0,tL:0,iW:74,iWv:0,tW:74,iTop:5,iH:54,sX:1,sXv:0,hS:1,hSv:0,tHS:1,holding:false,holdStart:0,dragging:false,dragVel:0,lastPx:0,startPx:0,raf:null,baseW:74};
/* ── Mian state ── */
var M={open:false,tapSx:0,tapSy:0};
/* ── Mian indicator physics ── */
var MO={x:0,xV:0,tX:0,y:0,yV:0,tY:0,hS:1,hSv:0,tHS:1,sX:1,sXv:0,holding:false,holdStart:0,dragging:false,lastPx:0,lastPy:0,startPx:0,startPy:0,dragVelX:0,dragVelY:0,angle:0,raf:null};

var SK=0.20,SD=0.67,HK=0.13,HD=0.73;
/* Mian indicator max displacement from center (the "rock" stopping the "balloon") */
var MIAN_MAX_R=16;

/* ── Pill shadow presets ── */
var PSH={
  lRest:'0 0 0 .5px rgba(255,255,255,.8),0 0 0 1px rgba(0,0,0,.06),0 6px 30px rgba(0,0,0,.10),inset 0 1.5px 0 rgba(255,255,255,1),inset 0 -.5px 0 rgba(0,0,0,.04)',
  lUp:'0 0 0 .5px rgba(255,255,255,.9),0 0 0 1px rgba(0,0,0,.05),0 12px 44px rgba(0,0,0,.15),0 0 20px rgba(0,122,255,.12),inset 0 1.5px 0 rgba(255,255,255,1)',
  dRest:'0 0 0 .5px rgba(255,255,255,.14),0 12px 42px rgba(0,0,0,.7),inset 0 1.5px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(0,0,0,.25)',
  dUp:'0 0 0 .5px rgba(255,255,255,.2),0 14px 50px rgba(0,0,0,.85),0 0 24px rgba(0,122,255,.2),inset 0 1.5px 0 rgba(255,255,255,.18)'
};
var MSH={
  lRest:'0 0 0 .5px rgba(255,255,255,.8),0 0 0 1px rgba(0,0,0,.06),0 8px 28px rgba(0,0,0,.09),inset 0 1.5px 0 rgba(255,255,255,1)',
  lUp:'0 0 0 .5px rgba(255,255,255,.9),0 10px 36px rgba(0,0,0,.13),0 0 20px rgba(0,122,255,.14),inset 0 1.5px 0 rgba(255,255,255,1)',
  dRest:'0 0 0 .5px rgba(255,255,255,.14),0 10px 30px rgba(0,0,0,.65),inset 0 1.5px 0 rgba(255,255,255,.14)',
  dUp:'0 0 0 .5px rgba(255,255,255,.2),0 14px 40px rgba(0,0,0,.8),0 0 22px rgba(0,122,255,.28),inset 0 1.5px 0 rgba(255,255,255,.18)'
};

/* ── Clip #wl to current oval bounds every frame ── */
function updateClip(sx,sy){
  var wl=document.getElementById('wl');var pill=document.getElementById('pill');if(!wl||!pill)return;
  var pw=pill.offsetWidth,ph=pill.offsetHeight;
  var cx=G.iL+G.iW/2,cy=G.iTop+G.iH/2;
  var hw=G.iW/2*sx,hh=G.iH/2*sy;
  var cl=Math.max(0,cx-hw),cr=Math.max(0,pw-(cx+hw)),ct=Math.max(0,cy-hh),cb=Math.max(0,ph-(cy+hh));
  wl.style.clipPath='inset('+ct.toFixed(2)+'px '+cr.toFixed(2)+'px '+cb.toFixed(2)+'px '+cl.toFixed(2)+'px round 9999px)';
  wl.style.transform='none';
}

/* ── Nav anim loop — ONLY runs during active drag/hold, not for settle ── */
function animLoop(ts){
  var lf=(G.tL-G.iL)*SK;G.iLv=G.iLv*SD+lf;G.iL+=G.iLv;
  var wf=(G.tW-G.iW)*SK;G.iWv=G.iWv*SD+wf;G.iW+=G.iWv;
  var tSX=G.dragging?1+Math.min(Math.abs(G.dragVel)*0.055,0.55):1;
  var sf=(tSX-G.sX)*0.22;G.sXv=G.sXv*0.66+sf;G.sX+=G.sXv;
  if(G.holding){var el=(ts-G.holdStart)/1000;G.tHS=1+0.45*(1-Math.exp(-el*2.4));}
  var hf=(G.tHS-G.hS)*HK;G.hSv=G.hSv*HD+hf;G.hS+=G.hSv;
  var ind=document.getElementById('ind');
  ind.style.left=G.iL.toFixed(2)+'px';
  ind.style.width=G.iW.toFixed(2)+'px';
  var sx=Math.max(0.5,Math.min(2.0,G.sX*G.hS));
  var sy=Math.max(0.5,Math.min(2.0,G.hS/Math.pow(Math.max(G.sX,0.65),0.5)));
  ind.style.transform=(Math.abs(sx-1)<0.004&&Math.abs(sy-1)<0.004)?'none':'scaleX('+sx.toFixed(3)+') scaleY('+sy.toFixed(3)+')';
  updateClip(sx,sy);
  var stable=Math.abs(G.iLv)<0.04&&Math.abs(G.iWv)<0.04&&Math.abs(G.sXv)<0.002&&Math.abs(G.hSv)<0.002&&!G.dragging&&!G.holding;
  if(!stable)G.raf=requestAnimationFrame(animLoop);
  else{G.raf=null;ind.style.left=G.tL+'px';ind.style.width=G.tW+'px';ind.style.transform='none';updateClip(1,1);}
}

/* ── Mian indicator loop: constrained spring + hold swell + drag stretch ── */
function mindLoop(ts){
  /* DRAG: follow pointer directly with zero lag. RELEASE: bouncy spring back to center. */
  if(MO.dragging){
    MO.x=MO.tX;MO.y=MO.tY;MO.xV=0;MO.yV=0;
  } else {
    var lxf=(MO.tX-MO.x)*SK;MO.xV=MO.xV*SD+lxf;MO.x+=MO.xV;
    var lyf=(MO.tY-MO.y)*SK;MO.yV=MO.yV*SD+lyf;MO.y+=MO.yV;
    /* CLAMP on spring-back only (target is already clamped during drag) */
    var dist=Math.sqrt(MO.x*MO.x+MO.y*MO.y);
    if(dist>MIAN_MAX_R){MO.x=MO.x/dist*MIAN_MAX_R;MO.y=MO.y/dist*MIAN_MAX_R;MO.xV*=0.25;MO.yV*=0.25;}
  }
  /* Hold swell — same parameters as nav oval */
  if(MO.holding){var el=(ts-MO.holdStart)/1000;MO.tHS=1+0.18*(1-Math.exp(-el*2.4));}
  var hf=(MO.tHS-MO.hS)*HK;MO.hSv=MO.hSv*HD+hf;MO.hS+=MO.hSv;
  /* Drag stretch (same formula as nav oval) */
  var vel=Math.sqrt(MO.dragVelX*MO.dragVelX+MO.dragVelY*MO.dragVelY);
  var tSX=MO.dragging?1+Math.min(vel*0.032,0.32):1;
  var sf=(tSX-MO.sX)*0.22;MO.sXv=MO.sXv*0.66+sf;MO.sX+=MO.sXv;
  var mind=document.getElementById('mind');
  var sx=Math.max(0.5,Math.min(2.0,MO.sX*MO.hS));
  var sy=Math.max(0.5,Math.min(2.0,MO.hS/Math.pow(Math.max(MO.sX,0.65),0.5)));
  var ang=MO.angle*(180/Math.PI);
  var tx=MO.x.toFixed(2),ty=MO.y.toFixed(2);
  var noScale=Math.abs(sx-1)<0.004&&Math.abs(sy-1)<0.004;
  var noPos=Math.abs(MO.x)<0.1&&Math.abs(MO.y)<0.1;
  if(noScale&&noPos) mind.style.transform='none';
  else if(noScale) mind.style.transform='translate('+tx+'px,'+ty+'px)';
  else mind.style.transform='translate('+tx+'px,'+ty+'px) rotate('+ang.toFixed(1)+'deg) scaleX('+sx.toFixed(3)+') scaleY('+sy.toFixed(3)+') rotate(-'+ang.toFixed(1)+'deg)';
  var stable=Math.abs(MO.xV)<0.04&&Math.abs(MO.yV)<0.04&&Math.abs(MO.sXv)<0.002&&Math.abs(MO.hSv)<0.002&&!MO.holding;
  if(!stable) MO.raf=requestAnimationFrame(mindLoop);
  else{MO.raf=null;mind.style.transform='none';}
}

function kick(){if(!G.raf)G.raf=requestAnimationFrame(animLoop);}
function kickMO(){if(!MO.raf)MO.raf=requestAnimationFrame(mindLoop);}
function snapTo(id){var b=document.querySelector('[data-nav="'+id+'"]');if(!b)return;G.tL=b.offsetLeft;G.tW=b.offsetWidth;kick();}

/* ── Rest pill: instant position snap (no position CSS transition to avoid mismatch) ── */
function setRpill(id){
  var b=document.querySelector('[data-nav="'+id+'"]');
  var rp=document.getElementById('rpill');
  if(!b||!rp)return;
  rp.style.left=b.offsetLeft+'px';rp.style.top=b.offsetTop+'px';
  rp.style.width=b.offsetWidth+'px';rp.style.height=b.offsetHeight+'px';
}

/* ── Show/hide glass vs gray pill. On hide: also snaps clip to active item instantly. ── */
function setInteracting(on){
  var ind=document.getElementById('ind');
  var rp=document.getElementById('rpill');
  ind.style.opacity=on?'1':'0';
  rp.style.opacity=on?'0':'1';
  if(!on){
    /* Snap clip to active item so blue icon appears correctly over gray pill */
    var b=document.querySelector('[data-nav="'+curId+'"]');
    if(b){G.iL=b.offsetLeft;G.iW=b.offsetWidth;}
    updateClip(1,1);
  }
}

/* ── Pill lift: scales up + glow on press, eases back on release ── */
function setPillLift(on){
  var pill=document.getElementById('pill');
  if(!pill)return;
  pill.style.transition=on?
    'transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s ease,background .45s':
    'transform .38s ease,box-shadow .38s ease,background .45s';
  pill.style.transform=on?'scale(1.032) translateY(-2px)':'none';
  pill.style.boxShadow=on?(isDark?PSH.dUp:PSH.lUp):(isDark?PSH.dRest:PSH.lRest);
}

/* ── Mian lift: same behaviour on Mian circle ── */
function setMianLift(on){
  var mian=document.getElementById('mian');
  mian.style.transition=on?
    'transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s ease,background .45s':
    'transform .38s ease,box-shadow .38s ease,background .45s';
  mian.style.transform=on?'scale(1.07) translateY(-3px)':'none';
  mian.style.boxShadow=on?(isDark?MSH.dUp:MSH.lUp):(isDark?MSH.dRest:MSH.lRest);
}

function getItemAt(rx){var best=null,bd=Infinity;document.querySelectorAll('.nb').forEach(function(b){var c=b.offsetLeft+b.offsetWidth/2,d=Math.abs(rx-c);if(d<bd){bd=d;best=b.dataset.nav;}});return best;}

function setActive(id){
  curId=id;
  if(id==='__none__')return;
  /* Re-enable clip layer if it was hidden (privacy/terms pages) */
  var wl=document.getElementById('wl');
  if(wl&&wl.style.display==='none')wl.style.display='';
  /* Ensure indicator is visible */
  var indEl=document.getElementById('ind');if(indEl)indEl.style.opacity='1';
  /* Hide gray pill INSTANTLY (no fade) as the white glass leaves the origin.
     It will be re-positioned and faded back in once the slide completes. */
  var rpEl=document.getElementById('rpill');
  if(rpEl){
    rpEl.style.transition='none';
    rpEl.style.opacity='0';
  }
  /* Stop physics loop — CSS takes over for the settle glide */
  if(G.raf){cancelAnimationFrame(G.raf);G.raf=null;}
  G.hS=1;G.hSv=0;G.sX=1;G.sXv=0;G.tHS=1;
  var b=document.querySelector('[data-nav="'+id+'"]');
  var ind=document.getElementById('ind');
  if(b){
    var ease='0.187s cubic-bezier(0.65,0,0.35,1)';
    ind.style.transition='left '+ease+',width '+ease+',opacity 0.18s ease';
    if(wl) wl.style.transition='clip-path '+ease;
    G.tL=b.offsetLeft;G.tW=b.offsetWidth;G.iL=b.offsetLeft;G.iW=b.offsetWidth;
    G.iLv=0;G.iWv=0;
    ind.style.left=b.offsetLeft+'px';
    ind.style.width=b.offsetWidth+'px';
    ind.style.transform='none';
    updateClip(1,1);
  }
  /* After glide finishes: move gray pill to target, restore fade, then show it */
  setTimeout(function(){
    setRpill(id);             /* re-position gray pill at the new active button */
    if(rpEl)rpEl.style.transition='';  /* restore default opacity transition */
    setInteracting(false);
    ind.style.transition='opacity 0.18s ease';
    if(wl) wl.style.transition='';
  },210);
  var pg=document.getElementById('pgt'),ps=document.getElementById('pgs');
  if(pg){pg.style.opacity='0';pg.style.transform='translateY(8px)';ps.style.opacity='0';}
  setTimeout(function(){if(pg){pg.textContent=PAGES[id].t;ps.textContent=PAGES[id].s;pg.style.opacity='1';pg.style.transform='translateY(0)';ps.style.opacity='1';}},165);
}

function updateMian(){
  var d=isDark;
  var mind=document.getElementById('mind');var mico=document.getElementById('mico');
  mind.style.opacity=M.open?'1':'0';
  mind.style.pointerEvents=M.open?'auto':'none';
  /* Icon: blue when open, visible gray (matching nav idle) when closed */
  mico.setAttribute('stroke',M.open?(d?'#fff':'#007aff'):(d?'rgba(255,255,255,.65)':'rgba(0,0,0,.38)'));
  if(!M.open){
    MO.x=0;MO.xV=0;MO.tX=0;MO.y=0;MO.yV=0;MO.tY=0;
    MO.hS=1;MO.hSv=0;MO.tHS=1;MO.sX=1;MO.sXv=0;
    MO.holding=false;MO.dragging=false;MO.dragVelX=0;MO.dragVelY=0;
    if(MO.raf){cancelAnimationFrame(MO.raf);MO.raf=null;}
    mind.style.transform='none';
  }
}

/* ── Nav pill events: NO hover follow, only hold+drag ── */
function setupPill(){
  var pill=document.getElementById('pill');
  pill.addEventListener('pointerdown',function(e){
    /* Strip CSS transitions — JS physics runs during drag */
    var ind=document.getElementById('ind');var wl=document.getElementById('wl');
    /* Privacy/terms only: pre-position indicator at pressed button so it appears
       AT the button instead of sliding from the home fallback position. */
    if(curId==='__none__'){
      var pressedBtn=e.target.closest&&e.target.closest('[data-nav]');
      if(pressedBtn){
        if(wl&&wl.style.display==='none')wl.style.display='';
        ind.style.left=pressedBtn.offsetLeft+'px';
        ind.style.width=pressedBtn.offsetWidth+'px';
        G.iL=pressedBtn.offsetLeft;G.iW=pressedBtn.offsetWidth;
        G.tL=G.iL;G.tW=G.iW;G.iLv=0;G.iWv=0;
        updateClip(1,1);
      }
    }
    ind.style.transition='opacity 0.18s ease';wl.style.transition='';
    G.holding=true;G.holdStart=performance.now();G.tHS=1;G.hS=1;G.hSv=0;G.sX=1;G.sXv=0;
    G.lastPx=e.clientX;G.startPx=e.clientX;G.dragVel=0;G.dragging=false;
    /* Glass stays at curId during hold — no spring travel, no overshoot.
       CSS transition in setActive handles the exact slide to target on release. */
    pill.setPointerCapture(e.pointerId);pill.style.cursor='grabbing';
    setInteracting(true);
    setPillLift(true);
    kick();e.preventDefault();
  });
  pill.addEventListener('pointermove',function(e){
    /* Only move oval while holding — no hover follow */
    if(!G.holding)return;
    var dx=e.clientX-G.lastPx;G.dragVel=G.dragVel*0.55+dx*0.45;G.lastPx=e.clientX;
    if(!G.dragging&&Math.abs(e.clientX-G.startPx)>7)G.dragging=true;
    if(G.dragging){
      var pr=pill.getBoundingClientRect(),rx=e.clientX-pr.left,bw=G.baseW;
      G.tL=Math.max(5,Math.min(pr.width-5-bw,rx-bw/2));G.tW=bw;kick();
    }
  });
  pill.addEventListener('pointerup',function(e){
    G.holding=false;G.tHS=1;G.dragging=false;G.dragVel=0;pill.style.cursor='grab';
    var rx=e.clientX-pill.getBoundingClientRect().left;
    var target=getItemAt(rx)||curId;
    setPillLift(false); /* lower pill */
    setActive(target);  /* spring glass to target, then fade to gray pill */
    /* Navigate to the target page — even if it's the active section
       (e.g. clicking Projects while on aguila.html returns to projects.html) */
    if(NAV_URLS[target]){
      var onTargetPage=window.location.pathname.endsWith(NAV_URLS[target])||window.location.pathname.endsWith('/'+NAV_URLS[target]);
      if(!onTargetPage){setTimeout(function(){window.location.href=NAV_URLS[target];},180);}
    }
    kick();
  });
  pill.addEventListener('lostpointercapture',function(){
    if(G.holding){
      G.holding=false;G.tHS=1;G.dragging=false;G.dragVel=0;pill.style.cursor='grab';
      setPillLift(false);setActive(curId);
    }
  });
}

/* ── Mian: glass opens immediately on press. Drag works in same gesture.
   Tap (no drag) on closed Mian → open. Tap on open Mian → close.
   Long-press+drag on closed Mian → opens glass and moves it in one gesture. ── */
function setupMian(){
  var mian=document.getElementById('mian');
  /* wasOpen: track state at press time to decide open/close on release */
  var wasOpen=false;

  mian.addEventListener('pointerdown',function(e){
    if(e.target===document.getElementById('mind'))return;
    wasOpen=M.open;
    M.tapSx=e.clientX;M.tapSy=e.clientY;
    /* Open glass IMMEDIATELY — even if closed — so long-press+drag works */
    if(!M.open){M.open=true;updateMian();}
    /* Start indicator physics so drag works in this same gesture */
    MO.holding=true;MO.holdStart=performance.now();MO.tHS=1;MO.hS=1;MO.hSv=0;
    MO.tX=MO.x;MO.tY=MO.y;MO.sX=1;MO.sXv=0;
    MO.dragging=false;MO.dragVelX=0;MO.dragVelY=0;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;MO.startPx=e.clientX;MO.startPy=e.clientY;
    mian.setPointerCapture(e.pointerId);setMianLift(true);kickMO();e.preventDefault();
  });
  mian.addEventListener('pointermove',function(e){
    if(!MO.holding)return;
    var dx=e.clientX-MO.lastPx,dy=e.clientY-MO.lastPy;
    MO.dragVelX=MO.dragVelX*0.55+dx*0.45;MO.dragVelY=MO.dragVelY*0.55+dy*0.45;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;
    var totalX=e.clientX-MO.startPx,totalY=e.clientY-MO.startPy;
    if(!MO.dragging&&(Math.abs(totalX)>5||Math.abs(totalY)>5))MO.dragging=true;
    if(MO.dragging){
      var tdist=Math.sqrt(totalX*totalX+totalY*totalY);
      if(tdist>MIAN_MAX_R){totalX=totalX/tdist*MIAN_MAX_R;totalY=totalY/tdist*MIAN_MAX_R;}
      MO.tX=totalX;MO.tY=totalY;MO.angle=Math.atan2(MO.dragVelY,MO.dragVelX);kickMO();
    }
  });
  mian.addEventListener('pointerup',function(e){
    if(e.target===document.getElementById('mind'))return;
    var wasDrag=MO.dragging;
    MO.holding=false;MO.tHS=1;MO.dragging=false;MO.tX=0;MO.tY=0;MO.dragVelX=0;MO.dragVelY=0;
    kickMO();setMianLift(false);
    if(!wasDrag){
      /* Tap: if was already open → close; if was closed → keep open (we opened it on press) */
      if(wasOpen){M.open=false;updateMian();}
    }
    /* Dragged: glass springs back to center, Mian stays open */
  });
  mian.addEventListener('lostpointercapture',function(){
    MO.holding=false;MO.tHS=1;MO.dragging=false;MO.tX=0;MO.tY=0;kickMO();setMianLift(false);
  });
}

/* ── Mian indicator events: hold + constrained drag + tap to close ── */
function setupMind(){
  var mind=document.getElementById('mind');
  mind.addEventListener('pointerdown',function(e){
    MO.holding=true;MO.holdStart=performance.now();MO.tHS=1;MO.hS=1;MO.hSv=0;
    MO.tX=MO.x;MO.tY=MO.y;MO.sX=1;MO.sXv=0;
    MO.dragging=false;MO.dragVelX=0;MO.dragVelY=0;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;MO.startPx=e.clientX;MO.startPy=e.clientY;
    mind.setPointerCapture(e.pointerId);setMianLift(true);kickMO();e.preventDefault();
  });
  mind.addEventListener('pointermove',function(e){
    if(!MO.holding)return;
    var dx=e.clientX-MO.lastPx,dy=e.clientY-MO.lastPy;
    MO.dragVelX=MO.dragVelX*0.55+dx*0.45;MO.dragVelY=MO.dragVelY*0.55+dy*0.45;
    MO.lastPx=e.clientX;MO.lastPy=e.clientY;
    var totalX=e.clientX-MO.startPx,totalY=e.clientY-MO.startPy;
    if(!MO.dragging&&(Math.abs(totalX)>5||Math.abs(totalY)>5))MO.dragging=true;
    if(MO.dragging){
      /* Clamp drag target to MIAN_MAX_R — the rock stops the balloon */
      var tdist=Math.sqrt(totalX*totalX+totalY*totalY);
      if(tdist>MIAN_MAX_R){totalX=totalX/tdist*MIAN_MAX_R;totalY=totalY/tdist*MIAN_MAX_R;}
      MO.tX=totalX;MO.tY=totalY;
      MO.angle=Math.atan2(MO.dragVelY,MO.dragVelX);
      kickMO();
    }
  });
  mind.addEventListener('pointerup',function(e){
    var wasDrag=MO.dragging;
    MO.holding=false;MO.tHS=1;MO.dragging=false;MO.tX=0;MO.tY=0;MO.dragVelX=0;MO.dragVelY=0;
    kickMO();setMianLift(false);
    if(!wasDrag){M.open=false;updateMian();}
  });
  mind.addEventListener('lostpointercapture',function(){
    MO.holding=false;MO.tHS=1;MO.dragging=false;MO.tX=0;MO.tY=0;kickMO();setMianLift(false);
  });
}

/* ── Dark mode ── */
var ui={dark:function(){
  isDark=!isDark;var d=isDark;
  /* ── Only update elements that actually exist (portfolio has no demo root/blobs) ── */
  var _el=function(id){return document.getElementById(id);};
  var _set=function(id,prop,val){var e=_el(id);if(e)e.style[prop]=val;};
  var _set2=function(id,prop,val,prop2,val2){var e=_el(id);if(e){e.style[prop]=val;e.style[prop2]=val2;}};
  _set('pgt','color',d?'rgba(255,255,255,.82)':'#1c1c1e');
  _set('pgs','color',d?'rgba(255,255,255,.35)':'rgba(0,0,0,.32)');
  document.querySelectorAll('.fc').forEach(function(c){c.style.background=d?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)';});
  _set2('bdg','background',d?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)','color',d?'rgba(255,255,255,.5)':'rgba(0,0,0,.42)');
  _set2('tog','background',d?'rgba(255,255,255,.12)':'rgba(0,0,0,.08)','color',d?'rgba(255,255,255,.82)':'rgba(0,0,0,.68)');
  var togi=_el('togi'),togt=_el('togt');
  if(togi)togi.textContent=d?'☀':'🌙';
  if(togt)togt.textContent=d?'Light':'Dark';
  var pBg=d?'linear-gradient(180deg,rgba(20,20,30,.28) 0%,rgba(10,10,18,.34) 100%)':'linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(245,245,255,.12) 100%)';
  _set('pill','background',pBg);
  _set('mian','background',d?'linear-gradient(180deg,rgba(20,20,30,.28) 0%,rgba(10,10,18,.34) 100%)':'linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(245,245,255,.12) 100%)');
  /* Update rest pill color */
  _set('rpill','background',d?'rgba(255,255,255,.16)':'rgba(0,0,0,.10)');
  /* Update glass oval + mian indicator shadows */
  var iBg=d?'rgba(0,122,255,.22)':'rgba(0,122,255,.13)';
  var iSh=d?'inset 0 0 0 1px rgba(255,255,255,.6),inset 0 1.5px 0 rgba(255,255,255,.88),0 0 24px rgba(30,140,255,.5),0 4px 14px rgba(0,100,255,.38)':'inset 0 0 0 1px rgba(255,255,255,.68),inset 0 1.5px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(0,0,0,.07),0 0 18px rgba(0,122,255,.18),0 3px 12px rgba(0,122,255,.13)';
  _set2('ind','background',iBg,'boxShadow',iSh);
  _set2('mind','background',iBg,'boxShadow',iSh);
  /* Dark mode: nav idle icons more visible (light gray) */
  var idle=d?'rgba(255,255,255,.65)':'rgba(0,0,0,.36)';
  document.querySelectorAll('.nb').forEach(function(b){b.style.color=idle;});
  /* Blue clip layer: white in dark, blue in light */
  var cc=d?'#fff':'#007aff';
  document.querySelectorAll('.bw').forEach(function(b){b.style.color=cc;});
  /* Re-apply rest shadows at correct dark/light values */
  setPillLift(false);setMianLift(false);
  updateMian();
}};

/* ── Mobile alignment: keep [pill + gap + Mian] as one centred group ──
   On most phones the pill (4 buttons) + gap + Mian fits comfortably.
   On narrow phones (iPhone SE, iPhone 12/13 mini/Pro @375-390px) the
   group is wider than the viewport, so left-clamping alone pushes
   Mian's right edge off-screen. We detect that case and compact the
   pill's own buttons + gaps just enough to fit — wider phones never
   hit this branch, so their layout is byte-for-byte unchanged. */
function setNbCompact(on){
  document.querySelectorAll('.nb,.bw').forEach(function(b){
    b.style.minWidth = on ? '54px' : '';
    b.style.padding  = on ? '8px 8px' : '';
  });
}

function layoutMobileNav(){
  var navc=document.getElementById('navc');
  var pill=document.getElementById('pill');
  var mian=document.getElementById('mian');
  if(!navc||!pill||!mian)return;
  var isMobile=window.matchMedia('(max-width: 767px)').matches;
  if(!isMobile){
    navc.style.left='';navc.style.right='';navc.style.transform='';navc.style.bottom='';
    mian.style.left='';mian.style.right='';mian.style.bottom='';
    setNbCompact(false);
    return;
  }
  var vw=window.innerWidth,BOTTOM=24;

  /* Try the normal, spacious sizing first (unchanged behaviour). */
  setNbCompact(false);
  var GAP=14,SIDE=12;
  var pw=pill.offsetWidth,mw=mian.offsetWidth||60;
  var fits=(pw+GAP+mw+SIDE*2)<=vw;

  if(!fits){
    /* Doesn't fit at normal size — compact the pill buttons + tighten
       gaps just enough to bring Mian fully back on-screen. */
    setNbCompact(true);
    GAP=6;SIDE=6;
    pw=pill.offsetWidth;mw=mian.offsetWidth||60;
  }

  var ph=pill.offsetHeight,mh=mian.offsetHeight||60;
  var groupW=pw+GAP+mw;
  var groupLeft=(vw-groupW)/2;
  if(groupLeft<SIDE)groupLeft=SIDE;
  if(groupLeft+groupW>vw-SIDE)groupLeft=Math.max(SIDE,vw-SIDE-groupW);
  navc.style.left=groupLeft+'px';
  navc.style.right='auto';
  navc.style.transform='none';
  navc.style.bottom=BOTTOM+'px';
  var mianBottom=BOTTOM+((ph-mh)/2);
  mian.style.left=(groupLeft+pw+GAP)+'px';
  mian.style.right='auto';
  mian.style.bottom=mianBottom+'px';
}

function init(){
  var pill=document.getElementById('pill');
  if(pill){
    /* ── Nav pill exists: full pill init ── */
    var startId=window.__navActive||'home';
    var btn=null;
    if(startId&&startId!=='none'){
      btn=pill.querySelector('[data-nav="'+startId+'"]');
    }
    if(!btn){
      /* No active item — just position the indicator off-screen */
      btn=pill.querySelector('[data-nav="home"]');
      startId='__none__';
    }
    /* Hide nav on mobile until layoutMobileNav positions it (prevents jitter).
       Run layoutMobileNav() FIRST — it may compact the pill's own buttons
       on narrow phones, and everything below reads button geometry, so
       that geometry must already be final before we measure it. */
    var isMob=window.matchMedia('(max-width:767px)').matches;
    if(isMob){document.getElementById('mian').style.opacity='0';}
    try{layoutMobileNav();}catch(e){console.warn('layoutMobileNav:',e);}
    if(btn){
      G.baseW=btn.offsetWidth;G.iL=btn.offsetLeft;G.tL=G.iL;
      G.iW=btn.offsetWidth;G.tW=G.iW;G.iTop=btn.offsetTop;G.iH=btn.offsetHeight;
      var ind=document.getElementById('ind');
      ind.style.left=G.iL+'px';ind.style.top=G.iTop+'px';ind.style.width=G.iW+'px';ind.style.height=G.iH+'px';
      setRpill(startId);
      /* If no nav item should be active (privacy/terms), hide everything */
      if(startId==='__none__'){
        var indEl=document.getElementById('ind');if(indEl)indEl.style.opacity='0';
        var wlEl=document.getElementById('wl');if(wlEl){wlEl.style.clipPath='inset(0 100% 0 0)';wlEl.style.display='none';}
        var rpEl=document.getElementById('rpill');if(rpEl)rpEl.style.opacity='0';
        /* Set all buttons to idle color explicitly */
        document.querySelectorAll('.nb').forEach(function(b){b.classList.remove('active');});
      } else {
        updateClip(1,1);
      }
    }
    try{setupPill();}catch(e){console.warn('setupPill:',e);}
    /* Show the settled gray-pill state immediately (not the white glass indicator) */
    if(startId!=='__none__'){setInteracting(false);}
    window.addEventListener('resize',function(){try{layoutMobileNav();}catch(e){}setRpill(curId);if(!G.dragging)snapTo(curId);});
    window.addEventListener('orientationchange',function(){try{layoutMobileNav();}catch(e){}});
    window.addEventListener('load',function(){try{layoutMobileNav();}catch(e){}});
    try{window.matchMedia('(max-width: 767px)').addEventListener('change',function(){try{layoutMobileNav();}catch(e){}});}catch(e){}
  }
  /* ── Always set up Mian — works with or without nav pill ── */
  try{setupMian();}catch(e){console.warn('setupMian:',e);}
  try{setupMind();}catch(e){console.warn('setupMind:',e);}
  try{updateMian();}catch(e){console.warn('updateMian:',e);}
  /* Reveal Mian (and nav pill if present) after positioning — smooth fade-in */
  requestAnimationFrame(function(){
    var navc=document.getElementById('navc');
    var mianEl=document.getElementById('mian');
    if(navc){navc.style.transition='opacity .2s ease';navc.style.opacity='1';}
    if(mianEl){mianEl.style.transition='opacity .2s ease';mianEl.style.opacity='1';}
  });
  /* Apply correct theme colors to nav elements */
  try{
    var wantsDark=document.documentElement.getAttribute('data-theme')==='dark';
    isDark=!wantsDark; /* set opposite so ui.dark() toggle produces the wanted state */
    ui.dark();
  }catch(e){}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else setTimeout(init,0);

/* ── Sync nav dark mode with portfolio [data-theme] ── */
function syncNavDark() {
  var wantsDark = document.documentElement.getAttribute('data-theme') === 'dark';
  /* Force isDark to opposite of wantsDark so ui.dark() toggles to correct state */
  if (wantsDark !== isDark) { isDark = !wantsDark; ui.dark(); }
}

/* Apply on load */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncNavDark);
} else {
  setTimeout(syncNavDark, 0);
}

/* Watch for theme changes (portfolio toggle button sets data-theme on <html>) */
var _themeObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    if (m.attributeName === 'data-theme') syncNavDark();
  });
});
_themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ============================================================
   Mian chatbot — merged into nav.js
   ============================================================ */
(function () {
  'use strict';
/* ============================================================
   Mian — JC's Personal AI Assistant (drop-in widget)
   ------------------------------------------------------------
   Usage: add this single line before </body> on any page:
     <script src="chatbot.js" defer></script>

   To swap backends later, only edit the CONFIG block and the
   sendToAI() function at the bottom of this file.
   ============================================================ */
(function () {
  'use strict';

  // -------------------- CONFIG --------------------
  const CONFIG = {
    apiEndpoint: 'https://mian-chatbot.jc-ocampo0907.workers.dev',

    botName: 'Mian',
    botSubtitle: "JC's AI Assistant",
    welcomeMessage: "Hi! I'm Mian, JC's personal AI assistant. Ask me anything about his background, projects, certifications, or experience!",

    // Profile picture. Recommended size: 512x512 PNG so it stays crisp
    // at every place we render it (28px small avatar, 48px header,
    // 140px ID-card portrait), including 2x/3x retina displays.
    avatarUrl: 'assets/mian.png',

    // ID-card popup text
    cardDedication: 'Created on April 2026. Dedicated to the love of my life.',

    maxChars: 500,
    maxHistory: 10,
  };

  // -------------------- CACHED QUICK-CHIP REPLIES --------------------
  // These three starter questions are answered instantly from a local
  // cache instead of hitting the LLM — no network round trip, no wait.
  // Each has 3 pre-written variants so repeat visits don't feel canned;
  // one is picked at random on each click. Keep facts in sync with the
  // SYSTEM_PROMPT in worker.js if JC's info ever changes.
  const CACHED_REPLIES = {
    'Tell me about JC': [
      "JC (Engr. Jose Carlo David Ocampo) is a licensed Electronics Engineer from the Philippines. He graduated from Mapua University in 2025 and passed his PRC board exams in March 2026. He now works as an Application & Cloud Support Engineer at Accenture Philippines, with earlier experience interning at Converge ICT Solutions and serving as Electronics Engineer for Mapua's Cardinal One team. Ask me for more on his certifications, projects, or experience anytime.",
      "JC is a licensed Electronics Engineer based in Metro Manila. He earned his degree from Mapua University in 2025 and passed his board exams in March 2026. He's currently an Application & Cloud Support Engineer at Accenture Philippines, having previously interned at Converge ICT Solutions and worked as Electronics Engineer for Mapua's Cardinal One team. Happy to go deeper on any part of his background.",
      "JC is a licensed Electronics Engineer from the Philippines who graduated from Mapua University in 2025 and passed his board exams in March 2026. He's currently at Accenture Philippines as an Application & Cloud Support Engineer, with earlier stops at Converge ICT Solutions and Mapua's Cardinal One team. Just ask if you want the details on any of that."
    ],
    'Is he open to work?': [
      "JC is currently employed as an Application & Cloud Support Engineer at Accenture Philippines, so he's not actively looking for other opportunities right now.",
      "Right now, JC is full-time at Accenture Philippines as an Application & Cloud Support Engineer, so he isn't actively job hunting at the moment.",
      "He's currently employed at Accenture Philippines and isn't actively seeking new roles at this time. If you'd still like to connect, he's reachable at jcdcocampo@gmail.com."
    ],
    "What's his experience?": [
      "JC is currently an Application & Cloud Support Engineer at Accenture Philippines, a role he started in August 2026. Before that, he interned on the IT Helpdesk at Converge ICT Solutions for three months in 2025, and earlier still, he was the Electronics Engineer for Mapua University's Cardinal One team from 2023 to 2025.",
      "He's currently at Accenture Philippines as an Application & Cloud Support Engineer, starting August 2026. Prior to that, he did a three month IT Helpdesk internship at Converge ICT Solutions in 2025, and before that, he was Electronics Engineer for Mapua's Cardinal One team from 2023 to 2025.",
      "JC's work history: Application & Cloud Support Engineer at Accenture Philippines since August 2026, an IT Helpdesk internship at Converge ICT Solutions in 2025, and Electronics Engineer for Mapua University's Cardinal One team from 2023 to 2025."
    ]
  };

  if (window.__mianChatbotLoaded) return;
  window.__mianChatbotLoaded = true;

  // -------------------- STYLES --------------------
  const css = `
    /* ── Siri-style outer border glow ────────────────────────────
       Sibling div behind the panel (z-index 9998, panel is 9999).
       Colors match the full Siri logo palette:
         top-left     → orange / warm yellow
         left edge    → orange fading to yellow-white
         bottom-left  → cyan / sky blue
         top-right    → hot pink / red-pink
         right edge   → magenta / pink
         bottom-right → violet / lavender                        */

    @property --cb-angle {
      syntax: "<angle>";
      initial-value: -45deg;
      inherits: false;
    }
    /* Slow colour rotation */
    @keyframes cbGlowRotate {
      from { --cb-angle: -45deg; }
      to   { --cb-angle: 315deg; }
    }
    /* Breathing pulse — filter only, no opacity */
    @keyframes cbGlowPulse {
      0%   { filter: blur(18px) brightness(1);    }
      30%  { filter: blur(18px) brightness(1.18); }
      60%  { filter: blur(18px) brightness(0.84); }
      100% { filter: blur(18px) brightness(1);    }
    }
    /* Fade in — opacity only */
    @keyframes cbGlowFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    /* Fade out — opacity only, leaves filter/rotation untouched */
    @keyframes cbGlowFadeOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }

    .cb-siri-ring {
      position: fixed;
      bottom: calc(32px + 60px + 16px);
      right: 32px;
      left: auto;
      transform: none;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 140px);
      border-radius: 18px;
      z-index: 9998;
      pointer-events: none;
      background: conic-gradient(
        from var(--cb-angle, -45deg) at 50% 50%,
        #ff8c00  0%,
        #ff3c50  12.5%,
        #ff2d55  25%,
        #e8187a  37.5%,
        #9b59f5  50%,
        #4060ff  62.5%,
        #00c2e0  75%,
        #ffb700  87.5%,
        #ff8c00  100%
      );
      filter: blur(18px);
      opacity: 0;
    }
    /* Open: fade in over 1.5s, rotate + pulse forever.
       opacity:1 on the class so forwards-fill is not needed
       and the fade-out transition can still override it.    */
    .cb-siri-ring.cb-glow-open {
      opacity: 1;
      animation:
        cbGlowFadeIn   1.5s ease        0s 1 normal none,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }
    /* Idle fade-out: only animates opacity, rotation keeps running via cb-glow-open */
    .cb-siri-ring.cb-glow-fading {
      animation:
        cbGlowFadeOut  2.5s ease        forwards,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }
    /* Wake: fade back in, rotation was never stopped */
    .cb-siri-ring.cb-glow-returning {
      animation:
        cbGlowFadeIn   1.5s ease        forwards,
        cbGlowRotate   20s  linear      0s infinite,
        cbGlowPulse    3.5s ease-in-out 0s infinite;
    }

    @media (max-width: 480px) {
      .cb-siri-ring {
        bottom: calc(32px + 60px + 16px);
        left: 8px;
        right: 8px;
        width: auto;
        max-width: none;
        height: calc(100dvh - 140px);
        max-height: none;
        transform: translateX(0);
        border-radius: 16px;
      }
    }

    /* Floating action button */
    .cb-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      /* iOS26 spring open: expands from bottom with subtle overshoot */
      transition:
        transform 0.52s cubic-bezier(0.34, 1.4, 0.64, 1),
        opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        box-shadow 0.3s ease;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      padding: 0;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
    }
    .cb-fab:hover  { transform: scale(1.06); box-shadow: 0 6px 22px rgba(0,0,0,0.28); }
    .cb-fab:active { transform: scale(0.94); }
    .cb-fab *      { pointer-events: none; }
    .cb-fab svg    { width: 32px; height: 32px; display: block; }
    .cb-fab.cb-hidden { opacity: 0; transform: scale(0.6); pointer-events: none; }

    /* Panel */
    .cb-panel {
      position: fixed;
      bottom: calc(32px + 60px + 16px);
      right: 32px;
      left: auto;
      transform-origin: bottom right;
      /* Closed: squished at bottom-right corner */
      transform: translateY(24px) scaleY(0.08) scaleX(0.88);
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 140px);
      background: var(--card, #ffffff);
      border-radius: 18px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
      color: var(--text-primary, #1c1c1e);
      transform-origin: bottom right;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .cb-panel.cb-open {
      opacity: 1;
      transform: translateY(0) scaleY(1) scaleX(1);
      pointer-events: auto;
    }
    /* Closing: override transition with faster collapse */
    .cb-panel.cb-closing {
      transform: translateY(20px) scaleY(0.06) scaleX(0.9) !important;
      opacity: 0 !important;
      transition:
        transform 0.32s cubic-bezier(0.55, 0, 0.45, 1),
        opacity 0.22s ease !important;
      pointer-events: none !important;
    }

    /* Desktop/tablet: panel above Mian (bottom-right) */
    @media (min-width: 768px) {
      .cb-panel {
        left: auto;
        right: 32px;
        bottom: calc(32px + 60px + 16px);
        transform: translateY(24px) scaleY(0.08) scaleX(0.88);
        transform-origin: bottom right;
      }
      .cb-panel.cb-open {
        transform: translateY(0) scaleY(1) scaleX(1);
      }
      .cb-panel.cb-closing {
        transform: translateY(20px) scaleY(0.06) scaleX(0.9) !important;
      }
      .cb-siri-ring {
        left: auto;
        right: 32px;
        bottom: calc(32px + 60px + 16px);
        transform: none;
      }
    }

    /* Header */
    .cb-close svg { display: none; }
    .cb-close::after {
      content: '×';
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
      pointer-events: none;
    }
    [data-theme="dark"] .cb-close::after {
      color: #1c1c1e;
    }
    .cb-header {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--separator, #e5e5ea);
      flex-shrink: 0;
    }
    .cb-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      border: none;
      transition: background 0.4s ease, transform 0.18s ease, box-shadow 0.18s ease;
    }
    .cb-avatar:hover  { transform: scale(1.05); box-shadow: 0 2px 10px rgba(0,0,0,0.18); }
    .cb-avatar:active { transform: scale(0.96); }
    .cb-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .cb-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .cb-header-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .cb-header-subtitle {
      font-size: 12px;
      color: var(--text-secondary, #636366);
      line-height: 1.2;
    }
    .cb-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c759;
      display: inline-block;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.18);
    }
    .cb-close {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ff5f57;
      color: #fff;
      flex-shrink: 0;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      transition: background 0.15s ease, transform 0.15s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-close:hover  { background: #ff3b30 !important; }
    .cb-close:active { transform: scale(0.88); }
    .cb-close svg { width: 16px; height: 16px; }

    /* Messages */
    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    .cb-messages::-webkit-scrollbar { width: 6px; }
    .cb-messages::-webkit-scrollbar-thumb {
      background: var(--text-tertiary, #aeaeb2);
      border-radius: 3px;
    }

    .cb-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.45;
      word-wrap: break-word;
      animation: cbFadeIn 0.25s ease;
    }
    @keyframes cbFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Bot row: small avatar + bubble */
    .cb-bot-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      align-self: flex-start;
      max-width: 90%;
      animation: cbFadeIn 0.25s ease;
    }
    .cb-bot-row .cb-msg { animation: none; max-width: 100%; }
    .cb-msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      overflow: hidden;
      transition: opacity 0.18s ease, background 0.4s ease;
    }
    .cb-msg-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cb-msg-avatar.cb-avatar-hidden { visibility: hidden; }

    .cb-msg-bot {
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .cb-msg-user {
      background: var(--accent, #007aff);
      color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .cb-msg-error {
      background: #ffefef;
      color: #c0392b;
      border: 1px solid #f5c6c6;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    [data-theme="dark"] .cb-msg-error {
      background: #3a1f1f;
      color: #ff7b72;
      border-color: #5a2a2a;
    }

    .cb-retry-row {
      display: flex;
      align-self: flex-start;
      margin-left: 36px; /* aligns under the bot bubble, past the avatar */
      animation: cbFadeIn 0.25s ease;
    }
    .cb-retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid var(--separator, #e5e5ea);
      background: var(--sub-card, #f9f9fb);
      color: var(--text-secondary, #636366);
      font-size: 12.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .cb-retry-btn:hover {
      background: var(--sub-hover, #ececf2);
      color: var(--text-primary, #1c1c1e);
      border-color: var(--text-tertiary, #aeaeb2);
    }
    .cb-retry-btn:active { transform: scale(0.97); }
    .cb-retry-btn svg { flex-shrink: 0; }
    .cb-retry-btn:disabled { opacity: 0.5; cursor: default; }

    .cb-typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 0; }
    .cb-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-tertiary, #aeaeb2);
      animation: cbBounce 1.2s infinite ease-in-out;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.30s; }
    @keyframes cbBounce {
      0%, 60%, 100% { transform: translateY(0);    opacity: 0.5; }
      30%           { transform: translateY(-5px); opacity: 1;   }
    }

    /* Anticipation text under typing bubble */
    .cb-anticipation {
      font-size: 11px;
      color: var(--text-tertiary, #aeaeb2);
      margin-top: 4px;
      font-style: italic;
      min-height: 16px;
      transition: opacity 0.4s ease;
    }

    /* Quick-start chips */
    .cb-chips {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
      padding: 4px 16px 8px;
    }
    .cb-chip {
      display: inline-flex;
      align-items: center;
      background: var(--sub-card, #f0f0f5);
      color: var(--accent, #007aff);
      border: 1.5px solid var(--accent, #007aff);
      border-radius: 980px;
      padding: 5px 13px;
      font-size: 12.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      opacity: 0;
      transform: translateX(20px);
      transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-chip.cb-chip-in {
      animation: cbChipSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .cb-chip:hover  { background: var(--accent, #007aff); color: #fff; box-shadow: 0 2px 8px rgba(0,122,255,0.22); }
    .cb-chip:active { transform: scale(0.95); }
    .cb-chip.cb-chip-gone { display: none; }
    @keyframes cbChipSlideIn {
      to { opacity: 1; transform: translateX(0); }
    }

    /* Input */
    .cb-input-area {
      border-top: 1px solid var(--separator, #e5e5ea);
      padding: 10px 12px 8px;
      flex-shrink: 0;
      background: var(--card, #ffffff);
    }
    .cb-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: var(--sub-card, #f0f0f5);
      border-radius: 20px;
      padding: 6px 6px 6px 14px;
    }
    .cb-textarea {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-primary, #1c1c1e);
      max-height: 100px;
      min-height: 22px;
      padding: 4px 0;
    }
    .cb-textarea::placeholder { color: var(--text-tertiary, #aeaeb2); }
    .cb-send {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent, #007aff);
      color: #fff;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .cb-send:hover:not(:disabled)  { transform: scale(1.05); }
    .cb-send:active:not(:disabled) { transform: scale(0.92); }
    .cb-send:disabled { opacity: 0.4; cursor: not-allowed; }
    .cb-send svg { width: 16px; height: 16px; }

    .cb-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 4px 0;
      font-size: 11px;
      color: var(--text-tertiary, #aeaeb2);
      gap: 12px;
    }
    .cb-disclaimer-inline { flex: 1; min-width: 0; }
    .cb-counter.cb-near-limit { color: #ff9500; }
    .cb-counter.cb-at-limit   { color: var(--red, #ff3b30); }

    /* ----- ID Card popup (shown when header avatar is clicked) ----- */
    .cb-card-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .cb-card-overlay.cb-open {
      opacity: 1;
      pointer-events: auto;
    }
    .cb-card {
      background: var(--card, #ffffff);
      color: var(--text-primary, #1c1c1e);
      border-radius: 22px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      padding: 36px 28px 28px;
      width: 100%;
      max-width: 320px;
      text-align: center;
      position: relative;
      transform: scale(0.92);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: var(--sf, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
    }
    .cb-card-overlay.cb-open .cb-card { transform: scale(1); }

    .cb-card-close {
      background: #ff3b30 !important; color: #fff !important;
      position: absolute;
      top: 12px;
      right: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, transform 0.18s ease;
    }
    .cb-card-close:hover  { background: #e6342b !important; }
    [data-theme="dark"] .cb-card-close { color: #000 !important; }
    .cb-card-close:active { transform: scale(0.92); }
    .cb-card-close svg { width: 11px; height: 11px; }

    .cb-card-avatar {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      margin: 0 auto 18px;
      overflow: hidden;
      background: var(--sub-card, #f0f0f5);
      color: var(--text-primary, #1c1c1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 72px;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    }
    .cb-card-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cb-card-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-bottom: 4px;
    }
    .cb-card-role {
      font-size: 15px;
      color: var(--text-secondary, #636366);
    }
    .cb-card-dedication {
      font-size: 12px;
      color: var(--text-tertiary, #aeaeb2);
      line-height: 1.5;
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid var(--separator, #e5e5ea);
      font-style: italic;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .cb-panel {
        width: calc(100vw - 16px);
        height: calc(100dvh - 140px);
        bottom: calc(24px + 60px + 16px);
        left: 8px;
        right: 8px;
        max-width: none;
        transform-origin: bottom right;
        transform: translateY(24px) scaleY(0.08) scaleX(0.88);
        border-radius: 16px;
      }
      .cb-panel.cb-open {
        transform: translateY(0) scaleY(1) scaleX(1);
      }
      .cb-panel.cb-closing {
        transform: translateY(20px) scaleY(0.06) scaleX(0.9) !important;
      }
      .cb-fab { bottom: 16px; right: 16px; width: 56px; height: 56px; }
      .cb-fab svg { width: 30px; height: 30px; }

      .cb-avatar { width: 44px; height: 44px; font-size: 16px; }

      .cb-card { max-width: 280px; padding: 32px 22px 24px; }
      .cb-card-avatar { width: 120px; height: 120px; font-size: 44px; margin-bottom: 16px; }
      .cb-card-name { font-size: 22px; }
      .cb-card-role { font-size: 14px; }
      .cb-card-dedication { font-size: 11.5px; }
    }
  `;

  // -------------------- HELPERS --------------------
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Strip basic markdown that some models leak into responses.
  function stripMarkdown(s) {
    if (!s) return s;
    return String(s)
      .replace(/\*{3}([^*]+?)\*{3}/g, '$1')
      .replace(/_{3}([^_]+?)_{3}/g, '$1')
      .replace(/\*{2}([^*]+?)\*{2}/g, '$1')
      .replace(/_{2}([^_]+?)_{2}/g, '$1')
      .replace(/(^|[\s(])\*([^\s*][^*]*?[^\s*]|\S)\*(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/(^|[\s(])_([^\s_][^_]*?[^\s_]|\S)_(?=[\s).,!?;:]|$)/g, '$1$2')
      .replace(/`([^`]+?)`/g, '$1')
      .replace(/~~([^~]+?)~~/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/  +/g, ' ');
  }

  // -------------------- SIRI GLOW MANAGER --------------------
  const IDLE_MS = 10000;

  const glowManager = (function () {
    let ring = null;
    let idleTimer = null;
    let paused = false;
    let idleStarted = false;

    // Called once after createUI — hands the pre-mounted ring element over
    function init(ringEl) {
      ring = ringEl;
    }

    // Called on panel open — keyframe always starts at opacity:0, no flicker possible
    function show() {
      if (!ring) return;
      // Strip all state classes and force animation reset
      ring.classList.remove('cb-glow-open', 'cb-glow-fading', 'cb-glow-returning');
      void ring.offsetWidth; // reflow to reset animation
      ring.classList.add('cb-glow-open');
    }

    // Called on panel close — revert to hidden, reset all state
    function hide() {
      if (!ring) return;
      clearTimeout(idleTimer);
      idleStarted = false;
      paused = false;
      ring.classList.remove('cb-glow-open', 'cb-glow-returning', 'cb-glow-fading');
    }

    // Called when user sends — arms idle clock, wakes glow if it faded
    function activate() {
      if (!ring) return;
      idleStarted = true;
      clearTimeout(idleTimer);

      if (ring.classList.contains('cb-glow-fading')) {
        ring.classList.remove('cb-glow-fading');
        ring.classList.add('cb-glow-returning');
        setTimeout(() => {
          if (ring && ring.classList.contains('cb-glow-returning')) {
            ring.classList.remove('cb-glow-returning');
            ring.classList.add('cb-glow-open');
          }
        }, 2550);
      }

      if (!paused) _scheduleIdle();
    }

    function _scheduleIdle() {
      clearTimeout(idleTimer);
      if (!idleStarted) return;
      idleTimer = setTimeout(_fadeOut, IDLE_MS);
    }

    function pauseIdle() {
      paused = true;
      clearTimeout(idleTimer);
    }

    function resumeIdle() {
      paused = false;
      _scheduleIdle();
    }

    function _fadeOut() {
      if (!ring) return;
      ring.classList.remove('cb-glow-open', 'cb-glow-returning');
      ring.classList.add('cb-glow-fading');
    }

    return { init, show, hide, activate, pauseIdle, resumeIdle };
  })();

  const IMESSAGE_ICON = `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#ffffff" d="M16 5.2c-7 0-12.5 4.6-12.5 10.6 0 3.4 1.8 6.5 4.7 8.5.2.2.3.4.3.7 0 .8-.7 2.3-1.4 3.3-.2.3 0 .7.4.6 2.4-.4 4.5-1.4 5.7-2.1.2-.1.5-.2.8-.1 1.3.3 2.7.5 4 .5 7 0 12.5-4.6 12.5-10.6S23 5.2 16 5.2z"/>
    </svg>
  `;

  const CLOSE_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;

  // Build an <img> element for an avatar container programmatically.
  // This avoids inline onerror attributes, which can be blocked by strict CSPs.
  function buildAvatarImg(alt) {
    if (!CONFIG.avatarUrl) return null;
    const img = document.createElement('img');
    img.src = CONFIG.avatarUrl;
    img.alt = alt || CONFIG.botName;
    img.onerror = function () {
      // Replace broken image with text fallback without touching innerHTML.
      const fallback = document.createTextNode('M');
      if (img.parentNode) img.parentNode.replaceChild(fallback, img);
    };
    return img;
  }

  // Populate an avatar container element with either an img or a text fallback.
  function populateAvatar(container, alt) {
    container.textContent = '';
    const img = buildAvatarImg(alt);
    if (img) {
      container.appendChild(img);
    } else {
      container.textContent = 'M';
    }
  }

  // -------------------- DOM --------------------
  function createUI() {
    // ── FAB ──────────────────────────────────────────────────────
    const fab = document.createElement('button');
    fab.className = 'cb-fab';
    fab.setAttribute('aria-label', 'Open chat with Mian');
    fab.style.display = 'none'; // nav Mian is the trigger
    fab.innerHTML = IMESSAGE_ICON;

    // ── Panel ────────────────────────────────────────────────────
    // Built entirely with DOM APIs — no innerHTML with user-derived
    // values, so no risk of HTML injection from config fields.
    const panel = document.createElement('div');
    panel.className = 'cb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', CONFIG.botName);

    // Header
    const header = document.createElement('div');
    header.className = 'cb-header';

    const avatarBtn = document.createElement('button');
    avatarBtn.className = 'cb-avatar';
    avatarBtn.type = 'button';
    avatarBtn.setAttribute('aria-label', 'View ' + CONFIG.botName + "'s profile card");
    populateAvatar(avatarBtn, CONFIG.botName);

    const headerInfo = document.createElement('div');
    headerInfo.className = 'cb-header-info';

    const headerName = document.createElement('div');
    headerName.className = 'cb-header-name';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = CONFIG.botName;
    const statusDot = document.createElement('span');
    statusDot.className = 'cb-status-dot';
    statusDot.setAttribute('aria-label', 'Online');
    headerName.appendChild(nameSpan);
    headerName.appendChild(statusDot);

    const headerSubtitle = document.createElement('div');
    headerSubtitle.className = 'cb-header-subtitle';
    headerSubtitle.textContent = CONFIG.botSubtitle;

    headerInfo.appendChild(headerName);
    headerInfo.appendChild(headerSubtitle);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cb-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML = CLOSE_ICON; // SVG only — no user data

    header.appendChild(avatarBtn);
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Messages area
    const messagesEl = document.createElement('div');
    messagesEl.className = 'cb-messages';
    messagesEl.setAttribute('role', 'log');
    messagesEl.setAttribute('aria-live', 'polite');

    // Chips
    const chipsRow = document.createElement('div');
    chipsRow.className = 'cb-chips';
    chipsRow.id = 'cb-chips-row';
    const CHIPS = ['Tell me about JC', 'Is he open to work?', "What's his experience?"];
    CHIPS.forEach(label => {
      const chip = document.createElement('button');
      chip.className = 'cb-chip';
      chip.type = 'button';
      chip.textContent = label; // textContent — safe
      chipsRow.appendChild(chip);
    });

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'cb-input-area';

    const inputRow = document.createElement('div');
    inputRow.className = 'cb-input-row';

    const textarea = document.createElement('textarea');
    textarea.className = 'cb-textarea';
    textarea.rows = 1;
    textarea.placeholder = 'Ask about JC…';
    textarea.maxLength = CONFIG.maxChars;

    const sendBtn = document.createElement('button');
    sendBtn.className = 'cb-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.disabled = true;
    sendBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    `;

    inputRow.appendChild(textarea);
    inputRow.appendChild(sendBtn);

    const metaRow = document.createElement('div');
    metaRow.className = 'cb-meta-row';

    const disclaimer = document.createElement('span');
    disclaimer.className = 'cb-disclaimer-inline';
    disclaimer.textContent = "Mian's responses may be inaccurate. Please verify.";

    const counterEl = document.createElement('span');
    counterEl.className = 'cb-counter';
    counterEl.textContent = '0 / ' + CONFIG.maxChars;

    metaRow.appendChild(disclaimer);
    metaRow.appendChild(counterEl);

    inputArea.appendChild(inputRow);
    inputArea.appendChild(metaRow);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(chipsRow);
    panel.appendChild(inputArea);

    // ── ID Card overlay ──────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'cb-card-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', CONFIG.botName + ' profile card');

    const card = document.createElement('div');
    card.className = 'cb-card';

    const cardCloseBtn = document.createElement('button');
    cardCloseBtn.className = 'cb-card-close';
    cardCloseBtn.setAttribute('aria-label', 'Close profile card');
    cardCloseBtn.innerHTML = CLOSE_ICON;

    const cardAvatarEl = document.createElement('div');
    cardAvatarEl.className = 'cb-card-avatar';
    populateAvatar(cardAvatarEl, CONFIG.botName);

    const cardName = document.createElement('div');
    cardName.className = 'cb-card-name';
    cardName.textContent = CONFIG.botName;

    const cardRole = document.createElement('div');
    cardRole.className = 'cb-card-role';
    cardRole.textContent = CONFIG.botSubtitle;

    const cardDedication = document.createElement('div');
    cardDedication.className = 'cb-card-dedication';
    cardDedication.textContent = CONFIG.cardDedication;

    card.appendChild(cardCloseBtn);
    card.appendChild(cardAvatarEl);
    card.appendChild(cardName);
    card.appendChild(cardRole);
    card.appendChild(cardDedication);
    overlay.appendChild(card);

    // Mount everything
    const ring = document.createElement('div');
    ring.className = 'cb-siri-ring';
    document.body.appendChild(fab);
    document.body.appendChild(ring);
    document.body.appendChild(panel);
    document.body.appendChild(overlay);

    return { fab, panel, ring, overlay, avatarBtn, closeBtn, messagesEl,
             textarea, sendBtn, counterEl, chipsRow, cardCloseBtn };
  }

  // -------------------- STATE --------------------
  let history = [];
  let isSending = false;
  let welcomeShown = false;

  function init() {
    injectStyles();
    const {
      fab, panel, ring, overlay, avatarBtn, closeBtn,
      messagesEl, textarea, sendBtn, counterEl,
      chipsRow, cardCloseBtn,
    } = createUI();

    glowManager.init(ring);

    // Chip click: answer instantly from CACHED_REPLIES — no LLM call.
    // Falls back to the normal send() path if a chip label somehow
    // isn't in the cache, so nothing silently breaks.
    chipsRow.querySelectorAll('.cb-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!panelReady || isSending) return;
        const label = chip.textContent.trim();
        chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
        if (CACHED_REPLIES[label]) {
          sendCachedChip(label);
        } else {
          textarea.value = label;
          updateUI();
          send();
        }
      });
    });

    // ---- Panel open/close ----
    let panelReady = false;

    function openPanel() {
      panel.classList.add('cb-open');
      fab.classList.add('cb-hidden');
      glowManager.show();
      // Sync Mian indicator — show glass
      if (typeof M !== 'undefined' && !M.open) { M.open = true; if (typeof updateMian === 'function') updateMian(); }
      // Block panel interactions for 450ms to prevent FAB-tap bleed-through
      panelReady = false;
      setTimeout(() => { panelReady = true; }, 450);
      setTimeout(() => textarea.focus(), 250);
      if (!welcomeShown) {
        welcomeShown = true;
        addMessage('bot', CONFIG.welcomeMessage);
        const chips = chipsRow.querySelectorAll('.cb-chip');
        chips.forEach((chip, i) => {
          setTimeout(() => chip.classList.add('cb-chip-in'), i * 120);
        });
      }
    }

    function closePanel() {
      // Spring-close: add cb-closing for collapse animation, then remove cb-open
      panel.classList.add('cb-closing');
      panel.classList.remove('cb-open');
      fab.classList.remove('cb-hidden');
      glowManager.hide();
      // After collapse animation, remove cb-closing so panel is clean for next open
      setTimeout(function() { panel.classList.remove('cb-closing'); }, 360);
      // Sync Mian indicator — dismiss glass
      if (typeof M !== 'undefined' && M.open) { M.open = false; if (typeof updateMian === 'function') updateMian(); if (typeof setMianLift === 'function') setMianLift(false); }
    }

    function isPanelOpen() { return panel.classList.contains('cb-open'); }

    fab.addEventListener('click', openPanel);
    fab.addEventListener('touchend', (e) => {
      e.preventDefault();
      openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    // ── Wire nav Mian button to toggle panel ──────────────────
    // The nav's setupMian() calls this after its own pointerup tap logic.
    // We listen on the #mian element: tap (no drag) toggles the chat panel.
    function wireMianNav() {
      var mianEl = document.getElementById('mian');
      if (!mianEl) return;
      mianEl.addEventListener('pointerup', function(e) {
        // Only act on tap (no drag). The nav's own MO.dragging flag is
        // read-only from here, so we track drag ourselves.
        if (mianEl._cbDragged) return;
        if (isPanelOpen()) { closePanel(); } else { openPanel(); }
      });
      mianEl.addEventListener('pointerdown', function() {
        mianEl._cbDragged = false;
        mianEl._cbStartX = event.clientX;
        mianEl._cbStartY = event.clientY;
      });
      mianEl.addEventListener('pointermove', function(e) {
        if (!mianEl._cbStartX) return;
        var dx = e.clientX - mianEl._cbStartX;
        var dy = e.clientY - mianEl._cbStartY;
        if (Math.sqrt(dx*dx + dy*dy) > 6) mianEl._cbDragged = true;
      });
    }
    // Wire after DOM is ready (nav init already ran)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireMianNav);
    } else {
      wireMianNav();
    }

    // ---- ID card popup ----
    function openCard()  { overlay.classList.add('cb-open'); }
    function closeCard() { overlay.classList.remove('cb-open'); }
    function isCardOpen() { return overlay.classList.contains('cb-open'); }

    avatarBtn.addEventListener('click', openCard);
    cardCloseBtn.addEventListener('click', closeCard);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCard();
    });

    // Escape key: close card first if open, otherwise close panel
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (isCardOpen())  { closeCard();  return; }
      if (isPanelOpen()) { closePanel(); }
    });

    // ---- Message rendering ----
    function buildSmallAvatar() {
      const av = document.createElement('div');
      av.className = 'cb-msg-avatar';
      populateAvatar(av, CONFIG.botName);
      return av;
    }

    function hideOlderBotAvatars() {
      messagesEl.querySelectorAll('.cb-msg-avatar').forEach(a => {
        a.classList.add('cb-avatar-hidden');
      });
    }

    function addMessage(role, text) {
      if (role === 'user') {
        const div = document.createElement('div');
        div.className = 'cb-msg cb-msg-user';
        div.textContent = text; // textContent — safe
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg cb-msg-bot';
      bubble.textContent = text; // textContent — safe

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    function addBotBubbleForTyping(opts) {
      opts = opts || {};
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();
      const bubble = document.createElement('div');
      bubble.className = 'cb-msg ' + (opts.error ? 'cb-msg-error' : 'cb-msg-bot');
      bubble.textContent = '';

      row.appendChild(avatar);
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return { row, bubble };
    }

    function typeIntoBubble(bubble, text) {
      return new Promise((resolve) => {
        const total = text.length;
        const baseDelay = total > 220 ? 10 : total > 120 ? 14 : total > 60 ? 18 : 22;

        let i = 0;
        function step() {
          if (i >= total) { resolve(); return; }
          const ch = text.charAt(i);
          bubble.textContent += ch;
          messagesEl.scrollTop = messagesEl.scrollHeight;
          i++;

          let extra = 0;
          if (ch === '.' || ch === '!' || ch === '?') extra = 140;
          else if (ch === ',' || ch === ';' || ch === ':') extra = 60;

          setTimeout(step, baseDelay + extra);
        }
        step();
      });
    }

    function addTyping() {
      hideOlderBotAvatars();

      const row = document.createElement('div');
      row.className = 'cb-bot-row';

      const avatar = buildSmallAvatar();

      const bubbleWrap = document.createElement('div');
      bubbleWrap.style.display = 'flex';
      bubbleWrap.style.flexDirection = 'column';

      const bubble = document.createElement('div');
      bubble.className = 'cb-msg cb-msg-bot';

      const typing = document.createElement('span');
      typing.className = 'cb-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      bubble.appendChild(typing);

      const anticipation = document.createElement('div');
      anticipation.className = 'cb-anticipation';

      const ANTICIPATION_STEPS = [
        { text: 'Thinking…',            delay: 0     },
        { text: 'Recalling…',           delay: 5000  },
        { text: 'Putting it together…', delay: 15000 },
        { text: 'Almost there…',        delay: 25000 },
        { text: 'Confirming',           delay: 35000, countUp: true },
      ];

      let countUpInterval = null;
      const timers = [];

      ANTICIPATION_STEPS.forEach(({ text, delay, countUp }) => {
        timers.push(setTimeout(() => {
          anticipation.style.opacity = '0';
          // Clear any previous count-up
          if (countUpInterval) { clearInterval(countUpInterval); countUpInterval = null; }
          setTimeout(() => {
            anticipation.textContent = '';
            if (countUp) {
              // Build: "Confirming (Xs)..."
              let secs = 0;
              const update = () => {
                secs++;
                anticipation.textContent = `${text} (${secs}s)...`;
              };
              anticipation.textContent = `${text} (0s)...`;
              countUpInterval = setInterval(update, 1000);
              row._countUpInterval = countUpInterval;
            } else {
              anticipation.textContent = text;
            }
            anticipation.style.opacity = '1';
          }, 200);
        }, delay));
      });

      // Store timers on the row so we can clear them on remove
      row._anticipationTimers = timers;

      // Wrap row + anticipation in a column container so anticipation
      // sits below the row but is indented to align with the bubble
      // (avatar is 28px wide + 8px gap = 36px offset)
      const outer = document.createElement('div');
      outer.style.display = 'flex';
      outer.style.flexDirection = 'column';
      outer.style.alignItems = 'flex-start';

      anticipation.style.marginLeft = '36px';

      bubbleWrap.appendChild(bubble);
      row.appendChild(avatar);
      row.appendChild(bubbleWrap);
      outer.appendChild(row);
      outer.appendChild(anticipation);

      // Proxy remove() so callers removing `row` also remove outer
      row._outer = outer;
      const _origRemove = row.remove.bind(row);
      row.remove = () => outer.remove();

      messagesEl.appendChild(outer);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return row;
    }

    function updateUI() {
      const len = textarea.value.length;
      counterEl.textContent = `${len} / ${CONFIG.maxChars}`;
      counterEl.classList.toggle('cb-near-limit', len > CONFIG.maxChars * 0.8 && len < CONFIG.maxChars);
      counterEl.classList.toggle('cb-at-limit', len >= CONFIG.maxChars);
      sendBtn.disabled = len === 0 || isSending;

      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    textarea.addEventListener('input', updateUI);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    sendBtn.addEventListener('click', () => { if (panelReady) send(); });

    function addRetryButton(errorRow) {
      const wrap = document.createElement('div');
      wrap.className = 'cb-retry-row';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cb-retry-btn';
      btn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' +
        '<span>Retry</span>';

      btn.addEventListener('click', async () => {
        if (isSending) return;
        isSending = true;
        updateUI();
        btn.disabled = true;
        wrap.remove();
        errorRow.remove();
        await attemptReply();
      });

      wrap.appendChild(btn);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return wrap;
    }

    // Sends `history` to the backend and renders the result. On failure,
    // shows an error bubble with a Retry button that re-runs this same
    // function — no need to re-type the message, since it's already in
    // `history` from when the user first sent it.
    async function attemptReply() {
      const typingEl = addTyping();
      glowManager.pauseIdle();

      try {
        const rawReply = await sendToAI(history);
        const reply = stripMarkdown(rawReply);
        if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
        if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
        typingEl.remove();

        const { bubble } = addBotBubbleForTyping();
        await typeIntoBubble(bubble, reply);

        history.push({ role: 'assistant', content: reply });
      } catch (err) {
        console.error('[Mian]', err);
        if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
        if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
        typingEl.remove();

        const { row, bubble } = addBotBubbleForTyping({ error: true });
        await typeIntoBubble(
          bubble,
          "Sorry, I'm having trouble connecting right now. Please try again in a moment, or reach JC directly at jcdcocampo@gmail.com."
        );
        addRetryButton(row);
      } finally {
        isSending = false;
        updateUI();
        textarea.focus();
        glowManager.resumeIdle();
      }
    }

    async function send() {
      const text = textarea.value.trim();
      if (!text || isSending) return;

      isSending = true;
      updateUI();
      addMessage('user', text);
      // User sent → wake / keep the glow alive and start idle clock
      glowManager.activate();
      chipsRow.querySelectorAll('.cb-chip').forEach(c => c.classList.add('cb-chip-gone'));
      history.push({ role: 'user', content: text });
      if (history.length > CONFIG.maxHistory) {
        history = history.slice(-CONFIG.maxHistory);
      }

      textarea.value = '';
      updateUI();

      await attemptReply();
    }

    // Instant reply for the quick-question chips — pulls a random
    // pre-written variant from CACHED_REPLIES instead of calling the
    // API, so the first answer feels immediate. Still logs into
    // `history` so a follow-up question has real context for the LLM.
    async function sendCachedChip(label) {
      if (isSending) return;
      const variants = CACHED_REPLIES[label];
      if (!variants || !variants.length) return;

      isSending = true;
      updateUI();
      addMessage('user', label);
      glowManager.activate();
      history.push({ role: 'user', content: label });
      if (history.length > CONFIG.maxHistory) {
        history = history.slice(-CONFIG.maxHistory);
      }

      const typingEl = addTyping();
      glowManager.pauseIdle();

      const reply = variants[Math.floor(Math.random() * variants.length)];

      // Small natural-feeling pause before the reply appears — this is
      // the only "wait," and it's local, not a network round trip.
      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 300));

      if (typingEl._anticipationTimers) typingEl._anticipationTimers.forEach(clearTimeout);
      if (typingEl._countUpInterval) clearInterval(typingEl._countUpInterval);
      typingEl.remove();

      const { bubble } = addBotBubbleForTyping();
      await typeIntoBubble(bubble, reply);

      history.push({ role: 'assistant', content: reply });

      isSending = false;
      updateUI();
      textarea.focus();
      glowManager.resumeIdle();
    }
  }

  // -------------------- BACKEND CALL --------------------
  async function sendToAI(messages) {
    const res = await fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data || typeof data.reply !== 'string') {
      throw new Error('Invalid response from server');
    }
    return data.reply;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -------------------- BFCACHE FIX --------------------
  // When the browser restores a page from the back-forward cache,
  // CSS animations that already finished won't replay. This resets
  // all .fade-up elements so their animations play again.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      document.querySelectorAll('.fade-up').forEach(function (el) {
        el.style.animation = 'none';
        void el.offsetHeight; // force reflow
        el.style.animation = '';
      });
    }
  });

})();
})();

/* ── Instagram-style swipe navigation (mobile only) ── */
(function(){
  if(!('ontouchstart' in window))return;
  var PAGE_ORDER=['home','experience','projects','certs'];
  var activeId=window.__navActive||'home';
  var idx=PAGE_ORDER.indexOf(activeId);
  if(idx<0)idx=0;

  var startX=0,startY=0,deltaX=0,locked=false,swiping=false;
  var pageWrap=document.querySelector('.page-wrap')||document.querySelector('.article')||document.body;
  var THRESHOLD=60,MAX_SHIFT=120;

  /* Slide-in animation on page load if coming from a swipe */
  var dir=sessionStorage.getItem('__swipeDir');
  if(dir){
    sessionStorage.removeItem('__swipeDir');
    pageWrap.style.transition='none';
    pageWrap.style.transform='translateX('+(dir==='left'?'60':'-60')+'px)';
    pageWrap.style.opacity='0.3';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      pageWrap.style.transition='transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease';
      pageWrap.style.transform='translateX(0)';
      pageWrap.style.opacity='1';
    });});
  }

  document.addEventListener('touchstart',function(e){
    if(e.target.closest&&(e.target.closest('#pill')||e.target.closest('#mian')||e.target.closest('.cb-panel')||e.target.closest('.cb-card-overlay')))return;
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
    deltaX=0;locked=false;swiping=false;
  },{passive:true});

  document.addEventListener('touchmove',function(e){
    if(locked)return;
    var dx=e.touches[0].clientX-startX;
    var dy=e.touches[0].clientY-startY;
    /* Lock direction after 10px: if vertical, abandon swipe */
    if(!swiping&&(Math.abs(dx)>10||Math.abs(dy)>10)){
      if(Math.abs(dy)>Math.abs(dx)){locked=true;return;}
      swiping=true;
    }
    if(!swiping)return;
    deltaX=dx;
    /* Rubberband: can't swipe past first/last page */
    var canLeft=idx<PAGE_ORDER.length-1;
    var canRight=idx>0;
    if((deltaX<0&&!canLeft)||(deltaX>0&&!canRight)){deltaX=deltaX*0.15;}
    var shift=Math.max(-MAX_SHIFT,Math.min(MAX_SHIFT,deltaX));
    pageWrap.style.transition='none';
    pageWrap.style.transform='translateX('+shift+'px)';
    pageWrap.style.opacity=String(1-Math.abs(shift)/MAX_SHIFT*0.4);
  },{passive:true});

  document.addEventListener('touchend',function(){
    if(!swiping){return;}
    var absDx=Math.abs(deltaX);
    if(absDx>THRESHOLD){
      var targetIdx=deltaX<0?idx+1:idx-1;
      if(targetIdx>=0&&targetIdx<PAGE_ORDER.length){
        var targetId=PAGE_ORDER[targetIdx];
        /* Animate pill indicator */
        if(typeof setActive==='function')setActive(targetId);
        /* Slide page out */
        var outX=deltaX<0?'-100':'100';
        sessionStorage.setItem('__swipeDir',deltaX<0?'left':'right');
        pageWrap.style.transition='transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.2s ease';
        pageWrap.style.transform='translateX('+outX+'px)';
        pageWrap.style.opacity='0';
        setTimeout(function(){window.location.href=NAV_URLS[targetId];},220);
        return;
      }
    }
    /* Snap back */
    pageWrap.style.transition='transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease';
    pageWrap.style.transform='translateX(0)';
    pageWrap.style.opacity='1';
  },{passive:true});
})();
