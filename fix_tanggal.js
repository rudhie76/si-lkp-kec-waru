const fs = require('fs');
const file = 'components/VerifikasiAtasan.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject formatTanggal
const formatTanggalDef = `
const formatTanggal = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).substring(0, 10);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = String(d.getDate()).padStart(2, '0');
    return \`\${days[d.getDay()]}, \${day} \${months[d.getMonth()]} \${d.getFullYear()}\`;
  } catch(e) {
    return String(dateVal).substring(0, 10);
  }
};
`;

if (!content.includes('const formatTanggal =')) {
  content = content.replace('const getDurasiFallback =', formatTanggalDef + '\nconst getDurasiFallback =');
}

// 2. Replace the render block
const oldRender = `<td className="py-3.5 px-4 whitespace-nowrap font-medium text-white">
                      {item.tanggal}
                    </td>`;

const newRender = `<td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-emerald-300">{formatTanggal(item.tanggal)}</div>
                      {item.detailKegiatan && item.detailKegiatan[0] && (
                        <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 inline-block mr-1 opacity-70" />
                          {item.detailKegiatan[0].jamMulai} - {item.detailKegiatan[0].jamSelesai}
                        </div>
                      )}
                    </td>`;

content = content.replace(oldRender, newRender);
fs.writeFileSync(file, content);
console.log('Fixed VerifikasiAtasan.jsx');
