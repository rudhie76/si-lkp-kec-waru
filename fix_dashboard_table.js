const fs = require('fs');

const file = 'components/DashboardView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace {item.durasiJam} Jam
content = content.replace(/{item\.durasiJam}\s*Jam/g, '{getDurasiFallback(item)} Jam');

// Replace {selectedReport.durasiJam} Jam
content = content.replace(/{selectedReport\.durasiJam}\s*Jam/g, '{getDurasiFallback(selectedReport)} Jam');

// Replace parseFloat(r.durasiJam) || 0
content = content.replace(/parseFloat\(r\.durasiJam\) \|\| 0/g, 'getDurasiFallback(r)');

fs.writeFileSync(file, content);
console.log('Fixed DashboardView durasi usages.');
