const fs = require('fs');

const calcStr = `
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

// Fix VerifikasiAtasan.jsx
let va = fs.readFileSync('components/VerifikasiAtasan.jsx', 'utf8');
if (!va.includes('getDurasiFallback')) {
  va = va.replace('export default function VerifikasiAtasan({ currentUser }) {', 'export default function VerifikasiAtasan({ currentUser }) {\n' + calcStr);
  va = va.replace(/{item\.durasiJam} Jam/g, '{getDurasiFallback(item)} Jam');
  fs.writeFileSync('components/VerifikasiAtasan.jsx', va);
}

// Fix InputKegiatan.jsx
let ik = fs.readFileSync('components/InputKegiatan.jsx', 'utf8');
if (!ik.includes('getDurasiFallback')) {
  ik = ik.replace('export default function InputKegiatan({ currentUser }) {', 'export default function InputKegiatan({ currentUser }) {\n' + calcStr);
  ik = ik.replace(/{item\.durasiJam} Jam/g, '{getDurasiFallback(item)} Jam');
  
  // also fix detailItem durasiJam save issue
  ik = ik.replace(
    'deskripsi: formData.deskripsi,',
    'deskripsi: formData.deskripsi,\n      durasiJam: durasi,'
  );
  
  fs.writeFileSync('components/InputKegiatan.jsx', ik);
}
console.log('Fixed durasiJam in both components');
