# Lacuna Trade

A mobile-first paper trading simulator with the **Ethereal Surge** design system.

## Features
- Simulated forex trading with live price movements  
- 6 major currency pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, NZD/USD)
- CALL/PUT binary trading mechanic  
- Portfolio tracking with equity curve  
- Trade history with win/loss stats  
- AI Trade Signal mockups  
- Market sentiment indicators  

## Tech Stack
- React 18 + Vite  
- Recharts for data visualization  
- Vanilla CSS (no framework) with Manrope + Inter fonts  
- localStorage for state persistence  

## Deploy to Vercel
1. Push to GitHub  
2. Import at [vercel.com/new](https://vercel.com/new)  
3. Deploy — it auto-detects Vite  

## Local Development
```bash
npm install
npm run dev
```

## Design Tokens
- Background: `#0e0e0e`
- Primary: `#97a9ff`
- Secondary (Neon Green): `#00fc40`
- Tertiary (Sunset Orange): `#ff793f`
- Error: `#ff6e84`
- Fonts: Manrope (headlines), Inter (body)
