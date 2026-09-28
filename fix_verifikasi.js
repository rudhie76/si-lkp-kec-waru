const fs = require('fs');
const file = 'components/VerifikasiAtasan.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{keg.fotoUrl && (
                        <div className="pt-2">
                          <span className="text-[10px] text-zinc-400 block mb-1">Foto Dokumentasi Kegiatan:</span>
                          <img src={keg.fotoUrl} alt="Dokumentasi" className="max-h-48 rounded-xl border border-olive-700 object-cover" />
                        </div>
                      )}`;

const replacement = `{(keg.fotoUrl || keg.fotoUrl2) && (
                        <div className="pt-2">
                          <span className="text-[10px] text-zinc-400 block mb-1">Foto Dokumentasi Kegiatan:</span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {keg.fotoUrl && (
                              <img src={keg.fotoUrl} alt="Dokumentasi 1" className="h-32 rounded-xl border border-olive-700 object-cover" />
                            )}
                            {keg.fotoUrl2 && (
                              <img src={keg.fotoUrl2} alt="Dokumentasi 2" className="h-32 rounded-xl border border-olive-700 object-cover" />
                            )}
                          </div>
                        </div>
                      )}`;
                      
content = content.replace(target, replacement);

const target2 = `{selectedReport.lampiranUrl && (
                      <img src={selectedReport.lampiranUrl} alt="Dokumentasi" className="max-h-48 rounded-xl border border-olive-700 object-cover mt-2" />
                    )}`;

const replacement2 = `{(selectedReport.lampiranUrl || selectedReport.fotoUrl2) && (
                      <div className="pt-2">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {selectedReport.lampiranUrl && (
                            <img src={selectedReport.lampiranUrl} alt="Dokumentasi 1" className="h-32 rounded-xl border border-olive-700 object-cover" />
                          )}
                          {selectedReport.fotoUrl2 && (
                            <img src={selectedReport.fotoUrl2} alt="Dokumentasi 2" className="h-32 rounded-xl border border-olive-700 object-cover" />
                          )}
                        </div>
                      </div>
                    )}`;
                    
content = content.replace(target2, replacement2);
fs.writeFileSync(file, content);
console.log('done');
