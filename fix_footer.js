const fs = require('fs');
const file = 'components/CetakLKH.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{/* ROW TOTAL JAM KERJA */}
                <tr className="bg-emerald-50 font-bold">
                  <td colSpan={4} className="border border-black p-2 text-right">
                    Jumlah Jam Kerja Terakumulasi:
                  </td>
                  <td className="border border-black p-2 text-center">
                    {filteredReports.reduce((total, r) => {
                      const keg = r.detailKegiatan?.[0] || {};
                      return total + getDurasi(keg.jamMulai, keg.jamSelesai);
                    }, 0)} Jam
                  </td>
                  <td colSpan={2} className="border border-black p-2"></td>
                </tr>`;

const replacement = `{/* ROW TOTAL JAM KERJA */}
                <tr className="bg-emerald-50 font-bold">
                  <td colSpan={4} className="border border-black p-2 text-right">
                    Jumlah Jam Kerja Terakumulasi:
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totalJamKerja} Jam
                  </td>
                  <td colSpan={2} className="border border-black p-2 text-center text-emerald-800">
                    {penilaianAkhir && \`Penilaian Akhir: \${penilaianAkhir}\`}
                  </td>
                </tr>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('done');
