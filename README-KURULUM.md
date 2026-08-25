# Ortak Bütçe — Kurulum Rehberi

Toplam süre: ilk kez yapıyorsan ~30-40 dakika. Kod yazman gerekmiyor;
her şey kopyala-yapıştır. Sıra önemli, adım atlamadan git.

## Gerekenler (hepsi ücretsiz katmanla çalışır)

1. **GitHub** hesabı — github.com
2. **Supabase** hesabı — supabase.com (veritabanı)
3. **Vercel** hesabı — vercel.com (GitHub ile giriş yap, bağlantı kendiliğinden kurulur)

Hepsi bu — kur verileri ücretsiz açık API'lerden gelir, ekstra anahtar gerekmez.

---

## 1. adım — Supabase: veritabanını kur (5 dk)

1. supabase.com → **New project** de. İsim: `ortak-butce`, güçlü bir
   veritabanı şifresi seç (not al), bölge: **Frankfurt (eu-central-1)**.
2. Proje açılınca sol menüden **SQL Editor** → **New query**.
3. Bu klasördeki `supabase.sql` dosyasının içeriğini yapıştır → **Run**.
   "Success" görmelisin.
4. Sol menü **Project Settings → API**'den şu ikisini kopyalayıp bir yere not et:
   - **Project URL** (https://xxxx.supabase.co)
   - **service_role** anahtarı ("Reveal" ile görünür — bu anahtar gizlidir,
     kimseyle paylaşma, sadece Vercel'e gireceksin)

## 2. adım — Kodu GitHub'a yükle (5 dk)

1. github.com → sağ üst **+** → **New repository**. İsim: `ortak-butce`,
   **Private** seç → Create.
2. Açılan sayfada **uploading an existing file** bağlantısına tıkla.
3. Bu klasördeki HER ŞEYİ (app, components, lib, public klasörleri +
   package.json, next.config.mjs, supabase.sql, .gitignore, .env.example)
   sürükleyip bırak → **Commit changes**.
   - Not: `.env.example`'ı yükle ama içine gerçek anahtar YAZMA;
     gerçek değerler yalnız Vercel'e girilecek.

## 3. adım — Vercel: yayına al (10 dk)

1. vercel.com → **Add New → Project** → GitHub'daki `ortak-butce` deposunu
   **Import** et. Framework otomatik "Next.js" görünecek; dokunma.
2. **Environment Variables** bölümüne şu 3 değişkeni ekle
   (adlar birebir böyle olmalı):

   | Ad | Değer |
   |---|---|
   | `SUPABASE_URL` | 1. adımda not ettiğin Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | 1. adımda not ettiğin service_role anahtarı |
   | `EV_KODU` | İkinizin bileceği bir parola (ör. `mavi-balkon-42`; boşluksuz) |

3. **Deploy** de. 1-2 dakika sonra `https://ortak-butce-xxxx.vercel.app`
   gibi bir adres alacaksın. Bu senin canlı adresin.

## 4. adım — İlk giriş ve veri taşıma (5 dk)

1. Adresi tarayıcıda aç → "Ev kodu" soracak → `EV_KODU`'ya yazdığın parolayı gir.
2. Uygulama boş açılır. Claude artifact'inde verin varsa:
   artifact'te **Ayarlar → Veri → Yedeği indir (JSON)** ile dosyayı al,
   yeni adreste **Ayarlar → Veri → Yedekten geri yükle** ile yükle.
   Bütün kayıtların aynen gelir.
3. **Ayarlar → Gelir**'den maaşları, **Ödemeler**'den sabitleri kontrol et.

## 5. adım — Telefonlara kur (2 dk / telefon)

- **iPhone:** Adresi **Safari**'de aç → Paylaş simgesi → **Ana Ekrana Ekle**.
- **Android:** Adresi **Chrome**'da aç → sağ üst ⋮ → **Ana ekrana ekle**
  (bazı telefonlarda "Uygulamayı yükle" yazar).

Her iki telefonda da ilk açılışta ev kodu bir kez sorulur, sonra sormaz.
İkiniz de aynı veriyi görürsünüz.

---

## Bilinmesi iyi olanlar

- **Yedek:** Ayda bir Ayarlar → Veri → Yedeği indir. Veri kendi
  Supabase'inde ama elde bir kopya her zaman iyidir.
- **Ev kodunu değiştirmek:** Vercel → Project → Settings →
  Environment Variables → `EV_KODU`'yu güncelle → Deployments'tan
  **Redeploy**. Telefonlar yeni kodu bir kez sorar.
- **Kur güncelleme:** Ücretsiz açık kaynaklardan gelir (döviz:
  exchangerate-api.com, altın/gümüş spot: gold-api.com, kripto:
  CoinGecko) ve 10 dakika önbellenir. Gram altın küresel spottan
  hesaplanır — Kapalıçarşı fiyatından biraz sapabilir; çeyrek,
  gram × 1,65 yaklaşık değeridir. Fark görürsen elle düzelt.
- **Adres çirkin geldiyse:** Vercel → Settings → Domains'ten ücretsiz
  `istedigin-isim.vercel.app` alabilir ya da kendi alan adını bağlayabilirsin.

## Sorun giderme

- **"yetkisiz" / sürekli ev kodu soruyor:** Girdiğin kod Vercel'deki
  `EV_KODU` ile birebir aynı değil (büyük/küçük harf dahil).
- **Deploy hata verdi:** Vercel'deki build logunun son satırlarını
  kopyala, bana gönder.
- **Kurlar gelmiyor / eksik geliyor:** Kaynaklardan biri geçici olarak
  yanıt vermiyordur. Eksik kalanlar "şüpheli" onay ekranına düşer;
  elle girip devam edebilirsin, sonra tekrar dene.
- **"Veri başka bir cihazda güncellenmiş" uyarısı:** Normal — iki telefon
  kısa aralıkla yazmış demektir. "Güncel veriyi yükle"ye bas, devam et.
