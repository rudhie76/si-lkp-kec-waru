const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"\/logo-ppu\.png"/g, '"/si-lkp-kec-waru/logo-ppu.png"');
  fs.writeFileSync(file, content);
}

const files = [
  'app/page.jsx',
  'components/AuthView.jsx',
  'components/CetakLKH.jsx',
  'components/DashboardView.jsx',
  'components/RekapitulasiBulanan.jsx',
  'components/VerifikasiAtasan.jsx'
];

files.forEach(fixFile);
console.log('Done!');
