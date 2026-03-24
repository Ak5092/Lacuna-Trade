import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   LACUNA TRADE v6 — LIVE DATA · AI COACH · ONBOARDING
   Real prices from FreeForexAPI · Claude AI analysis
   ═══════════════════════════════════════════════════════════════ */

// ── COLORS ────────────────────────────────────────────────────
const C = {
  blue:"#3B82F6",bL:"#60A5FA",cyan:"#06B6D4",dB:"#1D4ED8",ind:"#6366F1",
  sky:"#0EA5E9",grn:"#00fc40",gD:"#00ec3b",org:"#FF8C42",
  err:"#ff6e84",eD:"#d73357",bg:"#0e0e0e",bgD:"#000508",
  sL:"#131313",sC:"#1a1919",sH:"#201f1f",sHi:"#262626",
  on:"#fff",onV:"#adaaaa",out:"#494847",
  pri:"#97a9ff",pD:"#3e65ff",pC:"#859aff",
};

// ── LIQUID GLASS ──────────────────────────────────────────────
const LG = ({children,style={},glow,i="m"}) => {
  const b={l:{bg:"rgba(255,255,255,.06)",bl:20},m:{bg:"rgba(255,255,255,.04)",bl:32},h:{bg:"rgba(255,255,255,.03)",bl:48}}[i]||{bg:"rgba(255,255,255,.04)",bl:32};
  return(<div style={{position:"relative",overflow:"hidden",borderRadius:24,background:b.bg,backdropFilter:`blur(${b.bl}px) saturate(1.4)`,WebkitBackdropFilter:`blur(${b.bl}px) saturate(1.4)`,border:"0.5px solid rgba(255,255,255,.09)",boxShadow:glow?`0 0 40px ${glow}15,0 8px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05)`:`0 8px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05)`,...style}}>
    <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.1),rgba(255,255,255,.18),rgba(255,255,255,.1),transparent)",pointerEvents:"none",zIndex:2}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,.025),transparent)",pointerEvents:"none",zIndex:1}}/>
    <div style={{position:"relative",zIndex:3}}>{children}</div>
  </div>);
};

// ── MESH GRADIENT BG ──────────────────────────────────────────
const Mesh = () => (<div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:"inherit"}}>
  <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,#1E3A5F 0%,${C.dB} 25%,${C.blue} 45%,${C.cyan} 65%,${C.sky} 80%,${C.ind} 100%)`}}/>
  <div style={{position:"absolute",top:"-40%",left:"-10%",width:"75%",height:"120%",borderRadius:"50%",background:`radial-gradient(ellipse,${C.bL}80,transparent 65%)`,filter:"blur(35px)"}}/>
  <div style={{position:"absolute",bottom:"-30%",right:"-5%",width:"65%",height:"90%",borderRadius:"50%",background:`radial-gradient(ellipse,${C.cyan}80,transparent 60%)`,filter:"blur(28px)"}}/>
</div>);

// ── CHROME RIBBONS ────────────────────────────────────────────
const Ribbons = ({h=120,op=.4}) => (<svg width="100%" height={h} viewBox="0 0 430 120" preserveAspectRatio="xMidYMid slice" fill="none" style={{position:"absolute",top:0,left:0,opacity:op}}>
  <defs><linearGradient id="cr1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.org} stopOpacity="0"/><stop offset="25%" stopColor={C.org} stopOpacity=".7"/><stop offset="50%" stopColor="#FFE0B2" stopOpacity=".9"/><stop offset="75%" stopColor={C.bL} stopOpacity=".7"/><stop offset="100%" stopColor={C.bL} stopOpacity="0"/></linearGradient>
  <linearGradient id="cr2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff" stopOpacity="0"/><stop offset="40%" stopColor="#fff" stopOpacity=".5"/><stop offset="60%" stopColor="#fff" stopOpacity=".9"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
  <path d="M-10 90 Q80 40 200 70 Q300 95 440 35" stroke="url(#cr1)" strokeWidth="10" opacity=".5"/>
  <path d="M-10 92 Q80 42 200 72 Q300 97 440 37" stroke="url(#cr2)" strokeWidth="2" opacity=".8"/>
  <circle cx="200" cy="70" r="4" fill="rgba(255,255,255,.7)"/><circle cx="200" cy="70" r="10" fill="rgba(255,255,255,.1)"/>
</svg>);

// ── WAVE ACCENT ───────────────────────────────────────────────
const Waves = ({h=60}) => (<svg width="100%" height={h} viewBox="0 0 430 60" preserveAspectRatio="xMidYMid slice" fill="none">
  <defs><linearGradient id="wv" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.org} stopOpacity="0"/><stop offset="20%" stopColor={C.org} stopOpacity=".6"/><stop offset="50%" stopColor={C.blue} stopOpacity=".7"/><stop offset="80%" stopColor={C.ind} stopOpacity=".5"/><stop offset="100%" stopColor={C.ind} stopOpacity="0"/></linearGradient></defs>
  <path d="M-10 35 Q60 15 140 30 Q220 45 300 25 Q370 12 440 30" stroke="url(#wv)" strokeWidth="12" opacity=".4"/>
  <path d="M-10 37 Q60 17 140 32 Q220 47 300 27 Q370 14 440 32" stroke="url(#cr2)" strokeWidth="1.5" opacity=".6"/>
</svg>);

// ── ORGANIC CURVE DIVIDER ─────────────────────────────────────
const Curve = ({c=C.blue}) => (<svg width="100%" height="32" viewBox="0 0 430 32" preserveAspectRatio="none" fill="none" style={{display:"block",margin:"14px 0"}}>
  <path d="M0 32 Q0 16 60 14 Q140 10 215 18 Q280 22 340 13 Q390 8 430 16 L430 32Z" fill={C.bgD}/>
  <path d="M0 16 Q60 14 140 10 Q200 8 215 18 Q240 22 310 15 Q380 8 430 16" stroke={`${c}99`} strokeWidth="1.5"/>
  <path d="M0 16 Q60 14 140 10 Q200 8 215 18 Q240 22 310 15 Q380 8 430 16" stroke={`${c}18`} strokeWidth="10"/>
</svg>);

// ── DOT MATRIX ────────────────────────────────────────────────
const Dots = ({n=8,s=5}) => {
  const cols = [C.blue,C.blue+"E6",C.bL,"#93C5FD","#BFDBFE99","#DBEAFE66","#EFF6FF33","#EFF6FF14"];
  return <div style={{display:"flex",gap:s*.7}}>{Array.from({length:n}).map((_,i)=><div key={i} style={{width:s,height:s,borderRadius:"50%",background:cols[i%8]}}/>)}</div>;
};

// ── ICONS ─────────────────────────────────────────────────────
const I=({n,s=20,c="currentColor"})=>{const p={
  dash:<><rect x="3" y="3" width="7" height="7" rx="1.5" fill={c}/><rect x="3" y="13" width="7" height="8" rx="1.5" fill={c}/><rect x="13" y="3" width="8" height="8" rx="1.5" fill={c}/><rect x="13" y="14" width="8" height="7" rx="1.5" fill={c}/></>,
  swap:<><path d="M7 4L3 8l4 4" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 8h14" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M17 20l4-4-4-4" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 16H7" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/></>,
  chart:<><path d="M3 20L9 14L13 18L21 8" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8h4v4" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  person:<><circle cx="12" cy="8" r="4" fill={c}/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" fill={c}/></>,
  ne:<><path d="M7 17L17 7" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M10 7h7v7" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  se:<><path d="M7 7L17 17" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M10 17h7v-7" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  trend:<><path d="M2 16l6-6 4 4 8-10" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 4h4v4" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  wallet:<><rect x="2" y="6" width="20" height="14" rx="3" stroke={c} strokeWidth="2" fill="none"/><path d="M2 10h20" stroke={c} strokeWidth="2"/><circle cx="17" cy="14" r="1.5" fill={c}/></>,
  brain:<><circle cx="12" cy="12" r="8" stroke={c} strokeWidth="2" fill="none"/><path d="M12 4v16M8 8c2 2 6 2 8 0M8 16c2-2 6-2 8 0" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/></>,
  spark:<path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2" strokeLinejoin="round"/>,
  add:<path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>,
  check:<path d="M5 12l5 5L20 7" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  x:<><path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2" strokeLinecap="round"/></>,
  chev:<path d="M9 6l6 6-6 6" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  book:<><path d="M4 19V5a2 2 0 012-2h8a2 2 0 012 2v14" stroke={c} strokeWidth="2" fill="none"/><path d="M16 19H4a2 2 0 01-2-2V5" stroke={c} strokeWidth="2" fill="none"/><path d="M20 19V9a2 2 0 00-2-2h-2" stroke={c} strokeWidth="2" fill="none"/><path d="M20 19H4" stroke={c} strokeWidth="2" fill="none"/></>,
  live:<><circle cx="12" cy="12" r="3" fill={c}/><path d="M12 3a9 9 0 019 9" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M12 7a5 5 0 015 5" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/></>,
};return<svg width={s} height={s} viewBox="0 0 24 24" fill="none">{p[n]}</svg>};

// ── PAIRS ─────────────────────────────────────────────────────
const PAIRS=[
  {id:"EURUSD",f1:"🇪🇺",f2:"🇺🇸",name:"EUR / USD",full:"Euro / US Dollar",base:1.0842,pip:.0001},
  {id:"GBPUSD",f1:"🇬🇧",f2:"🇺🇸",name:"GBP / USD",full:"British Pound / US Dollar",base:1.2631,pip:.0001},
  {id:"USDJPY",f1:"🇺🇸",f2:"🇯🇵",name:"USD / JPY",full:"US Dollar / Japanese Yen",base:149.82,pip:.01},
  {id:"AUDUSD",f1:"🇦🇺",f2:"🇺🇸",name:"AUD / USD",full:"Australian Dollar / US Dollar",base:.6514,pip:.0001},
  {id:"USDCAD",f1:"🇺🇸",f2:"🇨🇦",name:"USD / CAD",full:"US Dollar / Canadian Dollar",base:1.3645,pip:.0001},
  {id:"NZDUSD",f1:"🇳🇿",f2:"🇺🇸",name:"NZD / USD",full:"New Zealand Dollar / US Dollar",base:.6012,pip:.0001},
];

// ── TA ENGINE ─────────────────────────────────────────────────
function ema(d,p){const k=2/(p+1),e=[d[0]];for(let i=1;i<d.length;i++)e.push(d[i]*k+e[i-1]*(1-k));return e;}
function rsi(d,p=14){if(d.length<p+1)return 50;let ag=0,al=0;for(let i=1;i<=p;i++){const x=d[i]-d[i-1];if(x>0)ag+=x;else al+=Math.abs(x);}ag/=p;al/=p;for(let i=p+1;i<d.length;i++){const x=d[i]-d[i-1];ag=(ag*(p-1)+Math.max(0,x))/p;al=(al*(p-1)+Math.max(0,-x))/p;}return al===0?100:+(100-100/(1+ag/al)).toFixed(1);}
function macd(d){if(d.length<26)return{h:0};const e12=ema(d,12),e26=ema(d,26),ml=e12.map((v,i)=>v-e26[i]).slice(26),sl=ema(ml,9),l=ml.length-1;return{macd:+(ml[l]||0).toFixed(5),sig:+(sl[l]||0).toFixed(5),h:+((ml[l]||0)-(sl[l]||0)).toFixed(5)};}
function bb(d,p=20){if(d.length<p)return{pB:.5};const s=d.slice(-p),m=s.reduce((a,b)=>a+b,0)/p,std=Math.sqrt(s.reduce((x,v)=>x+(v-m)**2,0)/p),u=m+2*std,lo=m-2*std;return{pB:std>0?+((d[d.length-1]-lo)/(u-lo)).toFixed(2):.5};}

function analyze(data){
  const pr=data.map(d=>d.p);if(pr.length<30)return{dir:"neutral",conf:0,reasons:[],rsi:50,macdH:0,pB:.5,action:"WAIT"};
  const r=rsi(pr),m=macd(pr),b=bb(pr);
  const e9=ema(pr,9),e21=ema(pr,21),es=e9[e9.length-1],el=e21[e21.length-1];
  let sc=0;const reasons=[];
  if(r<30){sc+=2;reasons.push(`RSI is ${r} (oversold) — price dropped a lot and may bounce back up. Think of it like a rubber band stretched too far down.`);}
  else if(r<40){sc+=1;reasons.push(`RSI is ${r} — getting close to oversold territory. Buyers may step in soon.`);}
  else if(r>70){sc-=2;reasons.push(`RSI is ${r} (overbought) — price rose too fast and may pull back. Like a ball thrown up that must come down.`);}
  else if(r>60){sc-=1;reasons.push(`RSI is ${r} — approaching overbought. Momentum is slowing.`);}
  else{reasons.push(`RSI is ${r} — neutral zone. No extreme momentum detected.`);}
  if(m.h>0){sc+=1.5;reasons.push("MACD histogram is positive — short-term momentum is pushing price UP. The fast signal is above the slow signal.");}
  else{sc-=1.5;reasons.push("MACD histogram is negative — short-term momentum is pushing price DOWN.");}
  if(es>el){sc+=.5;reasons.push("9-period EMA is above 21-period EMA — the short-term trend is bullish (upward).");}
  else{sc-=.5;reasons.push("9-period EMA is below 21-period EMA — the short-term trend is bearish (downward).");}
  if(b.pB<.1){sc+=1.5;reasons.push("Price is at the lower Bollinger Band — this is a potential support zone where price often bounces.");}
  else if(b.pB>.9){sc-=1.5;reasons.push("Price is at the upper Bollinger Band — this is a resistance zone where price often reverses.");}
  const conf=Math.min(92,Math.round(Math.abs(sc)/7*100)),dir=sc>.5?"bullish":sc<-.5?"bearish":"neutral";
  return{dir,conf,reasons,rsi:r,macdH:m.h,pB:b.pB,action:dir==="bullish"?"CALL":dir==="bearish"?"PUT":"WAIT"};
}

// ── AI COACHING VIA ANTHROPIC API ─────────────────────────────
async function getAICoaching(pairName,price,signal,priceHistory){
  try{
    const histStr=priceHistory.slice(-20).map(d=>`${new Date(d.t).toLocaleTimeString()}: ${d.p}`).join(", ");
    const resp=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
        messages:[{role:"user",content:`You are a forex trading coach teaching a complete beginner. Be warm, encouraging, and use simple analogies.

Current pair: ${pairName} at ${price}
Signal: ${signal.action} (${signal.conf}% confidence, ${signal.dir})
RSI: ${signal.rsi} | MACD Histogram: ${signal.macdH} | Bollinger %B: ${signal.pB}
Recent prices: ${histStr}

In 3-4 short paragraphs, explain:
1. What the current market is doing RIGHT NOW in plain English (like explaining to a friend)
2. WHY the indicators suggest ${signal.action} — explain each indicator simply
3. The RISK — what could go wrong and how to protect yourself
4. A specific actionable tip for this exact moment

Keep it under 200 words. Use emoji sparingly. Never use markdown headers.`}]})
    });
    const data=await resp.json();
    return data.content?.[0]?.text||null;
  }catch(e){return null;}
}

// ── ONBOARDING LESSONS ────────────────────────────────────────
const LESSONS=[
  {title:"What is Forex?",emoji:"🌍",body:"Forex (Foreign Exchange) is the world's largest financial market where currencies are traded against each other. When you travel abroad and exchange money, you're doing forex! The market trades $7.5 TRILLION per day — that's more than all stock markets combined.\n\nIn forex, currencies come in PAIRS like EUR/USD. The first currency (EUR) is the 'base' and the second (USD) is the 'quote'. The price tells you how much of the quote currency you need to buy one unit of the base currency.\n\nSo if EUR/USD = 1.0842, it costs $1.0842 to buy €1."},
  {title:"How Do You Make Money?",emoji:"💰",body:"You make money by predicting whether a currency will go UP or DOWN relative to another.\n\nCALL (Buy/Long): You think the price will RISE. You buy now and sell later at a higher price.\n\nPUT (Sell/Short): You think the price will FALL. You sell now and buy back later at a lower price.\n\nExample: You buy EUR/USD at 1.0842. Price rises to 1.0892 — that's a 50 pip gain! With a standard lot, each pip is worth about $10, so you'd make $500.\n\nThe key: small price movements × leverage = significant profits (or losses)."},
  {title:"Reading the Indicators",emoji:"📊",body:"RSI (Relative Strength Index): Shows if a currency is 'overbought' (above 70 = too expensive, might drop) or 'oversold' (below 30 = too cheap, might rise). Think of it as a speedometer.\n\nMACD: Compares fast vs slow momentum. When the histogram is positive and growing, upward momentum is increasing. Like checking if a car is accelerating or braking.\n\nBollinger Bands: These are price boundaries. When price touches the lower band, it often bounces up. When it touches the upper band, it often comes back down. Like a ball bouncing between walls.\n\nEMA Crossover: When the fast average crosses above the slow average, it's a 'golden cross' — bullish signal."},
  {title:"Risk Management",emoji:"🛡️",body:"The #1 rule of forex: NEVER risk more than 1-2% of your account on a single trade.\n\nAlways use a STOP LOSS — this automatically closes your trade if the price moves against you by a set amount. Think of it as a safety net.\n\nRisk-to-Reward ratio: For every $1 you risk, aim to make at least $2. If your stop loss is 20 pips, your take profit should be at least 40 pips.\n\nStart small. Use this paper trading app to practice without risking real money. When you're consistently profitable over 3+ months, then consider a small real account.\n\nRemember: Every professional trader started exactly where you are now."},
];

// ── PRICE ENGINE ──────────────────────────────────────────────
function simTick(prev,pair){
  const vol=pair.pip*80;
  let n=prev+(Math.random()-.48)*vol*.5+(Math.random()-.5)*vol*.5;
  return +Math.max(pair.base*.94,Math.min(pair.base*1.06,n)).toFixed(pair.pip<.01?2:5);
}
function genHist(pair,n=80){const d=[];let p=pair.base;for(let i=n;i>=0;i--){p+=Math.sin(i*.04)*(pair.pip*80)*2.5+(Math.random()-.5)*(pair.pip*80)*3;p=Math.max(pair.base*.96,Math.min(pair.base*1.04,p));d.push({t:Date.now()-i*60000,p:+p.toFixed(pair.pip<.01?2:5)});}return d;}

// ═══ MAIN APP ═════════════════════════════════════════════════
export default function LacunaTrade(){
  const [screen,setScreen]=useState("dashboard");
  const [balance,setBalance]=useState(10000);
  const [positions,setPositions]=useState([]);
  const [closed,setClosed]=useState([]);
  const [actPair,setActPair]=useState(0);
  const [betSize,setBetSize]=useState(500);
  const [toast,setToast]=useState(null);
  const [result,setResult]=useState(null);
  const [prices,setPrices]=useState(()=>{const o={};PAIRS.forEach(p=>o[p.id]=p.base);return o;});
  const [charts,setCharts]=useState(()=>{const o={};PAIRS.forEach(p=>o[p.id]=genHist(p));return o;});
  const [eqHist,setEqHist]=useState([]);
  const [isLive,setIsLive]=useState(false);
  const [lastUpdate,setLastUpdate]=useState(null);
  const [coaching,setCoaching]=useState(null);
  const [coachLoading,setCoachLoading]=useState(false);
  const [showOnboard,setShowOnboard]=useState(()=>!localStorage.getItem("lt6-onboarded"));
  const [onboardStep,setOnboardStep]=useState(0);
  const [showLesson,setShowLesson]=useState(null);
  const fetchRef=useRef(null);

  const pair=PAIRS[actPair],price=prices[pair.id],dec=pair.pip<.01?2:4;
  const cd=charts[pair.id]||[],sig=useMemo(()=>analyze(cd),[cd]);
  const pCh=cd.length>1?cd[cd.length-1].p-cd[0].p:0;
  const pPct=cd.length>1?((pCh/cd[0].p)*100).toFixed(2):"0.00";
  const sigCol=sig.dir==="bullish"?C.grn:sig.dir==="bearish"?C.err:C.pri;

  // ── FETCH REAL PRICES ─────────────────────────────────────
  const fetchPrices=useCallback(async()=>{
    try{
      const r=await fetch("https://www.freeforexapi.com/api/live?pairs=EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,NZDUSD");
      const d=await r.json();
      if(d.code===200&&d.rates){
        const newPrices={};
        Object.entries(d.rates).forEach(([k,v])=>{newPrices[k]=v.rate;});
        setPrices(prev=>{const n={...prev,...newPrices};return n;});
        setCharts(prev=>{
          const n={...prev};
          Object.entries(newPrices).forEach(([k,v])=>{
            if(n[k]){n[k]=[...n[k].slice(-119),{t:Date.now(),p:+v.toFixed(PAIRS.find(p=>p.id===k)?.pip<.01?2:5)}];}
          });
          return n;
        });
        setIsLive(true);setLastUpdate(new Date());
      }
    }catch{
      // Fallback to simulation
      setPrices(prev=>{const n={...prev};PAIRS.forEach(p=>n[p.id]=simTick(prev[p.id],p));return n;});
      setCharts(prev=>{const n={...prev};PAIRS.forEach(p=>{const l=prev[p.id][prev[p.id].length-1];n[p.id]=[...prev[p.id].slice(-119),{t:Date.now(),p:simTick(l.p,p)}];});return n;});
      setIsLive(false);
    }
  },[]);

  useEffect(()=>{
    fetchPrices();
    fetchRef.current=setInterval(fetchPrices,15000);
    return()=>clearInterval(fetchRef.current);
  },[fetchPrices]);

  // Simulate between fetches
  useEffect(()=>{
    const iv=setInterval(()=>{
      setCharts(prev=>{const n={...prev};PAIRS.forEach(p=>{const l=prev[p.id][prev[p.id].length-1];const newP=simTick(l.p,p);n[p.id]=[...prev[p.id].slice(-119),{t:Date.now(),p:newP}];});return n;});
      setPrices(prev=>{const n={...prev};PAIRS.forEach(p=>n[p.id]=simTick(prev[p.id],p));return n;});
    },3000);
    return()=>clearInterval(iv);
  },[]);

  // Equity
  useEffect(()=>{let u=0;positions.forEach(pos=>{const c=prices[pos.pid];u+=pos.side==="call"?(c-pos.entry)*pos.units:(pos.entry-c)*pos.units;});setEqHist(pv=>[...pv.slice(-60),{t:Date.now(),v:+(balance+u).toFixed(0)}]);},[prices,positions,balance]);

  // Persistence
  useEffect(()=>{try{const r=localStorage.getItem("lt6");if(r){const s=JSON.parse(r);if(s.b!=null)setBalance(s.b);if(s.p)setPositions(s.p);if(s.c)setClosed(s.c);}}catch{}},[]);
  useEffect(()=>{const t=setTimeout(()=>{try{localStorage.setItem("lt6",JSON.stringify({b:balance,p:positions,c:closed}));}catch{}},2e3);return()=>clearTimeout(t);},[balance,positions,closed]);

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2800);};

  const openTrade=side=>{
    if(betSize>balance){flash("Insufficient credits");return;}
    setPositions(p=>[...p,{id:Date.now(),pid:pair.id,pn:pair.name,side,entry:price,units:betSize*50,bet:betSize,ot:Date.now(),type:["LEVERAGE 10X","SPOT","ARBITRAGE"][Math.floor(Math.random()*3)]}]);
    setBalance(b=>+(b-betSize).toFixed(2));
    flash(side==="call"?"CALL placed — watching for rise ↑":"PUT placed — watching for drop ↓");
    setScreen("dashboard");
  };

  const closeTrade=id=>{const pos=positions.find(p=>p.id===id);if(!pos)return;const pnl=pos.side==="call"?(prices[pos.pid]-pos.entry)*pos.units:(pos.entry-prices[pos.pid])*pos.units;setBalance(b=>+(b+pos.bet+pnl).toFixed(2));setClosed(h=>[{...pos,cp:prices[pos.pid],ct:Date.now(),pnl:+pnl.toFixed(2)},...h]);setPositions(p=>p.filter(x=>x.id!==id));setResult({pnl:+pnl.toFixed(2),pair:pos.pn});setTimeout(()=>setResult(null),3000);};
  const reset=()=>{setBalance(10000);setPositions([]);setClosed([]);setEqHist([]);flash("Account reset");};

  const unr=positions.reduce((s,pos)=>{const c=prices[pos.pid];return s+(pos.side==="call"?(c-pos.entry)*pos.units:(pos.entry-c)*pos.units);},0);
  const totCl=closed.reduce((s,t)=>s+t.pnl,0),eq=balance+unr;
  const wins=closed.filter(t=>t.pnl>0).length,wr=closed.length>0?((wins/closed.length)*100).toFixed(1):"0.0";

  // Ask AI Coach
  const askCoach=async()=>{
    setCoachLoading(true);setCoaching(null);
    const result=await getAICoaching(pair.name,price,sig,cd);
    setCoaching(result||"I couldn't connect to the AI coach right now. Here's what the indicators say:\n\n"+sig.reasons.join("\n\n"));
    setCoachLoading(false);
  };

  // ── ONBOARDING ────────────────────────────────────────────
  if(showOnboard){
    const steps=[
      {title:"Welcome to Lacuna Trade",sub:"Your AI-powered forex learning companion",body:"This app connects to REAL forex market data and uses artificial intelligence to help you understand WHY prices move.\n\nYou'll trade with $10,000 of play money — zero risk, real learning.",emoji:"🚀",btn:"Let's Start →"},
      {title:"How It Works",sub:"3 simple steps to your first trade",body:"1️⃣  Pick a currency pair (like EUR/USD)\n2️⃣  The AI analyzes live market data and tells you what it thinks — and WHY\n3️⃣  Tap CALL if you think price goes UP, or PUT if you think it goes DOWN\n\nWhen you're ready, close your trade to lock in profit or cut losses.",emoji:"📱",btn:"Got It →"},
      {title:"Your AI Coach",sub:"Always here to explain",body:"Tap the '🧠 Ask AI Coach' button anytime and Claude will explain:\n\n• What the market is doing RIGHT NOW\n• WHY the indicators point a certain direction\n• What RISKS to watch for\n• A specific TIP for this moment\n\nThe Learn tab has 4 lessons covering everything from basics to risk management.",emoji:"🤖",btn:"Start Trading! 🎉"},
    ];
    const step=steps[onboardStep];
    return(
      <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",left:"-20%",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${C.blue}15,transparent 70%)`,filter:"blur(40px)"}}/>
        <div style={{position:"absolute",bottom:"-10%",right:"-20%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.cyan}10,transparent 70%)`,filter:"blur(40px)"}}/>
        <div style={{fontSize:72,marginBottom:24,animation:"float 3s ease-in-out infinite"}}>{step.emoji}</div>
        <div style={{fontSize:26,fontWeight:800,fontFamily:"Manrope",color:C.on,letterSpacing:"-0.03em",textAlign:"center",marginBottom:6}}>{step.title}</div>
        <div style={{fontSize:13,color:C.pri,fontWeight:600,textAlign:"center",marginBottom:20}}>{step.sub}</div>
        <LG i="m" style={{padding:24,marginBottom:28,maxWidth:360}}>
          <div style={{fontSize:13,color:C.onV,lineHeight:1.8,whiteSpace:"pre-line"}}>{step.body}</div>
        </LG>
        <button onClick={()=>{if(onboardStep<2)setOnboardStep(s=>s+1);else{setShowOnboard(false);localStorage.setItem("lt6-onboarded","1");}}} style={{padding:"16px 40px",borderRadius:20,background:`linear-gradient(135deg,${C.pD},${C.pC})`,border:"none",cursor:"pointer",fontSize:15,fontWeight:700,color:C.on,fontFamily:"Inter",boxShadow:`0 8px 32px ${C.pri}40`}}>{step.btn}</button>
        <div style={{display:"flex",gap:8,marginTop:20}}>
          {steps.map((_,i)=><div key={i} style={{width:i===onboardStep?24:8,height:8,borderRadius:4,background:i===onboardStep?C.pri:`${C.onV}30`,transition:"all .3s"}}/>)}
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}`}</style>
      </div>
    );
  }

  // ── LESSON MODAL ──────────────────────────────────────────
  if(showLesson!==null){
    const lesson=LESSONS[showLesson];
    return(
      <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",padding:"20px",overflowY:"auto"}}>
        <button onClick={()=>setShowLesson(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.pri,fontSize:14,fontWeight:600,marginBottom:20,fontFamily:"Inter"}}>← Back</button>
        <div style={{fontSize:48,marginBottom:16}}>{lesson.emoji}</div>
        <div style={{fontSize:24,fontWeight:800,fontFamily:"Manrope",color:C.on,letterSpacing:"-0.03em",marginBottom:16}}>{lesson.title}</div>
        <LG i="m" style={{padding:24}}>
          <div style={{fontSize:14,color:C.onV,lineHeight:1.9,whiteSpace:"pre-line"}}>{lesson.body}</div>
        </LG>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:0}`}</style>
      </div>
    );
  }

  // ═══ DASHBOARD ═════════════════════════════════════════════
  const renderDash=()=>(
    <div style={{padding:"0 20px 120px",animation:"fadeUp .4s ease"}}>
      {/* Live status bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:isLive?C.grn:C.org,boxShadow:isLive?`0 0 8px ${C.grn}80`:"none",animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:10,fontWeight:600,color:isLive?C.grn:C.org,letterSpacing:"0.1em",textTransform:"uppercase"}}>{isLive?"Live Market Data":"Simulated Prices"}</span>
        {lastUpdate&&<span style={{fontSize:9,color:C.onV}}>· {lastUpdate.toLocaleTimeString()}</span>}
      </div>

      {/* Balance — Mesh Gradient + Chrome Ribbons */}
      <LG i="h" glow={C.blue} style={{padding:0,marginBottom:20,minHeight:190}}>
        <Mesh/><Ribbons h={190} op={.35}/>
        <div style={{position:"relative",zIndex:5,padding:"26px 22px"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:"rgba(255,255,255,.6)",marginBottom:10}}>Paper Trading Balance</div>
          <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:16}}>
            <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.5)",fontFamily:"Manrope"}}>$</span>
            <span style={{fontSize:44,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:"#fff",lineHeight:1,textShadow:`0 2px 20px ${C.blue}30`}}>{Math.floor(eq).toLocaleString()}</span>
            <span style={{fontSize:16,fontWeight:600,color:"rgba(255,255,255,.4)",fontFamily:"Manrope"}}>.{Math.abs(Math.floor((eq%1)*100)).toString().padStart(2,"0")}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>{setBalance(b=>b+5000);flash("+$5K added");}} style={{padding:11,borderRadius:14,background:`linear-gradient(135deg,${C.pD},${C.pC})`,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"Inter",color:"#fff"}}>+ Add Credits</button>
            <button onClick={()=>setScreen("learn")} style={{padding:11,borderRadius:14,background:"rgba(255,255,255,.06)",border:`0.5px solid ${C.pri}40`,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"Inter",color:C.pri}}>📖 Learn Forex</button>
          </div>
        </div>
      </LG>

      {/* Journey */}
      <LG i="m" style={{padding:18,marginBottom:18,overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,opacity:.25,pointerEvents:"none"}}><Waves h={50}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>Your Journey</div>
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:8,background:`${C.grn}12`}}><I n="trend" s={12} c={C.grn}/><span style={{fontSize:10,fontWeight:700,color:C.grn}}>+{Math.abs(+pPct)}%</span></div>
        </div>
        <div style={{height:80,position:"relative",zIndex:2}}>
          {eqHist.length>2?<ResponsiveContainer width="100%" height="100%"><AreaChart data={eqHist}><defs><linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={.5}/><stop offset="100%" stopColor={C.blue} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={C.blue} strokeWidth={2} fill="url(#jg)" dot={false}/></AreaChart></ResponsiveContainer>
          :<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:C.onV,fontSize:11}}>Building chart...</div>}
        </div>
      </LG>

      {/* AI SIGNAL + COACH */}
      <LG i="l" glow={sigCol} style={{padding:18,marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:34,height:34,borderRadius:12,background:`${sigCol}15`,display:"flex",alignItems:"center",justifyContent:"center"}}><I n="brain" s={18} c={sigCol}/></div>
          <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>AI Signal Analysis</span></div>
          <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:16,background:`${sigCol}18`,color:sigCol,textTransform:"uppercase"}}>{sig.dir}</span>
        </div>
        {/* Confidence */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{flex:1,height:6,borderRadius:4,background:`${C.onV}15`,overflow:"hidden"}}><div style={{width:`${sig.conf}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${sigCol}80,${sigCol})`,transition:"width .5s"}}/></div>
          <span style={{fontSize:12,fontWeight:700,color:sigCol,fontFamily:"Manrope"}}>{sig.conf}%</span>
        </div>
        {/* Reasons — THE WHY */}
        {sig.reasons.slice(0,3).map((r,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:8}}><I n="spark" s={13} c={sigCol}/><span style={{fontSize:11,color:C.onV,lineHeight:1.6}}>{r}</span></div>)}
        {/* Indicator boxes */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:12}}>
          {[["RSI",sig.rsi,sig.rsi<30?C.grn:sig.rsi>70?C.err:C.onV],["MACD",sig.macdH>0?"Bull▲":"Bear▼",sig.macdH>0?C.grn:C.err],["%B",sig.pB,sig.pB<.2?C.grn:sig.pB>.8?C.err:C.onV]].map(([l,v,col])=>(
            <div key={l} style={{padding:"7px 8px",borderRadius:10,background:`${C.on}04`,textAlign:"center"}}><div style={{fontSize:8,fontWeight:700,letterSpacing:".15em",color:C.onV,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:col,fontFamily:"Manrope",marginTop:2}}>{v}</div></div>
          ))}
        </div>
        {/* ASK AI COACH BUTTON */}
        <button onClick={askCoach} disabled={coachLoading} style={{marginTop:14,width:"100%",padding:13,borderRadius:14,background:`linear-gradient(135deg,${C.pD}30,${C.pC}20)`,border:`0.5px solid ${C.pri}30`,cursor:"pointer",fontSize:12,fontWeight:700,color:C.pri,fontFamily:"Inter",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <I n="brain" s={16} c={C.pri}/>{coachLoading?"AI is thinking...":"🧠 Ask AI Coach — Explain This Trade"}
        </button>
      </LG>

      {/* AI Coaching Response */}
      {coaching&&(
        <LG i="m" glow={C.ind} style={{padding:18,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:18}}>🤖</span>
            <span style={{fontSize:13,fontWeight:700,fontFamily:"Manrope",color:C.on}}>AI Coach Says</span>
          </div>
          <div style={{fontSize:12,color:C.onV,lineHeight:1.8,whiteSpace:"pre-line"}}>{coaching}</div>
          <button onClick={()=>setCoaching(null)} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.onV}}>Dismiss</button>
        </LG>
      )}

      {/* Trade action */}
      <button onClick={()=>setScreen("trades")} style={{width:"100%",padding:15,borderRadius:18,background:`linear-gradient(135deg,${C.pD},${C.pC})`,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",fontFamily:"Inter",marginBottom:18,boxShadow:`0 8px 32px ${C.pri}30`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {sig.action==="CALL"?<I n="ne" s={18} c="#fff"/>:sig.action==="PUT"?<I n="se" s={18} c="#fff"/>:null}
        {sig.action==="CALL"?"Execute CALL Trade →":sig.action==="PUT"?"Execute PUT Trade →":"View Trading Screen →"}
      </button>

      <Curve c={C.blue}/>

      {/* Active Trades */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>Active Trades</span>
        <span style={{fontSize:11,color:C.onV}}>{positions.length} open</span>
      </div>
      {positions.length===0?<LG i="m" style={{textAlign:"center",padding:"28px 18px"}}><Dots n={8} s={5}/><div style={{fontSize:12,color:C.onV,marginTop:10}}>No trades yet. Use the AI signal above to place your first trade!</div></LG>
      :positions.map(pos=>{const cur=prices[pos.pid],pnl=pos.side==="call"?(cur-pos.entry)*pos.units:(pos.entry-cur)*pos.units,isW=pnl>=0;return(
        <LG key={pos.id} i="m" glow={isW?C.grn:C.err} style={{marginBottom:10,padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:10,background:`${isW?C.grn:C.err}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><I n={pos.side==="call"?"ne":"se"} s={14} c={isW?C.grn:C.err}/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>{pos.pn}</div><div style={{fontSize:9,color:C.onV,textTransform:"uppercase",letterSpacing:".1em",marginTop:1}}>{pos.type}</div></div>
            <span style={{fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:12,background:`${isW?C.grn:C.err}15`,color:isW?C.grn:C.err,textTransform:"uppercase"}}>{isW?"profit":"loss"}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div><div style={{fontSize:8,fontWeight:600,letterSpacing:".15em",color:C.onV,textTransform:"uppercase"}}>PNL</div><div style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:isW?C.grn:C.err}}>{isW?"+":"-"}${Math.abs(pnl).toFixed(2)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:8,fontWeight:600,letterSpacing:".15em",color:C.onV,textTransform:"uppercase"}}>Current</div><div style={{fontSize:13,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>{cur?.toFixed(dec)}</div></div>
          </div>
          <button onClick={()=>closeTrade(pos.id)} style={{width:"100%",padding:9,borderRadius:10,background:`${C.pri}10`,border:`0.5px solid ${C.pri}20`,color:C.pri,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"Inter",letterSpacing:".1em",textTransform:"uppercase"}}>Close Position</button>
        </LG>);
      })}
    </div>
  );

  // ═══ TRADES ═════════════════════════════════════════════════
  const renderTrades=()=>(
    <div style={{padding:"0 20px 120px",animation:"fadeUp .35s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:28}}>{pair.f1}{pair.f2}</div><div><div style={{fontSize:9,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.onV}}>Live Pair</div><div style={{fontSize:20,fontWeight:800,fontFamily:"Manrope",color:"#fff"}}>{pair.name}</div></div></div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:14}}><span style={{fontSize:40,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:"#fff"}}>{price?.toFixed(dec)}</span><span style={{fontSize:12,fontWeight:700,color:pCh>=0?C.gD:C.err}}>{pCh>=0?"+":""}{pCh.toFixed(dec)} ({pPct}%)</span></div>

      <LG i="h" style={{padding:4,marginBottom:16,minHeight:200}}>
        <Ribbons h={200} op={.12}/>
        <div style={{height:170,padding:"12px 8px",position:"relative",zIndex:2}}>
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={cd}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.pri} stopOpacity={.5}/><stop offset="100%" stopColor={C.pri} stopOpacity={0}/></linearGradient></defs><YAxis domain={["auto","auto"]} hide/><Area type="monotone" dataKey="p" stroke={C.pri} strokeWidth={2.5} fill="url(#cg)" dot={false}/>{positions.filter(p=>p.pid===pair.id).map(pos=><ReferenceLine key={pos.id} y={pos.entry} stroke={pos.side==="call"?C.grn:C.err} strokeDasharray="4 4" strokeOpacity={.5}/>)}</AreaChart></ResponsiveContainer>
        </div>
        <div style={{position:"absolute",top:14,right:14,background:C.pri,padding:"3px 9px",borderRadius:8,display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 16px ${C.pri}30`,zIndex:4}}><span style={{fontSize:10,fontWeight:700,color:"#000"}}>{price?.toFixed(dec)}</span><div style={{width:4,height:4,borderRadius:"50%",background:"#000",animation:"pulse 2s infinite"}}/></div>
      </LG>

      {/* Signal bar */}
      <LG i="l" glow={sigCol} style={{padding:"12px 16px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><I n="brain" s={16} c={sigCol}/><span style={{fontSize:11,color:"#fff",fontWeight:500,flex:1}}>AI: <b style={{color:sigCol}}>{sig.action}</b> — {sig.conf}% — {sig.reasons[0]?.split("—")[0]}</span></div>
      </LG>

      {/* Bet size */}
      <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
        {[100,250,500,1000,2500].map(a=>(<button key={a} onClick={()=>setBetSize(a)} style={{padding:"6px 12px",borderRadius:14,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"Inter",background:betSize===a?`${C.pri}18`:"transparent",border:betSize===a?`1px solid ${C.pri}40`:`0.5px solid ${C.out}25`,color:betSize===a?C.pri:C.onV}}>${a>=1e3?(a/1e3)+"K":a}</button>))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>openTrade("call")} style={{padding:"18px 22px",borderRadius:22,cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"rgba(0,252,64,.04)",border:`0.5px solid ${C.grn}30`,boxShadow:`0 0 30px ${C.grn}08`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,opacity:.15}}><Waves h={35}/></div>
          <I n="ne" s={24} c={C.grn}/><div style={{position:"relative",zIndex:2}}><div style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:C.gD}}>CALL</div><div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:`${C.grn}80`}}>Predict Rise</div></div>
        </button>
        <button onClick={()=>openTrade("put")} style={{padding:"18px 22px",borderRadius:22,cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"rgba(255,110,132,.04)",border:`0.5px solid ${C.err}30`,boxShadow:`0 0 30px ${C.err}08`}}>
          <I n="se" s={24} c={C.err}/><div><div style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:C.eD}}>PUT</div><div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:`${C.err}80`}}>Predict Fall</div></div>
        </button>
      </div>
    </div>
  );

  // ═══ MARKETS ════════════════════════════════════════════════
  const renderMarkets=()=>(
    <div style={{padding:"0 20px 120px",animation:"fadeUp .35s ease"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".2em",color:C.grn,textTransform:"uppercase",marginBottom:6}}>Live Market Data</div>
      <div style={{fontSize:26,fontWeight:800,fontFamily:"Manrope",color:"#fff",letterSpacing:"-0.03em",marginBottom:16}}>All Currency Pairs</div>

      {PAIRS.map((p,i)=>{const pr=prices[p.id],ch=charts[p.id]||[],prev=ch.length>1?ch[ch.length-2].p:pr,diff=pr-prev,pct=prev?((diff/prev)*100).toFixed(2):"0.00",up=diff>=0,ps=analyze(ch);
        return(<button key={p.id} onClick={()=>{setActPair(i);setScreen("trades");}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:i<PAIRS.length-1?`0.5px solid ${C.out}10`:"none"}}>
          <div style={{fontSize:22,width:34,textAlign:"center"}}>{p.f1}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>{p.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:6,background:`${ps.dir==="bullish"?C.grn:ps.dir==="bearish"?C.err:C.pri}12`,color:ps.dir==="bullish"?C.grn:ps.dir==="bearish"?C.err:C.pri,textTransform:"uppercase"}}>{ps.action}</span>
              <span style={{fontSize:9,color:C.onV}}>{ps.conf}%</span>
            </div>
          </div>
          <div style={{textAlign:"right",marginRight:4}}><div style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>{pr?.toFixed(p.pip<.01?2:4)}</div><div style={{fontSize:10,fontWeight:600,color:up?C.grn:C.err,marginTop:2}}>{up?"+":""}{pct}%</div></div>
          <I n="chev" s={14} c={C.onV}/>
        </button>);
      })}
    </div>
  );

  // ═══ LEARN ══════════════════════════════════════════════════
  const renderLearn=()=>(
    <div style={{padding:"0 20px 120px",animation:"fadeUp .35s ease"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".2em",color:C.pri,textTransform:"uppercase",marginBottom:6}}>Education Center</div>
      <div style={{fontSize:26,fontWeight:800,fontFamily:"Manrope",color:"#fff",letterSpacing:"-0.03em",marginBottom:6}}>Learn Forex Trading</div>
      <div style={{fontSize:12,color:C.onV,marginBottom:20,lineHeight:1.6}}>Master the basics before risking real money. Each lesson takes 2-3 minutes.</div>

      {LESSONS.map((l,i)=>(
        <button key={i} onClick={()=>setShowLesson(i)} style={{width:"100%",textAlign:"left",marginBottom:10}}>
          <LG i="m" style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
            <div style={{fontSize:28}}>{l.emoji}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:"#fff"}}>{l.title}</div><div style={{fontSize:11,color:C.onV,marginTop:2}}>Lesson {i+1} of {LESSONS.length}</div></div>
            <I n="chev" s={16} c={C.onV}/>
          </LG>
        </button>
      ))}

      <Curve c={C.ind}/>

      <LG i="m" style={{padding:20,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:10}}>🏆</div>
        <div style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:"#fff",marginBottom:6}}>Your Stats</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[[closed.length,"Trades"],[wr+"%","Win Rate"],[fmtM(eq),"Portfolio"]].map(([v,l])=>(
            <div key={l} style={{padding:"10px 6px",borderRadius:10,background:`${C.on}04`}}><div style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"Manrope"}}>{v}</div><div style={{fontSize:9,color:C.onV,marginTop:2}}>{l}</div></div>
          ))}
        </div>
        <button onClick={()=>setShowOnboard(true)} style={{marginTop:14,background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.pri,fontWeight:600}}>Replay Tutorial</button>
      </LG>
    </div>
  );

  const fmtM=n=>Math.abs(n)>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+n.toFixed(0);
  const nav=[{id:"dashboard",icon:"dash",label:"HOME"},{id:"trades",icon:"swap",label:"TRADE"},{id:"markets",icon:"chart",label:"MARKETS"},{id:"learn",icon:"book",label:"LEARN"}];

  return(
    <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",color:C.on,fontSize:13,position:"relative",overflowX:"hidden"}}>
      <div style={{position:"fixed",top:"15%",left:"-20%",width:350,height:350,borderRadius:"50%",background:`radial-gradient(circle,${C.blue}08,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"15%",right:"-20%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.cyan}04,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      {toast&&<div style={{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",zIndex:999,padding:"10px 20px",borderRadius:16,background:"rgba(26,25,25,.92)",border:`0.5px solid ${C.out}25`,color:"#fff",fontSize:12,fontWeight:500,backdropFilter:"blur(24px)",animation:"fadeUp .3s ease",boxShadow:"0 8px 32px rgba(0,0,0,.5)",whiteSpace:"nowrap"}}>{toast}</div>}

      {result&&<div onClick={()=>setResult(null)} style={{position:"fixed",inset:0,zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(12px)",animation:"fadeUp .25s ease",cursor:"pointer"}}><LG i="h" glow={result.pnl>=0?C.grn:C.err} style={{textAlign:"center",padding:"40px 48px"}}><div style={{fontSize:48,marginBottom:8}}>{result.pnl>=0?"🎉":"📉"}</div><div style={{fontSize:20,fontWeight:800,fontFamily:"Manrope",color:result.pnl>=0?C.grn:C.err}}>{result.pnl>=0?"Profit!":"Loss"}</div><div style={{fontSize:30,fontWeight:800,fontFamily:"Manrope",color:"#fff",marginTop:4}}>{result.pnl>=0?"+":""}${result.pnl.toFixed(2)}</div><div style={{fontSize:11,color:C.onV,marginTop:6}}>on {result.pair}</div></LG></div>}

      <header style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52,background:`${C.bg}90`,backdropFilter:"blur(32px) saturate(1.5)",WebkitBackdropFilter:"blur(32px) saturate(1.5)",boxShadow:`0 1px 0 ${C.out}10`}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="32" stroke={C.blue} strokeWidth="3" strokeDasharray="168 34" strokeLinecap="round" transform="rotate(-90 50 50)"/><circle cx="50" cy="50" r="4.5" fill={C.blue}/></svg>
          <span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:C.pri,letterSpacing:"-0.02em"}}>Lacuna Trade</span>
          <div style={{width:5,height:5,borderRadius:"50%",background:isLive?C.grn:C.org,marginLeft:2,boxShadow:isLive?`0 0 6px ${C.grn}80`:"none"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={reset} style={{background:"none",border:"none",cursor:"pointer",fontSize:9,color:C.onV,fontWeight:600}}>RESET</button>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.pD},${C.pC})`,display:"flex",alignItems:"center",justifyContent:"center"}}><I n="person" s={12} c="#fff"/></div>
        </div>
      </header>

      <div style={{height:4}}/>
      {screen==="dashboard"&&renderDash()}
      {screen==="trades"&&renderTrades()}
      {screen==="markets"&&renderMarkets()}
      {screen==="learn"&&renderLearn()}

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"9px 12px max(12px,env(safe-area-inset-bottom))",background:`${C.bg}88`,backdropFilter:"blur(32px) saturate(1.5)",WebkitBackdropFilter:"blur(32px) saturate(1.5)",borderTop:`0.5px solid ${C.out}10`,borderRadius:"22px 22px 0 0",zIndex:100}}>
        {nav.map(item=>{const a=screen===item.id;return(
          <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"3px 10px",fontFamily:"Manrope",position:"relative"}}>
            <I n={item.icon} s={18} c={a?C.pri:`${C.onV}60`}/><span style={{fontSize:8,fontWeight:700,letterSpacing:".12em",color:a?C.pri:`${C.onV}50`}}>{item.label}</span>
            {a&&<div style={{position:"absolute",bottom:-1,width:4,height:4,borderRadius:"50%",background:C.pri}}/>}
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
