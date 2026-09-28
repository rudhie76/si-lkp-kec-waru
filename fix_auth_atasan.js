const fs = require('fs');

let content = fs.readFileSync('components/AuthView.jsx', 'utf8');

// Find the insertion point before Password
const insertionPoint = `              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Password:</label>`;

const dropdownCode = `
              {regData.peranStruktur !== 'Camat (Tanpa Atasan Validasi)' && (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Atasan Langsung / Penilai:</label>
                  <select
                    value={regData.atasanValidasi}
                    onChange={(e) => setRegData({ ...regData, atasanValidasi: e.target.value })}
                    className="w-full bg-zinc-900/90 border border-olive-700/60 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Atasan Langsung --</option>
                    {users && users.length > 0 ? (
                      users.map((u, idx) => (
                        <option key={idx} value={u.name}>
                          {u.name} ({u.jabatan})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Belum ada data pegawai/atasan terdaftar</option>
                    )}
                  </select>
                </div>
              )}

`;

content = content.replace(insertionPoint, dropdownCode + insertionPoint);
fs.writeFileSync('components/AuthView.jsx', content);
console.log('Added Atasan Dropdown');
