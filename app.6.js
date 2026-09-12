    /* Kırpma yüzünden tabloya yazılamayan etki de hakemin siciline işler */
    var im0=matchImpact(m);
    H.yansimayan += (im0.mid.bosaHome||0)+(im0.mid.bosaAway||0)+(im0.mid.fazlaHome||0)+(im0.mid.fazlaAway||0);
    (m.decisions||[]).forEach(function(d,i){
      toplamKarar++; H.karar++;
      /* Hata hacmi: %100 kesin hata 1,0 sayılır, %60 tartışmalı olan 0,6.
         Sonuca etkisi olmasa bile hakemin siciline yazılır. */
      H.agirlik += Math.max(0,Math.min(100, d.certainty||0))/100;
      var e=kararEtkisi(m,i);
      var magdur=(d.harmed==="home")?m.home:m.away;
      var rakip=(d.harmed==="home")?m.away:m.home;
      var kazanan=(d.harmed==="home")?e.home:e.away;   /* mağdurun geri alacağı puan */
      var kaybeden=(d.harmed==="home")?e.away:e.home;  /* rakibin kaybedeceği puan */
      var buyuk=Math.abs(e.home)+Math.abs(e.away);

      tEnt(magdur).aleyhKarar++; tEnt(rakip).lehKarar++;
      H.lehteSayi[rakip]=(H.lehteSayi[rakip]||0)+1;
      if(buyuk>0.05){
        etkiliKarar++; H.etkili++; H.puan+=buyuk;
        tEnt(magdur).etkiliAleyh++; tEnt(rakip).etkiliLeh++;
        /* mağdurun kaybettiği = düzeltilince kazanacağı; rakibin haksız kazancı = düşecek puanı */
        tEnt(magdur).kayip += Math.max(0,kazanan);
        tEnt(rakip).kazanc += Math.max(0,-kaybeden);
        H.lehte[rakip]=(H.lehte[rakip]||0)+buyuk;
      }
    });
  });
  var tl=Object.keys(takim).map(function(k){return takim[k];})
    .filter(function(t){return t.kazanc>0.05||t.kayip>0.05||t.etkiliLeh||t.etkiliAleyh;})
    .sort(function(a,b){return (b.kazanc+b.kayip)-(a.kazanc+a.kayip);});
  var hl=Object.keys(hakem).map(function(k){return hakem[k];})
    .filter(function(h){return h.mac>0;})
    .map(function(h){
      h.macBasi = h.puan/h.mac;            /* maç başına puan etkisi */
      h.macBasiHata = h.agirlik/h.mac;     /* maç başına ağırlıklı hata */
      /* Taraflılık artık karar SAYISINA göre — sonuçsuz hatalar da sayılıyor */
      var v=Object.keys(h.lehteSayi).map(function(t){return h.lehteSayi[t];});
      var top=v.reduce(function(a,b){return a+b;},0);
      h.dengesizlik = top>0 ? Math.max.apply(null,v)/top : 0;
      h.enCokLehte = top>0 ? Object.keys(h.lehteSayi).sort(function(a,b){return h.lehteSayi[b]-h.lehteSayi[a];})[0] : null;
      return h;
    })
    .sort(function(a,b){
      return S.hakemSira==="etki" ? (b.macBasi-a.macBasi) : (b.macBasiHata-a.macBasiHata);
    });
  return {takimlar:tl, hakemler:hl, toplamKarar:toplamKarar, etkiliKarar:etkiliKarar};
}

function vEtkiOzet(){
  var d=etkiDokumu();
  if(!d.toplamKarar) return '';
  var h='<div class="card"><span class="lbl">Skora etki eden kararlar</span>'
   +'<p class="note" style="margin-top:0">Girilen <b>'+d.toplamKarar+'</b> kararın <b>'+d.etkiliKarar+'</b> tanesi puan tablosunu değiştirdi. '
   +'Kalanı kayda geçti ama sonucu etkilemedi — farkı kapatamayacak kadar geç ya da küçüktü.</p>';

  if(d.hakemler.length){
    var ASGARI=3;
    var etkiSira = S.hakemSira==="etki";
    var yeter=d.hakemler.filter(function(r){return r.mac>=ASGARI;});
    var az=d.hakemler.filter(function(r){return r.mac<ASGARI;});

    function satir(r,i){
      var pay=r.dengesizlik, enCok=r.enCokLehte;
      /* Sıralama ölçüsü vurgulu, diğeri soluk — hangi listeye baktığın belli olsun */
      return '<div class="ozet-sat">'
       +'<span class="ozet-no">'+(i+1)+'</span>'
       +'<span class="ozet-ad">'+esc(r.ad)
       +'<span class="ozet-alt">'+r.mac+' maç · '+r.karar+' karar'
       +(r.etkili?' ('+r.etkili+"'i skoru değiştirdi)":' (hiçbiri skoru değiştirmedi)')
       +(r.yansimayan>0.05?' · <span style="color:var(--amber)">'+r.yansimayan.toFixed(1)+' sonuca yansımadı</span>':'')
       +(enCok&&pay>0.7&&r.karar>=3?'<br><span style="color:var(--red)">kararlarının %'+Math.round(pay*100)+"'i tek takım lehine: "+esc(enCok)+'</span>'
         :(enCok?' · en çok <b>'+esc(enCok)+'</b> lehine':''))
       +'</span></span>'
       +'<span class="ozet-ik" style="grid-template-columns:52px 52px">'
       +'<i class="'+(etkiSira?'sol':'ana')+'">'+r.macBasiHata.toFixed(2)+'</i>'
       +'<i class="'+(etkiSira?'ana':'sol')+'">'+r.macBasi.toFixed(2)+'</i>'
       +'</span></div>';
    }

    h+='<div class="ozet-bas">Hakem karnesi</div>'
     +'<div class="siraSec">'
     +'<button class="'+(etkiSira?'':'on')+'" onclick="hakemSirala(\'hata\')">Hata sayısına göre</button>'
     +'<button class="'+(etkiSira?'on':'')+'" onclick="hakemSirala(\'etki\')">Puan etkisine göre</button>'
     +'</div>'
     +'<div class="ozet-sat ozet-kafa"><span class="ozet-no"></span><span class="ozet-ad">Hakem</span>'
     +'<span class="ozet-ik" style="grid-template-columns:52px 52px"><i>hata<br>/maç</i><i>puan<br>/maç</i></span></div>';

    if(yeter.length){
      yeter.forEach(function(r,i){ h+=satir(r,i); });
    } else {
      d.hakemler.forEach(function(r,i){ h+=satir(r,i); });
    }

    h+='<p class="note"><b>Hata/maç</b>: hakemin maç başına yaptığı hata sayısı, kesinlikle ağırlıklandırılmış. %100 kesin bir hata 1,0 sayılır, %60 tartışmalı olan 0,6. '
     +'<b>Sonuca etkisi olmasa bile sayılır</b> — 5-0 biten maçta yapılan on hata tabloyu değiştirmez ama hakemlik kalitesini gösterir.</p>'
     +'<p class="note"><b>Puan/maç</b>: o hataların puan tablosunu maç başına ne kadar değiştirdiği. Bu ikisi ayrı sorulardır; bir hakem çok hata yapıp tabloyu hiç değiştirmemiş olabilir, ya da tek bir hatayla bir maçın sonucunu çevirmiş olabilir.</p>'
     +(yeter.length?'':'<p class="note">En az '+ASGARI+' maç yöneten hakemler ayrı sıralanır; şu an hiçbiri bu sayıya ulaşmadı.</p>')
     +'<p class="note" style="color:var(--amber)">Listede altta olmak iyi hakemlik demek değildir; o hakemin maçlarında <b>kayda geçmiş hata olmaması</b> demektir. '
     +'Kimse o maçları izleyip karar girmediyse hakem tertemiz görünür. Bu tablo ancak kayıt eksiksizse anlamlıdır.</p>';

    if(yeter.length&&az.length){
      h+='<div class="ozet-bas" style="margin-top:16px">Henüz '+ASGARI+' maçı yok</div>';
      az.forEach(function(r){
        h+='<div class="ozet-sat"><span class="ozet-no"></span><span class="ozet-ad">'+esc(r.ad)
         +'<span class="ozet-alt">'+r.mac+' maç · '+r.karar+' karar</span></span>'
         +'<span class="ozet-ik" style="grid-template-columns:52px 52px"><i class="sol">'+r.macBasiHata.toFixed(2)+'</i><i class="sol">'+r.macBasi.toFixed(2)+'</i></span></div>';
      });
    }
  }

  if(d.takimlar.length){
    h+='<div class="ozet-bas" style="margin-top:18px">Takımlar — haksız kazanç ve mağduriyet</div>'
     +'<div class="ozet-sat ozet-kafa"><span class="ozet-no"></span><span class="ozet-ad">Takım</span>'
     +'<span class="ozet-ik"><i>kazanç</i><i>kayıp</i></span></div>';
    d.takimlar.forEach(function(t,i){
      h+='<div class="ozet-sat">'
       +'<span class="ozet-no">'+(i+1)+'</span>'
       +'<span class="ozet-ad">'+esc(t.ad)
       +'<span class="ozet-alt">'+t.etkiliLeh+' lehine · '+t.etkiliAleyh+' aleyhine etkili karar</span></span>'
       +'<span class="ozet-ik">'
       +'<i class="art">'+(t.kazanc>0.05?'+'+t.kazanc.toFixed(1):'—')+'</i>'
       +'<i class="eksi">'+(t.kayip>0.05?'−'+t.kayip.toFixed(1):'—')+'</i></span></div>';
    });
    h+='<p class="note"><b style="color:var(--red)">Kazanç</b>: kararlar düzeltilseydi bu takımdan düşecek puan. '
     +'<b style="color:var(--green)">Kayıp</b>: düzeltilseydi bu takıma eklenecek puan. '
     +'İkisi de doluysa takım hem kazanmış hem kaybetmiştir; tablodaki tek rakam bunların farkıdır.</p>';
  }
  return h+'</div>';
}

function vRefs(){
  var map={};
  S.matches.forEach(function(m){
    var name=(m.ref||"").trim()||"(hakem girilmedi)";
    if(!map[name])map[name]={name:name,games:0,decs:0,byTeam:{}};
    map[name].games++;
    var im=matchImpact(m);
    function ent(t){ if(!map[name].byTeam[t])map[name].byTeam[t]={f:0,a:0,pts:0,bosa:0,fazla:0}; return map[name].byTeam[t]; }
    (m.decisions||[]).forEach(function(x){
      map[name].decs++;
      ent(x.harmed==="home"?m.home:m.away).a++;
      ent(x.harmed==="home"?m.away:m.home).f++;
    });
    ent(m.home).pts+=im.mid.home; ent(m.away).pts+=im.mid.away;
    ent(m.home).bosa+=im.mid.bosaHome; ent(m.away).bosa+=im.mid.bosaAway;
    ent(m.home).fazla+=im.mid.fazlaHome; ent(m.away).fazla+=im.mid.fazlaAway;
  });
  Object.keys(map).forEach(function(k){
    var r=map[k], t=0;
    Object.keys(r.byTeam).forEach(function(tk){ t+=Math.abs(r.byTeam[tk].pts); });
    r.agirlik=t/2;
  });
  var refs=Object.keys(map).map(function(k){return map[k];})
    .sort(function(a,b){ return (b.agirlik-a.agirlik) || (b.decs-a.decs); });
  var h=vEtkiOzet()+vEtkili();
  if(!refs.length) return h+emptyPitch('Hakem adı girilmiş maç yok.<br>Maç eklerken hakem alanını doldurursan burada döküm çıkar.');
  h+='<div class="card"><span class="lbl">Hakem — takım takım</span>'
   +'<p class="note" style="margin-top:0">Karnenin altındaki satır. Dokununca o hakemin hangi takıma leh/aleyh işlediği açılır. Hakem adı boş maçlar “(hakem girilmedi)” torbasında.</p>';
  refs.forEach(function(r){
    var acik=S.acikHakem===r.name;
    h+='<div class="hafta" style="box-shadow:none;margin:0 0 8px">'
     +'<div class="hafta-bas" role="button" tabindex="0" data-h="'+esc(r.name)+'" onclick="hakemAc(this.getAttribute(\'data-h\'))" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();hakemAc(this.getAttribute(\'data-h\'));}">'
     +'<span class="hafta-ok'+(acik?' acik':'')+'">▾</span>'
     +'<span class="hafta-ad" style="font-size:16px">'+esc(r.name)+'</span>'
     +'<span class="hafta-sayi">'+r.games+' maç · '+r.decs+' karar'
     +(r.agirlik>0.05?' · <b>'+r.agirlik.toFixed(1)+'</b>':'')
     +'</span></div>';
    if(acik){
      h+='<div class="hafta-ic">';
      var satir=Object.keys(r.byTeam).filter(function(k){return r.byTeam[k].f||r.byTeam[k].a;})
        .sort(function(a,b){return (r.byTeam[b].a-r.byTeam[b].f)-(r.byTeam[a].a-r.byTeam[a].f);});
      if(!satir.length) h+='<p class="note" style="margin:0">Bu hakemde kayda geçmiş karar yok.</p>';
      satir.forEach(function(k){
        var v=r.byTeam[k];
        h+='<div class="trow" style="grid-template-columns:1fr 44px 44px 58px">'+teamCell(k)
         +'<div class="pts" style="color:var(--green)">'+v.f+'</div>'
         +'<div class="pts" style="color:var(--red)">'+v.a+'</div>'
         +'<div class="delta '+(v.pts>=0?'up':'down')+'">'+(v.pts>=0?'+':'')+v.pts.toFixed(1)
         +(v.bosa>0.05?'<span class="mv" style="color:var(--amber)" title="puana dönüşemeyen mağduriyet">◦'+v.bosa.toFixed(1)+'</span>':'')
         +'</div></div>';
      });
      h+='</div>';
    }
    h+='</div>';
  });
  return h+'</div>';
}

function vKurallar(){
  var kararSay=0; S.matches.forEach(function(m){kararSay+=(m.decisions||[]).length;});

  var h='<div class="card"><span class="lbl">Bu araç ne yapıyor</span>'
   +'<p class="note" style="margin-top:0">Tek bir soruya cevap arıyor: hakem kararları düzeltilseydi puan tablosu ne olurdu?</p>'
   +'<p class="note">Maçı, hakemi, tartışmalı kararı ve o karara ne kadar emin olduğunu girersin. Kalanını model hesaplar.</p></div>';

  h+='<div class="card" style="border-color:var(--amber)"><span class="lbl" style="color:var(--amber)">Önce şunu bil</span>'
   +'<p class="note" style="margin-top:0">Bu tablo <b>yalnızca girilen kararlar kadar dürüsttür.</b> Sadece kendi takımının mağduriyetlerini girersen sayfa senin haklı olduğunu söyler — ama hiçbir şey kanıtlamaz.</p>'
   +'<p class="note">Aracı savunulabilir kılan tek şey, bütün takımların lehine ve aleyhine kararların aynı titizlikle kaydedilmesidir. Tablo sekmesinin altındaki <b>kayıt dengesi</b>ne bak: bir takımın yalnız bir sütunu doluysa kayıt eksiktir.</p>'
   +'<p class="note">Şu an <b>'+S.matches.length+' maç</b>, <b>'+kararSay+' karar</b> kayıtlı.</p></div>';

  h+='<div class="card"><span class="lbl">Hesap nasıl işliyor</span>'
   +'<p class="note" style="margin-top:0"><b>Her karar kendi dakikasıyla bölünür.</b> '
