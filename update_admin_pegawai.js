const fs = require('fs');

const file = 'components/ManajemenPegawai.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const isAdmin = currentUser\?\.role === 'Admin';/g;
const newDef = `const isSekcam = Boolean(
    currentUser?.jabatan?.toLowerCase().includes('sekcam') ||
    currentUser?.role?.toLowerCase().includes('sekcam') ||
    currentUser?.peranStruktur?.includes('Sekcam')
  );
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.id === '0' || isSekcam;`;

content = content.replace(regex, newDef);
fs.writeFileSync(file, content);
console.log('Fixed ManajemenPegawai');
