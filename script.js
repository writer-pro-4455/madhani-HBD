(() => {
"use strict";
const C=window.BIRTHDAY_CONFIG||{},name=C.personName||"Madhani";
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
$$("[data-person-name]").forEach(e=>e.textContent=name);

let currentScreen="screen-intro";
const screens=$$(".screen");
function showScreen(id){
  screens.forEach(s=>s.classList.toggle("active",s.id===id));
  currentScreen=id; scrollTo({top:0,behavior:"smooth"});
  if(id==="screen-loading")runLoading();
  if(id==="screen-catch")startCatch();
  if(id==="screen-finale")burst(140);
}
$$("[data-next]").forEach(b=>b.onclick=()=>showScreen(b.dataset.next));

function toast(m,ms=1800){
  const e=$("#toast"); e.textContent=m;e.classList.add("show");
  clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),ms);
}

let sound=true,audioCtx;
function ctx(){if(!audioCtx){const A=window.AudioContext||window.webkitAudioContext;if(A)audioCtx=new A()}return audioCtx}
function beep(f=520,d=.08,t="sine",v=.05){
  if(!sound)return;const a=ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain();
  o.frequency.value=f;o.type=t;g.gain.setValueAtTime(v,a.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+d);
}
$("#soundToggle").onclick=()=>{sound=!sound;$("#soundIcon").textContent=sound?"🔊":"🔇";if(sound)beep(660)};
document.addEventListener("pointerdown",()=>{const a=ctx();if(a&&a.state==="suspended")a.resume()},{once:true});

// Password
const gate=$("#passwordGate"),form=$("#passwordForm"),input=$("#passwordInput"),msg=$("#passwordMessage"),reveal=$("#passwordReveal"),app=$("#app");
function setMsg(m,c=""){msg.textContent=m;msg.className="password-message"+(c?" "+c:"")}
function shake(){input.classList.remove("shake");void input.offsetWidth;input.classList.add("shake")}
input.oninput=()=>input.value.includes("_")
 ? setMsg("Madhani _ lam venam 😭😂 athellam illama podunga… open aagum 😌🔐🎁✨","underscore-warning")
 : setMsg("Hint: No nutrition calculation needed for this one 🥗😂");
reveal.onclick=()=>{const s=input.type==="text";input.type=s?"password":"text";reveal.textContent=s?"👀":"🙈";input.focus()};
form.onsubmit=e=>{
 e.preventDefault();const v=input.value;
 if(v.includes("_")){setMsg("Madhani _ lam venam 😭😂 athellam illama podunga… open aagum 😌🔐🎁✨","underscore-warning");shake();beep(190,.12,"square",.025);return}
 if(v==="vachu2224"){setMsg("Correct! Birthday vault unlocked 🎉🎁💜","success");burst(180);beep(660);setTimeout(()=>{gate.classList.add("unlocked");app.classList.remove("app-locked");app.classList.add("app-unlocked");app.setAttribute("aria-hidden","false")},550);return}
 setMsg("Aiyo… wrong password 😭😂 Try again, Madhani 🔐✨","error");shake();beep(170,.13,"square",.025);
};

// Loading
let loaded=false;
function runLoading(){
 if(loaded)return;loaded=true;
 const steps=[[18,"Checking happiness levels…"],[37,"Adding extra sparkle… ✨"],[58,"Loading dietitian-grade birthday energy… 🥗"],[76,"Securing the video gifts… 🎁"],[91,"Removing age information… ❌ FAILED 😂"],[100,"Birthday mode activated! 🎉"]];
 let i=0;const next=()=>{if(i>=steps.length){setTimeout(()=>{$("#loadingDone").classList.remove("hidden");burst(180)},300);return}
 const [p,t]=steps[i++];$("#birthdayProgress").style.width=p+"%";$("#loadingLine").textContent=t;beep(380+p*3,.05,"sine",.02);setTimeout(next,520)};setTimeout(next,250);
}

// Catch game
const arena=$("#catchArena"),basket=$("#basket");let running=false,score=0,bx=.5,items=[],spawn,last;
const types=[["🎁",1,30],["🎂",1,24],["🍓",1,19],["💣",-1,17],["🌶️",0,10]];
function pick(){let r=Math.random()*100;for(const t of types){r-=t[2];if(r<=0)return t}return types[0]}
function move(x){const r=arena.getBoundingClientRect();bx=clamp((x-r.left)/r.width,.08,.92);basket.style.left=bx*100+"%"}
arena.onpointermove=e=>{if(running)move(e.clientX)};arena.onpointerdown=e=>{if(running)move(e.clientX)};
addEventListener("keydown",e=>{if(!running||currentScreen!=="screen-catch")return;if(["ArrowLeft","a","A"].includes(e.key))bx-=.06;if(["ArrowRight","d","D"].includes(e.key))bx+=.06;bx=clamp(bx,.08,.92);basket.style.left=bx*100+"%"});
function spawnItem(){if(!running)return;const t=pick(),el=document.createElement("div"),r=arena.getBoundingClientRect();el.className="falling-item";el.textContent=t[0];arena.appendChild(el);const x=20+Math.random()*Math.max(40,r.width-80);el.style.left=x+"px";items.push({el,y:-60,s:150+Math.random()*90,t})}
function loop(ts){
 if(!running)return;if(!last)last=ts;const dt=Math.min((ts-last)/1000,.04);last=ts;const br=basket.getBoundingClientRect(),ar=arena.getBoundingClientRect();
 items=items.filter(o=>{o.y+=o.s*dt;o.el.style.top=o.y+"px";const r=o.el.getBoundingClientRect(),hit=r.bottom>=br.top+8&&r.top<=br.bottom&&r.right>=br.left+10&&r.left<=br.right-10;
 if(hit){caught(o.t);o.el.remove();return false}if(o.y>ar.height+80){o.el.remove();return false}return true});requestAnimationFrame(loop)
}
function caught(t){
 if(t[0]==="🌶️"){toast("Spicy bonus! 🌶️ Emotionally worth +100 😂");return}
 score=clamp(score+t[1],0,5);$("#catchScore").textContent=score;
 if(t[1]>0){beep(700+score*55,.09,"triangle",.04);burst(18)}else{beep(170,.13,"square",.03);toast("Sneaky bomb! −1 😅")}
 if(score>=5){running=false;clearInterval(spawn);items.forEach(x=>x.el.remove());items=[];$("#catchComplete").classList.remove("hidden");burst(120)}
}
function startCatch(){if(running||score>=5)return;running=true;last=null;spawn=setInterval(spawnItem,650);requestAnimationFrame(loop)}

// Gifts & video
function openGift(boxSel,wrapSel,videoSel){
 const b=$(boxSel),w=$(wrapSel),v=$(videoSel);if(b.classList.contains("opened"))return;b.classList.add("opened");burst(130);beep(660);
 setTimeout(()=>{b.classList.add("hidden");w.classList.remove("hidden");v.play().catch(()=>{})},720);
}
$("#giftBox1").onclick=()=>openGift("#giftBox1","#videoWrap1","#video1");
$("#giftBox2").onclick=()=>openGift("#giftBox2","#videoWrap2","#video2");
function setupVideo(vs,es,src){const v=$(vs),s=$("source",v);if(src){s.src=src;v.load()}v.onerror=()=>$(es).classList.remove("hidden");v.onended=()=>burst(70)}
setupVideo("#video1","#videoError1",C.video1);setupVideo("#video2","#videoError2",C.video2);
$("#continueAfterVideo1").onclick=()=>showScreen("screen-interlude");
$("#continueAfterVideo2").onclick=()=>showScreen("screen-finale");

// Hunt
let found=false,tries=0;
$$(".room-item").forEach(i=>i.onclick=()=>{
 tries++;$("#huntTries").textContent=tries;
 if(i.dataset.hunt==="secret"){if(found)return;found=true;$("#huntMessage").textContent="You found it! 🎁✨";$("#huntComplete").classList.remove("hidden");i.style.opacity=1;i.style.transform="scale(1.35) rotate(0deg)";burst(100);beep(880)}
 else{$("#huntMessage").textContent=i.dataset.msg||"Not there 😄";beep(260,.05,"sine",.025)}
});

// Quiz
$$(".quiz-btn").forEach((b,i)=>b.onclick=()=>{$$(".quiz-btn").forEach(x=>x.disabled=true);b.textContent+=" ✅";$("#quizSuccess").classList.remove("hidden");toast(i===3?"Perfect answer 😌":"Correct. Obviously 😂");burst(80)});

// Finale
$("#blowCandle").onclick=()=>{$("#flame").classList.add("out");$("#blowCandle").classList.add("hidden");setTimeout(()=>{$("#finalMessage").classList.remove("hidden");burst(320);[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.18,"triangle",.045),i*120))},520)};
$("#replayBtn").onclick=()=>location.reload();

// Confetti
const canvas=$("#confetti-canvas"),g=canvas.getContext("2d");let bits=[];const colors=["#f9a8d4","#c084fc","#fde68a","#86efac","#93c5fd","#fff"];
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";g.setTransform(d,0,0,d,0,0)}
addEventListener("resize",resize);resize();
function burst(n=120){for(let i=0;i<n;i++)bits.push({x:innerWidth/2+(Math.random()-.5)*220,y:innerHeight*.35+(Math.random()-.5)*80,vx:(Math.random()-.5)*10,vy:-3-Math.random()*7,a:1,r:3+Math.random()*5,c:colors[Math.random()*colors.length|0],rot:Math.random()*6.3,vr:(Math.random()-.5)*.3})}
(function draw(){g.clearRect(0,0,innerWidth,innerHeight);bits=bits.filter(p=>p.a>.015&&p.y<innerHeight+40);bits.forEach(p=>{p.vy+=.16;p.x+=p.vx;p.y+=p.vy;p.a*=.994;p.rot+=p.vr;g.save();g.globalAlpha=p.a;g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;g.fillRect(-p.r,-p.r*.6,p.r*2,p.r*1.2);g.restore()});requestAnimationFrame(draw)})();
setTimeout(()=>burst(45),700);
})();