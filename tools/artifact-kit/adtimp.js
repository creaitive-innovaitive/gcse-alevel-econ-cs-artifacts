Lib.cards($("#fc1"), { cards: [
  ["Abstract data type (ADT)", "A collection of data together with the operations used on that data, defined without saying how it is stored."],
  ["Stack", "A last in, first out ADT with push and pop. Can be built from a 1D array and a top pointer."],
  ["Queue", "A first in, first out ADT. Can be built from an array with front and rear pointers."],
  ["Linked list", "Nodes that each hold data and a pointer to the next node. Can be built from an array of records."],
  ["Pointer", "A value that holds the position (index or address) of another item."],
  ["Null pointer", "A pointer that marks that there is no next node, often shown as -1."],
  ["Start pointer", "Holds the index of the first node in a linked list."],
  ["Free list pointer", "Holds the index of the first unused node that new data can use."],
  ["Dictionary", "An ADT of key and value pairs. Keys are unique and unordered; the key is used to find the value."],
  ["Binary tree", "Nodes with a left pointer and a right pointer. Can be built from an array of records."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

(function(){
"use strict";
var $=function(id){return document.getElementById(id)};

/* ---------- linked list simulator ---------- */
var SIZE=12, ll, llSteps=[], llIdx=0, llPending=null;
function llInit(){
  var nodes=[];
  for(var i=0;i<SIZE;i++)nodes.push({item:"",ptr:i<SIZE-1?i+1:-1});
  ll={nodes:nodes,start:-1,heap:0};
  var seed=["Ann","Cy","Eli"];
  seed.forEach(function(n){var s=buildInsert(ll,n);ll=s[s.length-1].state;});
  llSteps=[];llIdx=0;
  llShow(ll,[],"Press Add or Delete to see each pointer change.");
  setBtns(false);
}
function clone(st){return {nodes:st.nodes.map(function(n){return {item:n.item,ptr:n.ptr}}),start:st.start,heap:st.heap}}
function buildInsert(st0,name){
  var st=clone(st0),steps=[];
  function snap(t,hl){steps.push({text:t,hl:hl,state:clone(st)})}
  if(st.heap===-1){snap("The heap is empty (heapStartPointer = -1), so the list is full.",[]);return steps;}
  var nw=st.heap;
  st.heap=st.nodes[nw].ptr;
  snap("Take node "+nw+" from the heap. heapStartPointer moves on to "+st.heap+".",[nw]);
  st.nodes[nw].item=name;
  snap("Store \""+name+"\" in node "+nw+".",[nw]);
  if(st.start===-1||name<st.nodes[st.start].item){
    st.nodes[nw].ptr=st.start;st.start=nw;
    snap("\""+name+"\" comes first. Its pointer takes the old startPointer, then startPointer = "+nw+".",[nw]);
    return steps;
  }
  var prev=st.start;
  snap("Start at node "+prev+" (\""+st.nodes[prev].item+"\") and walk along until the next name is not before \""+name+"\".",[prev]);
  while(st.nodes[prev].ptr!==-1&&st.nodes[st.nodes[prev].ptr].item<name){
    prev=st.nodes[prev].ptr;
    snap("\""+st.nodes[prev].item+"\" is before \""+name+"\". Move to node "+prev+".",[prev]);
  }
  st.nodes[nw].ptr=st.nodes[prev].ptr;
  snap("Set node "+nw+"'s pointer to "+st.nodes[nw].ptr+" (what node "+prev+" pointed to).",[nw,prev]);
  st.nodes[prev].ptr=nw;
  snap("Set node "+prev+"'s pointer to "+nw+". The new node is now linked in.",[nw,prev]);
  return steps;
}
function buildDelete(st0,name){
  var st=clone(st0),steps=[];
  function snap(t,hl){steps.push({text:t,hl:hl,state:clone(st)})}
  var prev=-1,cur=st.start;
  while(cur!==-1&&st.nodes[cur].item!==name){prev=cur;cur=st.nodes[cur].ptr;}
  if(cur===-1){snap("\""+name+"\" is not in the list.",[]);return steps;}
  snap("Found \""+name+"\" at node "+cur+".",[cur].concat(prev>=0?[prev]:[]));
  if(prev===-1){st.start=st.nodes[cur].ptr;snap("It is the first node, so startPointer = "+st.start+".",[cur]);}
  else{st.nodes[prev].ptr=st.nodes[cur].ptr;snap("Node "+prev+" now points to "+st.nodes[cur].ptr+", skipping node "+cur+".",[prev,cur]);}
  st.nodes[cur].ptr=st.heap;st.heap=cur;
  snap("Return node "+cur+" to the heap: its pointer takes heapStartPointer, then heapStartPointer = "+cur+". The old name is still in memory but unreachable.",[cur]);
  return steps;
}
function reach(st){var r={},c=st.start;while(c!==-1){r[c]=1;c=st.nodes[c].ptr;}return r}
function freeSet(st){var r={},c=st.heap;while(c!==-1){r[c]=1;c=st.nodes[c].ptr;}return r}
function llShow(st,hl,text){
  $("llvars").innerHTML="<span>startPointer = <b>"+st.start+"</b></span><span>heapStartPointer = <b>"+st.heap+"</b></span>";
  $("llstep").textContent=text;
  var live=reach(st),fr=freeSet(st),h="",ch="";
  st.nodes.forEach(function(n,i){
    var cls=live[i]?"live":(fr[i]?"free":"stale");
    if(!live[i]&&!fr[i])cls="stale";
    if(hl.indexOf(i)>=0)cls+=" hl";
    var tag=live[i]?"in list":(fr[i]?"heap":"orphan");
    var item=n.item===""?"":esc(n.item);
    h+="<tr class=\""+cls+"\"><td class=\"m\">"+i+"</td><td class=\"m\">"+item+"</td><td class=\"m\">"+n.ptr+"</td><td style=\"color:var(--muted);font-size:.8rem\">"+tag+"</td></tr>";
  });
  $("lltbody").innerHTML=h;
  var c=st.start,parts=[];
  while(c!==-1){parts.push("<span class=\"n"+(hl.indexOf(c)>=0?" hl":"")+"\">"+esc(st.nodes[c].item)+"</span>");c=st.nodes[c].ptr;}
  $("llchain").innerHTML=parts.length?parts.join("<span class=\"a\">→</span>")+"<span class=\"a\">→ null</span>":"<span class=\"a\">(empty list)</span>";
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function setBtns(running){$("llnext").disabled=!running;$("llall").disabled=!running;$("lladd").disabled=running;$("lldel").disabled=running;}
function llStart(steps){
  llSteps=steps;llIdx=0;setBtns(true);llAdvance();
}
function llAdvance(){
  var s=llSteps[llIdx];
  llShow(s.state,s.hl,"Step "+(llIdx+1)+" of "+llSteps.length+". "+s.text);
  llIdx++;
  if(llIdx>=llSteps.length){ll=s.state;setBtns(false);}
}
function cleanName(){var v=$("llname").value.trim();return v}
$("lladd").onclick=function(){var v=cleanName();if(!v)return;llStart(buildInsert(ll,v));};
$("lldel").onclick=function(){var v=cleanName();if(!v)return;llStart(buildDelete(ll,v));};
$("llnext").onclick=function(){if(llIdx<llSteps.length)llAdvance();};
$("llall").onclick=function(){while(llIdx<llSteps.length)llAdvance();};
$("llreset").onclick=function(){llInit();};
llInit();

/* ---------- dictionary simulator ---------- */
var DSIZE=8, dict;
function dInit(){
  dict={keys:[],values:[],start:-1,heap:0};
  for(var i=0;i<DSIZE;i++){dict.keys.push({item:"",ptr:i<DSIZE-1?i+1:-1});dict.values.push("");}
  [["Leon","27"],["Ahmad","78"],["Susie","64"]].forEach(function(p){dPutRaw(p[0],p[1]);});
  dRender([]);$("dout").innerHTML="Dictionary has 3 pairs. Try <b>Get</b> with the key <b>Susie</b>.";
}
function dFind(key){
  var c=dict.start,steps=0,path=[];
  while(c!==-1){steps++;path.push(c);if(dict.keys[c].item===key)return {idx:c,steps:steps,path:path};c=dict.keys[c].ptr;}
  return {idx:-1,steps:steps,path:path};
}
function dPutRaw(key,val){
  var f=dFind(key);
  if(f.idx>=0){dict.values[f.idx]=val;return "replaced";}
  if(dict.heap===-1)return "full";
  var n=dict.heap;dict.heap=dict.keys[n].ptr;
  dict.keys[n].item=key;dict.values[n]=val;dict.keys[n].ptr=dict.start;dict.start=n;
  return "added";
}
function dRender(hl){
  var live={},c=dict.start;while(c!==-1){live[c]=1;c=dict.keys[c].ptr;}
  var h="";
  for(var i=0;i<DSIZE;i++){
    var cls=live[i]?"live":"free";if(hl.indexOf(i)>=0)cls+=" hl";
    h+="<tr class=\""+cls+"\"><td class=\"m\">"+i+"</td><td class=\"m\">"+(live[i]?esc(dict.keys[i].item):"")+"</td><td class=\"m\">"+dict.keys[i].ptr+"</td><td class=\"m\">"+(live[i]?esc(dict.values[i]):"")+"</td></tr>";
  }
  $("dtbody").innerHTML=h;
}
$("dput").onclick=function(){
  var k=$("dkey").value.trim(),v=$("dval").value.trim();if(!k)return;
  var r=dPutRaw(k,v);var f=dFind(k);
  dRender(f.idx>=0?[f.idx]:[]);
  $("dout").innerHTML=r==="replaced"?"Key <b>"+esc(k)+"</b> already existed, so its value was replaced with <b>"+esc(v)+"</b>. A key never appears twice.":r==="full"?"Dictionary full: the heap is empty.":"Added <b>"+esc(k)+"</b> → <b>"+esc(v)+"</b>. The key node was taken from the heap and linked at the front.";
};
$("dget").onclick=function(){
  var k=$("dkey").value.trim();if(!k)return;
  var f=dFind(k);dRender(f.idx>=0?[f.idx]:f.path);
  $("dout").innerHTML=f.idx>=0?"Searched the key list: <b>"+f.steps+"</b> node"+(f.steps>1?"s":"")+" checked. Found at index "+f.idx+", so the value is <b>"+esc(dict.values[f.idx])+"</b>.":"Searched all <b>"+f.steps+"</b> keys and reached null (-1). Key <b>"+esc(k)+"</b> not found.";
};
$("dreset").onclick=dInit;
dInit();

/* ---------- match game ---------- */
var CARDS=[
 {t:"1D array and one top pointer",b:"Stack"},
 {t:"1D array with front and rear pointers",b:"Queue"},
 {t:"Array of records with item, pointer, start and heap pointers",b:"Linked list"},
 {t:"Array of records with left pointer, item and right pointer",b:"Binary tree"},
 {t:"A linked list of keys and a parallel array of values",b:"Dictionary"}
];
var BUCKETS=["Stack","Queue","Linked list","Binary tree","Dictionary"];
var placed, selCard=null;
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a}
function mInit(){
  placed={};selCard=null;
  var pool=$("pool");pool.innerHTML="";
  shuffle(CARDS.map(function(c,i){return i})).forEach(function(i){
    var b=document.createElement("button");b.className="drag";b.type="button";b.textContent=CARDS[i].t;b.draggable=true;b.dataset.i=i;
    b.onclick=function(){selCard=(selCard===b?null:b);document.querySelectorAll("#pool .drag").forEach(function(x){x.classList.toggle("sel",x===selCard)});};
    b.ondragstart=function(e){e.dataTransfer.setData("text/plain",String(i));selCard=b;};
    pool.appendChild(b);
  });
  var bk=$("buckets");bk.innerHTML="";
  BUCKETS.forEach(function(n){
    var d=document.createElement("div");d.className="bucket";d.dataset.n=n;d.innerHTML="<h4>"+n+"</h4>";
    d.onclick=function(){if(selCard)drop(d,+selCard.dataset.i);};
    d.ondragover=function(e){e.preventDefault();d.classList.add("over")};
    d.ondragleave=function(){d.classList.remove("over")};
    d.ondrop=function(e){e.preventDefault();d.classList.remove("over");var i=e.dataTransfer.getData("text/plain");if(i!=="")drop(d,+i);};
    bk.appendChild(d);
  });
  mScore();
}
function drop(bucket,i){
  var card=document.querySelector("#pool .drag[data-i=\""+i+"\"]");if(!card)return;
  if(CARDS[i].b===bucket.dataset.n){
    var c=document.createElement("div");c.className="drag";c.textContent=CARDS[i].t;bucket.appendChild(c);
    card.remove();placed[i]=1;selCard=null;mScore();
  }else{card.classList.remove("no");void card.offsetWidth;card.classList.add("no");$("mscore").textContent="Not that one. Think about which pointers that ADT needs.";}
}
function mScore(){var n=Object.keys(placed).length;$("mscore").innerHTML="Matched <b>"+n+"</b> of "+CARDS.length+(n===CARDS.length?" · all correct":"");}
$("mreset").onclick=mInit;mInit();

/* ---------- ordering ---------- */
var STEPS=["IF heapStartPointer = -1 THEN report list full","newPtr ← heapStartPointer","heapStartPointer ← myList[newPtr].pointer","myList[newPtr].item ← newItem","myList[newPtr].pointer ← startPointer","startPointer ← newPtr"];
var order;
function rRender(state){
  var ol=$("rank");ol.innerHTML="";
  order.forEach(function(s,pos){
    var li=document.createElement("li");
    if(state){li.className=(STEPS[pos]===s)?"ok":"bad";}
    li.innerHTML="<span>"+esc(s)+"</span>";
    var up=document.createElement("button");up.className="ghost";up.textContent="↑";up.setAttribute("aria-label","Move up");up.disabled=pos===0;
    var dn=document.createElement("button");dn.className="ghost";dn.textContent="↓";dn.setAttribute("aria-label","Move down");dn.disabled=pos===order.length-1;
    up.onclick=function(){var t=order[pos];order[pos]=order[pos-1];order[pos-1]=t;$("rfb").textContent="";rRender(false);};
    dn.onclick=function(){var t=order[pos];order[pos]=order[pos+1];order[pos+1]=t;$("rfb").textContent="";rRender(false);};
    li.appendChild(up);li.appendChild(dn);ol.appendChild(li);
  });
}
function rShuf(){do{order=shuffle(STEPS)}while(order.join()===STEPS.join());$("rfb").textContent="";rRender(false);}
$("rcheck").onclick=function(){
  rRender(true);
  var n=order.filter(function(s,i){return s===STEPS[i]}).length;
  var fb=$("rfb");
  if(n===STEPS.length){fb.className="fb ok";fb.textContent="Correct. Take from the heap, store the data, then link it in.";}
  else{fb.className="fb no";fb.textContent=n+" of "+STEPS.length+" in the right place. You must read the heap pointer before overwriting it.";}
};
$("rshuf").onclick=rShuf;rShuf();

/* ---------- quick check ---------- */
var QS=[
 {q:"In the linked list array, what does a pointer value of -1 mean?",o:["The node is deleted","There is no next node (null)","The list is full"],a:1,e:"-1 is the null pointer: the end of a chain."},
 {q:"A dictionary is built from a linked list. Where are the values stored?",o:["In the pointer field","In a parallel array at the same index as the key","In the heap"],a:1,e:"Keys sit in the list, values in a parallel array."},
 {q:"Which pointers does a queue implemented with an array need?",o:["top only","front and rear","left and right"],a:1,e:"Add at the rear, remove from the front."}
];
(function(){
  var box=$("mcq");
  QS.forEach(function(q,qi){
    var d=document.createElement("div");d.style.marginBottom="14px";
    d.innerHTML="<p><b>"+(qi+1)+". "+esc(q.q)+"</b></p><div class=\"opts\"></div><div class=\"fb\"></div>";
    var opts=d.querySelector(".opts"),fb=d.querySelector(".fb");
    q.o.forEach(function(t,oi){
      var b=document.createElement("button");b.type="button";b.textContent=t;
      b.onclick=function(){
        opts.querySelectorAll("button").forEach(function(x){x.classList.remove("right","wrong")});
        if(oi===q.a){b.classList.add("right");fb.className="fb ok";fb.textContent="Correct. "+q.e;}
        else{b.classList.add("wrong");fb.className="fb no";fb.textContent="Not quite. Try again.";}
      };
      opts.appendChild(b);
    });
    box.appendChild(d);
  });
})();

})();

})();
