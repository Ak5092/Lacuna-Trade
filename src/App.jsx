import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   LACUNA TRADE v7 — ETHEREAL SURGE DESIGN SYSTEM
   "The Living Void" — Editorial fintech meets digital art
   ═══════════════════════════════════════════════════════════════ */

// ── ETHEREAL SURGE TOKENS ─────────────────────────────────────
const S = {
  bg:"#0e0e0e", sLo:"#131313", sCon:"#1a1919", sHi:"#201f1f",
  sHigh:"#262626", sVar:"#262626", sBri:"#2c2c2c", sLow:"#000000",
  pri:"#97a9ff", pDim:"#8a9cf0", pCon:"#8a9cf0",
  sec:"#00fc40", seDim:"#00ec3b", seCon:"#006e16",
  ter:"#ff9063", tDim:"#fc773d", tCon:"#ff793f",
  err:"#ff6e84", eDim:"#d73357",
  on:"#ffffff", onV:"#adaaaa", out:"#767575", outV:"#484847",
};

// ── GLASS PANEL (Ethereal Surge Spec) ─────────────────────────
const Glass = ({children, style={}, level="card"}) => {
  const bg = {
    card: "rgba(38,38,38,0.4)",
    nav: "rgba(32,31,31,0.4)",
    float: "rgba(38,38,38,0.2)",
  }[level] || "rgba(38,38,38,0.4)";
  return (
    <div style={{background: bg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:32, position:"relative", overflow:"hidden", ...style}}>
      {children}
    </div>
  );
};

// ── SURFACE CARD (Tonal Shifting — No Borders) ────────────────
const Surf = ({children, style={}, tier="con"}) => {
  const bg = {con:S.sCon, hi:S.sHi, lo:S.sLo, high:S.sHigh, low:S.sLow}[tier] || S.sCon;
  return <div style={{background:bg, borderRadius:32, position:"relative", overflow:"hidden", ...style}}>{children}</div>;
};

// ── PAIRS & ENGINE ────────────────────────────────────────────
const PAIRS = [
  {id:"EURUSD",f:"🇪🇺🇺🇸",name:"EUR/USD",full:"Euro / US Dollar",base:1.0842,pip:.0001},
  {id:"GBPUSD",f:"🇬🇧🇺🇸",name:"GBP/USD",full:"British Pound / Dollar",base:1.2631,pip:.0001},
  {id:"USDJPY",f:"🇺🇸🇯🇵",name:"USD/JPY",full:"US Dollar / Japanese Yen",base:149.82,pip:.01},
  {id:"AUDUSD",f:"🇦🇺🇺🇸",name:"AUD/USD",full:"Australian / US Dollar",base:.6514,pip:.0001},
  {id:"USDCAD",f:"🇺🇸🇨🇦",name:"USD/CAD",full:"US Dollar / Canadian",base:1.3645,pip:.0001},
  {id:"NZDUSD",f:"🇳🇿🇺🇸",name:"NZD/USD",full:"New Zealand / Dollar",base:.6012,pip:.0001},
];

const simT=(p,pr)=>{const v=pr.pip*80;let n=p+(Math.random()-.48)*v*.5+(Math.random()-.5)*v*.5;return+Math.max(pr.base*.94,Math.min(pr.base*1.06,n)).toFixed(pr.pip<.01?2:5);};
const genH=(pr,n=80)=>{const d=[];let p=pr.base;for(let i=n;i>=0;i--){p+=Math.sin(i*.04)*(pr.pip*80)*2.5+(Math.random()-.5)*(pr.pip*80)*3;p=Math.max(pr.base*.96,Math.min(pr.base*1.04,p));d.push({t:Date.now()-i*6e4,p:+p.toFixed(pr.pip<.01?2:5)});}return d;};

// TA
const ema=(d,p)=>{const k=2/(p+1),e=[d[0]];for(let i=1;i<d.length;i++)e.push(d[i]*k+e[i-1]*(1-k));return e;};
const calcRSI=(d,p=14)=>{if(d.length<p+1)return 50;let ag=0,al=0;for(let i=1;i<=p;i++){const x=d[i]-d[i-1];if(x>0)ag+=x;else al+=Math.abs(x);}ag/=p;al/=p;for(let i=p+1;i<d.length;i++){const x=d[i]-d[i-1];ag=(ag*(p-1)+Math.max(0,x))/p;al=(al*(p-1)+Math.max(0,-x))/p;}return al===0?100:+(100-100/(1+ag/al)).toFixed(1);};
const calcMACD=(d)=>{if(d.length<26)return{h:0};const e12=ema(d,12),e26=ema(d,26),ml=e12.map((v,i)=>v-e26[i]).slice(26),sl=ema(ml,9),l=ml.length-1;return{h:+((ml[l]||0)-(sl[l]||0)).toFixed(5)};};
const calcBB=(d,p=20)=>{if(d.length<p)return{pB:.5};const s=d.slice(-p),m=s.reduce((a,b)=>a+b,0)/p,std=Math.sqrt(s.reduce((x,v)=>x+(v-m)**2,0)/p),u=m+2*std,lo=m-2*std;return{pB:std>0?+((d[d.length-1]-lo)/(u-lo)).toFixed(2):.5};};

function analyze(data){
  const pr=data.map(d=>d.p);if(pr.length<30)return{dir:"neutral",conf:0,reasons:[],rsi:50,macdH:0,pB:.5,action:"WAIT"};
  const r=calcRSI(pr),m=calcMACD(pr),b=calcBB(pr);
  const e9=ema(pr,9),e21=ema(pr,21),es=e9[e9.length-1],el=e21[e21.length-1];
  let sc=0;const reasons=[];
  if(r<30){sc+=2;reasons.push(`RSI at ${r} — oversold, like a spring compressed too far. Bounce likely.`);}
  else if(r>70){sc-=2;reasons.push(`RSI at ${r} — overbought, momentum exhaustion ahead.`);}
  else reasons.push(`RSI at ${r} — neutral momentum range.`);
  if(m.h>0){sc+=1.5;reasons.push("MACD histogram positive — bullish momentum building.");}
  else{sc-=1.5;reasons.push("MACD histogram negative — bearish pressure dominant.");}
  if(es>el){sc+=.5;reasons.push("Fast EMA above slow — short-term trend is up.");}
  else{sc-=.5;reasons.push("Fast EMA below slow — short-term trend is down.");}
  if(b.pB<.1){sc+=1.5;reasons.push("Price touching lower Bollinger Band — support zone.");}
  else if(b.pB>.9){sc-=1.5;reasons.push("Price at upper Bollinger Band — resistance overhead.");}
  const conf=Math.min(92,Math.round(Math.abs(sc)/7*100)),dir=sc>.5?"bullish":sc<-.5?"bearish":"neutral";
  return{dir,conf,reasons:reasons.slice(0,3),rsi:r,macdH:m.h,pB:b.pB,action:dir==="bullish"?"CALL":dir==="bearish"?"PUT":"WAIT"};
}

// AI Coach
async function getCoach(pair,price,sig,hist){
  try{
    const h=hist.slice(-15).map(d=>`${d.p}`).join(",");
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
        messages:[{role:"user",content:`You're a warm forex trading coach for a complete beginner. Pair: ${pair} at ${price}. Signal: ${sig.action} (${sig.conf}%). RSI: ${sig.rsi}, MACD: ${sig.macdH>0?"bullish":"bearish"}, Bollinger %B: ${sig.pB}. Recent: ${h}. In 3 short paragraphs (~150 words total): 1) What's happening RIGHT NOW in plain English 2) WHY the indicators suggest ${sig.action} (use simple analogies) 3) What could go wrong + one specific tip. No markdown headers.`}]})});
    const d=await r.json();return d.content?.[0]?.text||null;
  }catch{return null;}
}

// Lessons
const LESSONS=[
  {t:"What is Forex?",e:"🌍",b:"Forex is the world's largest market — $7.5 trillion traded daily. Currencies come in pairs like EUR/USD. The price shows how much of the second currency buys one unit of the first.\n\nIf EUR/USD = 1.0842, it costs $1.0842 to buy €1. When you think the price will rise, you go LONG (buy). When you think it'll fall, you go SHORT (sell)."},
  {t:"How Do You Profit?",e:"💰",b:"CALL (Long): Buy now, sell later at higher price = profit.\nPUT (Short): Sell now, buy back later at lower price = profit.\n\nPips are the smallest price movement. For EUR/USD, 1 pip = 0.0001. With leverage of 50:1, a $500 position controls $25,000. A 50-pip move = ~$125 profit (or loss).\n\nKey: Small movements × leverage = significant results."},
  {t:"Reading Indicators",e:"📊",b:"RSI: Momentum speedometer (0-100). Below 30 = oversold (might bounce up). Above 70 = overbought (might pull back).\n\nMACD: Compares fast vs slow momentum. Positive histogram = bullish energy. Like checking if a car is accelerating.\n\nBollinger Bands: Price boundaries. Touching the lower band = potential support. Upper band = potential resistance.\n\nEMA Cross: Fast average crossing above slow = bullish 'golden cross'."},
  {t:"Risk Management",e:"🛡️",b:"Rule #1: Never risk more than 1-2% per trade.\n\nAlways set a STOP LOSS — your automatic safety net. Risk-to-Reward ratio: Risk $1 to make $2 minimum.\n\nPractice here with paper money first. When consistently profitable over 3+ months, consider a small real account. Every pro started where you are now."},
];

// ═══ MAIN ═════════════════════════════════════════════════════
export default function LacunaTrade(){
  const [scr,setScr]=useState("port");
  const [bal,setBal]=useState(10000);
  const [pos,setPos]=useState([]);
  const [cls,setCls]=useState([]);
  const [ap,setAp]=useState(0);
  const [bet,setBet]=useState(500);
  const [toast,setToast]=useState(null);
  const [res,setRes]=useState(null);
  const [prices,setPrices]=useState(()=>{const o={};PAIRS.forEach(p=>o[p.id]=p.base);return o;});
  const [charts,setCharts]=useState(()=>{const o={};PAIRS.forEach(p=>o[p.id]=genH(p));return o;});
  const [eqH,setEqH]=useState([]);
  const [live,setLive]=useState(false);
  const [coach,setCoach]=useState(null);
  const [cLoad,setCLoad]=useState(false);
  const [onb,setOnb]=useState(()=>!localStorage.getItem("lt7ob"));
  const [obs,setObs]=useState(0);
  const [lesson,setLesson]=useState(null);

  const pair=PAIRS[ap],price=prices[pair.id],dec=pair.pip<.01?2:4;
  const cd=charts[pair.id]||[],sig=useMemo(()=>analyze(cd),[cd]);
  const pCh=cd.length>1?cd[cd.length-1].p-cd[0].p:0;
  const pPct=cd.length>1?((pCh/cd[0].p)*100).toFixed(2):"0.00";
  const sigC=sig.dir==="bullish"?S.sec:sig.dir==="bearish"?S.ter:S.pri;

  // Fetch live
  const fetchP=useCallback(async()=>{
    try{const r=await fetch("https://www.freeforexapi.com/api/live?pairs=EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,NZDUSD");const d=await r.json();
      if(d.code===200&&d.rates){const np={};Object.entries(d.rates).forEach(([k,v])=>np[k]=v.rate);setPrices(pv=>({...pv,...np}));
        setCharts(pv=>{const n={...pv};Object.entries(np).forEach(([k,v])=>{if(n[k])n[k]=[...n[k].slice(-119),{t:Date.now(),p:+v.toFixed(PAIRS.find(p=>p.id===k)?.pip<.01?2:5)}];});return n;});
        setLive(true);}
    }catch{setPrices(pv=>{const n={...pv};PAIRS.forEach(p=>n[p.id]=simT(pv[p.id],p));return n;});setLive(false);}
  },[]);

  useEffect(()=>{fetchP();const iv=setInterval(fetchP,15000);return()=>clearInterval(iv);},[fetchP]);
  useEffect(()=>{const iv=setInterval(()=>{setPrices(pv=>{const n={...pv};PAIRS.forEach(p=>n[p.id]=simT(pv[p.id],p));return n;});
    setCharts(pv=>{const n={...pv};PAIRS.forEach(p=>{const l=pv[p.id][pv[p.id].length-1];n[p.id]=[...pv[p.id].slice(-119),{t:Date.now(),p:simT(l.p,p)}];});return n;});},3000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{let u=0;pos.forEach(po=>{const c=prices[po.pid];u+=po.side==="call"?(c-po.entry)*po.units:(po.entry-c)*po.units;});setEqH(pv=>[...pv.slice(-60),{t:Date.now(),v:+(bal+u).toFixed(0)}]);},[prices,pos,bal]);
  useEffect(()=>{try{const r=localStorage.getItem("lt7");if(r){const s=JSON.parse(r);if(s.b!=null)setBal(s.b);if(s.p)setPos(s.p);if(s.c)setCls(s.c);}}catch{}},[]);
  useEffect(()=>{const t=setTimeout(()=>{try{localStorage.setItem("lt7",JSON.stringify({b:bal,p:pos,c:cls}));}catch{}},2e3);return()=>clearTimeout(t);},[bal,pos,cls]);

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2800);};
  const openT=side=>{if(bet>bal){flash("Insufficient credits");return;}setPos(p=>[...p,{id:Date.now(),pid:pair.id,pn:pair.name,side,entry:price,units:bet*50,bet,ot:Date.now(),type:["LEVERAGE 10X","SPOT TRADE","ARBITRAGE"][Math.floor(Math.random()*3)]}]);setBal(b=>+(b-bet).toFixed(2));flash(side==="call"?"CALL placed ↑":"PUT placed ↓");setScr("port");};
  const closeT=id=>{const po=pos.find(p=>p.id===id);if(!po)return;const pnl=po.side==="call"?(prices[po.pid]-po.entry)*po.units:(po.entry-prices[po.pid])*po.units;setBal(b=>+(b+po.bet+pnl).toFixed(2));setCls(h=>[{...po,cp:prices[po.pid],ct:Date.now(),pnl:+pnl.toFixed(2)},...h]);setPos(p=>p.filter(x=>x.id!==id));setRes({pnl:+pnl.toFixed(2),pair:po.pn});setTimeout(()=>setRes(null),3000);};
  const reset=()=>{setBal(10000);setPos([]);setCls([]);setEqH([]);flash("Reset to $10,000");};

  const unr=pos.reduce((s,po)=>{const c=prices[po.pid];return s+(po.side==="call"?(c-po.entry)*po.units:(po.entry-c)*po.units);},0);
  const totC=cls.reduce((s,t)=>s+t.pnl,0),eq=bal+unr,wins=cls.filter(t=>t.pnl>0).length,wr=cls.length>0?Math.round((wins/cls.length)*100):0;

  const askCoach=async()=>{setCLoad(true);setCoach(null);const r=await getCoach(pair.name,price,sig,cd);setCoach(r||sig.reasons.join("\n\n"));setCLoad(false);};

  // ── MICRO-LABEL ─────────────────────────────────────────────
  const Label = ({children,style={}}) => <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:S.onV,display:"block",...style}}>{children}</span>;

  // ── ONBOARDING ──────────────────────────────────────────────
  if(onb){
    const steps=[
      {t:"Welcome to\nLacuna Trade",sub:"Your AI forex learning companion",body:"Real market data. AI analysis that explains WHY. Zero-risk paper trading with $10,000.",e:"🚀"},
      {t:"Pick. Predict.\nProfit.",sub:"3 steps to every trade",body:"1. Pick a currency pair\n2. AI tells you what it thinks — and why\n3. Tap CALL (up) or PUT (down)\n\nClose your trade anytime to lock in gains or cut losses.",e:"📱"},
      {t:"Your AI Coach",sub:"Claude explains everything",body:"Tap '🧠 Ask Coach' anytime for plain-English analysis of what's happening, why, and what to watch for.\n\nThe Learn tab has 4 lessons on forex fundamentals.",e:"🤖"},
    ];
    const step=steps[obs];
    return(
      <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:"80%",height:"80%",borderRadius:"50%",background:`radial-gradient(circle,${S.pri}12,transparent 60%)`,filter:"blur(120px)"}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"-10%",width:"60%",height:"60%",borderRadius:"50%",background:`radial-gradient(circle,${S.sec}08,transparent 60%)`,filter:"blur(100px)"}}/>
        <div style={{fontSize:72,marginBottom:28,animation:"float 3s ease-in-out infinite"}}>{step.e}</div>
        <div style={{fontSize:32,fontWeight:800,fontFamily:"Manrope",color:S.on,letterSpacing:"-0.03em",textAlign:"center",lineHeight:1.1,marginBottom:8,whiteSpace:"pre-line"}}>{step.t}</div>
        <div style={{fontSize:12,color:S.sec,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",textAlign:"center",marginBottom:24}}>{step.sub}</div>
        <Surf tier="hi" style={{padding:28,maxWidth:340,marginBottom:32}}>
          <div style={{fontSize:14,color:S.onV,lineHeight:1.8,whiteSpace:"pre-line"}}>{step.body}</div>
        </Surf>
        <button onClick={()=>{if(obs<2)setObs(s=>s+1);else{setOnb(false);localStorage.setItem("lt7ob","1");}}} style={{padding:"16px 44px",borderRadius:9999,background:`linear-gradient(135deg,${S.pri},${S.pCon})`,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#000d44",fontFamily:"Inter",boxShadow:`0 20px 40px rgba(0,0,0,.4)`}}>
          {obs<2?"Continue →":"Start Trading 🎉"}
        </button>
        <div style={{display:"flex",gap:8,marginTop:24}}>{steps.map((_,i)=><div key={i} style={{width:i===obs?28:8,height:8,borderRadius:4,background:i===obs?S.pri:`${S.onV}25`,transition:"all .3s"}}/>)}</div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}`}</style>
      </div>
    );
  }

  // ── LESSON VIEWER ───────────────────────────────────────────
  if(lesson!==null){const l=LESSONS[lesson];return(
    <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",padding:24,color:S.on}}>
      <button onClick={()=>setLesson(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.pri,fontSize:13,fontWeight:600,marginBottom:24}}>← Back</button>
      <div style={{fontSize:48,marginBottom:16}}>{l.e}</div>
      <div style={{fontSize:28,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.03em",marginBottom:20}}>{l.t}</div>
      <Surf tier="hi" style={{padding:28}}><div style={{fontSize:14,color:S.onV,lineHeight:1.9,whiteSpace:"pre-line"}}>{l.b}</div></Surf>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:0}`}</style>
    </div>
  );}

  // ═══ PORTFOLIO (Dashboard) ══════════════════════════════════
  const renderPort=()=>(
    <div style={{padding:"0 24px 130px",animation:"fadeUp .4s ease"}}>
      {/* Editorial Hero */}
      <div style={{marginBottom:32}}>
        <Label style={{color:S.sec,marginBottom:8}}>Performance Surge</Label>
        <h2 style={{fontSize:44,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",lineHeight:1,color:S.on,marginBottom:6}}>
          Equity <em style={{color:S.pDim,fontStyle:"italic"}}>Dynamics</em>
        </h2>
        <p style={{fontSize:15,color:S.onV,lineHeight:1.6,maxWidth:320}}>
          Your portfolio {unr+totC>=0?"expanded":"shifted"} by <span style={{color:unr+totC>=0?S.sec:S.ter,fontWeight:700}}>{unr+totC>=0?"+":""}{((unr+totC)/100).toFixed(1)}%</span> recently.
        </p>
      </div>

      {/* Equity Chart */}
      <Surf tier="lo" style={{padding:28,marginBottom:24,minHeight:160}}>
        {/* Live indicator */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:live?S.sec:S.ter,boxShadow:live?`0 0 8px ${S.sec}80`:"none",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color:live?S.sec:S.ter}}>{live?"Live Data":"Simulated"}</span>
        </div>
        <div style={{height:120}}>
          {eqH.length>2?<ResponsiveContainer width="100%" height="100%"><AreaChart data={eqH}><defs><linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={S.pri} stopOpacity={.2}/><stop offset="100%" stopColor={S.pri} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={S.pri} strokeWidth={3} fill="url(#eq)" dot={false}/></AreaChart></ResponsiveContainer>
          :<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:S.onV,fontSize:12}}>Building equity curve...</div>}
        </div>
      </Surf>

      {/* Balance + Allocation Bento */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <Surf tier="lo" style={{padding:20,gridColumn:"1/-1"}}>
          <Label style={{marginBottom:8}}>Play Balance</Label>
          <div style={{display:"flex",alignItems:"baseline",gap:3}}>
            <span style={{fontSize:40,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on}}>${Math.floor(eq).toLocaleString()}</span>
            <span style={{fontSize:16,fontWeight:600,color:S.onV,fontFamily:"Manrope"}}>.{Math.abs(Math.floor((eq%1)*100)).toString().padStart(2,"0")}</span>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>{setBal(b=>b+5000);flash("+$5K added");}} style={{flex:1,padding:12,borderRadius:9999,background:`linear-gradient(135deg,${S.pri},${S.pCon})`,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:"#000d44"}}>+ Credits</button>
            <button onClick={()=>setScr("learn")} style={{flex:1,padding:12,borderRadius:9999,background:S.sHigh,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:S.on}}>📖 Learn</button>
          </div>
        </Surf>

        <Surf tier="low" style={{padding:16}}>
          <Label style={{marginBottom:10}}>Open Trades</Label>
          <span style={{fontSize:28,fontWeight:800,fontFamily:"Manrope",color:S.on}}>{pos.length}</span>
          <div style={{width:"100%",height:4,background:S.sHigh,borderRadius:4,marginTop:10,overflow:"hidden"}}><div style={{width:`${Math.min(100,pos.length*20)}%`,height:"100%",background:S.pri,borderRadius:4}}/></div>
        </Surf>
        <Surf tier="low" style={{padding:16}}>
          <Label style={{marginBottom:10}}>Win Rate</Label>
          <span style={{fontSize:28,fontWeight:800,fontFamily:"Manrope",color:S.sec}}>{wr}%</span>
          <div style={{width:"100%",height:4,background:S.sHigh,borderRadius:4,marginTop:10,overflow:"hidden"}}><div style={{width:`${wr}%`,height:"100%",background:S.sec,borderRadius:4}}/></div>
        </Surf>
      </div>

      {/* AI Signal Card */}
      <Surf tier="hi" style={{padding:24,marginBottom:24}}>
        <div style={{position:"absolute",right:-40,top:-40,width:160,height:160,borderRadius:"50%",background:`${sigC}10`,filter:"blur(60px)"}}/>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <Label style={{marginBottom:6,color:sigC}}>AI Trade Signal</Label>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"Manrope",color:S.on}}>{pair.name}</div>
            </div>
            <div style={{padding:"6px 14px",borderRadius:9999,background:`${sigC}15`}}>
              <span style={{fontSize:11,fontWeight:700,color:sigC}}>{sig.action} · {sig.conf}%</span>
            </div>
          </div>
          {/* Confidence bar */}
          <div style={{width:"100%",height:4,background:`${S.onV}15`,borderRadius:4,marginBottom:16,overflow:"hidden"}}><div style={{width:`${sig.conf}%`,height:"100%",background:sigC,borderRadius:4,transition:"width .5s",boxShadow:`0 0 8px ${sigC}40`}}/></div>
          {/* Reasons */}
          {sig.reasons.map((r,i)=><div key={i} style={{fontSize:13,color:S.onV,lineHeight:1.7,marginBottom:8,paddingLeft:16,borderLeft:`2px solid ${sigC}30`}}>{r}</div>)}
          {/* Indicator pills */}
          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
            {[["RSI",sig.rsi,sig.rsi<30?S.sec:sig.rsi>70?S.err:S.onV],["MACD",sig.macdH>0?"Bull":"Bear",sig.macdH>0?S.sec:S.ter],["%B",sig.pB,sig.pB<.2?S.sec:sig.pB>.8?S.err:S.onV]].map(([l,v,c])=>(
              <div key={l} style={{padding:"6px 12px",borderRadius:9999,background:`${c}10`}}><span style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"0.08em"}}>{l}: {v}</span></div>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginTop:18}}>
            <button onClick={()=>setScr("trade")} style={{flex:1,padding:14,borderRadius:9999,background:`linear-gradient(135deg,${S.pri},${S.pCon})`,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:"#000d44"}}>Execute {sig.action} →</button>
            <button onClick={askCoach} disabled={cLoad} style={{padding:"14px 18px",borderRadius:9999,background:S.sHigh,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:S.pri}}>🧠 {cLoad?"...":"Coach"}</button>
          </div>
        </div>
      </Surf>

      {/* Coach response */}
      {coach&&<Glass style={{padding:24,marginBottom:24}}>
        <Label style={{color:S.pri,marginBottom:12}}>AI Coach Says</Label>
        <div style={{fontSize:13,color:S.onV,lineHeight:1.8,whiteSpace:"pre-line"}}>{coach}</div>
        <button onClick={()=>setCoach(null)} style={{marginTop:12,background:"none",border:"none",cursor:"pointer",fontSize:11,color:S.onV}}>Dismiss</button>
      </Glass>}

      {/* Open Positions */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:22,fontWeight:700,fontFamily:"Manrope",color:S.on}}>Open Positions</h3>
        <button onClick={()=>setScr("hist")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color:S.pri}}>View History</button>
      </div>

      {pos.length===0?<Surf tier="con" style={{padding:"36px 24px",textAlign:"center"}}><div style={{fontSize:13,color:S.onV}}>No open positions. Use the AI signal above.</div></Surf>
      :pos.map(po=>{const cur=prices[po.pid],pnl=po.side==="call"?(cur-po.entry)*po.units:(po.entry-cur)*po.units,w=pnl>=0,c=w?S.sec:S.ter;return(
        <Surf key={po.id} tier="con" style={{padding:20,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:48,height:48,borderRadius:16,background:`${c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:20,color:c}}>{w?"↗":"↘"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{po.pn}</span>
                <span style={{padding:"2px 8px",borderRadius:6,background:`${c}10`,fontSize:10,fontWeight:700,color:c,textTransform:"uppercase"}}>{po.side==="call"?"Long":"Short"}</span>
              </div>
              <span style={{fontSize:11,color:S.onV,letterSpacing:"0.1em",textTransform:"uppercase"}}>Entry: {po.entry.toFixed(dec)}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <Label style={{fontSize:9,textAlign:"right"}}>{w?"+":""}{((pnl/(po.bet||1))*100).toFixed(1)}%</Label>
              <span style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:c}}>{w?"+":"-"}${Math.abs(pnl).toFixed(2)}</span>
            </div>
          </div>
          <button onClick={()=>closeT(po.id)} style={{marginTop:14,width:"100%",padding:10,borderRadius:9999,background:S.sHigh,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:S.on,letterSpacing:"0.1em",textTransform:"uppercase"}}>Close Position</button>
        </Surf>
      );})}
    </div>
  );

  // ═══ TRADE ══════════════════════════════════════════════════
  const renderTrade=()=>{const lo=cd.length?Math.min(...cd.map(d=>d.p)):pair.base*.99,hi=cd.length?Math.max(...cd.map(d=>d.p)):pair.base*1.01;return(
    <div style={{padding:"0 24px 130px",animation:"fadeUp .35s ease"}}>
      <Label style={{color:S.sec,marginBottom:6}}>Live Trading</Label>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <span style={{fontSize:28}}>{pair.f}</span>
        <h2 style={{fontSize:36,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on}}>{pair.name}</h2>
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:20}}>
        <span style={{fontSize:48,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on}}>{price?.toFixed(dec)}</span>
        <span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:pCh>=0?S.sec:S.ter}}>{pCh>=0?"+":""}{pCh.toFixed(dec)} ({pPct}%)</span>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {[["LOW",lo.toFixed(dec)],["HIGH",hi.toFixed(dec)],["VOLUME","$1.2B"],["SIGNAL",sig.action]].map(([l,v])=>(<Surf key={l} tier="lo" style={{padding:14}}><Label>{l}</Label><span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:l==="SIGNAL"?sigC:S.on,marginTop:4,display:"block"}}>{v}</span></Surf>))}
      </div>

      {/* Chart */}
      <Surf tier="lo" style={{padding:16,marginBottom:20}}>
        <div style={{height:180}}>
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={cd}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={S.pri} stopOpacity={.2}/><stop offset="100%" stopColor={S.pri} stopOpacity={0}/></linearGradient></defs><YAxis domain={["auto","auto"]} hide/><Area type="monotone" dataKey="p" stroke={S.pri} strokeWidth={3} fill="url(#cg)" dot={false}/>{pos.filter(p=>p.pid===pair.id).map(po=><ReferenceLine key={po.id} y={po.entry} stroke={po.side==="call"?S.sec:S.ter} strokeDasharray="4 4" strokeOpacity={.5}/>)}</AreaChart></ResponsiveContainer>
        </div>
      </Surf>

      {/* AI rec */}
      <div style={{padding:"12px 18px",borderRadius:9999,background:`${sigC}10`,display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <span style={{fontSize:13,color:S.on,fontWeight:500}}>AI: <b style={{color:sigC}}>{sig.action}</b> · {sig.conf}% · {sig.reasons[0]?.split("—")[0]}</span>
      </div>

      {/* Bet */}
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
        {[100,250,500,1000,2500].map(a=>(<button key={a} onClick={()=>setBet(a)} style={{padding:"8px 16px",borderRadius:9999,cursor:"pointer",fontSize:12,fontWeight:600,background:bet===a?`${S.pri}15`:S.sHi,border:"none",color:bet===a?S.pri:S.onV}}>${a>=1e3?(a/1e3)+"K":a}</button>))}
      </div>

      {/* CALL / PUT */}
      <div style={{display:"flex",gap:12}}>
        <button onClick={()=>openT("call")} style={{flex:1,padding:"22px 16px",borderRadius:9999,cursor:"pointer",background:S.bg,border:`1px solid ${S.sec}30`,boxShadow:`0 0 20px ${S.sec}10`,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:22,fontWeight:800,fontFamily:"Manrope",color:S.seDim}}>CALL</span>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:`${S.sec}80`,textTransform:"uppercase"}}>Predict Rise</span>
        </button>
        <button onClick={()=>openT("put")} style={{flex:1,padding:"22px 16px",borderRadius:9999,cursor:"pointer",background:S.bg,border:`1px solid ${S.ter}30`,boxShadow:`0 0 20px ${S.ter}10`,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:22,fontWeight:800,fontFamily:"Manrope",color:S.tDim}}>PUT</span>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:`${S.ter}80`,textTransform:"uppercase"}}>Predict Fall</span>
        </button>
      </div>
    </div>
  );};

  // ═══ HISTORY ════════════════════════════════════════════════
  const renderHist=()=>(
    <div style={{padding:"0 24px 130px",animation:"fadeUp .35s ease"}}>
      <h2 style={{fontSize:32,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.03em",color:S.on,marginBottom:20}}>History</h2>

      {/* Total Net Profit */}
      <Surf tier="hi" style={{padding:24,marginBottom:16}}>
        <div style={{position:"absolute",right:-40,top:-40,width:160,height:160,borderRadius:"50%",background:`${S.sec}10`,filter:"blur(60px)"}}/>
        <Label style={{marginBottom:8}}>Total Net Profit</Label>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:36,fontWeight:800,fontFamily:"Manrope",color:totC>=0?S.sec:S.ter}}>{totC>=0?"+":""}${Math.abs(totC).toFixed(2)}</span><span style={{fontSize:20,color:totC>=0?S.sec:S.ter}}>↗</span></div>
      </Surf>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
        <Surf tier="lo" style={{padding:20}}>
          <Label style={{marginBottom:12}}>Win Rate</Label>
          <div style={{position:"relative",width:56,height:56,marginBottom:10}}>
            <svg width="56" height="56" viewBox="0 0 36 36"><path d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831" fill="none" stroke={`${S.on}08`} strokeWidth="3"/><path d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831" fill="none" stroke={S.sec} strokeWidth="3" strokeDasharray={`${wr}, 100`} strokeLinecap="round"/></svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:12,fontWeight:700,fontFamily:"Manrope"}}>{wr}%</span></div>
          </div>
          <span style={{fontSize:11,color:S.onV}}>Out of {cls.length} trades</span>
        </Surf>
        <Surf tier="lo" style={{padding:20}}>
          <Label style={{marginBottom:12}}>Trades</Label>
          <span style={{fontSize:36,fontWeight:800,fontFamily:"Manrope",color:S.on}}>{cls.length}</span>
          <span style={{display:"block",fontSize:11,color:S.sec,fontWeight:600,marginTop:6}}>{wins} wins</span>
        </Surf>
      </div>

      <Label style={{marginBottom:12}}>Recent Activity</Label>
      {cls.length===0?<div style={{textAlign:"center",padding:32,color:S.onV,fontSize:13}}>No trades closed yet.</div>
      :cls.slice(0,10).map((t,i)=>{const w=t.pnl>=0,c=w?S.sec:S.ter;return(
        <div key={t.id} style={{display:"flex",alignItems:"center",gap:16,padding:20,borderRadius:24,background:i%2===0?S.bg:S.sLo,marginBottom:4}}>
          <div style={{width:48,height:48,borderRadius:16,background:`${c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:18,color:c}}>{w?"↗":"↘"}</span>
          </div>
          <div style={{flex:1}}>
            <span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{t.pn}</span>
            <span style={{display:"block",fontSize:11,color:S.onV,marginTop:2}}>Closed {new Date(t.ct).toLocaleDateString("en-US",{month:"short",day:"numeric"})} · {new Date(t.ct).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:c}}>{w?"+":""}${t.pnl.toFixed(2)}</span>
            <span style={{display:"block",fontSize:9,fontWeight:600,letterSpacing:"0.15em",textTransform:"uppercase",color:S.onV,marginTop:2}}>{t.type}</span>
          </div>
        </div>
      );})}
    </div>
  );

  // ═══ MARKETS ════════════════════════════════════════════════
  const renderMarkets=()=>(
    <div style={{padding:"0 24px 130px",animation:"fadeUp .35s ease"}}>
      <Label style={{color:S.sec,marginBottom:6}}>Live Ecosystem</Label>
      <h2 style={{fontSize:36,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,lineHeight:1,marginBottom:20}}>Market<br/><em style={{color:S.pDim,fontStyle:"italic"}}>Pick List</em></h2>

      {PAIRS.map((p,i)=>{const pr=prices[p.id],ch=charts[p.id]||[],prev=ch.length>1?ch[ch.length-2].p:pr,diff=pr-prev,pct=prev?((diff/prev)*100).toFixed(2):"0.00",up=diff>=0,ps=analyze(ch);return(
        <div key={p.id} onClick={()=>{setAp(i);setScr("trade");}} style={{display:"flex",alignItems:"center",gap:16,padding:20,borderRadius:24,background:i%2===0?S.sCon:S.bg,marginBottom:4,cursor:"pointer"}}>
          <div style={{fontSize:24,width:36,textAlign:"center"}}>{p.f.split("").slice(0,2).join("")}</div>
          <div style={{flex:1}}>
            <span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{p.name}</span>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{padding:"2px 8px",borderRadius:6,background:`${ps.dir==="bullish"?S.sec:ps.dir==="bearish"?S.ter:S.pri}10`,fontSize:10,fontWeight:700,color:ps.dir==="bullish"?S.sec:ps.dir==="bearish"?S.ter:S.pri,textTransform:"uppercase"}}>{ps.action}</span>
              <span style={{fontSize:10,color:S.onV}}>{ps.conf}%</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{pr?.toFixed(p.pip<.01?2:4)}</span>
            <span style={{display:"block",fontSize:11,fontWeight:600,color:up?S.sec:S.ter,marginTop:2}}>{up?"+":""}{pct}%</span>
          </div>
        </div>
      );})}
    </div>
  );

  // ═══ LEARN ══════════════════════════════════════════════════
  const renderLearn=()=>(
    <div style={{padding:"0 24px 130px",animation:"fadeUp .35s ease"}}>
      <Label style={{color:S.pri,marginBottom:6}}>Education Center</Label>
      <h2 style={{fontSize:32,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.03em",color:S.on,marginBottom:20}}>Learn <em style={{color:S.pDim,fontStyle:"italic"}}>Forex</em></h2>
      {LESSONS.map((l,i)=>(<div key={i} onClick={()=>setLesson(i)} style={{cursor:"pointer",marginBottom:10}}><Surf tier="con" style={{padding:20,display:"flex",alignItems:"center",gap:16}}>
        <span style={{fontSize:28}}>{l.e}</span>
        <div style={{flex:1}}><span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{l.t}</span><span style={{display:"block",fontSize:11,color:S.onV,marginTop:2}}>Lesson {i+1}</span></div>
        <span style={{fontSize:16,color:S.onV}}>→</span>
      </Surf></div>))}
      <div style={{marginTop:24}}><button onClick={()=>setOnb(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:S.pri,fontWeight:600}}>↺ Replay Tutorial</button></div>
      <div style={{marginTop:16}}><button onClick={reset} style={{width:"100%",padding:14,borderRadius:9999,background:`${S.err}08`,border:`1px solid ${S.err}20`,cursor:"pointer",fontSize:11,fontWeight:700,color:S.err}}>Reset Account</button></div>
    </div>
  );

  // ═══ SHELL ══════════════════════════════════════════════════
  const tabs=[{id:"trade",label:"TRADE",ico:"📈"},{id:"port",label:"PORTFOLIO",ico:"📊"},{id:"hist",label:"HISTORY",ico:"🕐"},{id:"markets",label:"MARKETS",ico:"🌐"},{id:"learn",label:"LEARN",ico:"📖"}];

  return(
    <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",color:S.on,fontSize:13,position:"relative",overflowX:"hidden"}}>
      {/* Ethereal Blur BG */}
      <div style={{position:"fixed",top:"-20%",left:"-10%",width:"80%",height:"80%",borderRadius:"50%",background:`${S.pri}08`,filter:"blur(120px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"-10%",width:"60%",height:"60%",borderRadius:"50%",background:`${S.sec}05`,filter:"blur(100px)",pointerEvents:"none",zIndex:0}}/>

      {toast&&<div style={{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",zIndex:999,padding:"10px 22px",borderRadius:9999,background:"rgba(38,38,38,.9)",backdropFilter:"blur(20px)",color:S.on,fontSize:12,fontWeight:500,animation:"fadeUp .3s ease",boxShadow:"0 20px 40px rgba(0,0,0,.4)"}}>{toast}</div>}

      {res&&<div onClick={()=>setRes(null)} style={{position:"fixed",inset:0,zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(12px)",animation:"fadeUp .25s ease",cursor:"pointer"}}>
        <Surf tier="hi" style={{textAlign:"center",padding:"44px 52px"}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%, ${res.pnl>=0?S.sec:S.ter}15, transparent 60%)`}}/>
          <div style={{position:"relative",zIndex:2}}>
            <div style={{fontSize:48,marginBottom:8}}>{res.pnl>=0?"🎉":"📉"}</div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"Manrope",color:res.pnl>=0?S.sec:S.ter}}>{res.pnl>=0?"Profit!":"Loss"}</div>
            <div style={{fontSize:32,fontWeight:800,fontFamily:"Manrope",color:S.on,marginTop:4}}>{res.pnl>=0?"+":""}${res.pnl.toFixed(2)}</div>
          </div>
        </Surf>
      </div>}

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",background:"rgba(32,31,31,0.4)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18,color:S.pri}}>◈</span>
          <span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",letterSpacing:"-0.02em",color:S.on}}>${Math.floor(eq).toLocaleString()}</span>
          <div style={{width:5,height:5,borderRadius:"50%",background:live?S.sec:S.ter,marginLeft:2}}/>
        </div>
        <div style={{padding:"6px 16px",borderRadius:9999,background:`${S.on}05`,border:`1px solid ${S.on}10`}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:S.pri}}>{pair.name}</span>
        </div>
      </header>

      <div style={{padding:"16px 0 0"}}/>
      {scr==="port"&&renderPort()}
      {scr==="trade"&&renderTrade()}
      {scr==="hist"&&renderHist()}
      {scr==="markets"&&renderMarkets()}
      {scr==="learn"&&renderLearn()}

      {/* Bottom Nav — Ethereal Surge Spec */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 16px max(24px,env(safe-area-inset-bottom))",background:"rgba(32,31,31,0.4)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:`1px solid ${S.on}08`,borderRadius:"32px 32px 0 0",boxShadow:"0 -20px 40px rgba(0,0,0,.4)",zIndex:100}}>
        {tabs.map(t=>{const a=scr===t.id;return(
          <button key={t.id} onClick={()=>setScr(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:a?`${S.pri}10`:"none",borderRadius:9999,padding:a?"10px 14px":"10px 12px",border:"none",cursor:"pointer",transition:"all .2s"}}>
            <span style={{fontSize:16,opacity:a?1:.5}}>{t.ico}</span>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:a?S.pri:`${S.onV}60`,fontFamily:"Inter"}}>{t.label}</span>
          </button>
        );})}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:0}button{font-family:inherit}
      `}</style>
    </div>
  );
}
