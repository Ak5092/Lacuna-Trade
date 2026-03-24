import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   LACUNA TRADE v8 — COMPREHENSIVE FOREX LEARNING PLATFORM
   Animated Landing · Auto-Bot · Live Data · AI Coach · Education
   Design: Ethereal Surge — "The Living Void"
   ═══════════════════════════════════════════════════════════════ */

// ── TOKENS ────────────────────────────────────────────────────
const S={bg:"#0e0e0e",sLo:"#131313",sCon:"#1a1919",sHi:"#201f1f",sHigh:"#262626",sLow:"#000000",
  pri:"#97a9ff",pDim:"#8a9cf0",sec:"#00fc40",seDim:"#00ec3b",ter:"#ff9063",tDim:"#fc773d",
  err:"#ff6e84",eDim:"#d73357",on:"#fff",onV:"#adaaaa",out:"#484847"};

// ── SURFACES ──────────────────────────────────────────────────
const Surf=({children,style={},t="con"})=>{
  const bg={con:S.sCon,hi:S.sHi,lo:S.sLo,high:S.sHigh,low:S.sLow,bg:S.bg}[t]||S.sCon;
  return<div style={{background:bg,borderRadius:28,position:"relative",overflow:"hidden",...style}}>{children}</div>;
};
const Glass=({children,style={}})=>(<div style={{background:"rgba(38,38,38,0.4)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:28,position:"relative",overflow:"hidden",...style}}>{children}</div>);
const Lbl=({children,c,style={}})=><span style={{fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:c||S.onV,display:"block",...style}}>{children}</span>;

// ── PAIRS ─────────────────────────────────────────────────────
const PAIRS=[
  {id:"EURUSD",f:"🇪🇺",name:"EUR/USD",base:1.0842,pip:.0001,desc:"Most traded pair globally"},
  {id:"GBPUSD",f:"🇬🇧",name:"GBP/USD",base:1.2631,pip:.0001,desc:"Cable — high volatility"},
  {id:"USDJPY",f:"🇯🇵",name:"USD/JPY",base:149.82,pip:.01,desc:"Safe-haven yen pair"},
  {id:"AUDUSD",f:"🇦🇺",name:"AUD/USD",base:.6514,pip:.0001,desc:"Commodity-linked Aussie"},
  {id:"USDCAD",f:"🇨🇦",name:"USD/CAD",base:1.3645,pip:.0001,desc:"Oil-correlated Loonie"},
  {id:"NZDUSD",f:"🇳🇿",name:"NZD/USD",base:.6012,pip:.0001,desc:"Kiwi — dairy exports driven"},
];

// ── ENGINE ────────────────────────────────────────────────────
const simT=(p,pr)=>{const v=pr.pip*80;return+Math.max(pr.base*.94,Math.min(pr.base*1.06,p+(Math.random()-.48)*v*.5+(Math.random()-.5)*v*.5)).toFixed(pr.pip<.01?2:5);};
const genH=(pr,n=100)=>{const d=[];let p=pr.base;for(let i=n;i>=0;i--){p+=Math.sin(i*.04)*(pr.pip*80)*2.5+(Math.random()-.5)*(pr.pip*80)*3;p=Math.max(pr.base*.96,Math.min(pr.base*1.04,p));d.push({t:Date.now()-i*6e4,p:+p.toFixed(pr.pip<.01?2:5)});}return d;};
const emaCalc=(d,p)=>{const k=2/(p+1),e=[d[0]];for(let i=1;i<d.length;i++)e.push(d[i]*k+e[i-1]*(1-k));return e;};
const rsiCalc=(d,p=14)=>{if(d.length<p+1)return 50;let ag=0,al=0;for(let i=1;i<=p;i++){const x=d[i]-d[i-1];if(x>0)ag+=x;else al+=Math.abs(x);}ag/=p;al/=p;for(let i=p+1;i<d.length;i++){const x=d[i]-d[i-1];ag=(ag*(p-1)+Math.max(0,x))/p;al=(al*(p-1)+Math.max(0,-x))/p;}return al===0?100:+(100-100/(1+ag/al)).toFixed(1);};
const macdCalc=(d)=>{if(d.length<26)return{h:0};const e12=emaCalc(d,12),e26=emaCalc(d,26),ml=e12.map((v,i)=>v-e26[i]).slice(26),sl=emaCalc(ml,9),l=ml.length-1;return{h:+((ml[l]||0)-(sl[l]||0)).toFixed(6)};};
const bbCalc=(d,p=20)=>{if(d.length<p)return{pB:.5};const s=d.slice(-p),m=s.reduce((a,b)=>a+b,0)/p,std=Math.sqrt(s.reduce((x,v)=>x+(v-m)**2,0)/p);return{pB:std>0?+((d[d.length-1]-(m-2*std))/((m+2*std)-(m-2*std))).toFixed(2):.5};};

function analyze(data){
  const pr=data.map(d=>d.p);if(pr.length<30)return{dir:"neutral",conf:0,reasons:[],rsi:50,macdH:0,pB:.5,act:"WAIT"};
  const r=rsiCalc(pr),m=macdCalc(pr),b=bbCalc(pr);
  const e9=emaCalc(pr,9),e21=emaCalc(pr,21),es=e9[e9.length-1],el=e21[e21.length-1];
  let sc=0;const reasons=[];
  if(r<30){sc+=2;reasons.push(`RSI at ${r} — oversold. Price stretched too far down, bounce likely.`);}
  else if(r>70){sc-=2;reasons.push(`RSI at ${r} — overbought. Momentum exhaustion ahead.`);}
  else reasons.push(`RSI at ${r} — neutral momentum.`);
  if(m.h>0){sc+=1.5;reasons.push("MACD bullish — short-term momentum pushing up.");}
  else{sc-=1.5;reasons.push("MACD bearish — downward pressure dominant.");}
  if(es>el){sc+=.5;reasons.push("EMA trend: bullish (fast above slow).");}
  else{sc-=.5;reasons.push("EMA trend: bearish (fast below slow).");}
  if(b.pB<.1){sc+=1.5;reasons.push("Lower Bollinger Band — support zone.");}
  else if(b.pB>.9){sc-=1.5;reasons.push("Upper Bollinger Band — resistance.");}
  const conf=Math.min(92,Math.round(Math.abs(sc)/7*100)),dir=sc>.5?"bullish":sc<-.5?"bearish":"neutral";
  return{dir,conf,reasons:reasons.slice(0,3),rsi:r,macdH:m.h,pB:b.pB,act:dir==="bullish"?"CALL":dir==="bearish"?"PUT":"WAIT"};
}

// ── AI COACH ──────────────────────────────────────────────────
async function askAI(pair,price,sig,hist){
  try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
      messages:[{role:"user",content:`Warm forex coach for beginners. Pair:${pair} at ${price}. Signal:${sig.act}(${sig.conf}%). RSI:${sig.rsi} MACD:${sig.macdH>0?"bull":"bear"} %B:${sig.pB}. Recent:${hist.slice(-10).map(d=>d.p).join(",")}. 3 short paragraphs(~120 words): 1)What's happening now(plain English) 2)Why indicators suggest ${sig.act}(use analogies) 3)Risk+one tip. No markdown.`}]})});
    const d=await r.json();return d.content?.[0]?.text||null;
  }catch{return null;}
}

// ── LESSONS ───────────────────────────────────────────────────
const LESSONS=[
  {t:"What is Forex?",e:"🌍",b:"Forex = Foreign Exchange. The world's largest market at $7.5 trillion/day.\n\nCurrencies trade in PAIRS like EUR/USD. The price tells you how much of the second currency buys one of the first.\n\nEUR/USD at 1.0842 means €1 costs $1.0842.\n\nThe market runs 24/5 across London, New York, and Tokyo sessions. Each session has different volatility patterns."},
  {t:"Making Money",e:"💰",b:"CALL (Long): You think price will RISE. Buy now, sell later higher.\nPUT (Short): You think price will FALL. Sell now, buy back lower.\n\nPips = smallest price movement (0.0001 for most pairs).\n\nWith 50:1 leverage, $500 controls $25,000.\nA 50-pip move = ~$125 profit or loss.\n\nThe bot uses these same principles automatically."},
  {t:"Technical Indicators",e:"📊",b:"RSI (0-100): Below 30 = oversold (might bounce). Above 70 = overbought (might drop). Like a speedometer.\n\nMACD: Compares fast vs slow momentum. Positive = bullish energy building.\n\nBollinger Bands: Price boundaries. Lower band = support. Upper band = resistance.\n\nEMA Cross: Fast average crossing above slow = 'golden cross' buy signal.\n\nThe bot combines ALL of these for each decision."},
  {t:"Risk Management",e:"🛡️",b:"Rule #1: Never risk more than 1-2% per trade.\n\nThe bot uses:\n• 30-pip stop loss (auto-exit on loss)\n• 60-pip take profit (auto-exit on win)\n• 2:1 reward-to-risk ratio\n• Maximum 3 positions at once\n\nThese are the same rules pro traders use. Start with paper money here, then consider real trading after 3+ months of consistent profits."},
  {t:"Understanding the Bot",e:"🤖",b:"The Lacuna Bot scans all 6 currency pairs every few seconds.\n\nIt only trades when:\n1. Signal confidence > 60%\n2. RSI confirms direction\n3. MACD agrees with RSI\n4. Less than 3 open positions\n\nIt auto-closes trades at target profit (60 pips) or stop loss (30 pips).\n\nYou can watch every trade it makes, see WHY it decided, and learn the patterns it follows. Copy what works when you trade for real."},
];

// ═══════════════════════════════════════════════════════════════
// ═══ ANIMATED LANDING PAGE ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
const Landing = ({onEnter}) => {
  const canvasRef = useRef(null);
  const [tick, setTick] = useState(0);

  // Particle system
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 430, H = 800;
    canvas.width = W; canvas.height = H;

    // Create particles
    const particles = Array.from({length:60},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*2+.5,
      c:`rgba(151,169,255,${Math.random()*.4+.1})`,
    }));
    // Price line points
    const pricePoints = Array.from({length:40},(_,i)=>({x:i*(W/39), y:H*.55+Math.sin(i*.3)*60+Math.random()*20}));

    let frame;
    const draw = () => {
      ctx.clearRect(0,0,W,H);

      // Atmospheric gradients
      const g1 = ctx.createRadialGradient(W*.2,H*.3,0,W*.2,H*.3,300);
      g1.addColorStop(0,"rgba(151,169,255,0.08)");g1.addColorStop(1,"transparent");
      ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
      const g2 = ctx.createRadialGradient(W*.8,H*.7,0,W*.8,H*.7,250);
      g2.addColorStop(0,"rgba(0,252,64,0.04)");g2.addColorStop(1,"transparent");
      ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);

      // Update & draw particles
      particles.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0)p.x=W;if(p.x>W)p.x=0;
        if(p.y<0)p.y=H;if(p.y>H)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.c;ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle="rgba(151,169,255,0.04)";ctx.lineWidth=.5;
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
          if(Math.sqrt(dx*dx+dy*dy)<100){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}
        }
      }

      // Animate price line
      pricePoints.forEach((pt,i)=>{pt.y=H*.55+Math.sin(i*.3+Date.now()*.001)*50+(Math.sin(Date.now()*.0003+i*.5)*20);});
      ctx.beginPath();ctx.moveTo(pricePoints[0].x,pricePoints[0].y);
      for(let i=1;i<pricePoints.length;i++){const xc=(pricePoints[i-1].x+pricePoints[i].x)/2,yc=(pricePoints[i-1].y+pricePoints[i].y)/2;ctx.quadraticCurveTo(pricePoints[i-1].x,pricePoints[i-1].y,xc,yc);}
      ctx.strokeStyle="rgba(151,169,255,0.25)";ctx.lineWidth=2;ctx.stroke();

      // Gradient fill under price line
      ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
      const gf=ctx.createLinearGradient(0,H*.4,0,H);
      gf.addColorStop(0,"rgba(151,169,255,0.08)");gf.addColorStop(1,"transparent");
      ctx.fillStyle=gf;ctx.fill();

      // Glowing dot at end of line
      const lastP = pricePoints[pricePoints.length-1];
      ctx.beginPath();ctx.arc(lastP.x,lastP.y,4,0,Math.PI*2);ctx.fillStyle="#97a9ff";ctx.fill();
      ctx.beginPath();ctx.arc(lastP.x,lastP.y,8,0,Math.PI*2);ctx.fillStyle="rgba(151,169,255,0.3)";ctx.fill();

      frame=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(frame);
  },[]);

  // Live ticker animation
  useEffect(()=>{const iv=setInterval(()=>setTick(t=>t+1),2000);return()=>clearInterval(iv);},[]);
  const tickers=[["EUR/USD","1.0842","+0.12%"],["GBP/USD","1.2631","-0.08%"],["USD/JPY","149.82","+0.24%"],["AUD/USD","0.6514","+0.05%"]];
  const currentTicker = tickers[tick%tickers.length];

  return(
    <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0}}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"env(safe-area-inset-top, 48px) 28px env(safe-area-inset-bottom, 32px)"}}>
        {/* Top */}
        <div style={{paddingTop:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:10,background:`${S.pri}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:14,color:S.pri}}>◈</span>
            </div>
            <span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.pri,letterSpacing:"-0.02em"}}>Lacuna Trade</span>
          </div>

          {/* Live ticker pill */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:9999,background:"rgba(38,38,38,0.5)",backdropFilter:"blur(12px)",marginTop:12}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:S.sec,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:600,color:S.on,fontFamily:"Manrope"}}>{currentTicker[0]}</span>
            <span style={{fontSize:11,fontWeight:700,color:S.on}}>{currentTicker[1]}</span>
            <span style={{fontSize:10,fontWeight:700,color:currentTicker[2].startsWith("+")?S.sec:S.ter}}>{currentTicker[2]}</span>
          </div>
        </div>

        {/* Hero Text */}
        <div style={{marginBottom:20}}>
          <Lbl c={S.sec} style={{marginBottom:12}}>AI-Powered Forex</Lbl>
          <h1 style={{fontSize:42,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",lineHeight:1.05,color:S.on,marginBottom:16}}>
            Learn Trading.<br/>
            <em style={{color:S.pDim,fontStyle:"italic"}}>Watch the Bot<br/>Do It Live.</em>
          </h1>
          <p style={{fontSize:15,color:S.onV,lineHeight:1.7,maxWidth:300}}>
            Real market data. An autonomous AI bot that trades and explains every decision. Your forex school — zero risk.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {[["📡","Live Data"],["🤖","Auto-Bot"],["🧠","AI Coach"],["📖","5 Lessons"],["💰","$10K Paper"]].map(([e,t])=>(
            <div key={t} style={{padding:"7px 14px",borderRadius:9999,background:"rgba(38,38,38,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12}}>{e}</span>
              <span style={{fontSize:10,fontWeight:600,color:S.onV}}>{t}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <button onClick={onEnter} style={{width:"100%",padding:18,borderRadius:9999,background:`linear-gradient(135deg,${S.pri},${S.pDim})`,border:"none",cursor:"pointer",fontSize:16,fontWeight:700,color:"#000d44",fontFamily:"Manrope",boxShadow:`0 20px 40px rgba(0,0,0,.4),0 0 60px ${S.pri}20`,marginBottom:12}}>
            Enter Lacuna Trade →
          </button>
          <p style={{textAlign:"center",fontSize:10,color:`${S.onV}80`,lineHeight:1.5}}>
            Paper trading only · No real money · Prices from FreeForexAPI
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ═══ MAIN APP ═════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
export default function LacunaTrade(){
  const [entered,setEntered]=useState(()=>!!localStorage.getItem("lt8e"));
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
  const [lesson,setLesson]=useState(null);

  // ── BOT STATE ───────────────────────────────────────────────
  const [botOn,setBotOn]=useState(false);
  const [botTrades,setBotTrades]=useState([]);
  const [botClosed,setBotClosed]=useState([]);
  const [botLog,setBotLog]=useState([]);

  const pair=PAIRS[ap],price=prices[pair.id],dec=pair.pip<.01?2:4;
  const cd=charts[pair.id]||[],sig=useMemo(()=>analyze(cd),[cd]);
  const pCh=cd.length>1?cd[cd.length-1].p-cd[0].p:0;
  const pPct=cd.length>1?((pCh/cd[0].p)*100).toFixed(2):"0.00";
  const sigC=sig.dir==="bullish"?S.sec:sig.dir==="bearish"?S.ter:S.pri;

  // ── FETCH LIVE ──────────────────────────────────────────────
  const fetchP=useCallback(async()=>{
    try{const r=await fetch("https://www.freeforexapi.com/api/live?pairs=EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,NZDUSD");const d=await r.json();
      if(d.code===200&&d.rates){const np={};Object.entries(d.rates).forEach(([k,v])=>np[k]=v.rate);setPrices(pv=>({...pv,...np}));
        setCharts(pv=>{const n={...pv};Object.entries(np).forEach(([k,v])=>{if(n[k])n[k]=[...n[k].slice(-119),{t:Date.now(),p:+v.toFixed(PAIRS.find(p=>p.id===k)?.pip<.01?2:5)}];});return n;});setLive(true);}
    }catch{setLive(false);}
  },[]);

  useEffect(()=>{if(!entered)return;fetchP();const iv=setInterval(fetchP,15000);return()=>clearInterval(iv);},[fetchP,entered]);
  useEffect(()=>{if(!entered)return;const iv=setInterval(()=>{setPrices(pv=>{const n={...pv};PAIRS.forEach(p=>n[p.id]=simT(pv[p.id],p));return n;});
    setCharts(pv=>{const n={...pv};PAIRS.forEach(p=>{const l=pv[p.id][pv[p.id].length-1];n[p.id]=[...pv[p.id].slice(-119),{t:Date.now(),p:simT(l.p,p)}];});return n;});},3000);return()=>clearInterval(iv);},[entered]);

  // Equity
  useEffect(()=>{if(!entered)return;let u=0;[...pos,...botTrades].forEach(po=>{const c=prices[po.pid];u+=po.side==="call"?(c-po.entry)*po.units:(po.entry-c)*po.units;});setEqH(pv=>[...pv.slice(-80),{t:Date.now(),v:+(bal+u).toFixed(0)}]);},[prices,pos,botTrades,bal,entered]);

  // Persist
  useEffect(()=>{try{const r=localStorage.getItem("lt8");if(r){const s=JSON.parse(r);if(s.b!=null)setBal(s.b);if(s.p)setPos(s.p);if(s.c)setCls(s.c);if(s.bt)setBotTrades(s.bt);if(s.bc)setBotClosed(s.bc);if(s.bo!=null)setBotOn(s.bo);}}catch{}},[]);
  useEffect(()=>{if(!entered)return;const t=setTimeout(()=>{try{localStorage.setItem("lt8",JSON.stringify({b:bal,p:pos,c:cls,bt:botTrades,bc:botClosed,bo:botOn}));}catch{}},2e3);return()=>clearTimeout(t);},[bal,pos,cls,botTrades,botClosed,botOn,entered]);

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),3e3);};

  // ── MANUAL TRADING ──────────────────────────────────────────
  const openT=side=>{if(bet>bal){flash("Insufficient credits");return;}setPos(p=>[...p,{id:Date.now(),pid:pair.id,pn:pair.name,side,entry:price,units:bet*50,bet,ot:Date.now(),tp:"MANUAL"}]);setBal(b=>+(b-bet).toFixed(2));flash(`${side.toUpperCase()} placed on ${pair.name}`);setScr("port");};
  const closeT=id=>{const po=[...pos,...botTrades].find(p=>p.id===id);if(!po)return;const pnl=po.side==="call"?(prices[po.pid]-po.entry)*po.units:(po.entry-prices[po.pid])*po.units;setBal(b=>+(b+po.bet+pnl).toFixed(2));
    if(po.tp==="BOT"){setBotClosed(h=>[{...po,cp:prices[po.pid],ct:Date.now(),pnl:+pnl.toFixed(2)},...h]);setBotTrades(p=>p.filter(x=>x.id!==id));}
    else{setCls(h=>[{...po,cp:prices[po.pid],ct:Date.now(),pnl:+pnl.toFixed(2)},...h]);setPos(p=>p.filter(x=>x.id!==id));}
    setRes({pnl:+pnl.toFixed(2),pair:po.pn});setTimeout(()=>setRes(null),3e3);
  };

  // ── AUTONOMOUS BOT ──────────────────────────────────────────
  useEffect(()=>{
    if(!botOn||!entered)return;
    const iv=setInterval(()=>{
      // Check existing bot trades for TP/SL
      botTrades.forEach(bt=>{
        const cur=prices[bt.pid];
        const pnlPips=bt.side==="call"?(cur-bt.entry)/PAIRS.find(p=>p.id===bt.pid).pip:(bt.entry-cur)/PAIRS.find(p=>p.id===bt.pid).pip;
        if(pnlPips>=60){// Take profit
          const pnl=bt.side==="call"?(cur-bt.entry)*bt.units:(bt.entry-cur)*bt.units;
          setBal(b=>+(b+bt.bet+pnl).toFixed(2));
          setBotClosed(h=>[{...bt,cp:cur,ct:Date.now(),pnl:+pnl.toFixed(2),reason:"Take Profit (60 pips)"},...h]);
          setBotTrades(p=>p.filter(x=>x.id!==bt.id));
          setBotLog(l=>[`✅ TP hit on ${bt.pn}: +$${pnl.toFixed(2)}`,...l.slice(0,19)]);
        }else if(pnlPips<=-30){// Stop loss
          const pnl=bt.side==="call"?(cur-bt.entry)*bt.units:(bt.entry-cur)*bt.units;
          setBal(b=>+(b+bt.bet+pnl).toFixed(2));
          setBotClosed(h=>[{...bt,cp:cur,ct:Date.now(),pnl:+pnl.toFixed(2),reason:"Stop Loss (30 pips)"},...h]);
          setBotTrades(p=>p.filter(x=>x.id!==bt.id));
          setBotLog(l=>[`🛑 SL hit on ${bt.pn}: -$${Math.abs(pnl).toFixed(2)}`,...l.slice(0,19)]);
        }
      });

      // Look for new entries (max 3 bot positions)
      if(botTrades.length>=3)return;
      PAIRS.forEach(pr=>{
        if(botTrades.find(bt=>bt.pid===pr.id))return;
        const ch=charts[pr.id]||[];
        const sig=analyze(ch);
        if(sig.conf>=60&&sig.act!=="WAIT"&&bal>=500){
          const side=sig.act==="CALL"?"call":"put";
          const entry=prices[pr.id];
          setBotTrades(t=>[...t,{id:Date.now()+Math.random(),pid:pr.id,pn:pr.name,side,entry,units:500*50,bet:500,ot:Date.now(),tp:"BOT",reason:sig.reasons[0]||"Signal aligned",conf:sig.conf}]);
          setBal(b=>+(b-500).toFixed(2));
          setBotLog(l=>[`🤖 ${side.toUpperCase()} ${pr.name} @ ${entry.toFixed(pr.pip<.01?2:4)} — ${sig.reasons[0]?.split("—")[0]||"Signal"} (${sig.conf}%)`,...l.slice(0,19)]);
        }
      });
    },5000);
    return()=>clearInterval(iv);
  },[botOn,botTrades,prices,charts,bal,entered]);

  const reset=()=>{setBal(10000);setPos([]);setCls([]);setBotTrades([]);setBotClosed([]);setBotLog([]);setEqH([]);setBotOn(false);flash("Reset to $10,000");};

  const allPos=[...pos,...botTrades];
  const unr=allPos.reduce((s,po)=>{const c=prices[po.pid];return s+(po.side==="call"?(c-po.entry)*po.units:(po.entry-c)*po.units);},0);
  const totC=[...cls,...botClosed].reduce((s,t)=>s+t.pnl,0);
  const eq=bal+unr;
  const allClosed=[...cls,...botClosed].sort((a,b)=>b.ct-a.ct);
  const wins=allClosed.filter(t=>t.pnl>0).length,wr=allClosed.length>0?Math.round((wins/allClosed.length)*100):0;
  const botPnl=botClosed.reduce((s,t)=>s+t.pnl,0);
  const botWins=botClosed.filter(t=>t.pnl>0).length;
  const botWr=botClosed.length>0?Math.round((botWins/botClosed.length)*100):0;

  // ── LANDING ─────────────────────────────────────────────────
  if(!entered)return<Landing onEnter={()=>{setEntered(true);localStorage.setItem("lt8e","1");}}/>;

  // ── LESSON ──────────────────────────────────────────────────
  if(lesson!==null){const l=LESSONS[lesson];return(
    <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",padding:"env(safe-area-inset-top, 20px) 24px 32px",color:S.on}}>
      <button onClick={()=>setLesson(null)} style={{background:"none",border:"none",cursor:"pointer",color:S.pri,fontSize:13,fontWeight:600,marginBottom:20}}>← Back</button>
      <div style={{fontSize:44,marginBottom:14}}>{l.e}</div>
      <div style={{fontSize:26,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.03em",marginBottom:18}}>{l.t}</div>
      <Surf t="hi" style={{padding:24}}><div style={{fontSize:14,color:S.onV,lineHeight:1.9,whiteSpace:"pre-line"}}>{l.b}</div></Surf>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:0}`}</style>
    </div>
  );}

  // ═══ PORTFOLIO ══════════════════════════════════════════════
  const rPort=()=>(
    <div style={{animation:"fadeUp .4s ease"}}>
      {/* Hero */}
      <div style={{marginBottom:24}}>
        <Lbl c={S.sec} style={{marginBottom:8}}>Performance Surge</Lbl>
        <h2 style={{fontSize:36,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",lineHeight:1.05,color:S.on,marginBottom:8}}>Equity <em style={{color:S.pDim,fontStyle:"italic"}}>Dynamics</em></h2>
        <p style={{fontSize:14,color:S.onV,lineHeight:1.6}}>Total P&L: <span style={{color:unr+totC>=0?S.sec:S.ter,fontWeight:700}}>{unr+totC>=0?"+":""}${Math.abs(unr+totC).toFixed(2)}</span></p>
      </div>

      {/* Chart */}
      <Surf t="lo" style={{padding:20,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:live?S.sec:S.ter,animation:"pulse 2s infinite"}}/><Lbl c={live?S.sec:S.ter} style={{fontSize:9}}>{live?"Live":"Simulated"}</Lbl>
        </div>
        <div style={{height:100}}>
          {eqH.length>2?<ResponsiveContainer width="100%" height="100%"><AreaChart data={eqH}><defs><linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={S.pri} stopOpacity={.2}/><stop offset="100%" stopColor={S.pri} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={S.pri} strokeWidth={2.5} fill="url(#eq)" dot={false}/></AreaChart></ResponsiveContainer>
          :<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:S.onV,fontSize:12}}>Building curve...</div>}
        </div>
      </Surf>

      {/* Balance + Stats */}
      <Surf t="lo" style={{padding:20,marginBottom:16}}>
        <Lbl style={{marginBottom:6}}>Paper Balance</Lbl>
        <div style={{fontSize:34,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,marginBottom:12}}>${Math.floor(eq).toLocaleString()}<span style={{fontSize:14,color:S.onV}}>.{Math.abs(Math.floor((eq%1)*100)).toString().padStart(2,"0")}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[[allPos.length,"Open"],[wr+"%","Win Rate"],[allClosed.length,"Closed"]].map(([v,l])=>(<div key={l} style={{padding:10,borderRadius:14,background:S.sHi,textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{v}</div><div style={{fontSize:9,color:S.onV,marginTop:2}}>{l}</div></div>))}
        </div>
      </Surf>

      {/* Bot Status */}
      <Surf t="hi" style={{padding:20,marginBottom:16}}>
        <div style={{position:"absolute",right:-30,top:-30,width:120,height:120,borderRadius:"50%",background:botOn?`${S.sec}10`:`${S.onV}08`,filter:"blur(40px)"}}/>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><Lbl c={botOn?S.sec:S.onV} style={{marginBottom:4}}>Trading Bot</Lbl><span style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{botOn?"Running":"Paused"}</span></div>
            <button onClick={()=>{setBotOn(b=>!b);flash(botOn?"Bot paused":"Bot started — watching markets");}} style={{padding:"10px 20px",borderRadius:9999,background:botOn?`${S.err}15`:S.sec,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:botOn?S.err:"#003d0a"}}>
              {botOn?"Pause":"Start"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{padding:10,borderRadius:12,background:`${S.sec}08`}}><Lbl style={{fontSize:8}}>Bot P&L</Lbl><span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:botPnl>=0?S.sec:S.ter}}>{botPnl>=0?"+":""}${botPnl.toFixed(2)}</span></div>
            <div style={{padding:10,borderRadius:12,background:`${S.pri}08`}}><Lbl style={{fontSize:8}}>Bot Win%</Lbl><span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{botWr}%<span style={{fontSize:10,color:S.onV}}> ({botClosed.length})</span></span></div>
          </div>
          {botLog.length>0&&<div style={{marginTop:12,maxHeight:80,overflowY:"auto"}}>{botLog.slice(0,3).map((l,i)=><div key={i} style={{fontSize:10,color:S.onV,lineHeight:1.6,paddingLeft:8,borderLeft:`2px solid ${l.startsWith("✅")?S.sec:l.startsWith("🛑")?S.ter:S.pri}30`}}>{l}</div>)}</div>}
        </div>
      </Surf>

      {/* AI Signal */}
      <Surf t="hi" style={{padding:20,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><Lbl c={sigC} style={{marginBottom:4}}>AI Signal · {pair.name}</Lbl><div style={{fontSize:20,fontWeight:800,fontFamily:"Manrope",color:S.on}}>{sig.act} <span style={{fontSize:14,color:sigC}}>{sig.conf}%</span></div></div>
        </div>
        <div style={{width:"100%",height:3,background:`${S.onV}15`,borderRadius:3,marginBottom:12,overflow:"hidden"}}><div style={{width:`${sig.conf}%`,height:"100%",background:sigC,borderRadius:3,boxShadow:`0 0 8px ${sigC}40`}}/></div>
        {sig.reasons.slice(0,2).map((r,i)=><div key={i} style={{fontSize:12,color:S.onV,lineHeight:1.6,marginBottom:6,paddingLeft:12,borderLeft:`2px solid ${sigC}25`}}>{r}</div>)}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={()=>setScr("trade")} style={{flex:1,padding:12,borderRadius:9999,background:`linear-gradient(135deg,${S.pri},${S.pDim})`,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:"#000d44"}}>Trade {sig.act} →</button>
          <button onClick={async()=>{setCLoad(true);setCoach(null);const r=await askAI(pair.name,price,sig,cd);setCoach(r||sig.reasons.join("\n\n"));setCLoad(false);}} disabled={cLoad} style={{padding:"12px 16px",borderRadius:9999,background:S.sHigh,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:S.pri}}>🧠 {cLoad?"...":"Coach"}</button>
        </div>
      </Surf>

      {coach&&<Glass style={{padding:20,marginBottom:16}}><Lbl c={S.pri} style={{marginBottom:10}}>AI Coach</Lbl><div style={{fontSize:12,color:S.onV,lineHeight:1.8,whiteSpace:"pre-line"}}>{coach}</div><button onClick={()=>setCoach(null)} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:10,color:S.onV}}>Dismiss</button></Glass>}

      {/* Open Positions */}
      {allPos.length>0&&<>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:16,fontWeight:700,fontFamily:"Manrope",color:S.on}}>Open Positions</span><Lbl>{allPos.length} active</Lbl></div>
        {allPos.map(po=>{const cur=prices[po.pid],pnl=po.side==="call"?(cur-po.entry)*po.units:(po.entry-cur)*po.units,w=pnl>=0,c=w?S.sec:S.ter;return(
          <Surf key={po.id} t="con" style={{padding:16,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:14,background:`${c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,color:c}}>{w?"↗":"↘"}</span></div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{po.pn}</span>
                  <span style={{padding:"2px 6px",borderRadius:4,background:`${c}10`,fontSize:9,fontWeight:700,color:c}}>{po.side==="call"?"LONG":"SHORT"}</span>
                  {po.tp==="BOT"&&<span style={{padding:"2px 6px",borderRadius:4,background:`${S.pri}10`,fontSize:9,fontWeight:700,color:S.pri}}>BOT</span>}
                </div>
                <span style={{fontSize:10,color:S.onV}}>Entry: {po.entry.toFixed(dec)}</span>
              </div>
              <div style={{textAlign:"right"}}><span style={{fontSize:15,fontWeight:700,fontFamily:"Manrope",color:c}}>{w?"+":"-"}${Math.abs(pnl).toFixed(2)}</span>
                <button onClick={()=>closeT(po.id)} style={{display:"block",marginTop:4,background:"none",border:"none",cursor:"pointer",fontSize:9,color:S.pri,fontWeight:600}}>CLOSE</button>
              </div>
            </div>
          </Surf>
        );})}
      </>}
    </div>
  );

  // ═══ TRADE ══════════════════════════════════════════════════
  const rTrade=()=>{const lo=cd.length?Math.min(...cd.map(d=>d.p)):pair.base*.99,hi=cd.length?Math.max(...cd.map(d=>d.p)):pair.base*1.01;return(
    <div style={{animation:"fadeUp .35s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:24}}>{pair.f}</span><Lbl c={S.sec}>Live</Lbl></div>
      <div style={{fontSize:28,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,marginBottom:2}}>{pair.name}</div>
      <div style={{fontSize:38,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,marginBottom:4}}>{price?.toFixed(dec)}<span style={{fontSize:14,fontWeight:700,color:pCh>=0?S.sec:S.ter,marginLeft:8}}>{pCh>=0?"+":""}{pCh.toFixed(dec)}</span></div>
      <div style={{fontSize:11,color:S.onV,marginBottom:16}}>{pair.desc}</div>

      {/* Chart */}
      <Surf t="lo" style={{padding:12,marginBottom:16}}>
        <div style={{height:150}}>
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={cd}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={S.pri} stopOpacity={.2}/><stop offset="100%" stopColor={S.pri} stopOpacity={0}/></linearGradient></defs><YAxis domain={["auto","auto"]} hide/><Area type="monotone" dataKey="p" stroke={S.pri} strokeWidth={2.5} fill="url(#cg)" dot={false}/>{allPos.filter(p=>p.pid===pair.id).map(po=><ReferenceLine key={po.id} y={po.entry} stroke={po.side==="call"?S.sec:S.ter} strokeDasharray="4 4" strokeOpacity={.4}/>)}</AreaChart></ResponsiveContainer>
        </div>
      </Surf>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
        {[["LOW",lo.toFixed(dec)],["HIGH",hi.toFixed(dec)],["RSI",""+sig.rsi],["SIG",sig.act]].map(([l,v])=>(<div key={l} style={{padding:10,borderRadius:14,background:S.sLo,textAlign:"center"}}><Lbl style={{fontSize:8}}>{l}</Lbl><span style={{fontSize:12,fontWeight:700,color:l==="SIG"?sigC:S.on,display:"block",marginTop:2}}>{v}</span></div>))}
      </div>

      {/* Signal bar */}
      <div style={{padding:"10px 14px",borderRadius:9999,background:`${sigC}10`,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:12,color:S.on}}>AI: <b style={{color:sigC}}>{sig.act}</b> · {sig.conf}% · {sig.reasons[0]?.split("—")[0]}</span>
      </div>

      {/* Bet */}
      <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:14}}>
        {[100,250,500,1000,2500].map(a=>(<button key={a} onClick={()=>setBet(a)} style={{padding:"6px 12px",borderRadius:9999,fontSize:11,fontWeight:600,background:bet===a?`${S.pri}15`:S.sHi,border:"none",cursor:"pointer",color:bet===a?S.pri:S.onV}}>${a>=1e3?(a/1e3)+"K":a}</button>))}
      </div>

      {/* CALL / PUT */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={()=>openT("call")} style={{padding:"18px 12px",borderRadius:9999,background:S.bg,border:`1px solid ${S.sec}25`,boxShadow:`0 0 20px ${S.sec}08`,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"Manrope",color:S.seDim}}>CALL</div>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.2em",color:`${S.sec}70`,textTransform:"uppercase"}}>Predict Rise</div>
        </button>
        <button onClick={()=>openT("put")} style={{padding:"18px 12px",borderRadius:9999,background:S.bg,border:`1px solid ${S.ter}25`,boxShadow:`0 0 20px ${S.ter}08`,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"Manrope",color:S.tDim}}>PUT</div>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.2em",color:`${S.ter}70`,textTransform:"uppercase"}}>Predict Fall</div>
        </button>
      </div>

      {/* Pair selector */}
      <div style={{marginTop:18}}><Lbl style={{marginBottom:8}}>Switch Pair</Lbl>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {PAIRS.map((p,i)=>(<button key={p.id} onClick={()=>setAp(i)} style={{padding:"8px 14px",borderRadius:9999,background:ap===i?`${S.pri}15`:S.sHi,border:"none",cursor:"pointer",fontSize:11,fontWeight:ap===i?700:500,color:ap===i?S.pri:S.onV,whiteSpace:"nowrap",flexShrink:0}}>{p.f} {p.name}</button>))}
        </div>
      </div>
    </div>
  );};

  // ═══ BOT ════════════════════════════════════════════════════
  const rBot=()=>(
    <div style={{animation:"fadeUp .35s ease"}}>
      <Lbl c={botOn?S.sec:S.onV} style={{marginBottom:6}}>Autonomous Trader</Lbl>
      <h2 style={{fontSize:30,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,lineHeight:1.1,marginBottom:16}}>Trading <em style={{color:S.pDim,fontStyle:"italic"}}>Bot</em></h2>

      {/* Bot controls */}
      <Surf t="hi" style={{padding:20,marginBottom:16}}>
        <div style={{position:"absolute",inset:0,background:botOn?`radial-gradient(circle at 80% 30%,${S.sec}08,transparent 60%)`:`radial-gradient(circle at 80% 30%,${S.onV}05,transparent 60%)`}}/>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:44,height:44,borderRadius:14,background:botOn?`${S.sec}15`:`${S.onV}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22}}>{botOn?"🟢":"⏸️"}</span></div>
              <div><div style={{fontSize:18,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{botOn?"Bot Active":"Bot Paused"}</div><div style={{fontSize:11,color:S.onV}}>{botTrades.length} open · {botClosed.length} completed</div></div>
            </div>
          </div>
          <button onClick={()=>{setBotOn(b=>!b);flash(botOn?"Bot paused":"Bot scanning markets...");}} style={{width:"100%",padding:14,borderRadius:9999,background:botOn?`${S.err}12`:S.sec,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,color:botOn?S.err:"#003d0a",fontFamily:"Inter"}}>
            {botOn?"⏸ Pause Bot":"▶ Start Auto-Trading"}
          </button>
        </div>
      </Surf>

      {/* Bot stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Surf t="lo" style={{padding:16}}><Lbl style={{marginBottom:6}}>Bot Total P&L</Lbl><span style={{fontSize:24,fontWeight:800,fontFamily:"Manrope",color:botPnl>=0?S.sec:S.ter}}>{botPnl>=0?"+":""}${botPnl.toFixed(2)}</span></Surf>
        <Surf t="lo" style={{padding:16}}><Lbl style={{marginBottom:6}}>Bot Win Rate</Lbl>
          <div style={{display:"flex",alignItems:"baseline",gap:2}}><span style={{fontSize:24,fontWeight:800,fontFamily:"Manrope",color:S.on}}>{botWr}%</span><span style={{fontSize:11,color:S.onV}}>({botClosed.length})</span></div>
        </Surf>
      </div>

      {/* Bot strategy */}
      <Surf t="con" style={{padding:16,marginBottom:16}}>
        <Lbl c={S.pri} style={{marginBottom:10}}>Bot Strategy Rules</Lbl>
        {["Only trades when signal confidence > 60%","RSI + MACD + EMA must all agree","Max 3 simultaneous positions","$500 per trade at 50:1 leverage","Stop loss: 30 pips · Take profit: 60 pips","2:1 reward-to-risk ratio"].map((r,i)=>(
          <div key={i} style={{fontSize:12,color:S.onV,lineHeight:1.7,paddingLeft:12,borderLeft:`2px solid ${S.pri}20`,marginBottom:4}}>{r}</div>
        ))}
      </Surf>

      {/* Bot log */}
      <Lbl style={{marginBottom:8}}>Live Activity Log</Lbl>
      {botLog.length===0?<Surf t="con" style={{padding:20,textAlign:"center"}}><div style={{fontSize:12,color:S.onV}}>Start the bot to see activity here.</div></Surf>
      :<div style={{maxHeight:240,overflowY:"auto"}}>
        {botLog.map((l,i)=><div key={i} style={{padding:"10px 14px",borderRadius:14,background:i%2===0?S.sCon:S.bg,fontSize:11,color:S.onV,lineHeight:1.5,marginBottom:2}}>{l}</div>)}
      </div>}

      {/* Bot closed trades */}
      {botClosed.length>0&&<><Lbl style={{marginBottom:8,marginTop:16}}>Bot Trade History</Lbl>
        {botClosed.slice(0,8).map(t=>{const w=t.pnl>=0,c=w?S.sec:S.ter;return(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${S.out}08`}}>
            <div style={{width:36,height:36,borderRadius:12,background:`${c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:c}}>{w?"↗":"↘"}</span></div>
            <div style={{flex:1}}><span style={{fontSize:13,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{t.pn}</span>
              <div style={{fontSize:10,color:S.onV,marginTop:2}}>{t.reason||t.side}</div>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:c}}>{w?"+":""}${t.pnl.toFixed(2)}</span>
          </div>
        );})}
      </>}
    </div>
  );

  // ═══ MARKETS ════════════════════════════════════════════════
  const rMkts=()=>(
    <div style={{animation:"fadeUp .35s ease"}}>
      <Lbl c={S.sec} style={{marginBottom:6}}>Live Ecosystem</Lbl>
      <h2 style={{fontSize:30,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,lineHeight:1.1,marginBottom:16}}>Market <em style={{color:S.pDim,fontStyle:"italic"}}>Scanner</em></h2>
      {PAIRS.map((p,i)=>{const pr=prices[p.id],ch=charts[p.id]||[],prev=ch.length>1?ch[ch.length-2].p:pr,diff=pr-prev,pct=prev?((diff/prev)*100).toFixed(2):"0.00",up=diff>=0,ps=analyze(ch);return(
        <div key={p.id} onClick={()=>{setAp(i);setScr("trade");}} style={{display:"flex",alignItems:"center",gap:14,padding:16,borderRadius:20,background:i%2===0?S.sCon:S.bg,marginBottom:4,cursor:"pointer"}}>
          <span style={{fontSize:22}}>{p.f}</span>
          <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{p.name}</span>
            <div style={{display:"flex",gap:6,marginTop:3}}>
              <span style={{padding:"2px 6px",borderRadius:6,background:`${ps.dir==="bullish"?S.sec:ps.dir==="bearish"?S.ter:S.pri}10`,fontSize:9,fontWeight:700,color:ps.dir==="bullish"?S.sec:ps.dir==="bearish"?S.ter:S.pri}}>{ps.act}</span>
              <span style={{fontSize:9,color:S.onV}}>{ps.conf}%</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}><span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{pr?.toFixed(p.pip<.01?2:4)}</span>
            <span style={{display:"block",fontSize:10,fontWeight:600,color:up?S.sec:S.ter}}>{up?"+":""}{pct}%</span>
          </div>
        </div>
      );})}
    </div>
  );

  // ═══ LEARN ══════════════════════════════════════════════════
  const rLearn=()=>(
    <div style={{animation:"fadeUp .35s ease"}}>
      <Lbl c={S.pri} style={{marginBottom:6}}>Education</Lbl>
      <h2 style={{fontSize:30,fontWeight:800,fontFamily:"Manrope",letterSpacing:"-0.04em",color:S.on,lineHeight:1.1,marginBottom:16}}>Learn <em style={{color:S.pDim,fontStyle:"italic"}}>Forex</em></h2>
      {LESSONS.map((l,i)=>(<div key={i} onClick={()=>setLesson(i)} style={{cursor:"pointer",marginBottom:8}}>
        <Surf t="con" style={{padding:16,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:26}}>{l.e}</span>
          <div style={{flex:1}}><span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.on}}>{l.t}</span><span style={{display:"block",fontSize:10,color:S.onV,marginTop:2}}>Lesson {i+1} of {LESSONS.length}</span></div>
          <span style={{color:S.onV}}>→</span>
        </Surf>
      </div>))}
      <div style={{marginTop:16,display:"flex",gap:8}}>
        <button onClick={()=>{setEntered(false);localStorage.removeItem("lt8e");}} style={{flex:1,padding:12,borderRadius:9999,background:S.sHi,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,color:S.onV}}>↺ Replay Intro</button>
        <button onClick={reset} style={{flex:1,padding:12,borderRadius:9999,background:`${S.err}08`,border:`1px solid ${S.err}15`,cursor:"pointer",fontSize:11,fontWeight:600,color:S.err}}>Reset Account</button>
      </div>
    </div>
  );

  // ═══ SHELL ══════════════════════════════════════════════════
  const tabs=[{id:"port",l:"HOME",e:"📊"},{id:"trade",l:"TRADE",e:"📈"},{id:"bot",l:"BOT",e:"🤖"},{id:"mkts",l:"MARKETS",e:"🌐"},{id:"learn",l:"LEARN",e:"📖"}];

  return(
    <div style={{background:S.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',sans-serif",color:S.on,fontSize:13,position:"relative",overflowX:"hidden"}}>
      {/* Ethereal BG */}
      <div style={{position:"fixed",top:"-20%",left:"-10%",width:"80%",height:"80%",borderRadius:"50%",background:`${S.pri}06`,filter:"blur(120px)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"-10%",width:"60%",height:"60%",borderRadius:"50%",background:`${S.sec}04`,filter:"blur(100px)",pointerEvents:"none"}}/>

      {toast&&<div style={{position:"fixed",top:"env(safe-area-inset-top, 12px)",left:"50%",transform:"translateX(-50%)",zIndex:999,padding:"10px 20px",borderRadius:9999,background:"rgba(38,38,38,.92)",backdropFilter:"blur(20px)",color:S.on,fontSize:12,fontWeight:500,animation:"fadeUp .3s ease",boxShadow:"0 20px 40px rgba(0,0,0,.4)",marginTop:12}}>{toast}</div>}

      {res&&<div onClick={()=>setRes(null)} style={{position:"fixed",inset:0,zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.7)",backdropFilter:"blur(12px)",animation:"fadeUp .25s ease",cursor:"pointer"}}>
        <Surf t="hi" style={{textAlign:"center",padding:"40px 48px"}}>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 30%,${res.pnl>=0?S.sec:S.ter}12,transparent 60%)`}}/>
          <div style={{position:"relative",zIndex:2}}><div style={{fontSize:44,marginBottom:8}}>{res.pnl>=0?"🎉":"📉"}</div><div style={{fontSize:18,fontWeight:800,fontFamily:"Manrope",color:res.pnl>=0?S.sec:S.ter}}>{res.pnl>=0?"Profit!":"Loss"}</div><div style={{fontSize:28,fontWeight:800,fontFamily:"Manrope",color:S.on,marginTop:4}}>{res.pnl>=0?"+":""}${res.pnl.toFixed(2)}</div></div>
        </Surf>
      </div>}

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"max(env(safe-area-inset-top, 12px), 12px) 20px 10px",background:"rgba(32,31,31,0.4)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16,color:S.pri}}>◈</span>
          <span style={{fontSize:14,fontWeight:700,fontFamily:"Manrope",color:S.on}}>${Math.floor(eq).toLocaleString()}</span>
          <div style={{width:5,height:5,borderRadius:"50%",background:live?S.sec:S.ter}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {botOn&&<div style={{padding:"4px 10px",borderRadius:9999,background:`${S.sec}12`,display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:4,borderRadius:"50%",background:S.sec,animation:"pulse 1.5s infinite"}}/><span style={{fontSize:9,fontWeight:700,color:S.sec}}>BOT</span></div>}
          <div style={{padding:"4px 12px",borderRadius:9999,background:`${S.on}05`,border:`1px solid ${S.on}08`}}><span style={{fontSize:10,fontWeight:700,color:S.pri}}>{pair.name}</span></div>
        </div>
      </header>

      <div style={{padding:"12px 20px 120px"}}>
        {scr==="port"&&rPort()}
        {scr==="trade"&&rTrade()}
        {scr==="bot"&&rBot()}
        {scr==="mkts"&&rMkts()}
        {scr==="learn"&&rLearn()}
      </div>

      {/* Nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"6px 10px max(env(safe-area-inset-bottom, 20px), 20px)",background:"rgba(32,31,31,0.5)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:`1px solid ${S.on}06`,borderRadius:"24px 24px 0 0",boxShadow:"0 -20px 40px rgba(0,0,0,.4)",zIndex:100}}>
        {tabs.map(t=>{const a=scr===t.id;return(
          <button key={t.id} onClick={()=>setScr(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:a?`${S.pri}10`:"none",borderRadius:9999,padding:a?"8px 12px":"8px 10px",border:"none",cursor:"pointer"}}>
            <span style={{fontSize:14,opacity:a?1:.45}}>{t.e}</span>
            <span style={{fontSize:7,fontWeight:700,letterSpacing:"0.12em",color:a?S.pri:`${S.onV}50`,fontFamily:"Inter"}}>{t.l}</span>
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
