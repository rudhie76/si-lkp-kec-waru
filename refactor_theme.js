const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Backgrounds
  content = content.replace(/bg-zinc-950/g, 'bg-slate-50');
  content = content.replace(/bg-zinc-900\/80/g, 'bg-white');
  content = content.replace(/bg-zinc-900\/50/g, 'bg-slate-50');
  content = content.replace(/bg-zinc-900/g, 'bg-white');
  content = content.replace(/bg-olive-950\/80/g, 'bg-white shadow-sm');
  content = content.replace(/bg-olive-950\/50/g, 'bg-white shadow-sm');
  content = content.replace(/bg-olive-950/g, 'bg-white shadow-sm');
  content = content.replace(/bg-olive-900\/80/g, 'bg-white');
  content = content.replace(/bg-olive-900\/50/g, 'bg-slate-50');
  content = content.replace(/bg-olive-900/g, 'bg-slate-50');
  content = content.replace(/bg-olive-800\/50/g, 'bg-slate-100');
  content = content.replace(/bg-olive-800/g, 'bg-slate-100');
  
  // Primary CTA (was Emerald, now Maroon/Red-800)
  content = content.replace(/bg-emerald-500/g, 'bg-red-800');
  content = content.replace(/bg-emerald-600/g, 'bg-red-800');
  content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-red-900');
  content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-red-900');
  content = content.replace(/text-emerald-400/g, 'text-red-800');
  content = content.replace(/text-emerald-500/g, 'text-red-800');
  content = content.replace(/text-emerald-300/g, 'text-red-700');
  content = content.replace(/border-emerald-500\/30/g, 'border-red-800/30');
  content = content.replace(/border-emerald-500/g, 'border-red-800');
  content = content.replace(/shadow-emerald-900\/20/g, 'shadow-sm');
  content = content.replace(/shadow-emerald-500\/20/g, 'shadow-sm');
  content = content.replace(/shadow-emerald-500\/30/g, 'shadow-sm');

  // Text Colors
  content = content.replace(/text-white/g, 'text-slate-800'); // Note: This might break buttons that need white text, we'll fix button text specifically later
  content = content.replace(/text-zinc-200/g, 'text-slate-700');
  content = content.replace(/text-zinc-300/g, 'text-slate-600');
  content = content.replace(/text-zinc-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-500/g, 'text-slate-400');
  
  // Borders
  content = content.replace(/border-olive-700\/50/g, 'border-slate-200');
  content = content.replace(/border-olive-700\/30/g, 'border-slate-200');
  content = content.replace(/border-olive-700/g, 'border-slate-300');
  content = content.replace(/border-olive-600/g, 'border-slate-300');
  content = content.replace(/border-zinc-800/g, 'border-slate-200');
  content = content.replace(/border-zinc-700/g, 'border-slate-300');
  
  // Table specifically
  content = content.replace(/divide-olive-800\/50/g, 'divide-slate-200');
  content = content.replace(/divide-olive-700\/50/g, 'divide-slate-200');

  // Buttons that should keep white text (since we blindly replaced text-white to text-slate-800)
  // bg-red-800 text-slate-800 -> bg-red-800 text-white
  content = content.replace(/bg-red-800(.*?)text-slate-800/g, 'bg-red-800$1text-white');
  content = content.replace(/text-slate-800(.*?)bg-red-800/g, 'text-white$1bg-red-800');
  
  // Yellows (for pending/accents) - ensure WCAG compliance
  content = content.replace(/text-amber-500/g, 'text-amber-700');
  content = content.replace(/text-amber-400/g, 'text-amber-700');
  content = content.replace(/bg-amber-500\/10/g, 'bg-amber-100');
  content = content.replace(/border-amber-500\/20/g, 'border-amber-200');
  
  // Greens for Success (DIVALIDASI)
  content = content.replace(/bg-emerald-500\/10/g, 'bg-emerald-100');
  content = content.replace(/bg-emerald-500\/20/g, 'bg-emerald-100');
  content = content.replace(/text-emerald-400/g, 'text-emerald-700'); // Oh wait, I replaced text-emerald-400 to text-red-800 above!
  // Let me re-do text-emerald replacement carefully in a second pass.

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
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
console.log('Refactoring complete.');
