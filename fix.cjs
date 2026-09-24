const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walkDir(dirPath, callback);
    else callback(path.join(dir, f));
  });
}

let updated = 0;
walkDir('src', file => {
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
  // Convert Windows path separator to forward slash
  file = file.replace(/\\/g, '/');

  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  if (content.includes('formatMontant') && (content.includes('/data/mock') || content.includes('/data/useMockStore') || content.includes('/mock/mock'))) {
    content = content.replace(/,\s*formatMontant\s*}/g, '}');
    content = content.replace(/{\s*formatMontant\s*,/g, '{');
    content = content.replace(/{\s*formatMontant\s*}/g, '{}');
    
    content = content.replace(/import\s*{}\s*from\s*['"][^'"]*(mock|useMockStore)[^'"]*['"];?\n?/g, '');
    
    if (!content.includes('import { formatMontant }')) {
      const depth = file.split('/').length - 2;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      content = `import { formatMontant } from '${prefix}utils/format';\n` + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    updated++;
  }
});
console.log('Updated ' + updated + ' files for formatMontant.');