   İkili seri tamam değilse genel averaja düşülür. */
function siralaTff(arr, ptsOf, gdOf, gfOf){
  var list=arr.slice().sort(function(a,b){
    return ptsOf(b)-ptsOf(a)||gdOf(b)-gdOf(a)||gfOf(b)-gfOf(a)||a.name.localeCompare(b.name,"tr");
  });
  var out=[], i=0;
  while(i<list.length){
    var j=i+1;
    while(j<list.length && Math.abs(ptsOf(list[j])-ptsOf(list[i]))<1e-9) j++;
    var grp=list.slice(i,j);
    if(grp.length>=2) grp=miniLigSirala(grp, gdOf, gfOf);
    out=out.concat(grp);
    i=j;
  }
  return out;
}
function buildTable(){
  var t={};
  S.teams.forEach(function(n){t[n]={name:n,p:0,gf:0,ga:0,pts:0,mid:0,low:0,high:0,forC:0,agC:0,agT:0,forT:0,bosa:0,fazla:0,adjGf:0,adjGa:0};});
  S.matches.forEach(function(m){
    if(!t[m.home]||!t[m.away])return;
    var r=realPts(m.hg,m.ag),H=t[m.home],A=t[m.away];
    H.p++;A.p++;H.gf+=m.hg;H.ga+=m.ag;A.gf+=m.ag;A.ga+=m.hg;H.pts+=r[0];A.pts+=r[1];
    var im=matchImpact(m);
    H.mid+=im.mid.home;A.mid+=im.mid.away;
    H.bosa+=im.mid.bosaHome;A.bosa+=im.mid.bosaAway;
    H.fazla+=im.mid.fazlaHome;A.fazla+=im.mid.fazlaAway;
    H.low+=im.low.home;A.low+=im.low.away;
    H.high+=im.high.home;A.high+=im.high.away;
    var gh=(im.gMid&&im.gMid.h)||0, ga=(im.gMid&&im.gMid.a)||0;
    H.adjGf+=m.hg+gh; H.adjGa+=m.ag+ga;
    A.adjGf+=m.ag+ga; A.adjGa+=m.hg+gh;
    (m.decisions||[]).forEach(function(d){
      var harmed=d.harmed==="home"?H:A, other=d.harmed==="home"?A:H;
      if((d.certainty||0) >= 75){ harmed.agC++; other.forC++; }
      else { harmed.agT++; other.forT++; }
    });
  });
  var arr=Object.keys(t).map(function(k){return t[k];});
  var real=siralaTff(arr, function(x){return x.pts;}, function(x){return x.gf-x.ga;}, function(x){return x.gf;});
  real.forEach(function(x,i){x.realPos=i+1;});
  var adj=siralaTff(arr, function(x){return x.pts+x.mid;}, function(x){return x.adjGf-x.adjGa;}, function(x){return x.adjGf;});
  adj.forEach(function(x,i){x.adjPos=i+1;});
  return {real:real,adj:adj};
}

/* ---------------- Durum ---------------- */
var S={tema:null, me:null, teams:DEFAULT_TEAMS.slice(), matches:[], tab:"table", draft:null, editId:null, acikTakim:null,
       msg:"", binId:"", sync:"yerel", quick:null,
       cekHaftaNo:"", cekBusy:false, cekMsg:"", cekHata:false, hakemSira:"hata",
       silinen:{}, acikHafta:null, acikHakem:null, ornek:false, yerineYaz:false, acikEtkili:false};
/* Misafir kipi: adres ?misafir ile bitiyorsa uygulama salt okunur açılır.
   Kimlik sorulmaz, yazma yolları kapanır, düzenleme sekmeleri gizlenir. */
var MISAFIR = /(^|[?&#])misafir(=|&|$)/.test(location.search + location.hash);
var MISAFIR_BIN = "7e5bcb28b0d4471ca91a";

var TABS=MISAFIR
 ?[["table","Tablo"],["big4","Dört Büyük"],["matches","Maçlar"],["refs","Hakemler"],["method","Kurallar"]]
 :[["table","Tablo"],["big4","Dört Büyük"],["add","Maç ekle"],["matches","Maçlar"],
          ["refs","Hakemler"],["teams","Ayarlar"],["method","Kurallar"]];
var ICO={
  duduk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M3 10h9l4-3v10l-4-3H3z"/><path d="M19 9a5 5 0 0 1 0 6"/></svg>',
  table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  big4:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  matches:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
  refs:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M12 3l3 6 6 .8-4.4 4.2 1.2 6.2L12 17.3 5.2 20.2l1.2-6.2L2 9.8 8 9z"/></svg>',
  teams:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  method:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
};
var PITCH_ICON='<svg width="88" height="58" viewBox="0 0 120 80" fill="none" aria-hidden="true"><rect x="4" y="4" width="112" height="72" rx="2" stroke="currentColor" stroke-width="1.4"/><line x1="60" y1="4" x2="60" y2="76" stroke="currentColor" stroke-width="1.2"/><circle cx="60" cy="40" r="12" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="22" width="18" height="36" stroke="currentColor" stroke-width="1.2"/><rect x="98" y="22" width="18" height="36" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="30" width="8" height="20" stroke="currentColor" stroke-width="1.1"/><rect x="108" y="30" width="8" height="20" stroke="currentColor" stroke-width="1.1"/><circle cx="60" cy="40" r="1.4" fill="currentColor"/></svg>';
function emptyPitch(msg){ return '<div class="card"><div class="empty">'+PITCH_ICON+'<p style="margin:0">'+msg+'</p></div></div>'; }
function vsLine(a,b){ return '<span class="mteams">'+tdot(a)+'<span>'+esc(a)+'</span><span class="vs">—</span>'+tdot(b)+'<span>'+esc(b)+'</span></span>'; }
var KEY="dudukpayi-html-v1";
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}

function panoYaz(metin, tamam, hata){
  var bitir=function(ok){ S.msg=ok?(tamam||"Panoya kopyalandı."):(hata||"Kopyalanamadı."); render(); };
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(metin).then(function(){bitir(true);},function(){bitir(false);});
      return;
    }
  }catch(e){}
  bitir(false);
}

/* --- Yerel katman: localStorage (Netlify) + window.storage (Claude önizleme) --- */
function lsGet(k){try{return window.localStorage?localStorage.getItem(k):null;}catch(e){return null;}}
function lsSet(k,v){try{if(window.localStorage)localStorage.setItem(k,v);}catch(e){}}
function lsDel(k){try{if(window.localStorage)localStorage.removeItem(k);}catch(e){}}
/* Ortak defter elle düzenlenebildiği için dışarıdan gelen veri güvenilmezdir.
   Skorlar, dakika ve kesinlik makul aralığa çekilir; bozuk kayıt elenir. */
function tamSayi(v,alt,ust,varsayilan){
  var n=parseInt(v,10);
  if(!isFinite(n)) n=varsayilan;
  return Math.max(alt,Math.min(ust,n));
}
function macTemizle(liste){
  if(!Array.isArray(liste)) return [];
  var gecerliTip={};
  TYPES.forEach(function(t){ gecerliTip[t.id]=1; });
  return liste.filter(function(m){ return m && typeof m==="object" && m.home && m.away && m.home!==m.away; })
   .map(function(m){
     var kararlar=Array.isArray(m.decisions)?m.decisions:[];
     return {
       id: m.id||Date.now()+Math.floor(Math.random()*1000),
       home: String(m.home), away: String(m.away),
       hg: tamSayi(m.hg,0,99,0), ag: tamSayi(m.ag,0,99,0),
       ref: m.ref==null?"":String(m.ref),
       week: m.week==null?"":String(m.week),
       by: m.by==null?"":String(m.by),
       upd: tamSayi(m.upd,0,9e15,0),
       skorOnay: !!m.skorOnay,
       decisions: kararTekille(
         kararlar.filter(function(d){
           if(!d || !gecerliTip[d.type]) return false;
           if(S.ornek) return true;
           if(String(d.kid||"").indexOf("seed-")===0) return false;
           if(d.note==="örnek kayıt") return false;
           return true;
         }).map(function(d,i){
          return { kid: d.kid==null||d.kid==="" ? ("e-"+m.id+"-"+kararParmak(d)) : String(d.kid),
                   type:d.type,
                   harmed: d.harmed==="away"?"away":"home",
                   minute: tamSayi(d.minute,1,120,45),
                   certainty: tamSayi(d.certainty,0,100,80),
                   note: d.note==null?"":String(d.note),
                   by: d.by==null?"":String(d.by) };
        }), m.silinenKarar),
       silinenKarar: (m.silinenKarar && typeof m.silinenKarar==="object") ? m.silinenKarar : {}
     };
   });
}

function applyDoc(d){
  if(d&&Array.isArray(d.teams)&&d.teams.length)S.teams=d.teams;
  if(d&&Array.isArray(d.matches))S.matches=macTemizle(d.matches);
  if(d&&d.silinen&&typeof d.silinen==="object") S.silinen=d.silinen;
  impactTemizle();
}
function localSave(){
  if(MISAFIR) return;
  var doc=JSON.stringify({teams:S.teams,matches:S.matches,silinen:S.silinen||{}});
  lsSet(KEY,doc);
  try{ if(window.storage&&window.storage.set) window.storage.set(KEY,doc,true); }catch(e){}
}
function localLoad(cb){
  var raw=lsGet(KEY);
  if(raw){ try{applyDoc(JSON.parse(raw)); S.ornek=false;}catch(e){} }
  /* Örnek veri yalnızca hiçbir ortak deftere bağlı değilken ve kayıt yokken. */
  if((!S.matches||!S.matches.length) && !binUrl()){
    S.matches=seedKopya();
    S.ornek=true;
  }
  try{
    if(window.storage&&window.storage.get){
      window.storage.get(KEY,true).then(function(r){
        if(r&&r.value){try{applyDoc(JSON.parse(r.value));}catch(e){}}
        cb();
      }).catch(cb); return;
    }
  }catch(e){}
  cb();
}

/* --- Ortak depo: npoint.io --- */
function binUrl(){ return S.binId?("https://api.npoint.io/"+S.binId):null; }
function yeniKid(){ return "n"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function kararParmak(d){
  return [d.type, d.harmed==="away"?"away":"home", tamSayi(d.minute,1,120,45)].join("|");
}
function kararTekille(liste, silinen){
  var map={};
  (liste||[]).forEach(function(d){
    if(!d||!d.type) return;
    if(d.kid && silinen && silinen[String(d.kid)]) return;
    var p=kararParmak(d);
    if(silinen && silinen[p]) return;
    var cur=map[p];
    if(!cur){ map[p]=d; return; }
    if((d.certainty||0)>(cur.certainty||0)) map[p]=d;
    else if((d.certainty||0)===(cur.certainty||0) && d.kid && String(d.kid).charAt(0)==="n" && String(cur.kid||"").charAt(0)!=="n") map[p]=d;
  });
  return Object.keys(map).map(function(k){return map[k];});
}
function kararSay(ms){
  var n=0; (ms||[]).forEach(function(m){ n+=(m.decisions||[]).length; }); return n;
}
function silinenBudan(s){
  var kes=Date.now()-90*864e5, out={};
  Object.keys(s||{}).forEach(function(k){ if((s[k]||0)>=kes) out[k]=s[k]; });
  return out;
}
function kararBirlestir(a,b,silinen){
  return kararTekille([].concat(a||[], b||[]), silinen);
}
function macBirlestir(a,b){
  if(!a) return b; if(!b) return a;
  var yeni=(a.upd||0)>=(b.upd||0)?a:b, eski=yeni===a?b:a;
  var silinenKarar=silinenBudan(Object.assign({}, a.silinenKarar||{}, b.silinenKarar||{}));
  var out={
    id:yeni.id, home:yeni.home, away:yeni.away,
    hg:yeni.hg, ag:yeni.ag, week:yeni.week,
    ref:(yeni.ref&&String(yeni.ref).trim())?yeni.ref:eski.ref,
    by:yeni.by||eski.by, skorOnay:!!(yeni.skorOnay||eski.skorOnay),
    upd:Math.max(a.upd||0,b.upd||0),
    silinenKarar:silinenKarar,
    decisions:kararBirlestir(a.decisions,b.decisions,silinenKarar)
  };
  return out;
}
function birlestirDefter(yerel, uzak){
  var silinen=silinenBudan(Object.assign({}, (uzak&&uzak.silinen)||{}, (yerel&&yerel.silinen)||{}));
