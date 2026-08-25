import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const sb = () =>
  createClient(
    (process.env.SUPABASE_URL || "").replace(/\/+$/, ""),
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

/* GET için ev kodu, teşhis kolaylığı olsun diye ?kod= ile de kabul edilir. */
const yetkili = (req, kodParam) => {
  const kod = process.env.EV_KODU;
  if (!kod) return false;
  return req.headers.get("x-ev-kodu") === kod || kodParam === kod;
};

export async function GET(req) {
  const u = new URL(req.url);
  if (!yetkili(req, u.searchParams.get("kod")))
    return new Response("yetkisiz", { status: 401 });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return new Response("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımsız", { status: 500 });

  /* Teşhis modu: sunucu hangi veritabanına, hangi anahtarla bakıyor? */
  if (u.searchParams.get("teshis") === "1") {
    const url = process.env.SUPABASE_URL || "(tanımsız)";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const tur = key.startsWith("sb_secret_")
      ? "sb_secret — DOĞRU tür"
      : key.startsWith("sb_publishable_")
      ? "sb_publishable — YANLIŞ: okumalar boş döner, yazmalar reddedilir"
      : key.startsWith("eyJ")
      ? "JWT — service_role ise doğru, anon ise yanlış"
      : key
      ? "bilinmeyen biçim"
      : "(tanımsız)";
    let satirSayisi = null, satirlar = null, hata = null;
    try {
      const { count, error } = await sb().from("depo").select("*", { count: "exact", head: true });
      if (error) hata = error.message;
      else satirSayisi = count;
      const { data } = await sb().from("depo").select("anahtar, deger").limit(5);
      satirlar = (data || []).map((x) => {
        let rev = null, harcama = null;
        try {
          const j = JSON.parse(x.deger);
          rev = j.rev ?? null;
          harcama = Array.isArray(j.harcamalar) ? j.harcamalar.length : null;
        } catch { /* çözümlemeye gerek yok */ }
        return { anahtar: JSON.stringify(x.anahtar), uzunluk: x.anahtar.length, rev, harcamaSayisi: harcama };
      });
    } catch (e) { hata = String(e); }
    return Response.json({
      rotaSurumu: "r9", // sunucu kodunun sürüm damgası
      supabaseUrl: url,
      anahtarTuru: tur,
      anahtarIlkKarakterler: key.slice(0, 18),
      depoSatirSayisi: satirSayisi,
      sunucununGorduguSatirlar: satirlar,
      hata,
    });
  }

  const anahtar = u.searchParams.get("anahtar");
  if (!anahtar) return new Response("anahtar gerekli", { status: 400 });

  /* eq() filtresi yerine: listele + kod içinde eşleştir.
     Listeleme sorgusunun satırı gördüğü kanıtlı; arayan gözü de aynı yapıyoruz. */
  const { data: liste, error } = await sb().from("depo").select("anahtar, deger").limit(20);

  if (error) {
    console.error("depo GET hatası:", error);
    return new Response("veritabanı hatası: " + error.message, { status: 500 });
  }

  const hedef = String(anahtar).trim();
  const satir = (liste || []).find((x) => String(x.anahtar).trim() === hedef);

  if (!satir) {
    /* Bulunamadıysa kanıt aynı yanıtta: aranan ile depodakiler yan yana. */
    return Response.json(
      {
        value: null,
        aranan: hedef,
        arananUzunluk: hedef.length,
        depodakiAnahtarlar: (liste || []).map((x) => ({
          anahtar: String(x.anahtar),
          uzunluk: String(x.anahtar).length,
        })),
      },
      { headers: { "cache-control": "no-store" } }
    );
  }
  return Response.json({ value: satir.deger }, { headers: { "cache-control": "no-store" } });
}

/* --- birleştirme: id'li diziler birleşir, aynı id'de gelen (istemci) kazanır.
       Mezar taşları (silinenler): silinen kimlikler asla geri dirilmez. --- */
const DIZI_ALANLAR = ["kisiler", "kategoriler", "harcamalar", "sabitler", "gelirler", "kartlar", "taksitler", "planli", "birikim", "denklestirmeler"];
function birlestir(gelen, depodaki) {
  const olen = { ...(depodaki?.silinenler || {}), ...(gelen?.silinenler || {}) };
  const dizi = (a, b) => {
    const m = new Map((b || []).map((x) => [x.id, x]));
    (a || []).forEach((x) => m.set(x.id, x));
    return [...m.values()].filter((x) => !olen[x.id]);
  };
  const out = { ...depodaki, ...gelen };
  DIZI_ALANLAR.forEach((k) => { out[k] = dizi(gelen[k], depodaki[k]); });
  out.silinenler = olen;
  return out;
}

export async function PUT(req) {
  if (!yetkili(req, null)) return new Response("yetkisiz", { status: 401 });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return new Response("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımsız", { status: 500 });

  const { anahtar, deger } = await req.json();
  if (!anahtar || typeof deger !== "string")
    return new Response("anahtar ve deger gerekli", { status: 400 });

  let gelen;
  try { gelen = JSON.parse(deger); }
  catch { return new Response("deger geçerli JSON değil", { status: 400 }); }

  /* Eski istemciler tabanRev göndermez — yazmaları REDDEDİLİR.
     Arka planda unutulmuş bayat kopyalar depoya bir daha dokunamaz. */
  if (gelen.tabanRev === undefined)
    return new Response("Bu cihazdaki uygulama sürümü eski — sayfayı yenileyip tekrar deneyin.", { status: 409 });
  const tabanRev = Number(gelen.tabanRev) || 0;
  delete gelen.tabanRev;

  const { data: putListe, error: okumaHatasi } = await sb()
    .from("depo")
    .select("anahtar, deger")
    .limit(20);

  if (okumaHatasi) {
    console.error("depo PUT okuma hatası:", okumaHatasi);
    return new Response("veritabanı hatası: " + okumaHatasi.message, { status: 500 });
  }
  const putHedef = String(anahtar).trim();
  const mevcut = (putListe || []).find((x) => String(x.anahtar).trim() === putHedef) || null;

  let sonuc = gelen;
  let yeniRev = 1;
  let birlesti = false;

  if (mevcut?.deger) {
    let depodaki = null;
    try { depodaki = JSON.parse(mevcut.deger); } catch { /* bozuksa gelen kazanır */ }
    const depoRev = Number(depodaki?.rev) || 0;
    yeniRev = depoRev + 1;
    if (depodaki && tabanRev !== depoRev) {
      /* İstemci bayat bir sürümü baz almış: EZME YOK — birleştir.
         Hiçbir yazma bir başkasının kaydını silemez. */
      sonuc = birlestir(gelen, depodaki);
      birlesti = true;
    }
  }

  sonuc.rev = yeniRev;

  const { error } = await sb()
    .from("depo")
    .upsert({ anahtar, deger: JSON.stringify(sonuc), guncelleme: new Date().toISOString() });

  if (error) {
    console.error("depo PUT hatası:", error);
    return new Response("veritabanı hatası: " + error.message, { status: 500 });
  }
  /* Birleştirme olduysa birleşik hali de dön — istemci ekranını anında eşitler. */
  return Response.json({ ok: true, rev: yeniRev, deger: birlesti ? JSON.stringify(sonuc) : undefined });
}
