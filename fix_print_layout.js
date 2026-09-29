const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Wrap the start
  const startTarget = `<div className="print-area bg-white text-black `;
  // Replace `<div className="print-area bg-white text-black [REST OF CLASSES]`
  // with `<div className="overflow-x-auto w-full pb-4"><div className="print-area bg-white text-black min-w-[750px] print:min-w-0 [REST OF CLASSES]`
  content = content.replace(
    /(<div className="print-area bg-white text-black)([^>]+>)/g,
    `<div className="overflow-x-auto w-full pb-4">\n        $1 min-w-[750px] print:min-w-0 mx-auto$2`
  );

  // Wrap the end
  const endTarget = `      </div>\n\n      <style jsx global>`;
  content = content.replace(endTarget, `      </div>\n      </div>\n\n      <style jsx global>`);

  // Ensure tables don't squish too much, especially column headers
  // Add min-w to the photo column in RekapitulasiBulanan and CetakLKH
  content = content.replace(
    /<th className="border border-black p-2 w-28">Foto \/ File Dukung<\/th>/g,
    `<th className="border border-black p-2 w-28 min-w-[100px]">Foto / File Dukung</th>`
  );
  content = content.replace(
    /<th className="border border-black p-2 w-20">Verifikasi Atasan<\/th>/g,
    `<th className="border border-black p-2 w-24 min-w-[90px]">Verifikasi Atasan</th>`
  );

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

fixFile('components/RekapitulasiBulanan.jsx');
fixFile('components/CetakLKH.jsx');
