import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const sb = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

const yetkili = (req) => {
  const kod = process.env.EV_KODU;
  return Boolean(kod) && req.headers.get("x-ev-kodu") === kod;
};

export async function GET(req) {
  if (!yetkili(req)) return new Response("yetkisiz", { status: 401 });
  const anahtar = new URL(req.url).searchParams.get("anahtar");
  if (!anahtar) return new Response("anahtar gerekli", { status: 400 });

  const { data, error } = await sb()
    .from("depo")
    .select("deger")
    .eq("anahtar", anahtar)
    .maybeSingle();

  if (error) return new Response("veritabanı hatası", { status: 500 });
  return Response.json({ value: data ? data.deger : null });
}

export async function PUT(req) {
  if (!yetkili(req)) return new Response("yetkisiz", { status: 401 });
  const { anahtar, deger } = await req.json();
  if (!anahtar || typeof deger !== "string")
    return new Response("anahtar ve deger gerekli", { status: 400 });

  const { error } = await sb()
    .from("depo")
    .upsert({ anahtar, deger, guncelleme: new Date().toISOString() });

  if (error) return new Response("veritabanı hatası", { status: 500 });
  return Response.json({ ok: true });
}
