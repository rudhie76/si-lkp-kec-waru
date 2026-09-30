const fs = require('fs');

function patchFile(filepath) {
  let c = fs.readFileSync(filepath, 'utf8');

  // Update import
  c = c.replace(/import\s+\{\s*getDriveViewUrl\s*\}\s+from\s+'\.\.\/lib\/urlHelper';/, "import { getDriveViewUrl, handleMediaClick } from '../lib/urlHelper';");

  // Add onClick to all the <a> tags that use getDriveViewUrl
  c = c.replace(/<a\s+href=\{getDriveViewUrl\(([^)]+)\)\}\s+target="_blank"/g, (match, urlVar) => {
    return `<a href={getDriveViewUrl(${urlVar})} onClick={(e) => handleMediaClick(e, ${urlVar})} target="_blank"`;
  });

  fs.writeFileSync(filepath, c);
  console.log('Patched clicks in', filepath);
}

patchFile('components/CetakLKH.jsx');
patchFile('components/RekapitulasiBulanan.jsx');
patchFile('components/VerifikasiAtasan.jsx');
