export const metadata = {
  title: "Ortak Bütçe",
  description: "İki kişilik ev bütçesi",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ortak Bütçe" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport = {
  themeColor: "#17694C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function KokYerlesim({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, background: "#F2F3F5" }}>{children}</body>
    </html>
  );
}
