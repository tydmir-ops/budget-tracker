"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { depo, evKodu } from "../lib/depo";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ==================================================================
   KUR KAYNAĞI — sunucu modu
   Kurlar /api/kurlar rotasından gelir; Anthropic anahtarı yalnız
   sunucuda (Vercel ortam değişkeni) durur, tarayıcıya inmez.
   ================================================================== */
const KUR_KAYNAGI = { mod: "sunucu", url: "/api/kurlar" };

/* ================================================================== */
/*  Tokens                                                             */
/* ================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.kb {
  --bg:      #F2F3F5;
  --card:    #FFFFFF;
  --ink:     #191C1F;
  --muted:   #697077;
  --line:    #E4E7EA;
  --soft:    #EEF0F2;

  --pos:     #17694C;
  --pos-s:   #E7F1EC;
  --neg:     #B8412F;
  --neg-s:   #F9EAE6;
  --warn:    #8A6A14;
  --warn-s:  #F4EEDC;

  --f-num: 'Inter', system-ui, sans-serif;
  --f-b: 'Inter', system-ui, sans-serif;

  background: var(--bg);
  color: var(--ink);
  font-family: var(--f-b);
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  -webkit-font-smoothing: antialiased;
}
.kb * { box-sizing: border-box; }
.kb button { font-family: inherit; cursor: pointer; }
.kb :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.kb-num { font-family: var(--f-num); font-variant-numeric: tabular-nums; font-weight: 600; }

.kb-frame {
  width: 100%;
  max-width: 460px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
.kb-body { flex: 1; padding: 14px 16px 100px; }

/* ---------- hero: defter satırı ---------- */
.kb-hero {
  margin: 10px 16px 0;
  padding: 16px 4px 6px;
}
.kb-hero-top {
  display: flex; justify-content: space-between; align-items: baseline; gap: 10px;
}
.kb-hero-lbl { font-size: 12.5px; font-weight: 500; color: var(--muted); }
.kb-hero-num {
  font-family: var(--f-num);
  font-weight: 700;
  font-size: 34px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.02em;
  line-height: 1.1;
  margin-top: 6px;
  padding: 0;
  background: none; border: none; color: var(--ink);
  display: block; width: 100%; text-align: left;
}
.kb-hero-sub { font-size: 12px; font-weight: 500; color: var(--muted); margin-top: 8px; }
.kb-dots { display: flex; gap: 5px; margin-top: 10px; }
.kb-dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--line); }
.kb-dots i[data-on="1"] { background: var(--pos); }
.kb-pills { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.kb-pill {
  background: var(--card);
  border: none;
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(16,24,40,.05);
  padding: 5px 9px;
  font-size: 11.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.kb-sync { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--muted); white-space: nowrap; }
.kb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--pos); }
.kb-dot[data-s="err"]  { background: var(--neg); }
.kb-dot[data-s="busy"] { background: var(--warn); }

.kb-faces { display: flex; margin-top: 12px; }
.kb-face {
  width: 22px; height: 22px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 11px;
  border: 1px solid var(--line);
  background: var(--card);
  margin-right: -5px;
}

/* ---------- headings: bölüm etiketleri ---------- */
.kb-h {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  margin: 24px 2px 10px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.kb-h span { font-size: 12px; font-weight: 500; color: var(--muted); }
.kb-h em { font-style: normal; margin-left: auto; font-size: 12px; font-weight: 500; color: var(--muted); }
.kb-h:first-child { margin-top: 8px; }

/* ---------- cards ---------- */
.kb-card {
  background: var(--card);
  border: none;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
}
.kb-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  text-align: left;
  width: 100%;
  background: none;
  border-left: none; border-right: none; border-top: none;
}
.kb-row:first-child { padding-top: 2px; }
.kb-row:last-child { border-bottom: none; padding-bottom: 2px; }
.kb-row-main { flex: 1; min-width: 0; }
.kb-row-t { font-size: 14px; font-weight: 600; color: var(--ink); }
.kb-row-s { font-size: 12px; color: var(--muted); margin-top: 2px; font-weight: 500; }
.kb-amt { font-family: var(--f-num); font-weight: 600; font-size: 13.5px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.kb-row[data-sanal="1"] .kb-row-t,
.kb-row[data-sanal="1"] .kb-amt { opacity: .55; }

.kb-tag {
  display: inline-block;
  font-size: 10px; font-weight: 600;
  border-radius: 4px; padding: 2px 5px;
  background: var(--soft); color: var(--muted);
  margin-left: 6px; vertical-align: 1px;
}
.kb-tag[data-t="bekle"] { background: var(--warn-s); color: var(--warn); }
.kb-tag[data-t="kisi"]  { background: var(--soft); color: var(--muted); }

.kb-emoji {
  width: 34px; height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 16px;
  flex-shrink: 0;
}
.kb-emoji[data-sm="1"] { width: 25px; height: 25px; border-radius: 7px; font-size: 12.5px; }

/* ---------- stat tiles ---------- */
.kb-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.kb-tile { background: var(--card); border: none; border-radius: 16px; padding: 12px 14px; box-shadow: 0 1px 3px rgba(16,24,40,.06); }
.kb-tile-l { font-size: 11.5px; font-weight: 600; color: var(--muted); }
.kb-tile-n { font-family: var(--f-num); font-weight: 600; font-size: 18px; margin-top: 6px; font-variant-numeric: tabular-nums; }

/* ---------- runway ---------- */
.kb-runway { display: flex; gap: 4px; height: 150px; padding: 2px 0 0; }
.kb-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: none;
  border: none;
  padding: 0;
  border-radius: 6px;
  position: relative;
}
.kb-up { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
.kb-dn { flex: .55; position: relative; }
.kb-bar { border-radius: 3px 3px 0 0; transition: all .18s ease; min-height: 4px; }
.kb-bar-dn { border-radius: 0 0 3px 3px; background: var(--neg); }
.kb-base { height: 2px; background: var(--line); border-radius: 2px; }
.kb-col[data-on="1"] .kb-base { background: var(--pos); }
.kb-coin { display: none; }
.kb-col-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--muted);
  text-align: center;
  padding-top: 7px;
}
.kb-col[data-on="1"] .kb-col-lbl { color: var(--ink); font-weight: 600; }
.kb-col[data-now="1"] .kb-col-lbl::after {
  content: '';
  display: block;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--pos);
  margin: 3px auto 0;
}

.kb-detail { margin-top: 14px; padding: 12px 14px; border-radius: 10px; background: var(--soft); }
.kb-brk { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.kb-brk span {
  background: var(--card);
  border: none;
  border-radius: 5px;
  padding: 3px 7px;
  font-family: var(--f-num);
  font-size: 10.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

/* ---------- yıl mini bar ---------- */
.kb-yb { display: flex; gap: 4px; height: 96px; align-items: flex-end; }
.kb-yb > div { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
.kb-yb i { display: block; width: 100%; border-radius: 3px 3px 0 0; background: var(--pos); min-height: 3px; }
.kb-yb small { font-size: 9.5px; font-weight: 500; color: var(--muted); }

/* ---------- nav ---------- */
.kb-nav {
  position: sticky;
  bottom: 0;
  margin: 0;
  background: var(--card);
  border-top: 1px solid var(--line);
  display: flex;
  padding: 6px 8px calc(8px + env(safe-area-inset-bottom));
  gap: 2px;
  z-index: 20;
}
.kb-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 2px 4px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: color .15s;
}
.kb-tab[data-on="1"] { color: var(--pos); }
.kb-ic { width: 20px; height: 20px; }

/* ---------- form ---------- */
.kb-field { margin-bottom: 12px; }
.kb-lbl { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
.kb-in {
  width: 100%;
  background: var(--soft);
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--ink);
  font-family: var(--f-b);
  font-weight: 500;
  font-size: 16px;
  padding: 11px 13px;
  outline: none;
  transition: border-color .15s;
}
.kb-in::placeholder { color: #A9B0AC; font-weight: 400; }
.kb-in:focus { border-color: var(--pos); background: var(--card); }
.kb-in[data-num="1"] { font-family: var(--f-num); font-weight: 500; font-variant-numeric: tabular-nums; }
.kb-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.kb-btn {
  width: 100%;
  background: var(--pos);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 13px;
  font-weight: 600;
  font-size: 14.5px;
}
.kb-btn:active { transform: translateY(1px); }
.kb-btn:disabled { opacity: .4; }
.kb-btn-ghost {
  width: 100%;
  background: var(--soft);
  border: none;
  color: var(--ink);
  border-radius: 12px;
  padding: 11px;
  font-weight: 600;
  font-size: 13.5px;
}
.kb-btn-dan { background: var(--neg-s); color: var(--neg); }
.kb-add {
  width: 100%;
  background: var(--card);
  border: none;
  color: var(--pos);
  border-radius: 14px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
}
.kb-add:active { background: var(--soft); }
.kb-icbtn {
  width: 46px; height: 46px;
  border-radius: 12px;
  border: none;
  background: var(--card);
  color: var(--ink);
  display: grid; place-items: center;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
  flex-shrink: 0;
}
.kb-icbtn:active { background: var(--soft); }
.kb-del {
  background: none; border: none;
  color: #B9BFBB;
  font-size: 19px; line-height: 1;
  padding: 4px 0 4px 6px;
}
.kb-del:active { color: var(--neg); }
.kb-mini {
  background: var(--pos-s); border: none; color: var(--pos);
  border-radius: 8px; padding: 6px 10px;
  font-weight: 600; font-size: 12px;
  white-space: nowrap;
}

.kb-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.kb-chip {
  background: var(--soft);
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  display: flex; align-items: center; gap: 5px;
}
.kb-chip[data-on="1"] { background: var(--pos); border-color: var(--pos); color: #fff; }
.kb-chip[data-tone="soft"][data-on="1"] { background: var(--pos-s); color: var(--pos); border-color: transparent; }

/* ---------- toggle ---------- */
.kb-tg {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  background: var(--soft);
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  width: 100%;
  text-align: left;
}
.kb-tg-t { font-size: 13px; font-weight: 600; color: var(--ink); }
.kb-tg-s { font-size: 11.5px; font-weight: 500; color: var(--muted); margin-top: 2px; }
.kb-sw { width: 40px; height: 24px; border-radius: 99px; background: #D9DCDF; position: relative; flex-shrink: 0; transition: background .18s; }
.kb-sw i { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .18s; box-shadow: 0 1px 3px rgba(0,0,0,.18); }
.kb-sw[data-on="1"] { background: var(--pos); }
.kb-sw[data-on="1"] i { transform: translateX(16px); }

/* ---------- month nav ---------- */
.kb-mn {
  display: flex; align-items: center; gap: 6px;
  background: var(--card);
  border: none;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
}
.kb-mn button {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: none;
  background: var(--soft);
  color: var(--ink);
  font-size: 16px; font-weight: 600;
  line-height: 1;
}
.kb-mn button:disabled { opacity: .3; }
.kb-mn div {
  flex: 1; text-align: center;
  font-weight: 600; font-size: 14px;
}
.kb-mn small { display: block; font-size: 10.5px; font-weight: 500; color: var(--muted); }

/* ---------- sheet ---------- */
.kb-ov {
  position: fixed; inset: 0;
  background: rgba(26,29,27,.4);
  z-index: 60;
  display: flex; align-items: flex-end; justify-content: center;
  animation: kbFade .16s ease;
}
.kb-sheet {
  width: 100%; max-width: 460px;
  background: var(--bg);
  border-radius: 18px 18px 0 0;
  padding: 8px 16px calc(20px + env(safe-area-inset-bottom));
  max-height: 90vh; overflow-y: auto;
  animation: kbUp .2s cubic-bezier(.2,.8,.25,1);
}
.kb-grab { width: 36px; height: 4px; border-radius: 99px; background: #D9DCDF; margin: 4px auto 12px; }
.kb-sheet-h {
  display: flex; align-items: center; justify-content: space-between;
  font-weight: 700; font-size: 17px;
  margin-bottom: 14px;
}
.kb-sheet-h button { background: none; border: none; color: var(--muted); font-size: 23px; line-height: 1; padding: 0 2px; }
@keyframes kbUp { from { transform: translateY(20px); opacity: .4 } to { transform: none; opacity: 1 } }
@keyframes kbFade { from { opacity: 0 } to { opacity: 1 } }

/* ---------- toast ---------- */
.kb-toast {
  position: fixed;
  bottom: calc(84px + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%);
  background: var(--ink); color: #fff;
  border-radius: 10px;
  padding: 11px 12px 11px 15px;
  display: flex; align-items: center; gap: 14px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 8px 24px rgba(26,29,27,.28);
  z-index: 70;
  max-width: 90%;
  animation: kbUp .2s ease;
}
.kb-toast button {
  background: none; border: 1px solid rgba(255,255,255,.35);
  color: #fff; font-weight: 600; font-size: 12.5px;
  border-radius: 7px; padding: 6px 10px;
}

.kb-empty {
  text-align: center;
  padding: 24px 18px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  background: var(--card);
  border: none;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(16,24,40,.06);
}

.kb-meter { height: 4px; background: var(--line); border-radius: 99px; margin-top: 7px; overflow: hidden; }
.kb-meter i { display: block; height: 100%; border-radius: 99px; }

.kb-note {
  background: var(--soft);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex; gap: 11px; align-items: center;
}
.kb-donut { position: relative; }
.kb-donut-c {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
}
.kb-donut-c b { font-family: var(--f-num); font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.kb-donut-c span { font-size: 11px; color: var(--muted); font-weight: 500; }

.kb-flow {
  display: flex; align-items: center; gap: 9px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.kb-flow:last-child { border-bottom: none; }
.kb-arrow { color: var(--muted); font-size: 14px; }

@media (prefers-reduced-motion: reduce) {
  .kb *, .kb *::before, .kb *::after { transition: none !important; animation: none !important; }
}
`;

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

const KEY = "ortak-butce-v1";
const AY = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const AY_UZUN = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/* #5 — her yerde tek sayı dönüştürücü. Kayıt anında Number'a çeviriyoruz. */
const sayi = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const BIRIMLER = [
  { kod: "TRY", simge: "₺" },
  { kod: "USD", simge: "$" },
  { kod: "EUR", simge: "€" },
  { kod: "GBP", simge: "£" },
];
const PARA = { simge: "₺" }; // App her render'da d.para ile eşitler

const tl = (n) => {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return (v < 0 ? "−" : "") + PARA.simge + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.abs(v));
};

const kisa = (n) => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + "M";
  if (a >= 1e3) return Math.round(n / 1e3) + "B";
  return String(Math.round(n));
};

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
const ymOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fark = (a, b) => {
  const [ay, am] = String(a).split("-").map(Number);
  const [by, bm] = String(b).split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
};
const ymKaydir = (ym, n) => {
  const [y, m] = ym.split("-").map(Number);
  return ymOf(new Date(y, m - 1 + n, 1));
};
const ymAd = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return { kisa: AY[m - 1], uzun: AY_UZUN[m - 1], yil: y };
};
const ymTarih = (ym) => new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 1);
const bugun = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const ayinSonGunu = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const gunKaldi = (gun) => {
  const b = new Date().getDate();
  const son = ayinSonGunu();
  const g = Math.min(sayi(gun), son); // 31 çekmeyen aylarda ayın son gününe kırp
  if (!g) return null;
  return g >= b ? g - b : son - b + g;
};
const gunAdi = (t) => new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

const RENKLER = ["#146B4A", "#2F5FA6", "#8A6A14", "#A6522E", "#9D3550", "#1F7876", "#6E4FA6", "#556B2F"];
const yumusak = (h) => (h || "#17694C") + "1A";

const AVATARLAR = ["🙂", "😎", "🌷", "🐻", "🦊", "🐼", "🌟", "🍀", "🎩", "🐧", "🦉", "🌸"];
const EMOJILER = ["🛒", "🏠", "💡", "🚌", "🍜", "💊", "✨", "🎁", "👕", "📚", "🐱", "🎬", "✈️", "☕", "💐", "🔧", "📱", "🎓", "👶", "🏋️"];

const VARLIK = [
  { id: "gram", ad: "Gram altın", birim: "gr", kur: "gramAltin", e: "🪙", r: "#8A6A14" },
  { id: "ceyrek", ad: "Çeyrek altın", birim: "adet", kur: "ceyrekAltin", e: "🥇", r: "#96700F" },
  { id: "usd", ad: "Dolar", birim: "$", kur: "usd", e: "💵", r: "#146B4A" },
  { id: "eur", ad: "Euro", birim: "€", kur: "eur", e: "💶", r: "#2F5FA6" },
  { id: "gumus", ad: "Gümüş", birim: "gr", kur: "gumus", e: "⚪", r: "#697077" },
  { id: "btc", ad: "Bitcoin", birim: "BTC", kur: "btc", e: "₿", r: "#C77B1E" },
  { id: "eth", ad: "Ethereum", birim: "ETH", kur: "eth", e: "Ξ", r: "#5B6BC0" },
  { id: "tl", ad: "Mevduat", birim: "₺", kur: "tl", e: "🏦", r: "#191C1F" },
];

const BASLANGIC = {
  surum: 3,
  rev: 0, // yazma çakışması kontrolü için sürüm sayacı
  kisiler: [{ id: "k1", ad: "Ben", e: "🙂", r: "#2F5FA6", pay: 1 }],
  nakit: 0,
  para: "TRY",
  gider: { mod: "oto", deger: 0 },
  ilkAyOranla: true,
  kategoriler: [
    { id: "market", ad: "Market", e: "🛒", r: "#146B4A" },
    { id: "kira", ad: "Kira", e: "🏠", r: "#2F5FA6" },
    { id: "fatura", ad: "Faturalar", e: "💡", r: "#8A6A14" },
    { id: "ulasim", ad: "Ulaşım", e: "🚌", r: "#1F7876" },
    { id: "yeme", ad: "Yeme-içme", e: "🍜", r: "#A6522E" },
    { id: "saglik", ad: "Sağlık", e: "💊", r: "#9D3550" },
    { id: "diger", ad: "Diğer", e: "✨", r: "#6E4FA6" },
  ],
  birikim: [],
  kurlar: { gramAltin: 0, ceyrekAltin: 0, usd: 0, eur: 0, gumus: 0, btc: 0, eth: 0, tl: 1 },
  kurZamani: null,
  harcamalar: [],
  sabitler: [],
  kartlar: [],
  planli: [],
  taksitler: [],
  gelirler: [],
  denklestirmeler: [],
};

/* --- göç: v1 (iki isim, string sayılar) → v3 --- */
function gocur(ham) {
  const d = { ...BASLANGIC, ...(ham || {}) };

  if (!Array.isArray(d.kisiler) || d.kisiler.length === 0) {
    d.kisiler = BASLANGIC.kisiler;
  } else if (typeof d.kisiler[0] === "string") {
    const adlar = d.kisiler;
    d.kisiler = adlar.map((ad, i) => ({
      id: "k" + (i + 1),
      ad: ad || `Kişi ${i + 1}`,
      e: AVATARLAR[i % AVATARLAR.length],
      r: RENKLER[i % RENKLER.length],
      pay: 1,
    }));
    const bul = (ad) => d.kisiler.find((k) => k.ad === ad)?.id || d.kisiler[0].id;
    d.harcamalar = (d.harcamalar || []).map((h) => ({ ...h, kisiId: h.kisiId || bul(h.kim) }));
    d.gelirler = (d.gelirler || []).map((g) => ({ ...g, kisiId: g.kisiId || bul(g.kisi) }));
  }

  d.kisiler = d.kisiler.map((k, i) => ({
    id: k.id || "k" + (i + 1),
    ad: k.ad || `Kişi ${i + 1}`,
    e: k.e || AVATARLAR[i % AVATARLAR.length],
    r: k.r || RENKLER[i % RENKLER.length],
    pay: k.pay === undefined || k.pay === "" ? 1 : sayi(k.pay),
  }));
  const ilk = d.kisiler[0].id;

  /* eski tek sayılık tipikGider → gider.mod=elle */
  if (ham && ham.tipikGider !== undefined && !ham.gider) {
    d.gider = { mod: sayi(ham.tipikGider) > 0 ? "elle" : "oto", deger: sayi(ham.tipikGider) };
  }
  d.gider = { mod: d.gider?.mod === "elle" ? "elle" : "oto", deger: sayi(d.gider?.deger) };
  delete d.tipikGider;

  d.nakit = sayi(d.nakit);
  d.para = BIRIMLER.some((b) => b.kod === d.para) ? d.para : "TRY";
  d.ilkAyOranla = d.ilkAyOranla !== false;

  d.kurlar = Object.fromEntries(
    Object.entries({ ...BASLANGIC.kurlar, ...(d.kurlar || {}) }).map(([k, v]) => [k, sayi(v)])
  );
  d.kurlar.tl = 1;

  d.harcamalar = (d.harcamalar || []).map((h) => ({
    ortak: true, sabitId: null, ...h,
    tutar: sayi(h.tutar),
    kisiId: h.kisiId || ilk,
  }));
  d.sabitler = (d.sabitler || []).map((s) => ({
    ortak: true, bitis: null, ...s,
    tutar: sayi(s.tutar), gun: sayi(s.gun) || 1,
    kisiId: s.kisiId || ilk,
  }));
  d.gelirler = (d.gelirler || []).map((g) => ({ ...g, tutar: sayi(g.tutar), gun: sayi(g.gun) || 1, kisiId: g.kisiId || ilk }));
  d.birikim = (d.birikim || []).map((b) => ({ kisiId: null, ...b, miktar: sayi(b.miktar) }));
  d.kartlar = (d.kartlar || []).map((k) => ({ ...k, borc: sayi(k.borc), gun: sayi(k.gun) || 1 }));
  d.planli = (d.planli || []).map((p) => ({ ...p, tutar: sayi(p.tutar) }));
  d.taksitler = (d.taksitler || []).map((t) => ({ kartId: null, ...t, aylik: sayi(t.aylik), ay: sayi(t.ay) || 1 }));
  d.denklestirmeler = d.denklestirmeler || [];
  d.rev = sayi(d.rev);
  d.surum = 3;
  return d;
}

/* --- sabit gider yardımcıları --- */
const sabitAktif = (s, ym) =>
  fark(s.baslangic || "1970-01", ym) >= 0 && (!s.bitis || fark(ym, s.bitis) >= 0);

/* Bir ayın kayıtları: gerçek girişler + henüz girilmemiş sabitler (sanal) */
function ayKayitlari(d, ym) {
  const gercek = d.harcamalar.filter((h) => String(h.tarih).slice(0, 7) === ym);
  const bekleyen = (d.sabitler || [])
    .filter((s) => sabitAktif(s, ym))
    .filter((s) => !gercek.some((h) => h.sabitId === s.id))
    .map((s) => ({
      id: `v-${s.id}-${ym}`,
      sanal: true,
      sabitId: s.id,
      tutar: sayi(s.tutar),
      kat: s.kat,
      kisiId: s.kisiId,
      tarih: `${ym}-${String(Math.min(Math.max(sayi(s.gun), 1), 28)).padStart(2, "0")}`,
      not: s.baslik,
      ortak: s.ortak !== false,
    }));
  const hepsi = [...gercek, ...bekleyen].sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
  return {
    gercek,
    bekleyen,
    hepsi,
    toplam: hepsi.reduce((t, h) => t + sayi(h.tutar), 0),
    gercekToplam: gercek.reduce((t, h) => t + sayi(h.tutar), 0),
  };
}

const ayAraligi = (d) => {
  const buAy = ymOf(new Date());
  const adaylar = [
    ...d.harcamalar.map((h) => String(h.tarih).slice(0, 7)),
    ...(d.sabitler || []).map((s) => s.baslangic),
  ].filter(Boolean);
  const bas = adaylar.length ? adaylar.sort()[0] : buAy;
  const out = [];
  let cur = bas;
  let guvenlik = 0;
  while (fark(cur, buAy) >= 0 && guvenlik++ < 400) {
    out.push(cur);
    cur = ymKaydir(cur, 1);
  }
  return out;
};

/* ================================================================== */
/*  Icons                                                              */
/* ================================================================== */

const Ic = ({ d }) => (
  <svg className="kb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const IC = {
  ozet: <Ic d={<><path d="M3 13h4l3 7 4-16 3 9h4" /></>} />,
  birikim: <Ic d={<><path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7z" /></>} />,
  harcama: <Ic d={<><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10.5h18M7 15h4" /></>} />,
  plan: <Ic d={<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 11h18" /></>} />,
  ayar: <Ic d={<><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2L17 7M7 17l-1.8 1.8" /></>} />,
};

/* ================================================================== */
/*  Küçük parçalar                                                     */
/* ================================================================== */

const Alan = ({ etiket, ipucu, children }) => (
  <div className="kb-field">
    <label className="kb-lbl">{etiket}</label>
    {children}
    {ipucu && <div className="kb-row-s" style={{ marginTop: 6, lineHeight: 1.55 }}>{ipucu}</div>}
  </div>
);

const Bos = ({ children }) => (
  <div className="kb-empty">{children}</div>
);

const Rozet = ({ e, r, sm }) => (
  <div className="kb-emoji" data-sm={sm ? "1" : "0"} style={{ background: yumusak(r) }}>{e}</div>
);

function Sheet({ acik, kapat, baslik, children }) {
  if (!acik) return null;
  return (
    <div className="kb-ov" onClick={kapat}>
      <div className="kb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="kb-grab" />
        <div className="kb-sheet-h">
          {baslik}
          <button onClick={kapat} aria-label="Kapat">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Ekle({ etiket, baslik, children }) {
  const [acik, setAcik] = useState(false);
  return (
    <>
      <button className="kb-add" onClick={() => setAcik(true)}>＋ {etiket}</button>
      <Sheet acik={acik} kapat={() => setAcik(false)} baslik={baslik || etiket}>
        {children(() => setAcik(false))}
      </Sheet>
    </>
  );
}

const Anahtar = ({ acik, degistir, baslik, alt }) => (
  <button className="kb-tg" role="switch" aria-checked={!!acik} onClick={degistir}>
    <span>
      <span className="kb-tg-t">{baslik}</span>
      {alt && <span className="kb-tg-s" style={{ display: "block" }}>{alt}</span>}
    </span>
    <span className="kb-sw" data-on={acik ? "1" : "0"}><i /></span>
  </button>
);

const KisiSecici = ({ kisiler, secili, sec }) => (
  <div className="kb-chips">
    {kisiler.map((k) => (
      <button key={k.id} className="kb-chip" data-on={secili === k.id ? "1" : "0"} onClick={() => sec(k.id)}>
        <span>{k.e}</span>{k.ad}
      </button>
    ))}
  </div>
);

const KategoriSecici = ({ kategoriler, secili, sec }) => (
  <div className="kb-chips">
    {kategoriler.map((c) => (
      <button key={c.id} className="kb-chip" data-on={secili === c.id ? "1" : "0"} onClick={() => sec(c.id)}>
        <span>{c.e}</span>{c.ad}
      </button>
    ))}
  </div>
);

function AyGezgini({ ym, setYm, buAy }) {
  const { uzun, yil } = ymAd(ym);
  const f = fark(buAy, ym);
  return (
    <div className="kb-mn">
      <button onClick={() => setYm(ymKaydir(ym, -1))} aria-label="Önceki ay">‹</button>
      <div>
        {uzun} {yil}
        <small>{f === 0 ? "bu ay" : f === -1 ? "geçen ay" : f < 0 ? `${-f} ay önce` : `${f} ay sonra`}</small>
      </div>
      <button onClick={() => setYm(ymKaydir(ym, 1))} disabled={f >= 1} aria-label="Sonraki ay">›</button>
    </div>
  );
}

/* ================================================================== */
/*  App                                                                */
/* ================================================================== */

export default function OrtakButce() {
  const [d, setD] = useState(BASLANGIC);
  const [yuklendi, setYuklendi] = useState(false);
  const [sekme, setSekme] = useState("ozet");
  const [durum, setDurum] = useState("busy");
  const [heroMod, setHeroMod] = useState(0);
  const [toast, setToast] = useState(null);
  const [cakisma, setCakisma] = useState(false);
  const yedek = useRef(null);
  const ilk = useRef(true);
  const toastZaman = useRef(null);
  const rev = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await depo.get(KEY);
        if (r?.value) {
          const ham = JSON.parse(r.value);
          rev.current = sayi(ham.rev);
          setD(gocur(ham));
        }
      } catch { /* ilk açılış */ }
      setDurum("ok");
      setYuklendi(true);
    })();
  }, []);

  useEffect(() => {
    if (!yuklendi) return;
    if (ilk.current) { ilk.current = false; return; }
    if (cakisma) return; // çakışma çözülene kadar üzerine yazma
    const t = setTimeout(async () => {
      setDurum("busy");
      try {
        /* yazmadan önce sürüm kontrolü: başka cihaz/sekme yazdıysa ezme */
        try {
          const r = await depo.get(KEY);
          if (r?.value && sayi(JSON.parse(r.value).rev) !== rev.current) {
            setCakisma(true);
            setDurum("err");
            return;
          }
        } catch { /* depo boş — ilk kayıt */ }
        const yeniRev = rev.current + 1;
        await depo.set(KEY, JSON.stringify({ ...d, rev: yeniRev }));
        rev.current = yeniRev;
        setDurum("ok");
      } catch { setDurum("err"); }
    }, 500);
    return () => clearTimeout(t);
  }, [d, yuklendi, cakisma]);

  const yaz = (parca) => setD((o) => ({ ...o, ...parca }));

  /* #6 — geri alınabilir silme */
  const sil = (parca, mesaj) => {
    yedek.current = d;
    yaz(parca);
    setToast(mesaj || "Silindi");
    clearTimeout(toastZaman.current);
    toastZaman.current = setTimeout(() => setToast(null), 7000);
  };
  const geriAl = () => {
    if (yedek.current) setD(yedek.current);
    yedek.current = null;
    setToast(null);
    clearTimeout(toastZaman.current);
  };

  /* çakışmada: depodaki güncel veriyi al, buradaki kaydedilmemiş değişiklik kaybolur */
  const depodanYukle = async () => {
    try {
      const r = await depo.get(KEY);
      if (r?.value) {
        const ham = JSON.parse(r.value);
        rev.current = sayi(ham.rev);
        setD(gocur(ham));
      }
      setCakisma(false);
      setDurum("ok");
    } catch { setDurum("err"); }
  };

  const buAy = ymOf(new Date());
  PARA.simge = (BIRIMLER.find((b) => b.kod === d.para) || BIRIMLER[0]).simge;

  const birikimTL = useMemo(
    () => d.birikim.reduce((t, b) => {
      const v = VARLIK.find((x) => x.id === b.tur);
      return t + sayi(b.miktar) * sayi(d.kurlar[v?.kur]);
    }, 0),
    [d.birikim, d.kurlar]
  );

  /* #1 — değişken gider gerçek veriden türetiliyor (sabitler hariç) */
  const otoDegisken = useMemo(() => {
    const aylar = {};
    d.harcamalar.forEach((h) => {
      const a = String(h.tarih).slice(0, 7);
      if (a === buAy || h.sabitId) return; // yarım ay ve sabitler hariç
      aylar[a] = (aylar[a] || 0) + sayi(h.tutar);
    });
    const liste = Object.keys(aylar).sort().slice(-3).map((a) => aylar[a]);
    if (!liste.length) return 0;
    return Math.round(liste.reduce((t, x) => t + x, 0) / liste.length);
  }, [d.harcamalar, buAy]);

  const degiskenAylik = d.gider.mod === "elle" ? sayi(d.gider.deger) : otoDegisken;

  const proj = useMemo(() => {
    const simdi = new Date();
    const buGun = simdi.getDate();
    const oranla = d.ilkAyOranla;
    const buAyKayit = ayKayitlari(d, buAy);
    const harcananDegisken = buAyKayit.gercek
      .filter((h) => !h.sabitId)
      .reduce((t, h) => t + sayi(h.tutar), 0);

    const out = [];
    for (let i = 0; i < 12; i++) {
      const dt = new Date(simdi.getFullYear(), simdi.getMonth() + i, 1);
      const anahtar = ymOf(dt);
      const ilkAy = i === 0;

      /* #3 — ilk ayda sadece henüz gerçekleşmemiş kalemler */
      const gelir = d.gelirler
        .filter((g) => !(ilkAy && oranla) || sayi(g.gun) >= buGun)
        .reduce((t, g) => t + sayi(g.tutar), 0);

      const sabitList = (d.sabitler || []).filter((s) => sabitAktif(s, anahtar));
      const sabit = sabitList
        .filter((s) => {
          if (!ilkAy) return true;
          const girildi = buAyKayit.gercek.some((h) => h.sabitId === s.id);
          if (girildi) return false;                 // zaten ödenmiş, nakitten düşmüş
          return !oranla || sayi(s.gun) >= buGun;    // günü geçtiyse ödenmiş say
        })
        .reduce((t, s) => t + sayi(s.tutar), 0);

      const degisken = ilkAy && oranla
        ? Math.max(degiskenAylik - harcananDegisken, 0)
        : degiskenAylik;

      /* #2 — karta bağlı taksitler ilk ayda kart ekstresinin içinde, iki kez sayma */
      const taksit = d.taksitler
        .filter((t) => { const f = fark(t.baslangic, anahtar); return f >= 0 && f < sayi(t.ay); })
        .filter((t) => !(ilkAy && t.kartId))
        .reduce((t, x) => t + sayi(x.aylik), 0);

      const plan = d.planli
        .filter((p) => String(p.tarih).slice(0, 7) === anahtar)
        .filter((p) => !(ilkAy && oranla) || String(p.tarih) >= bugun())
        .reduce((t, p) => t + sayi(p.tutar), 0);

      const kart = ilkAy
        ? (d.kartlar || [])
            .filter((k) => !oranla || sayi(k.gun) >= buGun) // son ödeme günü geçtiyse ödendi say
            .reduce((t, k) => t + sayi(k.borc), 0)
        : 0;

      const gider = sabit + degisken;
      out.push({
        anahtar, ad: AY[dt.getMonth()], uzun: AY_UZUN[dt.getMonth()], yil: dt.getFullYear(),
        gelir, sabit, degisken, gider, taksit, plan, kart,
        net: gelir - gider - taksit - plan - kart,
        kismi: ilkAy && oranla,
      });
    }
    return out;
  }, [d, buAy, degiskenAylik]);

  const sonrakiMaas = useMemo(() => {
    const gunler = d.gelirler.map((x) => sayi(x.gun)).filter(Boolean).sort((a, b) => a - b);
    if (!gunler.length) return null;
    return gunKaldi(gunler.find((x) => x >= new Date().getDate()) ?? gunler[0]);
  }, [d.gelirler]);

  if (!yuklendi)
    return (
      <div className="kb">
        <style>{CSS}</style>
        <div className="kb-frame" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="kb-empty" style={{ border: "none", background: "none" }}>Yükleniyor…</div>
        </div>
      </div>
    );

  const nakit = sayi(d.nakit);
  const heroLar = [
    { l: "Toplam varlık", v: birikimTL + nakit, s: "Nakit ve birikim, güncel kurlarla" },
    { l: proj[0].kismi ? `${AY_UZUN[new Date().getMonth()]} — ayın kalanı` : `${AY_UZUN[new Date().getMonth()]} neti`, v: proj[0].net, s: proj[0].kismi ? "Ayın kalan gelir ve giderleri" : "Maaş − gider − taksit − plan − kart" },
    { l: "Birikim", v: birikimTL, s: "Altın, döviz ve mevduatın TL karşılığı" },
  ];
  const hero = heroLar[heroMod];

  const ortak = { d, yaz, sil, buAy };

  const ekranlar = {
    ozet: <Ozet {...ortak} proj={proj} />,
    birikim: <Birikim {...ortak} toplam={birikimTL} />,
    harcama: <Harcama {...ortak} />,
    plan: <Plan {...ortak} proj={proj} />,
    ayar: <Ayar {...ortak} setD={setD} otoDegisken={otoDegisken} />,
  };

  const sekmeler = [
    ["ozet", "Özet", IC.ozet],
    ["birikim", "Birikim", IC.birikim],
    ["harcama", "Harcama", IC.harcama],
    ["plan", "Ödemeler", IC.plan],
    ["ayar", "Ayarlar", IC.ayar],
  ];

  return (
    <div className="kb">
      <style>{CSS}</style>
      <div className="kb-frame">
        <div className="kb-hero">
          <div className="kb-hero-top">
            <span className="kb-hero-lbl">{hero.l}</span>
            <span className="kb-sync">
              <span className="kb-dot" data-s={durum} />
              {durum === "err" ? "kaydedilemedi" : durum === "busy" ? "kaydediliyor" : "eşlendi"}
            </span>
          </div>
          <button className="kb-hero-num" onClick={() => setHeroMod((m) => (m + 1) % heroLar.length)}>
            {tl(hero.v)}
          </button>
          <div className="kb-dots" aria-hidden="true">
            {heroLar.map((x, i) => <i key={x.l} data-on={i === heroMod ? "1" : "0"} />)}
          </div>
          <div className="kb-hero-sub">{hero.s}</div>
          <div className="kb-pills">
            <span className="kb-pill">Nakit {tl(nakit)}</span>
            <span className="kb-pill">Birikim {tl(birikimTL)}</span>
            {sonrakiMaas !== null && (
              <span className="kb-pill">{sonrakiMaas === 0 ? "Maaş bugün" : `Maaşa ${sonrakiMaas} gün`}</span>
            )}
          </div>
          <div className="kb-faces">
            {d.kisiler.slice(0, 6).map((k) => (
              <span key={k.id} className="kb-face" title={k.ad}>{k.e}</span>
            ))}
          </div>
        </div>

        <div className="kb-body">{ekranlar[sekme]}</div>

        <nav className="kb-nav">
          {sekmeler.map(([id, ad, ic]) => (
            <button key={id} className="kb-tab" data-on={sekme === id ? "1" : "0"} onClick={() => setSekme(id)}>
              {ic}{ad}
            </button>
          ))}
        </nav>

        {toast && (
          <div className="kb-toast">
            <span>{toast}</span>
            <button onClick={geriAl}>Geri al</button>
          </div>
        )}

        {cakisma && (
          <div className="kb-toast" style={{ bottom: "calc(140px + env(safe-area-inset-bottom))", background: "var(--neg)" }}>
            <span>Veri başka bir cihazda güncellenmiş — kaydetme durduruldu.</span>
            <button onClick={depodanYukle}>Güncel veriyi yükle</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Özet                                                               */
/* ================================================================== */

function Ozet({ d, proj, buAy }) {
  const [sec, setSec] = useState(0);
  const [yilAcik, setYilAcik] = useState(false);
  const s = proj[sec] || proj[0];
  const enBuyuk = Math.max(...proj.map((p) => Math.abs(p.net)), 1);
  const eksiye = proj.find((p) => p.net < 0);
  const maasVar = d.gelirler.length > 0;

  const ay = ayKayitlari(d, buAy);
  const ayGelir = d.gelirler.reduce((t, g) => t + sayi(g.tutar), 0);
  const ayTaksit = d.taksitler
    .filter((t) => { const f = fark(t.baslangic, buAy); return f >= 0 && f < sayi(t.ay); })
    .reduce((t, x) => t + sayi(x.aylik), 0);
  const kalan = ayGelir - ay.toplam - ayTaksit;


  return (
    <>
      <div className="kb-h">Önümüzdeki 12 ay <span>o ayın neti</span></div>
      <div className="kb-card">
        <div className="kb-runway">
          {proj.map((p, i) => {
            const oran = Math.min(Math.abs(p.net) / enBuyuk, 1);
            const eksi = p.net < 0;
            const secili = i === sec;
            return (
              <button
                key={p.anahtar}
                className="kb-col"
                data-on={secili ? "1" : "0"}
                data-now={i === 0 ? "1" : "0"}
                onClick={() => setSec(i)}
                aria-label={`${p.uzun} ${p.yil}: ${tl(p.net)}`}
              >
                <div className="kb-up">
                  {!eksi && (
                    <div
                      className="kb-bar"
                      style={{
                        height: `${Math.max(oran * 100, 4)}%`,
                        background: secili ? "var(--pos)" : "#D6DBD7",
                      }}
                    />
                  )}
                </div>
                <div className="kb-base" />
                <div className="kb-dn">
                  {eksi && <div className="kb-bar kb-bar-dn" style={{ height: `${Math.max(oran * 100, 6)}%`, opacity: secili ? 1 : 0.55 }} />}
                </div>
                <div className="kb-col-lbl">{p.ad}</div>
              </button>
            );
          })}
        </div>

        <div className="kb-detail">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {s.uzun} {s.yil}
              {s.kismi && <span className="kb-tag">ayın kalanı</span>}
            </div>
            <div className="kb-num" style={{ fontSize: 22, color: s.net < 0 ? "var(--neg)" : "var(--pos)" }}>
              {s.net > 0 ? "+" : ""}{tl(s.net)}
            </div>
          </div>
          <div className="kb-brk">
            <span>+{kisa(s.gelir)} maaş</span>
            {s.sabit > 0 && <span>−{kisa(s.sabit)} sabit</span>}
            {s.degisken > 0 && <span>−{kisa(s.degisken)} değişken</span>}
            {s.taksit > 0 && <span>−{kisa(s.taksit)} taksit</span>}
            {s.kart > 0 && <span>−{kisa(s.kart)} kart</span>}
            {s.plan > 0 && <span>−{kisa(s.plan)} planlı</span>}
          </div>
          {s.kismi && (
            <div className="kb-row-s" style={{ marginTop: 8, lineHeight: 1.55 }}>
              Günü geçmiş maaş, sabit ve kartlar düşülmüş durumda.
            </div>
          )}
        </div>
      </div>

      {eksiye && (
        <div className="kb-note" style={{ marginTop: 10, background: "var(--neg-s)" }}>
          <div className="kb-row-main">
            <div className="kb-row-t" style={{ color: "var(--neg)" }}>{eksiye.uzun} açık veriyor</div>
            <div className="kb-row-s">Tahmini açık: {tl(eksiye.net)}</div>
          </div>
        </div>
      )}

      <div className="kb-h">Bu ay</div>
      <div className="kb-tiles">
        <div className="kb-tile">
          <div className="kb-tile-l">Gelir</div>
          <div className="kb-tile-n" style={{ color: "var(--pos)" }}>{tl(ayGelir)}</div>
        </div>
        <div className="kb-tile">
          <div className="kb-tile-l">Harcama</div>
          <div className="kb-tile-n">{tl(ay.toplam)}</div>
        </div>
        <div className="kb-tile">
          <div className="kb-tile-l">Taksit</div>
          <div className="kb-tile-n">{tl(ayTaksit)}</div>
        </div>
        <div className="kb-tile">
          <div className="kb-tile-l">Kalan</div>
          <div className="kb-tile-n" style={{ color: kalan < 0 ? "var(--neg)" : "var(--pos)" }}>{tl(kalan)}</div>
        </div>
      </div>

      {d.kisiler.length > 1 && (
        <>
          <div className="kb-h">Kim ne ödedi <span>bu ay</span></div>
          <div className="kb-card">
            {d.kisiler.map((k) => {
              const odedi = ay.hepsi.filter((h) => h.kisiId === k.id).reduce((t, h) => t + sayi(h.tutar), 0);
              const gelir = d.gelirler.filter((g) => g.kisiId === k.id).reduce((t, g) => t + sayi(g.tutar), 0);
              return (
                <div className="kb-row" key={k.id}>
                  <Rozet e={k.e} r={k.r} />
                  <div className="kb-row-main">
                    <div className="kb-row-t">{k.ad}</div>
                    <div className="kb-row-s">
                      {gelir > 0 ? `+${kisa(gelir)} gelir` : "gelir yok"} · {odedi > 0 ? `${kisa(odedi)} ödedi` : "harcama yok"}
                    </div>
                    {ay.toplam > 0 && <div className="kb-meter"><i style={{ width: `${(odedi / ay.toplam) * 100}%`, background: k.r }} /></div>}
                  </div>
                  <span className="kb-amt">{tl(odedi)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="kb-h">Yıl özeti</div>
      <button className="kb-add" onClick={() => setYilAcik(true)}>Yıl özetini aç</button>
      <YilOzeti d={d} acik={yilAcik} kapat={() => setYilAcik(false)} />
    </>
  );
}

/* ================================================================== */
/*  Yıl özeti                                                          */
/* ================================================================== */

function YilOzeti({ d, acik, kapat }) {
  const [yil, setYil] = useState(new Date().getFullYear());

  const veri = useMemo(() => {
    if (!acik) return null;
    const aylar = [];
    for (let m = 1; m <= 12; m++) {
      const ym = `${yil}-${String(m).padStart(2, "0")}`;
      const k = ayKayitlari(d, ym);
      aylar.push({ ym, ay: m, ad: AY[m - 1], toplam: k.toplam, kayit: k.hepsi });
    }
    const toplam = aylar.reduce((t, a) => t + a.toplam, 0);
    const doluAy = aylar.filter((a) => a.toplam > 0);
    const enPahali = doluAy.slice().sort((a, b) => b.toplam - a.toplam)[0];
    const enUcuz = doluAy.slice().sort((a, b) => a.toplam - b.toplam)[0];
    const tumKayit = aylar.flatMap((a) => a.kayit);
    const kat = d.kategoriler
      .map((c) => ({ ...c, t: tumKayit.filter((h) => h.kat === c.id).reduce((s, h) => s + sayi(h.tutar), 0) }))
      .filter((c) => c.t > 0)
      .sort((a, b) => b.t - a.t);
    const kisi = d.kisiler
      .map((k) => ({ ...k, t: tumKayit.filter((h) => h.kisiId === k.id).reduce((s, h) => s + sayi(h.tutar), 0) }))
      .sort((a, b) => b.t - a.t);
    return { aylar, toplam, enPahali, enUcuz, kat, kisi, doluAy, adet: tumKayit.length };
  }, [d, yil, acik]);

  if (!acik || !veri) return <Sheet acik={false} kapat={kapat} baslik="" />;
  const enB = Math.max(...veri.aylar.map((a) => a.toplam), 1);

  return (
    <Sheet acik={acik} kapat={kapat} baslik={`${yil} özeti`}>
      <div className="kb-mn">
        <button onClick={() => setYil(yil - 1)} aria-label="Önceki yıl">‹</button>
        <div>{yil}<small>{veri.doluAy.length} ayda {veri.adet} kayıt</small></div>
        <button onClick={() => setYil(yil + 1)} disabled={yil >= new Date().getFullYear()} aria-label="Sonraki yıl">›</button>
      </div>

      {veri.toplam === 0 ? (
        <Bos>{yil} yılına ait kayıt yok.</Bos>
      ) : (
        <>
          <div className="kb-tiles" style={{ marginBottom: 10 }}>
            <div className="kb-tile">
              <div className="kb-tile-l">Toplam</div>
              <div className="kb-tile-n">{tl(veri.toplam)}</div>
            </div>
            <div className="kb-tile">
              <div className="kb-tile-l">Aylık ortalama</div>
              <div className="kb-tile-n">{tl(Math.round(veri.toplam / Math.max(veri.doluAy.length, 1)))}</div>
            </div>
            <div className="kb-tile">
              <div className="kb-tile-l">En yüksek</div>
              <div className="kb-tile-n" style={{ color: "var(--neg)" }}>{AY_UZUN[veri.enPahali.ay - 1]}</div>
              <div className="kb-row-s">{tl(veri.enPahali.toplam)}</div>
            </div>
            <div className="kb-tile">
              <div className="kb-tile-l">En düşük</div>
              <div className="kb-tile-n" style={{ color: "var(--pos)" }}>{AY_UZUN[veri.enUcuz.ay - 1]}</div>
              <div className="kb-row-s">{tl(veri.enUcuz.toplam)}</div>
            </div>
          </div>

          <div className="kb-card" style={{ marginBottom: 10 }}>
            <div className="kb-yb">
              {veri.aylar.map((a) => (
                <div key={a.ym} title={`${a.ad}: ${tl(a.toplam)}`}>
                  <i style={{ height: `${(a.toplam / enB) * 76}px`, opacity: a.toplam ? 1 : 0.25 }} />
                  <small>{a.ad}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="kb-h">Kategoriler</div>
          <div className="kb-card" style={{ marginBottom: 10 }}>
            {veri.kat.map((c) => (
              <div className="kb-row" key={c.id}>
                <Rozet e={c.e} r={c.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{c.ad} <span className="kb-tag" data-t="kisi">%{Math.round((c.t / veri.toplam) * 100)}</span></div>
                  <div className="kb-meter"><i style={{ width: `${(c.t / veri.toplam) * 100}%`, background: c.r }} /></div>
                </div>
                <span className="kb-amt">{tl(c.t)}</span>
              </div>
            ))}
          </div>

          {d.kisiler.length > 1 && (
            <>
              <div className="kb-h">Kişiler</div>
              <div className="kb-card">
                {veri.kisi.map((k) => (
                  <div className="kb-row" key={k.id}>
                    <Rozet e={k.e} r={k.r} />
                    <div className="kb-row-main">
                      <div className="kb-row-t">{k.ad}</div>
                      <div className="kb-meter"><i style={{ width: `${(k.t / veri.toplam) * 100}%`, background: k.r }} /></div>
                    </div>
                    <span className="kb-amt">{tl(k.t)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

/* ================================================================== */
/*  Birikim                                                            */
/* ================================================================== */

function Birikim({ d, yaz, sil, toplam }) {
  const [tur, setTur] = useState("gram");
  const [miktar, setMiktar] = useState("");
  const [etiket, setEtiket] = useState("");
  const [sahip, setSahip] = useState("ortak");
  const [cek, setCek] = useState("bos");
  const [onay, setOnay] = useState(null); // şüpheli kurlar kullanıcı onayı bekliyor

  const KUR_ADLARI = { gramAltin: "Gram altın", ceyrekAltin: "Çeyrek altın", usd: "Dolar", eur: "Euro", gumus: "Gümüş", btc: "Bitcoin", eth: "Ethereum" };

  /* çekilen kurlar mantıklı mı? boş/sıfır, mevcut değerden ±%25 sapma, çeyrek/gram oranı */
  const kurSuphe = (yeni, eski) => {
    const nedenler = [];
    Object.entries(KUR_ADLARI).forEach(([alan, ad]) => {
      const v = sayi(yeni[alan]);
      if (v <= 0) { nedenler.push(`${ad} boş ya da sıfır geldi`); return; }
      const e = sayi(eski[alan]);
      if (e > 0) {
        const sapma = Math.abs(v - e) / e;
        if (sapma > 0.25) nedenler.push(`${ad}: ${e} → ${v} (%${Math.round(sapma * 100)} sapma)`);
      }
    });
    const g = sayi(yeni.gramAltin), c = sayi(yeni.ceyrekAltin);
    if (g > 0 && c > 0 && (c < g * 1.4 || c > g * 2)) nedenler.push("Çeyrek/gram altın oranı olağan aralığın dışında");
    return nedenler;
  };

  const kurUygula = (k) => {
    yaz({
      kurlar: {
        gramAltin: sayi(k.gramAltin), ceyrekAltin: sayi(k.ceyrekAltin),
        usd: sayi(k.usd), eur: sayi(k.eur), gumus: sayi(k.gumus),
        btc: sayi(k.btc), eth: sayi(k.eth), tl: 1,
      },
      kurZamani: new Date().toISOString(),
    });
    setOnay(null);
    setCek("bitti");
  };

  const kurlariCek = async () => {
    setCek("calisiyor");
    setOnay(null);
    try {
      let k;
      if (KUR_KAYNAGI.mod === "sunucu") {
        const r = await fetch(KUR_KAYNAGI.url, { headers: { "x-ev-kodu": evKodu() } });
        if (!r.ok) throw new Error("kur isteği başarısız");
        k = await r.json();
      } else {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content:
                "Türkiye piyasasındaki güncel değerleri web'de ara: gram altın satış, çeyrek altın satış, dolar/TL, euro/TL, gram gümüş, 1 Bitcoin TL fiyatı, 1 Ethereum TL fiyatı. " +
                "Sadece geçerli JSON döndür, başka hiçbir şey yazma, markdown kod bloğu kullanma. " +
                '{"gramAltin": sayi, "ceyrekAltin": sayi, "usd": sayi, "eur": sayi, "gumus": sayi, "btc": sayi, "eth": sayi}',
            }],
            tools: [{ type: "web_search_20250305", name: "web_search" }],
          }),
        });
        const j = await r.json();
        const metin = j.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
        const t = metin.replace(/```json|```/g, "").trim();
        try { k = JSON.parse(t); }
        catch { k = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); }
      }
      const nedenler = kurSuphe(k, d.kurlar);
      if (nedenler.length) { setOnay({ k, nedenler }); setCek("bos"); }
      else kurUygula(k);
    } catch { setCek("hata"); }
  };

  const ekle = (kapat) => {
    if (!miktar) return;
    yaz({ birikim: [...d.birikim, { id: uid(), tur, miktar: sayi(miktar), etiket, kisiId: sahip === "ortak" ? null : sahip }] });
    setMiktar(""); setEtiket(""); kapat();
  };

  const sirali = d.birikim
    .map((b) => {
      const v = VARLIK.find((x) => x.id === b.tur);
      return { ...b, v, deger: sayi(b.miktar) * sayi(d.kurlar[v?.kur]) };
    })
    .sort((a, b) => b.deger - a.deger);

  return (
    <>
      <div className="kb-h">Varlıklar <span>{tl(toplam)}</span></div>
      {sirali.length === 0 ? (
        <Bos>Henüz birikim eklenmedi.</Bos>
      ) : (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {sirali.map((b) => {
            const pay = toplam > 0 ? (b.deger / toplam) * 100 : 0;
            const sahibi = d.kisiler.find((k) => k.id === b.kisiId);
            return (
              <div className="kb-row" key={b.id}>
                <Rozet e={b.v?.e} r={b.v?.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{b.etiket || b.v?.ad}</div>
                  <div className="kb-row-s">
                    {b.miktar} {b.v?.birim}{b.etiket ? ` · ${b.v?.ad}` : ""}
                    {sahibi ? ` · ${sahibi.e} ${sahibi.ad}` : " · ortak"}
                  </div>
                  <div className="kb-meter"><i style={{ width: `${pay}%`, background: b.v?.r }} /></div>
                </div>
                <span className="kb-amt">{tl(b.deger)}</span>
                <button
                  className="kb-del"
                  onClick={() => sil({ birikim: d.birikim.filter((x) => x.id !== b.id) }, `${b.etiket || b.v?.ad} silindi`)}
                  aria-label="Sil"
                >×</button>
              </div>
            );
          })}
        </div>
      )}

      <Ekle etiket="Birikim ekle" baslik="Birikim ekle">
        {(kapat) => (
          <>
            <Alan etiket="Tür">
              <div className="kb-chips">
                {VARLIK.map((v) => (
                  <button key={v.id} className="kb-chip" data-on={tur === v.id ? "1" : "0"} onClick={() => setTur(v.id)}>
                    <span>{v.e}</span>{v.ad}
                  </button>
                ))}
              </div>
            </Alan>
            <Alan etiket={`Miktar (${VARLIK.find((v) => v.id === tur)?.birim})`}>
              <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={miktar} onChange={(e) => setMiktar(e.target.value)} placeholder="0" autoFocus />
            </Alan>
            {d.kisiler.length > 1 && (
              <Alan etiket="Kimin">
                <div className="kb-chips">
                  <button className="kb-chip" data-on={sahip === "ortak" ? "1" : "0"} onClick={() => setSahip("ortak")}>Ortak</button>
                  {d.kisiler.map((k) => (
                    <button key={k.id} className="kb-chip" data-on={sahip === k.id ? "1" : "0"} onClick={() => setSahip(k.id)}>
                      <span>{k.e}</span>{k.ad}
                    </button>
                  ))}
                </div>
              </Alan>
            )}
            <Alan etiket="Not (isteğe bağlı)">
              <input className="kb-in" value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="Kasadaki altınlar" />
            </Alan>
            <button className="kb-btn" onClick={() => ekle(kapat)} disabled={!miktar}>Ekle</button>
          </>
        )}
      </Ekle>

      <div className="kb-h">Kurlar</div>
      <div className="kb-card">
        {VARLIK.filter((v) => v.id !== "tl").map((v) => (
          <div className="kb-row" key={v.id}>
            <Rozet e={v.e} r={v.r} />
            <div className="kb-row-main"><div className="kb-row-t">{v.ad}</div></div>
            <input
              className="kb-in" data-num="1"
              style={{ width: 118, textAlign: "right", padding: "9px 12px", fontSize: 15 }}
              type="number" inputMode="decimal"
              value={d.kurlar[v.kur] || ""} placeholder="0"
              onChange={(e) => yaz({ kurlar: { ...d.kurlar, [v.kur]: sayi(e.target.value) } })}
            />
          </div>
        ))}
        <button className="kb-btn-ghost" style={{ marginTop: 14 }} onClick={kurlariCek} disabled={cek === "calisiyor"}>
          {cek === "calisiyor" ? "Aranıyor…" : "Kurları güncelle"}
        </button>
        {onay && (
          <div className="kb-detail" style={{ background: "var(--warn-s)", marginTop: 12 }}>
            <div className="kb-row-t" style={{ marginBottom: 6 }}>Çekilen kurlar şüpheli görünüyor</div>
            {onay.nedenler.map((n, i) => (
              <div className="kb-row-s" key={i} style={{ lineHeight: 1.55 }}>• {n}</div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="kb-btn-ghost" onClick={() => setOnay(null)}>Vazgeç</button>
              <button className="kb-btn" style={{ padding: 12 }} onClick={() => kurUygula(onay.k)}>Yine de uygula</button>
            </div>
          </div>
        )}
        <div className="kb-row-s" style={{ marginTop: 9, textAlign: "center" }}>
          {cek === "hata"
            ? "Kurlar çekilemedi — yukarıdan elle girebilirsin."
            : d.kurZamani
            ? `Son güncelleme: ${new Date(d.kurZamani).toLocaleString("tr-TR")}`
            : "Henüz güncellenmedi."}
        </div>
        <div className="kb-row-s" style={{ marginTop: 6, textAlign: "center", fontSize: 10.5, lineHeight: 1.5 }}>
          Altın/gümüş küresel spottan hesaplanır; çeyrek yaklaşık değerdir.
          Döviz: exchangerate-api.com · Kripto: CoinGecko
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Harcama formu                                                      */
/* ================================================================== */

const BOS_HARCAMA = (d) => ({
  tutar: "", kat: d.kategoriler[0]?.id || "", kisiId: d.kisiler[0]?.id,
  tarih: bugun(), not: "", ortak: true, sabitId: null,
});

function HarcamaFormu({ d, form, setForm, kaydet, etiket }) {
  return (
    <>
      <div className="kb-2">
        <Alan etiket="Tutar">
          <input
            className="kb-in" data-num="1" type="number" inputMode="decimal"
            value={form.tutar} onChange={(e) => setForm({ ...form, tutar: e.target.value })}
            placeholder="0" autoFocus
          />
        </Alan>
        <Alan etiket="Tarih">
          <input className="kb-in" type="date" value={form.tarih} onChange={(e) => setForm({ ...form, tarih: e.target.value })} />
        </Alan>
      </div>
      <Alan etiket="Kategori">
        <KategoriSecici kategoriler={d.kategoriler} secili={form.kat} sec={(id) => setForm({ ...form, kat: id })} />
      </Alan>
      <Alan etiket="Kim ödedi">
        <KisiSecici kisiler={d.kisiler} secili={form.kisiId} sec={(id) => setForm({ ...form, kisiId: id })} />
      </Alan>
      {d.kisiler.length > 1 && (
        <div className="kb-field">
          <Anahtar
            acik={form.ortak !== false}
            degistir={() => setForm({ ...form, ortak: form.ortak === false })}
            baslik="Ortak harcama"
            alt={form.ortak === false ? "Sadece bu kişinin cebinden; bölüşmeye girmez" : "Denkleştirmede herkesin payına düşer"}
          />
        </div>
      )}
      <Alan etiket="Not (isteğe bağlı)">
        <input className="kb-in" value={form.not} onChange={(e) => setForm({ ...form, not: e.target.value })} placeholder="Haftalık market" />
      </Alan>
      <button className="kb-btn" onClick={kaydet} disabled={!form.tutar}>{etiket}</button>
    </>
  );
}

/* ================================================================== */
/*  Arama                                                              */
/* ================================================================== */

function Arama({ d, acik, kapat }) {
  const [q, setQ] = useState("");
  const [kisi, setKisi] = useState("hepsi");
  const [kat, setKat] = useState("hepsi");

  const sonuc = useMemo(() => {
    if (!acik) return [];
    const aylar = ayAraligi(d);
    const hepsi = aylar.flatMap((ym) => ayKayitlari(d, ym).hepsi);
    const t = q.trim().toLocaleLowerCase("tr");
    return hepsi
      .filter((h) => (kisi === "hepsi" ? true : h.kisiId === kisi))
      .filter((h) => (kat === "hepsi" ? true : h.kat === kat))
      .filter((h) => {
        if (!t) return true;
        const c = d.kategoriler.find((x) => x.id === h.kat);
        const k = d.kisiler.find((x) => x.id === h.kisiId);
        return [h.not, c?.ad, k?.ad, String(h.tutar)]
          .filter(Boolean)
          .some((s) => String(s).toLocaleLowerCase("tr").includes(t));
      })
      .sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
  }, [d, q, kisi, kat, acik]);

  const toplam = sonuc.reduce((t, h) => t + sayi(h.tutar), 0);
  const kisaListe = sonuc.slice(0, 200);

  return (
    <Sheet acik={acik} kapat={kapat} baslik="Tüm kayıtlarda ara">
      <Alan etiket="Ara">
        <input className="kb-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder="market, kira, 1250…" autoFocus />
      </Alan>
      {d.kisiler.length > 1 && (
        <Alan etiket="Kim">
          <div className="kb-chips">
            <button className="kb-chip" data-tone="soft" data-on={kisi === "hepsi" ? "1" : "0"} onClick={() => setKisi("hepsi")}>Hepsi</button>
            {d.kisiler.map((k) => (
              <button key={k.id} className="kb-chip" data-tone="soft" data-on={kisi === k.id ? "1" : "0"} onClick={() => setKisi(k.id)}>
                <span>{k.e}</span>{k.ad}
              </button>
            ))}
          </div>
        </Alan>
      )}
      <Alan etiket="Kategori">
        <div className="kb-chips">
          <button className="kb-chip" data-tone="soft" data-on={kat === "hepsi" ? "1" : "0"} onClick={() => setKat("hepsi")}>Hepsi</button>
          {d.kategoriler.map((c) => (
            <button key={c.id} className="kb-chip" data-tone="soft" data-on={kat === c.id ? "1" : "0"} onClick={() => setKat(c.id)}>
              <span>{c.e}</span>{c.ad}
            </button>
          ))}
        </div>
      </Alan>

      <div className="kb-h">Sonuç <em>{sonuc.length} kayıt · {tl(toplam)}</em></div>
      {sonuc.length === 0 ? (
        <Bos>Eşleşen kayıt yok.</Bos>
      ) : (
        <div className="kb-card">
          {kisaListe.map((h) => {
            const c = d.kategoriler.find((x) => x.id === h.kat);
            const k = d.kisiler.find((x) => x.id === h.kisiId);
            return (
              <div className="kb-row" key={h.id} data-sanal={h.sanal ? "1" : "0"}>
                <Rozet e={c?.e || "✨"} r={c?.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">
                    {h.not || c?.ad || "Harcama"}
                    {h.sanal && <span className="kb-tag" data-t="bekle">sabit</span>}
                  </div>
                  <div className="kb-row-s">
                    {new Date(h.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    {c ? ` · ${c.ad}` : ""}{k ? ` · ${k.ad}` : ""}
                  </div>
                </div>
                <span className="kb-amt">{tl(h.tutar)}</span>
              </div>
            );
          })}
          {sonuc.length > kisaListe.length && (
            <div className="kb-row-s" style={{ paddingTop: 10 }}>İlk 200 kayıt gösteriliyor.</div>
          )}
        </div>
      )}
    </Sheet>
  );
}

/* ================================================================== */
/*  Harcama                                                            */
/* ================================================================== */

function Harcama({ d, yaz, sil, buAy }) {
  const [ym, setYm] = useState(buAy);
  const [form, setForm] = useState(() => BOS_HARCAMA(d));
  const [duzen, setDuzen] = useState(null);
  const [filtre, setFiltre] = useState("hepsi");
  const [aramaAcik, setAramaAcik] = useState(false);
  const [gecmisAcik, setGecmisAcik] = useState(false);
  const [ekleAcik, setEkleAcik] = useState(false);

  const ay = useMemo(() => ayKayitlari(d, ym), [d, ym]);

  const ekle = (kapat) => {
    if (!form.tutar) return;
    yaz({ harcamalar: [{ ...form, id: uid(), tutar: sayi(form.tutar) }, ...d.harcamalar] });
    setForm({ ...BOS_HARCAMA(d), kat: form.kat, kisiId: form.kisiId, tarih: form.tarih });
    kapat();
  };

  const guncelle = () => {
    yaz({ harcamalar: d.harcamalar.map((h) => (h.id === duzen.id ? { ...duzen, tutar: sayi(duzen.tutar) } : h)) });
    setDuzen(null);
  };

  /* sanal sabit satırını gerçek kayda çevir */
  const sabitiGir = (v, tutar) => {
    yaz({
      harcamalar: [{
        id: uid(), sabitId: v.sabitId, tutar: sayi(tutar ?? v.tutar),
        kat: v.kat, kisiId: v.kisiId, tarih: v.tarih, not: v.not, ortak: v.ortak,
      }, ...d.harcamalar],
    });
  };

  const oncekiYm = ymKaydir(ym, -1);
  const oncekiToplam = ayKayitlari(d, oncekiYm).toplam;
  const suAn = ym === buAy;
  const ayGun = ayinSonGunu(ymTarih(ym));
  const gecenGun = suAn ? new Date().getDate() : ayGun;
  const tempo = gecenGun > 0 ? (ay.toplam / gecenGun) * ayGun : 0;
  const tahminErken = suAn && gecenGun < 5; // ay başında tempo tahmini çok gürültülü
  const degisim = oncekiToplam > 0 ? ((tempo - oncekiToplam) / oncekiToplam) * 100 : null;

  const katToplam = d.kategoriler
    .map((c) => ({ ...c, t: ay.hepsi.filter((h) => h.kat === c.id).reduce((s, h) => s + sayi(h.tutar), 0) }))
    .filter((c) => c.t > 0)
    .sort((a, b) => b.t - a.t);

  /* ---- devreden defter: tüm aylar + kapatılmış denkleştirmeler ---- */
  const defter = useMemo(() => {
    const payTop = d.kisiler.reduce((t, k) => t + sayi(k.pay), 0) || 1;
    const aylar = ayAraligi(d);
    /* yalnız girilmiş kayıtlar — bekleyen (sanal) sabitler borç/alacak doğurmaz */
    const ortak = aylar.flatMap((m) => ayKayitlari(d, m).gercek).filter((h) => h.ortak !== false);
    const top = ortak.reduce((t, h) => t + sayi(h.tutar), 0);
    const bakiye = {};
    d.kisiler.forEach((k) => {
      const odedi = ortak.filter((h) => h.kisiId === k.id).reduce((t, h) => t + sayi(h.tutar), 0);
      bakiye[k.id] = odedi - (top * sayi(k.pay)) / payTop;
    });
    (d.denklestirmeler || []).forEach((x) =>
      x.akis.forEach((a) => {
        if (bakiye[a.fromId] !== undefined) bakiye[a.fromId] += sayi(a.tutar);
        if (bakiye[a.toId] !== undefined) bakiye[a.toId] -= sayi(a.tutar);
      })
    );
    const alacak = d.kisiler.filter((k) => bakiye[k.id] > 0.5).map((k) => ({ k, v: bakiye[k.id] })).sort((a, b) => b.v - a.v);
    const borc = d.kisiler.filter((k) => bakiye[k.id] < -0.5).map((k) => ({ k, v: -bakiye[k.id] })).sort((a, b) => b.v - a.v);
    const akis = [];
    let i = 0, j = 0;
    while (i < borc.length && j < alacak.length) {
      const m = Math.min(borc[i].v, alacak[j].v);
      akis.push({ from: borc[i].k, to: alacak[j].k, tutar: Math.round(m) });
      borc[i].v -= m; alacak[j].v -= m;
      if (borc[i].v < 0.5) i++;
      if (alacak[j].v < 0.5) j++;
    }
    return { bakiye, akis, top };
  }, [d]);

  /* seçili ayın bölüşümü (bilgi amaçlı) */
  const ayBolusum = useMemo(() => {
    const payTop = d.kisiler.reduce((t, k) => t + sayi(k.pay), 0) || 1;
    const ortak = ay.hepsi.filter((h) => h.ortak !== false);
    const top = ortak.reduce((t, h) => t + sayi(h.tutar), 0);
    return d.kisiler.map((k) => {
      const odedi = ortak.filter((h) => h.kisiId === k.id).reduce((t, h) => t + sayi(h.tutar), 0);
      const pay = (top * sayi(k.pay)) / payTop;
      return { k, odedi, pay, bakiye: odedi - pay };
    });
  }, [ay, d.kisiler]);

  const kapat = () => {
    if (!defter.akis.length) return;
    yaz({
      denklestirmeler: [
        ...(d.denklestirmeler || []),
        {
          id: uid(),
          tarih: new Date().toISOString(),
          akis: defter.akis.map((a) => ({ fromId: a.from.id, toId: a.to.id, tutar: a.tutar })),
        },
      ],
    });
  };

  const gosterilen = filtre === "hepsi" ? ay.hepsi : ay.hepsi.filter((h) => h.kisiId === filtre);

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><AyGezgini ym={ym} setYm={setYm} buAy={buAy} /></div>
        <button className="kb-icbtn" onClick={() => setEkleAcik(true)} aria-label="Harcama ekle">
          <svg className="kb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <button className="kb-icbtn" onClick={() => setAramaAcik(true)} aria-label="Kayıtlarda ara">
          <svg className="kb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        </button>
      </div>
      <Arama d={d} acik={aramaAcik} kapat={() => setAramaAcik(false)} />

      <Sheet acik={ekleAcik} kapat={() => setEkleAcik(false)} baslik="Harcama ekle">
        <HarcamaFormu d={d} form={form} setForm={setForm} kaydet={() => ekle(() => setEkleAcik(false))} etiket="Kaydet" />
      </Sheet>

      <div className="kb-h">
        {ymAd(ym).uzun} <span>{tl(ay.toplam)}</span>
        {ay.bekleyen.length > 0 && <em>{tl(ay.gercekToplam)} girildi</em>}
      </div>

      {ay.bekleyen.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          <div className="kb-row-s" style={{ marginBottom: 6 }}>
            Girilmeyi bekleyen sabit giderler:
          </div>
          {ay.bekleyen.map((v) => {
            const c = d.kategoriler.find((x) => x.id === v.kat);
            return (
              <div className="kb-row" key={v.id} data-sanal="1">
                <Rozet e={c?.e || "🔁"} r={c?.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{v.not}<span className="kb-tag" data-t="bekle">bekliyor</span></div>
                  <div className="kb-row-s">{gunAdi(v.tarih)} · {tl(v.tutar)}</div>
                </div>
                <button className="kb-mini" onClick={() => sabitiGir(v)}>Girildi</button>
              </div>
            );
          })}
        </div>
      )}

      {katToplam.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          <div className="kb-donut" style={{ marginBottom: 6 }} role="img" aria-label={`${ymAd(ym).uzun} kategori dağılımı — toplam ${tl(ay.toplam)}`}>
            <ResponsiveContainer width="100%" height={168}>
              <PieChart>
                <Pie
                  data={katToplam.map((c) => ({ name: c.ad, value: c.t }))}
                  dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={2} stroke="none"
                >
                  {katToplam.map((c) => <Cell key={c.id} fill={c.r} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E4E7EA", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(16,24,40,.08)", fontWeight: 600 }}
                  formatter={(v, n) => [tl(v), n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="kb-donut-c">
              <b>{kisa(ay.toplam)}</b>
              <span>{ay.hepsi.length} kayıt</span>
            </div>
          </div>
          {katToplam.map((c) => (
            <div className="kb-row" key={c.id}>
              <Rozet e={c.e} r={c.r} />
              <div className="kb-row-main">
                <div className="kb-row-t">{c.ad}</div>
                <div className="kb-meter"><i style={{ width: `${(c.t / ay.toplam) * 100}%`, background: c.r }} /></div>
              </div>
              <span className="kb-amt">{tl(c.t)}</span>
            </div>
          ))}
        </div>
      )}

      {degisim !== null && ay.toplam > 0 && !tahminErken && (
        <div className="kb-note" style={{ marginBottom: 10, background: degisim > 0 ? "var(--warn-s)" : "var(--pos-s)" }}>
          <div className="kb-row-main">
            <div className="kb-row-t">
              {suAn ? "Bu tempoyla" : "Geçen aya göre"} %{Math.abs(Math.round(degisim))} {degisim > 0 ? "daha fazla" : "daha az"}
            </div>
            <div className="kb-row-s">
              {ymAd(oncekiYm).uzun} {tl(oncekiToplam)}
              {suAn ? ` · ay sonu tahmini ${tl(tempo)}` : ` · ${ymAd(ym).uzun} ${tl(ay.toplam)}`}
            </div>
          </div>
        </div>
      )}

      {d.kisiler.length > 1 && (
        <>
          <div className="kb-h">
            Denkleştirme <span>devreden</span>
            <em>
              <button className="kb-mini" onClick={() => setGecmisAcik(true)}>Geçmiş</button>
            </em>
          </div>
          <div className="kb-card">
            {defter.akis.length === 0 ? (
              <div className="kb-note" style={{ padding: 0 }}>
                <div className="kb-row-main">
                  <div className="kb-row-t">Hesap denk</div>
                  <div className="kb-row-s">Kimsenin kimseye borcu yok.</div>
                </div>
              </div>
            ) : (
              <>
                {defter.akis.map((a, i) => (
                  <div className="kb-flow" key={i}>
                    <Rozet e={a.from.e} r={a.from.r} sm />
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.from.ad}</span>
                    <span className="kb-arrow">→</span>
                    <Rozet e={a.to.e} r={a.to.r} sm />
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.to.ad}</span>
                    <span className="kb-amt" style={{ marginLeft: "auto" }}>{tl(a.tutar)}</span>
                  </div>
                ))}
                <button className="kb-btn" style={{ marginTop: 12 }} onClick={kapat}>Ödendi olarak işaretle</button>
              </>
            )}
            <div className="kb-row-s" style={{ marginTop: 10, lineHeight: 1.6 }}>
              Bütün ayların girilmiş ortak harcamaları toplanıp kapatılmış denkleştirmeler düşülüyor — bakiye aylar arası devrediyor.
              Bekleyen sabitler girilene kadar, "kişisel" işaretli kayıtlar ise hiçbir zaman bu hesaba katılmaz.
            </div>
          </div>

          <div className="kb-h">{ymAd(ym).uzun} bölüşümü <span>bilgi</span></div>
          <div className="kb-card">
            {ayBolusum.map((x) => (
              <div className="kb-row" key={x.k.id}>
                <Rozet e={x.k.e} r={x.k.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{x.k.ad}</div>
                  <div className="kb-row-s">{tl(x.odedi)} ödedi · payı {tl(x.pay)}</div>
                </div>
                <span className="kb-amt" style={{ color: x.bakiye < -0.5 ? "var(--neg)" : x.bakiye > 0.5 ? "var(--pos)" : "var(--muted)" }}>
                  {x.bakiye > 0 ? "+" : ""}{tl(x.bakiye)}
                </span>
              </div>
            ))}
          </div>

          <Sheet acik={gecmisAcik} kapat={() => setGecmisAcik(false)} baslik="Denkleştirme geçmişi">
            {(d.denklestirmeler || []).length === 0 ? (
              <Bos>Kapatılmış denkleştirme yok.</Bos>
            ) : (
              <div className="kb-card">
                {(d.denklestirmeler || []).slice().reverse().map((x) => (
                  <div className="kb-row" key={x.id} style={{ alignItems: "flex-start" }}>
                    <div className="kb-row-main">
                      <div className="kb-row-t">{new Date(x.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</div>
                      {x.akis.map((a, i) => {
                        const f = d.kisiler.find((k) => k.id === a.fromId);
                        const t = d.kisiler.find((k) => k.id === a.toId);
                        return (
                          <div className="kb-row-s" key={i}>
                            {f?.ad || "—"} → {t?.ad || "—"} · {tl(a.tutar)}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      className="kb-del"
                      onClick={() => sil(
                        { denklestirmeler: (d.denklestirmeler || []).filter((y) => y.id !== x.id) },
                        "Denkleştirme geri açıldı"
                      )}
                      aria-label="Sil"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </Sheet>
        </>
      )}

      <div className="kb-h">
        Kayıtlar
        <em>{gosterilen.length} kayıt</em>
      </div>

      {d.kisiler.length > 1 && (
        <div className="kb-chips" style={{ marginBottom: 10 }}>
          <button className="kb-chip" data-tone="soft" data-on={filtre === "hepsi" ? "1" : "0"} onClick={() => setFiltre("hepsi")}>Hepsi</button>
          {d.kisiler.map((k) => (
            <button key={k.id} className="kb-chip" data-tone="soft" data-on={filtre === k.id ? "1" : "0"} onClick={() => setFiltre(k.id)}>
              <span>{k.e}</span>{k.ad}
            </button>
          ))}
        </div>
      )}

      {gosterilen.length === 0 ? (
        <Bos>{ymAd(ym).uzun} ayına kayıt yok.</Bos>
      ) : (
        <div className="kb-card">
          {gosterilen.map((h) => {
            const c = d.kategoriler.find((x) => x.id === h.kat);
            const k = d.kisiler.find((x) => x.id === h.kisiId);
            const satir = (
              <>
                <Rozet e={c?.e || "✨"} r={c?.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">
                    {h.not || c?.ad || "Harcama"}
                    {h.sanal && <span className="kb-tag" data-t="bekle">bekliyor</span>}
                    {!h.sanal && h.sabitId && <span className="kb-tag">sabit</span>}
                  </div>
                  <div className="kb-row-s">
                    {gunAdi(h.tarih)}{c ? ` · ${c.ad}` : ""}{k ? ` · ${k.e} ${k.ad}` : ""}
                    {h.ortak === false ? " · kişisel" : ""}
                  </div>
                </div>
                <span className="kb-amt">{tl(h.tutar)}</span>
              </>
            );
            return h.sanal ? (
              <div className="kb-row" key={h.id} data-sanal="1">
                {satir}
                <button className="kb-mini" style={{ marginLeft: 8 }} onClick={() => sabitiGir(h)}>Girildi</button>
              </div>
            ) : (
              <button className="kb-row" key={h.id} onClick={() => setDuzen({ ...h })}>{satir}</button>
            );
          })}
        </div>
      )}

      <Sheet acik={!!duzen} kapat={() => setDuzen(null)} baslik="Harcamayı düzenle">
        {duzen && (
          <>
            <HarcamaFormu d={d} form={duzen} setForm={setDuzen} kaydet={guncelle} etiket="Değişikliği kaydet" />
            <button
              className="kb-btn-ghost kb-btn-dan"
              style={{ marginTop: 8 }}
              onClick={() => {
                sil({ harcamalar: d.harcamalar.filter((x) => x.id !== duzen.id) }, `${duzen.not || "Kayıt"} silindi`);
                setDuzen(null);
              }}
            >
              Bu kaydı sil
            </button>
          </>
        )}
      </Sheet>
    </>
  );
}

/* ================================================================== */
/*  Plan                                                               */
/* ================================================================== */

const BOS_SABIT = (d) => ({
  baslik: "", tutar: "", kat: d.kategoriler[0]?.id || "", kisiId: d.kisiler[0]?.id,
  gun: 1, baslangic: ymOf(new Date()), bitis: "", ortak: true,
});

function Plan({ d, yaz, sil, proj }) {
  const [t, setT] = useState({ baslik: "", aylik: "", ay: 12, baslangic: ymOf(new Date()), kartId: null });
  const [p, setP] = useState({ baslik: "", tutar: "", tarih: bugun() });
  const [k, setK] = useState({ ad: "", borc: "", gun: 10, banka: "💳" });
  const [sb, setSb] = useState(() => BOS_SABIT(d));
  const [duzenSabit, setDuzenSabit] = useState(null);
  const [dokum, setDokum] = useState(false);
  const buAy = ymOf(new Date());

  const sabitler = (d.sabitler || []).filter((s) => sabitAktif(s, buAy));
  const sabitToplam = sabitler.reduce((t, s) => t + sayi(s.tutar), 0);
  const bitmis = (d.sabitler || []).filter((s) => !sabitAktif(s, buAy));

  const sabitKaydet = (s, kapatFn) => {
    if (!s.baslik || !s.tutar) return;
    const temiz = { ...s, tutar: sayi(s.tutar), gun: sayi(s.gun) || 1, bitis: s.bitis || null };
    if (s.id) yaz({ sabitler: d.sabitler.map((x) => (x.id === s.id ? temiz : x)) });
    else yaz({ sabitler: [...(d.sabitler || []), { ...temiz, id: uid() }] });
    kapatFn?.();
  };

  return (
    <>
      <div className="kb-h">Aylık gelir-gider dengesi</div>
      <div className="kb-card" style={{ paddingLeft: 2, paddingRight: 8 }}>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={proj} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="kbg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#17694C" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#17694C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ad" tick={{ fill: "#697077", fontSize: 10, fontFamily: "Inter", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#697077", fontSize: 10, fontFamily: "Inter", fontWeight: 500 }} axisLine={false} tickLine={false} width={44} tickFormatter={kisa} />
            <ReferenceLine y={0} stroke="#B8412F" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E4E7EA", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px rgba(16,24,40,.08)", fontWeight: 600 }}
              formatter={(v) => [tl(v), "Aylık net"]}
            />
            <Area type="monotone" dataKey="net" stroke="#17694C" strokeWidth={2} fill="url(#kbg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ---------- SABİT GİDERLER ---------- */}
      <div className="kb-h">Sabit giderler <span>{tl(sabitToplam)}/ay</span></div>
      {sabitler.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {sabitler.slice().sort((a, b) => sayi(a.gun) - sayi(b.gun)).map((s) => {
            const c = d.kategoriler.find((x) => x.id === s.kat);
            const kisi = d.kisiler.find((x) => x.id === s.kisiId);
            const kg = gunKaldi(s.gun);
            return (
              <button className="kb-row" key={s.id} onClick={() => setDuzenSabit({ ...s, bitis: s.bitis || "" })}>
                <Rozet e={c?.e || "🔁"} r={c?.r} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{s.baslik}{s.ortak === false && <span className="kb-tag" data-t="kisi">kişisel</span>}</div>
                  <div className="kb-row-s">
                    her ayın {s.gun}. günü · {kg === 0 ? "bugün" : `${kg} gün`}
                    {d.kisiler.length > 1 && kisi ? ` · ${kisi.e} ${kisi.ad}` : ""}
                    {s.bitis ? ` · ${ymAd(s.bitis).kisa} ${ymAd(s.bitis).yil}'da biter` : ""}
                  </div>
                </div>
                <span className="kb-amt">{tl(s.tutar)}</span>
              </button>
            );
          })}
        </div>
      )}
      {bitmis.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10, opacity: .55 }}>
          {bitmis.map((s) => (
            <button className="kb-row" key={s.id} onClick={() => setDuzenSabit({ ...s, bitis: s.bitis || "" })}>
              <Rozet e="✓" r="#697077" />
              <div className="kb-row-main">
                <div className="kb-row-t">{s.baslik}</div>
                <div className="kb-row-s">artık aktif değil</div>
              </div>
              <span className="kb-amt">{tl(s.tutar)}</span>
            </button>
          ))}
        </div>
      )}
      <Ekle etiket="Sabit gider ekle" baslik="Sabit gider">
        {(kapatFn) => (
          <SabitFormu
            d={d} s={sb} setS={setSb}
            kaydet={() => { sabitKaydet(sb, kapatFn); setSb(BOS_SABIT(d)); }}
            etiket="Ekle"
          />
        )}
      </Ekle>
      <div className="kb-row-s" style={{ margin: "10px 2px 0", lineHeight: 1.6 }}>
        Sabitler her ay Harcama sekmesinde "bekliyor" olarak listelenir; girildiğinde kayda dönüşür. Projeksiyonda ayrı kalem sayılır.
      </div>


      {/* ---------- KARTLAR ---------- */}
      <div className="kb-h">Kredi kartları</div>
      {(d.kartlar || []).length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {(d.kartlar || [])
            .slice()
            .sort((a, b) => (gunKaldi(a.gun) ?? 99) - (gunKaldi(b.gun) ?? 99))
            .map((x) => {
              const kg = gunKaldi(x.gun);
              const yakin = kg !== null && kg <= 5;
              const bagli = d.taksitler.filter((y) => y.kartId === x.id && fark(y.baslangic, buAy) >= 0 && fark(y.baslangic, buAy) < sayi(y.ay));
              return (
                <div className="kb-row" key={x.id}>
                  <Rozet e={x.banka || "💳"} r={yakin ? "#B8412F" : "#2F5FA6"} />
                  <div className="kb-row-main">
                    <div className="kb-row-t">{x.ad}</div>
                    <div className="kb-row-s" style={{ color: yakin ? "var(--neg)" : undefined }}>
                      son ödeme ayın {x.gun}'i · {kg === 0 ? "bugün" : `${kg} gün kaldı`}
                      {bagli.length > 0 && ` · içinde ${bagli.length} taksit (${kisa(bagli.reduce((t, y) => t + sayi(y.aylik), 0))})`}
                    </div>
                  </div>
                  <span className="kb-amt">{tl(x.borc)}</span>
                  <button className="kb-del" onClick={() => sil({ kartlar: (d.kartlar || []).filter((y) => y.id !== x.id) }, `${x.ad} silindi`)} aria-label="Sil">×</button>
                </div>
              );
            })}
          <div className="kb-row">
            <div className="kb-row-main"><div className="kb-row-t">Toplam kart borcu</div></div>
            <span className="kb-amt" style={{ color: "var(--neg)" }}>
              {tl((d.kartlar || []).reduce((t, x) => t + sayi(x.borc), 0))}
            </span>
          </div>
        </div>
      )}
      <Ekle etiket="Kart ekle" baslik="Kredi kartı ekle">
        {(kapatFn) => (
          <>
            <Alan etiket="Kart adı">
              <input className="kb-in" value={k.ad} onChange={(e) => setK({ ...k, ad: e.target.value })} placeholder="Bonus – Garanti" autoFocus />
            </Alan>
            <div className="kb-2">
              <Alan etiket="Güncel ekstre borcu">
                <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={k.borc} onChange={(e) => setK({ ...k, borc: e.target.value })} placeholder="0" />
              </Alan>
              <Alan etiket="Son ödeme günü">
                <input className="kb-in" data-num="1" type="number" min="1" max="31" value={k.gun} onChange={(e) => setK({ ...k, gun: e.target.value })} />
              </Alan>
            </div>
            <Alan etiket="Simge">
              <div className="kb-chips">
                {["💳", "🟦", "🟥", "🟩", "🟨", "🟪", "🏦", "⭐"].map((e) => (
                  <button key={e} className="kb-chip" data-on={k.banka === e ? "1" : "0"} onClick={() => setK({ ...k, banka: e })} style={{ padding: "7px 11px" }}>{e}</button>
                ))}
              </div>
            </Alan>
            <button
              className="kb-btn" disabled={!k.ad || !k.borc}
              onClick={() => {
                if (!k.ad || !k.borc) return;
                yaz({ kartlar: [...(d.kartlar || []), { ...k, id: uid(), borc: sayi(k.borc), gun: sayi(k.gun) || 1 }] });
                setK({ ...k, ad: "", borc: "" }); kapatFn();
              }}
            >Ekle</button>
          </>
        )}
      </Ekle>

      {/* ---------- TAKSİTLER ---------- */}
      <div className="kb-h">Taksitler</div>
      {d.taksitler.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {d.taksitler.map((x) => {
            const gecen = fark(x.baslangic, buAy);
            const kalan = Math.max(sayi(x.ay) - gecen, 0);
            const bitti = kalan === 0;
            const ilerleme = Math.min(Math.max(gecen + 1, 0) / sayi(x.ay), 1) * 100;
            const kart = (d.kartlar || []).find((y) => y.id === x.kartId);
            return (
              <div className="kb-row" key={x.id} style={{ opacity: bitti ? 0.45 : 1 }}>
                <Rozet e={bitti ? "✓" : "•"} r={bitti ? "#697077" : "#8A6A14"} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{x.baslik}{kart && <span className="kb-tag">{kart.ad}</span>}</div>
                  <div className="kb-row-s">
                    {bitti ? "bitti" : `${Math.min(gecen + 1, x.ay)}/${x.ay} · ${kalan} ay · kalan ${kisa(kalan * sayi(x.aylik))}`}
                  </div>
                  {!bitti && <div className="kb-meter"><i style={{ width: `${ilerleme}%`, background: "#8A6A14" }} /></div>}
                </div>
                <span className="kb-amt">{tl(x.aylik)}</span>
                <button className="kb-del" onClick={() => sil({ taksitler: d.taksitler.filter((y) => y.id !== x.id) }, `${x.baslik} silindi`)} aria-label="Sil">×</button>
              </div>
            );
          })}
        </div>
      )}
      <Ekle etiket="Taksit ekle" baslik="Taksit ekle">
        {(kapatFn) => (
          <>
            <Alan etiket="Ne için">
              <input className="kb-in" value={t.baslik} onChange={(e) => setT({ ...t, baslik: e.target.value })} placeholder="Buzdolabı" autoFocus />
            </Alan>
            <div className="kb-2">
              <Alan etiket="Aylık tutar">
                <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={t.aylik} onChange={(e) => setT({ ...t, aylik: e.target.value })} placeholder="0" />
              </Alan>
              <Alan etiket="Kaç ay">
                <input className="kb-in" data-num="1" type="number" min="1" value={t.ay} onChange={(e) => setT({ ...t, ay: e.target.value })} />
              </Alan>
            </div>
            <Alan etiket="İlk taksit ayı">
              <input className="kb-in" type="month" value={t.baslangic} onChange={(e) => setT({ ...t, baslangic: e.target.value })} />
            </Alan>
            <Alan
              etiket="Hangi kartta"
              ipucu="Karta bağlanan taksitin bu ayki dilimi ekstre içinde sayılır; iki kez düşülmez."
            >
              <div className="kb-chips">
                <button className="kb-chip" data-on={!t.kartId ? "1" : "0"} onClick={() => setT({ ...t, kartId: null })}>Kart dışı</button>
                {(d.kartlar || []).map((c) => (
                  <button key={c.id} className="kb-chip" data-on={t.kartId === c.id ? "1" : "0"} onClick={() => setT({ ...t, kartId: c.id })}>
                    <span>{c.banka}</span>{c.ad}
                  </button>
                ))}
              </div>
            </Alan>
            <button
              className="kb-btn" disabled={!t.aylik || !t.baslik}
              onClick={() => {
                if (!t.aylik || !t.baslik) return;
                yaz({ taksitler: [...d.taksitler, { ...t, id: uid(), aylik: sayi(t.aylik), ay: sayi(t.ay) || 1 }] });
                setT({ ...t, baslik: "", aylik: "" }); kapatFn();
              }}
            >Ekle</button>
          </>
        )}
      </Ekle>

      {/* ---------- PLANLI ---------- */}
      <div className="kb-h">Gelecek harcamalar</div>
      {d.planli.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {d.planli.slice().sort((a, b) => String(a.tarih).localeCompare(String(b.tarih))).map((x) => (
            <div className="kb-row" key={x.id}>
              <Rozet e="•" r="#697077" />
              <div className="kb-row-main">
                <div className="kb-row-t">{x.baslik}</div>
                <div className="kb-row-s">{new Date(x.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <span className="kb-amt">{tl(x.tutar)}</span>
              <button className="kb-del" onClick={() => sil({ planli: d.planli.filter((y) => y.id !== x.id) }, `${x.baslik} silindi`)} aria-label="Sil">×</button>
            </div>
          ))}
        </div>
      )}
      <Ekle etiket="Gelecek harcama ekle" baslik="Gelecek harcama">
        {(kapatFn) => (
          <>
            <Alan etiket="Ne">
              <input className="kb-in" value={p.baslik} onChange={(e) => setP({ ...p, baslik: e.target.value })} placeholder="Vergi ödemesi" autoFocus />
            </Alan>
            <div className="kb-2">
              <Alan etiket="Tutar">
                <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={p.tutar} onChange={(e) => setP({ ...p, tutar: e.target.value })} placeholder="0" />
              </Alan>
              <Alan etiket="Tarih">
                <input className="kb-in" type="date" value={p.tarih} onChange={(e) => setP({ ...p, tarih: e.target.value })} />
              </Alan>
            </div>
            <button
              className="kb-btn" disabled={!p.tutar || !p.baslik}
              onClick={() => {
                if (!p.tutar || !p.baslik) return;
                yaz({ planli: [...d.planli, { ...p, id: uid(), tutar: sayi(p.tutar) }] });
                setP({ ...p, baslik: "", tutar: "" }); kapatFn();
              }}
            >Ekle</button>
          </>
        )}
      </Ekle>

      <button className="kb-add" style={{ marginTop: 24 }} onClick={() => setDokum(!dokum)}>
        {dokum ? "Ay ay dökümü — gizle" : "Ay ay dökümü"}
      </button>
      {dokum && (
      <div className="kb-card" style={{ marginTop: 10 }}>
        {proj.map((x) => (
          <div className="kb-row" key={x.anahtar}>
            <div className="kb-row-main">
              <div className="kb-row-t">{x.uzun} {x.yil}{x.kismi && <span className="kb-tag">kalan</span>}</div>
              <div className="kb-row-s">+{kisa(x.gelir)} · −{kisa(x.gider + x.taksit + x.plan + x.kart)}</div>
            </div>
            <span className="kb-amt" style={{ color: x.net < 0 ? "var(--neg)" : "var(--pos)" }}>
              {x.net > 0 ? "+" : ""}{tl(x.net)}
            </span>
          </div>
        ))}
      </div>
      )}

      <Sheet acik={!!duzenSabit} kapat={() => setDuzenSabit(null)} baslik="Sabit gideri düzenle">
        {duzenSabit && (
          <>
            <SabitFormu
              d={d} s={duzenSabit} setS={setDuzenSabit}
              kaydet={() => sabitKaydet(duzenSabit, () => setDuzenSabit(null))}
              etiket="Kaydet"
            />
            <button
              className="kb-btn-ghost kb-btn-dan" style={{ marginTop: 8 }}
              onClick={() => {
                sil({ sabitler: d.sabitler.filter((x) => x.id !== duzenSabit.id) }, `${duzenSabit.baslik} silindi`);
                setDuzenSabit(null);
              }}
            >
              Sabit gideri sil
            </button>
            <div className="kb-row-s" style={{ marginTop: 10, textAlign: "center", lineHeight: 1.6 }}>
              Geçmiş kayıtlar etkilenmez. Yalnız durdurmak için bitiş ayı gir.
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}

function SabitFormu({ d, s, setS, kaydet, etiket }) {
  return (
    <>
      <Alan etiket="Ne">
        <input className="kb-in" value={s.baslik} onChange={(e) => setS({ ...s, baslik: e.target.value })} placeholder="Kira" autoFocus />
      </Alan>
      <div className="kb-2">
        <Alan etiket="Aylık tutar">
          <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={s.tutar} onChange={(e) => setS({ ...s, tutar: e.target.value })} placeholder="0" />
        </Alan>
        <Alan etiket="Ayın kaçında">
          <input className="kb-in" data-num="1" type="number" min="1" max="31" value={s.gun} onChange={(e) => setS({ ...s, gun: e.target.value })} />
        </Alan>
      </div>
      <Alan etiket="Kategori">
        <KategoriSecici kategoriler={d.kategoriler} secili={s.kat} sec={(id) => setS({ ...s, kat: id })} />
      </Alan>
      {d.kisiler.length > 1 && (
        <>
          <Alan etiket="Kim ödüyor">
            <KisiSecici kisiler={d.kisiler} secili={s.kisiId} sec={(id) => setS({ ...s, kisiId: id })} />
          </Alan>
          <div className="kb-field">
            <Anahtar
              acik={s.ortak !== false}
              degistir={() => setS({ ...s, ortak: s.ortak === false })}
              baslik="Ortak gider"
              alt={s.ortak === false ? "Bölüşmeye girmez" : "Denkleştirmede herkesin payına düşer"}
            />
          </div>
        </>
      )}
      <div className="kb-2">
        <Alan etiket="Başlangıç ayı">
          <input className="kb-in" type="month" value={s.baslangic} onChange={(e) => setS({ ...s, baslangic: e.target.value })} />
        </Alan>
        <Alan etiket="Bitiş (boş = süresiz)">
          <input className="kb-in" type="month" value={s.bitis || ""} onChange={(e) => setS({ ...s, bitis: e.target.value })} />
        </Alan>
      </div>
      <button className="kb-btn" onClick={kaydet} disabled={!s.baslik || !s.tutar}>{etiket}</button>
    </>
  );
}

/* ================================================================== */
/*  Ayarlar                                                            */
/* ================================================================== */

function Ayar({ d, yaz, sil, setD, otoDegisken }) {
  const [kAd, setKAd] = useState("");
  const [kEmoji, setKEmoji] = useState(AVATARLAR[1]);
  const [duzenKisi, setDuzenKisi] = useState(null);
  const [catAd, setCatAd] = useState("");
  const [catEmoji, setCatEmoji] = useState("🎁");
  const [duzenCat, setDuzenCat] = useState(null);
  const [mesaj, setMesaj] = useState("");
  const [g, setG] = useState({ kisiId: d.kisiler[0]?.id, tutar: "", gun: 1, etiket: "Maaş" });

  const sabitVar = (d.sabitler || []).length > 0;
  const kartToplam = (d.kartlar || []).reduce((t, k) => t + sayi(k.borc), 0);

  const kisiKayit = (id) =>
    d.harcamalar.filter((h) => h.kisiId === id).length +
    d.gelirler.filter((g) => g.kisiId === id).length +
    (d.sabitler || []).filter((s) => s.kisiId === id).length +
    d.birikim.filter((b) => b.kisiId === id).length;

  const catKayit = (id) =>
    d.harcamalar.filter((h) => h.kat === id).length +
    (d.sabitler || []).filter((s) => s.kat === id).length;

  const kisiEkle = () => {
    const ad = kAd.trim();
    if (!ad) return;
    yaz({
      kisiler: [...d.kisiler, { id: uid(), ad, e: kEmoji, r: RENKLER[d.kisiler.length % RENKLER.length], pay: 1 }],
    });
    setKAd("");
    setKEmoji(AVATARLAR[(d.kisiler.length + 1) % AVATARLAR.length]);
  };

  const yedekYukle = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try { setD(gocur(JSON.parse(String(fr.result)))); setMesaj("Yedek yüklendi."); }
      catch { setMesaj("Dosya okunamadı — geçerli bir yedek JSON'u seç."); }
    };
    fr.readAsText(f);
    e.target.value = "";
  };

  const payToplam = d.kisiler.reduce((t, k) => t + sayi(k.pay), 0) || 1;

  return (
    <>
      <div className="kb-h">Kişiler{d.kisiler.length > 1 && <span>{d.kisiler.length} kişi</span>}</div>
      <div className="kb-card" style={{ marginBottom: 10 }}>
        {d.kisiler.map((k) => (
          <button className="kb-row" key={k.id} onClick={() => setDuzenKisi({ ...k })}>
            <Rozet e={k.e} r={k.r} />
            <div className="kb-row-main">
              <div className="kb-row-t">{k.ad}</div>
              <div className="kb-row-s">
                {d.kisiler.length > 1
                  ? `ortak payı %${Math.round((sayi(k.pay) / payToplam) * 100)} · ${kisiKayit(k.id)} kayıt`
                  : `${kisiKayit(k.id)} kayıt`}
              </div>
            </div>
            <span className="kb-row-s">düzenle ›</span>
          </button>
        ))}
      </div>

      <Ekle etiket="Kişi ekle" baslik="Kişi ekle">
        {(kapatFn) => (
          <>
            <Alan etiket="İsim">
              <input className="kb-in" value={kAd} onChange={(e) => setKAd(e.target.value)} placeholder="İsim" autoFocus />
            </Alan>
            <Alan etiket="Simge">
              <div className="kb-chips">
                {AVATARLAR.map((e) => (
                  <button key={e} className="kb-chip" data-on={kEmoji === e ? "1" : "0"} onClick={() => setKEmoji(e)} style={{ padding: "7px 11px" }}>{e}</button>
                ))}
              </div>
            </Alan>
            <button className="kb-btn" disabled={!kAd.trim()} onClick={() => { kisiEkle(); kapatFn(); }}>Kişi ekle</button>
          </>
        )}
      </Ekle>
      {d.kisiler.length === 1 && (
        <div className="kb-row-s" style={{ margin: "10px 2px 0", lineHeight: 1.5 }}>
          Hesabı ortak kullanmak için kişi ekle — bölüşme ve denkleştirme o zaman görünür.
        </div>
      )}

      <div className="kb-h">Kategoriler <span>{d.kategoriler.length}</span></div>
      <div className="kb-card" style={{ marginBottom: 10 }}>
        {d.kategoriler.map((c) => (
          <button className="kb-row" key={c.id} onClick={() => setDuzenCat({ ...c })}>
            <Rozet e={c.e} r={c.r} />
            <div className="kb-row-main">
              <div className="kb-row-t">{c.ad}</div>
              <div className="kb-row-s">{catKayit(c.id)} kayıt</div>
            </div>
            <span className="kb-row-s">düzenle ›</span>
          </button>
        ))}
      </div>

      <Ekle etiket="Kategori ekle" baslik="Kategori ekle">
        {(kapatFn) => (
          <>
            <Alan etiket="Ad">
              <input className="kb-in" value={catAd} onChange={(e) => setCatAd(e.target.value)} placeholder="Kategori adı" autoFocus />
            </Alan>
            <Alan etiket="Simge">
              <div className="kb-chips">
                {EMOJILER.map((e) => (
                  <button key={e} className="kb-chip" data-on={catEmoji === e ? "1" : "0"} onClick={() => setCatEmoji(e)} style={{ padding: "7px 11px" }}>{e}</button>
                ))}
              </div>
            </Alan>
            <button
              className="kb-btn" disabled={!catAd.trim()}
              onClick={() => {
                if (!catAd.trim()) return;
                yaz({ kategoriler: [...d.kategoriler, { id: uid(), ad: catAd.trim(), e: catEmoji, r: RENKLER[d.kategoriler.length % RENKLER.length] }] });
                setCatAd("");
                kapatFn();
              }}
            >Kategori ekle</button>
          </>
        )}
      </Ekle>

      <div className="kb-h">Gelir</div>
      {d.gelirler.length > 0 && (
        <div className="kb-card" style={{ marginBottom: 10 }}>
          {d.gelirler.map((x) => {
            const kisi = d.kisiler.find((y) => y.id === x.kisiId);
            const kg = gunKaldi(x.gun);
            return (
              <div className="kb-row" key={x.id}>
                <Rozet e={kisi?.e || "💰"} r={kisi?.r || "#17694C"} />
                <div className="kb-row-main">
                  <div className="kb-row-t">{x.etiket} · {kisi?.ad || "—"}</div>
                  <div className="kb-row-s">her ayın {x.gun}. günü · {kg === 0 ? "bugün" : `${kg} gün kaldı`}</div>
                </div>
                <span className="kb-amt" style={{ color: "var(--pos)" }}>+{tl(x.tutar)}</span>
                <button className="kb-del" onClick={() => sil({ gelirler: d.gelirler.filter((y) => y.id !== x.id) }, "Maaş silindi")} aria-label="Sil">×</button>
              </div>
            );
          })}
        </div>
      )}
      <Ekle etiket="Maaş ekle" baslik="Maaş ekle">
        {(kapatFn) => (
          <>
            {d.kisiler.length > 1 && (
              <Alan etiket="Kim">
                <KisiSecici kisiler={d.kisiler} secili={g.kisiId} sec={(id) => setG({ ...g, kisiId: id })} />
              </Alan>
            )}
            <div className="kb-2">
              <Alan etiket="Net tutar">
                <input className="kb-in" data-num="1" type="number" inputMode="decimal" value={g.tutar} onChange={(e) => setG({ ...g, tutar: e.target.value })} placeholder="0" />
              </Alan>
              <Alan etiket="Ayın kaçında">
                <input className="kb-in" data-num="1" type="number" min="1" max="31" value={g.gun} onChange={(e) => setG({ ...g, gun: e.target.value })} />
              </Alan>
            </div>
            <Alan etiket="Etiket">
              <input className="kb-in" value={g.etiket} onChange={(e) => setG({ ...g, etiket: e.target.value })} placeholder="Maaş" />
            </Alan>
            <button
              className="kb-btn" disabled={!g.tutar}
              onClick={() => {
                if (!g.tutar) return;
                yaz({ gelirler: [...d.gelirler, { ...g, id: uid(), tutar: sayi(g.tutar), gun: sayi(g.gun) || 1 }] });
                setG({ ...g, tutar: "" }); kapatFn();
              }}
            >Ekle</button>
          </>
        )}
      </Ekle>

      <div className="kb-h">Hesaplama</div>
      <div className="kb-card" style={{ marginBottom: 10 }}>
        <Alan etiket="Değişken aylık gider" ipucu={
          sabitVar
            ? "Sabit giderler ayrı sayılır; buraya yalnız dalgalanan kalemler girer."
            : "Market, ulaşım gibi değişken kalemler. Kira gibi sabitleri Ödemeler sekmesine ekle."
        }>
          <div className="kb-chips" style={{ marginBottom: 10 }}>
            <button
              className="kb-chip" data-tone="soft" data-on={d.gider.mod === "oto" ? "1" : "0"}
              onClick={() => yaz({ gider: { ...d.gider, mod: "oto" } })}
            >
              Otomatik ({tl(otoDegisken)})
            </button>
            <button
              className="kb-chip" data-tone="soft" data-on={d.gider.mod === "elle" ? "1" : "0"}
              onClick={() => yaz({ gider: { ...d.gider, mod: "elle" } })}
            >
              Elle
            </button>
          </div>
          {d.gider.mod === "elle" ? (
            <input
              className="kb-in" data-num="1" type="number" inputMode="decimal"
              value={d.gider.deger || ""} placeholder="0"
              onChange={(e) => yaz({ gider: { mod: "elle", deger: sayi(e.target.value) } })}
            />
          ) : (
            <div className="kb-row-s">
              {otoDegisken > 0
                ? `Son 3 kapanmış ayın sabit dışı ortalaması: ${tl(otoDegisken)}. Yeni kayıtlarla güncellenir.`
                : "Kapanmış ay verisi yok; ilk aylar girildikçe ortalama burada görünür."}
            </div>
          )}
        </Alan>

        <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />

        <div className="kb-field">
          <Anahtar
            acik={d.ilkAyOranla}
            degistir={() => yaz({ ilkAyOranla: !d.ilkAyOranla })}
            baslik="İçinde bulunduğumuz ayı kalan güne göre hesapla"
            alt={d.ilkAyOranla
              ? "Günü geçmiş maaş, sabit ve kartlar bu ayın netine girmez"
              : "Bu ay tam ay olarak hesaplanır"}
          />
        </div>

        <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />

        <Alan etiket="Hesaplardaki toplam nakit">
          <input
            className="kb-in" data-num="1" type="number" inputMode="decimal"
            value={d.nakit || ""} placeholder="0"
            onChange={(e) => yaz({ nakit: sayi(e.target.value) })}
          />
        </Alan>
        <div className="kb-row-s" style={{ lineHeight: 1.55 }}>
          Altın ve döviz Birikim sekmesinde sayılır.
          {kartToplam > 0 && <> Kart borcu ({tl(kartToplam)}) bu aydan düşülür.</>}
        </div>
      </div>

      <div className="kb-h">Para birimi</div>
      <div className="kb-card" style={{ marginBottom: 10 }}>
        <div className="kb-chips">
          {BIRIMLER.map((b) => (
            <button key={b.kod} className="kb-chip" data-on={d.para === b.kod ? "1" : "0"} onClick={() => yaz({ para: b.kod })}>
              <span className="kb-num">{b.simge}</span>{b.kod}
            </button>
          ))}
        </div>
        <div className="kb-row-s" style={{ marginTop: 10, lineHeight: 1.5 }}>
          Yalnız gösterim simgesi değişir; kayıtlı tutarlar dönüştürülmez.
        </div>
      </div>

      <div className="kb-h">Veri</div>
      <div className="kb-card">
        <button
          className="kb-btn-ghost"
          onClick={() => {
            const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `ortak-butce-${bugun()}.json`;
            a.click();
          }}
        >Yedeği indir (JSON)</button>
        <label className="kb-btn-ghost" style={{ display: "block", marginTop: 8, textAlign: "center" }}>
          Yedekten geri yükle
          <input type="file" accept="application/json,.json" onChange={yedekYukle} style={{ display: "none" }} />
        </label>
        {mesaj && <div className="kb-row-s" style={{ marginTop: 10, textAlign: "center" }}>{mesaj}</div>}
        <div className="kb-row-s" style={{ marginTop: 11, lineHeight: 1.6 }}>
          Veriler kendi Supabase veritabanınızda tutulur; ev kodunu bilen herkes aynı kayıtları görür.
        </div>
      </div>

      <Sheet acik={!!duzenKisi} kapat={() => setDuzenKisi(null)} baslik="Kişiyi düzenle">
        {duzenKisi && (
          <>
            <Alan etiket="İsim">
              <input className="kb-in" value={duzenKisi.ad} onChange={(e) => setDuzenKisi({ ...duzenKisi, ad: e.target.value })} />
            </Alan>
            <Alan etiket="Simge">
              <div className="kb-chips">
                {AVATARLAR.map((e) => (
                  <button key={e} className="kb-chip" data-on={duzenKisi.e === e ? "1" : "0"} onClick={() => setDuzenKisi({ ...duzenKisi, e })} style={{ padding: "7px 11px" }}>{e}</button>
                ))}
              </div>
            </Alan>
            <Alan etiket="Renk">
              <div className="kb-chips">
                {RENKLER.map((r) => (
                  <button
                    key={r} className="kb-chip" onClick={() => setDuzenKisi({ ...duzenKisi, r })}
                    style={{ background: r, width: 34, height: 34, padding: 0, borderRadius: 12, border: duzenKisi.r === r ? "3px solid var(--ink)" : "3px solid transparent" }}
                    aria-label={r}
                  />
                ))}
              </div>
            </Alan>
            {d.kisiler.length > 1 && (
              <Alan etiket="Ortak harcamalardaki pay ağırlığı" ipucu="Eşit bölüşüm için herkeste 1 kalsın. Değişiklik geçmiş ayları da yeniden hesaplar.">
                <input
                  className="kb-in" data-num="1" type="number" min="0" step="0.5" inputMode="decimal"
                  value={duzenKisi.pay}
                  onChange={(e) => setDuzenKisi({ ...duzenKisi, pay: e.target.value })}
                />
              </Alan>
            )}
            <button
              className="kb-btn"
              onClick={() => {
                yaz({ kisiler: d.kisiler.map((k) => (k.id === duzenKisi.id ? { ...duzenKisi, ad: duzenKisi.ad.trim() || k.ad, pay: sayi(duzenKisi.pay) } : k)) });
                setDuzenKisi(null);
              }}
            >Kaydet</button>
            {d.kisiler.length > 1 && (
              kisiKayit(duzenKisi.id) === 0 ? (
                <button
                  className="kb-btn-ghost kb-btn-dan" style={{ marginTop: 8 }}
                  onClick={() => { sil({ kisiler: d.kisiler.filter((k) => k.id !== duzenKisi.id) }, `${duzenKisi.ad} silindi`); setDuzenKisi(null); }}
                >Kişiyi sil</button>
              ) : (
                <div className="kb-row-s" style={{ marginTop: 10, textAlign: "center", lineHeight: 1.6 }}>
                  Bu kişiye bağlı {kisiKayit(duzenKisi.id)} kayıt var. Önce o kayıtları taşı ya da sil.
                </div>
              )
            )}
          </>
        )}
      </Sheet>

      <Sheet acik={!!duzenCat} kapat={() => setDuzenCat(null)} baslik="Kategoriyi düzenle">
        {duzenCat && (
          <>
            <Alan etiket="Ad">
              <input className="kb-in" value={duzenCat.ad} onChange={(e) => setDuzenCat({ ...duzenCat, ad: e.target.value })} />
            </Alan>
            <Alan etiket="Simge">
              <div className="kb-chips">
                {EMOJILER.map((e) => (
                  <button key={e} className="kb-chip" data-on={duzenCat.e === e ? "1" : "0"} onClick={() => setDuzenCat({ ...duzenCat, e })} style={{ padding: "7px 11px" }}>{e}</button>
                ))}
              </div>
            </Alan>
            <Alan etiket="Renk">
              <div className="kb-chips">
                {RENKLER.map((r) => (
                  <button
                    key={r} className="kb-chip" onClick={() => setDuzenCat({ ...duzenCat, r })}
                    style={{ background: r, width: 34, height: 34, padding: 0, borderRadius: 12, border: duzenCat.r === r ? "3px solid var(--ink)" : "3px solid transparent" }}
                    aria-label={r}
                  />
                ))}
              </div>
            </Alan>
            <button
              className="kb-btn"
              onClick={() => {
                yaz({ kategoriler: d.kategoriler.map((c) => (c.id === duzenCat.id ? { ...duzenCat, ad: duzenCat.ad.trim() || c.ad } : c)) });
                setDuzenCat(null);
              }}
            >Kaydet</button>
            {catKayit(duzenCat.id) === 0 ? (
              <button
                className="kb-btn-ghost kb-btn-dan" style={{ marginTop: 8 }}
                onClick={() => { sil({ kategoriler: d.kategoriler.filter((c) => c.id !== duzenCat.id) }, `${duzenCat.ad} silindi`); setDuzenCat(null); }}
              >Kategoriyi sil</button>
            ) : (
              <div className="kb-row-s" style={{ marginTop: 10, textAlign: "center", lineHeight: 1.6 }}>
                Bu kategoride {catKayit(duzenCat.id)} kayıt var; silinemez. Adını değiştirebilirsin.
              </div>
            )}
          </>
        )}
      </Sheet>
    </>
  );
}
