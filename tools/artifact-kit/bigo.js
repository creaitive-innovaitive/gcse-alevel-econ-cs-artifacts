/* ---------- Watch: growth of steps ---------- */
Lib.stepper($("#stA"), {
  w: 760, h: 340, label: "Steps needed by four algorithm orders as N grows", base: { n: 4 },
  draw: (s) => {
    const N = s.n, rows = [["O(1)", 1, "c3"], ["O(log N)", Math.log2(N), "c1"], ["O(N)", N, "c4"], ["O(N²)", N * N, "c2"]], max = N * N, W = 520;
    let o = SV.text(40, 34, "N = " + Math.round(N), "lbl bd", { "text-anchor": "start" });
    rows.forEach((r, i) => {
      const y = 70 + i * 62, w = Math.max(4, (r[1] / max) * W);
      o += SV.text(120, y + 26, r[0], "lbl bd", { "text-anchor": "end" }) + SV.rect(130, y, w, 38, "f" + [3, 1, 4, 2][i], { style: "opacity:.75" }) + SV.text(136 + w, y + 25, Math.round(r[1] * 10) / 10 >= 1000 ? Math.round(r[1]).toLocaleString() : Lib.fmtN(r[1], 1), "lbl bd", { "text-anchor": "start" });
    });
    return o;
  },
  steps: [
    { cap: "With <b>4 items</b> all four orders look similar: 1, 2, 4 and 16 steps.", s: { n: 4 } },
    { cap: "At <b>16 items</b>: 1, 4, 16 and 256 steps. O(N²) is already pulling away.", s: { n: 16 } },
    { cap: "At <b>64 items</b>: 1, 6, 64 and 4,096 steps. O(log N) has barely moved.", s: { n: 64 } },
    { cap: "At <b>1,024 items</b>: 1, 10, 1,024 and more than a million steps. The difference only becomes obvious as N grows, and that is when it matters.", s: { n: 1024 } },
  ],
});

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which order of time complexity fits each description?",
  buckets: [{ label: "O(1)" }, { label: "O(log N)" }, { label: "O(N)" }, { label: "O(N²)" }],
  items: [
    { text: "Read the first item of an array", b: 0 }, { text: "Add two variables", b: 0 },
    { text: "Binary search of a sorted list", b: 1 }, { text: "Halve the problem each time", b: 1 },
    { text: "One loop through all N items", b: 2 }, { text: "Linear search, worst case", b: 2 },
    { text: "A loop inside a loop, both over N", b: 3 }, { text: "Bubble sort, worst case", b: 3 },
  ],
  done: "Fixed steps: O(1). Halving: O(log N). One loop: O(N). Nested loops: O(N²).",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Time complexity", "How the number of steps grows as N grows"],
  ["Space complexity", "How the memory needed grows as N grows"],
  ["O(1)", "Constant: the same work whatever N is"],
  ["O(N)", "Linear: work grows in proportion to N"],
  ["O(2^N)", "Exponential: work doubles for each extra item"],
  ["Worst case", "The largest number of steps an input of size N can need"],
] });
Lib.calc($("#c1"), { qs: [
  { q: "A loop inside a loop, both over N = 50 items. How many steps (order N²)?", a: 2500, hint: "N × N.", sol: "50 × 50 = 2,500." },
  { q: "An O(N²) algorithm takes 4 seconds for N = 100. Roughly how many seconds for N = 200?", a: 16, hint: "Doubling N multiplies N² by 4.", sol: "Doubling N gives 4 times the steps: 4 × 4 = 16 seconds." },
  { q: "An O(N) algorithm takes 3 seconds for N = 1,000. Roughly how many seconds for N = 4,000?", a: 12, hint: "Linear: four times the data, four times the time.", sol: "3 × 4 = 12 seconds." },
  { q: "Binary search on N = 1,024 items needs about how many comparisons (log₂ N)?", a: 10, hint: "How many times can you halve 1,024 to reach 1?", sol: "2¹⁰ = 1,024, so about 10 comparisons." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "What does Big O notation describe?", opts: ["The exact run time in seconds", "How the time or memory needed grows as N grows, in the worst case", "The number of lines of code", "The speed of the processor"], a: 1, why: "It describes growth with N, ignoring machine speed and constants." },
  { q: "Which is the order of an algorithm with two nested loops over N items?", opts: ["O(1)", "O(N)", "O(N²)", "O(log N)"], a: 2, why: "N iterations of an inner loop of N iterations gives N × N steps." },
  { q: "An algorithm uses a fixed number of variables whatever N is. Its space complexity is", opts: ["O(1)", "O(N)", "O(N²)", "O(log N)"], a: 0, why: "Memory does not grow with N." },
  { q: "N² + 3N + 7 simplifies to", opts: ["O(N)", "O(N²)", "O(3N)", "O(7)"], a: 1, why: "Keep only the term that grows fastest and drop constants." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Big O notation", "A notation describing how the time or memory an algorithm needs grows with N, in the worst case."],
  ["Time complexity", "How the number of steps grows as the amount of data N grows."],
  ["Space complexity", "How the memory needed grows as the amount of data N grows."],
  ["O(1)", "Constant time or space: does not depend on N."],
  ["O(log N)", "Logarithmic: halving the problem each step, such as binary search."],
  ["O(N)", "Linear: grows in direct proportion to N."],
  ["O(N log N)", "Typical of efficient sorts such as merge sort."],
  ["O(N²)", "Polynomial: nested loops over N, such as bubble sort."],
  ["O(2^N)", "Exponential: the work doubles with each extra item."],
  ["Worst case", "The input of size N that needs the most steps."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var fmt=function(n){return n>=1e15?n.toExponential(2):n.toLocaleString('en-GB')};
var log2=Math.log2;
var timers={};
function stopT(k){if(timers[k]){clearInterval(timers[k]);timers[k]=null}}
function every(k,ms,fn){stopT(k);timers[k]=setInterval(function(){if(fn()===false)stopT(k)},ms)}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function humanTime(sec){
  if(sec<0.001)return '< 1 ms';
  if(sec<1)return (sec*1000).toFixed(0)+' ms';
  if(sec<60)return sec.toFixed(1)+' seconds';
  if(sec<3600)return (sec/60).toFixed(1)+' minutes';
  if(sec<86400)return (sec/3600).toFixed(1)+' hours';
  if(sec<31536000)return (sec/86400).toFixed(1)+' days';
  var y=sec/31536000;return y<1e9?fmt(Math.round(y))+' years':y.toExponential(2)+' years';
}
function fibCalls(n){var a=1,b=1;for(var i=2;i<=n;i++){var c=a+b+1;a=b;b=c}return n<2?1:b}

/* ---------- 1 definition demo ---------- */
(function(){
  var N=$('#d1N'),pos=$('#d1pos'),cells=$('#d1cells'),out=$('#d1out');
  function target(){var n=+N.value;return pos.value==='best'?0:pos.value==='avg'?Math.floor(n/2):n-1}
  function draw(cur,done){
    var n=+N.value,t=target(),h='';
    for(var i=0;i<n;i++){var c='cell';if(i===t)c+=' target';if(cur>=0&&i<cur)c+=' seen';if(i===cur)c+=done?' found':' mid';h+='<span class="'+c+'">'+(i+1)+'</span>'}
    cells.innerHTML=h;$('#d1Nv').textContent=n;
  }
  function reset(){stopT('d1');draw(-1,false);out.innerHTML='Steps taken: <b>0</b> · the name is at position <b>'+(target()+1)+'</b> · worst case for N = '+N.value+' is <b>'+N.value+'</b> steps.'}
  $('#d1run').onclick=function(){
    var i=-1,t=target();draw(-1,false);
    every('d1',Math.max(60,400-N.value*8),function(){
      i++;var d=i===t;draw(i,d);
      out.innerHTML='Steps taken: <b>'+(i+1)+'</b> of a possible '+N.value+(d?' · <b>found</b> at position '+(i+1):' · checking item '+(i+1)+'…');
      return !d;
    });
  };
  $('#d1stop').onclick=reset;N.oninput=reset;pos.onchange=reset;reset();
})();

/* ---------- 2 time complexity ---------- */
var ORD=[
 {k:'O(1)',name:'Constant',c:1,desc:'Always takes the <b>same time</b> to perform the task, however much data there is.',ex:'Deciding if a number is even or odd.',real:'Opening a locker when you know its number: 10 lockers or 10,000, one step.',dbl:'Same time',f:function(){return 1}},
 {k:'O(log N)',name:'Logarithmic',c:2,desc:'The time goes up <b>linearly as the number of items goes up exponentially</b>. Double the data and you add just one extra step.',ex:'Binary search (on sorted data).',real:'Guess a number 1 to 1,000 with "higher/lower" clues: 10 guesses at most.',dbl:'One extra step',f:function(n){return Math.log2(n)}},
 {k:'O(N)',name:'Linear',c:3,desc:'The time grows <b>linearly, in direct proportion to N</b>, the number of items of data the algorithm is using.',ex:'A linear search.',real:'Reading down an unsorted register for one name.',dbl:'Twice the time',f:function(n){return n}},
 {k:'O(N²)',name:'Polynomial (quadratic)',c:4,desc:'The time grows in direct proportion to the <b>square of N</b>. Typically a loop inside a loop.',ex:'Bubble sort, insertion sort.',real:'Everyone in a room shakes hands with everyone else.',dbl:'Four times the time',f:function(n){return n*n}},
 {k:'O(2<sup>N</sup>)',name:'Exponential',c:5,desc:'The time <b>doubles every time the algorithm uses one extra item</b> of data.',ex:'Calculating Fibonacci numbers using recursion.',real:'Trying every combination of an N-switch lock.',dbl:'Squares (N + 1 items doubles it)',f:function(n){return Math.pow(2,n)}}
];
var tsel=0,idc=0;
function searchVis(root,mode){
  var id='sv'+(idc++),lin=mode==='lin';
  root.innerHTML='<div class="ctrl"><label for="'+id+'N">Items, N = <b id="'+id+'Nv"></b></label><input type="range" id="'+id+'N" min="4" max="64" value="32"></div>'+
   '<p style="margin:0 0 4px;color:var(--muted);font-size:.93rem">'+(lin?'Items are in any order. ':'Items are <b>sorted</b>, which binary search needs. ')+'Tap a cell to choose what to search for (dashed outline).</p>'+
   '<div class="cells" id="'+id+'c"></div>'+
   '<div class="btnrow"><button id="'+id+'play">▶ Play</button><button class="ghost" id="'+id+'step">Step</button><button class="ghost" id="'+id+'worst">Pick worst case</button><button class="ghost" id="'+id+'reset">Reset</button></div>'+
   '<div class="readout" id="'+id+'r"></div>';
  var N=$('#'+id+'N'),box=$('#'+id+'c'),r=$('#'+id+'r'),st,tgt;
  function binSteps(t,n){var lo=0,hi=n-1,s=0;while(lo<=hi){var m=(lo+hi)>>1;s++;if(m===t)return s;if(t<m)hi=m-1;else lo=m+1}return s}
  function worstIdx(n){if(lin)return n-1;var b=0,bi=0;for(var i=0;i<n;i++){var s=binSteps(i,n);if(s>b){b=s;bi=i}}return bi}
  function worstVal(n){return lin?n:Math.floor(log2(n))+1}
  function init(){var n=+N.value;stopT(id);st={lo:0,hi:n-1,i:-1,steps:0,mid:-1,found:false};if(tgt===undefined||tgt>=n)tgt=worstIdx(n);draw()}
  function draw(){
    var n=+N.value,h='';$('#'+id+'Nv').textContent=n;
    for(var i=0;i<n;i++){
      var c='cell';if(i===tgt)c+=' target';
      if(lin){if(i<st.i)c+=' seen';if(i===st.i)c+=st.found?' found':' mid'}
      else{if(i<st.lo||i>st.hi)c+=' dim';if(i===st.mid)c=c.replace(' dim','')+(st.found?' found':' mid')}
      h+='<button class="'+c+'" data-i="'+i+'" aria-label="Item '+(i+1)+'">'+(lin?(((i*7+3)%90)+10):(i+1)*2)+'</button>';
    }
    box.innerHTML=h;
    r.innerHTML='Comparisons so far: <b>'+st.steps+'</b> · worst case for N = '+n+': <b>'+worstVal(n)+'</b> '+(lin?'(N)':'(floor(log₂N) + 1)')+(st.found?' · <b>found</b>':'');
  }
  function step(){
    var n=+N.value;if(st.found)return false;
    if(lin){st.i++;st.steps++;if(st.i===tgt)st.found=true;if(st.i>=n-1&&!st.found)return false}
    else{if(st.lo>st.hi)return false;var m=(st.lo+st.hi)>>1;st.mid=m;st.steps++;if(m===tgt)st.found=true;else if(tgt<m)st.hi=m-1;else st.lo=m+1}
    draw();return !st.found;
  }
  box.onclick=function(e){var b=e.target.closest('button');if(!b)return;tgt=+b.dataset.i;init()};
  N.oninput=init;
  $('#'+id+'play').onclick=function(){init();every(id,lin?110:750,step)};
  $('#'+id+'step').onclick=function(){stopT(id);step()};
  $('#'+id+'worst').onclick=function(){tgt=worstIdx(+N.value);init()};
  $('#'+id+'reset').onclick=init;
  init();
}
function gridVis(root){
  root.innerHTML='<div class="ctrl"><label for="gN">N = <b id="gNv"></b></label><input type="range" id="gN" min="2" max="16" value="8"></div>'+
   '<pre class="code">FOR i ← 1 TO N\n   FOR j ← 1 TO N\n      compare items i and j\n   NEXT j\nNEXT i</pre>'+
   '<div class="grid-n" id="gg"></div><div class="btnrow"><button id="gplay">▶ Run the loops</button><button class="ghost" id="greset">Reset</button></div><div class="readout" id="gr"></div>';
  var N=$('#gN'),g=$('#gg'),r=$('#gr');
  function build(){var n=+N.value;stopT('g');$('#gNv').textContent=n;g.style.gridTemplateColumns='repeat('+n+',1fr)';g.style.maxWidth=Math.min(420,n*30)+'px';g.innerHTML=new Array(n*n+1).join('<i></i>');
    r.innerHTML='Inner-loop steps: <b>0</b> of N × N = <b>'+n*n+'</b> · double N to '+n*2+' and it becomes <b>'+(4*n*n)+'</b> (four times).'}
  N.oninput=build;$('#greset').onclick=build;
  $('#gplay').onclick=function(){build();var n=+N.value,k=0,cs=g.children;every('g',Math.max(8,600/n),function(){if(k>0)cs[k-1].className='on';if(k>=n*n){r.innerHTML='Finished: <b>'+(n*n)+'</b> steps = N × N. That is O(N²).';return false}cs[k].className='cur';k++;r.innerHTML='Inner-loop steps: <b>'+k+'</b> of N × N = <b>'+n*n+'</b>'})};
  build();
}
function expVis(root){
  root.innerHTML='<div class="ctrl"><label for="eN">N items, N = <b id="eNv"></b></label><input type="range" id="eN" min="1" max="50" value="10"></div>'+
   '<div class="facts"><div><small>Steps = 2<sup>N</sup></small><b class="mono" id="eS"></b></div><div><small>At 1 million steps per second</small><b id="eT"></b></div><div><small>Recursive fib(N) function calls</small><b class="mono" id="eF"></b></div></div>'+
   '<div class="tablewrap"><table><thead><tr><th>N</th><th style="text-align:right">2<sup>N</sup> steps</th><th>Time at 1M steps/s</th></tr></thead><tbody id="eTab"></tbody></table></div>';
  var N=$('#eN');
  function up(){var n=+N.value,s=Math.pow(2,n);$('#eNv').textContent=n;$('#eS').textContent=fmt(s);$('#eT').textContent=humanTime(s/1e6);$('#eF').textContent=n<=40?fmt(fibCalls(n)):'too many';
    var h='';for(var i=Math.max(1,n-4);i<=n;i++){var v=Math.pow(2,i);h+='<tr'+(i===n?' style="font-weight:600"':'')+'><td>'+i+'</td><td class="num">'+fmt(v)+'</td><td>'+humanTime(v/1e6)+'</td></tr>'}
    $('#eTab').innerHTML=h}
  N.oninput=up;up();
}
function constVis(root){
  root.innerHTML='<div class="ctrl"><label for="oN">Type any whole number</label><input type="number" id="oN" value="7" min="0" step="1"><button id="oGo">Odd or even?</button></div>'+
   '<pre class="code">IF number MOD 2 = 0 THEN OUTPUT "even" ELSE OUTPUT "odd"</pre><div class="readout" id="oR"></div>'+
   '<div class="tablewrap"><table><thead><tr><th>Size of number</th><th style="text-align:right">Steps</th></tr></thead><tbody><tr><td>7</td><td class="num">1</td></tr><tr><td>7,000</td><td class="num">1</td></tr><tr><td>7,000,000,000</td><td class="num">1</td></tr></tbody></table></div>';
  function go(){var v=Math.floor(+$('#oN').value||0);$('#oR').innerHTML=fmt(v)+' MOD 2 = <b>'+(v%2)+'</b> → <b>'+(v%2?'odd':'even')+'</b> · steps taken: <b>1</b>. The size of the number does not change the work.'}
  $('#oGo').onclick=go;$('#oN').oninput=go;go();
}
function drawTime(){
  var o=ORD[tsel];
  $('#tpanel').innerHTML='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="tag t'+o.c+'" style="font-size:.95rem">'+o.k+'</span><h3 style="margin:0">'+o.name+'</h3></div>'+
   '<p style="margin-top:10px">'+o.desc+'</p><div class="facts"><div><small>Textbook example</small>'+o.ex+'</div><div><small>Real world</small>'+o.real+'</div><div><small>If N doubles</small><b>'+o.dbl+'</b></div></div><div id="tvis"></div>';
  var v=$('#tvis');
  if(tsel===0)constVis(v);else if(tsel===1)searchVis(v,'bin');else if(tsel===2)searchVis(v,'lin');else if(tsel===3)gridVis(v);else expVis(v);
}
(function(){
  var tabs=$('#ttabs');
  tabs.innerHTML=ORD.map(function(o,i){return '<button class="tab" role="tab" data-i="'+i+'" aria-selected="'+(i===0)+'">'+o.k+'</button>'}).join('');
  tabs.onclick=function(e){var b=e.target.closest('.tab');if(!b)return;Object.keys(timers).forEach(stopT);tsel=+b.dataset.i;$$('.tab').forEach(function(t){t.setAttribute('aria-selected',t===b)});drawTime()};
  drawTime();
})();

/* comparison chart */
(function(){
  var cols=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)'],on=[1,1,1,1,1];
  var leg=$('#legend'),svg=$('#chart'),NS=$('#chN'),YS=$('#chY');
  leg.innerHTML=ORD.map(function(o,i){return '<label><input type="checkbox" id="lg'+i+'" checked style="accent-color:'+'var(--accent)'+'"><i style="background:'+cols[i]+'"></i>'+o.k+'</label>'}).join('');
  leg.onchange=function(e){var i=+e.target.id.slice(2);on[i]=e.target.checked?1:0;draw()};
  function draw(){
    var x0=48,x1=620,y0=14,y1=290,ym=+YS.value,n=+NS.value;
    function X(v){return x0+(v-1)/19*(x1-x0)}function Y(v){return y1-Math.min(v,ym*2)/ym*(y1-y0)}
    var h='<defs><clipPath id="cp"><rect x="'+x0+'" y="'+y0+'" width="'+(x1-x0)+'" height="'+(y1-y0)+'"/></clipPath></defs>';
    for(var t=0;t<=4;t++){var yy=y1-t/4*(y1-y0);h+='<line x1="'+x0+'" x2="'+x1+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)"/><text x="'+(x0-6)+'" y="'+(yy+4)+'" text-anchor="end">'+Math.round(ym*t/4)+'</text>'}
    [1,5,10,15,20].forEach(function(v){h+='<text x="'+X(v)+'" y="'+(y1+16)+'" text-anchor="middle">'+v+'</text>'});
    h+='<text x="'+((x0+x1)/2)+'" y="'+(y1+34)+'" text-anchor="middle">N (number of items)</text><text x="12" y="'+((y0+y1)/2)+'" transform="rotate(-90 12 '+((y0+y1)/2)+')" text-anchor="middle">steps</text>';
    h+='<g clip-path="url(#cp)">';
    ORD.forEach(function(o,i){if(!on[i])return;var p='';for(var v=1;v<=20.001;v+=0.1)p+=X(v).toFixed(1)+','+Y(o.f(v)).toFixed(1)+' ';h+='<polyline fill="none" stroke="'+cols[i]+'" stroke-width="2.6" stroke-linejoin="round" points="'+p+'"/>'});
    h+='</g><line x1="'+X(n)+'" x2="'+X(n)+'" y1="'+y0+'" y2="'+y1+'" stroke="var(--ink)" stroke-dasharray="4 4" opacity=".6"/>';
    ORD.forEach(function(o,i){if(on[i]&&o.f(n)<=ym)h+='<circle cx="'+X(n)+'" cy="'+Y(o.f(n))+'" r="5" fill="'+cols[i]+'" stroke="var(--surface)" stroke-width="2"/>'});
    svg.innerHTML=h;$('#chNv').textContent=n;
    $('#chTable').innerHTML=ORD.map(function(o,i){var a=o.f(n),b=o.f(2*n);return '<tr><td><span class="tag t'+o.c+'">'+o.k+'</span></td><td class="num">'+(i===1?a.toFixed(1):fmt(a))+'</td><td class="num">'+(i===1?b.toFixed(1):fmt(b))+'</td></tr>'}).join('');
  }
  NS.oninput=draw;YS.onchange=draw;draw();
})();

/* match game */
(function(){
  var items=[['Deciding if a number is even or odd',0],['Reading the first item of an array',0],['Linear search',2],['Binary search',1],['Bubble sort',3],['Insertion sort',3],['Recursive Fibonacci',4],['Finding the largest value in an unsorted list',2],['Comparing every item with every other item',3],['Halving a range until one item remains',1]];
  var pool=$('#pool'),bk=$('#buckets'),sc=$('#mscore'),sel=null,right,tries;
  function build(){
    right=0;tries=0;sel=null;
    bk.innerHTML=ORD.map(function(o,i){return '<div class="bucket" data-b="'+i+'" tabindex="0" role="button" aria-label="Drop in '+o.k+'"><h4><span class="tag t'+o.c+'">'+o.k+'</span></h4></div>'}).join('');
    pool.innerHTML=shuffle(items.map(function(x,i){return i})).map(function(i){return '<button class="drag" draggable="true" data-i="'+i+'" id="mc'+i+'">'+items[i][0]+'</button>'}).join('');
    score();
  }
  function score(){sc.innerHTML='Placed correctly: <b>'+right+' / '+items.length+'</b> · attempts: <b>'+tries+'</b>'+(right===items.length?' · <b>all matched</b>':'')}
  function place(card,b){
    var i=+card.dataset.i;tries++;
    if(items[i][1]===b){right++;card.classList.remove('sel');card.draggable=false;card.removeAttribute('id');$('.bucket[data-b="'+b+'"]').appendChild(card);card.disabled=true}
    else{card.classList.add('no');setTimeout(function(){card.classList.remove('no')},400)}
    sel=null;$$('.drag.sel').forEach(function(c){c.classList.remove('sel')});score();
  }
  var dragged=null;
  document.addEventListener('dragstart',function(e){var c=e.target.closest&&e.target.closest('.drag');if(c&&c.closest('#match')){dragged=c;try{e.dataTransfer.setData('text/plain',c.dataset.i)}catch(x){}}});
  bk.addEventListener('dragover',function(e){var b=e.target.closest('.bucket');if(b){e.preventDefault();b.classList.add('over')}});
  bk.addEventListener('dragleave',function(e){var b=e.target.closest('.bucket');if(b)b.classList.remove('over')});
  bk.addEventListener('drop',function(e){e.preventDefault();var b=e.target.closest('.bucket');if(!b)return;b.classList.remove('over');if(dragged)place(dragged,+b.dataset.b);dragged=null});
  pool.addEventListener('click',function(e){var c=e.target.closest('.drag');if(!c||c.disabled)return;$$('.drag.sel').forEach(function(x){x.classList.remove('sel')});sel=c;c.classList.add('sel')});
  bk.addEventListener('click',function(e){var b=e.target.closest('.bucket');if(b&&sel)place(sel,+b.dataset.b)});
  bk.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&sel){e.preventDefault();place(sel,+e.target.closest('.bucket').dataset.b)}});
  $('#mreset').onclick=build;build();
})();

/* rank */
(function(){
  var list=$('#rank'),fb=$('#rfb'),order;
  function draw(res){
    list.innerHTML=order.map(function(k,p){var cls=res?(k===p?'ok':'bad'):'';return '<li class="'+cls+'"><span class="tag t'+ORD[k].c+'">'+ORD[k].k+'</span><span>'+ORD[k].name+'</span><button class="ghost" data-m="-1" data-p="'+p+'" aria-label="Move up">↑</button><button class="ghost" data-m="1" data-p="'+p+'" aria-label="Move down">↓</button></li>'}).join('');
  }
  function sh(){do{order=shuffle([0,1,2,3,4])}while(order.join()==='0,1,2,3,4');fb.textContent='';draw()}
  list.onclick=function(e){var b=e.target.closest('button');if(!b)return;var p=+b.dataset.p,q=p+ +b.dataset.m;if(q<0||q>4)return;var t=order[p];order[p]=order[q];order[q]=t;fb.textContent='';draw()};
  $('#rcheck').onclick=function(){var n=order.filter(function(k,p){return k===p}).length;draw(true);fb.className='fb '+(n===5?'ok':'no');fb.textContent=n===5?'Correct: constant, logarithmic, linear, quadratic, exponential.':n+' of 5 in the right place. Hint: what happens when N doubles?'};
  $('#rshuf').onclick=sh;sh();
})();

/* ---------- 3 space ---------- */
(function(){
  var N=$('#spN'),c1=$('#sp1cells'),c2=$('#sp2cells');
  function draw(fill){
    var n=+N.value,h='';$('#spNv').textContent=n;
    c1.innerHTML=['a','b','c','d'].map(function(v){return '<span class="cell mem fill">'+v+'</span>'}).join('');
    $('#sp1out').innerHTML='Memory cells: <b>4</b> whatever N is';
    for(var i=1;i<=n;i++)h+='<span class="cell mem'+(fill!==undefined&&i<=fill?' fill':'')+'">'+i+'</span>';
    h+='<span class="cell mem fill">total</span><span class="cell mem fill">i</span>';
    c2.innerHTML=h;$('#sp2out').innerHTML='Memory cells: <b>'+(n+2)+'</b> (N array cells + total + i)';
    var t='',pts=[1,5,10,100,1000,1000000];pts.forEach(function(v){t+='<tr><td class="num" style="text-align:left">'+fmt(v)+'</td><td class="num">4</td><td class="num">'+fmt(v+2)+'</td></tr>'});
    $('#spTable').innerHTML=t;
  }
  N.oninput=function(){stopT('sp');draw()};
  $('#sp2run').onclick=function(){var n=+N.value,k=0;draw(0);every('sp',Math.max(40,300-n*8),function(){k++;draw(k);return k<n})};
  draw();
})();
function quiz(root,qs,opts,bad){
  var i=0,score=0;
  function show(){
    if(i>=qs.length){root.innerHTML='<div class="good"><b>Finished</b>You scored '+score+' / '+qs.length+'.</div><button class="ghost" id="qz'+root.id+'">Try again</button>';$('#qz'+root.id).onclick=function(){i=0;score=0;show()};return}
    var q=qs[i];
    root.innerHTML='<div class="eyebrow">Question '+(i+1)+' of '+qs.length+'</div><p style="margin-top:6px"><b>'+q.q+'</b></p>'+(q.code?'<pre class="code">'+q.code+'</pre>':'')+
      '<div class="opts">'+opts.map(function(o,k){return '<button data-k="'+k+'">'+o+'</button>'}).join('')+'</div><div class="fb" role="status"></div>';
    var done=false;
    $$('.opts button',root).forEach(function(b){b.onclick=function(){
      if(done)return;done=true;var k=+b.dataset.k,ok=k===q.a;if(ok)score++;
      b.classList.add(ok?'right':'wrong');if(!ok)$$('.opts button',root)[q.a].classList.add('right');
      var f=$('.fb',root);f.className='fb '+(ok?'ok':'no');f.innerHTML=(ok?'Correct. ':'Not quite. ')+q.e+' <button class="ghost" id="nx'+root.id+'" style="margin-left:6px">Next</button>';
      $('#nx'+root.id).onclick=function(){i++;show()};
    }});
  }
  show();
}
quiz($('#spq'),[
 {q:'What is the space complexity of this code?',code:'a ← 5\nb ← 8\nc ← a * b',a:0,e:'Only three variables are used, whatever the data. O(1).'},
 {q:'What is the space complexity of this code?',code:'DECLARE marks : ARRAY[1:N] OF INTEGER\nFOR i ← 1 TO N\n   INPUT marks[i]\nNEXT i',a:1,e:'The array has N elements, so memory grows with N. O(N).'},
 {q:'A loop runs N times, adding each input to one variable called total. What is the SPACE complexity?',a:0,e:'Only total and the counter exist. The time is O(N), but the space stays O(1).'},
 {q:'Copying an array of N items into a second array of N items. Extra space?',a:1,e:'A second array of N cells is needed. O(N).'}
],['O(1)','O(N)']);
quiz($('#spot'),[
 {q:'What is the time complexity?',code:'total ← 0\nFOR i ← 1 TO N\n   total ← total + data[i]\nNEXT i',a:2,e:'One loop through N items: O(N).'},
 {q:'What is the time complexity?',code:'first ← data[1]\nOUTPUT first',a:0,e:'Two steps whatever N is, so O(1).'},
 {q:'What is the time complexity?',code:'FOR i ← 1 TO N\n   FOR j ← 1 TO N\n      IF data[i] = data[j] THEN count ← count + 1\n   NEXT j\nNEXT i',a:3,e:'A loop inside a loop, both over N: N × N. O(N²).'},
 {q:'What is the time complexity?',code:'steps ← 0\nWHILE n > 1\n   n ← n DIV 2\n   steps ← steps + 1\nENDWHILE',a:1,e:'n is halved each time, so the number of loops is about log₂N. O(log N).'},
 {q:'What is the time complexity? (Careful.)',code:'FOR i ← 1 TO N\n   OUTPUT data[i]\nNEXT i\nFOR j ← 1 TO N\n   OUTPUT data[j]\nNEXT j',a:2,e:'Loops one after the other add: N + N = 2N, which is still O(N). Only nested loops multiply.'},
 {q:'What is the time complexity? (Careful.)',code:'FOR i ← 1 TO 10\n   OUTPUT "Hello"\nNEXT i',a:0,e:'The loop always runs 10 times, however large N is. Fixed work is O(1).'},
 {q:'What is the time complexity?',code:'FUNCTION fib(n)\n   IF n <= 1 THEN RETURN n\n   RETURN fib(n-1) + fib(n-2)\nENDFUNCTION',a:4,e:'Each call makes two more calls, so the work roughly doubles per extra n: exponential.'}
],ORD.map(function(o){return o.k}));

/* ---------- 4 dictionary lookup + race ---------- */
(function(){
  var d=[[27,'Leon'],[78,'Ahmad'],[64,'Susie']],b=$('#dlook'),o=$('#dlout');
  b.innerHTML=d.map(function(x){return '<button class="ghost" data-k="'+x[0]+'">Find key '+x[0]+'</button>'}).join('')+'<button class="ghost" data-k="99">Find key 99</button>';
  b.onclick=function(e){var t=e.target.closest('button');if(!t)return;var k=+t.dataset.k,s=[],f=null;
    for(var i=0;i<d.length;i++){s.push('node '+(i+1)+' (key '+d[i][0]+')'+(d[i][0]===k?' matches':' no match'));if(d[i][0]===k){f=d[i][1];break}}
    o.innerHTML='Followed pointers: '+s.join(' → ')+(f?'<br>Value returned: <b>'+f+'</b>':' → null pointer reached.<br><b>Key not found.</b>')+'<br>Comparisons: <b>'+s.length+'</b>'};
  var R=$('#raceN');
  function race(){var n=Math.pow(10,+R.value/20*6),nn=Math.max(1,Math.round(n));if(+R.value<=1)nn=1;
    var l=nn,bs=Math.floor(log2(nn))+1;$('#raceNv').textContent=fmt(nn);$('#raceL').textContent=fmt(l)+' comparisons';$('#raceB').textContent=fmt(bs)+' comparisons';
    $('#raceBb').style.width=Math.max(1,bs/l*100)+'%'}
  R.oninput=race;race();
})();

/* ---------- 5 exam questions ---------- */
function examQ(root,q){
  var el=document.createElement('details');
  el.innerHTML='<summary>'+q.title+' <span class="marks">'+q.marks+' marks</span></summary><div class="inner"><p class="mono" style="color:var(--muted);margin-bottom:8px">'+q.src+'</p>'+q.body+
   '<label for="ans'+q.id+'" class="eyebrow">Your answer</label><textarea id="ans'+q.id+'" placeholder="Write your answer here first…"></textarea>'+
   '<div class="btnrow"><button id="rv'+q.id+'">Show mark points</button></div><div id="ms'+q.id+'" hidden></div></div>';
  root.appendChild(el);
  $('#rv'+q.id,el).onclick=function(){
    var m=$('#ms'+q.id,el);if(!m.hidden){m.hidden=true;this.textContent='Show mark points';return}
    this.textContent='Hide mark points';m.hidden=false;
    m.innerHTML='<p style="margin-bottom:0">Tick each point your answer made.</p><ul class="mp">'+q.pts.map(function(p,i){return '<li><input type="checkbox" id="cb'+q.id+'_'+i+'"><label for="cb'+q.id+'_'+i+'">'+p+'</label></li>'}).join('')+'</ul><div class="score" id="sc'+q.id+'">Your mark: 0 / '+q.marks+'</div>'+
      '<div class="tip"><b>Examiner tips</b>'+q.tips+'</div>';
    $$('input[type=checkbox]',m).forEach(function(c){c.onchange=function(){var n=$$('input:checked',m).length;$('#sc'+q.id,m).textContent='Your mark: '+Math.min(n,q.marks)+' / '+q.marks}});
  };
}
var PP=[
 {id:'p1',title:'Question 1: binary search (a) and (c)',marks:3,src:'9618/31 May/June 2024, Q10(a) and (c)',
  body:'<p>(a) State a condition that must be true for an array to be searchable using a binary search. <b>[1]</b></p><p>(c) Describe the performance of a binary search in relation to the number of data items in the array being searched. Refer to Big O notation in your answer. <b>[2]</b></p>',
  pts:['<b>(a)</b> The array must be <b>sorted</b> / in order (ascending or descending).','<b>(c)</b> Binary search is <b>O(log₂ N)</b> (O(log N)).','<b>(c)</b> Each comparison halves the search field, so the time taken increases only <b>slowly / logarithmically</b> as the number of items increases (it scales much better than a linear O(N) search).'],
  tips:'"Describe" plus "Refer to Big O" means give the notation <i>and</i> a sentence about how time changes as N grows. The notation alone gets 1 of the 2 marks. Do not say "it is faster"; say how the time grows.'},
 {id:'p2',title:'Question 2: binary vs linear search (b)(i), (b)(ii), (b)(iii) and (c)',marks:9,src:'9618/32 May/June 2022, Q8(b) and (c)',
  body:'<p>A binary search or a linear search can be used to look for a specific value in an array.</p><p>(b)(i) State the necessary condition for a binary search. <b>[1]</b></p><p>(b)(ii) Describe how to perform a binary search. <b>[4]</b></p><p>(b)(iii) Explain how the performance of a binary search varies according to the number of values in the array. <b>[1]</b></p><p>(c) Compare the performance of the algorithms for a binary search and a linear search using Big O notation for order of time complexity. <b>[3]</b></p>',
  pts:['<b>(b)(i)</b> The array/list must already be <b>sorted</b>.','<b>(b)(ii)</b> Find the <b>middle</b> item/index of the (sub)list.','<b>(b)(ii)</b> <b>Compare</b> the middle value with the item searched for; if equal, it is found.','<b>(b)(ii)</b> If not, <b>discard the half</b> that cannot contain the item (depends on whether the middle is greater or less than the target).','<b>(b)(ii)</b> <b>Repeat</b> on the remaining half until the item is found or only one item is left and it does not match.','<b>(b)(iii)</b> As the number of items increases, the time taken increases, but only <b>slowly</b>.','<b>(c)</b> A linear search is <b>O(N)</b> and a binary search is <b>O(log₂ N)</b>.','<b>(c)</b> For a linear search, the time increases <b>linearly</b> (in proportion) with the number of items.','<b>(c)</b> For a binary search, the time increases <b>logarithmically</b>, much more slowly than a linear search as the list grows.'],
  tips:'The four marks for (b)(ii) are a sequence: find middle, compare, discard half, repeat. A one-line "it halves the list" gets one mark at most. In (c) the third mark needs a <i>comparison</i>: "much slower rise than", not two separate descriptions.'}
];
var XQ=[
 {id:'x1',title:'Practice 1: sort and recursion orders',marks:2,src:'Written for revision · Big O time complexity',
  body:'<p>(a) State the Big O order of time complexity of a bubble sort. <b>[1]</b></p><p>(b) State the Big O order of time complexity of calculating Fibonacci numbers using recursion. <b>[1]</b></p>',
  pts:'<b>(a)</b> O(N²)|<b>(b)</b> O(2<sup>N</sup>)'.split('|'),
  tips:'Pure recall marks. Write the notation exactly, with the superscript. "Exponential" on its own is a risk; give the notation and the name if you have space.'},
 {id:'x2',title:'Practice 2: the doubling test',marks:3,src:'Written for revision · Big O time complexity',
  body:'<p>An algorithm has time complexity O(N²). It takes 2 seconds to process 1,000 items.</p><p>(a) Describe what O(N²) means. <b>[1]</b></p><p>(b) Estimate the time it will take to process 3,000 items. Show your working. <b>[2]</b></p>',
  pts:['<b>(a)</b> The time taken grows in proportion to the <b>square of N</b>, the number of items.','<b>(b)</b> 3 times the items means <b>3² = 9</b> times the time.','<b>(b)</b> 9 × 2 = <b>18 seconds</b>.'],
  tips:'Do the doubling (or tripling) test: multiply N by k and the time is multiplied by k². Show the "3² = 9" step, because the method mark is separate from the answer mark.'},
 {id:'x3',title:'Practice 3: space complexity',marks:3,src:'Written for revision · Big O space complexity',
  body:'<p>A program reads N test marks into an array and then calculates their total.</p><p>(a) State the Big O order of space complexity of the program. <b>[1]</b></p><p>(b) Justify your answer. <b>[2]</b></p>',
  pts:['<b>(a)</b> O(N).','<b>(b)</b> The array needs <b>N elements/memory locations</b>.','<b>(b)</b> So the memory used <b>grows in direct proportion to N</b>.'],
  tips:'Challenge: if the program added each mark to a running total as it was entered, without storing the marks, the space would be O(1). Only the total and a counter are needed.'},
 {id:'x4',title:'Practice 4: choosing an algorithm',marks:4,src:'Written for revision · Compare command word',
  body:'<p>A school has a sorted list of 1,000,000 student IDs. Compare a linear search and a binary search for finding one ID, using Big O notation. <b>[4]</b></p>',
  pts:['A linear search is <b>O(N)</b>: in the worst case every ID is checked (up to 1,000,000 comparisons).','A binary search is <b>O(log N)</b>: it halves the list each time, so about <b>20 comparisons</b> at most.','The time for a linear search grows <b>in proportion to N</b>, whereas for a binary search it grows <b>only logarithmically</b> (very slowly) as N grows.','The binary search is <b>much more efficient</b> here because the list is already sorted. If the list were unsorted, it would need sorting first.'],
  tips:'Use the numbers: 1,000,000 against about 20 makes the comparison concrete. floor(log₂ 1,000,000) + 1 = 20. Include the condition that the data is sorted.'}
];
PP.forEach(function(q){examQ($('#ppqs'),q)});
XQ.forEach(function(q){examQ($('#xqs'),q)});
})();

})();
