const fs = require('fs');
const file = 'components/CetakLKH.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{filteredReports\.reduce\(\(total, r\) => \{[\s\S]*?\}, 0\)\}\s*Jam/g;
content = content.replace(regex, '{totalJamKerja} Jam');

const targetSpan = '<td colSpan={2} className="border border-black p-2"></td>';
const replacementSpan = '<td colSpan={2} className="border border-black p-2 text-center text-emerald-800 font-bold">{penilaianAkhir && `Penilaian: ${penilaianAkhir}`}</td>';
content = content.replace(targetSpan, replacementSpan);

fs.writeFileSync(file, content);
console.log('done2');
