Lib.quiz($("#qz1"), { qs: [
  { q: "A mean-reversion setup assumes that after an extreme fall", opts: ["the trend always continues", "a bounce is more likely than a further collapse", "volume does not matter", "the daily chart is useless"], a: 1, why: "It is the opposite of trend following: an extreme move is treated as more likely to partly reverse." },
  { q: "In this setup, the volume condition looks for", opts: ["very low volume", "volume at least twice normal", "no change in volume", "falling volume only"], a: 1, why: "A spike of 2x or more suggests heavy, fear-driven selling." },
  { q: "A sell limit order is", opts: ["an instruction to buy at any price", "an instruction to sell once the price reaches a set level", "a stop-loss", "a type of chart"], a: 1, why: "It sells automatically at the target so no decision is made under pressure." },
  { q: "Profit factor is", opts: ["wins divided by losses (count)", "gross profit divided by gross loss", "total return divided by time", "maximum drawdown"], a: 1, why: "It compares total money won with total money lost." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Mean reversion", "The idea that prices that move to an extreme tend to move back towards an average."],
  ["RSI", "Relative Strength Index: a 0 to 100 measure of recent price momentum. Below 20 is a rare, very oversold reading."],
  ["Bollinger Band", "A band drawn two standard deviations around a moving average. A close below the lower band is an unusually low price."],
  ["Volume spike", "Trading volume at least twice its usual level."],
  ["Support", "A price level where earlier falls have stopped."],
  ["Sell limit order", "An instruction to sell automatically once the price reaches a set level."],
  ["Backtest", "Running a set of rules on historical prices to see what would have happened."],
  ["Profit factor", "Gross profit divided by gross loss."],
  ["Win rate", "The share of trades that made a profit."],
  ["Max drawdown", "The largest fall from a peak to a trough in the value of a strategy."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

const CLOSE=[92,91.6,89.2,89.3,87.8,89.6,87.4,87,86.8,85,83.8,82.2,83.2,80.6,79.5,81.6,82,85,85.8,86.1,87.6,90,91.4,95.1,95.6,98,99.2,102.3,102.9,104.9,108.7,108.5,112.5,112.9,115.7,117,119.9,119.9,121.3,126,124.8,127,130.7,131.4,132.8,135,134,135,132,133,130,131,128,129,126,127,124,121,122,118,119,115,112,113,108,104,105,101,92,93,95,91,88,85,76,79,82,85.5,84.5,88,91,94,93,97,100,99,103,106,104,108,111,110,114,113,116,115,116.3,118.2,118.2,115.9,116.8,117,119.1,117.1,117.4,117.7,116.8,118.7,118.9,118.5,120.1,118.5,118,118.9,117.7,120.4,120.5,119.5,119.1,118.7,121.3,121.1,119.4,120.2,121,120,120.6,120.9,120.9,122.4], VOL=[126,126,123,83,129,107,107,119,101,123,104,117,98,129,103,85,111,84,126,110,96,116,88,111,130,89,126,105,102,80,118,107,124,100,121,104,128,124,94,116,83,121,91,118,96,97,105,109,90,111,108,99,98,95,88,94,98,92,106,87,110,114,138,112,103,111,90,109,220,115,90,142,96,120,263,185,100,110,94,106,87,102,99,103,91,92,98,112,111,94,98,90,92,105,111,111,108,114,89,106,106,96,91,107,113,90,100,92,97,86,95,93,114,86,94,108,99,97,103,109,91,104,107,101,86,89,113,107,89,98], N=CLOSE.length, SUP=79.5, BUY=74, A_DAY=68;
const $=s=>document.querySelector(s), esc=s=>s;

/* indicators */
const I=(()=>{const rsi=[],mid=[],lo=[],up=[],dd=[],vr=[],don=[],vavg=[];let ag=0,al=0;
 for(let i=0;i<N;i++){
  if(i===0)rsi.push(null);else{const ch=CLOSE[i]-CLOSE[i-1],g=Math.max(ch,0),l=Math.max(-ch,0);
   if(i<=14){ag+=g/14;al+=l/14;rsi.push(i===14?100-100/(1+ag/(al||1e-9)):null)}else{ag=(ag*13+g)/14;al=(al*13+l)/14;rsi.push(100-100/(1+ag/(al||1e-9)))}}
  if(i>=20){const w=CLOSE.slice(i-20,i+1),m=w.reduce((a,b)=>a+b)/21,sd=Math.sqrt(w.reduce((a,b)=>a+(b-m)**2,0)/21);mid.push(m);lo.push(m-2*sd);up.push(m+2*sd)}else{mid.push(null);lo.push(null);up.push(null)}
  dd.push(1-CLOSE[i]/Math.max(...CLOSE.slice(Math.max(0,i-20),i+1)));
  const vw=VOL.slice(Math.max(0,i-20),i);const va=vw.length?vw.reduce((a,b)=>a+b)/vw.length:VOL[i];vavg.push(va);vr.push(VOL[i]/va);
  don.push(i>=60?Math.min(...CLOSE.slice(i-60,i)):null);}
 return {rsi,mid,lo,up,dd,vr,don,vavg}})();
const SIGS=[
 {k:1,name:'RSI below 20',short:'RSI < 20',f:d=>I.rsi[d]!==null&&I.rsi[d]<20,val:d=>I.rsi[d]===null?'n/a':'RSI '+I.rsi[d].toFixed(1)},
 {k:2,name:'Close below lower Bollinger Band',short:'Below lower band',f:d=>I.lo[d]!==null&&CLOSE[d]<I.lo[d],val:d=>I.lo[d]===null?'n/a':CLOSE[d].toFixed(1)+' vs '+I.lo[d].toFixed(1)},
 {k:3,name:'Down more than 30% from 21-day high',short:'30% dip',f:d=>I.dd[d]>0.3,val:d=>'-'+(I.dd[d]*100).toFixed(0)+'%'},
 {k:4,name:'Volume 2x normal or more',short:'Volume 2x',f:d=>I.vr[d]>=2,val:d=>I.vr[d].toFixed(1)+'x'},
 {k:5,name:'At a known support level',short:'At support',f:d=>CLOSE[d]<=SUP*1.03,val:d=>CLOSE[d].toFixed(1)+' vs '+SUP}
];
const score=d=>SIGS.filter(s=>s.f(d)).length;

/* chart */
function chart(o){
 const W=720,pl=40,pr=10,lo=o.lo,hi=o.hi,cur=o.cur===undefined?hi:o.cur,L=o.layers||{},panels=o.panels||['price'];
 const H={price:o.hPrice||230,rsi:100,vol:90},gap=16;
 const X=d=>pl+(d-lo)/(hi-lo)*(W-pl-pr);
 let y0=8,out='',total=panels.reduce((a,p)=>a+H[p]+gap,0)+14;
 const rng=(a,b)=>{const r=[];for(let i=a;i<=b;i++)r.push(i);return r};
 const days=rng(lo,Math.min(hi,N-1));
 const ln=(arr,Y,st,to,from)=>{let p='';days.forEach(d=>{if(d>(to===undefined?cur:to)||(from!==undefined&&d<from)||arr[d]===null)return;p+=(p?'L':'M')+X(d).toFixed(1)+' '+Y(arr[d]).toFixed(1)});return p?`<path d="${p}" fill="none" ${st}/>`:''};
 panels.forEach(p=>{
  const h=H[p],top=y0,bot=y0+h;
  out+=`<rect x="${pl}" y="${top}" width="${W-pl-pr}" height="${h}" fill="none" stroke="var(--grid)"/>`;
  if(p==='price'){
   const vals=days.flatMap(d=>[CLOSE[d],I.lo[d],I.up[d]].filter(v=>v!==null&&v!==undefined));vals.push(SUP);if(L.tp)vals.push(L.tp);
   let mn=Math.min(...vals),mx=Math.max(...vals);const pd=(mx-mn)*.06;mn-=pd;mx+=pd;
   const Y=v=>bot-(v-mn)/(mx-mn)*h;
   for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4;out+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)"/><text x="${pl-5}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${v.toFixed(0)}</text>`}
   if(L.bb){let up='',lw='';days.forEach(d=>{if(d>cur||I.up[d]===null)return;up+=(up?'L':'M')+X(d)+' '+Y(I.up[d]);});
     for(let d=Math.min(cur,hi);d>=lo;d--){if(I.lo[d]===null)continue;lw+='L'+X(d)+' '+Y(I.lo[d])}
     if(up)out+=`<path d="${up}${lw}Z" fill="var(--s2)" opacity=".12"/>`;
     out+=ln(I.lo,Y,'stroke="var(--s2)" stroke-width="1.6"')+ln(I.up,Y,'stroke="var(--s2)" stroke-width="1.6"')+ln(I.mid,Y,'stroke="var(--s2)" stroke-width="1" stroke-dasharray="4 3"')}
   if(L.sup){out+=`<rect x="${pl}" y="${Y(SUP*1.03)}" width="${W-pl-pr}" height="${Y(SUP)-Y(SUP*1.03)}" fill="var(--s5)" opacity=".15"/><line x1="${pl}" x2="${W-pr}" y1="${Y(SUP)}" y2="${Y(SUP)}" stroke="var(--s5)" stroke-width="1.6" stroke-dasharray="6 4"/><text x="${pl+4}" y="${Y(SUP)-4}" font-size="10" fill="var(--s5)">support ${SUP}</text>`}
   if(L.don){out+=ln(I.don,Y,'stroke="var(--s5)" stroke-width="1.4" stroke-dasharray="2 3"')+`<text x="${W-pr-2}" y="${top+12}" text-anchor="end" font-size="10" fill="var(--s5)">Donchian 60-day low (dotted)</text>`}
   out+=ln(CLOSE,Y,'stroke="var(--price)" stroke-width="1" opacity=".22"',hi)+ln(CLOSE,Y,'stroke="var(--price)" stroke-width="2"');
   if(L.dd&&cur>=20){const w0=Math.max(0,cur-20);let hd=w0;for(let d=w0;d<=cur;d++)if(CLOSE[d]>CLOSE[hd])hd=d;
     if(hd>=lo){const hy=Y(CLOSE[hd]),cy=Y(CLOSE[cur]);out+=`<line x1="${X(hd)}" x2="${X(Math.min(cur+4,hi))}" y1="${hy}" y2="${hy}" stroke="var(--s3)" stroke-dasharray="3 3"/><line x1="${X(cur)}" x2="${X(cur)}" y1="${hy}" y2="${cy}" stroke="var(--s3)" stroke-width="2.5"/><text x="${X(cur)-6}" y="${(hy+cy)/2}" text-anchor="end" font-size="12" font-weight="700" fill="var(--s3)">-${(I.dd[cur]*100).toFixed(0)}%</text><circle cx="${X(hd)}" cy="${hy}" r="4" fill="var(--s3)"/><text x="${X(hd)+6}" y="${hy-6}" font-size="10" fill="var(--s3)">21-day high</text>`}}
   if(L.tp&&L.buy!==undefined&&cur>=L.buy){out+=`<line x1="${X(L.buy)}" x2="${W-pr}" y1="${Y(L.tp)}" y2="${Y(L.tp)}" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="7 4"/><text x="${W-pr-2}" y="${Y(L.tp)-5}" text-anchor="end" font-size="11" font-weight="700" fill="var(--accent)">sell limit ${L.tp.toFixed(1)}</text>`;
     if(L.fill!==undefined&&cur>=L.fill)out+=`<circle cx="${X(L.fill)}" cy="${Y(CLOSE[L.fill])}" r="6" fill="var(--accent)"/><text x="${X(L.fill)}" y="${Y(CLOSE[L.fill])-10}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent)">SOLD</text>`}
   (o.marks||[]).forEach(m=>{if(m.d>cur||m.d<lo||m.d>hi)return;const cx=X(m.d),cy=Y(CLOSE[m.d]);out+=`<circle cx="${cx}" cy="${cy}" r="6" fill="${m.c}" stroke="var(--surface)" stroke-width="2"/><text x="${cx}" y="${cy+(m.below===false?-12:20)}" text-anchor="middle" font-size="11" font-weight="700" fill="${m.c}">${m.t}</text>`});
   if(o.cursor&&cur<hi)out+=`<line x1="${X(cur)}" x2="${X(cur)}" y1="${top}" y2="${bot}" stroke="var(--muted)" stroke-dasharray="2 3"/>`
  }
  if(p==='rsi'){const Y=v=>bot-v/100*h;
   out+=`<rect x="${pl}" y="${Y(20)}" width="${W-pl-pr}" height="${Y(0)-Y(20)}" fill="var(--s1)" opacity=".14"/>`+[20,30,70].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--s1)" stroke-dasharray="${v===20?'':'3 3'}" opacity="${v===20?1:.5}"/><text x="${pl-5}" y="${Y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${v}</text>`).join('')+`<text x="${W-pr-3}" y="${Y(20)+12}" text-anchor="end" font-size="10" fill="var(--s1)">below 20 = this strategy's zone</text>`+ln(I.rsi,Y,'stroke="var(--s1)" stroke-width="2"')+`<text x="${pl+4}" y="${top+12}" font-size="10" fill="var(--muted)">RSI (14)</text>`;
   if(cur<=hi&&I.rsi[cur]!==null)out+=`<circle cx="${X(cur)}" cy="${Y(I.rsi[cur])}" r="4.5" fill="var(--s1)"/>`}
  if(p==='vol'){const mx=Math.max(...days.map(d=>VOL[d]))*1.1,Y=v=>bot-v/mx*h,bw=Math.max(1.5,(W-pl-pr)/(hi-lo)*.7);
   days.forEach(d=>{if(d>cur)return;out+=`<rect x="${X(d)-bw/2}" y="${Y(VOL[d])}" width="${bw}" height="${bot-Y(VOL[d])}" fill="${I.vr[d]>=2?'var(--s4)':'var(--grid)'}" ${I.vr[d]>=2?'':'stroke="var(--muted)" stroke-opacity=".35"'}/>`});
   out+=ln(I.vavg,Y,'stroke="var(--muted)" stroke-width="1.2"')+(cur>=lo?`<path d="M${pl} ${Y(2*(I.vavg[Math.min(cur,N-1)]))}H${W-pr}" stroke="var(--s4)" stroke-dasharray="4 3" fill="none"/><text x="${W-pr-3}" y="${Y(2*I.vavg[Math.min(cur,N-1)])-4}" text-anchor="end" font-size="10" fill="var(--s4)">2x normal</text>`:'')+`<text x="${pl+4}" y="${top+12}" font-size="10" fill="var(--muted)">Volume</text>`}
  y0=bot+gap});
 const step=Math.max(5,Math.round((hi-lo)/8/5)*5);
 for(let d=Math.ceil(lo/step)*step;d<=hi;d+=step)out+=`<text x="${X(d)}" y="${y0-2}" text-anchor="middle" font-size="10" fill="var(--muted)">${d}</text>`;
 return `<svg viewBox="0 0 ${W} ${total}" role="img" aria-label="${o.label||'Price chart'}">${out}</svg>`;
}
const MARKS=[{d:A_DAY,t:'3 of 5: no buy',c:'var(--s3)'},{d:BUY,t:'5 of 5: buy',c:'var(--accent)'}];
const TP=CLOSE[BUY]*1.3, FILL=CLOSE.findIndex((v,i)=>i>BUY&&v>=TP);

/* overview stepper */
const STEPS=[
 {d:50,t:'Watch the daily chart. Price has just peaked near 135. Nothing to do.',m:[]},
 {d:63,t:'The fall is on. It is tempting to look for a bottom, but fewer than five signals are true.',m:[]},
 {d:A_DAY,t:'Day 68: dip over 30%, close below the lower band, volume spike. Three of five. No support reached and RSI is still above 20. No buy.',m:[MARKS[0]]},
 {d:BUY,t:'Day 74: RSI below 20, price under the band, down about 40%, volume 2x or more, and price at the earlier support. Five of five.',m:MARKS},
 {d:BUY+1,t:'Immediately place a sell limit order 30% above the entry price.',m:MARKS,tp:1},
 {d:FILL,t:'The limit order fills when price reaches the target. Exit decided in advance, no emotion involved.',m:MARKS,tp:1,fill:1}];
let ovI=0,ovT=null;
function ovDraw(){const s=STEPS[ovI];
 $('#ovChart').innerHTML=chart({lo:30,hi:100,cur:s.d,layers:{bb:1,sup:1,tp:s.tp?TP:null,buy:BUY,fill:s.fill?FILL:undefined},marks:s.m,cursor:1,label:'Walkthrough chart'});
 $('#ovSteps').innerHTML=STEPS.map((x,i)=>`<li class="${i===ovI?'on':''}">${x.t}</li>`).join('')}
function ovGo(i){ovI=Math.max(0,Math.min(STEPS.length-1,i));ovDraw()}
$('#ovNext').onclick=()=>ovGo(ovI+1);$('#ovPrev').onclick=()=>ovGo(ovI-1);
$('#ovPlay').onclick=function(){if(ovT){clearInterval(ovT);ovT=null;this.textContent='Play';return}
 if(ovI>=STEPS.length-1)ovGo(0);this.textContent='Pause';ovT=setInterval(()=>{if(ovI>=STEPS.length-1){clearInterval(ovT);ovT=null;$('#ovPlay').textContent='Play';return}ovGo(ovI+1)},2600)};
ovDraw();

/* signal cards */
const CARDS=[
 {k:1,t:'RSI below 20',p:'A momentum score from 0 to 100. Above 70 is usually called overbought, below 30 oversold. Under 20 means selling has been unusually aggressive.',o:{panels:['rsi'],layers:{}},m:'Mistake: acting at 30.'},
 {k:2,t:'Close below the lower Bollinger Band',p:'A 21-day average with bands two standard deviations either side. A close below the lower band means the fall is statistically extreme, not just a red day. Bands widen when volatility rises.',o:{panels:['price'],layers:{bb:1}},m:'Mistake: using an intraday dip instead of a close.'},
 {k:3,t:'Down more than 30% in 21 days',p:'Measured from the highest close in the last 21 days. A fall this size usually comes with fear, bad headlines and people selling before it gets worse.',o:{panels:['price'],layers:{dd:1}},m:'Mistake: measuring from an old, distant high.'},
 {k:4,t:'Volume spike of 2x or more',p:'Twice the usual number of shares or coins changing hands. In a sell-off this points to capitulation, with many people panic-selling at once, rather than a quiet drift down.',o:{panels:['vol'],layers:{}},m:'Mistake: a price fall on thin volume.'},
 {k:5,t:'At a known support level',p:'A floor the price has bounced off before. It is spotted by eye on the chart and can be checked with a Donchian Channel, which plots the highest high and lowest low over a chosen window.',o:{panels:['price'],layers:{sup:1,don:1}},m:'Mistake: calling a level support after the fact.'}];
$('#sigCards').innerHTML=CARDS.map(c=>{const s=SIGS[c.k-1];return `<div class="card sigcard sig${c.k}"><div class="chip on sig${c.k}">${c.k} · ${s.short}</div><h3 style="margin-top:8px">${c.t}</h3>${chart(Object.assign({lo:44,hi:90,cur:BUY,cursor:1,hPrice:170,marks:[{d:BUY,t:'',c:`var(--s${c.k})`}],label:c.t},c.o))}<p>${c.p}</p><p class="read">Day ${BUY}: ${s.val(BUY)} · ${s.f(BUY)?'true':'false'}<br>${c.m}</p></div>`}).join('');

/* lab */
let labD=60,labT=null,mode='all';
const need={all:5,three:3,any:1};
function labDraw(){const d=labD;
 $('#labChart').innerHTML=chart({lo:30,hi:110,cur:d,cursor:1,panels:['price','rsi','vol'],layers:{bb:1,sup:1,tp:d>=BUY?TP:null,buy:BUY,fill:FILL},marks:d>=BUY?[{d:BUY,t:'BUY',c:'var(--accent)'}]:[],hPrice:240,label:'Signal lab chart'});
 $('#labDay').textContent=d;$('#labSlider').value=d;
 $('#labConds').innerHTML=SIGS.map(s=>`<div class="cond sig${s.k} ${s.f(d)?'on':''}"><span class="lamp"></span>${s.name}<span class="v">${s.val(d)}</span></div>`).join('');
 const n=score(d),fire=n>=need[mode],v=$('#labVerdict');
 v.className='verdict '+(fire?'v-buy':n>=3?'v-no':'v-wait');
 v.textContent=fire?(mode==='all'?'5 of 5: BUY SETUP':n+' of 5: signal fires'):(n>=3?n+' of 5: no buy':n+' of 5: wait');
 let pos='Not in a position.';if(d>=BUY&&mode==='all'){pos=`Entry at ${CLOSE[BUY]} on day ${BUY}. Sell limit ${TP.toFixed(1)} (+30%). `+(d>=FILL?`Filled on day ${FILL}.`:'Order working.')}
 $('#labPos').textContent=pos;
 const days=[];for(let i=20;i<N;i++)if(score(i)>=need[mode])days.push(i);
 $('#modeOut').innerHTML=`Rule: <b>${mode==='all'?'all five':mode==='three'?'at least three':'any one'}</b>. Over days 20 to ${N-1} it fires on <b>${days.length}</b> day${days.length===1?'':'s'}${days.length?`, first on day <b>${days[0]}</b>`:''}.`;
 ['All','3','Any'].forEach((x,i)=>{const b=$('#m'+x);b.className=['all','three','any'][i]===mode?'pri':''})}
$('#labSlider').oninput=e=>{labD=+e.target.value;labDraw()};
$('#mAll').onclick=()=>{mode='all';labDraw()};$('#m3').onclick=()=>{mode='three';labDraw()};$('#mAny').onclick=()=>{mode='any';labDraw()};
$('#labPlay').onclick=function(){if(labT){clearInterval(labT);labT=null;this.textContent='Play';return}
 if(labD>=110)labD=40;this.textContent='Pause';
 labT=setInterval(()=>{labD++;labDraw();if(labD>=110||labD===A_DAY||labD===BUY){clearInterval(labT);labT=null;$('#labPlay').textContent=labD>=110?'Replay':'Continue'}},230)};
labDraw();

/* exit */
function exitDraw(){const p=+$('#tpSlider').value,tp=CLOSE[BUY]*(1+p/100),fill=CLOSE.findIndex((v,i)=>i>BUY&&v>=tp);
 $('#tpVal').textContent=p+'%';
 $('#exitChart').innerHTML=chart({lo:50,hi:129,cur:129,layers:{tp,buy:BUY,fill:fill<0?undefined:fill,sup:1},marks:[{d:BUY,t:'BUY',c:'var(--accent)'}],hPrice:260,label:'Exit chart'});
 $('#exitStats').innerHTML=`<div class="stat"><b>${CLOSE[BUY]}</b><span>Entry (day ${BUY})</span></div><div class="stat"><b>${tp.toFixed(1)}</b><span>Sell limit price</span></div><div class="stat"><b>${fill<0?'Not filled':'Day '+fill}</b><span>${fill<0?'Price never reached it':(fill-BUY)+' days after entry'}</span></div><div class="stat"><b>£${(10000*p/100).toLocaleString()}</b><span>Gain on £10,000 at fill</span></div>`}
$('#tpSlider').oninput=exitDraw;exitDraw();

/* backtest */
function pf(){const gp=+$('#gp').value,gl=+$('#gl').value,w=+$('#nw').value,l=+$('#nl').value;
 const f=gl>0?gp/gl:Infinity;$('#pfOut').innerHTML=`Profit factor <b>${isFinite(f)?f.toFixed(2):'undefined (no losses)'}</b> · win rate <b>${w+l?Math.round(w/(w+l)*100):0}%</b> over <b>${w+l}</b> trades. ${w+l<30?'Small sample: these numbers could move a lot with a few more trades.':''}`}
['gp','gl','nw','nl'].forEach(i=>$('#'+i).oninput=pf);pf();
const TERMS=[['Win rate','Percentage of trades that were profitable'],['Profit factor','Total profit divided by total losses'],['Max drawdown','Worst fall from a previous account peak'],['Sharpe ratio','Return adjusted for how bumpy the ride was'],['Limit order','Automatic order that fills at a price you set']];
{let selT=null,done=0;const ds=[...TERMS].sort(()=>Math.random()-.5);
 const el=$('#match');el.innerHTML=TERMS.map((t,i)=>`<div class="t" data-t="${i}" tabindex="0" role="button">${t[0]}</div>`).join('')+ds.map(t=>`<div class="d" data-d="${TERMS.indexOf(t)}" tabindex="0" role="button">${t[1]}</div>`).join('');
 el.onclick=e=>{const t=e.target.closest('.t'),d=e.target.closest('.d');
  if(t&&!t.classList.contains('done')){el.querySelectorAll('.t').forEach(x=>x.classList.remove('sel'));t.classList.add('sel');selT=t;return}
  if(d&&selT&&!d.classList.contains('done')){if(d.dataset.d===selT.dataset.t){d.classList.add('done');selT.classList.remove('sel');selT.classList.add('done');selT=null;done++;$('#matchOut').textContent=done===TERMS.length?'All matched.':done+' of '+TERMS.length}
   else{d.classList.add('bad');setTimeout(()=>d.classList.remove('bad'),600)}}};
 el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}}}

/* practice: scenarios */
const SC=[
 {r:[18,1,34,2.6,0],a:false,w:'Four of five. Price is still far above any known support, so the setup is incomplete. Wait.'},
 {r:[17,1,36,2.4,1],a:true,w:'All five true on the daily chart. The setup is complete.'},
 {r:[27,1,31,2.2,1],a:false,w:'RSI is below 30 but not below 20. The strategy needs the rarer reading.'},
 {r:[15,1,22,3.0,1],a:false,w:'The fall is only 22%, short of the 30% needed.'},
 {r:[19,1,33,1.6,1],a:false,w:'Volume is 1.6x, below the 2x spike. Not capitulation yet.'},
 {r:[16,1,35,2.5,1],tf:'1-hour chart',a:false,w:'All five readings are there, but the rules are written for the daily chart, so this does not count.'}];
$('#scen').innerHTML=SC.map((s,i)=>`<div class="q" data-i="${i}"><div class="row">${[`RSI ${s.r[0]}`,s.r[1]?'Close below lower band':'Above lower band',`Down ${s.r[2]}% in 21 days`,`Volume ${s.r[3]}x`,s.r[4]?'At support':'Not at support'].map((x,k)=>`<span class="chip sig${k+1} on">${x}</span>`).join('')}<span class="chip">${s.tf||'Daily chart'}</span></div><div class="row" style="margin-top:8px"><button data-a="1">Meets the rules</button><button data-a="0">Does not</button></div><div class="fb"></div></div>`).join('');
$('#scen').onclick=e=>{const b=e.target.closest('button');if(!b)return;const q=b.closest('.q'),s=SC[q.dataset.i],ok=(b.dataset.a==='1')===s.a;q.querySelector('.fb').innerHTML=`<b class="${ok?'ok':'no'}">${ok?'Correct.':'Not quite.'}</b> ${s.w}`;};
/* ordering */
const ORD=['Watch the daily chart and wait','Confirm all five signals are true on the same day','Enter the position','Place a sell limit order 30% above entry','Let the order fill, or not, without changing the plan'];
let ordA=ORD.map((t,i)=>i).sort(()=>Math.random()-.5),dragI=null;
function ordDraw(){const ul=$('#ord');ul.innerHTML=ordA.map((v,i)=>`<li draggable="true" data-i="${i}">${i+1}. ${ORD[v]}<span class="mv"><button aria-label="Move up" data-m="-1">↑</button><button aria-label="Move down" data-m="1">↓</button></span></li>`).join('')}
{const ul=$('#ord');
 ul.onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.closest('li').dataset.i,j=i+ +b.dataset.m;if(j<0||j>=ordA.length)return;[ordA[i],ordA[j]]=[ordA[j],ordA[i]];ordDraw();$('#ordOut').textContent=''};
 ul.ondragstart=e=>{dragI=+e.target.closest('li').dataset.i;e.target.closest('li').classList.add('drag');e.dataTransfer.effectAllowed='move'};
 ul.ondragover=e=>e.preventDefault();
 ul.ondrop=e=>{e.preventDefault();const t=e.target.closest('li');if(!t||dragI===null)return;const j=+t.dataset.i,[v]=ordA.splice(dragI,1);ordA.splice(j,0,v);dragI=null;ordDraw();$('#ordOut').textContent=''};
 ul.ondragend=()=>ordDraw();
 ordDraw();
 $('#ordCheck').onclick=()=>{let n=0;[...ul.children].forEach((li,i)=>{const ok=ordA[i]===i;n+=ok;li.classList.add(ok?'right':'wrong')});$('#ordOut').textContent=n===ORD.length?'Correct order.':n+' of '+ORD.length+' in the right place.'}}
/* quiz */
const QZ=[
 ['Which RSI reading does this strategy wait for?',['Below 70','Below 30','Below 20'],2,'The textbook oversold line is 30, but this setup waits for the rarer reading below 20.'],
 ['Four of five signals are true. What does the rule say?',['Wait: all five are needed','Enter with a smaller position','Enter and set a tighter target'],0,'The setup is all five or nothing. A near miss is where most people get in too early.'],
 ['Why place the sell limit order straight after entering?',['It guarantees profit','It removes in-the-moment emotion from the exit','It raises the win rate'],1,'A limit order does not guarantee a fill or a profit. Its value is that the exit is decided in advance.'],
 ['A backtest shows 100% win rate from one trade. What is the best reading?',['The strategy never loses','The sample is too small to conclude much','Profit factor must be above 3'],1,'One trade cannot show how the rules behave across different markets.']];
$('#quiz').innerHTML=QZ.map((q,i)=>`<div class="q" data-i="${i}"><b>${q[0]}</b>${q[1].map((o,k)=>`<div><button style="margin-top:6px" data-k="${k}">${o}</button></div>`).join('')}<div class="fb"></div></div>`).join('');
$('#quiz').onclick=e=>{const b=e.target.closest('button');if(!b)return;const q=b.closest('.q'),z=QZ[q.dataset.i],ok=+b.dataset.k===z[2];q.querySelector('.fb').innerHTML=`<b class="${ok?'ok':'no'}">${ok?'Correct.':'Not quite.'}</b> ${z[3]}`};

})();
