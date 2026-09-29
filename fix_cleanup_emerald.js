const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Cleanup emeralds
  content = content.replace(/hover:border-emerald-400/g, 'hover:border-blue-400');
  content = content.replace(/border-emerald-400/g, 'border-blue-400');
  content = content.replace(/bg-emerald-50/g, 'bg-blue-50');
  content = content.replace(/text-emerald-800/g, 'text-blue-800');
  content = content.replace(/text-emerald-700/g, 'text-blue-700');
  content = content.replace(/text-emerald-600/g, 'text-blue-600');
  content = content.replace(/bg-emerald-400/g, 'bg-blue-400');
  content = content.replace(/bg-emerald-950\/40 border border-emerald-800\/60 text-emerald-100/g, 'bg-blue-50 border border-blue-200 text-blue-800');
  content = content.replace(/bg-emerald-950\/30 border border-emerald-900\/50/g, 'bg-blue-50 border border-blue-200');
  content = content.replace(/accent-emerald-500/g, 'accent-blue-600');
  
  // Any lingering text-zinc-100 or text-zinc-200 or text-zinc-300 globally
  content = content.replace(/text-zinc-100/g, 'text-slate-800');
  content = content.replace(/text-zinc-200/g, 'text-slate-700');
  content = content.replace(/text-zinc-300/g, 'text-slate-600');

  // Same for olive text if any
  content = content.replace(/text-olive-[0-9]+/g, 'text-slate-600');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned emerald/text classes in:', filePath);
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
