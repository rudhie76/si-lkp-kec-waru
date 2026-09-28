const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Change header width for Foto 
  content = content.replace(/<th className="border border-black p-2 w-16">Foto \/ File Dukung<\/th>/g, '<th className="border border-black p-2 w-28">Foto / File Dukung</th>');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

fix('components/RekapitulasiBulanan.jsx');
