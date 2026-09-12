function kararEtkisi(m, i){
  var hepsi=(m.decisions||[]);
  var tam=matchImpact(m);
  var eksik=matchImpact({home:m.home,away:m.away,hg:m.hg,ag:m.ag,
    decisions:hepsi.filter(function(_,k){return k!==i;})});
  var r=realPts(m.hg,m.ag);
  function kirpik(im,taraf){
    var ham=(taraf==="home"?im.mid.home:im.mid.away);
    var gercek=(taraf==="home"?r[0]:r[1]);
    return Math.max(0,Math.min(3,gercek+ham));
  }
  return { home: kirpik(tam,"home")-kirpik(eksik,"home"),
           away: kirpik(tam,"away")-kirpik(eksik,"away") };
}

/* Sezonun skora en çok etki eden kararları */
function enEtkiliKararlar(limit){
  var liste=[];
  S.matches.forEach(function(m){
    (m.decisions||[]).forEach(function(d,i){
      var e=kararEtkisi(m,i);
      /* Bir karar puanı iki taraf arasında kaydırır; ölçü toplam etkilenen puandır */
      var buyuk=Math.abs(e.home)+Math.abs(e.away);
      if(buyuk<0.005) return;
      var magdur=(d.harmed==="home")?m.home:m.away;
      liste.push({ mac:m, karar:d, magdur:magdur,
        rakip:(d.harmed==="home")?m.away:m.home,
        deger:buyuk, magdurKazanc:(d.harmed==="home")?e.home:e.away });
    });
  });
  liste.sort(function(a,b){return b.deger-a.deger;});
  return limit?liste.slice(0,limit):liste;
}

function vEtkili(){
  var liste=enEtkiliKararlar(10);
  if(!liste.length) return '';
  var acik=!!S.acikEtkili;
  var h='<div class="card"><div class="hafta-bas" role="button" tabindex="0" onclick="S.acikEtkili=!S.acikEtkili;render()">'
   +'<span class="hafta-ok'+(acik?' acik':'')+'">▾</span>'
   +'<span class="hafta-ad">Maç skorunu en çok değiştiren 10 karar</span>'
   +'<span class="hafta-sayi">'+liste.length+'</span></div>';
  if(!acik) return h+'</div>';
  liste.forEach(function(x,i){
    var d=x.karar;
    h+='<div class="ekar">'
     +'<div class="esira">'+(i+1)+'</div>'
     +'<div class="egovde">'
     +'<div class="ebas">'+esc(typeOf(d.type).label)+'</div>'
     +'<div class="emeta">'+esc(x.mac.home)+' '+x.mac.hg+'-'+x.mac.ag+' '+esc(x.mac.away)
     +' · '+esc(d.minute)+'′ · %'+esc(d.certainty)
     +(x.mac.ref?' · '+esc(x.mac.ref):'')+'</div>'
     +'<div class="emag">mağdur: <b>'+esc(x.magdur)+'</b> '
     +'<span style="color:var(--green)">'+(x.magdurKazanc>=0?'+':'')+x.magdurKazanc.toFixed(2)+'</span>'
     +' · '+esc(x.rakip)+' <span style="color:var(--red)">'+(x.deger-Math.abs(x.magdurKazanc)>0.005
        ? '−'+(x.deger-Math.abs(x.magdurKazanc)).toFixed(2) : '0.00')+'</span></div>'
     +'</div>'
     +'<div class="edeger">'+x.deger.toFixed(2)+'</div>'
     +'</div>';
  });
  h+='<p class="note">Sağdaki sayı, o karar hiç yaşanmasaydı iki takım arasında oynayacak <b>toplam puandır</b>. '
   +'Altta mağdurun kazancı ve rakibin kaybı ayrı ayrı yazılıdır. '
   +'Kararlar birbirini etkilediği için tek tek katkıların toplamı maçın toplam etkisine birebir eşit olmayabilir.</p>'
   +'<div class="btnrow"><button class="btn ghost" onclick="etkiliKopyala()">Listeyi kopyala</button></div></div>';
  return h;
}

function etkiliKopyala(){
  var liste=enEtkiliKararlar(10);
  if(!liste.length){ S.msg="Kopyalanacak karar yok."; render(); return; }
  var metin='Düdük Payı — bu sezon maç skorunu en çok değiştiren kararlar\n\n'
   + liste.map(function(x,i){
      return (i+1)+'. '+typeOf(x.karar.type).label+' — '+x.magdur
        +' ('+x.mac.home+' '+x.mac.hg+'-'+x.mac.ag+' '+x.mac.away+', '+x.karar.minute+"′"
        +(x.mac.ref?', '+x.mac.ref:'')+') '
        +x.deger.toFixed(2)+' puan etki (mağdur '+(x.magdurKazanc>=0?'+':'')+x.magdurKazanc.toFixed(2)+')';
     }).join('\n');
  panoYaz(metin, 'Liste panoya kopyalandı.', 'Kopyalanamadı.');
}

function takimAc(ad){ S.acikTakim = (S.acikTakim===ad?null:ad); render(); }

/* Bir takımın sayısı hangi maçlardan geliyor */
function takimDetay(ad){
  var satir=[];
  S.matches.forEach(function(m){
    if(m.home!==ad && m.away!==ad) return;
    var evde=(m.home===ad), rakip=evde?m.away:m.home;
    var im=matchImpact(m);
    var etki=evde?im.mid.home:im.mid.away;
    var bosa=evde?im.mid.bosaHome:im.mid.bosaAway;
    var fazla=evde?im.mid.fazlaHome:im.mid.fazlaAway;
    var kararlar=(m.decisions||[]).map(function(d){
      var lehte = (d.harmed==="home")===evde;
      return {metin:typeOf(d.type).label+' · '+d.minute+"′ · %"+d.certainty, lehte:lehte};
    });
    satir.push({rakip:rakip, evde:evde, skor:(evde?m.hg+'-'+m.ag:m.ag+'-'+m.hg),
      hafta:m.week, hakem:m.ref, etki:etki, bosa:bosa, fazla:fazla, kararlar:kararlar});
  });
  if(!satir.length) return '<div class="detay"><p class="note" style="margin:0">Bu takımın kayıtlı maçı yok.</p></div>';
  var h='<div class="detay">';
  satir.forEach(function(x){
    var etkili = Math.abs(x.etki)>0.005 || x.bosa>0.05 || x.fazla>0.05;
    h+='<div class="dsatir"><div class="dust">'
     +'<span class="dwho">'+(x.evde?'':'<span class="vs">@</span>')+tdot(x.rakip)+esc(x.rakip)+' <b class="dskor">'+x.skor+'</b></span>'
     +'<span class="'+(x.etki>=0?'dup':'ddown')+'">'+(etkili?(x.etki>=0?'+':'')+x.etki.toFixed(2):'—')+'</span></div>'
     +'<div class="dmeta">'+(x.hafta?esc(x.hafta)+'. hafta · ':'')+esc(x.hakem||'hakem girilmedi')
     +(x.bosa>0.05?' · <span style="color:var(--amber)" title="Kazanırken uğradığı, tabloya yansımayan hata">sonuca yansımadı (~'+x.bosa.toFixed(2)+')</span>':'')
     +(x.fazla>0.05?' · <span style="color:var(--red)" title="Kaybederken yararlandığı, tabloya yansımayan hata">sonuca yansımadı (−'+x.fazla.toFixed(2)+')</span>':'')
     +'</div>';
    x.kararlar.forEach(function(k){
      h+='<div class="dkarar"><span class="dnokta" style="background:'+(k.lehte?'var(--greenFill)':'var(--redFill)')+'"></span>'+esc(k.metin)+'</div>';
    });
    h+='</div>';
  });
  return h+'</div>';
}

/* Paylaşılabilir metin özeti */
function ozetKopyala(){
  var T=buildTable();
  var mac=S.matches.length, karar=0;
  S.matches.forEach(function(m){karar+=(m.decisions||[]).length;});
  var satir=T.adj.slice(0,8).map(function(r,i){
    var d=r.mid, ok=(r.realPos-r.adjPos);
    return (i+1)+'. '+r.name+' '+(r.pts+r.mid).toFixed(1)
      +(Math.abs(d)>=0.05?' ('+(d>0?'+':'')+d.toFixed(1)+')':'')
      +(ok!==0?' '+(ok>0?'▲':'▼')+Math.abs(ok):'');
  }).join('\n');
  var metin='Düdük Payı — hakem kararları düzeltilseydi puan tablosu\n'
    +mac+' maç, '+karar+' tartışmalı karar\n\n'+satir
    +'\n\nParantez içi: kararların puan etkisi. ▲▼ gerçek sıralamaya göre değişim.';
  panoYaz(metin, 'Özet panoya kopyalandı.', 'Kopyalanamadı. Metni elle seçip kopyalayabilirsin.');
}

function vTable(){
  if(!S.matches.length) return emptyPitch('Henüz maç yok.<br>“Maç ekle” sekmesinden haftayı çek ya da tek maç gir.');
  var T=buildTable(), maxAbs=1.5;
  T.adj.forEach(function(r){maxAbs=Math.max(maxAbs,Math.abs(r.mid),Math.abs(r.low),Math.abs(r.high));});
  var X=function(v){return 50+(v/maxAbs)*50;};
  var LIG_HAT={1:"Şampiyonlar Ligi",2:"ŞL ön eleme",3:"Avrupa Ligi",4:"Konferans Ligi",15:"Küme hattı"};

  var h='<div class="card"><span class="lbl">Düzeltilmiş sıralama</span>';
  h+='<p class="note" style="margin-top:0">Puan = gerçek puan + düdük payı. Yeşil: kararlar düzeltilseydi bu takıma eklenecek beklenen puan. Bant: dar (%75+) ile geniş (kesinlik+20) yorum.</p>';
  h+='<div class="legend"><span><i class="lg"></i>mağduriyet</span><span><i class="lr"></i>haksız kazanç</span></div>';
  h+='<div class="thead"><div class="pos">#</div><div>Takım</div><div class="pts">Puan</div><div class="ctr">Sapma</div><div class="pts">Fark</div></div><div class="tstack">';
  T.adj.forEach(function(r){
    var move=r.realPos-r.adjPos;
    var lo=Math.min(r.low,r.high), hi=Math.max(r.low,r.high);
    var bx1=X(lo), bx2=X(hi), w=Math.abs(X(r.mid)-50);
    var acik = S.acikTakim===r.name;
    var hat=LIG_HAT[r.adjPos];
    h+='<div class="trow trow-t'+(acik?' acik':'')+(hat?' ligciz':'')+'" data-takim="'+esc(r.name)+'" onclick="takimAc(this.getAttribute(\'data-takim\'))" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();takimAc(this.getAttribute(\'data-takim\'));}" role="button" tabindex="0">'
     +'<div class="pos rank'+(r.adjPos<=3?(' r'+r.adjPos):'')+'">'+r.adjPos+'</div>'+teamCell(r.name)
     +'<div class="pts">'+(r.pts+r.mid).toFixed(1)+'</div>'
     +'<div class="drift" title="'+lo.toFixed(1)+' … '+hi.toFixed(1)+' puan"><div class="axis"></div>'
     +((bx2-bx1)>0.8?'<div class="band" style="left:'+bx1+'%;width:'+(bx2-bx1)+'%"></div>':'')
     +'<div class="bar '+(r.mid>=0?'pos':'neg')+'" style="left:'+(r.mid>=0?50:50-w)+'%;width:'+w+'%"></div></div>'
     +'<div class="delta '+(r.mid>=0?'up':'down')+'">'+(r.mid>=0?'+':'')+r.mid.toFixed(1)
     +(move!==0?'<span class="mv">'+(move>0?'▲':'▼')+Math.abs(move)+'</span>':'')+'</div></div>';
    if(hat) h+='<div class="lignot">'+hat+'</div>';
    if(acik) h+=takimDetay(r.name);
  });
  h+='</div><div class="btnrow" style="margin-top:14px"><button class="btn ghost" onclick="ozetKopyala()">Özeti kopyala</button></div></div>';

  var dengesiz=T.real.filter(function(r){
    var leh=r.forC+r.forT, al=r.agC+r.agT;
    return r.p>=3 && ((al>0&&leh===0)||(leh>0&&al===0));
  });
  h+='<div class="card"><span class="lbl">Kayıt dengesi</span>'
   +'<p class="note" style="margin-top:0">Sapma, üstteki düdük payının aynısıdır. Leh/aleyh karar sayısıdır — renk puan anlamı taşımaz. Bir sütun boşsa kayıt eksiktir.</p>';
  if(dengesiz.length){
    h+='<div class="warn">Tek yönlü kayıt: '+dengesiz.map(function(r){return esc(r.name);}).join(', ')+'.</div>';
  }
  h+='<div class="thead" style="grid-template-columns:1fr 52px 44px 44px"><div>Takım</div><div class="pts">Sapma</div><div class="pts">Leh</div><div class="pts">Aleyh</div></div>';
  T.real.slice().sort(function(a,b){return b.mid-a.mid || b.agC-a.agC || a.name.localeCompare(b.name,'tr');}).forEach(function(r){
    var tek=(r.p>=3)&&((r.agC+r.agT)>0&&(r.forC+r.forT)===0||(r.forC+r.forT)>0&&(r.agC+r.agT)===0);
    var notlar=[];
    if(r.agT) notlar.push(r.agT+" tartışmalı aleyhte");
    if(r.forT) notlar.push(r.forT+" tartışmalı lehte");
    h+='<div class="trow" style="grid-template-columns:1fr 52px 44px 44px">'
     +'<div class="takimHucre">'+teamCell(r.name)
     +(notlar.length?'<span class="tartisma">'+notlar.join(" · ")+'</span>':'')
     +'</div>'
     +'<div class="delta '+(r.mid>=0?'up':'down')+'">'+(r.mid>=0?'+':'')+r.mid.toFixed(1)+'</div>'
     +'<div class="pts">'+r.forC+(r.forT?'<span style="color:var(--dim);font-size:11px">+'+r.forT+'</span>':'')+'</div>'
     +'<div class="pts" style="color:'+(tek?'var(--amber)':'var(--ink)')+'">'+r.agC+(r.agT?'<span style="color:var(--dim);font-size:11px">+'+r.agT+'</span>':'')+'</div></div>';
  });
  h+='</div>';

  var gcols='24px minmax(0,1fr) 30px 44px 40px 40px';
  h+='<div class="card"><span class="lbl">Gerçek sıralama</span>'
   +'<div class="thead" style="grid-template-columns:'+gcols+'"><div class="pos">#</div><div>Takım</div><div class="pts">O</div><div class="pts">A:Y</div><div class="pts">Av</div><div class="pts">P</div></div>';
  T.real.forEach(function(r){
    var hat=LIG_HAT[r.realPos];
    h+='<div class="trow'+(hat?' ligciz':'')+'" style="grid-template-columns:'+gcols+'"><div class="pos">'+r.realPos+'</div>'
     +teamCell(r.name)+'<div class="pts">'+r.p+'</div>'
     +'<div class="pts" style="color:var(--muted)">'+r.gf+':'+r.ga+'</div>'
     +'<div class="pts">'+((r.gf-r.ga)>0?'+':'')+(r.gf-r.ga)+'</div>'
     +'<div class="pts" style="color:var(--amber)">'+r.pts+'</div></div>';
    if(hat) h+='<div class="lignot">'+hat+'</div>';
  });
  h+='</div>';
  h+='<p class="note">Gerçek sıra TFF kuralıdır: puan, ikili seri bitmişse kendi araları, sonra genel averaj, sonra atılan gol. Averaj yalnız girilen skorlardan gelir. Düzeltilmiş tabloda eşitlik beklenen gol kaymasıyla bozulur.</p>';
  return h;
}

function vDuduk(){ return vTable(); }

function vAdd(){
  if(!S.draft) S.draft={home:S.teams[0],away:S.teams[1]||S.teams[0],hg:0,ag:0,ref:"",week:"",decs:[]};
  var d=S.draft, same=(d.home===d.away);
