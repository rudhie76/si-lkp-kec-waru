const fs = require('fs');
let content = fs.readFileSync('app/layout.jsx', 'utf8');
content = content.replace(/\/logo-ppu\.png/g, '/icon-512.png');
fs.writeFileSync('app/layout.jsx', content);
