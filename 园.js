// 园（第二个，第 15 天 11:30）：园.py 原样搬过来，网页和 node 都能用。规矩在 ../预期.md。
(function (root) {
const MAP = [
'###################',
'#.....&&.....#....#',
'#.##..&&...#......#',
'#.#.......##...T..#',
'#...OO.......#....#',
'#...OO..#.........#',
'#.........#..|....#',
'#.#....#..........#',
'#......#....##..#.#',
'#........G........#',
'###################'];
const H = MAP.length, W = MAP[0].length, g = MAP.map(r => r.split(''));
const SPOT = { '&': '树丛里', 'O': '祭坛边上', 'T': '老柏树底下', '|': '墙根的荫凉里' };
const SPOTK = ['&', 'O', 'T', '|'];
let GATE; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'G') GATE = [x, y];
const DAY_LEN = 30, DAYS = 10;
const COME = { 2: 14, 3: 10, 4: 16, 5: 12, 6: 8, 7: 15, 8: 11, 9: 13, 10: 9 };
const MV = { '上': [0, -1], '下': [0, 1], '左': [-1, 0], '右': [1, 0] };
const K = p => p[0] + ',' + p[1];
const eq = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
const free = p => p[0] >= 0 && p[0] < W && p[1] >= 0 && p[1] < H && !'#O'.includes(g[p[1]][p[0]]);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
function bfs(s, t) {
  const prev = new Map([[K(s), null]]); const q = [s];
  while (q.length) { const c = q.shift(); if (eq(c, t)) break;
    for (const d of Object.values(MV)) { const n = [c[0] + d[0], c[1] + d[1]]; if (free(n) && !prev.has(K(n))) { prev.set(K(n), c); q.push(n); } } }
  if (!prev.has(K(t))) return [];
  const path = []; let c = t; while (!eq(c, s)) { path.push(c); c = prev.get(K(c)); } return path.reverse();
}
function kind(p) {
  const ch = g[p[1]][p[0]]; if (SPOT[ch]) return ch;
  for (const d of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const q = [p[0] + d[0], p[1] + d[1]]; if (q[0] >= 0 && q[0] < W && q[1] >= 0 && q[1] < H && g[q[1]][q[0]] === 'O') return 'O'; }
  return null;
}
const sees = (me, her) => kind(me) === '&' ? false : cheb(me, her) <= 3;
const isee = (me, her) => cheb(me, her) <= 5;

function run(acts) {
  const mine = new Map(), hers = new Map(), stay = { '&': 0, 'O': 0, 'T': 0, '|': 0 };
  const inc = (mp, p) => mp.set(K(p), (mp.get(K(p)) || 0) + 1);
  let came = 0, found = 0, isaw = 0, called = 0, unseen = 0, lost = 0;
  const out = []; let i = 0; let me = GATE, n = 0, day = 1;
  for (day = 1; day <= DAYS; day++) {
    out.push(`==== 第 ${day} 天 ====`);
    me = GATE; n = 0; let mom = null, plan = [], state = null, seenToday = false, wasCalled = false, lastSay = null, lastVis = false, foundFlag = false, saidFollow = false, tq = [], targets = [];
    inc(mine, me);
    if (COME[day]) {
      let order = SPOTK.filter(k => stay[k] > 0).sort((a, b) => stay[b] - stay[a]); if (!order.length) order = ['T'];
      for (const k of order) { let best = null; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = [x, y]; if (kind(c) === k && free(c) && (!best || cheb(c, GATE) < cheb(best, GATE))) best = c; } targets.push(best); }
    }
    let broke = false;
    while (n < DAY_LEN) {
      if (i >= acts.length) {
        const where = kind(me) ? SPOT[kind(me)] : (eq(me, GATE) ? '园门口' : '路上');
        const showMom = mom && (state === '陪' || (state !== '走了' && lastVis)) ? (state === '陪' ? null : mom) : null;
        return { out, done: false, day, n, left: DAY_LEN - n, where, me, mom: showMom, beside: state === '陪' };
      }
      let a = acts[i]; i++; n++;
      const sit = a === '坐'; if (sit) a = '等';
      let line = `${n}. ${sit ? '坐着' : a}`;
      if (MV[a]) {
        const q = [me[0] + MV[a][0], me[1] + MV[a][1]];
        if (free(q)) { me = q; inc(mine, me); if (state === '陪' && !saidFollow) { line += '：她跟在你后头。'; saidFollow = true; } }
        else line += '：过不去。';
      } else if (a === '回') {
        if (eq(me, GATE)) { out.push(line + (state === '陪' ? '：你摇着车回家了，她跟在后头。' : '：你摇着车回家了。')); broke = true; break; }
        line += '：这里不是园门。';
      } else if (a === '喊') {
        if (state === '陪') line += '：她就在你旁边，应了一声。';
        else if (mom && (state === '找' || state === '看见') && isee(me, mom)) { state = '陪'; called++; wasCalled = true; line += '：你喊了她一声。她走过来，在你旁边站着，什么也没问。'; }
        else line += '：没人应。';
      }
      const k = kind(me); if (k) stay[k]++;
      if (COME[day] && n === COME[day] && state === null) { mom = GATE; state = '找'; came++; plan = []; tq = targets.slice(); inc(hers, mom); }
      else if (state === '找') {
        if (!plan.length) { if (tq.length) plan = bfs(mom, tq.shift()); else { state = '回'; plan = bfs(mom, GATE); } }
        if (plan.length) { mom = plan.shift(); inc(hers, mom); }
        if (sees(me, mom)) { state = '看见'; found++; plan = []; foundFlag = true; }
      } else if (state === '看见') { state = '回'; plan = bfs(mom, GATE); }
      else if (state === '回') { if (plan.length) { mom = plan.shift(); inc(hers, mom); } if (eq(mom, GATE)) state = '走了'; }
      else if (state === '陪') { mom = me; inc(hers, mom); }
      const vis = !!(mom && (state === '找' || state === '看见' || state === '回') && isee(me, mom));
      let say = null;
      if (vis) {
        if (!seenToday) { isaw++; seenToday = true; }
        if (state === '找') say = '你看见她了。她端着眼镜，四下张望。';
        else if (state === '看见') say = '她看见你了，站了一下。';
        else if (state === '回') say = '她转身往回走，走得很慢。';
      } else if (lastVis && (state === '找' || state === '回' || state === '走了')) say = '她走远了，你看不见她了。';
      const said = !!(say && say !== lastSay);
      if (said) { line += '　' + say; lastSay = say; }
      lastVis = vis;
      if (sit && !said && n < DAY_LEN) { i--; continue; }
      out.push(line);
    }
    if (!broke) out.push('天黑了，你摇着车回家。');
    if (COME[day] && state !== null) { if (!seenToday) unseen++; if (!wasCalled && state !== '陪' && !foundFlag) lost++; }
  }
  const draw = g.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if ('#O'.includes(g[y][x])) continue; const a = mine.get(K([x, y])) || 0, b = hers.get(K([x, y])) || 0; if (a && b) draw[y][x] = '%'; else if (b) draw[y][x] = 'm'; else if (a) draw[y][x] = ','; }
  return { out, done: true, draw, came, isaw, called, unseen, lost, mineSet: mine, hersSet: hers };
}
const api = { run, MAP, H, W, GATE, SPOT, kind };
if (typeof module !== 'undefined') module.exports = api; else root.Yuan = api;
})(this);
