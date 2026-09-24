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
  file = file.replace(/\\/g, '/');

  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  if (content.includes('useMockStore')) {
    // Replace useMockStore import
    content = content.replace(/import\s*{\s*useMockStore[^{}]*}\s*from\s*['"][^'"]*(mock|useMockStore)['"];?\n?/g, '');
    
    // Replace const { session } = useMockStore() -> useAuthStore
    if (content.includes('useMockStore()')) {
      if (content.includes('session')) {
         content = content.replace(/const\s*{\s*session\s*}\s*=\s*useMockStore\(\);?/g, 'const user = useAuthStore((s: any) => s.user);\n  const session = user;');
         
         if (!content.includes('useAuthStore')) {
           const depth = file.split('/').length - 2;
           const prefix = depth === 0 ? './' : '../'.repeat(depth);
           content = `import { useAuthStore } from '${prefix}stores/useAuthStore';\n` + content;
         }
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    updated++;
  }
});
console.log('Updated ' + updated + ' files to remove useMockStore.');
