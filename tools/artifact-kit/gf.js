// uses: econ
/* ---------- Lab 1: Is it a Giffen good? ---------- */
function gfLab1() {
  if (!$("#a1") || !$("#a2")) return;
  const sub = +$("#a1").value, inc = +$("#a2").value, net = sub + inc, sg = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Lib.fmtN(Math.abs(v), 1);
  $("#e1").textContent = sg(sub); $("#e2").textContent = sg(inc); $("#e3").textContent = sg(net);
  $("#v1").textContent = inc >= 0 ? "Normal good: both effects raise the quantity of X, so demand slopes downward."
    : net > 0 ? "Inferior good, but not Giffen: the income effect partly offsets the substitution effect, and quantity still rises when price falls. Demand slopes downward."
    : net < 0 ? "Giffen good: the income effect outweighs the substitution effect, so quantity demanded falls when the price falls. Demand slopes upward."
    : "Borderline: the two effects cancel exactly, so quantity is unchanged.";
  const cx = 240, k = 6.5, bar = (y, v, cls, name) => SV.rect(Math.min(cx, cx + v * k), y, Math.abs(v) * k, 38, cls) + SV.text(cx + (v >= 0 ? -8 : 8), y + 24, name, "lbl bd", { "text-anchor": v >= 0 ? "end" : "start" }) + SV.text(cx + v * k + (v >= 0 ? 8 : -8), y + 24, sg(v), "lbl bd", { "text-anchor": v >= 0 ? "start" : "end" });
  let s = SV.line(cx, 20, cx, 270, "ax") + bar(40, sub, "f3", "Substitution") + bar(110, inc, "f2", "Income") + bar(190, net, net < 0 ? "f2" : "f1", "Net") + SV.text(cx, 290, "Change in quantity of X (units)", "sm", { "text-anchor": "middle" });
  $("#lab1").innerHTML = s;
}
Lib.slider($("#sl1"), { id: "a1", label: "Substitution effect (units of X)", min: 0, max: 20, step: 1, value: 12, fmt: (v) => "+" + v, onInput: gfLab1 });
Lib.slider($("#sl2"), { id: "a2", label: "Income effect (units of X)", min: -30, max: 15, step: 1, value: -15, fmt: (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), onInput: gfLab1 });
gfLab1();

/* ---------- Lab 2: budget line ---------- */
function gfLab2() {
  if (!$("#a3") || !$("#a4") || !$("#a5")) return;
  const M = +$("#a3").value, px = +$("#a4").value, py = +$("#a5").value, mx = M / px, my = M / py;
  $("#b1").textContent = Lib.fmtN(mx, 1); $("#b2").textContent = Lib.fmtN(my, 1); $("#b3").textContent = Lib.fmtN(px / py, 2);
  const msg = [];
  if (px < 3) msg.push("X is cheaper than before, so the line pivots outward around the Y-axis intercept");
  if (px > 3) msg.push("X is dearer than before, so the line pivots inward around the Y-axis intercept");
  if (py < 2) msg.push("Y is cheaper than before, so the line pivots outward around the X-axis intercept");
  if (py > 2) msg.push("Y is dearer than before, so the line pivots inward around the X-axis intercept");
  if (M > 120) msg.push("income is higher, which moves the line outward");
  if (M < 120) msg.push("income is lower, which moves the line inward");
  $("#v2").textContent = msg.length ? msg.join("; ") + "." : "This is the starting budget line: M = $120, PX = $3, PY = $2.";
  const F = frame(480, 360, 50, 460, 20, 320, 120, 0, 120);
  let s = axes(F, "Good X", "Good Y");
  s += SV.line(F.X(0), F.Y(40 * 1.5), F.X(40), F.Y(0), "gr", { style: "stroke-width:2.5" }) + SV.text(F.X(40) + 4, F.Y(0) - 8, "original", "sm", { "text-anchor": "start" });
  s += SV.line(F.X(0), F.Y(Math.min(my, 120)), F.X(Math.min(mx, 120)), F.Y(0), "c1") + SV.circle(F.X(mx), F.Y(0), 5, "dot1") + SV.circle(F.X(0), F.Y(my), 5, "dot1");
  s += SV.text(F.X(mx) + (mx > 100 ? -6 : 8), F.Y(0) - 12, Lib.fmtN(mx, 1), "lbl bd t1", { "text-anchor": mx > 100 ? "end" : "start" }) + SV.text(F.X(0) + 10, F.Y(my) + 4, Lib.fmtN(my, 1), "lbl bd t1", { "text-anchor": "start" });
  $("#lab2").innerHTML = s;
}
Lib.slider($("#sl3"), { id: "a3", label: "Income (M)", min: 60, max: 180, step: 10, value: 120, fmt: (v) => "$" + v, onInput: gfLab2 });
Lib.slider($("#sl4"), { id: "a4", label: "Price of X", min: 1.5, max: 6, step: 0.5, value: 3, fmt: (v) => "$" + v.toFixed(2), onInput: gfLab2 });
Lib.slider($("#sl5"), { id: "a5", label: "Price of Y", min: 1.5, max: 4, step: 0.5, value: 2, fmt: (v) => "$" + v.toFixed(2), onInput: gfLab2 });
gfLab2();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "The price of X falls. Which type of good matches each pair of effects?",
  buckets: [{ label: "Normal good" }, { label: "Inferior, not Giffen" }, { label: "Giffen good" }],
  items: [
    { text: "Substitution +10, income +4", b: 0 }, { text: "Substitution +8, income +8", b: 0 },
    { text: "Substitution +10, income −4", b: 1 }, { text: "Substitution +12, income −9", b: 1 },
    { text: "Substitution +12, income −15", b: 2 }, { text: "Substitution +5, income −11", b: 2 },
  ],
  done: "Add the two effects: a negative total with a price fall means a Giffen good.",
});
Lib.classify($("#cl2"), {
  prompt: "Is each statement about the substitution effect or the income effect?",
  buckets: [{ label: "Substitution effect" }, { label: "Income effect" }],
  items: [
    { text: "Movement along the same indifference curve", b: 0 }, { text: "Caused by a change in relative prices", b: 0 }, { text: "Always raises quantity when price falls", b: 0 }, { text: "Found with a hypothetical budget line", b: 0 },
    { text: "Movement to a different indifference curve", b: 1 }, { text: "Caused by a change in real income", b: 1 }, { text: "Can raise or lower quantity, depending on the good", b: 1 }, { text: "Larger than the substitution effect for a Giffen good", b: 1 },
  ],
  done: "The substitution effect always follows the law of demand. The income effect is the one that can break it.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Budget line", "All combinations of two goods the consumer can just afford"],
  ["Indifference curve", "All combinations that give the same satisfaction"],
  ["Substitution effect", "Change in quantity from a change in relative prices, holding utility constant"],
  ["Income effect", "Change in quantity from the change in real income"],
  ["Inferior good", "A good with a negative income effect: demand falls as income rises"],
  ["Giffen good", "An inferior good whose income effect outweighs its substitution effect"],
] });
Lib.order($("#o1"), { prompt: "Put the steps for splitting a price fall into its two effects in order.", items: [
  "Find the original equilibrium A, where the budget line is tangent to IC₁.",
  "Draw the new budget line after the price fall.",
  "Draw a hypothetical line parallel to the new budget line, tangent to IC₁ at S.",
  "The move from A to S is the substitution effect.",
  "The move from S to the new equilibrium F is the income effect.",
] });
Lib.calc($("#c1"), { qs: [
  { q: "Income is $120 and the price of X is $3. What is the maximum quantity of X the consumer can buy?", a: 40, hint: "M ÷ price of X.", sol: "120 ÷ 3 = 40 units." },
  { q: "Income is $120 and the price of Y is $2. What is the maximum quantity of Y?", a: 60, hint: "M ÷ price of Y.", sol: "120 ÷ 2 = 60 units." },
  { q: "PX = $3 and PY = $2. What is the slope of the budget line (ignore the sign)?", a: 1.5, hint: "Slope = PX ÷ PY.", sol: "3 ÷ 2 = 1.5." },
  { q: "After a price fall the substitution effect is +12 units of X and the income effect is −15 units. What is the net change in X?", a: -3, hint: "Add the two effects.", sol: "+12 + (−15) = −3 units, so quantity falls: a Giffen good." },
  { q: "The quantity of X falls from 15 to 12 units after a price fall. The substitution effect is +12.4 units. What is the income effect?", a: -15.4, tol: 0.05, hint: "Net change = substitution + income.", sol: "Net = 12 − 15 = −3. Income effect = −3 − 12.4 = −15.4 units." },
  { q: "The price of X rises to $6 and income stays at $120. What is the new maximum quantity of X?", a: 20, hint: "M ÷ new price.", sol: "120 ÷ 6 = 20 units." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "A fall in the price of a good causes the budget line to", opts: ["shift in parallel outward", "pivot outward around the intercept of the other good", "pivot inward", "become horizontal"], a: 1, why: "Only the price of X changed, so the Y-axis intercept stays fixed and the X-axis intercept moves out." },
  { q: "The substitution effect of a price fall is shown by a move", opts: ["between two indifference curves", "along the original indifference curve", "along the new budget line only", "from the origin"], a: 1, why: "The substitution effect holds satisfaction constant, so it is a move along the original indifference curve." },
  { q: "Which statement about Giffen goods is correct?", opts: ["They are normal goods", "They are inferior goods with an income effect larger than the substitution effect", "The substitution effect is negative", "Demand always slopes downward"], a: 1, why: "A Giffen good must be inferior, and its negative income effect must outweigh the substitution effect." },
  { q: "A price fall leads to substitution +6 and income −2. The good is", opts: ["a normal good", "an inferior good but not a Giffen good", "a Giffen good", "a luxury good"], a: 1, why: "The income effect is negative but smaller, so the net effect is +4: quantity rises. Inferior, not Giffen." },
  { q: "Why are Giffen goods likely to be rare?", opts: ["They need a large budget share, no close substitutes and a very strong income effect", "They are always banned", "They are always luxuries", "The substitution effect is zero"], a: 0, why: "All three conditions have to hold together, which is unusual." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Giffen good", "An inferior good whose demand curve slopes upward because the negative income effect outweighs the substitution effect."],
  ["Inferior good", "A good with a negative income effect: demand falls as real income rises."],
  ["Normal good", "A good with a positive income effect: demand rises as real income rises."],
  ["Budget line", "All combinations of two goods a consumer can just afford with a given income and prices."],
  ["Indifference curve", "All combinations of two goods that give the consumer the same level of satisfaction."],
  ["Marginal rate of substitution", "The rate at which a consumer will swap one good for another and stay equally satisfied; it diminishes along a convex curve."],
  ["Substitution effect", "The change in quantity demanded caused by a change in relative prices, with satisfaction held constant."],
  ["Income effect", "The change in quantity demanded caused by the change in real income that follows a price change."],
  ["Real income", "What a consumer's income can actually buy, given prices."],
  ["Utility maximisation", "Choosing the bundle on the highest indifference curve the budget line allows: where the line is tangent to the curve."],
  ["Veblen good", "A good whose demand rises with price because a high price signals status, not because of an income effect."],
] });

/* ---------- original diagram (own scope) ---------- */
(function () {

const px = x => 70 + 9*x;
const py = y => 560 - (530/65)*y;

function hyperbolaPath(k, xMax){
  const xMin = k/65;
  const pts = [];
  const N = 48;
  for(let i=0;i<=N;i++){
    const t = i/N;
    const x = xMin * Math.pow(xMax/xMin, t);
    const y = k/x;
    pts.push([px(x), py(y)]);
  }
  return 'M ' + pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L ');
}

function budgetPx(pX, pY, M){
  return {x1:px(0), y1:py(M/pY), x2:px(M/pX), y2:py(0)};
}

// clip a line y = c - m*x to the plot box x:[0,90] y:[0,65]
function compensatedPx(S, m){
  const c = S.y + m*S.x;
  const candidates = [];
  const yAt0 = c;                if(yAt0>=0 && yAt0<=65) candidates.push([0,yAt0]);
  const yAt90 = c - m*90;        if(yAt90>=0 && yAt90<=65) candidates.push([90,yAt90]);
  const xAt0 = c/m;              if(xAt0>=0 && xAt0<=90) candidates.push([xAt0,0]);
  const xAt65 = (c-65)/m;        if(xAt65>=0 && xAt65<=90) candidates.push([xAt65,65]);
  candidates.sort((a,b)=>a[0]-b[0]);
  const p1 = candidates[0], p2 = candidates[candidates.length-1];
  return {x1:px(p1[0]),y1:py(p1[1]),x2:px(p2[0]),y2:py(p2[1])};
}

function arrowPath(p1,p2,bow){
  const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
  const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.hypot(dx,dy)||1;
  const nx=-dy/len, ny=dx/len;
  const cx=mx+nx*bow, cy=my+ny*bow;
  return `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q ${cx.toFixed(1)},${cy.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
}

const M=120, pY=2;

const scenarios = {
  fall: {
    label:'Price of X falls',
    p0:3, p1:1.5,
    kInitial:562.5, kFinal:612,
    A:{x:15,y:37.5}, S:{x:27.386,y:20.545}, F:{x:12,y:51},
    priceReadout:'Pₓ: $3.00 → $1.50 · Pᵧ: $2.00 · M: $120',
    steps:[
      {name:'Initial equilibrium',
       text:'At <b>Pₓ = $3</b>, the consumer settles at <b>A</b> — the bundle where the budget line is tangent to IC₁. They buy <b>15 units of X</b> and 37.5 of Y.'},
      {name:'Price falls',
       text:'Pₓ drops to <b>$1.50</b>. Y\'s price and income M are unchanged, so the budget line pivots outward around its Y-intercept — the whole shaded triangle of affordable bundles grows.'},
      {name:'Substitution effect',
       text:'Freeze utility on IC₁ and ask: with X relatively cheaper, how does the consumer reshuffle spending? They slide along IC₁ to <b>S</b>. Substitution effect: <b>+12.4 units of X</b> — always positive when a good\'s own price falls.'},
      {name:'Income effect & result',
       text:'Now restore real purchasing power (drop the hypothetical line, reinstate the true one). Because X is so strongly inferior here, the consumer moves from S down to <b>F</b> — <b>−15.4 units</b>, more than wiping out the substitution effect. Net: X demand <b>falls from 15 to 12</b> even though its price fell. That\'s the Giffen paradox.'}
    ]
  },
  rise: {
    label:'Price of X rises',
    p0:3, p1:6,
    kInitial:562.5, kFinal:57,
    A:{x:15,y:37.5}, S:{x:13.69,y:41.08}, F:{x:19,y:3},
    priceReadout:'Pₓ: $3.00 → $6.00 · Pᵧ: $2.00 · M: $120',
    steps:[
      {name:'Initial equilibrium',
       text:'Same starting point: at <b>Pₓ = $3</b> the consumer is at <b>A</b>, tangent to IC₁, buying <b>15 units of X</b>.'},
      {name:'Price rises',
       text:'Pₓ doubles to <b>$6</b>. The budget line pivots <em>inward</em> around the Y-intercept — real purchasing power over X collapses.'},
      {name:'Substitution effect',
       text:'Holding utility fixed on IC₁, the now-dearer X is swapped for Y, sliding the consumer to <b>S</b>. Substitution effect: <b>−1.3 units of X</b> — the ordinary, negative response to a price rise.'},
      {name:'Income effect & result',
       text:'Reinstating the real (much poorer) budget line moves the consumer from S out to <b>F</b> — <b>+5.3 units</b>, on a far lower indifference curve (IC₂ collapses in toward the origin — real income has fallen a lot). X is so strongly inferior that, unable to afford Y, the consumer buys <em>more</em> X to survive. Net: demand <b>rises from 15 to 19</b> even though the price rose — the classic "potatoes in a famine" story.'}
    ]
  }
};

let scenarioKey='fall', step=0, playing=false, timer=null;

const el = id => document.getElementById(id);
const stepsEl = el('steps');

function renderStepsList(){
  stepsEl.innerHTML='';
  scenarios[scenarioKey].steps.forEach((s,i)=>{
    const row=document.createElement('div');
    row.className='step-row'+(i===step?' active':'')+(i<step?' done':'');
    row.innerHTML=`<span class="step-dot">${i<step?'✓':i+1}</span><span class="step-name">${s.name}</span>`;
    row.addEventListener('click',()=>{ stopPlay(); step=i; render(); });
    stepsEl.appendChild(row);
  });
}

function setLabel(gId,x,y,text,sub){
  const g=el(gId);
  const [t1,t2]=g.children;
  t1.setAttribute('x',px(x)+10); t1.setAttribute('y',py(y)-10); t1.textContent=text;
  t2.setAttribute('x',px(x)+10); t2.setAttribute('y',py(y)+6); t2.textContent=sub;
}

function render(){
  const sc = scenarios[scenarioKey];
  const {A,S,F,kInitial,kFinal,p0,p1} = sc;

  el('btnFall').classList.toggle('active',scenarioKey==='fall');
  el('btnFall').setAttribute('aria-selected',scenarioKey==='fall');
  el('btnRise').classList.toggle('active',scenarioKey==='rise');
  el('btnRise').setAttribute('aria-selected',scenarioKey==='rise');
  el('priceReadout').textContent = sc.priceReadout;

  // curves
  el('icInitial').setAttribute('d', hyperbolaPath(kInitial, 70));
  el('icFinal').setAttribute('d', hyperbolaPath(kFinal, 70));
  el('icFinal').style.opacity = step>=2 ? 1 : 0;

  // budget lines
  const bi = budgetPx(p0,pY,M);
  Object.assign(el('budgetInitial'),{});
  el('budgetInitial').setAttribute('x1',bi.x1); el('budgetInitial').setAttribute('y1',bi.y1);
  el('budgetInitial').setAttribute('x2',bi.x2); el('budgetInitial').setAttribute('y2',bi.y2);
  el('budgetInitial').style.opacity = step<=1 ? 1 : 0.35;

  const bf = budgetPx(p1,pY,M);
  el('budgetFinal').setAttribute('x1',bf.x1); el('budgetFinal').setAttribute('y1',bf.y1);
  el('budgetFinal').setAttribute('x2',bf.x2); el('budgetFinal').setAttribute('y2',bf.y2);
  el('budgetFinal').style.opacity = step>=1 ? 1 : 0;

  const m = p1/pY;
  const bc = compensatedPx(S, m);
  el('budgetComp').setAttribute('x1',bc.x1); el('budgetComp').setAttribute('y1',bc.y1);
  el('budgetComp').setAttribute('x2',bc.x2); el('budgetComp').setAttribute('y2',bc.y2);
  el('budgetComp').style.opacity = (step===2) ? 1 : 0;

  // points
  el('ptA').setAttribute('cx',px(A.x)); el('ptA').setAttribute('cy',py(A.y));
  el('ptS').setAttribute('cx',px(S.x)); el('ptS').setAttribute('cy',py(S.y));
  el('ptS').style.opacity = step>=2 ? 1 : 0;
  el('ptF').setAttribute('cx',px(F.x)); el('ptF').setAttribute('cy',py(F.y));
  el('ptF').style.opacity = step>=3 ? 1 : 0;

  setLabel('labA',A.x,A.y,'A',`(${A.x}, ${A.y})`);
  setLabel('labS',S.x,S.y,'S',`(${S.x.toFixed(1)}, ${S.y.toFixed(1)})`);
  setLabel('labF',F.x,F.y,'F',`(${F.x}, ${F.y})`);
  el('labS').style.opacity = step>=2 ? 1:0;
  el('labF').style.opacity = step>=3 ? 1:0;

  // arrows
  const Apx={x:px(A.x),y:py(A.y)}, Spx={x:px(S.x),y:py(S.y)}, Fpx={x:px(F.x),y:py(F.y)};
  el('arrowSub').setAttribute('d', arrowPath(Apx,Spx,-22));
  el('arrowSub').style.opacity = step>=2 ? 1:0;
  el('arrowInc').setAttribute('d', arrowPath(Spx,Fpx,-22));
  el('arrowInc').style.opacity = step>=3 ? 1:0;
  el('arrowNet').setAttribute('d', arrowPath(Apx,Fpx,40));
  el('arrowNet').style.opacity = step>=3 ? 1:0;

  // narration + steps list
  renderStepsList();
  el('narration').innerHTML = sc.steps[step].text;

  // effect table
  const sub = S.x-A.x, inc = F.x-S.x, net = F.x-A.x;
  const fmt = v => (v>=0?'+':'')+v.toFixed(1);
  el('valSub').textContent = step>=2 ? fmt(sub) : '—';
  el('valSub').classList.toggle('pending', step<2);
  el('valInc').textContent = step>=3 ? fmt(inc) : '—';
  el('valInc').classList.toggle('pending', step<3);
  el('valNet').textContent = step>=3 ? fmt(net) : '—';
  el('valNet').classList.toggle('pending', step<3);

  el('btnPrev').disabled = step===0;
  el('btnNext').disabled = step===3;
}

function stopPlay(){
  playing=false; clearInterval(timer);
  el('btnPlay').textContent='▶ Play';
}

el('btnFall').addEventListener('click',()=>{ stopPlay(); scenarioKey='fall'; step=0; render(); });
el('btnRise').addEventListener('click',()=>{ stopPlay(); scenarioKey='rise'; step=0; render(); });
el('btnPrev').addEventListener('click',()=>{ stopPlay(); step=Math.max(0,step-1); render(); });
el('btnNext').addEventListener('click',()=>{ stopPlay(); step=Math.min(3,step+1); render(); });
el('btnPlay').addEventListener('click',()=>{
  if(playing){ stopPlay(); return; }
  if(step>=3) step=0;
  playing=true; el('btnPlay').textContent='⏸ Pause';
  render();
  timer=setInterval(()=>{
    step++;
    if(step>3){ stopPlay(); step=3; render(); return; }
    render();
  },2400);
});

render();

})();
