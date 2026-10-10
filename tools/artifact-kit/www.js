Lib.stepper($("#stA"), {
  w: 760, h: 360, label: "A browser asks DNS for an IP address then requests the page from the web server", base: { a: 0, b: 0, c: 0, d: 0, e: 0 },
  draw: (s) => {
    const box = (x, y, t1, t2, cls) => SV.rect(x, y, 190, 80, cls, { rx: 12, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 95, y + 36, t1, "lbl bd", { "text-anchor": "middle" }) + SV.text(x + 95, y + 58, t2, "sm", { "text-anchor": "middle" });
    const msg = (x1, x2, y, t, op) => op ? SV.line(x1, y, x2, y, "c1", { opacity: op }) + SV.arrowHead(x2, y, x2 > x1 ? "r" : "l", "dot1") + SV.text((x1 + x2) / 2, y - 8, t, "sm", { "text-anchor": "middle", opacity: op }) : "";
    let o = box(30, 40, "Browser", "your computer", "f1") + box(285, 40, "DNS server", "name to IP address", "f4") + box(540, 40, "Web server", "stores the website", "f3");
    o += msg(222, 283, 70, "1 domain name", s.a) + msg(283, 222, 100, "2 IP address", s.b) + msg(222, 538, 160, "3 request page (HTTP/HTTPS)", s.c) + msg(538, 222, 200, "4 page + cookie", s.d);
    if (s.e) o += SV.text(125, 260, "Browser renders the HTML", "lbl bd t3", { "text-anchor": "middle", opacity: s.e }) + SV.text(125, 284, "and stores the cookie", "sm", { "text-anchor": "middle", opacity: s.e });
    return o;
  },
  steps: [
    { cap: "You type <b>www.school-shoes.com</b>. The <b>browser</b> does not know where that website is, only its name.", s: {} },
    { cap: "The browser sends the <b>domain name</b> to a <b>DNS server</b>. The DNS server looks it up in its database, and passes the request on if it does not have the record.", s: { a: 1 } },
    { cap: "The DNS server returns the <b>IP address</b> of the web server to the browser. It does not fetch the page.", s: { a: 1, b: 1 } },
    { cap: "The browser contacts the <b>web server</b> at that IP address and requests the page using <b>HTTP or HTTPS</b>.", s: { a: 1, b: 1, c: 1 } },
    { cap: "The web server sends the page (and may create a <b>cookie</b>) back to the browser, which <b>renders the HTML</b> and stores the cookie.", s: { a: 1, b: 1, c: 1, d: 1, e: 1 } },
  ],
});
Lib.classify($("#cl1"), {
  prompt: "Does each item belong to the internet itself, or to the World Wide Web?",
  buckets: [{ label: "The internet (network)" }, { label: "The World Wide Web" }],
  items: [
    { text: "Cables, routers and satellites", b: 0 }, { text: "Email", b: 0 }, { text: "Video calls (VoIP)", b: 0 }, { text: "Online games", b: 0 },
    { text: "Web pages written in HTML", b: 1 }, { text: "URLs and web browsers", b: 1 }, { text: "HTTP and HTTPS", b: 1 }, { text: "Reading a news site in Chrome", b: 1 },
  ],
  done: "The internet is the road network; the web is one of the things that travels along it.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["URL", "The full address of one resource on the web"],
  ["Domain name", "The human-friendly name of a website's host"],
  ["DNS", "Translates a domain name into an IP address"],
  ["HTTPS", "HTTP with encryption added using SSL/TLS"],
  ["Cookie", "A small text file created by a server and stored by the browser"],
  ["IP address", "A unique number that identifies a device on a network"],
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "What does a DNS server return to the browser?", opts: ["The web page", "An IP address", "A cookie", "A URL"], a: 1, why: "It translates the domain name into an IP address. The browser then contacts the web server." },
  { q: "Which of these is a use of the internet but not of the web?", opts: ["Reading a news site", "Sending an email", "Opening a URL", "Viewing an HTML page"], a: 1, why: "Email uses the internet but is not a web page reached through a browser." },
  { q: "A cookie is", opts: ["a virus", "a small text file", "a program", "a type of encryption"], a: 1, why: "Cookies are text files holding data. They cannot run code." },
  { q: "The padlock in the address bar shows that", opts: ["the site is honest", "the connection is encrypted", "the site has no virus", "cookies are blocked"], a: 1, why: "HTTPS encrypts the data between browser and server. It says nothing about honesty." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Internet", "A worldwide network made of many smaller networks joined together."],
  ["World Wide Web", "A collection of web pages stored on web servers and reached using a browser."],
  ["URL", "Uniform Resource Locator: the full address of a resource, such as protocol, domain name, path and page name."],
  ["HTML", "HyperText Markup Language: the code that describes the structure and content of a web page."],
  ["Web browser", "Software that requests web pages and renders HTML."],
  ["HTTP", "The rules browsers and web servers use to request and send pages. Not encrypted."],
  ["HTTPS", "HTTP with encryption using SSL/TLS and a digital certificate."],
  ["IP address", "A unique number that identifies a device on a network."],
  ["DNS", "Domain Name System: turns a domain name into an IP address."],
  ["Web server", "A computer that stores websites and sends pages when asked."],
  ["Cookie", "A small text file made by a web server and stored by the browser."],
  ["Blockchain", "A digital ledger of linked blocks, each holding the hash of the one before it."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

const $=s=>document.querySelector(s);

/* URL anatomy */
const urlText={
 proto:['Protocol','<code>https</code> is the set of rules used to request and send the page. The S means the data is encrypted. It is followed by <code>://</code>.'],
 domain:['Domain name','<code>www.school-shoes.com</code> is the name of the website\'s host. DNS converts it into the IP address of the web server.'],
 path:['Path','<code>/shop</code> is the folder on the web server where the page is stored.'],
 file:['Web page name','<code>trainers.html</code> is the specific file requested. The <code>.html</code> shows it is a page written in HTML.']
};
function showUrl(k){
 document.querySelectorAll('.url button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k));
 $('#urlinfo').innerHTML='<b>'+urlText[k][0]+'.</b> '+urlText[k][1];
}
document.querySelectorAll('.url button').forEach(b=>b.addEventListener('click',()=>showUrl(b.dataset.k)));
showUrl('proto');

/* Cookie flowchart sorter */
const ACTORS={user:['User','var(--accent)'],browser:['Browser','var(--good)'],dns:['DNS server','var(--amber)'],server:['Web server','var(--bad)']};
const CARDS=[
 {a:'user',t:'The user types the website\'s URL into the browser for the first time.',w:'Everything starts with a request from the user.'},
 {a:'dns',t:'A DNS server finds the IP address that matches the domain name and sends it back.',w:'The browser needs an IP address before it can reach the server.'},
 {a:'browser',t:'The browser sends a request for the page to the web server at that IP address.',w:'This is the HTTP or HTTPS request.'},
 {a:'server',t:'The web server sends the web page and creates a cookie containing a user ID and preferences.',w:'The server makes the cookie and returns it with the page.'},
 {a:'browser',t:'The browser stores the cookie on the user\'s device.',w:'Session cookies go in temporary memory, persistent ones onto storage.'},
 {a:'browser',t:'On the next visit, the browser sends the stored cookie to the web server with its request.',w:'This only happens on a return visit, after the cookie is stored.'},
 {a:'server',t:'The web server reads the cookie, recognises the user and sends a personalised page.',w:'The server can now load saved preferences or basket.'}
];
const N=CARDS.length;
let slots=Array(N).fill(null), pool=[], active=0, checked=false, dragId=null;
function shuffle(){
 const a=[...Array(N).keys()];
 do{for(let i=N-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}}while(a.every((v,i)=>v===i));
 return a;
}
function reset(){slots=Array(N).fill(null);pool=shuffle();active=0;checked=false;$('#score').textContent='';$('#score').className='';render()}
function firstEmpty(){const i=slots.indexOf(null);return i<0?-1:i}
function cardEl(id,inSlot,ok){
 const c=CARDS[id],el=document.createElement('div');
 el.className='pc';el.style.setProperty('--c',ACTORS[c.a][1]);el.draggable=true;el.tabIndex=0;el.dataset.id=id;
 el.setAttribute('role','button');
 el.innerHTML='<span class="who">'+ACTORS[c.a][0]+'</span><span>'+c.t+'</span>'+(inSlot&&ok?'<span class="why">'+c.w+'</span>':'');
 el.addEventListener('dragstart',e=>{dragId=id;el.classList.add('dragging');e.dataTransfer.setData('text/plain',String(id));e.dataTransfer.effectAllowed='move'});
 el.addEventListener('dragend',()=>{el.classList.remove('dragging');dragId=null;document.querySelectorAll('.over').forEach(x=>x.classList.remove('over'))});
 const act=()=>inSlot!==false&&inSlot!==undefined?removeAt(inSlot):place(id);
 el.addEventListener('click',act);
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act()}});
 return el;
}
function clearMarks(){if(checked){checked=false;$('#score').textContent='';$('#score').className=''}}
function place(id,at){
 clearMarks();
 let i=at!==undefined?at:(slots[active]===null?active:firstEmpty());
 if(i<0)return;
 const old=slots[i];
 const from=slots.indexOf(id);
 if(from>=0)slots[from]=null; else pool=pool.filter(x=>x!==id);
 if(old!==null&&old!==id)pool.push(old);
 slots[i]=id;
 const e=firstEmpty();active=e<0?i:e;
 render();
}
function removeAt(i){clearMarks();const id=slots[i];slots[i]=null;pool.push(id);active=i;render()}
function render(){
 const S=$('#slots');S.innerHTML='';
 slots.forEach((id,i)=>{
  const ok=checked&&id!==null?(id===i?'ok':'no'):'';
  const s=document.createElement('div');
  s.className='slot'+(id!==null?' filled':'')+(i===active&&id===null?' active':'')+(ok?' '+ok:'');
  s.dataset.i=i;
  s.innerHTML='<div class="n">STEP '+(i+1)+'</div>';
  if(id!==null)s.appendChild(cardEl(id,i,ok==='ok'));
  else{const p=document.createElement('div');p.className='ph';p.textContent='Tap a card below, or drag one here';s.appendChild(p);s.addEventListener('click',()=>{active=i;render()})}
  s.addEventListener('dragover',e=>{e.preventDefault();s.classList.add('over')});
  s.addEventListener('dragleave',()=>s.classList.remove('over'));
  s.addEventListener('drop',e=>{e.preventDefault();s.classList.remove('over');if(dragId!==null)place(dragId,i)});
  S.appendChild(s);
  if(i<N-1){const a=document.createElement('div');a.className='arrow';a.setAttribute('aria-hidden','true');a.textContent='↓';S.appendChild(a)}
 });
 const P=$('#pool');P.innerHTML='';
 pool.forEach(id=>P.appendChild(cardEl(id,undefined)));
 if(!pool.length){const d=document.createElement('div');d.className='note';d.style.alignSelf='center';d.textContent='All cards placed. Check your order.';P.appendChild(d)}
}
const P=$('#pool');
P.addEventListener('dragover',e=>{e.preventDefault();P.classList.add('over')});
P.addEventListener('dragleave',()=>P.classList.remove('over'));
P.addEventListener('drop',e=>{e.preventDefault();P.classList.remove('over');if(dragId===null)return;const f=slots.indexOf(dragId);if(f>=0){clearMarks();slots[f]=null;pool.push(dragId);active=f;render()}});
$('#check').addEventListener('click',()=>{
 checked=true;render();
 const filled=slots.filter(x=>x!==null).length,right=slots.filter((x,i)=>x===i).length;
 const sc=$('#score');
 if(filled<N){sc.textContent=right+' of '+filled+' placed cards are in the right step. '+(N-filled)+' still to place.';sc.className=''}
 else if(right===N){sc.textContent='All '+N+' correct. That is the full cookie cycle.';sc.className='good'}
 else{sc.textContent=right+' of '+N+' correct. Red steps are in the wrong place.';sc.className=''}
});
$('#reveal').addEventListener('click',()=>{slots=CARDS.map((_,i)=>i);pool=[];checked=true;active=0;render();$('#score').textContent='Answer shown.';$('#score').className=''});
$('#reset').addEventListener('click',reset);
$('#legend').innerHTML=Object.values(ACTORS).map(a=>'<span class="tag" style="color:'+a[1]+'">'+a[0]+'</span>').join('');
reset();

/* Blockchain demo */
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0')}
const DATA0=['Asha pays Ben £5','Ben pays Cai £2','Cai pays Dev £1'];
let data=[...DATA0],prevStored=[];
(function init(){let p='00000000';DATA0.forEach((d,i)=>{prevStored[i]=p;p=hash(p+d)})})();
function bcRender(editIdx){
 const cur=data.map((d,i)=>hash(prevStored[i]+d));
 const B=$('#bc');
 if(!B.children.length){
  data.forEach((d,i)=>{
   const el=document.createElement('div');el.className='blk';el.id='b'+i;
   el.innerHTML='<b>BLOCK '+(i+1)+'</b><small>Data</small><input id="bd'+i+'" value="'+d+'" aria-label="Block '+(i+1)+' data"><small>Previous hash</small><span class="h" id="bp'+i+'"></span><small>Hash</small><span class="h" id="bh'+i+'"></span><span class="st" id="bs'+i+'"></span>';
   B.appendChild(el);
   el.querySelector('input').addEventListener('input',e=>{data[i]=e.target.value;bcRender()});
  });
 }
 let broken=0;
 data.forEach((d,i)=>{
  const link=i===0||prevStored[i]===cur[i-1];
  $('#bp'+i).textContent=prevStored[i];
  $('#bh'+i).textContent=cur[i];
  const bad=!link;if(bad)broken++;
  $('#b'+i).classList.toggle('broken',bad);
  $('#bs'+i).textContent=bad?'Link broken: does not match block '+i:(i===0?'First block':'Link valid');
 });
 const changed=data.some((d,i)=>d!==DATA0[i]);
 $('#bcmsg').textContent=!changed?'Chain is intact.':(broken?'Tampering detected: later block(s) no longer match.':'Changed the last block only. Nothing after it points to it here, but its hash still changed.');
}
$('#bcreset').addEventListener('click',()=>{data=[...DATA0];DATA0.forEach((d,i)=>{$('#bd'+i).value=d});bcRender()});
bcRender();

})();
