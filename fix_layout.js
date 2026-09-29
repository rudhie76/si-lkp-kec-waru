const fs = require('fs');
let layout = fs.readFileSync('app/layout.jsx', 'utf8');

const oldMetadata = `export const metadata = {
  title: 'Si-LKP Waru v1.5 - Sistem Laporan Kinerja Pegawai Kecamatan Waru',
  description: 'Aplikasi Laporan Kinerja Pegawai (LKH) Resmi Pemerintah Kecamatan Waru, Kabupaten Penajam Paser Utara.',
  manifest: '/si-lkp-kec-waru/manifest.json',
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Si-LKP Waru',
  },
};`;

const newMetadata = `export const viewport = {
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
};`;

if (layout.includes('export const metadata = {')) {
  layout = layout.replace(oldMetadata, newMetadata);
  fs.writeFileSync('app/layout.jsx', layout);
  console.log('Fixed metadata in layout.jsx');
}
