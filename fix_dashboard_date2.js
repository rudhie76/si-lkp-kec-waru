const fs = require('fs');

let c = fs.readFileSync('components/DashboardView.jsx', 'utf8');

const regex = /const formatShortDate = \(dateStr\) => \{[\s\S]*?return cleanStr;\r?\n\s*\} catch\(e\) \{\r?\n\s*return String\(dateStr\);\r?\n\s*\}\r?\n\s*\};/m;

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

if(regex.test(c)) {
  c = c.replace(regex, newFunction);
  fs.writeFileSync('components/DashboardView.jsx', c);
  console.log("Replaced formatShortDate");
} else {
  console.log("Regex not matched");
}
