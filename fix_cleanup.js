const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/bg-red-800(.*?)text-zinc-950/g, 'bg-red-800$1text-white');
  content = content.replace(/hover:bg-emerald-400/g, 'hover:bg-red-900');
  content = content.replace(/text-zinc-600/g, 'text-slate-400');
  content = content.replace(/bg-olive-700/g, 'bg-slate-200');
  content = content.replace(/bg-olive-600/g, 'bg-slate-300');
  content = content.replace(/border-olive-500\/50/g, 'border-slate-300');
  
  // Fix the disabled:bg-zinc-800 to disabled:bg-slate-200
  content = content.replace(/disabled:bg-zinc-800/g, 'disabled:bg-slate-100 disabled:text-slate-400');

  // Let's also check if there are any remaining border-olive, text-olive
  content = content.replace(/text-olive-400/g, 'text-slate-500');
  
  // Clean up any remaining text-white that got mixed with bg-white
  // e.g. text-white in cards that are now white!
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed cleanup in:', filePath);
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
console.log('Cleanup complete.');
