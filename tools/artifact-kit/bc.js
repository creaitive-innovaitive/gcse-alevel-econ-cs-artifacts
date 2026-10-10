Lib.classify($("#cl1"), {
  prompt: "Is each item stored inside a block, or part of what happens around it?",
  buckets: [{ label: "Stored in the block" }, { label: "Happens around the block" }],
  items: [
    { text: "Transaction data", b: 0 }, { text: "Timestamp", b: 0 }, { text: "Hash of the previous block", b: 0 }, { text: "The block's own hash", b: 0 }, { text: "Nonce", b: 0 },
    { text: "Miners guess the nonce", b: 1 }, { text: "Nodes check the block is valid", b: 1 }, { text: "The block is copied to every node", b: 1 },
  ],
  done: "A block holds data, a timestamp, its own hash, the previous hash and a nonce.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Hash", "A fixed-length code made from data that cannot be run backwards"],
  ["Nonce", "The number a miner keeps changing to get a different hash"],
  ["Proof of work", "Spending real computing effort before adding a block"],
  ["Node", "A computer that holds a copy of the ledger"],
  ["Decentralised", "Not controlled by one central organisation"],
  ["Ledger", "A record of transactions"],
] });
Lib.order($("#o1"), { prompt: "Put the journey of a new block in order.", items: [
  "Transactions are grouped into a block.",
  "Miners guess nonces until a hash meets the difficulty rule.",
  "The block gets a timestamp and the previous block's hash.",
  "The new block is copied to every node.",
  "Each node updates its ledger.",
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which item links one block to the next?", opts: ["The nonce", "The previous block's hash", "The timestamp", "The transaction amount"], a: 1, why: "Storing the previous hash is what makes the chain." },
  { q: "What happens to a block's hash if its data is changed slightly?", opts: ["Nothing", "It changes completely", "It gets shorter", "It is deleted"], a: 1, why: "A good hash function gives a completely different result for any change." },
  { q: "Why is a blockchain called decentralised?", opts: ["It is stored in one place", "It is copied on many computers, with no single owner", "It is encrypted", "It is deleted after use"], a: 1, why: "Many nodes hold copies, so there is no single point of control." },
  { q: "What do miners change to try to meet the difficulty rule?", opts: ["The timestamp", "The nonce", "The previous hash", "The transaction"], a: 1, why: "The nonce is the only value they can change freely." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Blockchain", "A digital ledger made of blocks of data linked together with hashes, copied across many computers."],
  ["Block", "A batch of transactions with a timestamp, the previous block's hash and its own hash."],
  ["Hash", "A fixed-length code made from data by a hash function. Any change gives a completely different hash."],
  ["Previous hash", "The hash of the block before. Storing it links the blocks into a chain."],
  ["Nonce", "\"Number used once\": the number a miner changes to get a different hash on each guess."],
  ["Proof of work", "A miner must spend real computing effort before adding a block."],
  ["Difficulty", "How hard the mining puzzle is, for example how many leading zeros the hash needs."],
  ["Node", "A computer on the network that holds a copy of the ledger."],
  ["Consensus", "The nodes agreeing which new block is valid."],
  ["Symmetric encryption", "One shared key is used to encrypt and decrypt."],
  ["Asymmetric encryption", "A public key encrypts and a private key decrypts."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

const $=s=>document.querySelector(s);

/* ---- SHA-256 demo ---- */
async function sha(s){
 try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 catch(e){return null}
}
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,'0')}
async function doHash(){
 const v=$('#hin').value,r=await sha(v);
 $('#hout').textContent=r||fnv(v);$('#hnote').textContent=r?'(64 hex characters)':'(simple demo hash)';
}
$('#hin').addEventListener('input',doHash);doHash();

/* ---- Proof of work demo ---- */
$('#diff').addEventListener('input',e=>{$('#dn').textContent=e.target.value;$('#mo').textContent='1 in '+Math.pow(16,+e.target.value).toLocaleString('en-GB')});
$('#mine').addEventListener('click',()=>{
 const d=+$('#diff').value,target='0'.repeat(d),base='Block4|prev:91d4c6e2|Lan->Minh 5|';
 let n=0,h;const t0=performance.now();
 do{h=fnv(base+n);if(h.startsWith(target))break;n++}while(n<20000000);
 $('#mo').textContent='1 in '+Math.pow(16,d).toLocaleString('en-GB');$('#mn').textContent=n.toLocaleString('en-GB');$('#ma').textContent=(n+1).toLocaleString('en-GB');
 $('#mh').innerHTML='Hash: <span class="kw">'+h.slice(0,d)+'</span>'+h.slice(d)+' (starts with '+d+' zero'+(d>1?'s':'')+')';
});

/* ---- Caesar ---- */
function caesar(){
 const k=+$('#cshift').value;$('#csn').textContent=k;
 $('#cout').textContent=$('#cin').value.toUpperCase().replace(/[A-Z]/g,c=>String.fromCharCode((c.charCodeAt(0)-65+k)%26+65));
}
$('#cshift').addEventListener('input',caesar);$('#cin').addEventListener('input',caesar);caesar();

/* ---- Animation ---- */
const NODES=[[300,90],[420,80],[250,170],[470,170],[360,140]];
const NS='http://www.w3.org/2000/svg';
const linkG=$('#links'),nodeG=$('#nodes'),copyG=$('#copies');
const linkEls=[];
[[0,1],[0,2],[1,3],[2,4],[3,4],[0,4],[1,4],[2,3]].forEach(([a,b])=>{
 const l=document.createElementNS(NS,'line');l.setAttribute('class','s-link');
 l.setAttribute('x1',NODES[a][0]);l.setAttribute('y1',NODES[a][1]);l.setAttribute('x2',NODES[b][0]);l.setAttribute('y2',NODES[b][1]);
 linkG.appendChild(l);linkEls.push(l);
});
const nodeEls=NODES.map(([x,y],i)=>{
 const g=document.createElementNS(NS,'g');
 g.innerHTML='<circle class="s-node" cx="'+x+'" cy="'+y+'" r="20"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="11" font-weight="600">N'+(i+1)+'</text><text class="el chk" x="'+x+'" y="'+(y-26)+'" text-anchor="middle" font-size="14" style="fill:var(--good)">✓</text>';
 nodeG.appendChild(g);return g;
});
const copyEls=NODES.map(([x,y])=>{
 const r=document.createElementNS(NS,'rect');r.setAttribute('class','el s-blk');r.setAttribute('x',x+14);r.setAttribute('y',y+8);r.setAttribute('width',16);r.setAttribute('height',12);r.setAttribute('rx',3);
 copyG.appendChild(r);return r;
});
const STEPS=[
 {t:'1. Lan scans Minh\'s QR code (quét mã QR)',c:'Lan (Nguyễn Thị Lan, Hà Nội) opens her <span class="kw">wallet</span> app (ví) and scans the QR code of Minh (Trần Văn Minh, TP. Hồ Chí Minh). The code holds Minh\'s wallet address, which comes from his <span class="kw">public key</span> (khóa công khai). She enters <b>0.002 BTC</b>, about 4.000.000 ₫ in this example.'},
 {t:'2. Lan makes a transaction (giao dịch)',c:'The wallet builds a <span class="kw">transaction</span>: "Lan → Minh, 0.002 BTC". No bank is involved. It is only data so far, and it also includes a small fee for the miners.'},
 {t:'3. It is signed with her private key (khóa riêng)',c:'The wallet signs the transaction with Lan\'s <span class="kw">private key</span>, making a <span class="kw">digital signature</span> (chữ ký số). This proves it came from her and cannot be changed. The private key never leaves her phone.'},
 {t:'4. It is broadcast to the nodes (nút mạng)',c:'The signed transaction is sent to the <span class="kw">nodes</span>, computers around the world that each keep a copy of the <span class="kw">ledger</span> (sổ cái). No single computer is in charge, so the system is <span class="kw">decentralised</span> (phi tập trung).'},
 {t:'5. Nodes verify it (xác minh)',c:'Each node uses Lan\'s public key to check the signature and checks she really has 0.002 BTC. Valid: ✓. A forged signature or a coin already spent is an <span class="kw">invalid transaction</span> and is rejected.'},
 {t:'6. It goes into a new block (khối)',c:'A <span class="kw">miner</span> (thợ đào) collects verified transactions into a new <span class="kw">block</span>. It is <span class="kb">pending</span> (dashed) because the network has not agreed on it yet.'},
 {t:'7. Miners race: proof of work (bằng chứng công việc)',c:'Miners guess the <span class="kw">nonce</span> billions of times a second. N5 finds a hash with enough leading zeros first (green) and wins the <span class="kw">block reward</span> and the fees.'},
 {t:'8. The block is hashed and linked to the chain',c:'The block gets a <span class="kw">timestamp</span>, the <span class="kw">previous hash</span> (91d4c6e2) and its own <span class="kw">hash</span>. Storing the previous hash is what links it into the <span class="kw">blockchain</span> (chuỗi khối).'},
 {t:'9. Every node updates its ledger',c:'The new block is copied to every node. Minh\'s wallet now shows +0.002 BTC. Changing it later would change its hash and break every link after it, so it is <span class="kw">immutable</span> (bất biến).'},
 {t:'10. More blocks = more confirmations (xác nhận)',c:'Each new block built on top is another <span class="kg">confirmation</span>. After about 6 (roughly an hour), Minh treats the payment as final and ships the gift.'}
];
let step=0,timer=null;
const dots=$('#dots');
STEPS.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Go to step '+(i+1));b.addEventListener('click',()=>{stop();go(i)});dots.appendChild(b)});
const on=(el,f)=>{(typeof el==='string'?$(el):el).classList.toggle('on',f)};
function go(n){
 step=Math.max(0,Math.min(STEPS.length-1,n));const s=step,v=Math.max(0,Math.min(7,s-1));
 on('#qr',s===0);
 on('#pkt',s>=1&&s<=5);
 const pos='translate('+(s<=3?75:190)+'px,'+(s<=3?205:115)+'px)';
 $('#pkt').style.transform=pos;$('#sig').style.transform=pos;
 on('#sig',s>=3&&s<=5);
 linkEls.forEach(l=>l.classList.toggle('hot',s===4||s===5||s===7));
 nodeEls.forEach((g,i)=>{
  g.querySelector('circle').classList.toggle('win',(s===7||s===8)&&i===4);
  g.querySelector('.chk').classList.toggle('on',s===5);
 });
 on('#b3',s>=6);on('#lnk',s>=8);
 $('#b3r').classList.toggle('pend',s<8);
 on('#b3prev',s>=8);on('#b3ts',s>=8);on('#b3hash',s>=8);
 copyEls.forEach(c=>c.classList.toggle('on',s>=9));
 on('#stamp',s>=9);
 $('#lanBal').textContent='ví: '+(s>=9?'0.008':'0.010');$('#minhBal').textContent='ví: '+(s>=9?'0.003':'0.001');
 $('#cap').innerHTML='<h3>'+STEPS[s].t+'</h3><p>'+STEPS[s].c+'</p>';
 $('#cnt').textContent='Step '+(s+1)+' of '+STEPS.length;
 [...dots.children].forEach((d,i)=>{d.classList.toggle('on',i===s);d.classList.toggle('done',i<s)});
 $('#bk').disabled=s===0;$('#nx').disabled=s===STEPS.length-1;
}
function stop(){if(timer){clearInterval(timer);timer=null;$('#play').textContent='▶ Auto-play'}}
$('#nx').addEventListener('click',()=>{stop();go(step+1)});
$('#bk').addEventListener('click',()=>{stop();go(step-1)});
$('#play').addEventListener('click',()=>{
 if(timer){stop();return}
 if(step===STEPS.length-1)go(0);
 $('#play').textContent='❚❚ Pause';
 timer=setInterval(()=>{if(step>=STEPS.length-1){stop();return}go(step+1)},3200);
});
$('#stage').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){stop();go(step+1)}else if(e.key==='ArrowLeft'){stop();go(step-1)}});
go(0);

/* ---- Tooltips ---- */
const G={
'blockchain':'A digital ledger made of blocks of data linked together with hashes, copied across many computers.',
'decentralised':'Not controlled by one bank, company or government. Control is spread across many computers.',
'ledger':'A record of every transaction, like a bank statement everyone can check.',
'block':'A batch of transactions, plus a timestamp, the previous block\'s hash and its own hash.',
'chain':'Blocks joined in order, each storing the hash of the one before.',
'hash':'A fixed-length code made from data by a hash function. Change the data at all and the hash changes completely. It cannot be run backwards.',
'previous hash':'The hash of the block before this one. Storing it is what links the blocks into a chain.',
'node':'A computer on the network that keeps a copy of the blockchain and checks new transactions.',
'consensus':'How all the nodes agree on which block is added next, without anyone being in charge.',
'immutable':'Cannot be changed once it has been recorded.',
'private key':'A secret number only the owner knows. It is used to sign transactions and must never be shared.',
'public key':'A number shared with everyone. It is used to check a signature was made by the matching private key.',
'private key / public key':'A matched pair. Private key: secret, signs. Public key: shared, verifies.',
'key pair':'A matching private key and public key.',
'digital signature':'Data made from your private key and the transaction. It proves you approved it and that it was not altered afterwards.',
'nonce':'"Number used once". The number a miner keeps changing so the block gives a different hash each guess.',
'miner':'A computer owner who competes to add the next block by doing the proof-of-work guessing, and is paid for winning.',
'transaction':'A record of a payment, for example Lan sends Minh 5 coins.',
'verify':'To check something is genuine: that the signature is valid and the sender has enough coins.',
'invalid transaction':'A transaction that breaks the rules, such as a forged signature, or spending coins the sender does not have. Nodes reject it.',
'timestamp':'The date and time recorded in a block when it was created.',
'proof of work':'The system where miners must spend computing effort guessing to earn the right to add a block.',
'proof of stake':'A different system where computer owners lock up coins as a deposit and are chosen to add blocks, instead of mining. Uses much less energy.',
'smart contract':'A program stored on a blockchain that runs by itself when its conditions are met.',
'cryptography':'The science of keeping data secret and proving it is genuine.',
'encryption':'Scrambling data so only someone with the right key can read it.',
'decryption':'Turning scrambled data back into readable data using the key.',
'plaintext':'Data before encryption, in a readable form.',
'ciphertext':'Data after encryption, scrambled and unreadable.',
'algorithm':'A set of step-by-step rules for doing a task, such as encrypting data.',
'key':'A value used with an algorithm to encrypt or decrypt.',
'shared key':'The same secret key used by both people to encrypt and decrypt.',
'difficulty':'How hard the mining puzzle is. More zeros needed at the start of the hash means harder.',
'block reward':'New coins created for the miner who adds a block, as payment for their work.',
'transaction fees':'A small extra payment users add to a transaction so miners include it in a block.',
'halving':'The event roughly every four years when Bitcoin\'s block reward is cut in half.',
'asic':'A chip built to do one job only. Bitcoin ASICs just calculate hashes, extremely fast.',
'mining pool':'A group of miners who combine their computing power and share the reward.',
'51% attack':'When one person controls over half the network\'s power and can rewrite recent blocks. Extremely costly for Bitcoin.',
'stranded energy':'Power that is produced but has nobody nearby to use it, so it is very cheap or would be wasted.',
'pending':'Waiting to be confirmed. Not yet added to the chain.',
'defi':'Decentralised finance: lending, borrowing and trading run by smart contracts instead of banks.',
'nfts':'Non-fungible tokens: unique digital items whose ownership is recorded on a blockchain.'
};
const ALIAS={'hashed':'hash','verified':'verify','blocks':'block','nodes':'node','miners':'miner','transactions':'transaction','chains':'chain','hashes':'hash','invalid transactions':'invalid transaction','key pair':'key pair','decentralized':'decentralised','5 coins':null};
const tt=document.createElement('div');tt.id='tt';tt.setAttribute('role','tooltip');document.body.appendChild(tt);
let cur=null;
function find(t){t=t.toLowerCase().trim().replace(/[.,:;!?]+$/,'');if(G[t])return t;if(ALIAS[t])return ALIAS[t];if(t.endsWith('s')&&G[t.slice(0,-1)])return t.slice(0,-1);return null}
function open(el){
 const k=el.dataset.tip;tt.innerHTML='<b>'+k+'</b>'+G[k];tt.classList.add('show');cur=el;
 const r=el.getBoundingClientRect(),w=tt.offsetWidth,h=tt.offsetHeight;
 let x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8),y=r.top-h-8;
 if(y<8)y=r.bottom+8;
 tt.style.left=x+'px';tt.style.top=y+'px';
}
function close(){tt.classList.remove('show');cur=null}
function decorate(root){root.querySelectorAll('.kw,.kb,.kg').forEach(el=>{
 if(el.dataset.tip)return;const k=find(el.textContent);if(!k)return;
 el.dataset.tip=k;el.classList.add('hastip');el.tabIndex=0;
})}
decorate(document);
new MutationObserver(()=>decorate($('#cap'))).observe($('#cap'),{childList:true});
const T=e=>e.target.closest&&e.target.closest('.hastip');
document.addEventListener('mouseover',e=>{const el=T(e);if(el&&el!==cur)open(el)});
document.addEventListener('mouseout',e=>{if(T(e))close()});
document.addEventListener('focusin',e=>{const el=T(e);if(el)open(el)});
document.addEventListener('focusout',e=>{if(T(e))close()});
document.addEventListener('click',e=>{const el=T(e);if(el){e.stopPropagation();cur===el&&tt.classList.contains('show')?close():open(el)}});
document.addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
addEventListener('scroll',close,{passive:true});

})();
