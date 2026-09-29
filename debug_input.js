const fs = require('fs');

const file = 'components/InputKegiatan.jsx';
let content = fs.readFileSync(file, 'utf8');

const logInjection = `
    const newReport = {
      id: editingReportId || \`LKH-\${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-\${Math.floor(1000 + Math.random() * 9000)}\`,
      tanggal: formData.tanggal,
      pegawaiId: reportOwner.id,
      namaPegawai: reportOwner.name,
      nip: reportOwner.nip,
      jabatan: reportOwner.jabatan || 'ASN',
      detailKegiatan: [detailItem],
      deskripsi: formData.deskripsi,
      durasiJam: durasi,
      lampiranUrl: detailItem.fotoUrl,
      status: isCamat ? 'DIVALIDASI' : 'PENDING',
      catatanAtasan: isCamat ? 'Otomatis divalidasi (Atasan Tertinggi)' : '',
      diverifikasiOleh: isCamat ? 'Sistem' : '',
      waktuInput: \`\${new Date().toLocaleDateString('id-ID')} \${new Date().toLocaleTimeString('id-ID')} WITA\`
    };
    console.log("DEBUG: Editing report from InputKegiatan:", newReport);
`;

const target = `    const newReport = {
      id: editingReportId || \`LKH-\${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-\${Math.floor(1000 + Math.random() * 9000)}\`,
      tanggal: formData.tanggal,
      pegawaiId: reportOwner.id,
      namaPegawai: reportOwner.name,
      nip: reportOwner.nip,
      jabatan: reportOwner.jabatan || 'ASN',
      detailKegiatan: [detailItem],
      deskripsi: formData.deskripsi,
      durasiJam: durasi,
      lampiranUrl: detailItem.fotoUrl,
      status: isCamat ? 'DIVALIDASI' : 'PENDING',
      catatanAtasan: isCamat ? 'Otomatis divalidasi (Atasan Tertinggi)' : '',
      diverifikasiOleh: isCamat ? 'Sistem' : '',
      waktuInput: \`\${new Date().toLocaleDateString('id-ID')} \${new Date().toLocaleTimeString('id-ID')} WITA\`
    };`;

if(content.includes(target)) {
  content = content.replace(target, logInjection);
  fs.writeFileSync(file, content);
  console.log("Injected log");
} else {
  console.log("Could not find target");
}
