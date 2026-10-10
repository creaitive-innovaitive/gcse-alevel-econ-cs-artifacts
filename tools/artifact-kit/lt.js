// uses: econ
/* ---------- 1. stepper: the money market in a trap ---------- */
const FLOOR = 0.5, rOf = (m) => Math.max(FLOOR, 10 - 0.2 * m);
Lib.stepper($("#stA"), {
  w: 760, h: 400, label: "Money market diagram: demand for money turns flat at the lowest feasible interest rate", base: { ms: 20, flat: 0 },
  draw: (s) => {
    const F = frame(760, 400, 70, 730, 20, 350, 100, 0, 10), r = rOf(s.ms);
    let o = axes(F, "Quantity of money", "Interest rate (%)");
    const p = []; for (let m = 0; m <= 100; m += 1) p.push([F.X(m), F.Y(rOf(m))]);
    o += SV.path(ptsPath(p), "c1") + SV.text(F.X(14), F.Y(rOf(14)) - 8, "Demand for money", "lbl bd t1", { "text-anchor": "start" });
    o += SV.line(F.l, F.Y(FLOOR), F.r, F.Y(FLOOR), "gr") + SV.text(F.r - 4, F.Y(FLOOR) - 8, "Effective lower bound", "sm", { "text-anchor": "end" });
    o += SV.line(F.X(s.ms), F.Y(0), F.X(s.ms), F.t, "c2") + SV.text(F.X(s.ms) + 8, F.t + 14, "Money supply", "lbl bd t2", { "text-anchor": "start" });
    o += SV.line(F.l, F.Y(r), F.X(s.ms), F.Y(r), "gr") + SV.circle(F.X(s.ms), F.Y(r), 7, "dot4") + SV.text(F.l - 8, F.Y(r) + 4, Lib.fmtN(r, 1) + "%", "lbl bd", { "text-anchor": "end" });
    if (s.flat) o += SV.text(F.X(75), F.Y(FLOOR) - 30, "Liquidity preference is absolute: extra money is simply held", "lbl bd t3", { "text-anchor": "middle", opacity: s.flat });
    return o;
  },
  steps: [
    { cap: "The central bank sets the <b>money supply</b>. Where it crosses the <b>demand for money</b>, the interest rate is set. Here the rate is 6%.", s: { ms: 20, flat: 0 } },
    { cap: "<b>Normal times:</b> the central bank raises the money supply. People hold the extra by buying bonds, so bond prices rise and the <b>interest rate falls</b> to 3%.", s: { ms: 35, flat: 0 } },
    { cap: "Keep going. The rate reaches the <b>effective lower bound</b>. At this level, holding money costs almost nothing compared with bonds.", s: { ms: 47.5, flat: 0 } },
    { cap: "<b>The trap:</b> demand for money is now flat. More money is just held as idle cash. The <b>rate does not fall</b>, so investment and spending get no extra push.", s: { ms: 75, flat: 1 } },
  ],
});

/* ---------- 2. stepper: bond price and the market rate ---------- */
Lib.stepper($("#stB"), {
  w: 760, h: 400, label: "Bond price against the market interest rate", base: { r: 5 },
  draw: (s) => {
    const F = frame(760, 400, 70, 730, 20, 350, 10, 0, 52000), price = 500 / (s.r / 100);
    let o = SV.line(F.l, F.t, F.l, F.b, "ax") + SV.line(F.l, F.b, F.r, F.b, "ax") + SV.text(F.l, F.t - 7, "Bond price (£)", "sm", { "text-anchor": "start" }) + SV.text(F.r, F.b + 24, "Market interest rate (%)", "sm", { "text-anchor": "end" });
    [10000, 25000, 50000].forEach((v) => { o += SV.line(F.l, F.Y(v), F.r, F.Y(v), "gr") + SV.text(F.l - 8, F.Y(v) + 4, "£" + v.toLocaleString(), "sm", { "text-anchor": "end" }); });
    [1, 2, 5, 8, 10].forEach((v) => { o += SV.text(F.X(v), F.b + 18, v + "%", "sm", { "text-anchor": "middle" }); });
    const p = []; for (let r = 1; r <= 10; r += 0.1) p.push([F.X(r), F.Y(500 / (r / 100))]);
    o += SV.path(ptsPath(p), "c1") + SV.line(F.X(s.r), F.Y(price), F.X(s.r), F.b, "gr") + SV.line(F.l, F.Y(price), F.X(s.r), F.Y(price), "gr") + SV.circle(F.X(s.r), F.Y(price), 8, "dot2");
    o += SV.text(F.X(s.r) + 14, F.Y(price) - 12, "£" + Math.round(price).toLocaleString(), "lbl bd t2", { "text-anchor": "start" });
    return o;
  },
  steps: [
    { cap: "A bond pays £500 a year. When the market interest rate is <b>5%</b>, it is worth £500 ÷ 0.05 = <b>£10,000</b>.", s: { r: 5 } },
    { cap: "Suppose traders expect rates to rise to <b>8%</b>. Nobody pays £10,000 for a 5% bond when 8% is on offer. The price falls to <b>£6,250</b>. <b>Rates up, bond prices down.</b>", s: { r: 8 } },
    { cap: "If rates <b>fall</b> to 2%, the same bond is worth <b>£25,000</b>. <b>Rates down, bond prices up.</b>", s: { r: 2 } },
    { cap: "At <b>1%</b> the price is very high. If rates rise from 1% to 2%, the price <b>halves</b>. Traders expect that loss, so they sell bonds and <b>hold cash</b>: the speculative demand for money behind the trap.", s: { r: 1 } },
  ],
});

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Does each description fit normal times or a liquidity trap?",
  buckets: [{ label: "Normal times" }, { label: "Liquidity trap" }],
  items: [
    { text: "A lower interest rate raises borrowing", b: 0 }, { text: "More money supply lowers the interest rate", b: 0 }, { text: "Velocity of money is stable", b: 0 },
    { text: "Rate is at or near zero and extra money is held idle", b: 1 }, { text: "Deflation makes the real rate positive", b: 1 }, { text: "Firms repay debt instead of investing", b: 1 }, { text: "Velocity of money collapses", b: 1 },
  ],
  done: "In a trap the usual chain from money supply to AD breaks at the interest rate and again at investment.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Liquidity preference", "The desire to hold wealth as money rather than bonds"],
  ["Effective lower bound", "The level near zero below which cutting the rate stops working"],
  ["Quantitative easing", "Creating reserves to buy long-term assets such as government bonds"],
  ["Forward guidance", "A commitment about future policy to move expectations"],
  ["Real interest rate", "Nominal rate minus inflation"],
  ["Balance-sheet recession", "Firms and households repay debt, so cheap money is not borrowed"],
] });
Lib.order($("#o1"), { prompt: "Put the path into a liquidity trap in order.", items: [
  "A recession or crisis arrives.",
  "The central bank cuts interest rates to near zero.",
  "People expect deflation, or rates to rise later, and hold cash.",
  "Extra money supply is held idle and the rate cannot fall further.",
  "Spending and real GDP do not recover.",
] });
Lib.calc($("#c1"), { qs: [
  { q: "A bond pays £500 a year for ever. The market interest rate is 8%. What is its price (£)?", a: 6250, unit: "£", hint: "Price = payment ÷ rate.", sol: "500 ÷ 0.08 = £6,250." },
  { q: "The bond was worth £10,000 at 5%. After rates rise to 8% it is worth £6,250. What is the percentage change in price?", a: -37.5, unit: "%", hint: "(new − old) ÷ old × 100.", sol: "(6,250 − 10,000) ÷ 10,000 × 100 = −37.5%." },
  { q: "The policy rate is 0% and inflation is −2%. What is the real interest rate (%)?", a: 2, unit: "%", hint: "Real rate = nominal − inflation.", sol: "0 − (−2) = +2%." },
  { q: "Money supply M = 40 and velocity V = 5. What is nominal spending MV?", a: 200, hint: "MV = PY.", sol: "40 × 5 = 200." },
  { q: "Velocity falls to 4. By how much must M rise to keep MV at 200?", a: 10, hint: "Find the new M needed, then subtract 40.", sol: "M = 200 ÷ 4 = 50. Rise = 50 − 40 = 10." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Liquidity trap", "Nominal interest rates at or close to zero and people prefer to hold money, so extra money supply cannot lower rates or raise AD."],
  ["Liquidity preference", "The desire to hold wealth as money rather than less liquid assets such as bonds."],
  ["Speculative demand for money", "Money held because bond prices are expected to fall, so interest rates are expected to rise."],
  ["Effective lower bound", "The level, close to zero or slightly negative, below which cutting the policy rate stops working."],
  ["Quantitative easing (QE)", "The central bank creates reserves to buy long-term assets, mainly government bonds."],
  ["Real interest rate", "Nominal interest rate minus the inflation rate."],
  ["Velocity of money", "How many times a unit of money is spent per period (MV = PY)."],
  ["Balance-sheet recession", "Firms and households repay debt after an asset price crash, so cheap money is not borrowed."],
  ["Forward guidance", "A central bank commitment about future policy, used to lower expected future rates and lift inflation expectations."],
  ["Deflation", "A sustained fall in the general price level. It raises the real interest rate and encourages delayed spending."],
  ["Helicopter money", "A direct transfer to households financed by the central bank."],
] });

/* ---------- original lab, charts, country evidence and exam content (own scope) ---------- */
(function () {

const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg';
const E=(tag,a={},p)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,k==='class'?String(a[k]).split(' ').map(x=>'lt-'+x).join(' '):a[k]);if(p)p.appendChild(e);return e};
const T=(p,x,y,txt,cls='t',anchor='start')=>{const e=E('text',{x,y,class:cls,'text-anchor':anchor},p);e.textContent=txt;return e};
function frame(svg,o){
  svg.innerHTML='';
  const W=480,H=300,L=46,R=16,Tp=14,B=40;
  const sx=v=>L+(v-o.x0)/(o.x1-o.x0)*(W-L-R), sy=v=>H-B-(v-o.y0)/(o.y1-o.y0)*(H-B-Tp);
  o.yt.forEach(v=>{E('line',{x1:L,x2:W-R,y1:sy(v),y2:sy(v),class:'grid'},svg);T(svg,L-6,sy(v)+4,v,'t','end')});
  o.xt.forEach(v=>{T(svg,sx(v),H-B+16,v,'t','middle')});
  E('line',{x1:L,x2:L,y1:Tp,y2:H-B,class:'axis'},svg);
  E('line',{x1:L,x2:W-R,y1:H-B,y2:H-B,class:'axis'},svg);
  if(o.xl)T(svg,(L+W-R)/2,H-6,o.xl,'t','middle');
  if(o.yl){const y=T(svg,12,(Tp+H-B)/2,o.yl,'t','middle');y.setAttribute('transform',`rotate(-90 12 ${(Tp+H-B)/2})`)}
  return{sx,sy,W,H,L,R,T:Tp,B};
}
const path=(svg,pts,cls,extra={})=>E('path',Object.assign({d:'M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L'),fill:'none','stroke-width':2.4,'stroke-linejoin':'round',stroke:cls},extra),svg);
const dot=(svg,x,y,fill,stroke)=>E('circle',{cx:x,cy:y,r:5,fill,stroke:stroke||fill,'stroke-width':2},svg);

/* ---------- Simulator ---------- */
const MS0=40, RMAX=10, K=2.5;
const S={ms:110,mt:40,lb:0.25,conf:0,b:3,g:0};
const sliders=[
 {k:'ms',l:'Money supply (QE)',min:20,max:120,step:1,h:'Starts at 40. Move right to print money.'},
 {k:'mt',l:'Where the trap begins',min:30,max:110,step:1,h:'Money supply above this: money demand is flat, so extra money is held idle. Lower = deeper trap.'},
 {k:'lb',l:'Lowest feasible rate (%)',min:-0.5,max:1,step:0.25,h:'The effective lower bound. Below zero means negative rates are possible.'},
 {k:'b',l:'Investment sensitivity to rates',min:0.5,max:6,step:0.25,h:'Low = firms ignore rate cuts (weak animal spirits or debt repayment).'},
 {k:'conf',l:'Business confidence shift',min:-10,max:15,step:1,h:'Shifts investment at every interest rate.'},
 {k:'g',l:'Government spending boost',min:0,max:20,step:1,h:'Fiscal stimulus, added to investment in shifting AD.'}
];
const presets={
 'Normal times':{ms:70,mt:90,lb:0.25,conf:0,b:3,g:0},
 'Trapped: print money':{ms:110,mt:40,lb:0.25,conf:0,b:3,g:0},
 'Trapped + fiscal':{ms:110,mt:40,lb:0.25,conf:0,b:3,g:15},
 'Trapped + confidence returns':{ms:110,mt:40,lb:0.25,conf:12,b:3,g:0},
 'Negative rates (−0.5%)':{ms:110,mt:40,lb:-0.5,conf:0,b:3,g:0}
};
const rate=(M,mt,lb)=>M>=mt?lb:lb+(RMAX-lb)*(1-M/mt);
function eq(s){let Y; if(s<=5)Y=60+s; else if(64+s/5<=80)Y=64+s/5; else Y=80; return{Y,P:100+s-Y}}
function ctrlBuild(host,defs,state,onchange){
  defs.forEach(d=>{
    const w=document.createElement('div');w.className='lt-sl';
    w.innerHTML=`<label for="i_${d.k}">${d.l}<output id="o_${d.k}"></output></label><input type="range" id="i_${d.k}" min="${d.min}" max="${d.max}" step="${d.step}"><small>${d.h}</small>`;
    host.appendChild(w);
    w.querySelector('input').addEventListener('input',e=>{state[d.k]=+e.target.value;onchange()});
  });
}
function syncCtrl(defs,state){defs.forEach(d=>{$('#i_'+d.k).value=state[d.k];$('#o_'+d.k).textContent=state[d.k]})}
function simRender(){
  const {ms,mt,lb,conf,b,g}=S;
  const r0=rate(MS0,mt,lb), r=rate(ms,mt,lb), dr=r-r0;
  const dI=conf-b*dr, s=K*(dI+g), e0=eq(0), e1=eq(s);
  const trapped=ms>=mt;
  const cell=(l,v)=>`<div><small>${l}</small><strong>${v}</strong></div>`;
  $('#chain').innerHTML=cell('Money supply',ms)+cell('Interest rate',r.toFixed(2)+'%')+cell('Δ Investment',(dI>=0?'+':'')+dI.toFixed(1))+cell('AD shift',(s>=0?'+':'')+s.toFixed(1))+cell('Real output',e1.Y.toFixed(1))+cell('Output gap',(80-e1.Y).toFixed(1));
  const gap=80-e1.Y;
  $('#verdict').innerHTML=`<span class="lt-pill ${trapped?'lt-trap':'lt-ok'}">${trapped?'In the trap':'Normal'}</span> `+
    (trapped&&ms>MS0&&dr===0?'Money supply has risen but the interest rate is stuck at the floor, so investment has not moved from money alone. ':'')+
    (!trapped?(dr<0?`The rate fell ${(-dr).toFixed(2)} points, lifting investment. `:'No change in the rate yet. '):'')+
    (g>0?`Government spending adds ${(K*g).toFixed(1)} to AD directly. `:'')+
    (conf>0?`Higher confidence adds ${(K*conf).toFixed(1)} to AD. `:'')+
    (gap<=0.05?'Output is at full capacity; further AD shifts raise prices.':`Output is still ${gap.toFixed(1)} below full capacity.`);
  // A
  const A=frame($('#cA'),{x0:0,x1:120,y0:-1,y1:10,xt:[0,20,40,60,80,100,120],yt:[0,2,4,6,8,10],xl:'Money supply',yl:'Interest rate %'});
  E('rect',{x:A.sx(mt),y:A.sy(lb)-((A.sy(lb)-A.sy(lb+1.2))),width:A.sx(120)-A.sx(mt),height:(A.sy(lb)-A.sy(lb+1.2)),fill:'var(--trap-soft)',opacity:.9},$('#cA'));
  T($('#cA'),A.sx(Math.min(mt+2,96)),A.sy(lb+0.7),'trap zone','t');
  E('line',{x1:A.L,x2:A.W-A.R,y1:A.sy(lb),y2:A.sy(lb),stroke:'var(--trap)','stroke-dasharray':'4 3'},$('#cA'));
  path($('#cA'),[[A.sx(0),A.sy(RMAX)],[A.sx(mt),A.sy(lb)],[A.sx(120),A.sy(lb)]],'var(--s2)');
  T($('#cA'),A.sx(mt*0.3)+8,A.sy(rate(mt*0.3,mt,lb))-8,'Md','tb');
  E('line',{x1:A.sx(MS0),x2:A.sx(MS0),y1:A.T,y2:A.H-A.B,stroke:'var(--muted)','stroke-dasharray':'4 3'},$('#cA'));
  T($('#cA'),A.sx(MS0)-4,A.T+10,'MS₀','t','end');
  E('line',{x1:A.sx(ms),x2:A.sx(ms),y1:A.T,y2:A.H-A.B,stroke:'var(--accent)','stroke-width':2.4},$('#cA'));
  T($('#cA'),A.sx(ms)+5,A.T+10,'MS','tb');
  dot($('#cA'),A.sx(ms),A.sy(r),'var(--accent)');
  T($('#cA'),A.sx(ms)-8,A.sy(r)-10,'r = '+r.toFixed(2)+'%','tb','end');
  // B
  const B=frame($('#cB'),{x0:0,x1:100,y0:-1,y1:10,xt:[0,20,40,60,80,100],yt:[0,2,4,6,8,10],xl:'Investment',yl:'Interest rate %'});
  const curve=(cf,cls,dash)=>{const a=50+cf+b*r0, hi=Math.min(10,a/b), lo=Math.max(-1,(a-100)/b);
    if(hi<=lo)return; path($('#cB'),[[B.sx(a-b*hi),B.sy(hi)],[B.sx(a-b*lo),B.sy(lo)]],cls,dash?{'stroke-dasharray':'5 4','stroke-width':1.6}:{})};
  curve(0,'var(--muted)',true);
  if(conf!==0)curve(conf,'var(--s1)',false); else curve(0,'var(--s1)',false);
  const I1=50+conf-b*dr;
  E('circle',{cx:B.sx(50),cy:B.sy(r0),r:5,fill:'var(--surface)',stroke:'var(--muted)','stroke-width':2},$('#cB'));
  if(I1>=0&&I1<=100)dot($('#cB'),B.sx(I1),B.sy(r),'var(--s1)');
  T($('#cB'),B.sx(50)+8,B.sy(r0)+16,'start','t');
  T($('#cB'),B.W-B.R,B.T+10,'Investment demand','tb','end');
  // C
  const C=frame($('#cC'),{x0:0,x1:100,y0:0,y1:120,xt:[0,20,40,60,80,100],yt:[0,20,40,60,80,100,120],xl:'Real output (index)',yl:'Price level'});
  E('line',{x1:C.sx(80),x2:C.sx(80),y1:C.T,y2:C.H-C.B,stroke:'var(--trap)','stroke-dasharray':'4 3'},$('#cC'));
  T($('#cC'),C.sx(80)+4,C.H-C.B-6,'full capacity','t');
  path($('#cC'),[[C.sx(0),C.sy(40)],[C.sx(65),C.sy(40)],[C.sx(80),C.sy(100)],[C.sx(80),C.sy(120)]],'var(--s3)');
  T($('#cC'),C.sx(8),C.sy(40)-6,'AS','tb');
  const ad=(sh,cls,dash)=>{const y1=Math.max(0,sh-20),y2=Math.min(100,100+sh);path($('#cC'),[[C.sx(y1),C.sy(100+sh-y1)],[C.sx(y2),C.sy(100+sh-y2)]],cls,dash?{'stroke-dasharray':'5 4','stroke-width':1.6}:{})};
  ad(0,'var(--muted)',true);
  if(Math.abs(s)>0.05)ad(s,'var(--accent)',false);
  T($('#cC'),C.sx(38),C.sy(62)-4,'AD₀','t');
  E('circle',{cx:C.sx(e0.Y),cy:C.sy(e0.P),r:5,fill:'var(--surface)',stroke:'var(--muted)','stroke-width':2},$('#cC'));
  dot($('#cC'),C.sx(e1.Y),C.sy(e1.P),'var(--accent)');
  T($('#cC'),C.sx(e1.Y)+2,C.sy(e1.P)+18,'Y = '+e1.Y.toFixed(1),'tb','middle');
  syncCtrl(sliders,S);
}
ctrlBuild($('#ctrl'),sliders,S,simRender);
const pb=$('#presets');
Object.keys(presets).forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{Object.assign(S,presets[n]);[...pb.children].forEach(x=>x.classList.remove('lt-on'));b.classList.add('lt-on');simRender()};pb.appendChild(b);if(i===1)b.classList.add('lt-on')});
simRender();

/* ---------- Velocity ---------- */
const V={m:250,v:0.8}, vdefs=[
 {k:'m',l:'Money stock M (index)',min:100,max:400,step:10,h:'Baseline is 100.'},
 {k:'v',l:'Velocity V',min:0.4,max:2.5,step:0.05,h:'Baseline is 2.0 (each unit is spent twice per year).'}];
function vRender(){
  const py=V.m*V.v, base=200;
  const bar=(l,val,max,cls,txt)=>`<div class="lt-bar ${cls||''}"><span>${l}</span><div class="lt-tr"><div class="lt-fl" style="width:${Math.min(100,val/max*100)}%"></div></div><span>${txt}</span></div>`;
  $('#bars').innerHTML=bar('Money M',V.m,400,'',V.m)+bar('Velocity V',V.v,2.5,'',V.v.toFixed(2))+bar('Spending M×V',py,800,'lt-pv',py.toFixed(0));
  const ch=(py/base-1)*100, mch=(V.m/100-1)*100;
  $('#vVerdict').textContent=`Baseline spending is 200. Money is up ${mch.toFixed(0)}%, spending is ${ch>=0?'up':'down'} ${Math.abs(ch).toFixed(0)}%. `+(mch>50&&Math.abs(ch)<15?'Velocity fell to absorb the new money: it is being held, not spent. This is the trap in quantity-theory form.':mch>50?'Velocity held up, so the extra money is passing into spending.':'');
  syncCtrl(vdefs,V);
}
ctrlBuild($('#ctrlV'),vdefs,V,vRender);
const vb=document.createElement('button');vb.textContent='Reset to baseline';vb.onclick=()=>{V.m=100;V.v=2;vRender()};$('#ctrlV').appendChild(vb);
vRender();

/* ---------- Rate history ---------- */
const Y0=1995, N=31, pad=(a,n)=>Array(n).fill(null).concat(a);
const rates=[
 {n:'UK',c:'var(--s1)',on:true,d:[6.5,6,7.25,6.25,5.5,6,4,4,3.75,4.75,4.5,5,5.5,2,.5,.5,.5,.5,.5,.5,.5,.25,.5,.75,.75,.1,.25,3.5,5.25,4.75,3.75]},
 {n:'USA',c:'var(--s2)',on:true,d:[5.5,5.25,5.5,4.75,5.5,6.5,1.75,1.25,1,2.25,4.25,5.25,4.25,.25,.25,.25,.25,.25,.25,.25,.5,.75,1.5,2.5,1.75,.25,.25,4.5,5.5,4.5,3.75]},
 {n:'Japan',c:'var(--s3)',on:true,d:[.5,.5,.5,.25,0,.25,0,0,0,0,0,.25,.5,.1,.1,.1,.1,.1,.1,.1,.1,-.1,-.1,-.1,-.1,-.1,-.1,-.1,-.1,.25,.75]},
 {n:'Eurozone',c:'var(--s4)',on:true,d:pad([3,4.75,3.25,2.75,2,2,2.25,3.5,4,2.5,1,1,1,.75,.25,.05,.05,0,0,0,0,0,0,2.5,4.5,3.15,2.15],4)}
];
let hoverYear=2020;
function histRender(){
  const svg=$('#hist'), F=frame(svg,{x0:1995,x1:2025,y0:-1,y1:8,xt:[1995,2000,2005,2010,2015,2020,2025],yt:[0,2,4,6,8],xl:'Year-end',yl:'Policy rate %'});
  E('rect',{x:F.L,y:F.sy(0.5),width:F.W-F.L-F.R,height:F.sy(-1)-F.sy(0.5),fill:'var(--trap-soft)',opacity:.9},svg);
  T(svg,F.L+6,F.sy(-1)-6,'near the floor (0.5% or less)','t');
  rates.filter(r=>r.on).forEach(r=>{
    let d='';r.d.forEach((v,i)=>{if(v===null)return;const x=F.sx(Y0+i),y=F.sy(v);d+=(d===''||r.d[i-1]===null?'M':'L')+x.toFixed(1)+','+y.toFixed(1)});
    E('path',{d,fill:'none',stroke:r.c,'stroke-width':2.2,'stroke-linejoin':'round'},svg);
  });
  const hx=F.sx(hoverYear);E('line',{x1:hx,x2:hx,y1:F.T,y2:F.H-F.B,stroke:'var(--muted)','stroke-dasharray':'3 3'},svg);
  rates.filter(r=>r.on&&r.d[hoverYear-Y0]!==null).forEach(r=>dot(svg,hx,F.sy(r.d[hoverYear-Y0]),r.c));
  $('#histOut').innerHTML=hoverYear+' · '+rates.filter(r=>r.on&&r.d[hoverYear-Y0]!==null).map(r=>`<span style="color:${r.c}">${r.n} ${r.d[hoverYear-Y0].toFixed(2)}%</span>`).join(' · ');
  svg._F=F;
}
const lg=$('#legend');
rates.forEach(r=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" checked><i style="background:${r.c}"></i>${r.n}`;l.querySelector('input').onchange=e=>{r.on=e.target.checked;histRender()};lg.appendChild(l)});
$('#hist').addEventListener('pointermove',e=>{const s=$('#hist'),b=s.getBoundingClientRect(),F=s._F,x=(e.clientX-b.left)/b.width*480;
  hoverYear=Math.max(1995,Math.min(2025,Math.round(1995+(x-F.L)/(F.W-F.L-F.R)*30)));histRender()});
histRender();

/* ---------- Tabs helper ---------- */
function tabs(host,items,render){
  host.innerHTML='';
  items.forEach((it,i)=>{const b=document.createElement('button');b.textContent=it.name;b.onclick=()=>{[...host.children].forEach(x=>{x.classList.remove('lt-on');x.setAttribute('aria-pressed','false')});b.classList.add('lt-on');b.setAttribute('aria-pressed','true');render(it,i)};host.appendChild(b);if(i===0)b.click()});
}

/* ---------- Countries ---------- */
const C=[
{name:'Japan',tag:'The original case. Near zero from 1999, negative rates 2016 to 2024.',
 kv:[['0.5% by 1995','Rates cut from about 6% in 1990 after the asset bubble burst'],['2001','First quantitative easing'],['−0.1%','Policy rate from January 2016'],['March 2024','Negative rates ended, first rise since 2007']],
 p:['Land and share prices collapsed from 1990. Firms had borrowed heavily against inflated assets, so they used profits to repay debt even when borrowing cost nothing. Richard Koo called this a balance-sheet recession. Deflation lifted real rates and encouraged delaying purchases.','Policy tried almost everything: zero rates, QE from 2001, large QQE from 2013 with a 2% inflation target, negative rates and yield curve control. Repeated fiscal packages pushed public debt above 200% of GDP, and the 1997 consumption tax rise (3% to 5%) was followed by a recession.'],
 l:'Lesson: once deflation expectations set in, they are hard to shift. The trap can last decades, and fiscal and monetary policy need to be coordinated.'},
{name:'USA',tag:'Zero rates 2008 to 2015 and again in 2020 to 2021, with the largest QE.',
 kv:[['0 to 0.25%','Federal funds target, December 2008 to December 2015'],['~$0.9tn → $4.5tn','Fed balance sheet, 2007 to 2014'],['~$9tn','Balance sheet peak, 2022'],['2009, 2020','Fiscal packages (ARRA about $800bn, CARES $2.2tn)']],
 p:['After the 2008 financial crisis the Fed cut to zero within a year, then ran three rounds of QE, plus forward guidance promising low rates. Unemployment fell slowly and inflation stayed below the 2% target for much of the decade.','In 2020 the Fed returned to zero within weeks and bought assets at pace, and Congress passed very large fiscal packages. Combined with supply shocks, inflation then rose sharply in 2021 to 2022 and rates were raised to 5.5% by 2023.'],
 l:'Lesson: the trap is escapable when fiscal and monetary stimulus arrive together and are large enough, though it also carries a risk of overshooting.'},
{name:'UK',tag:'Bank Rate 0.5% from March 2009. QE £895bn in total.',
 kv:[['0.5%','Bank Rate, March 2009 to August 2016'],['£895bn','Total asset purchases by 2021'],['0.1%','Record low, March 2020'],['5.25%','Peak Bank Rate, August 2023']],
 p:['The Bank of England cut Bank Rate from 5.75% (2007) to 0.5% and began QE in March 2009. From 2010 the government pursued fiscal consolidation, so monetary policy carried most of the stimulus. The 2012 Funding for Lending Scheme tried to push cheap credit to banks and firms.','Growth was slow, wage growth weak, and productivity stagnated. Bank Rate was cut to 0.1% in 2020 and negative rates were studied but not used. Inflation of 2022 to 2023 ended the low-rate era.'],
 l:'Lesson: QE helped avoid deflation, but tight fiscal policy at the same time slowed the recovery. Compare with the US, where fiscal support was larger.'},
{name:'Eurozone',tag:'Negative deposit rate from 2014. Fiscal rules limited the response.',
 kv:[['−0.10%','ECB deposit rate, June 2014 (first major bank to go negative)'],['−0.50%','Deposit rate, September 2019'],['2015','Asset purchase programme begins'],['July 2022','First rate rise, negative rates ended']],
 p:['The 2010 to 2012 sovereign debt crisis produced austerity in several members, so fiscal policy pulled in the opposite direction to monetary policy. Draghi\'s July 2012 promise to do "whatever it takes" calmed bond markets more than any spending did.','Negative rates and QE followed. Banks complained that negative rates squeezed their margins and could reduce lending, which is the risk of pushing past the effective lower bound.'],
 l:'Lesson: a currency union shares monetary policy but not fiscal policy, so fiscal space is uneven. Negative rates have limits.'},
{name:'China',tag:'Not a classic trap, but debated. Policy rates fell while demand stayed weak.',
 kv:[['4.35%','One-year benchmark lending rate, end of 2015'],['3.45% → 3.0%','One-year loan prime rate, 2022 to May 2025 (approx)'],['~0%','CPI inflation, close to zero or slightly negative in 2023 to 2024'],['Property slump','From 2021, weakening household wealth and confidence']],
 p:['China has more conventional room than Japan or the US: reserve requirement cuts, state-directed bank lending, and a large fiscal capacity. Rates are not at zero, and the central bank controls credit more directly.','Even so, since the property slump households have been saving and paying down mortgages, prices have been close to flat, and cuts to lending rates have done little to lift credit demand. Some economists compare this with Japan\'s early 1990s and describe it as trap-like. Others argue that policy space and a state banking system mean it is not.'],
 l:'Lesson: to call something a liquidity trap you need low rates, weak response of spending and money held idle. Weak demand for credit at a low rate is the key test.'}
];
tabs($('#ctabs'),C,c=>{$('#cbody').innerHTML=`<h3>${c.name}</h3><p class="lt-note" style="margin:4px 0 0">${c.tag}</p><div class="lt-kv">${c.kv.map(k=>`<div><b>${k[0]}</b><span>${k[1]}</span></div>`).join('')}</div>${c.p.map(x=>`<p>${x}</p>`).join('')}<p><em>${c.l}</em></p>`});

/* ---------- Exam ---------- */
const tabItems=[{name:'Q1 Japan data response',id:'q1'},{name:'Q2 Monetary vs fiscal',id:'q2'},{name:'Q3 Quantitative easing',id:'q3'}];
tabs($('#qtabs'),tabItems,it=>{
  const host=$('#qbody');host.innerHTML='';host.appendChild($('#'+it.id).content.cloneNode(true));
  host.classList.toggle('lt-annot',$('#annBtn').getAttribute('aria-pressed')==='true');
  const rb=host.querySelector('.lt-revealBtn'),ans=host.querySelector('.lt-ans');
  rb.onclick=()=>{const o=ans.classList.toggle('lt-open');rb.textContent=o?'Hide model answer':'Show model answer'};
  if(it.id==='q1'){const d=[[1998,.25,.6],[1999,0,-.3],[2000,.25,-.7],[2001,0,-.7],[2002,0,-.9],[2003,0,-.3],[2004,0,0],[2005,0,-.3]];
    host.querySelector('#q1tbl').innerHTML='<thead><tr><th>Year</th><th class="lt-n">Policy rate %</th><th class="lt-n">CPI inflation %</th><th class="lt-n">Real rate %</th></tr></thead><tbody>'+d.map(r=>`<tr><td>${r[0]}</td><td class="lt-n">${r[1].toFixed(2)}</td><td class="lt-n">${r[2].toFixed(1)}</td><td class="lt-n">${(r[1]-r[2]).toFixed(2)}</td></tr>`).join('')+'</tbody>'}
  const ck=host.querySelector('.lt-check');
  const upd=()=>{let t=0;ck.querySelectorAll('input:checked').forEach(i=>t+=+i.dataset.m);const mx=+ck.dataset.max,p=t/mx;
    ck.querySelector('.lt-score').textContent=`Indicative score: ${t} / ${mx}`+(p>=.75?' · top level territory':p>=.45?' · middle level':' · lower level, add development and evaluation')};
  ck.addEventListener('change',upd);upd();
});
$('#annBtn').onclick=e=>{const on=e.target.getAttribute('aria-pressed')!=='true';e.target.setAttribute('aria-pressed',on);e.target.textContent=on?'Hide marking highlights':'Show marking highlights';$('#qbody').classList.toggle('lt-annot',on)};

/* ---------- Diagnostic ---------- */
$('#diag').addEventListener('change',()=>{const n=document.querySelectorAll('#diag input:checked').length;
  $('#diagOut').textContent=n+' of 5 present. '+(n>=4?'Strong case for a liquidity trap.':n>=2?'Some trap-like features. Look for the missing ones before concluding.':'Weak case. Look for a different explanation.')});

/* ---------- MCQ ---------- */
const mcq=[
 {q:'Which statement best describes a liquidity trap?',o:['Interest rates are high and demand for money is low','Interest rates are so low that extra money is held rather than spent or invested','The central bank runs out of reserves to lend to banks','Banks refuse to lend to each other'],a:1,e:'Option B is the definition. D describes a credit crunch or liquidity crisis, which is a different problem.'},
 {q:'In a money market diagram, the money demand curve in a liquidity trap is:',o:['Vertical','Perfectly elastic at a low interest rate','Upward sloping','Unaffected by the interest rate'],a:1,e:'At the effective lower bound people are willing to hold any amount of money at that rate, so demand is horizontal.'},
 {q:'Which policy is most likely to raise aggregate demand in a liquidity trap?',o:['Raising reserve requirements for banks','A cut in the policy rate of 0.25 percentage points','Debt-financed government spending on infrastructure','A rise in income tax to reduce the deficit'],a:2,e:'Government spending adds to AD directly and does not crowd out private investment when rates are stuck at the floor.'},
 {q:'A country has a nominal interest rate of 0% and inflation of −2%. The real interest rate is:',o:['−2%','0%','+2%','+4%'],a:2,e:'Real rate = nominal − inflation = 0 − (−2) = +2%. Deflation raises the real cost of borrowing, which makes the trap worse.'}
];
mcq.forEach((m,qi)=>{const d=document.createElement('div');d.className='lt-card lt-mcq';d.innerHTML=`<h3>${qi+1}. ${m.q}</h3>`;
  m.o.forEach((t,i)=>{const b=document.createElement('button');b.className='lt-opt';b.textContent='ABCD'[i]+'. '+t;b.onclick=()=>{if(d.classList.contains('lt-done'))return;d.classList.add('lt-done');b.classList.add(i===m.a?'lt-right':'lt-wrong');d.querySelectorAll('.lt-opt')[m.a].classList.add('lt-right')};d.appendChild(b)});
  const p=document.createElement('p');p.className='lt-exp';p.textContent=m.e;d.appendChild(p);$('#mcqs').appendChild(d)});

})();
