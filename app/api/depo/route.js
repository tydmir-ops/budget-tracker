import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const sb = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

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
    let satirSayisi = null, hata = null;
    try {
      const { count, error } = await sb().from("depo").select("*", { count: "exact", head: true });
      if (error) hata = error.message;
      else satirSayisi = count;
    } catch (e) { hata = String(e); }
    return Response.json({
      supabaseUrl: url,
      anahtarTuru: tur,
      anahtarIlkKarakterler: key.slice(0, 18),
      depoSatirSayisi: satirSayisi,
      hata,
    });
  }

  const anahtar = u.searchParams.get("anahtar");
  if (!anahtar) return new Response("anahtar gerekli", { status: 400 });

  const { data, error } = await sb()
    .from("depo")
    .select("deger")
    .eq("anahtar", anahtar)
    .maybeSingle();

  if (error) {
    console.error("depo GET hatası:", error);
    return new Response("veritabanı hatası: " + error.message, { status: 500 });
  }
  return Response.json({ value: data ? data.deger : null });
}

export async function PUT(req) {
  if (!yetkili(req, null)) return new Response("yetkisiz", { status: 401 });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return new Response("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tanımsız", { status: 500 });

  const { anahtar, deger } = await req.json();
  if (!anahtar || typeof deger !== "string")
    return new Response("anahtar ve deger gerekli", { status: 400 });

  const { error } = await sb()
    .from("depo")
    .upsert({ anahtar, deger, guncelleme: new Date().toISOString() });

  if (error) {
    console.error("depo PUT hatası:", error);
    return new Response("veritabanı hatası: " + error.message, { status: 500 });
  }
  return Response.json({ ok: true });
}
