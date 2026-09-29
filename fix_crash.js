const fs = require('fs');

const funcDef = `
// Fallback for missing durasiJam
const getDurasiFallback = (item) => {
  if (item.durasiJam) return item.durasiJam;
  if (item.detailKegiatan && item.detailKegiatan.length > 0) {
    const keg = item.detailKegiatan[0];
    if (!keg.jamMulai || !keg.jamSelesai) return 0;
    const [h1, m1] = keg.jamMulai.split(':').map(Number);
    const [h2, m2] = keg.jamSelesai.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, Math.round((diff / 60) * 10) / 10);
  }
  return 0;
};
`;

['components/InputKegiatan.jsx', 'components/VerifikasiAtasan.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('const getDurasiFallback =')) {
    // Insert after the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfImport + 1) + funcDef + content.slice(endOfImport + 1);
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  }
});
