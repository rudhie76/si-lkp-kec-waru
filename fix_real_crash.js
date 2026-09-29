const fs = require('fs');

['components/InputKegiatan.jsx', 'components/VerifikasiAtasan.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove the badly injected code
  const badStart = '\n// Fallback for missing durasiJam';
  const badEnd = '  return 0;\n};\n';
  
  if (content.includes(badStart)) {
    const startIndex = content.indexOf(badStart);
    const endIndex = content.indexOf(badEnd) + badEnd.length;
    content = content.slice(0, startIndex) + content.slice(endIndex);
  }
  
  // Now inject it properly right before "export default function"
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
  content = content.replace('export default function', funcDef + 'export default function');
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
