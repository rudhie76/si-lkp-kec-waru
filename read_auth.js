const fs = require('fs');
const content = fs.readFileSync('components/AuthView.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Atasan') || l.includes('atasan')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
