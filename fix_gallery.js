const fs = require('fs');

let content = fs.readFileSync('components/InputKegiatan.jsx', 'utf8');

// Fix 1: Remove .slice(0, 6) from galleryPhotos
content = content.replace(
  /\.filter\(url => url && url\.startsWith\('data:image'\)\)\s*\.slice\(0,\s*6\);/g,
  `.filter(url => url && url.startsWith('data:image'));`
);

// Fix 2: Add overflow-y-auto and max-h to the gallery grid
content = content.replace(
  `<div className="grid grid-cols-3 gap-2">`,
  `<div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">`
);

fs.writeFileSync('components/InputKegiatan.jsx', content);
console.log('Fixed InputKegiatan.jsx');
