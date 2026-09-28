const fs = require('fs');

function fix(file, isCetak) {
  let content = fs.readFileSync(file, 'utf8');

  // Change image sizes
  content = content.replace(/w-12 h-12 object-cover/g, 'w-10 h-10 object-cover');

  // Change header width for Foto (if it exists as w-24, change to w-28)
  content = content.replace(/<th className="border border-black p-2 w-24">Foto \/ File Dukung<\/th>/g, '<th className="border border-black p-2 w-28">Foto / File Dukung</th>');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

fix('components/CetakLKH.jsx', true);
fix('components/RekapitulasiBulanan.jsx', false);
