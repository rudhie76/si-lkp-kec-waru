const fs = require('fs');
const content = fs.readFileSync('app/page.jsx', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('aside') || l.includes('md:w-64')) {
    console.log(`${i+1}: ${l}`);
  }
});
