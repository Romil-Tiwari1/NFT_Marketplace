const fs = require('fs');
const path = require('path');

// Path to your index.html
const indexPath = path.join(__dirname, '..', '..', 'build', 'index.html');

// Read the file
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Replace the paths to make them relative only for the starting slash
indexHtml = indexHtml.replace(/(href|src)="\/(?!\/)/g, '$1="');

// Add the base tag
if (!indexHtml.includes('<base href="./">')) {
  indexHtml = indexHtml.replace(/<head>/, '<head>\n  <base href="./">');
}

// Write the file back
fs.writeFileSync(indexPath, indexHtml);
