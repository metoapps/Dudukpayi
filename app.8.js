  var dup=findDupes(d.home,d.away,d.week,S.editId);
  if(dup.length){
    var lst=dup.map(function(m){return "  • "+m.hg+"-"+m.ag+(m.week?" ("+m.week+". hafta)":"")+(m.by?" — "+m.by:"");}).join("\n");
    if(!confirm(d.home+" — "+d.away+(d.week?" ("+d.week+". hafta)":"")+" zaten kayıtlı:\n"+lst+"\n\nYine de ikinci kez eklensin mi? Eklenirse tabloda iki maç olarak sayılır."))return;
  }
  var rec={id:S.editId||Date.now(),week:(d.week||"").trim(),home:d.home,away:d.away,
    hg:+d.hg||0,ag:+d.ag||0,ref:(d.ref||"").trim(),
    decisions:(d.decs||[]).map(function(x){
      var k=Object.assign({}, x);
      if(!k.kid) k.kid=yeniKid();
      return k;
    }),
    by:S.me, upd:Date.now(), skorOnay:!!d.skorOnay, silinenKarar:Object.assign({}, d.silinenKarar||{})};
  if(S.editId){
    var eski=S.matches.filter(function(x){return x.id===S.editId;})[0];
    if(eski){
      rec.skorOnay = !!(d.skorOnay || eski.skorOnay);
      rec.silinenKarar=Object.assign({}, eski.silinenKarar||{});
      var yeniKids={};
      rec.decisions.forEach(function(x){ if(x.kid) yeniKids[x.kid]=1; });
      (eski.decisions||[]).forEach(function(x){
        if(x.kid && !yeniKids[x.kid]) rec.silinenKarar[x.kid]=Date.now();
      });
    }
    S.matches=S.matches.map(function(m){return m.id===S.editId?rec:m;});
  }
  else{ S.matches.push(rec); }
  S.draft=null; S.editId=null; S.tab="matches"; save(); render();
}
function editMatch(id){
  var m=S.matches.filter(function(x){return x.id===id;})[0]; if(!m)return;
  S.draft={home:m.home,away:m.away,hg:m.hg,ag:m.ag,ref:m.ref,week:m.week,skorOnay:!!m.skorOnay,silinenKarar:m.silinenKarar||{},
    decs:(m.decisions||[]).map(function(d){return {kid:d.kid,type:d.type,harmed:d.harmed,minute:d.minute,certainty:d.certainty,note:d.note||"",by:d.by};})};
  S.editId=id; S.tab="add"; render();
}
function cancelEdit(){ S.draft=null; S.editId=null; S.tab="matches"; render(); }
function hakemSirala(n){ S.hakemSira = (n==="etki"?"etki":"hata"); render(); }
function skorOnayla(id){
  if(MISAFIR) return;
  var m=S.matches.filter(function(x){return x.id===id;})[0];
  if(m){ m.skorOnay=true; m.upd=Date.now(); save(); render(); }
}
function delMatch(id){
  if(MISAFIR) return;
  var m=S.matches.filter(function(x){return x.id===id;})[0];
  if(!confirm((m&&m.by&&m.by!==S.me?(m.by+" tarafından girilmiş bu maç"):"Bu maç")+" silinsin mi? Değişiklik herkeste geçerli olur."))return;
  S.matches=S.matches.filter(function(x){return x.id!==id;});
  S.silinen=S.silinen||{};
  S.silinen[String(id)]=Date.now();
  impactTemizle();
  save(); render();
}
function exportData(){
  var blob=new Blob([JSON.stringify({teams:S.teams,matches:S.matches,silinen:S.silinen||{}},null,2)],{type:"application/json"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="dudukpayi-yedek-"+new Date().toISOString().slice(0,10)+".json";
  a.click(); URL.revokeObjectURL(a.href);
}
function importData(inp){
  if(MISAFIR) return;
  var f=inp.files&&inp.files[0]; if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){
    try{
      var d=JSON.parse(rd.result);
      if(!d||!Array.isArray(d.matches)||!Array.isArray(d.teams)) throw 0;
      if(!confirm("İçe aktarma ortak defterdeki "+S.matches.length+" maçın yerine geçecek ve beşinizi birden etkiler. Devam?")){inp.value="";return;}
      var eskiIds={}; (S.matches||[]).forEach(function(m){ eskiIds[String(m.id)]=1; });
      S.teams=d.teams; S.matches=macTemizle(d.matches); S.silinen=d.silinen||{}; S.ornek=false; impactTemizle();
      S.matches.forEach(function(m){ delete eskiIds[String(m.id)]; });
      Object.keys(eskiIds).forEach(function(id){ S.silinen[id]=Date.now(); });
      S.yerineYaz=true; save(); render();
    }catch(e){ S.msg="Dosya okunamadı — geçerli bir Düdük Payı yedeği değil."; render(); }
    inp.value="";
  };
  rd.readAsText(f);
}

/* ---- Haftayı toplu çekme ---- */
function norm(s){
  return String(s||"").toLocaleLowerCase("tr")
    .replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g")
    .replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[^a-z0-9]/g,"");
}
/* İnternetten hafta çekme: TheSportsDB eventsround.php.
   Ücretsiz "123" anahtarı sınırlı ve paylaşımlı; yoğun kullanımda ya da
   kaynak değişirse çalışmayabilir. Başarısız olursa kullanıcı elle arayıp
   yapıştırma kutusunu kendisi doldurmaya devam edebilir — akış bozulmaz.
   ÖNEMLİ: 2026-27 boş dönerse eski sezonlar denenir. Hangi sezondan
   geldiği mutlaka yazılır, yoksa geçen sezonun skorları bu sezonun
   haftası diye deftere girer. */
function internettenCek(){
  if(MISAFIR||S.cekBusy) return;
  var el=document.getElementById("cekHafta");
  var hafta=parseInt(el&&el.value,10);
  if(!isFinite(hafta)||hafta<1||hafta>34){ S.cekMsg="Hafta numarası 1 ile 34 arasında olmalı."; S.cekHata=true; render(); return; }
  S.cekHaftaNo=String(hafta); S.cekBusy=true; S.cekMsg=""; S.cekHata=false; render();

  var KOK="https://www.thesportsdb.com/api/v1/json/123/eventsround.php?id=4339&r="+hafta;
  var HEDEF="2026-2027";
  var denemeler=[
    {s:HEDEF,                 url:KOK+"&s=2026-2027"},
    {s:"2025-2026",           url:KOK+"&s=2025-2026"},
    {s:"sezon belirtilmemiş", url:KOK}
  ];
  function dene(i){
    if(i>=denemeler.length){
      S.cekBusy=false;
      S.cekMsg="Çekilemedi. Kaynak bu lig/sezon için boş döndü ya da bu cihazdan ulaşılamıyor; haftayı elle yapıştırabilirsin.";
      S.cekHata=true; render(); return;
    }
    fetch(denemeler[i].url).then(function(r){
      if(!r.ok) throw new Error("sunucu "+r.status+" döndü");
      return r.json();
    }).then(function(data){
      var olaylar=(data&&data.events)||[];
      if(!olaylar.length){ dene(i+1); return; }
      S.cekBusy=false;
      var satirlar=[], eslesmeyen=[], skorsuz=0;
      olaylar.forEach(function(e){
        var hg=e.intHomeScore, ag=e.intAwayScore;
        if(hg===null||hg===undefined||ag===null||ag===undefined||hg===""||ag===""){ skorsuz++; return; }
        var H=nearestTeam(e.strHomeTeam), A=nearestTeam(e.strAwayTeam);
        if(!H||!A){ eslesmeyen.push((H?"":e.strHomeTeam+" ")+(A?"":e.strAwayTeam)); return; }
        satirlar.push({home:H,away:A,hg:parseInt(hg,10)||0,ag:parseInt(ag,10)||0,ref:"",week:String(hafta)});
      });
      var kutu=document.getElementById("pasteIn");
      if(kutu) kutu.value = satirlar.length ? JSON.stringify(satirlar,null,1) : "";
      var yanlisSezon=(denemeler[i].s!==HEDEF);
      var parts=[];
      if(yanlisSezon) parts.push("DİKKAT: "+HEDEF+" sezonu boş döndü, bu veri "+denemeler[i].s+" kaynağından geliyor — kaydetmeden önce her satırı doğrula");
      if(satirlar.length) parts.push(satirlar.length+" maç bulundu, hakem alanlarını doldurup \"Maçları ekle\"ye basmadan önce gözden geçir");
      if(skorsuz) parts.push(skorsuz+" maç henüz oynanmamış");
      if(eslesmeyen.length) parts.push("tanınmayan takım: "+eslesmeyen.join(", "));
      S.cekMsg = parts.length ? parts.join(". ")+"." : "Bu haftadan kullanılabilir maç çıkmadı.";
      S.cekHata = !satirlar.length || yanlisSezon;
      render();
    }).catch(function(){ dene(i+1); });
  }
  dene(0);
}

function nearestTeam(name){
  if(!name) return null;
  var n=norm(name); if(!n) return null;
  for(var i=0;i<S.teams.length;i++){ if(norm(S.teams[i])===n) return S.teams[i]; }
  for(var j=0;j<S.teams.length;j++){
    var u=norm(S.teams[j]);
    if(u.indexOf(n)>=0||n.indexOf(u)>=0) return S.teams[j];
  }
  return null;
}
function isDup(home,away,week){
  var w=String(week||"").trim();
  return S.matches.some(function(m){
    return m.home===home && m.away===away && String(m.week||"").trim()===w;
  });
}
function pasteWeek(){
  if(MISAFIR) return;
  var el=document.getElementById("pasteIn"); var raw=(el.value||"").trim();
  if(!raw){ S.msg="Önce veriyi yapıştır."; render(); return; }
  var arr;
  try{
    var a=raw.indexOf("["), z=raw.lastIndexOf("]");
    arr=JSON.parse(a>=0?raw.slice(a,z+1):raw);
    if(!Array.isArray(arr)) arr=[arr];
  }catch(e){ S.msg="Yapıştırdığın metin okunamadı. Köşeli parantezle başlayıp biten liste olmalı."; render(); return; }
  var eklendi=0, mukerrer=0, sorunlu=[];
  arr.forEach(function(x,i){
    var H=nearestTeam(x.home), A=nearestTeam(x.away);
    if(!H||!A){ sorunlu.push((!H?x.home:x.away)); return; }
    if(H===A){ sorunlu.push(String(x.home)+' — iki taraf aynı takım'); return; }
    var wk=String(x.week||"").trim();
    if(isDup(H,A,wk)){ mukerrer++; return; }
    S.matches.push({id:Date.now()+i,week:wk,home:H,away:A,
      hg:Number(x.hg)||0,ag:Number(x.ag)||0,ref:(x.ref||"").trim(),decisions:[],by:S.me,upd:Date.now()});
    eklendi++;
  });
  el.value="";
  var parts=[];
  if(eklendi) parts.push(eklendi+" maç eklendi");
  if(mukerrer) parts.push(mukerrer+" tanesi zaten kayıtlıydı");
  if(sorunlu.length) parts.push("tanınmayan takım: "+sorunlu.join(", "));
  S.msg = parts.length ? parts.join(", ")+"." : "Eklenecek maç bulunamadı.";
  if(eklendi){ save(); S.tab="matches"; }
  render();
}


/* ---------------- Render ---------------- */
function render(){
  var y=window.scrollY||0;
  var tabEl=document.getElementById("tabs");
  var tabX=tabEl?tabEl.scrollLeft:0;
  var ae=document.activeElement;
  var fid=ae&&ae.id;
  var fpos=(ae && typeof ae.selectionStart==="number")?ae.selectionStart:null;
  var app=document.getElementById("app");
  if(!S.me && !MISAFIR){ app.innerHTML=vGate(); return; }
  if(MISAFIR && ["add","teams"].indexOf(S.tab)>=0) S.tab="table";
  if(S.tab==="duduk") S.tab="table";
  var body = S.tab==="table"?vTable(): S.tab==="add"?vAdd():
             S.tab==="big4"?vBig4(): S.tab==="matches"?vMatches(): S.tab==="refs"?vRefs():
             S.tab==="method"?vKurallar(): vTeams();
  var karar=0, maxHafta=0;
  S.matches.forEach(function(m){
    karar+=(m.decisions||[]).length;
    var w=parseInt(m.week,10); if(isFinite(w)&&w>maxHafta) maxHafta=w;
  });
  app.innerHTML='<div class="wrap"><header class="head"><svg class="pitch-svg" viewBox="0 0 120 80" fill="none" aria-hidden="true"><rect x="4" y="4" width="112" height="72" rx="2" stroke="currentColor" stroke-width="1.4"/><line x1="60" y1="4" x2="60" y2="76" stroke="currentColor" stroke-width="1.2"/><circle cx="60" cy="40" r="12" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="22" width="18" height="36" stroke="currentColor" stroke-width="1.2"/><rect x="98" y="22" width="18" height="36" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="30" width="8" height="20" stroke="currentColor" stroke-width="1.1"/><rect x="108" y="30" width="8" height="20" stroke="currentColor" stroke-width="1.1"/><circle cx="60" cy="40" r="1.4" fill="currentColor"/></svg>'
   +'<div class="lockup"><svg class="mark" width="52" height="52" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0B1210"/><rect x="2.5" y="2.5" width="27" height="27" rx="6.5" stroke="#126B45" stroke-width="1" opacity=".55"/><line x1="16" y1="3" x2="16" y2="29" stroke="#126B45" stroke-width=".7" opacity=".45"/><circle cx="16" cy="16" r="4.2" stroke="#126B45" stroke-width=".7" opacity=".45"/><rect x="4.5" y="13.2" width="14.5" height="5.6" rx="1.8" fill="#E8B62C"/><circle cx="20.2" cy="16" r="5.4" fill="#E8B62C"/><rect x="6" y="14.6" width="2.1" height="2.8" rx=".5" fill="#0B1210"/><circle cx="20.6" cy="16" r="1.85" fill="#0B1210"/></svg><div><h1>Düdük <span>Payı.</span></h1>'
   +'<p class="season"><em>2026–27</em> Süper Lig</p></div></div>'
   +'<p class="sub">Hakem kararları düzeltilseydi puan tablosu ne olurdu?</p>'
   +'<div class="kpis"><div class="kpi"><b>'+S.matches.length+'</b><span>maç</span></div>'
   +'<div class="kpi"><b>'+karar+'</b><span>karar</span></div>'
   +'<div class="kpi"><b>'+(maxHafta?maxHafta+".hf":"—")+'</b><span>hafta</span></div></div>'
   +'<div class="who">'
   +(MISAFIR
      ? '<span class="misafir">Misafir görünümü</span>'
        +'<button class="temabtn" onclick="temaDegis()">'+temaEtiket()+'</button>'
