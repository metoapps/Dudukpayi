/* ---------------- Ekip ---------------- */
var CREW=["Güven","Ferhat","Musa","Gökhanlort","Coşkun"];
var BIG4=["Beşiktaş","Fenerbahçe","Galatasaray","Trabzonspor"];

/* ---------------- Model ---------------- */
var XG_PEN=0.76, RED_BASE=0.65, RED_SUPP=0.35;
var TYPES=[
 {id:"pen_not",  label:"Verilmeyen penaltı"},
 {id:"goal_off", label:"Haksız iptal edilen gol"},
 {id:"pen_opp",  label:"Rakibe yanlış verilen penaltı (gol oldu)"},
 {id:"goal_opp", label:"Rakibin geçersiz golü sayıldı"},
 {id:"red_self", label:"Mağdur takıma haksız kırmızı"},
 {id:"red_opp",  label:"Rakibe gösterilmeyen kırmızı"}
];
function typeOf(id){for(var i=0;i<TYPES.length;i++){if(TYPES[i].id===id)return TYPES[i];}return TYPES[0];}

var DEFAULT_TEAMS=["Alanyaspor","Amedspor","Başakşehir","Beşiktaş","Çorum FK","Erzurumspor FK","Eyüpspor","Fenerbahçe","Galatasaray","Gaziantep FK","Gençlerbirliği","Göztepe","Kasımpaşa","Kocaelispor","Konyaspor","Rizespor","Samsunspor","Trabzonspor"];
var TEAM_COLORS={"Alanyaspor":["#F47920","#1D4F8C"],"Amedspor":["#C8102E","#1B7A3D"],"Başakşehir":["#F47B20","#1A1A1A"],"Beşiktaş":["#111813","#E8ECE6"],"Çorum FK":["#C8102E","#111813"],"Erzurumspor FK":["#0033A0","#E8ECE6"],"Eyüpspor":["#5B1A4A","#C9A227"],"Fenerbahçe":["#002F6C","#E8B62C"],"Galatasaray":["#A90432","#E8B62C"],"Gaziantep FK":["#C8102E","#111813"],"Gençlerbirliği":["#C8102E","#111813"],"Göztepe":["#C8102E","#E8B62C"],"Kasımpaşa":["#003DA5","#E8ECE6"],"Kocaelispor":["#126B45","#111813"],"Konyaspor":["#126B45","#E8ECE6"],"Rizespor":["#003DA5","#C8102E"],"Samsunspor":["#C8102E","#E8ECE6"],"Trabzonspor":["#7B1113","#3B5998"]};
function tdot(name){var c=TEAM_COLORS[name]||["#7c8a7f","#5e6d61"];return '<span class="tdot" aria-hidden="true"><i style="background:'+c[0]+'"></i><i style="background:'+c[1]+'"></i></span>';}
function teamCell(name){return '<div class="team">'+tdot(name)+'<span class="tname">'+esc(name)+'</span></div>';}
function sm(id,week,home,hg,ag,away,ref){return {id:id,week:String(week),home:home,away:away,hg:hg,ag:ag,ref:ref,by:"örnek",skorOnay:true,decisions:[]};}
var SEED_MATCHES=[
sm(101,1,"Galatasaray",2,2,"Çorum FK","Batuhan Kolak"),sm(102,1,"Gençlerbirliği",2,1,"Fenerbahçe","Oğuzhan Aksu"),sm(103,1,"Kasımpaşa",1,1,"Trabzonspor","Gürcan Hasova"),sm(104,1,"Gaziantep FK",1,1,"Alanyaspor","Yasin Kol"),sm(105,1,"Başakşehir",2,0,"Kocaelispor","Mehmet Türkmen"),sm(106,1,"Beşiktaş",1,0,"Eyüpspor","Oğuzhan Çakır"),sm(107,1,"Amedspor",3,0,"Erzurumspor FK","Halil Umut Meler"),sm(108,1,"Samsunspor",3,3,"Göztepe","Kadir Sağlam"),sm(109,1,"Konyaspor",0,1,"Rizespor","Cihan Aydın"),
sm(201,2,"Alanyaspor",1,0,"Beşiktaş","Adnan Deniz Kayatepe"),sm(202,2,"Çorum FK",0,1,"Kasımpaşa","Fatih Tokail"),sm(203,2,"Fenerbahçe",4,2,"Konyaspor","Atilla Karaoğlan"),sm(204,2,"Eyüpspor",0,1,"Gaziantep FK","Reşat Onur Coşkunses"),sm(205,2,"Trabzonspor",2,1,"Başakşehir","Ali Şansalan"),sm(206,2,"Göztepe",0,1,"Gençlerbirliği","Batuhan Kolak"),sm(207,2,"Kocaelispor",2,0,"Amedspor","Ümit Öztürk"),sm(208,2,"Rizespor",0,2,"Samsunspor","Ömer Faruk Turtay"),sm(209,2,"Erzurumspor FK",0,4,"Galatasaray","Çağdaş Altay"),
sm(301,3,"Gençlerbirliği",1,1,"Erzurumspor FK","Ümit Öztürk"),sm(302,3,"Gaziantep FK",1,2,"Rizespor","Batuhan Kolak"),sm(303,3,"Eyüpspor",2,1,"Alanyaspor","Cihan Aydın"),sm(304,3,"Galatasaray",3,2,"Göztepe","Mehmet Türkmen"),sm(305,3,"Samsunspor",0,2,"Fenerbahçe","Yasin Kol"),sm(306,3,"Başakşehir",1,1,"Kasımpaşa","Halil Umut Meler"),sm(307,3,"Amedspor",2,1,"Trabzonspor","Atilla Karaoğlan"),sm(308,3,"Beşiktaş",6,2,"Çorum FK","Çağdaş Altay"),sm(309,3,"Konyaspor",1,2,"Kocaelispor","Gürcan Hasova"),
sm(401,4,"Başakşehir",2,3,"Galatasaray","Kadir Sağlam"),sm(402,4,"Fenerbahçe",1,2,"Beşiktaş","Halil Umut Meler"),sm(403,4,"Erzurumspor FK",1,0,"Konyaspor","Yasin Kol"),sm(404,4,"Çorum FK",3,0,"Eyüpspor","Davut Dakul Çelik"),sm(405,4,"Kasımpaşa",2,2,"Amedspor","Oğuzhan Çakır"),sm(406,4,"Trabzonspor",5,0,"Gençlerbirliği","Çağdaş Altay"),sm(407,4,"Kocaelispor",1,0,"Samsunspor","Reşat Onur Coşkunses")
];
function seedKopya(){
  var a=SEED_MATCHES.map(function(m){return {id:m.id,week:m.week,home:m.home,away:m.away,hg:m.hg,ag:m.ag,ref:m.ref,by:m.by,skorOnay:true,decisions:[],upd:0};});
  function karar(id,type,harmed,minute,certainty){
    var m=a.filter(function(x){return x.id===id;})[0]; if(!m) return;
    m.decisions.push({kid:"seed-"+id+"-"+m.decisions.length,type:type,harmed:harmed,minute:minute,certainty:certainty,note:"örnek kayıt",by:"örnek"});
  }
  karar(201,"pen_not","away",88,90);           /* Alanya 1-0 BJK — verilmeyen geç penaltı */
  karar(304,"pen_opp","away",22,80);           /* GS 3-2 Göztepe — erken haksız penaltı (gol) */
  karar(402,"goal_off","away",74,85);          /* FB 1-2 BJK — iptal edilen BJK golü */
  return a;
}

function fact(n){var r=1;for(var i=2;i<=n;i++)r*=i;return r;}
function pois(k,l){return Math.exp(-l)*Math.pow(l,k)/fact(k);}
function realPts(hg,ag){return hg>ag?[3,0]:(hg<ag?[0,3]:[1,1]);}
/* Kalan süre: mevcut skora ek gol Poisson'u. Maçı 90 dakika baştan kurmaz. */
function extraPtsFromXg(gh,ga,dh,da){
  dh=Math.max(0,dh); da=Math.max(0,da);
  if(dh<0.001 && da<0.001) return {home:0,away:0};
  var eh=0, ea=0, mass=0, cap=7;
  var lh=Math.max(0.001,dh), la=Math.max(0.001,da);
  for(var h=0;h<=cap;h++) for(var a=0;a<=cap;a++){
    var p=pois(h,lh)*pois(a,la);
    mass+=p;
    var r=realPts(gh+h, ga+a);
    eh+=p*r[0]; ea+=p*r[1];
  }
  if(mass>0){ eh/=mass; ea/=mass; }
  var b=realPts(gh,ga);
  return {home:eh-b[0], away:ea-b[1]};
}
/* Negatif beklenti (rakibin on kişiye düşüp baskılanması) karşı tarafa AKTARILAMAZ.
   Eski kod öyle yapıyordu; sonuçta RED_SUPP fiilen RED_BASE'e ekleniyor, yani
   "iki yönlü kırmızı" tek yönlü 1,0 katsayıya dönüşüyordu.
   Doğrusu: kalan süre için iki tarafa da bir taban gol beklentisi konur,
   baskılama bu tabandan düşülür. Sonuç, tabanlı hesabın kararlı ve kararsız
   halleri arasındaki farktır — karar yoksa etki sıfır kalır. */
/* Tam maç gol beklentisi (Süper Lig ev / deplasman). Kalan süre kesriyle çarpılır. */
var TABAN_EV=1.45, TABAN_DEP=1.20;
function kalanPuan(gh,ga,dh,da,f){
  f=Math.max(0,Math.min(1,f==null?1:+f));
  if(Math.abs(dh)<0.001 && Math.abs(da)<0.001) return {home:0,away:0};
  var th=TABAN_EV*f, ta=TABAN_DEP*f;
  var ile=extraPtsFromXg(gh,ga,Math.max(0.001,th+dh),Math.max(0.001,ta+da));
  var siz=extraPtsFromXg(gh,ga,th,ta);
  return {home:ile.home-siz.home, away:ile.away-siz.away};
}
var _impCache={};
function impactTemizle(){ _impCache={}; }
function matchImpact(m){
  var anahtar=String(m.id)+"|"+m.hg+"|"+m.ag+"|"+JSON.stringify(m.decisions||[]);
  if(_impCache[anahtar]) return _impCache[anahtar];
  var out=matchImpactHesap(m);
  if(Object.keys(_impCache).length>500) _impCache={};
  _impCache[anahtar]=out;
  return out;
}
function matchImpactHesap(m){
  var list=m.decisions||[];
  var RED=["red_self","red_opp"];
  var scoreDecs=[], redDecs=[];
  list.forEach(function(d){ (RED.indexOf(d.type)>=0?redDecs:scoreDecs).push(d); });

  /* Verilmeyen penaltı: gol ihtimali 0,76. Golle biten olaylar tam 1. */
  function prob(d,w){ return d.type==="pen_not" ? w*XG_PEN : w; }
  function goalShift(d){
    var toHome=(d.harmed==="home");
    if(d.type==="pen_not"||d.type==="goal_off") return toHome?[1,0]:[0,1];
    return toHome?[0,-1]:[-1,0];
  }
  /* Geç olay (90′) skor düzeltilir; erken olay kalan süre Poisson'a gider.
     Ağırlık olayın KENDİ dakikasına bağlı — maçtaki en geç olaya değil. */
  function lateOf(d){ return Math.max(0,Math.min(1,(+d.minute||45)/90)); }

  function calc(mode){
    function wOf(d){
      if(mode==="low") return d.certainty>=75 ? d.certainty/100 : 0;
      /* Üst bant: spekülatif kararı %100 sayma; +20 puanlık pay. */
      if(mode==="high") return Math.min(1,(d.certainty||0)/100+0.20);
      return d.certainty/100;
    }
    function remFrac(d){ return Math.max(0,Math.min(1,(90-(+d.minute||45))/90)); }
    var rh=0, ra=0, remF=0;
    redDecs.forEach(function(d){
      var rf=remFrac(d); remF=Math.max(remF,rf);
      var rem=rf*wOf(d);
      if(d.harmed==="home"){ rh+=RED_BASE*rem; ra-=RED_SUPP*rem; }
      else { ra+=RED_BASE*rem; rh-=RED_SUPP*rem; }
    });

    /* Beklenen ekstra gol (korunur). Geç ve erken aynı kararı iki kez yazmaz. */
    var expH=rh, expA=ra;
    scoreDecs.forEach(function(d){
      var g=goalShift(d), pFull=prob(d,wOf(d));
      expH+=g[0]*pFull; expA+=g[1]*pFull;
      remF=Math.max(remF, remFrac(d));
    });

    var n=scoreDecs.length, eh=0, ea=0;
    if(n>12){
      var extra=kalanPuan(m.hg,m.ag,expH,expA,remF||1);
      var rb0=realPts(m.hg,m.ag);
      eh=rb0[0]+extra.home; ea=rb0[1]+extra.away;
    } else {
      for(var mask=0; mask<(1<<n); mask++){
        var pr=1, gh=m.hg, ga=m.ag, addH=rh, addA=ra;
        for(var i=0;i<n;i++){
          var d=scoreDecs[i], late=lateOf(d), pFull=prob(d,wOf(d));
          var pLate=pFull*late, pEarly=pFull*(1-late);
          if(mask&(1<<i)){
            pr*=pLate;
            var g=goalShift(d); gh+=g[0]; ga+=g[1];
          } else {
            pr*=(1-pLate);
            if(1-pLate>1e-12){
              var g2=goalShift(d);
              addH+=g2[0]*pEarly/(1-pLate);
              addA+=g2[1]*pEarly/(1-pLate);
            }
          }
        }
        if(pr<=0) continue;
        gh=Math.max(0,gh); ga=Math.max(0,ga);
        var disk=realPts(gh,ga);
        var pts={home:disk[0], away:disk[1]};
        if(Math.abs(addH)>0.001||Math.abs(addA)>0.001){
          var extra2=kalanPuan(gh,ga,addH,addA,remF||1);
          pts={home:disk[0]+extra2.home, away:disk[1]+extra2.away};
        }
        eh+=pr*pts.home; ea+=pr*pts.away;
      }
    }
    var rb=realPts(m.hg,m.ag);
    return {home:eh-rb[0], away:ea-rb[1], gh:expH, ga:expA};
  }
  function kirp(im){
    var r=realPts(m.hg,m.ag);
    function tek(ham, gercek, extraGol){
      var duz=gercek+ham;
      var kirpik=Math.max(0,Math.min(3,duz));
      var tasan=duz-kirpik;
      /* Beklenen puan 0–3 içinde kaldığında da: zaten 3 puanlık maçta
         ek mağduriyet / zaten 0'da ek haksız kazanç sonuca yansımaz.
         Kayan nokta yüzünden tasan tam 0 olmayabilir; eşik kullanılır. */
      if(Math.abs(tasan)<1e-3 && gercek>=3 && extraGol>0.05) tasan=extraGol;
      if(Math.abs(tasan)<1e-3 && gercek<=0 && extraGol<-0.05) tasan=extraGol;
      return {etki:kirpik-gercek, bosa:Math.max(0,tasan), fazla:Math.max(0,-tasan)};
    }
    var h=tek(im.home,r[0],im.gh), a=tek(im.away,r[1],im.ga);
    return {home:h.etki, away:a.etki,
            bosaHome:h.bosa, bosaAway:a.bosa,
            fazlaHome:h.fazla, fazlaAway:a.fazla};
  }
  var midC=calc("mid"), lowC=calc("low"), highC=calc("high");
  return {mid:kirp(midC), low:kirp(lowC), high:kirp(highC),
          gMid:{h:midC.gh,a:midC.ga}};
}

function seriTam(names){
  for(var i=0;i<names.length;i++) for(var j=i+1;j<names.length;j++){
    var n=0, a=names[i], b=names[j];
    S.matches.forEach(function(m){
      if((m.home===a&&m.away===b)||(m.home===b&&m.away===a)) n++;
    });
    if(n<2) return false;
  }
  return true;
}
function miniLigSirala(grp, gdOf, gfOf){
  var names=grp.map(function(x){return x.name;});
  if(!seriTam(names)){
    return grp.slice().sort(function(a,b){
      return gdOf(b)-gdOf(a)||gfOf(b)-gfOf(a)||a.name.localeCompare(b.name,"tr");
    });
  }
  var mini={};
  names.forEach(function(n){ mini[n]={pts:0,gd:0,gf:0}; });
  S.matches.forEach(function(m){
    if(names.indexOf(m.home)<0||names.indexOf(m.away)<0) return;
    var r=realPts(m.hg,m.ag);
    mini[m.home].pts+=r[0]; mini[m.away].pts+=r[1];
    mini[m.home].gf+=m.hg; mini[m.home].gd+=m.hg-m.ag;
    mini[m.away].gf+=m.ag; mini[m.away].gd+=m.ag-m.hg;
  });
  return grp.slice().sort(function(a,b){
    var A=mini[a.name], B=mini[b.name];
    return (B.pts-A.pts)||(B.gd-A.gd)||(B.gf-A.gf)||gdOf(b)-gdOf(a)||gfOf(b)-gfOf(a)||a.name.localeCompare(b.name,"tr");
  });
}
/* TFF: puan → (seri bitince) kendi araları → genel averaj → atılan gol.
