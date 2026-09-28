const fs = require('fs');
const content = fs.readFileSync('components/AuthView.jsx', 'utf8');
const lines = content.split(/\r?\n/);
console.log(lines.slice(425, 470).join('\n'));
