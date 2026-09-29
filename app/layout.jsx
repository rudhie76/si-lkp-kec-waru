import './globals.css';

export const viewport = {
  themeColor: '#10b981',
};

export const metadata = {
  title: 'Si-LKP Waru v1.5 - Sistem Laporan Kinerja Pegawai Kecamatan Waru',
  description: 'Aplikasi Laporan Kinerja Pegawai (LKH) Resmi Pemerintah Kecamatan Waru, Kabupaten Penajam Paser Utara.',
  manifest: '/si-lkp-kec-waru/manifest.json',
  icons: {
    icon: '/si-lkp-kec-waru/logo-ppu.png',
    apple: '/si-lkp-kec-waru/icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Si-LKP Waru',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/si-lkp-kec-waru/icon-512.png" />
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
