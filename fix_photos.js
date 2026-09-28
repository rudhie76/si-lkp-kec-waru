const fs = require('fs');

function fixFile(file, isCetak) {
  let content = fs.readFileSync(file, 'utf8');

  let target, replacement;
  if (isCetak) {
    target = `<td className="border border-black p-2 text-center align-top">
                        <div className="flex flex-col items-center space-y-1">
                          {keg.fotoUrl && (
                            <div className="flex flex-col items-center">
                              <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                            </div>
                          )}
                          {keg.fotoUrl2 && (
                            <div className="flex flex-col items-center mt-1">
                              <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                            </div>
                          )}
                        </div>
                      </td>`;
    replacement = `<td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                          )}
                          {keg.fotoUrl2 && (
                            <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                          )}
                        </div>
                      </td>`;
  } else {
    target = `<td className="border border-black p-2 align-top">
                          <div className="flex flex-col items-center space-y-1">
                            {keg.fotoUrl && (
                              <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                            )}
                            {keg.fotoUrl2 && (
                              <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md mt-1" alt="Bukti 2" />
                            )}
                          </div>
                        </td>`;
    replacement = `<td className="border border-black p-2 text-center align-top">
                          <div className="flex justify-center gap-1">
                            {keg.fotoUrl && (
                              <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                            )}
                            {keg.fotoUrl2 && (
                              <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                            )}
                          </div>
                        </td>`;
  }
  
  if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  } else {
    console.log('Target not found in ' + file);
  }
}

fixFile('components/CetakLKH.jsx', true);
fixFile('components/RekapitulasiBulanan.jsx', false);
