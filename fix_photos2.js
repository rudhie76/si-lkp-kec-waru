const fs = require('fs');

function fixCetak() {
  const file = 'components/CetakLKH.jsx';
  let content = fs.readFileSync(file, 'utf8');
  const regex = /<td className="border border-black p-2 text-center align-top">\s*<div className="flex flex-col items-center space-y-1">\s*\{keg\.fotoUrl && \(\s*<div className="flex flex-col items-center">\s*<img src=\{keg\.fotoUrl\} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" \/>\s*<\/div>\s*\)\}\s*\{keg\.fotoUrl2 && \(\s*<div className="flex flex-col items-center mt-1">\s*<img src=\{keg\.fotoUrl2\} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" \/>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/td>/;
  
  const replacement = `<td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                          )}
                          {keg.fotoUrl2 && (
                            <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                          )}
                        </div>
                      </td>`;
                      
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed CetakLKH');
  } else {
    console.log('Not found in CetakLKH');
  }
}

function fixRekap() {
  const file = 'components/RekapitulasiBulanan.jsx';
  let content = fs.readFileSync(file, 'utf8');
  const regex = /<td className="border border-black p-2 align-top">\s*<div className="flex flex-col items-center space-y-1">\s*\{keg\.fotoUrl && \(\s*<img src=\{keg\.fotoUrl\} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" \/>\s*\)\}\s*\{keg\.fotoUrl2 && \(\s*<img src=\{keg\.fotoUrl2\} className="w-12 h-12 object-cover border border-gray-300 rounded-md mt-1" alt="Bukti 2" \/>\s*\)\}\s*<\/div>\s*<\/td>/;
  
  const replacement = `<td className="border border-black p-2 text-center align-top">
                        <div className="flex justify-center gap-1">
                          {keg.fotoUrl && (
                            <img src={keg.fotoUrl} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 1" />
                          )}
                          {keg.fotoUrl2 && (
                            <img src={keg.fotoUrl2} className="w-12 h-12 object-cover border border-gray-300 rounded-md" alt="Bukti 2" />
                          )}
                        </div>
                      </td>`;
                      
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed Rekap');
  } else {
    console.log('Not found in Rekap');
  }
}

fixCetak();
fixRekap();
