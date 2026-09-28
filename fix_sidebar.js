const fs = require('fs');
let content = fs.readFileSync('app/page.jsx', 'utf8');

// 1. Add state isSidebarCollapsed
content = content.replace(
  "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);",
  "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);"
);

// 2. Add collapse button and update aside classes
// Original: md:w-64 flex-shrink-0 space-y-4 no-print
// The sidebar has <aside className={`md:w-64 ... transition-all duration-300`}>
// We will replace 'md:w-64' with '${isSidebarCollapsed ? "md:w-20" : "md:w-64"}'
content = content.replace(
  "md:w-64 flex-shrink-0 space-y-4 no-print",
  "${isSidebarCollapsed ? 'md:w-0 overflow-hidden md:pl-0 md:pr-0 md:opacity-0 md:border-none' : 'md:w-64 opacity-100'} transition-all duration-300 flex-shrink-0 space-y-4 no-print"
);

// We need a toggle button next to the sidebar or in the header.
// Let's add it to the Desktop Header (top area).
// Let's find: {/* Header (Desktop Only) */}
const headerSection = `{/* Header (Desktop Only) */}
        <header className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950/80 backdrop-blur-md border-b border-olive-800/60 p-5 px-6 sticky top-0 z-40 no-print">`;

const toggleButton = `
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-2 mr-3 bg-olive-900/40 hover:bg-olive-800 text-zinc-300 rounded-lg transition-colors border border-olive-700/50"
            title="Toggle Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
`;

content = content.replace(
  `<div className="flex items-center space-x-4">
            <div className="w-10 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30 overflow-hidden">`,
  `<div className="flex items-center space-x-4">
            ${toggleButton}
            <div className="w-10 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30 overflow-hidden">`
);

fs.writeFileSync('app/page.jsx', content);
console.log('Done modifying page.jsx');
