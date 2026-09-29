const fs = require('fs');

let c = fs.readFileSync('google-apps-script/Code.gs', 'utf8');

const targetLoop = `      for (let i = 1; i < dataReports.length; i++) {
        if (String(dataReports[i][0]).trim() === reportId.trim()) {
          sheet.getRange(i + 1, 2).setValue(r.nip || r.pegawaiId);
          sheet.getRange(i + 1, 3).setValue(r.tanggal);
          sheet.getRange(i + 1, 4).setValue(detailJson);
          sheet.getRange(i + 1, 5).setValue(r.lampiranUrl || '');
          sheet.getRange(i + 1, 6).setValue(r.status || 'PENDING');
          sheet.getRange(i + 1, 7).setValue(r.diverifikasiOleh || '');
          sheet.getRange(i + 1, 8).setValue(r.namaPegawai || '');
          sheet.getRange(i + 1, 9).setValue(r.jabatan || '');
          sheet.getRange(i + 1, 10).setValue(r.catatanAtasan || '');
          sheet.getRange(i + 1, 11).setValue(r.waktuInput || new Date().toLocaleString());
          updated = true;
          break;
        }
      }`;

const optimizedLoop = `      for (let i = 1; i < dataReports.length; i++) {
        if (String(dataReports[i][0]).trim() === reportId.trim()) {
          try {
            sheet.getRange(i + 1, 2, 1, 10).setValues([[
              r.nip || r.pegawaiId,
              r.tanggal,
              detailJson,
              r.lampiranUrl || '',
              r.status || 'PENDING',
              r.diverifikasiOleh || '',
              r.namaPegawai || '',
              r.jabatan || '',
              r.catatanAtasan || '',
              r.waktuInput || new Date().toLocaleString()
            ]]);
            updated = true;
          } catch (updateErr) {
            return createJsonResponse({ status: 'error', message: 'SetValues failed: ' + updateErr.toString() });
          }
          break;
        }
      }`;

if(c.includes(targetLoop)) {
  c = c.replace(targetLoop, optimizedLoop);
  fs.writeFileSync('google-apps-script/Code.gs', c);
  console.log("Optimized Code.gs update loop with try-catch");
} else {
  console.log("Could not find loop to replace");
}
