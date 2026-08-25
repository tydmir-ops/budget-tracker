"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { evKodu, evKoduKaydet } from "../lib/depo";

const OrtakButce = dynamic(() => import("../components/OrtakButce"), { ssr: false });

function Kapi({ girisYap }) {
  const [kod, setKod] = useState("");
  const stil = {
    kutu: {
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F2F3F5", fontFamily: "Inter, system-ui, sans-serif", padding: 16,
    },
    kart: {
      background: "#fff", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 340,
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
    },
    baslik: { fontSize: 18, fontWeight: 700, color: "#191C1F", margin: 0 },
    aciklama: { fontSize: 13, color: "#697077", lineHeight: 1.5, margin: "8px 0 18px" },
    giris: {
      width: "100%", boxSizing: "border-box", background: "#EEF0F2", border: "1px solid transparent",
      borderRadius: 12, padding: "12px 14px", fontSize: 16, outline: "none",
      fontFamily: "inherit", color: "#191C1F", marginBottom: 12,
    },
    dugme: {
      width: "100%", background: "#17694C", color: "#fff", border: "none", borderRadius: 12,
      padding: 13, fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    },
  };
  return (
    <div style={stil.kutu}>
      <form
        style={stil.kart}
        onSubmit={(e) => { e.preventDefault(); if (kod.trim()) girisYap(kod.trim()); }}
      >
        <h1 style={stil.baslik}>Ortak Bütçe</h1>
        <p style={stil.aciklama}>Devam etmek için ev kodunu gir. Kod bu cihazda saklanır; bir daha sorulmaz.</p>
        <input
          style={stil.giris}
          type="password"
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Ev kodu"
          autoFocus
        />
        <button style={stil.dugme} type="submit" disabled={!kod.trim()}>Giriş</button>
      </form>
    </div>
  );
}

export default function Sayfa() {
  const [hazir, setHazir] = useState(false);
  const [girildi, setGirildi] = useState(false);

  useEffect(() => {
    setGirildi(Boolean(evKodu()));
    setHazir(true);
  }, []);

  if (!hazir) return null;
  if (!girildi) return <Kapi girisYap={(k) => { evKoduKaydet(k); setGirildi(true); }} />;
  return <OrtakButce />;
}
