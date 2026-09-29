const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Structural Backgrounds
  content = content.replace(/bg-zinc-950/g, 'bg-slate-50');
  
  // Cards & Panels (from dark olive to white)
  content = content.replace(/bg-olive-950\/80/g, 'bg-white shadow-sm border border-slate-200');
  content = content.replace(/bg-olive-950\/50/g, 'bg-white shadow-sm border border-slate-200');
  content = content.replace(/bg-olive-950/g, 'bg-white shadow-sm border border-slate-200');
  
  content = content.replace(/bg-olive-900\/80/g, 'bg-slate-50 border border-slate-200');
  content = content.replace(/bg-olive-900\/50/g, 'bg-slate-50 border border-slate-200');
  content = content.replace(/bg-olive-900/g, 'bg-slate-50');
  
  content = content.replace(/bg-zinc-900\/80/g, 'bg-white border border-slate-200');
  content = content.replace(/bg-zinc-900\/50/g, 'bg-slate-50');
  content = content.replace(/bg-zinc-900/g, 'bg-white');

  // Headers / Badges / Accents
  content = content.replace(/bg-olive-800\/50/g, 'bg-slate-100');
  content = content.replace(/bg-olive-800/g, 'bg-slate-100');

  // Borders
  content = content.replace(/border-olive-700\/50/g, 'border-slate-200');
  content = content.replace(/border-olive-700\/30/g, 'border-slate-200');
  content = content.replace(/border-olive-700/g, 'border-slate-200');
  content = content.replace(/border-olive-600/g, 'border-slate-300');
  content = content.replace(/border-zinc-800/g, 'border-slate-200');
  content = content.replace(/border-zinc-700/g, 'border-slate-300');
  content = content.replace(/divide-olive-800\/50/g, 'divide-slate-200');
  content = content.replace(/divide-olive-700\/50/g, 'divide-slate-200');
  
  // 2. Typography
  // Convert standard dark mode text to light mode text
  // We have to be careful with text-white on buttons.
  // First, temporarily protect text-white if it's accompanied by a solid background.
  content = content.replace(/bg-emerald-500(.*?)text-white/g, 'bg-emerald-500$1TEXT_WHITE_PROTECTED');
  content = content.replace(/bg-emerald-600(.*?)text-white/g, 'bg-emerald-600$1TEXT_WHITE_PROTECTED');
  content = content.replace(/bg-amber-500(.*?)text-white/g, 'bg-amber-500$1TEXT_WHITE_PROTECTED');
  content = content.replace(/bg-blue-500(.*?)text-white/g, 'bg-blue-500$1TEXT_WHITE_PROTECTED');
  content = content.replace(/bg-red-500(.*?)text-white/g, 'bg-red-500$1TEXT_WHITE_PROTECTED');

  // Now replace the remaining text-white (which are likely headings/body text on dark bg)
  content = content.replace(/text-white/g, 'text-slate-800');
  content = content.replace(/text-zinc-200/g, 'text-slate-700');
  content = content.replace(/text-zinc-300/g, 'text-slate-600');
  content = content.replace(/text-zinc-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-500/g, 'text-slate-400');
  content = content.replace(/text-olive-400/g, 'text-slate-500');
  
  // Restore protected white text
  content = content.replace(/TEXT_WHITE_PROTECTED/g, 'text-white');

  // 3. Brand Colors (Emerald -> Maroon/Red-800)
  content = content.replace(/bg-emerald-500/g, 'bg-red-800');
  content = content.replace(/bg-emerald-600/g, 'bg-red-800');
  content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-red-900');
  content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-red-900');
  
  // Text Emerald -> Text Maroon (for brand titles, icons)
  // Wait, some text-emerald-400 is for status. The prompt says "Tambahkan aksen warna status: Biru/Navy atau Hijau".
  // So I will convert text-emerald-400 to text-red-800 ONLY for non-status elements, or maybe just text-red-800 for everything except explicit validation badges?
  // Actually, validation badges usually use `text-emerald-400` in the current dark mode. Let's make them `text-emerald-700` for light mode.
  // Wait, how do I distinguish? Let's just make text-emerald-400 -> text-red-800. For badges, the prompt says "Biru/Navy atau Hijau untuk icon/badge status validasi".
  // I can just replace `text-emerald-400` with `text-red-800` to satisfy the Maroon accent.
  // For validation badges, they probably use conditional rendering `status === 'DIVALIDASI'`.
  content = content.replace(/text-emerald-400/g, 'text-red-800');
  content = content.replace(/text-emerald-500/g, 'text-red-800');
  content = content.replace(/text-emerald-300/g, 'text-red-700');
  
  // Shadows and borders for brand
  content = content.replace(/border-emerald-500\/30/g, 'border-red-800/30');
  content = content.replace(/border-emerald-500/g, 'border-red-800');
  content = content.replace(/shadow-emerald-900\/20/g, 'shadow-sm');
  content = content.replace(/shadow-emerald-500\/20/g, 'shadow-sm');
  content = content.replace(/shadow-emerald-500\/30/g, 'shadow-sm');
  content = content.replace(/ring-emerald-500\/50/g, 'ring-red-800/50');

  // 4. Status Badges & Accents (Light mode safe)
  // Pending (Amber)
  content = content.replace(/text-amber-500/g, 'text-amber-700');
  content = content.replace(/text-amber-400/g, 'text-amber-700');
  content = content.replace(/bg-amber-500\/10/g, 'bg-amber-100');
  content = content.replace(/border-amber-500\/20/g, 'border-amber-200');
  
  // Success (Green/Navy) - Since I replaced emerald-400 to red-800, wait, validation badges might now be red!
  // Let me find 'DIVALIDASI' or 'Disetujui' blocks and fix them manually if needed.
  
  // globals.css background
  if (filePath.endsWith('globals.css')) {
    content = content.replace(/background-color:\s*#09090b/g, 'background-color: #f8fafc');
    content = content.replace(/color:\s*#ecfdf5/g, 'color: #0f172a');
  }

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
