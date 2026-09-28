const fs = require('fs');

const file = 'app/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update isAdmin definition
const adminDefRegex = /const isAdmin = currentUser\.role === 'Admin' \|\| currentUser\.id === '0';/g;
const newAdminDef = `const isSekcam = Boolean(
    currentUser.jabatan?.toLowerCase().includes('sekcam') ||
    currentUser.role?.toLowerCase().includes('sekcam') ||
    currentUser.peranStruktur?.includes('Sekcam')
  );
  const isAdmin = currentUser.role === 'Admin' || currentUser.id === '0' || isSekcam;`;
content = content.replace(adminDefRegex, newAdminDef);

// 2. Hide the top Sync button
const topSyncRegex = /\{\/\* GS Connected Status Button \*\/\}\s*<button[\s\S]*?Sinkronisasi Google Sheets<\/span>\s*<\/button>/g;
content = content.replace(topSyncRegex, (match) => {
    return `{/* GS Connected Status Button */}
            {isAdmin && (
${match.replace('{/* GS Connected Status Button */}', '').trim()}
            )}`;
});

// 3. Hide the sidebar Sync button
const sideSyncRegex = /<button\s*onClick=\{\(\) => \{ setIsGSModalOpen\(true\); setIsMobileMenuOpen\(false\); \}\}[\s\S]*?Pengaturan Sheets API<\/span>\s*<\/button>/g;
content = content.replace(sideSyncRegex, (match) => {
    return `{isAdmin && (
${match}
              )}`;
});

fs.writeFileSync(file, content);
console.log('Done!');
