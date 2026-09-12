   +'Karar için <b>geçlik = dakika / 90</b> (0…1). Kesinliği p ise: skorun ±1 değişme ihtimali <b>p × geçlik</b>, kalan <b>p × (1 − geçlik)</b> kalan süreye gol beklentisi olarak eklenir. '
   +'20′ ve 89′ aynı maçtaysa 20′ neredeyse tamamen olasılık, 89′ neredeyse tamamen skor düzeltmesi olur; biri diğerini “geç” yapmaz.</p>'
   +'<p class="note"><b>Erken hata maçı silmez.</b> Oynanmış skor yerinde durur; yalnızca kalan süreye ek gol beklentisi biner. Maç 90 dakika baştan kurulmaz.</p>'
   +'<p class="note"><b>Sonucu bilinen olaylar tam gol sayılır.</b> Golle biten yanlış penaltı ya da sayılan ofsaytlı gol geri alınırken 1 tam gol düşülür.</p>'
   +'<p class="note"><b>Kaçan yanlış penaltı kayda geçmez.</b> “Rakibe yanlış verilen penaltı (gol oldu)” yalnız top filelere gittiyse seçilir. Kurtarıldıysa ya da dışarı gittiyse skor zaten değişmemiştir; bu türe yazılmaz.</p>'
   +'<p class="note"><b>Sonucu bilinmeyen olaylar olasılıkla sayılır.</b> Verilmeyen penaltı 0,76 gol değerindedir. Kırmızı kartın etkisi kalan süreye yayılır: mağdur takımın gol beklentisi artar, on kişi kalan rakibin gol beklentisi düşer. İki yön ayrı katsayılarla işlenir (0,65 ve 0,35). 90. dakikada kırmızının etkisi sıfırdır.</p>'
   +'<p class="note"><b>Kesinlik yüzdesi ağırlık verir.</b> Aynı sayı hem “bu bir hataydı” inancını hem “düzeltme gerçekleşirdi” ihtimalini taşır. Bantın dar ucu yalnız %75+ kararları sayar; geniş uç kesinlik+20 ile tavanlanır. Hızlı giriş: %95 / %80 / %60.</p>'
   +'<p class="note"><b>Aynı karar iki kez yazılmaz.</b> Geç pay skor düzeltmesi olduysa o dünyada erken xG eklenmez. Taban gol beklentisi ev 1,45 / deplasman 1,20, kalan süre kesriyle çarpılır.</p></div>';

  h+='<div class="card"><span class="lbl">Puan sınırı</span>'
   +'<p class="note" style="margin-top:0">Futbolda bir maçtan en fazla 3, en az 0 puan alınır ve düzeltme bu sınırı aşamaz. '
   +'Zaten kazanmış bir takımın lehine ekleyecek, zaten kaybetmiş bir takımın aleyhine düşecek puan yoktur.</p>'
   +'<p class="note">Böyle bir hata tabloyu değiştirmez ama kayboldu sayılmaz: takıma dokununca açılan dökümde ve '
   +'hakemin karnesinde <b style="color:var(--amber)">sonuca yansımadı</b> notuyla görünür. '
   +'Hakemin siciline işler, sıralamaya karışmaz.</p></div>';

  h+='<div class="card"><span class="lbl">Tabloları okuma</span>'
   +'<p class="note" style="margin-top:0"><b>Tablo.</b> <span style="color:var(--green)">Yeşil</span> kararlar yüzünden puan kaybetmiş, düzeltilince kazanıyor. <span style="color:var(--red)">Kırmızı</span> kararlardan puan kazanmış. ▲▼ gerçek sıralamaya göre yer değişimi. Bir takıma dokununca sayısının hangi maçlardan geldiği açılır.</p>'
   +'<p class="note"><b>Sapma çubuğu.</b> Kararların kesinliği en dar ve en geniş yorumlandığında puanın nereye kadar gidebileceğini gösterir. Bant genişse sonuç tartışmalıdır.</p>'
   +'<p class="note"><b>Sıra.</b> TFF: puan → ikili seri bitmişse kendi araları → genel averaj → atılan gol. Düzeltilmiş tabloda averaj beklenen gol kaymasını içerir.</p>'
   +'<p class="note"><b>Dört Büyük.</b> Bu dördü birbiriyle oynarken birinin kazandığı puan diğerinden çıkar, toplamları sıfıra yakındır. Anlamlı olan, dört büyüğün <b>ligin geri kalanına karşı</b> aldığı denge.</p>'
   +'<p class="note"><b>Hakemler.</b> Leh: rakibi mağdur eden karar sayısı. Aleyh: kendisinin mağdur olduğu. <span style="color:var(--amber)">◦</span> işaretli sayı puana dönüşemeyen mağduriyettir. Bir hakemin birkaç maçta çıkan farkı tesadüftür; örüntüden söz etmek için en az 8-10 maç ve iki yönlü kayıt gerekir.</p></div>';

  h+='<div class="card"><span class="lbl">Karar türleri</span>';
  TYPES.forEach(function(t){
    h+='<div class="trow" style="grid-template-columns:minmax(0,1fr) auto"><div class="team" style="font-size:13.5px">'+esc(t.label)+'</div>'
     +'<div class="pts" style="font-size:12px;color:var(--muted)">'+(t.id.indexOf("red")===0?'süreye bağlı':(t.id==="pen_not"?'0,76 gol':'1 gol'))+'</div></div>';
  });
  h+='<p class="note">Her karar <b>mağdur taraf</b> üzerinden girilir: iki takımdan hangisi haksızlığa uğradıysa o seçilir. Aynı maçta iki takım için de karar girilebilir.</p>'
   +'<p class="note">Karar girilmezse maç tabloya etkisiz kaydedilir. Bu normaldir; maçların çoğunda tartışmalı karar yoktur.</p></div>';

  return h;
}

function vTeams(){
  var h='<div class="card"><span class="lbl">Takımlar ('+S.teams.length+')</span><div style="margin-bottom:12px">';
  S.teams.forEach(function(t){ h+='<span class="tag">'+esc(t)+'</span>'; });
  h+='</div><p class="note" style="margin:0">2026-27 Süper Lig kadrosu. Sezon içinde değişmez.</p></div>';

  h+='<div class="card"><span class="lbl">Ortak defter</span>';
  if(S.binId){
    h+='<p class="note" style="margin:0 0 10px">Bağlı depo kodu: <b>'+esc(S.binId)+'</b> — bu kodu girenler aynı defteri görür.</p>'
     +'<div class="btnrow"><button class="btn ghost" onclick="refresh()">Şimdi eşitle</button>'
     +'<button class="btn danger" onclick="disconnectBin()">Bağlantıyı kes</button></div>';
  } else {
    h+='<p class="note" style="margin:0 0 10px">Beşinizin aynı veriyi görmesi için ücretsiz bir ortak depo bağlayın. Kurulum bir kez, bir kişi tarafından yapılır:</p>'
     +'<details style="margin-bottom:10px"><summary>Nasıl kurulur</summary><p class="note">1. npoint.io aç → “Create JSON bin”.<br>2. Kutudakileri silip <b>{}</b> yaz, kaydet.<br>3. Adresteki koda bak: npoint.io/docs/<b>KOD</b>.<br>4. Kodu aşağıya yapıştır ve gruba gönder.</p></details>'
     +'<div class="row"><input id="binIn" placeholder="Depo kodu" value="">'
     +'<button class="btn" style="flex:0 0 auto" onclick="connectBin()">Bağlan</button></div>';
  }
  h+='</div><div class="card"><span class="lbl">Yedekleme</span><div class="btnrow">'
   +'<button class="btn ghost" onclick="exportData()">Dışa aktar</button>'
   +'<button class="btn ghost" onclick="document.getElementById(\'impFile\').click()">İçe aktar</button>'
   +'<input type="file" id="impFile" accept=".json" style="display:none" onchange="importData(this)"></div>'
   +'<p class="note">Dışa aktar tüm veriyi .json olarak indirir. İçe aktar mevcut verinin yerine geçer ve bu ortak defteri beşiniz için birden değiştirir — kullanmadan önce haber ver.</p></div>'
   +'<div class="card"><span class="lbl">Çakışma</span>'
   +'<p class="note" style="margin-top:0">Kayıt etmeden önce ortak defter çekilir ve birleştirilir. <b>Farklı maçlar</b> yan yana durur. <b>Aynı maçta</b> iki kişi karar eklediyse ikisi de kalır. Bir karar silinirse mezartaşı düşer, geri gelmez. Skor, hafta ve hakem alanında son kaydeden kazanır. Silinen maç 90 gün mezartaşında tutulur.</p></div>'
   +'<div class="card"><span class="lbl">Misafir adresi</span>'
   +'<p class="note" style="margin-top:0">npoint kutu kodu sayfa kaynağında durur; bunu bilen biri deftere yazabilir. Misafir linkini herkese açık paylaşma. Defteri kasten bozmak mümkün — npoint kilidi yok.</p></div>';
  return h;
}


/* ---------------- Hızlı karar girişi ---------------- */
function quickPanel(m){
  var q=S.quick;
  var h='<div class="qpanel">';
  var chips=[];
  if(q.type) chips.push(typeOf(q.type).label);
  if(q.harmed) chips.push("Mağdur: "+(q.harmed==="home"?m.home:m.away));
  if(q.certainty) chips.push("%"+q.certainty);
  if(chips.length) h+='<div class="qchips">'+chips.map(function(c){return '<span class="qchip">'+esc(c)+'</span>';}).join('')+'</div>';

  if(!q.type){
    h+='<p class="qstep">Ne oldu?</p><div class="qgrid">'
     +TYPES.map(function(t){return '<button class="qbtn" onclick="quickSet(\'type\',\''+t.id+'\')">'+t.label+'</button>';}).join('')
     +'</div>';
  } else if(!q.harmed){
    h+='<p class="qstep">Kim mağdur oldu?</p><div class="qgrid">'
     +'<button class="qbtn" onclick="quickSet(\'harmed\',\'home\')">'+esc(m.home)+'</button>'
     +'<button class="qbtn" onclick="quickSet(\'harmed\',\'away\')">'+esc(m.away)+'</button></div>';
  } else if(!q.certainty){
    h+='<p class="qstep">Ne kadar net bir hata?</p><div class="qgrid">'
     +'<button class="qbtn" onclick="quickSet(\'certainty\',95)">Kesin hata<br><span style="font-size:12px;color:var(--muted)">tartışmasız</span></button>'
     +'<button class="qbtn" onclick="quickSet(\'certainty\',80)">Muhtemel hata<br><span style="font-size:12px;color:var(--muted)">%75 eşiğinin üstü</span></button>'
     +'<button class="qbtn" onclick="quickSet(\'certainty\',60)">Tartışmalı<br><span style="font-size:12px;color:var(--muted)">yorum farkı</span></button></div>';
  } else if(!q.minute){
    h+='<p class="qstep">Kaçıncı dakikada?</p>'
     +'<div class="qmin">'
     +[10,25,45,60,75,85,90].map(function(x){
        return '<button class="qbtn" onclick="quickSet(\'minute\','+x+')">'+x+"′</button>";
       }).join('')
     +'<button class="qbtn" onclick="quickSet(\'minute\',93)">90+3</button>'
     +'<button class="qbtn" onclick="quickSet(\'minute\',97)">90+7</button>'
     +'</div>'
     +'<div class="qelle">'
     +'<input id="qdk" type="number" inputmode="numeric" min="1" max="120" placeholder="ya da yaz (1-120)">'
     +'<button class="btn" onclick="quickDakika()">Tamam</button>'
     +'</div>'
     +'<input id="qnot" type="text" maxlength="120" placeholder="Not (isteğe bağlı) — ör. VAR incelemedi" style="width:100%;margin-top:9px">';
  }
  h+='<div class="btnrow"><button class="btn ghost" style="padding:8px 14px;font-size:13px" onclick="quickCancel()">Vazgeç</button></div></div>';
  return h;
}
function quickStart(id){
  if(MISAFIR) return; S.quick={id:id,type:"",harmed:"",certainty:0,minute:0}; render(); }
function quickDakika(){
  if(MISAFIR) return;
  var el=document.getElementById("qdk");
  var v=parseInt(el&&el.value,10);
  if(!isFinite(v)||v<1||v>120){ S.msg="Dakika 1 ile 120 arasında olmalı."; render(); return; }
  quickSet("minute", v);
}
function quickCancel(){
  if(MISAFIR) return; S.quick=null; render(); }
function quickSet(k,v){
  if(MISAFIR) return;
  var q=S.quick; q[k]=v;
  if(q.type&&q.harmed&&q.certainty&&q.minute) quickCommit();
  else render();
}
function quickCommit(){
  var q=S.quick;
  var m=S.matches.filter(function(x){return x.id===q.id;})[0];
  if(!m){ S.quick=null; render(); return; }
  if(!m.decisions) m.decisions=[];
  var nt=document.getElementById("qnot");
  m.decisions.push({kid:yeniKid(),type:q.type,harmed:q.harmed,minute:q.minute||45,certainty:q.certainty,
                    note:(nt&&nt.value||"").slice(0,120),by:S.me});
  m.upd=Date.now();
  S.quick=null; save(); render();
}

/* ---------------- Eylemler ---------------- */
function setD(k,v){ S.draft[k]=v; render(); }
function setDQ(k,v){ S.draft[k]=v; }
function setGoal(k,el){
  var raw=(el.value||"").replace(/^0+(?=\d)/,"");
  if(raw!==el.value) el.value=raw;
  S.draft[k]= raw==="" ? "" : Math.max(0,Math.min(20,parseInt(raw,10)||0));
  var hg=+S.draft.hg||0, ag=+S.draft.ag||0;
  var w=document.getElementById("goalWarn");
  if(w) w.innerHTML=(hg>6||ag>6)
    ? '<div class="warn" style="margin:0 0 10px">'+hg+'-'+ag+' girdin \u2014 emin misin? Bu skor Süper Lig\'de çok nadirdir.</div>' : "";
}
function addDec(){
  if(MISAFIR) return; S.draft.decs.push({kid:yeniKid(),type:"pen_not",harmed:"home",minute:45,certainty:80,note:"",by:S.me}); render(); }
function setDec(i,k,v){
  if(MISAFIR) return; S.draft.decs[i][k]=v; S.draft.decs[i].by=S.me; render(); }
function setDecQ(i,k,v){ S.draft.decs[i][k]=v; S.draft.decs[i].by=S.me; }
function delDec(i){
  if(MISAFIR) return; S.draft.decs.splice(i,1); render(); }
function findDupes(home,away,week,skipId){
  var w=String(week||"").trim();
  return S.matches.filter(function(m){
    return m.id!==skipId && m.home===home && m.away===away && String(m.week||"").trim()===w;
  });
}
function saveMatch(){
  if(MISAFIR) return;
  var d=S.draft;
  if(d.home===d.away){ S.msg="Ev sahibi ve deplasman aynı takım olamaz."; render(); return; }
  if(!S.teams.length||S.teams.indexOf(d.home)<0||S.teams.indexOf(d.away)<0){
    S.msg="Takımlardan biri listede yok."; render(); return; }
