const fs = require('fs');

const file = 'app/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHandle = `    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'saveReport', newReport);
    }`;

const newHandle = `    const gsUrl = getGoogleSheetsUrl();
    if (gsUrl) {
      pushToGoogleSheets(gsUrl, 'saveReport', newReport).then(res => {
        if (res && res.status === 'error') {
          console.error('GS Error:', res.message);
        }
      }).catch(err => console.error(err));
    }`;

if(content.includes(oldHandle)) {
  content = content.replace(oldHandle, newHandle);
  fs.writeFileSync(file, content);
  console.log("Added error check in page.jsx");
} else {
  console.log("Could not find handleSaveReport");
}
