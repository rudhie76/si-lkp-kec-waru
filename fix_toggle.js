const fs = require('fs');

let content = fs.readFileSync('app/page.jsx', 'utf8');

const target = `<div className="w-10 h-12 flex-shrink-0">`;
const toggleButton = `
            {/* Desktop Toggle Menu Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 mr-2 bg-olive-800/40 hover:bg-olive-700 text-zinc-200 rounded-lg transition-colors border border-olive-700/60"
              title="Sembunyikan / Tampilkan Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-12 flex-shrink-0">`;

if (!content.includes('Desktop Toggle Menu Button')) {
  content = content.replace(target, toggleButton);
  fs.writeFileSync('app/page.jsx', content);
  console.log('Added button');
} else {
  console.log('Button already exists');
}
