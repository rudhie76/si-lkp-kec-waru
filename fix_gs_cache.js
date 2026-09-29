const fs = require('fs');

const file = 'lib/googleSheets.js';
let content = fs.readFileSync(file, 'utf8');

const oldGetReports = "const res = await fetch(`${webAppUrl}?action=getReports`);";
const newGetReports = "const res = await fetch(`${webAppUrl}?action=getReports&t=${Date.now()}`);";

const oldGetUsers = "const res = await fetch(`${webAppUrl}?action=getUsers`);";
const newGetUsers = "const res = await fetch(`${webAppUrl}?action=getUsers&t=${Date.now()}`);";

let modified = false;

if(content.includes(oldGetReports)) {
  content = content.replace(oldGetReports, newGetReports);
  modified = true;
}
if(content.includes(oldGetUsers)) {
  content = content.replace(oldGetUsers, newGetUsers);
  modified = true;
}

if(modified) {
  fs.writeFileSync(file, content);
  console.log("Cache buster added!");
} else {
  console.log("Could not find fetch lines");
}
