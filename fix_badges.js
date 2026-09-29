const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix DIVALIDASI / Disetujui badges (Make them Blue/Navy as requested, or Green)
  // Current: bg-red-800/20 border border-red-800/50 text-red-700
  content = content.replace(/bg-red-800\/20 border border-red-800\/50 text-red-700/g, 'bg-blue-100 border border-blue-300 text-blue-800');
  content = content.replace(/bg-red-800\/20 border border-red-800\/50 text-red-800/g, 'bg-blue-100 border border-blue-300 text-blue-800');
  
  // Pending badges
  // Current: bg-amber-500/20 border border-amber-500/50 text-amber-300
  content = content.replace(/bg-amber-500\/20 border border-amber-500\/50 text-amber-300/g, 'bg-amber-100 border border-amber-300 text-amber-800');
  content = content.replace(/text-amber-300/g, 'text-amber-800');
  
  // Rejected/Revisi badges
  // Current: bg-rose-500/20 border border-rose-500/50 text-rose-300
  content = content.replace(/bg-rose-500\/20 border border-rose-500\/50 text-rose-300/g, 'bg-red-100 border border-red-300 text-red-800');
  content = content.replace(/text-rose-300/g, 'text-red-800');
  content = content.replace(/text-rose-400/g, 'text-red-800');
  content = content.replace(/bg-rose-500/g, 'bg-red-800');

  // Fix tables: divide-zinc-800/50 -> divide-slate-200
  content = content.replace(/divide-zinc-800\/50/g, 'divide-slate-200');
  content = content.replace(/divide-zinc-800/g, 'divide-slate-200');
  
  // Input fields: bg-zinc-900/80 -> bg-white border border-slate-300
  content = content.replace(/bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2\.5 text-slate-800/g, 'bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 focus:border-red-800');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed badges in:', filePath);
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
console.log('Badge fix complete.');
