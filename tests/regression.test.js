const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1].replace(/boot\(\);\s*$/, "");
const context = {
  console, Date, Math, JSON, String, Number, Object, Array, RegExp,
  parseInt, parseFloat, isFinite,
  window: { crypto: { randomUUID: () => "test-id" }, matchMedia: () => ({ matches: false }) },
  document: {}, location: { search: "", hash: "" },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  URL, Blob: function () {}, confirm: () => true, fetch: () => Promise.reject(),
  setTimeout, clearTimeout
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(js, context);

function same(a, b) {
  assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
}

const projected = context.normPts(1.7, 0.4);
assert(projected.home >= 0 && projected.home <= 3);
assert(projected.away >= 0 && projected.away <= 3);
assert(projected.home + projected.away <= 3.000001);

const match = {
  id: "m1", home: "A", away: "B", hg: 0, ag: 0,
  decisions: [{ type: "pen_not", harmed: "home", minute: 42, certainty: 80, kid: "same" }]
};
same(context.matchImpact(match), context.matchImpact(match));
const oldImpact = JSON.stringify(context.matchImpact(match));
match.hg = 1;
assert.notStrictEqual(oldImpact, JSON.stringify(context.matchImpact(match)));

const red = {
  id: "r", home: "A", away: "B", hg: 0, ag: 0,
  decisions: [{ type: "red_self", harmed: "home", minute: 89, certainty: 100, kid: "r1" }]
};
const at89 = context.matchImpact(red);
red.decisions[0].minute = 96;
assert.notStrictEqual(JSON.stringify(at89), JSON.stringify(context.matchImpact(red)));

context.S.matches = [];
const merged = context.birlestirDefter(
  { teams: ["A", "B"], matches: [{ id: "101", week: "1", home: "A", away: "B", hg: 0, ag: 0, upd: 1, decisions: [] }] },
  { teams: ["A", "B"], matches: [{ id: "202", week: "1", home: "A", away: "B", hg: 1, ag: 0, upd: 2, decisions: [] }] }
);
assert.strictEqual(merged.matches.length, 1);
assert.strictEqual(merged.matches[0].hg, 1);

console.log("Düdük Payı regresyon testleri başarılı: 5");
/* ---- 2026-11 eklenen testler ---- */
let sayac=0;
function imp(hg,ag,decs){ sayac++; return context.matchImpact({id:"t"+sayac,home:"A",away:"B",hg,ag,
  decisions:decs.map((d,i)=>Object.assign({kid:"k"+i},d))}); }
const yakin=(a,b,e)=>Math.abs(a-b)<(e||1e-9);

// Karşılıklı iptal edilen goller birbirini götürür (her dakika, her skor)
[10,30,50,70,89,95].forEach(dk=>[[0,0],[1,1],[2,0]].forEach(([h,a])=>{
  const r=imp(h,a,[{type:"goal_off",harmed:"home",minute:dk,certainty:100},{type:"goal_off",harmed:"away",minute:dk,certainty:100}]).mid;
  assert(yakin(r.home,0,1e-9)&&yakin(r.away,0,1e-9), "ayna karar "+dk+" "+h+"-"+a);
}));

// Rastgele: maç başına 0–3, toplam 2–3, kesinlikte monotonluk, bant sırası
const TIP=["pen_not","goal_off","pen_opp","goal_opp","red_self","red_opp"];
let seed=12345; const rnd=n=>{seed=(seed*1103515245+12345)%2147483648; return seed%n;};
for(let k=0;k<3000;k++){
  const hg=rnd(6), ag=rnd(6), n=1+rnd(4), decs=[];
  for(let i=0;i<n;i++){ const d={type:TIP[rnd(6)],harmed:rnd(2)?"home":"away",minute:1+rnd(120),certainty:rnd(101)};
    if(rnd(2)){ d.oncH=rnd(hg+1); d.oncA=rnd(ag+1); if(!context.oncTutarli(d,{hg,ag})){ delete d.oncH; delete d.oncA; } }
    decs.push(d); }
  if(context.imkansizKarar(hg,ag,decs)) continue;
  const r=imp(hg,ag,decs), rp=context.realPts(hg,ag);
  ["mid","low","high"].forEach(md=>{ const H=rp[0]+r[md].home, A=rp[1]+r[md].away;
    assert(H>-1e-9&&H<3+1e-9&&A>-1e-9&&A<3+1e-9, "0-3 sınırı"); });
  const H=rp[0]+r.mid.home, A=rp[1]+r.mid.away; assert(H+A<3+1e-6&&H+A>2-1e-6, "toplam 2-3");
  assert(r.low.home<=r.mid.home+1e-9&&r.mid.home<=r.high.home+1e-9, "bant");
  if(n===1){ const d=decs[0], g=d.harmed, r2=imp(hg,ag,[Object.assign({},d,{certainty:Math.min(100,d.certainty+10)})]);
    assert(r2.mid[g]>=r.mid[g]-1e-9, "monotonluk "+JSON.stringify([hg,ag,d])); }
}

// 96′ ve sonrası kırmızı sıfır, karar yoksa sıfır
assert(yakin(imp(0,0,[{type:"red_self",harmed:"home",minute:96,certainty:100}]).mid.home,0));
assert(yakin(imp(2,1,[]).mid.home,0));

// Oyun durumu: 0-3 biten maçta 0-0 iken verilmeyen penaltı, skor bilinmeyenden daha değerli
const bilinmez=imp(0,3,[{type:"pen_not",harmed:"home",minute:30,certainty:100}]).mid.home;
const sifirsifir=imp(0,3,[{type:"pen_not",harmed:"home",minute:30,certainty:100,oncH:0,oncA:0}]).mid.home;
assert(sifirsifir>bilinmez+0.1, "oyun durumu");
// Önde on kişi kalmak gerideyken kalmaktan az zarar
const onde=imp(1,1,[{type:"red_self",harmed:"home",minute:30,certainty:100,oncH:1,oncA:0}]).mid.home;
const geride=imp(1,1,[{type:"red_self",harmed:"home",minute:30,certainty:100,oncH:0,oncA:1}]).mid.home;
assert(onde<geride, "kırmızı oyun durumu");

// İmkânsız kayıt ve tutarsız önceki skor yakalanır
assert(context.imkansizKarar(0,0,[{type:"goal_opp",harmed:"home"}]));
assert(!context.imkansizKarar(0,1,[{type:"goal_opp",harmed:"home"}]));
assert(!context.oncTutarli({type:"goal_opp",harmed:"home",oncH:0,oncA:1},{hg:0,ag:1}));
assert(context.oncTutarli({type:"goal_opp",harmed:"home",oncH:0,oncA:0},{hg:0,ag:1}));
assert.strictEqual(context.oncTemiz({type:"pen_not",harmed:"home",oncH:3,oncA:0},{hg:1,ag:0}).h, "");

console.log("Ek testler başarılı: ayna, 3000 rastgele maç, oyun durumu, doğrulama");

