const fs = require('fs');

let content = fs.readFileSync('lib/googleSheets.js', 'utf8');
const oldFunc = `export function getGoogleSheetsUrl() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_GS_URL_KEY) || '';
}`;

const newFunc = `export function getGoogleSheetsUrl() {
  if (typeof window === 'undefined') return '';
  const hardcodedUrl = 'https://script.google.com/macros/s/AKfycbyZLCn9JvI-ujPgx1umIHA4Zcj7eMYPsCW5WXP1TStGWoTqp5opregiegbgWo7IlPPn/exec';
  return localStorage.getItem(LOCAL_STORAGE_GS_URL_KEY) || hardcodedUrl;
}`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('lib/googleSheets.js', content);
console.log('Fixed googleSheets.js');
