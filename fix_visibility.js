const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix invisible gold text on white bg
  content = content.replace(/text-gold-200/g, 'text-amber-800');
  content = content.replace(/text-gold-300/g, 'text-amber-700');
  content = content.replace(/text-gold-400/g, 'text-amber-700');
  content = content.replace(/bg-gold-400/g, 'bg-amber-500');
  content = content.replace(/bg-gold-500\/15/g, 'bg-amber-100');
  content = content.replace(/bg-gold-500\/20/g, 'bg-amber-100');
  content = content.replace(/border-gold-400\/50/g, 'border-amber-300');
  content = content.replace(/border-gold-500\/30/g, 'border-amber-300');

  // Fix remaining dark olive borders
  content = content.replace(/border-olive-800\/80/g, 'border-slate-200');
  content = content.replace(/border-olive-800/g, 'border-slate-200');
  content = content.replace(/border-olive-950/g, 'border-slate-300');

  // Any remaining hover colors that are unreadable
  // "hover:text-white" in inputKegiatan was replaced to "text-white" but maybe we should check if they need bg
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed visibility in:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

dirs.forEach(walkDir);
console.log('Visibility fix complete.');
