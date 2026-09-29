const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace gradients with pure white card backgrounds
  content = content.replace(/bg-gradient-to-[a-z]+ from-[a-zA-Z0-9\/-]+ (via-[a-zA-Z0-9\/-]+ )?to-[a-zA-Z0-9\/-]+/g, 'bg-white');

  // Fix header navbar background (in layout or page)
  content = content.replace(/bg-gradient-to-r from-olive-900 via-olive-950 to-zinc-950/g, 'bg-white');
  
  // Actually, wait, let's catch anything that still has "from-olive-950" etc just in case the regex missed it
  content = content.replace(/bg-gradient-[a-zA-Z0-9\/-]+/g, 'bg-white'); // Maybe too aggressive?
  
  // Specific regex for the exact gradients found
  const gradientRegex = /bg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)\s+from-[a-z0-9\-]+(?:\/[0-9]+)?(?:\s+via-[a-z0-9\-]+(?:\/[0-9]+)?)?\s+to-[a-z0-9\-]+(?:\/[0-9]+)?/g;
  content = content.replace(gradientRegex, 'bg-white');

  // Any remaining emerald or olive drop shadows
  content = content.replace(/shadow-emerald-9[0-9]*\/[0-9]+/g, 'shadow-blue-600/20');
  content = content.replace(/shadow-olive-9[0-9]*\/[0-9]+/g, 'shadow-sm');

  // Fix sidebar specific issue if it missed:
  content = content.replace(/bg-white border border-slate-200\/60 rounded-2xl p-4 shadow-xl space-y-4 sticky top-28/g, 'bg-white shadow-sm border border-slate-200 rounded-2xl p-4 space-y-4 sticky top-28');

  // Some components might have `bg-zinc-950` or `bg-olive-950` as single classes not in gradients!
  content = content.replace(/bg-zinc-9[0-9]*(\/[0-9]+)?/g, 'bg-white');
  content = content.replace(/bg-olive-9[0-9]*(\/[0-9]+)?/g, 'bg-white');
  content = content.replace(/bg-olive-8[0-9]*(\/[0-9]+)?/g, 'bg-white');

  // If text-slate-400 exists in these containers, might need to become text-slate-500
  // text-slate-200 / text-zinc-200 etc
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed gradients to white in:', filePath);
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
console.log('Gradient eradication complete.');
