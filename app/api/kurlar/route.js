export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* Anahtarsız, ücretsiz kaynaklar:
   - Döviz (USD/EUR → TRY): open.er-api.com  (günde bir güncellenir; atıf gerekir)
   - Altın/Gümüş spot (USD/ons): api.gold-api.com
   - Bitcoin/Ethereum (TRY): api.coingecko.com (anahtarsız açık API)
   Gram altın küresel spottan hesaplanır (Kapalıçarşı primi içermez);
   çeyrek altın ≈ gram × 1,65 yaklaşık değerdir. Kullanıcı elle düzeltebilir. */

const yetkili = (req) => {
  const kod = process.env.EV_KODU;
  return Boolean(kod) && req.headers.get("x-ev-kodu") === kod;
};

const ONS_GRAM = 31.1035;
const CEYREK_KATSAYI = 1.65;

let onbellek = { zaman: 0, veri: null };

const jsonAl = async (url) => {
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(url + " → " + r.status);
  return r.json();
};

export async function GET(req) {
  if (!yetkili(req)) return new Response("yetkisiz", { status: 401 });

  if (onbellek.veri && Date.now() - onbellek.zaman < 10 * 60 * 1000) {
    return Response.json(onbellek.veri);
  }

  const [doviz, altin, gumusOns, kripto] = await Promise.allSettled([
    jsonAl("https://open.er-api.com/v6/latest/USD"),
    jsonAl("https://api.gold-api.com/price/XAU"),
    jsonAl("https://api.gold-api.com/price/XAG"),
    jsonAl("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try"),
  ]);

  const k = { gramAltin: 0, ceyrekAltin: 0, usd: 0, eur: 0, gumus: 0, btc: 0, eth: 0 };

  if (doviz.status === "fulfilled" && doviz.value?.rates?.TRY) {
    const r = doviz.value.rates;
    k.usd = Math.round(r.TRY * 100) / 100;
    if (r.EUR) k.eur = Math.round((r.TRY / r.EUR) * 100) / 100;
  }

  if (k.usd > 0 && altin.status === "fulfilled" && altin.value?.price > 0) {
    k.gramAltin = Math.round((altin.value.price / ONS_GRAM) * k.usd);
    k.ceyrekAltin = Math.round(k.gramAltin * CEYREK_KATSAYI);
  }

  if (k.usd > 0 && gumusOns.status === "fulfilled" && gumusOns.value?.price > 0) {
    k.gumus = Math.round((gumusOns.value.price / ONS_GRAM) * k.usd * 100) / 100;
  }

  if (kripto.status === "fulfilled") {
    k.btc = Math.round(kripto.value?.bitcoin?.try || 0);
    k.eth = Math.round(kripto.value?.ethereum?.try || 0);
  }

  /* Hiçbir kaynak çalışmadıysa hata dön; kısmi başarıda sıfırlar
     istemcideki şüphe-onay ekranını tetikler, kullanıcı elle düzeltir. */
  if (Object.values(k).every((v) => v === 0)) {
    return new Response("kur kaynaklarına ulaşılamadı", { status: 502 });
  }

  onbellek = { zaman: Date.now(), veri: k };
  return Response.json(k);
}
