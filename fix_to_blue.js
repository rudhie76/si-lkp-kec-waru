const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components'];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.css')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Protect Rejected badge
  content = content.replace(/bg-red-100 border border-red-300 text-red-800/g, 'BADGE_REJECTED_PROTECTED');

  // Convert all Maroon/Red accents to Royal Blue
  content = content.replace(/bg-red-800/g, 'bg-blue-600');
  content = content.replace(/hover:bg-red-900/g, 'hover:bg-blue-700');
  content = content.replace(/hover:bg-red-800/g, 'hover:bg-blue-600');
  content = content.replace(/text-red-800/g, 'text-blue-600');
  content = content.replace(/text-red-700/g, 'text-blue-600');
  content = content.replace(/border-red-800/g, 'border-blue-600');
  content = content.replace(/border-red-900/g, 'border-blue-700');
  content = content.replace(/ring-red-800/g, 'ring-blue-600');
  
  // Also any bg-red-800/20 etc
  // We can let them become bg-blue-600/20, which is perfectly fine.

  // Restore Rejected badge
  content = content.replace(/BADGE_REJECTED_PROTECTED/g, 'bg-red-100 border border-red-300 text-red-600'); // make it red-600 for better visibility than 800

  // Specifically fix Dashboard Top 4 Card icons
  // In DashboardView.jsx:
  if (filePath.endsWith('DashboardView.jsx')) {
    // 1st card
    content = content.replace(/<div className="w-12 h-12 rounded-xl bg-blue-600\/20 border border-emerald-400\/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">/g, 
                              '<div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">');
    // 2nd card
    content = content.replace(/<div className="w-12 h-12 rounded-xl bg-blue-600\/25 border border-emerald-400\/60 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">/g, 
                              '<div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">');
    // 3rd card
    content = content.replace(/<div className="w-12 h-12 rounded-xl bg-amber-500\/20 border border-amber-400\/50 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform shadow-inner">/g, 
                              '<div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">');
    // 4th card
    content = content.replace(/<div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform shadow-inner">/g, 
                              '<div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">');
    
    // Fix Profile picture fallback icons (if they are blue, maybe keep them blue-600 text)
    content = content.replace(/<User className="w-12 h-12 text-blue-600" \/>/g, '<User className="w-12 h-12 text-slate-400" />');
    content = content.replace(/<User className="w-12 h-12 text-amber-700" \/>/g, '<User className="w-12 h-12 text-slate-400" />');

    // Fix Chart Gradient
    content = content.replace(/className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-gold-400 h-full rounded-full transition-all duration-500 shadow-md"/g,
                              'className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"');
  }

  // Any remaining emeralds from the dark theme that look out of place
  content = content.replace(/border-emerald-400\/50/g, 'border-blue-600/20');
  content = content.replace(/border-emerald-400\/60/g, 'border-blue-600/20');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed blue theme in:', filePath);
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
console.log('Blue theme transformation complete.');
