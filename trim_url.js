const fs = require('fs');
let c = fs.readFileSync('lib/googleSheets.js', 'utf8');
c = c.replace(
  "return localStorage.getItem('gs_webapp_url') || '';",
  "return (localStorage.getItem('gs_webapp_url') || '').trim();"
);
fs.writeFileSync('lib/googleSheets.js', c);
console.log('Trimmed URL in googleSheets.js');
