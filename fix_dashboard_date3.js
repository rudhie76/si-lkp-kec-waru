const fs = require('fs');
let c = fs.readFileSync('components/DashboardView.jsx', 'utf8');

const start = c.indexOf('const formatShortDate = (dateStr) => {');
const end = c.indexOf('  };', start) + 4; // '  };\n'

if (start > -1 && end > start) {
  const newFunction = `const formatShortDate = (dateStr) => {
    if (!dateStr) return 'Hari Ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const day = d.getDate();
      
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const dayName = days[d.getDay()];
      const dd = String(day).padStart(2, '0');
      const mmm = months[monthIndex];
      return \`\${dayName}, \${dd}/\${mmm}/\${year}\`;
    } catch(e) {
      return String(dateStr);
    }
  };`;
  
  c = c.substring(0, start) + newFunction + c.substring(end);
  fs.writeFileSync('components/DashboardView.jsx', c);
  console.log("Success");
} else {
  console.log("Not found");
}
