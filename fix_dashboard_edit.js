const fs = require('fs');
const file = 'components/DashboardView.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `    const finalReport = {
      ...editingReport,
      detailKegiatan: updatedDetail,
      durasiJam: (parseFloat(editingReport.jamSelesai) - parseFloat(editingReport.jamMulai)) || editingReport.durasiJam
    };`;

const newLogic = `    const checkIsCamat = (user) => {
      if (!user) return false;
      const peran = (user.peranStruktur || '').toLowerCase();
      const jab = (user.jabatan || '').toLowerCase();
      if (peran.includes('sekretaris') || peran.includes('sekcam') || jab.includes('sekretaris') || jab.includes('sekcam')) return false;
      return /\\bcamat\\b/i.test(peran) || /\\bcamat\\b/i.test(jab);
    };
    const isCamat = checkIsCamat(currentUser);

    const finalReport = {
      ...editingReport,
      detailKegiatan: updatedDetail,
      durasiJam: (parseFloat(editingReport.jamSelesai) - parseFloat(editingReport.jamMulai)) || editingReport.durasiJam,
      status: isCamat ? 'DIVALIDASI' : 'PENDING',
      catatanAtasan: isCamat ? 'Otomatis divalidasi (Atasan Tertinggi)' : '',
      diverifikasiOleh: isCamat ? 'Sistem' : ''
    };`;

if(content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync(file, content);
  console.log("Fixed dashboard edit status logic!");
} else {
  console.log("Could not find old logic");
}
