  var opt=function(sel){return S.teams.map(function(t){return '<option'+(t===sel?' selected':'')+'>'+esc(t)+'</option>';}).join('');};
  var h='';
  if(S.editId){
    h+='<div class="ok" style="display:flex;justify-content:space-between;align-items:center;gap:10px">'
     +'<span>Bir maçı düzenliyorsun.</span>'
     +'<button class="btn ghost" style="padding:6px 12px;font-size:13px" onclick="cancelEdit()">Vazgeç</button></div>';
  }
  {
    /* ---------------- İnternetten skor çekme (deneysel) ----------------
       TheSportsDB'nin ücretsiz "123" anahtarı ile Süper Lig (id 4339) haftasını çeker.
       Hakem bilgisi bu kaynakta yok — o alan boş bırakılır, elle doldurulur.
       Sonuç doğrudan kaydedilmez: yapıştırma kutusuna JSON olarak dolar,
       kullanıcı gözden geçirip her zamanki "Maçları ekle" akışından onaylar. */
    h+='<div class="card"'+(S.cekBusy?' style="opacity:.7"':'')+'><span class="lbl">İnternetten skor çek (deneysel)</span>'
     +'<p class="note" style="margin-top:0">Hafta numarasını gir, o haftanın oynanmış maçlarını TheSportsDB\'den çekmeyi dener. '
     +'Hakem bilgisi bu kaynakta yok, elle eklemen gerekir. Takım adı eşleşmezse o satır boş bırakılır, sen tamamlarsın.</p>'
     +'<div class="row" style="margin-bottom:10px">'
     +'<input id="cekHafta" type="number" inputmode="numeric" min="1" max="34" placeholder="Hafta no" style="max-width:110px" value="'+esc(S.cekHaftaNo||"")+'">'
     +'<button class="btn ghost" style="flex:0 0 auto" onclick="internettenCek()" '+(S.cekBusy?"disabled":"")+'>'+(S.cekBusy?"Çekiliyor…":"Çek")+'</button>'
     +'</div>'
     +(S.cekMsg?'<p class="note" style="margin:0 0 10px;color:'+(S.cekHata?"var(--red)":"var(--muted)")+'">'+esc(S.cekMsg)+'</p>':'')
     +'</div>';

    h+='<div class="card"><span class="lbl">Haftayı toplu ekle</span>'
     +'<p class="note" style="margin:0 0 10px">Hafta verisini yapıştır — üstüne yazmaz, ekler.</p>'
     +'<textarea id="pasteIn" placeholder=\'[{"home":"Beşiktaş","away":"Eyüpspor","hg":1,"ag":0,"ref":"Hakem adı","week":"1"}]\' style="width:100%;min-height:96px;background:var(--panel2);border:1.5px solid var(--edge);color:var(--ink);border-radius:10px;padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5"></textarea>'
     +'<div class="btnrow" style="margin-top:10px"><button class="btn" onclick="pasteWeek()">Maçları ekle</button></div>'
     +'<details><summary>Biçim açıklaması</summary><p class="note">Köşeli parantez içinde, her maç bir nesne. '
     +'<b>hg</b> ev sahibi golü, <b>ag</b> deplasman golü, <b>ref</b> hakem, <b>week</b> hafta. '
     +'Takım adları listendekilere yakın yazılırsa otomatik eşleşir.</p></details>';
    h+='</div>';
  }

  h+='<div class="card"><span class="lbl">'+(S.editId?'Maçı düzenle':'Tek maç gir')+'</span><div class="row" style="margin-bottom:8px">'
   +'<select onchange="setD(\'home\',this.value)" aria-label="Ev sahibi">'+opt(d.home)+'</select>'
   +'<select onchange="setD(\'away\',this.value)" aria-label="Deplasman">'+opt(d.away)+'</select></div>'
   +'<div class="row" style="margin-bottom:5px">'
   +'<input type="number" min="0" max="20" inputmode="numeric" placeholder="0" value="'+(d.hg===""?"":d.hg)+'" onfocus="this.select()" oninput="setGoal(\'hg\',this)" aria-label="'+esc(d.home)+' gol">'
   +'<input type="number" min="0" max="20" inputmode="numeric" placeholder="0" value="'+(d.ag===""?"":d.ag)+'" onfocus="this.select()" oninput="setGoal(\'ag\',this)" aria-label="'+esc(d.away)+' gol"></div>'
   +'<p class="note" style="margin:0 0 10px;font-size:12.5px">Sol kutu <b>'+esc(d.home)+'</b>, sağ kutu <b>'+esc(d.away)+'</b> golü.</p>'
   +'<div id="goalWarn"></div>'
   +'<div class="row">'
   +'<input id="dref" placeholder="Hakem" value="'+esc(d.ref)+'" oninput="setDQ(\'ref\',this.value)">'
   +'<input id="dweek" placeholder="Hafta" value="'+esc(d.week)+'" oninput="setDQ(\'week\',this.value)"></div>'
   +(same?'<div class="warn" style="margin-top:10px">Aynı takımı iki tarafa da seçtin.</div>':'')+'</div>';

  h+='<div class="card"><span class="lbl">Tartışmalı kararlar</span>'
   +'<p class="note" style="margin:0 0 10px">Kararlar mağdur taraf üzerinden girilir.</p>'
   +'<div class="btnrow" style="margin-bottom:10px">'
   +'<button class="btn ghost" onclick="addDec()">+ Karar ekle</button></div>';

  d.decs.forEach(function(x,i){
    h+='<div class="cand"><select onchange="setDec('+i+',\'type\',this.value)" style="margin-bottom:8px" aria-label="Karar türü">'
     +TYPES.map(function(t){return '<option value="'+t.id+'"'+(t.id===x.type?' selected':'')+'>'+t.label+'</option>';}).join('')
     +'</select><div class="row" style="margin-bottom:8px">'
     +'<select onchange="setDec('+i+',\'harmed\',this.value)" aria-label="Mağdur taraf">'
     +'<option value="home"'+(x.harmed==="home"?' selected':'')+'>Mağdur: '+esc(d.home)+'</option>'
     +'<option value="away"'+(x.harmed==="away"?' selected':'')+'>Mağdur: '+esc(d.away)+'</option></select>'
     +'<input type="number" min="1" max="120" inputmode="numeric" value="'+x.minute+'" onchange="setDec('+i+',\'minute\',+this.value)" aria-label="Dakika"></div>'
     +'<span class="lbl" style="margin-bottom:5px">Kesinlik %<span id="cert'+i+'">'+x.certainty+'</span></span>'
     +'<input type="range" min="10" max="100" step="5" value="'+x.certainty+'"'
     +' oninput="document.getElementById(\'cert'+i+'\').textContent=this.value"'
     +' onchange="setDec('+i+',\'certainty\',+this.value)">'
     +'<input id="dnote'+i+'" placeholder="Not (isteğe bağlı)" value="'+esc(x.note)+'" oninput="setDecQ('+i+',\'note\',this.value)" style="margin-top:8px">'
     +'<button class="btn danger" style="margin-top:9px" onclick="delDec('+i+')">Sil</button></div>';
  });
  h+='</div><div class="btnrow"><button class="btn" style="flex:1;padding:13px"'+(same?' disabled':'')+' onclick="saveMatch()">'
   +(S.editId?'Değişiklikleri kaydet':'Maçı kaydet')+'</button>'
   +(S.editId?'<button class="btn ghost" style="padding:13px" onclick="cancelEdit()">Vazgeç</button>':'')+'</div>';
  return h;
}

function vMatches(){
  var h='';
  if(!S.matches.length){ h=emptyPitch('Kayıtlı maç yok.'); }
  else{
    var seen={}, dupPairs=[];
    S.matches.forEach(function(m){
      var k=m.home+"|"+m.away+"|"+String(m.week||"");
      if(seen[k]){ if(dupPairs.indexOf(k)<0)dupPairs.push(k); } else seen[k]=1;
    });
    h='<div class="card"><span class="lbl">'+S.matches.length+' maç</span>';
    if(dupPairs.length){
      h+='<div class="warn">Aynı haftada aynı eşleşme birden fazla kayıtlı: '
       +dupPairs.map(function(k){var p=k.split("|"); return esc(p[0])+" — "+esc(p[1])+(p[2]?" ("+esc(p[2])+". hafta)":"");}).join(", ")
       +'. Fazlasını sil, yoksa o maç iki kez sayılır.</div>';
    }
    /* onaylanmış maçlar bir daha uyarı olarak çıkmaz — averajı bozmuyor, sadece nadir bir skor */
    var odd=S.matches.filter(function(m){return ((m.hg+m.ag)>=7 || m.hg>=6 || m.ag>=6) && !m.skorOnay;});
    if(odd.length){
      h+='<div class="warn"><b>Şüpheli skor</b><br>'
       +odd.map(function(m){
           return esc(m.home)+' '+m.hg+'-'+m.ag+' '+esc(m.away)+(m.week?' ('+esc(m.week)+'. hafta)':'')
             +(MISAFIR?'':' <button class="btn danger" style="padding:3px 9px;font-size:12px;margin-left:6px" onclick="delMatch('+m.id+')">Sil</button>'
                       +' <button class="btn ghost" style="padding:3px 9px;font-size:12px;margin-left:4px" onclick="skorOnayla('+m.id+')">Doğru, uyarma</button>');
         }).join('<br>')
       +'<br><span style="font-weight:400">Süper Lig\'de bu skorlar çok nadirdir. Yanlış girildiyse sil, doğruysa "Doğru, uyarma" ile bir daha çıkmasın.</span></div>';
    }
    /* Haftalara ayır: en yeni hafta üstte, hafta numarası olmayanlar sona */
    var haftalar={}, sirasiz=[];
    S.matches.forEach(function(m){
      var w=String(m.week||"").trim();
      if(!w){ sirasiz.push(m); return; }
      (haftalar[w]=haftalar[w]||[]).push(m);
    });
    var anahtarlar=Object.keys(haftalar).sort(function(a,b){
      var x=parseInt(a,10), y=parseInt(b,10);
      if(isFinite(x)&&isFinite(y)) return y-x;
      return String(b).localeCompare(String(a),"tr");
    });
    if(sirasiz.length) { haftalar["__yok"]=sirasiz; anahtarlar.push("__yok"); }

    anahtarlar.forEach(function(w){
      var grup=haftalar[w];
      /* Hiçbiri seçilmemişse en yeni hafta açık gelsin */
      var acik = S.acikHafta ? (S.acikHafta===w) : (w===anahtarlar[0]);
      var kararSay=0, etki=0;
      grup.forEach(function(m){
        kararSay+=(m.decisions||[]).length;
        var im=matchImpact(m);
        etki+=Math.abs(im.mid.home)+Math.abs(im.mid.away);
      });
      h+='<div class="hafta">'
       +'<div class="hafta-bas" data-w="'+esc(w)+'" onclick="haftaAc(this.getAttribute(\'data-w\'))" role="button" tabindex="0">'
       +'<span class="hafta-ok'+(acik?' acik':'')+'">▾</span>'
       +'<span class="hafta-ad">'+(w==="__yok"?"Haftası girilmemiş":esc(w)+". hafta")+'</span>'
       +'<span class="hafta-sayi">'+grup.length+' maç'
       +(kararSay?' · '+kararSay+' karar':'')
       +(etki>0.05?' · <b>'+etki.toFixed(1)+' puan</b>':'')
       +'</span></div>';
      if(!acik){ h+='</div>'; return; }
      h+='<div class="hafta-ic">';
      grup.slice().reverse().forEach(function(m){
      var im=matchImpact(m), n=(m.decisions||[]).length;
      h+='<div class="match'+(n?' has':'')+'"><div class="mtop">'+vsLine(m.home,m.away)
       +'<span class="mscore">'+m.hg+':'+m.ag+'</span></div><div class="mmeta">'
       +esc(m.ref||"hakem girilmedi")
       +(n?(' · etki '+(im.mid.home>=0?'+':'')+im.mid.home.toFixed(2)+' / '+(im.mid.away>=0?'+':'')+im.mid.away.toFixed(2)):'')
       +(m.by?'<span class="by">'+esc(m.by)+'</span>':'')
       +'</div>';
      (m.decisions||[]).forEach(function(x){
        h+='<div class="dec">'+esc(typeOf(x.type).label)+' · mağdur: '+esc(x.harmed==="home"?m.home:m.away)+' · '+x.minute+'′'
         +'<span class="chip">%'+x.certainty+'</span>'
         +(x.by&&x.by!==m.by?'<span class="by">'+esc(x.by)+'</span>':'')
         +(x.note?'<div style="color:var(--dim)">'+esc(x.note)+'</div>':'')+'</div>';
      });
      if(S.quick&&S.quick.id===m.id&&!MISAFIR){ h+=quickPanel(m); }
      else if(!MISAFIR){
        h+='<div class="btnrow" style="margin-top:9px">'
         +'<button class="btn" style="padding:8px 14px;font-size:13.5px" onclick="quickStart('+m.id+')">+ Karar ekle</button>'
         +'<button class="btn ghost" style="padding:8px 12px;font-size:13px" onclick="editMatch('+m.id+')">Düzenle</button>'
         +'<button class="btn danger" style="padding:8px 12px;font-size:13px" onclick="delMatch('+m.id+')">Sil</button></div>';
      }
      h+='</div>';
      });               /* maç döngüsü */
      h+='</div></div>';  /* hafta-ic + hafta */
    });                 /* hafta döngüsü */
    h+='</div>';        /* kart */
  }
  return h;
}

/* Hafta klasörünü aç-kapa */
function haftaAc(w){ S.acikHafta = (S.acikHafta===w ? null : w); render(); }
function hakemAc(n){ S.acikHakem = (S.acikHakem===n ? null : n); render(); }

/* Karar bazında etki dökümü: hangi hakem, hangi takım lehine/aleyhine skoru kaç puan etkiledi.
   kararEtkisi() kararı çıkarıp maçı yeniden hesaplar; 0'a yakın çıkanlar skoru değiştirmemiştir. */
function etkiDokumu(){
  var takim={}, hakem={}, toplamKarar=0, etkiliKarar=0;
  function tEnt(t){ if(!takim[t]) takim[t]={ad:t,kazanc:0,kayip:0,lehKarar:0,aleyhKarar:0,etkiliLeh:0,etkiliAleyh:0}; return takim[t]; }
  /* agirlik: kesinlikle ağırlıklandırılmış hata hacmi (sonucu ne olursa olsun)
     lehteSayi: kararların yönü, sayı bazlı — sonuçsuz hatalar da taraflılığa sayılır */
  function hEnt(h){ if(!hakem[h]) hakem[h]={ad:h,mac:0,karar:0,etkili:0,puan:0,agirlik:0,yansimayan:0,lehte:{},lehteSayi:{}}; return hakem[h]; }

  S.matches.forEach(function(m){
    var hk=(m.ref||"").trim()||"(hakem girilmedi)";
    var H=hEnt(hk); H.mac++;
