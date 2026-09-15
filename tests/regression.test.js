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
