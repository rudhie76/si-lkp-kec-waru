const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/bg-zinc-800/g, 'bg-slate-100');
  content = content.replace(/hover:bg-zinc-700/g, 'hover:bg-slate-200');
  content = content.replace(/disabled:bg-zinc-700/g, 'disabled:bg-slate-200 disabled:text-slate-500');
  
  // also fix some lingering `border-olive-800/60` and `focus:ring-offset-zinc-900`
  content = content.replace(/border-olive-800\/60/g, 'border-slate-300');
  content = content.replace(/focus:ring-offset-zinc-900/g, 'focus:ring-offset-white');

  // Any remaining emeralds that are purely aesthetic (like focus ring)
  content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-red-800');
  content = content.replace(/focus:border-emerald-500/g, 'focus:border-red-800');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed zinc in:', filePath);
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
console.log('Final zinc cleanup complete.');
