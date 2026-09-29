const fs = require('fs');

let c = fs.readFileSync('components/DashboardView.jsx', 'utf8');

const targetFunction = `  // Short & Clean Date Formatting Helper: [Hari], [dd]/[MMM]/[yyyy]
  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'Hari Ini';
    try {
      // Clean raw GMT date strings if present
      let cleanStr = String(dateStr);
      if (cleanStr.includes('GMT') || cleanStr.includes('Waktu')) {
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) {
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dayName = days[d.getDay()];
          const dd = String(d.getDate()).padStart(2, '0');
          const mmm = months[d.getMonth()];
          const yyyy = d.getFullYear();
          return \`\${dayName}, \${dd}/\${mmm}/\${yyyy}\`;
        }
      }

      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, monthIndex, day);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        const dayName = days[dateObj.getDay()] || 'Hari';
        const dd = String(day).padStart(2, '0');
        const mmm = months[monthIndex] || parts[1];
        return \`\${dayName}, \${dd}/\${mmm}/\${year}\`;
      }
      return cleanStr;
    } catch(e) {
      return String(dateStr);
    }
  };`;

const newFunction = `  // Short & Clean Date Formatting Helper: [Hari], [dd]/[MMM]/[yyyy]
  const formatShortDate = (dateStr) => {
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

if(c.includes(targetFunction)) {
  c = c.replace(targetFunction, newFunction);
  fs.writeFileSync('components/DashboardView.jsx', c);
  console.log("Replaced formatShortDate in DashboardView.jsx");
} else {
  console.log("Could not find formatShortDate");
}
