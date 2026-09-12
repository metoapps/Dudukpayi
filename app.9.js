      : '<span>Defteri tutan: <b>'+esc(S.me)+'</b></span>'
        +'<button onclick="switchMe()">değiştir</button>'
        +'<button class="temabtn" onclick="temaDegis()">'+temaEtiket()+'</button>'
        +'<span class="by">'+(S.sync==="ortak"?'● ortak defter':S.sync==="hata"?'● bağlantı hatası':S.sync==="…"?'●':'● yalnız bu cihaz')+'</span>')
   +'</div></header>'
   +(S.ornek&&!MISAFIR&&!binUrl()?'<div class="warn">Örnek sezon — ortak deftere yazılmaz. Ayarlar’dan npoint kodunu yapıştırınca gerçek deftere geçersin.</div>':'')
   +(S.msg?'<div class="'+(/eklendi|kayıtlıydı|Bağlandı|yüklendi|kopyalandı|birleştirildi/.test(S.msg)?'ok':'warn')+'" role="status" aria-live="polite">'+esc(S.msg)+'</div>':'')
   +'<div class="tabwrap" id="tabwrap"><span class="tabok l">‹</span><span class="tabok r">›</span>'
   +'<nav class="tabs" id="tabs" onscroll="tabGolge()">'+TABS.map(function(t){
      return '<button class="tab'+(S.tab===t[0]?' on':'')+'" onclick="go(\''+t[0]+'\')">'+(ICO[t[0]]||'')+t[1]+'</button>';
    }).join('')+'</nav></div><main>'+body+'</main></div>';
  tabGolge(); tabOrtala();
  var n2=document.getElementById("tabs"); if(n2) n2.scrollLeft=tabX;
  window.scrollTo(0,y);
  if(fid){
    var el=document.getElementById(fid);
    if(el){ el.focus(); if(fpos!=null && el.setSelectionRange) try{ el.setSelectionRange(fpos,fpos); }catch(e){} }
  }
}
function tabGolge(){
  var n=document.getElementById("tabs"), w=document.getElementById("tabwrap");
  if(!n||!w) return;
  var kacak=n.scrollWidth-n.clientWidth;
  if(kacak<6){ w.className="tabwrap"; return; }
  var c="tabwrap";
  if(n.scrollLeft>4) c+=" sol";
  if(n.scrollLeft<kacak-4) c+=" sag";
  w.className=c;
}
/* Seçili sekme görünür değilse ortala */
function tabOrtala(){
  var n=document.getElementById("tabs"); if(!n) return;
  var a=n.querySelector(".tab.on"); if(!a) return;
  var sol=a.offsetLeft, sag=sol+a.offsetWidth;
  if(sol<n.scrollLeft || sag>n.scrollLeft+n.clientWidth)
    n.scrollLeft=sol-(n.clientWidth-a.offsetWidth)/2;
  tabGolge();
}
/* ---- Tema ----
   S.tema: "acik" | "koyu" | null (null = sistem ayarına uy) */
function temaOku(){ return lsGet("dp-tema")||null; }
function temaUygula(){
  /* Açılış yolunda çalışır; burada bir hata tüm uygulamayı düşürür. */
  try{
    var t=S.tema;
    var h=document.documentElement;
    if(h){ if(t) h.setAttribute("data-tema",t); else h.removeAttribute("data-tema"); }
    var koyu = t==="koyu" ||
      (!t && window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches);
    var mt=document.querySelector?document.querySelector('meta[name="theme-color"]'):null;
    if(mt) mt.setAttribute("content", koyu?"#0B1210":"#EFF2EC");
  }catch(e){}
}
function temaDegis(){
  /* sıra: sistem -> açık -> koyu -> sistem */
  S.tema = S.tema===null ? "acik" : S.tema==="acik" ? "koyu" : null;
  if(S.tema) lsSet("dp-tema",S.tema); else lsDel("dp-tema");
  temaUygula(); render();
}
function temaEtiket(){
  return S.tema===null ? "Tema: sistem" : S.tema==="acik" ? "Tema: açık" : "Tema: koyu";
}

function switchMe(){ S.me=null; render(); }
function go(t){
  if(MISAFIR && ["add","teams"].indexOf(t)>=0) return;
  if(t==="duduk") t="table";
  S.tab=t; S.msg=""; render();
}
boot();
