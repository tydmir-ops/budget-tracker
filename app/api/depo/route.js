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
