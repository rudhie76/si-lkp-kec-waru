const fs = require('fs');
let c = fs.readFileSync('components/DashboardView.jsx', 'utf8');

const targetFunction = `  // 7 Active Days Accumulated Work Duration Calculation
  const getLast7DaysData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      
      const dayReports = reports.filter(r => r.tanggal === isoDate && (r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui'));
      const hours = dayReports.reduce((sum, r) => sum + (getDurasiFallback(r)), 0);

      dates.push({
        isoDate,
        label: \`\${dayName} \${dayNum}\`,
        hours: parseFloat(hours.toFixed(1)),
        pct: Math.min(100, Math.round((hours / 8) * 100))
      });
    }
    return dates;
  };`;

const newFunction = `  const formatToYYYYMMDD = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal).substring(0, 10);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return \`\${year}-\${month}-\${day}\`;
    } catch(e) {
      return String(dateVal).substring(0, 10);
    }
  };

  // 7 Active Days Accumulated Work Duration Calculation
  const getLast7DaysData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localIsoDate = \`\${year}-\${month}-\${day}\`;
      
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNum = d.getDate();
      
      const dayReports = reports.filter(r => {
        const rDate = formatToYYYYMMDD(r.tanggal);
        return rDate === localIsoDate && (r.status === 'DIVALIDASI' || r.status === 'PENDING' || r.status === 'Disetujui' || r.status === 'Menunggu Verifikasi');
      });
      const hours = dayReports.reduce((sum, r) => sum + (getDurasiFallback(r)), 0);

      dates.push({
        isoDate: localIsoDate,
        label: \`\${dayName} \${dayNum}\`,
        hours: parseFloat(hours.toFixed(1)),
        pct: Math.min(100, Math.round((hours / 8) * 100))
      });
    }
    return dates;
  };`;

if(c.includes(targetFunction)) {
  c = c.replace(targetFunction, newFunction);
  fs.writeFileSync('components/DashboardView.jsx', c);
  console.log("Replaced");
} else {
  console.log("Not found");
}
