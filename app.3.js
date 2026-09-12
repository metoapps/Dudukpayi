  var map={};
  function al(m){
    if(!m||m.id==null) return;
    var sid=String(m.id);
    if(silinen[sid] && (!m.upd || silinen[sid]>=m.upd)) return;
    map[sid]=map[sid]?macBirlestir(map[sid], m):m;
  }
  ((uzak&&uzak.matches)||[]).forEach(al);
  ((yerel&&yerel.matches)||[]).forEach(al);
  var teams=(yerel.teams&&yerel.teams.length)?yerel.teams:((uzak&&uzak.teams)||DEFAULT_TEAMS.slice());
  return {teams:teams, matches:macTemizle(Object.keys(map).map(function(k){return map[k];})), silinen:silinen};
}
function remotePush(cb){
  if(MISAFIR){ if(cb)cb(true); return; }
  if(!binUrl()){ if(cb)cb(true); return; }
  fetch(binUrl(),{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({teams:S.teams,matches:S.matches,silinen:S.silinen||{},at:Date.now(),by:S.me||""})})
  .then(function(r){ if(cb)cb(r.ok); })
  .catch(function(){ if(cb)cb(false); });
}
function remotePull(cb){
  if(!binUrl()){ if(cb)cb(false); return; }
  fetch(binUrl()).then(function(r){return r.ok?r.json():null;})
  .then(function(d){
    if(d){
      var once=kararSay((d.matches)||[]);
      var m=birlestirDefter({teams:S.teams,matches:S.matches,silinen:S.silinen}, d);
      S.teams=m.teams; S.matches=m.matches; S.silinen=m.silinen;
      impactTemizle(); localSave();
      if(kararSay(S.matches)<once && !MISAFIR){
        remotePush(function(){ if(cb)cb(true); });
        return;
      }
    }
    if(cb)cb(!!d);
  })
  .catch(function(){ if(cb)cb(false); });
}

function save(){
  if(MISAFIR) return;
  S.ornek=false;
  localSave();
  if(!binUrl()) return;
  if(S.yerineYaz){
    S.yerineYaz=false; S.sync="…";
    remotePush(function(ok){
      S.sync=ok?"ortak":"hata";
      if(!ok)S.msg="Ortak depoya yazılamadı — veri bu cihazda duruyor. İnterneti kontrol edip tekrar kaydet.";
      render();
    });
    return;
  }
  S.sync="…";
  fetch(binUrl()).then(function(r){ return r.ok?r.json():null; }).then(function(uzak){
    if(uzak&&(Array.isArray(uzak.matches)||uzak.silinen)){
      var onceki=S.matches.length;
      var m=birlestirDefter({teams:S.teams,matches:S.matches,silinen:S.silinen}, uzak);
      S.teams=m.teams; S.matches=m.matches; S.silinen=m.silinen;
      impactTemizle();
      localSave();
      if(S.matches.length>onceki) S.msg="Ortak defterde yeni kayıt vardı, birleştirildi.";
    }
    remotePush(function(ok){
      S.sync=ok?"ortak":"hata";
      if(!ok)S.msg="Ortak depoya yazılamadı — veri bu cihazda duruyor. İnterneti kontrol edip tekrar kaydet.";
      render();
    });
  }).catch(function(){
    remotePush(function(ok){
      S.sync=ok?"ortak":"hata";
      if(!ok)S.msg="Ortak depoya yazılamadı — veri bu cihazda duruyor. İnterneti kontrol edip tekrar kaydet.";
      render();
    });
  });
}
function boot(){
  S.tema=temaOku();
  temaUygula();
  S.me=lsGet("dp-me")||null;
  S.binId=MISAFIR?MISAFIR_BIN:(lsGet("dp-bin")||"");
  try{
    if(window.storage&&window.storage.get){
      window.storage.get("dp-me",false).then(function(r){
        if(r&&r.value)S.me=r.value;
        afterMe();
      }).catch(afterMe); return;
    }
  }catch(e){}
  afterMe();
  function afterMe(){
    if(S.me&&CREW.indexOf(S.me)<0)S.me=null;
    localLoad(function(){
      if(binUrl()){ S.sync="…"; render(); remotePull(function(ok){ S.sync=ok?"ortak":"hata"; render(); }); }
      else { S.sync="yerel"; render(); }
    });
  }
}
function setMe(n){
  if(MISAFIR) return;
  S.me=n; lsSet("dp-me",n);
  try{ if(window.storage&&window.storage.set) window.storage.set("dp-me",n,false); }catch(e){}
  render();
}
function refresh(){
  S.msg="";
  if(!binUrl()){ S.msg="Ortak depo bağlı değil — Maçlar sekmesinden bağlayabilirsin."; render(); return; }
  S.sync="…"; render();
  remotePull(function(ok){ S.sync=ok?"ortak":"hata"; if(!ok)S.msg="Ortak depoya ulaşılamadı."; render(); });
}
function connectBin(){
  if(MISAFIR) return;
  var el=document.getElementById("binIn"); var v=(el.value||"").trim();
  v=v.replace(/^https?:\/\/(www\.)?(api\.)?npoint\.io\//,"").replace(/\/$/,"");
  if(!v){ S.msg="Depo kodunu yapıştır."; render(); return; }
  S.msg=""; S.sync="…"; render();
  fetch("https://api.npoint.io/"+v).then(function(r){return r.ok?r.json():Promise.reject();})
  .then(function(d){
    S.binId=v; lsSet("dp-bin",v);
    var remoteHas=d&&Array.isArray(d.matches)&&d.matches.length;
    if(remoteHas){
      if(S.ornek){ applyDoc(d); }
      else {
        var m=birlestirDefter({teams:S.teams,matches:S.matches,silinen:S.silinen}, d);
        S.teams=m.teams; S.matches=m.matches; S.silinen=m.silinen;
        impactTemizle();
      }
      S.ornek=false; localSave(); S.sync="ortak"; S.msg="Bağlandı — ortak defter birleştirildi ("+S.matches.length+" maç)."; render();
    }
    else {
      if(S.ornek){
        S.matches=[]; S.ornek=false; impactTemizle(); localSave();
      }
      remotePush(function(ok){ S.sync=ok?"ortak":"hata"; S.msg=ok?"Bağlandı — bu cihazdaki veri ortak depoya yazıldı.":"Bağlandı ama yazılamadı."; render(); });
    }
  })
  .catch(function(){ S.sync=binUrl()?"hata":"yerel"; S.msg="Depo bulunamadı. Kodu kontrol et — npoint.io adresindeki son bölüm."; render(); });
}
function disconnectBin(){
  if(MISAFIR) return;
  if(!confirm("Ortak depo bağlantısı kesilsin mi? Veri bu cihazda kalır."))return;
  S.binId=""; lsSet("dp-bin",""); S.sync="yerel"; render();
}

/* ---------------- Giriş ekranı ---------------- */
function vGate(){
  return '<div class="gate"><h1>Düdük <span>Payı.</span></h1>'
   +'<p class="lead">Bu defteri beş kişi birlikte tutuyor. Kim olduğunu seç — girdiğin her maç senin adınla kaydedilir.</p>'
   +CREW.map(function(n){return '<button class="who-btn" onclick="setMe(\''+n+'\')">'+esc(n)+'</button>';}).join('')
   +'<p class="foot">Veri beşinizde ortak: biri girdiğinde diğerleri görür. Bu bir güvenlik kilidi değil, kimin ne girdiğini izleyebilmek için.</p></div>';
}

/* ---------------- Görünümler ---------------- */
/* ---------------- Dört Büyük ---------------- */
function vBig4(){
  var T={}; BIG4.forEach(function(n){
    T[n]={name:n, derbyF:0, derbyA:0, derbyPts:0, restF:0, restA:0, restPts:0, g:0, dg:0};
  });
  var grid={}; BIG4.forEach(function(a){ grid[a]={}; BIG4.forEach(function(b){ grid[a][b]={f:0,a:0}; }); });
  var refs={}, anyMatch=0;

  S.matches.forEach(function(m){
    var hB=BIG4.indexOf(m.home)>=0, aB=BIG4.indexOf(m.away)>=0;
    if(!hB&&!aB) return;
    anyMatch++;
    var derby=hB&&aB, im=matchImpact(m);
    if(hB){ T[m.home].g++; if(derby)T[m.home].dg++;
      if(derby)T[m.home].derbyPts+=im.mid.home; else T[m.home].restPts+=im.mid.home; }
    if(aB){ T[m.away].g++; if(derby)T[m.away].dg++;
      if(derby)T[m.away].derbyPts+=im.mid.away; else T[m.away].restPts+=im.mid.away; }
    (m.decisions||[]).forEach(function(d){
      var harmed=d.harmed==="home"?m.home:m.away, other=d.harmed==="home"?m.away:m.home;
      if(BIG4.indexOf(harmed)>=0){ if(derby)T[harmed].derbyA++; else T[harmed].restA++; }
      if(BIG4.indexOf(other)>=0){ if(derby)T[other].derbyF++; else T[other].restF++; }
      if(derby){ grid[other][harmed].f++; grid[harmed][other].a++; }
      var rn=(m.ref||"").trim();
      if(rn){
        if(!refs[rn])refs[rn]={n:rn,g:0,rows:{}};
        BIG4.forEach(function(b){ if(!refs[rn].rows[b])refs[rn].rows[b]={f:0,a:0}; });
        if(BIG4.indexOf(harmed)>=0)refs[rn].rows[harmed].a++;
        if(BIG4.indexOf(other)>=0)refs[rn].rows[other].f++;
      }
    });
    var rn2=(m.ref||"").trim();
    if(rn2){ if(!refs[rn2])refs[rn2]={n:rn2,g:0,rows:{}}; refs[rn2].g++; }
  });

  if(!anyMatch) return emptyPitch('Dört büyüklerin maçı henüz girilmemiş.<br>Maç eklendikçe bu sayfa dolar.');

  var rows=BIG4.map(function(n){var t=T[n]; t.net=t.derbyPts+t.restPts; t.totF=t.derbyF+t.restF; t.totA=t.derbyA+t.restA; return t;})
    .sort(function(a,b){return b.net-a.net;});
  var mx=1; rows.forEach(function(r){mx=Math.max(mx,Math.abs(r.net));});

  var h='<div class="four">';
  rows.forEach(function(r){
    h+='<div class="four-card"><div class="fn">'+tdot(r.name)+'<span class="tname">'+esc(r.name)+'</span></div>'
     +'<div class="fv '+(r.net>=0?'up':'down')+'">'+(r.net>=0?'+':'')+r.net.toFixed(1)+'</div>'
     +'<div class="fm">'+r.totF+' leh · '+r.totA+' aleyh</div></div>';
  });
  h+='</div>';
  h+='<div class="card"><span class="lbl">Düdük payı — dört büyük</span>'
   +'<div class="thead" style="grid-template-columns:minmax(0,1fr) 38px 40px 68px 52px">'
   +'<div>Takım</div><div class="pts">Leh</div><div class="pts">Aleyh</div><div class="ctr">Net</div><div class="pts">Puan</div></div>';
  rows.forEach(function(r){
    var w=Math.abs(r.net)/mx*50;
    h+='<div class="trow" style="grid-template-columns:minmax(0,1fr) 38px 40px 68px 52px">'
     +teamCell(r.name)
     +'<div class="pts" style="color:var(--green)">'+r.totF+'</div>'
     +'<div class="pts" style="color:var(--red)">'+r.totA+'</div>'
     +'<div class="drift"><div class="axis"></div>'
     +'<div class="bar '+(r.net>=0?"pos":"neg")+'" style="left:'+(r.net>=0?50:50-w)+'%;width:'+w+'%"></div></div>'
     +'<div class="delta '+(r.net>=0?"up":"down")+'">'+(r.net>=0?"+":"")+r.net.toFixed(1)+'</div></div>';
  });
  h+='</div>';

  h+='<div class="card"><span class="lbl">Derbi içi / derbi dışı</span>'
   +'<div class="thead" style="grid-template-columns:minmax(0,1.1fr) 1fr 1fr"><div>Takım</div><div class="pts">Derbi</div><div class="pts">Diğer 14</div></div>';
  rows.forEach(function(r){
    h+='<div class="trow" style="grid-template-columns:minmax(0,1.1fr) 1fr 1fr">'+teamCell(r.name)
     +'<div class="delta '+(r.derbyPts>=0?"up":"down")+'">'+(r.derbyPts>=0?"+":"")+r.derbyPts.toFixed(1)
     +' <span style="color:var(--dim)">('+r.dg+' maç)</span></div>'
     +'<div class="delta '+(r.restPts>=0?"up":"down")+'">'+(r.restPts>=0?"+":"")+r.restPts.toFixed(1)
     +' <span style="color:var(--dim)">('+(r.g-r.dg)+' maç)</span></div></div>';
  });
  h+='</div>';

  var anyDerby=0; BIG4.forEach(function(a){BIG4.forEach(function(b){anyDerby+=grid[a][b].f;});});
  if(anyDerby){
    h+='<div class="card"><span class="lbl">Derbilerde kim kimden</span>';
    BIG4.forEach(function(a){
      var line=BIG4.filter(function(b){return b!==a&&(grid[a][b].f||grid[a][b].a);});
      if(!line.length)return;
      h+='<div style="margin-bottom:14px"><div class="mteams" style="margin-bottom:6px">'+tdot(a)+'<span>'+esc(a)+'</span></div>';
      line.forEach(function(b){
        h+='<div class="trow" style="grid-template-columns:1fr 54px 54px;padding:7px 0">'
         +teamCell(b)
         +'<div class="pts" style="color:var(--green)">+'+grid[a][b].f+'</div>'
         +'<div class="pts" style="color:var(--red)">-'+grid[a][b].a+'</div></div>';
      });
      h+='</div>';
    });
    h+='</div>';
  }

  var rl=Object.keys(refs).map(function(k){return refs[k];})
    .filter(function(r){var t=0;BIG4.forEach(function(b){t+=r.rows[b]?r.rows[b].f+r.rows[b].a:0;});r.tot=t;return t>0;})
    .sort(function(a,b){return b.tot-a.tot;});
  if(rl.length){
    h+='<div class="card"><span class="lbl">Hakem × dört büyük</span>';
    rl.forEach(function(r){
      h+='<div style="margin-bottom:14px"><div class="mtop" style="margin-bottom:6px">'
       +'<span class="mteams">'+esc(r.n)+'</span><span class="mmeta">'+r.g+' maç</span></div>';
      BIG4.forEach(function(b){
        var v=r.rows[b]; if(!v||(!v.f&&!v.a))return;
        h+='<div class="trow" style="grid-template-columns:1fr 54px 54px;padding:7px 0">'
         +teamCell(b)
         +'<div class="pts" style="color:var(--green)">'+v.f+'</div>'
         +'<div class="pts" style="color:var(--red)">'+v.a+'</div></div>';
      });
      h+='</div>';
    });
    h+='</div>';
  }

  return h;
}

/* Tek bir kararın gerçek katkısı: o karar olmasaydı maç ne olurdu?
   Kararı listeden çıkarıp maçı yeniden hesaplar, farkı alır.
   Kararlar birbiriyle etkileştiği için bu "çıkarınca ne değişir" ölçüsüdür;
   tek tek katkıların toplamı maçın toplam etkisine birebir eşit olmayabilir. */
