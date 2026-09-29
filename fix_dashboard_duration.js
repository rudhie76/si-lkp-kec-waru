const fs = require('fs');

const file = 'components/DashboardView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject getDurasiFallback
const funcDef = `
// Fallback for missing durasiJam
const getDurasiFallback = (item) => {
  if (item.durasiJam) return parseFloat(item.durasiJam) || 0;
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
if (!content.includes('const getDurasiFallback =')) {
  content = content.replace('export default function', funcDef + 'export default function');
}

// 2. Replace calculation logic
const calcRegex = /const totalDuration = reports[\s\S]*?\.reduce\(\(acc, curr\) => acc \+ \(parseFloat\(curr\.durasiJam\) \|\| 0\), 0\);/g;

const newCalc = `
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const validReports = reports.filter(r => r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui' || r.status === 'Menunggu Verifikasi');
  
  const totalDuration = validReports.reduce((acc, curr) => acc + getDurasiFallback(curr), 0);
  
  const totalDurationThisMonth = validReports.reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return acc + getDurasiFallback(curr);
    }
    return acc;
  }, 0);

  const totalDurationThisYear = validReports.reduce((acc, curr) => {
    if (!curr.tanggal) return acc;
    const d = new Date(curr.tanggal);
    if (d.getFullYear() === currentYear) {
      return acc + getDurasiFallback(curr);
    }
    return acc;
  }, 0);
`;

content = content.replace(calcRegex, newCalc);

// 3. Update the Card UI
const oldCardUI = `<h3 className="text-3xl font-extrabold text-gold-300 mt-1">{totalDuration.toFixed(1)} <span className="text-sm font-semibold text-white">Jam</span></h3>
              <p className="text-xs text-zinc-300 mt-1">Total akumulasi efektif</p>`;

const newCardUI = `<h3 className="text-3xl font-extrabold text-gold-300 mt-1">{totalDuration.toFixed(1)} <span className="text-sm font-semibold text-white">Jam</span></h3>
              <div className="flex flex-col gap-1 mt-2 border-t border-gold-800/30 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Bulan Ini:</span>
                  <span className="text-gold-200 font-bold">{totalDurationThisMonth.toFixed(1)} Jam</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Tahun Ini:</span>
                  <span className="text-gold-200 font-bold">{totalDurationThisYear.toFixed(1)} Jam</span>
                </div>
              </div>`;

content = content.replace(oldCardUI, newCardUI);

fs.writeFileSync(file, content);
console.log('Fixed DashboardView.jsx');
