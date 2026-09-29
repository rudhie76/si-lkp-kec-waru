const fs = require('fs');

const file = 'app/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHandle = `    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'saveReport', newReport).then(res => {
        if (res && res.status === 'error') {
          console.error('GS Error:', res.message);
        }
      }).catch(err => console.error(err));
    }`;

const newHandle = `    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'saveReport', newReport).then(res => {
        if (res && res.status === 'error') {
          alert('GAGAL SIMPAN KE DATABASE: ' + res.message);
        } else if (!res) {
          alert('GAGAL TERHUBUNG KE GOOGLE SHEETS! Pastikan URL Web App benar.');
        } else {
          // alert('SUKSES SIMPAN KE DATABASE: ' + res.message); // debug only
        }
      }).catch(err => {
        alert('ERROR KONEKSI DATABASE: ' + err.toString());
      });
    }`;

if(content.includes(oldHandle)) {
  content = content.replace(oldHandle, newHandle);
  fs.writeFileSync(file, content);
  console.log("Added alert to page.jsx");
} else {
  console.log("Could not find handleSaveReport");
}
