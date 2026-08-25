/* İstemci → /api köprüsü.
   Ev kodu tarayıcının localStorage'ında durur ve her isteğe başlık olarak eklenir.
   Supabase ve Anthropic anahtarları tarayıcıya hiç inmez. */

export const evKodu = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("ev-kodu") || "" : "";

export const evKoduKaydet = (kod) => window.localStorage.setItem("ev-kodu", kod);
export const evKoduSil = () => window.localStorage.removeItem("ev-kodu");

const istek = async (yol, secenek = {}) => {
  const r = await fetch(yol, {
    ...secenek,
    headers: {
      "content-type": "application/json",
      "x-ev-kodu": evKodu(),
      ...(secenek.headers || {}),
    },
  });
  if (r.status === 401) {
    evKoduSil();
    if (typeof window !== "undefined") window.location.reload();
    throw new Error("yetkisiz");
  }
  if (!r.ok) throw new Error("istek başarısız: " + r.status);
  return r.json();
};

export const depo = {
  /* window.storage ile aynı sözleşme: { value: string | null } döner */
  get: (anahtar) => istek(`/api/depo?anahtar=${encodeURIComponent(anahtar)}`),
  set: (anahtar, deger) =>
    istek("/api/depo", { method: "PUT", body: JSON.stringify({ anahtar, deger }) }),
};
