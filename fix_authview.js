const fs = require('fs');

const file = 'components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update to hide the button if users exist
const target = '{onOpenGSModal && (';
const replacement = '{onOpenGSModal && users.length === 0 && (';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed AuthView.jsx');
} else {
  console.log('Target not found');
}
