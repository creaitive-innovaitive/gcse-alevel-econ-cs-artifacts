Lib.quiz($("#qz1"), { qs: [
  { q: "RLE stores WWBWW as", opts: ["4W1B", "2W1B2W", "5W", "WWBWW"], a: 1, why: "Only neighbouring identical values form a run, so the two groups of W stay separate." },
  { q: "Which compression type can never be reversed?", opts: ["Lossless", "Lossy", "RLE", "ZIP"], a: 1, why: "Lossy methods delete data for good." },
  { q: "A sound is sampled at 8,000 Hz with 8-bit depth for 10 seconds (mono). What is the file size in bytes?", opts: ["80,000", "640,000", "8,000", "10,000"], a: 0, why: "8,000 × 8 × 10 = 640,000 bits. Divide by 8: 80,000 bytes." },
  { q: "Which is a sensible choice for a medical image?", opts: ["Lossy, to save space", "Lossless, so every bit is kept", "Lowering the colour depth", "Deleting detail"], a: 1, why: "Lossless keeps all the detail, which matters when accuracy is critical." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Compression", "Making a file smaller so it uses less storage and less bandwidth."],
  ["Lossless", "Compression where nothing is thrown away: the original can be rebuilt exactly."],
  ["Lossy", "Compression that removes some data for good to make the file much smaller."],
  ["Run-length encoding (RLE)", "A lossless method that replaces each run of repeated values with a count and the value."],
  ["Run", "A stretch of the same value repeated."],
  ["Sample rate", "How many times per second the sound wave is measured, in hertz (Hz)."],
  ["Bit depth", "The number of bits used to store each sample (or each pixel's colour)."],
  ["Resolution", "The number of pixels in an image, width × height."],
  ["Colour depth", "The number of bits used for the colour of each pixel."],
  ["File size (sound)", "Sample rate × bit depth × length in seconds, in bits."],
  ["File size (image)", "Width × height × colour depth, in bits."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

"use strict";
const $=s=>document.querySelector(s);
const tint=i=>"var(--r"+(i%6)+")";
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

function rle(str){
  const runs=[];
  for(const ch of str){
    const last=runs[runs.length-1];
    if(last&&last.ch===ch)last.n++; else runs.push({ch,n:1});
  }
  return runs;
}
const encStr=runs=>runs.map(r=>r.n+r.ch).join("");

/* ---------- RLE text stepper ---------- */
const st={steps:[],k:0,timer:null,str:""};
function buildSteps(str){
  const steps=[];const done=[];let cur=null;
  const snap=(i,msg,fin)=>steps.push({i,done:done.map(r=>({...r})),cur:cur&&{...cur},msg,fin:!!fin});
  snap(-1,str?"Nothing read yet. The pointer starts at the first character and the output is empty. Press Next.":"Type some letters above, then press Load.");
  for(let i=0;i<str.length;i++){
    const ch=str[i];
    if(!cur){cur={ch,n:1,start:i};snap(i,"Read <b>"+ch+"</b>. It is the first item, so start a run with count = 1.");}
    else if(cur.ch===ch){cur.n++;snap(i,"<b>"+ch+"</b> is the same as the current run. Add 1 to the count: count = <b>"+cur.n+"</b>.");}
    else{
      const prev=cur;done.push(prev);
      cur={ch,n:1,start:i};
      snap(i,"<b>"+ch+"</b> is different from <b>"+prev.ch+"</b>, so the run has ended. Write <b>"+prev.n+prev.ch+"</b> to the output, then start a new run of <b>"+ch+"</b> with count = 1.");
    }
  }
  if(cur){done.push(cur);const last=cur;cur=null;
    snap(str.length,"End of the data. Write the final run, <b>"+last.n+last.ch+"</b>. Encoding is finished.",true);}
  return steps;
}
function rleRender(){
  const s=st.steps[st.k],n=st.str.length;
  const idx=new Array(n).fill(-1);
  s.done.forEach((r,ri)=>{for(let j=r.start;j<r.start+r.n;j++)idx[j]=ri;});
  if(s.cur)for(let j=s.cur.start;j<=s.i;j++)idx[j]=s.done.length;
  $("#rleCells").innerHTML=[...st.str].map((c,j)=>{
    const bg=idx[j]>=0?"background:"+tint(idx[j]):"";
    const cls="cell"+(j===s.i?" ptr":"")+(s.cur&&idx[j]===s.done.length?" live":"");
    return '<div class="'+cls+'" style="'+bg+'">'+esc(c)+'</div>';}).join("");
  let o=s.done.map((r,ri)=>'<span class="tok" style="background:'+tint(ri)+'"><b>'+r.n+'</b>'+r.ch+'</span>').join("");
  if(s.cur)o+='<span class="tok live" title="Run still being counted"><b>'+s.cur.n+'</b>'+s.cur.ch+'</span>';
  $("#rleOut").innerHTML=o||'<span style="color:var(--muted)">empty</span>';
  $("#rleMsg").innerHTML=s.msg;
  $("#rleCount").textContent="Step "+st.k+" of "+(st.steps.length-1);
  $("#rlePrev").disabled=st.k===0;$("#rleNext").disabled=st.k>=st.steps.length-1;
  const stat=$("#rleStat");stat.hidden=!s.fin;
  if(s.fin){
    const e=s.done.length*2,o2=n;
    $("#sO").textContent=o2+" chars";$("#sE").textContent=e+" chars";
    $("#sS").textContent=e<o2?Math.round((1-e/o2)*100)+"%":(e===o2?"0%":"None: it grew");
  }
  if(s.fin)rlePause();
}
function rlePause(){clearInterval(st.timer);st.timer=null;$("#rlePlay").textContent="▶ Play";}
function rlePlay(){
  if(st.timer){rlePause();return;}
  if(st.k>=st.steps.length-1)st.k=0;
  $("#rlePlay").textContent="❚❚ Pause";
  const ms=[1600,1200,850,550,300][$("#rleSpeed").value-1];
  st.timer=setInterval(()=>{if(st.k<st.steps.length-1){st.k++;rleRender();}else rlePause();},ms);
  rleRender();
}
function rleLoad(){
  rlePause();
  const v=$("#rleIn").value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,24);
  $("#rleIn").value=v;st.str=v;st.steps=buildSteps(v);st.k=0;rleRender();
}
$("#rleLoad").onclick=rleLoad;
$("#rleIn").addEventListener("keydown",e=>{if(e.key==="Enter")rleLoad();});
$("#rleReset").onclick=()=>{rlePause();st.k=0;rleRender();};
$("#rleNext").onclick=()=>{rlePause();if(st.k<st.steps.length-1)st.k++;rleRender();};
$("#rlePrev").onclick=()=>{rlePause();if(st.k>0)st.k--;rleRender();};
$("#rlePlay").onclick=rlePlay;
$("#rleSpeed").oninput=()=>{$("#rleSpeedV").textContent=["slowest","slow","medium","fast","fastest"][$("#rleSpeed").value-1];if(st.timer){rlePause();rlePlay();}};
$("#rleSpeed").oninput();
rleLoad();

/* ---------- bitmap RLE ---------- */
const PRE={
  Smiley:["..####..",".#....#.","#.#..#.#","#......#","#.#..#.#","#..##..#",".#....#.","..####.."],
  Stripes:["########","########","........","........","########","########","........","........"],
  "Letter T":["########","########","...##...","...##...","...##...","...##...","...##...","...##..."],
  Checker:["#.#.#.#.",".#.#.#.#","#.#.#.#.",".#.#.#.#","#.#.#.#.",".#.#.#.#","#.#.#.#.",".#.#.#.#"],
  Blank:["........","........","........","........","........","........","........","........"]
};
let grid=PRE.Smiley.join("").split("").map(c=>c==="#");
let anim=null,animTimer=null,painting=null;
function rowRuns(r){
  const runs=[];
  for(let c=0;c<8;c++){
    const b=grid[r*8+c],last=runs[runs.length-1];
    if(last&&last.b===b)last.n++; else runs.push({b,n:1,start:c});
  }
  return runs;
}
function imgRender(){
  const all=[];for(let r=0;r<8;r++)rowRuns(r).forEach(x=>all.push({...x,row:r,f:all.length}));
  const cur=anim!==null?all[Math.min(anim,all.length-1)]:null;
  $("#pixgrid").innerHTML=grid.map((b,i)=>{
    const r=Math.floor(i/8),c=i%8;
    const hl=cur&&cur.row===r&&c>=cur.start&&c<cur.start+cur.n;
    return '<button class="pix'+(b?" on":"")+(hl?" hl":"")+'" data-i="'+i+'" aria-label="Row '+(r+1)+', column '+(c+1)+': '+(b?"black":"white")+'"></button>';}).join("");
  let html="";
  for(let r=0;r<8;r++){
    const toks=all.filter(x=>x.row===r&&(anim===null||x.f<=anim)).map(x=>
      '<span class="tok" style="background:'+tint(x.f)+(cur&&cur.f===x.f?";outline:2px solid var(--count)":"")+'"><b>'+x.n+'</b>'+(x.b?"B":"W")+'</span>').join("");
    html+='<div><span class="rn">Row '+(r+1)+'</span>'+(toks||'<span style="color:var(--muted)">…</span>')+'</div>';
  }
  $("#imgRows").innerHTML=html;
  const R=all.length,m=Math.max(...all.map(x=>x.n)),cb=Math.max(1,Math.ceil(Math.log2(m+1))),per=cb+1,tot=R*per;
  $("#tOrig").textContent="64 bits";
  $("#tEnc").textContent=R+" runs × "+per+" bits = "+tot+" bits";
  $("#bEnc").style.width=Math.min(100,tot/64*100)+"%";
  $("#bEncWrap").className="bar"+(tot>=64?" bad":"");
  $("#imgVerdict").textContent=tot<64?"Encoded is "+Math.round((1-tot/64)*100)+"% smaller. Long runs of one colour make RLE work well."
    :tot===64?"Encoded is exactly the same size. RLE has saved nothing here.":"Encoded is bigger than the original by "+(tot-64)+" bits. Short runs make RLE backfire.";
}
function setPix(i,v){if(grid[i]!==v){grid[i]=v;stopScan();imgRender();}}
$("#pixgrid").addEventListener("pointerdown",e=>{const b=e.target.closest(".pix");if(!b)return;e.preventDefault();const i=+b.dataset.i;painting=!grid[i];setPix(i,painting);});
$("#pixgrid").addEventListener("pointerover",e=>{if(painting===null)return;const b=e.target.closest(".pix");if(b)setPix(+b.dataset.i,painting);});
$("#pixgrid").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const b=e.target.closest(".pix");if(b){e.preventDefault();const i=+b.dataset.i;setPix(i,!grid[i]);const nb=document.querySelector('.pix[data-i="'+i+'"]');nb&&nb.focus();}}});
document.addEventListener("pointerup",()=>painting=null);
$("#presets").innerHTML=Object.keys(PRE).map(k=>'<button class="btn alt" data-p="'+k+'">'+k+'</button>').join("");
$("#presets").onclick=e=>{const k=e.target.dataset.p;if(!k)return;stopScan();grid=PRE[k].join("").split("").map(c=>c==="#");imgRender();};
function stopScan(){clearInterval(animTimer);animTimer=null;anim=null;}
$("#scanStop").onclick=()=>{stopScan();imgRender();};
$("#scan").onclick=()=>{
  stopScan();anim=0;imgRender();
  const total=[...Array(8).keys()].reduce((a,r)=>a+rowRuns(r).length,0);
  animTimer=setInterval(()=>{if(anim<total-1){anim++;imgRender();}else{clearInterval(animTimer);animTimer=null;}},700);
};
imgRender();

/* ---------- decode / encode quiz ---------- */
const QZ=[
  {q:"Decode <code>3A2B4C</code>",a:"AAABBCCCC"},
  {q:"Decode <code>1X5Y2X</code>",a:"XYYYYYXX"},
  {q:"Decode this pixel row: <code>2W4B2W</code>",a:"WWBBBBWW"},
  {q:"Encode <code>WWWBBBBBW</code>",a:"3W5B1W"},
  {q:"Encode <code>AAABCCCC</code>",a:"3A1B4C"},
  {q:"Decode <code>12A3B</code> (watch the two-digit count)",a:"AAAAAAAAAAAABBB"}
];
$("#quiz").innerHTML=QZ.map((x,i)=>'<div class="qrow"><div>'+x.q+'</div><div class="row"><input type="text" id="qz'+i+'" size="24" autocomplete="off" spellcheck="false" aria-label="Answer '+(i+1)+'"><button class="btn" data-c="'+i+'">Check</button><button class="btn alt" data-s="'+i+'">Show answer</button></div><div class="fb" id="qf'+i+'" aria-live="polite"></div></div>').join("");
$("#quiz").onclick=e=>{
  const c=e.target.dataset.c,s=e.target.dataset.s;
  if(c!==undefined){
    const v=$("#qz"+c).value.toUpperCase().replace(/\s/g,""),f=$("#qf"+c);
    if(v===QZ[c].a){f.className="fb ok";f.textContent="Correct.";}
    else{f.className="fb no";f.textContent=v?"Not quite. Check each count against its letter.":"Type an answer first.";}
  }
  if(s!==undefined){const f=$("#qf"+s);f.className="fb";f.textContent="Answer: "+QZ[s].a;}
};

/* ---------- slider: run length ---------- */
function rlaRender(){
  const r=+$("#runLen").value;$("#runLenV").textContent=r;
  let s="";for(let i=0;s.length<24;i++)s+="ABCDEFGH"[i%8].repeat(r);
  s=s.slice(0,24);
  const runs=rle(s),e=runs.length*2;
  $("#rlA").innerHTML=[...s].map((c,j)=>{
    let k=0,acc=0;while(acc+runs[k].n<=j){acc+=runs[k].n;k++;}
    return '<div class="cell" style="width:28px;height:36px;font-size:.95rem;background:'+tint(k)+'">'+c+'</div>';}).join("");
  $("#rlB").innerHTML=runs.map((x,k)=>'<span class="tok" style="font-size:.95rem;padding:4px 8px;background:'+tint(k)+'"><b>'+x.n+'</b>'+x.ch+'</span>').join("");
  $("#rlO").textContent="24 characters";$("#rlE").textContent=e+" characters";
  $("#rlBar").style.width=Math.min(100,e/24*100)+"%";
  $("#rlBarW").className="bar"+(e>24?" bad":"");
  $("#rlV").textContent=e<24?"Saved "+Math.round((1-e/24)*100)+"%."
    :e===24?"Same size. Runs of 2 give no saving.":"Bigger than the original. Every run of 1 costs two characters.";
}
$("#runLen").oninput=rlaRender;rlaRender();

/* ---------- slider: sound ---------- */
const fmtBytes=b=>b<1024?b.toLocaleString()+" B":b<1048576?(b/1024).toFixed(1)+" KiB":(b/1048576).toFixed(2)+" MiB";
function waveRender(){
  const sr=+$("#sr").value,bd=+$("#bd").value,dur=+$("#dur").value;
  $("#srV").textContent=sr.toLocaleString()+" Hz";$("#bdV").textContent=bd+" bit"+(bd>1?"s":"");
  $("#durV").textContent=dur+" s";
  const f=t=>0.75*Math.sin(2*Math.PI*3*t)+0.2*Math.sin(2*Math.PI*7*t);
  const L=Math.pow(2,bd),q=v=>{const u=(v+1)/2;return Math.round(u*(L-1))/(L-1)*2-1;};
  const X=t=>20+t*600,Y=v=>100-v*80;
  let real="";for(let i=0;i<=300;i++){const t=i/300;real+=(i?"L":"M")+X(t).toFixed(1)+" "+Y(f(t)).toFixed(1);}
  const n=Math.max(4,Math.round(sr/1000));
  let pts="",dots="";
  for(let k=0;k<n;k++){const t=k/(n-1),v=q(Math.max(-1,Math.min(1,f(t))));
    pts+=(k?"L":"M")+X(t).toFixed(1)+" "+Y(v).toFixed(1);
    if(n<=48)dots+='<circle cx="'+X(t).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3.5" fill="var(--count)"/>';}
  $("#wave").innerHTML='<line x1="20" x2="620" y1="100" y2="100" stroke="var(--line)" stroke-width="1" fill="none"/>'+
    '<path d="'+real+'" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>'+
    '<path d="'+pts+'" stroke="var(--accent)" stroke-width="2.5" fill="none"/>'+dots+
    '<text x="20" y="192" font-size="12" fill="var(--muted)" font-family="JetBrains Mono,monospace">'+n+' samples shown · '+L.toLocaleString()+' levels</text>';
  const bits=sr*bd*dur,bytes=bits/8;
  $("#aBits").textContent=bits.toLocaleString();$("#aBytes").textContent=Math.round(bytes).toLocaleString();$("#aSize").textContent=fmtBytes(bytes);
}
["sr","bd","dur"].forEach(i=>$("#"+i).oninput=waveRender);waveRender();

/* ---------- slider: image ---------- */
function imgSizeRender(){
  const w=+$("#iw").value,h=+$("#ih").value,d=+$("#id").value;
  $("#iwV").textContent=w+" px";$("#ihV").textContent=h+" px";$("#idV").textContent=d+" bit"+(d>1?"s":"");
  $("#iCol").textContent=Math.pow(2,d).toLocaleString();
  $("#iSize").textContent=fmtBytes(w*h*d/8);
}
["iw","ih","id"].forEach(i=>$("#"+i).oninput=imgSizeRender);imgSizeRender();

/* ---------- order activity ---------- */
const STEPS=["Read the first item and set the count to 1.","Compare the next item with the current one.","If it is the same, add 1 to the count and compare the next item.","If it is different, write the count and item to the output, then reset the count to 1 for the new item.","When the data runs out, write the count and item of the final run."];
let ord=[3,0,4,2,1];
function ordRender(marks){
  $("#order").innerHTML=ord.map((id,p)=>'<li draggable="true" data-p="'+p+'" class="'+(marks?(id===p?"ok":"no"):"")+'"><span aria-hidden="true">⠿</span><span class="t">'+STEPS[id]+'</span><button class="mv" data-u="'+p+'" aria-label="Move up">↑</button><button class="mv" data-d="'+p+'" aria-label="Move down">↓</button></li>').join("");
  $("#ordFb").textContent="";
}
const swap=(a,b)=>{if(b<0||b>=ord.length)return;const x=ord.splice(a,1)[0];ord.splice(b,0,x);ordRender();};
$("#order").addEventListener("click",e=>{const u=e.target.dataset.u,d=e.target.dataset.d;if(u!==undefined)swap(+u,+u-1);if(d!==undefined)swap(+d,+d+1);});
let dragP=null;
$("#order").addEventListener("dragstart",e=>{const li=e.target.closest("li");if(!li)return;dragP=+li.dataset.p;li.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(dragP));});
$("#order").addEventListener("dragover",e=>e.preventDefault());
$("#order").addEventListener("drop",e=>{e.preventDefault();const li=e.target.closest("li");if(li&&dragP!==null)swap(dragP,+li.dataset.p);dragP=null;});
$("#order").addEventListener("dragend",()=>{dragP=null;ordRender();});
$("#ordCheck").onclick=()=>{ordRender(true);const n=ord.filter((id,p)=>id===p).length;const f=$("#ordFb");f.className="fb "+(n===5?"ok":"no");f.textContent=n===5?"Correct order.":n+" of 5 in the right place.";};
$("#ordShuffle").onclick=()=>{do{ord=ord.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);}while(ord.every((v,i)=>v===i));ordRender();};
ordRender();

/* ---------- match activity ---------- */
const TERMS=["Lossless","Lossy","Run-length encoding","Sample rate","Bit depth","Resolution"];
const DEFS=[[3,"Number of sound samples taken each second, measured in Hz"],[0,"Compression where the original file can be rebuilt exactly"],[5,"Number of pixels in an image, width × height"],[2,"Stores repeated values as a count and the value"],[1,"Compression that permanently removes some data"],[4,"Number of bits used for each sample or colour"]];
let placed={},selT=null;
function mRender(marks){
  const inUse=new Set(Object.values(placed));
  $("#pool").innerHTML=TERMS.map((t,i)=>inUse.has(i)?"":'<button class="chip'+(selT===i?" sel":"")+'" draggable="true" data-t="'+i+'">'+t+'</button>').join("")||'<span style="color:var(--muted)">All placed</span>';
  $("#slots").innerHTML=DEFS.map(([ans,def],k)=>{
    const p=placed[k];
    const cls="slot"+(marks&&p!==undefined?(p===ans?" ok":" no"):"");
    return '<div class="'+cls+'" data-k="'+k+'"><div class="drop">'+(p!==undefined?'<button class="chip" data-r="'+k+'" draggable="true" data-t="'+p+'">'+TERMS[p]+'</button>':'<span style="color:var(--muted);font-size:.85rem">drop here</span>')+'</div><div>'+def+'</div></div>';}).join("");
  $("#mFb").textContent="";
}
function place(k,t){for(const key in placed)if(placed[key]===t)delete placed[key];placed[k]=t;selT=null;mRender();}
document.addEventListener("dragstart",e=>{const c=e.target.closest&&e.target.closest(".chip");if(c&&c.dataset.t!==undefined)e.dataTransfer.setData("text/plain","t"+c.dataset.t);});
$("#slots").addEventListener("dragover",e=>{const s=e.target.closest(".slot");if(s){e.preventDefault();s.classList.add("over");}});
$("#slots").addEventListener("dragleave",e=>{const s=e.target.closest(".slot");if(s)s.classList.remove("over");});
$("#slots").addEventListener("drop",e=>{e.preventDefault();const s=e.target.closest(".slot");const d=e.dataTransfer.getData("text/plain");if(s&&d[0]==="t")place(+s.dataset.k,+d.slice(1));});
$("#pool").addEventListener("dragover",e=>e.preventDefault());
$("#pool").addEventListener("drop",e=>{e.preventDefault();const d=e.dataTransfer.getData("text/plain");if(d[0]==="t"){const t=+d.slice(1);for(const key in placed)if(placed[key]===t)delete placed[key];mRender();}});
$("#pool").addEventListener("click",e=>{const c=e.target.closest(".chip");if(!c)return;selT=selT===+c.dataset.t?null:+c.dataset.t;mRender();});
$("#slots").addEventListener("click",e=>{
  const r=e.target.closest("[data-r]");
  if(r&&selT===null){delete placed[r.dataset.r];mRender();return;}
  const s=e.target.closest(".slot");if(s&&selT!==null)place(+s.dataset.k,selT);
});
$("#mCheck").onclick=()=>{mRender(true);const n=DEFS.filter(([a],k)=>placed[k]===a).length;const f=$("#mFb");f.className="fb "+(n===6?"ok":"no");f.textContent=n===6?"All correct.":n+" of 6 correct.";};
$("#mReset").onclick=()=>{placed={};selT=null;mRender();};
mRender();

})();
