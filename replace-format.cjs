const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const findAndReplace = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            content = content.replace(/import\s*{\s*formatMontant\s*}\s*from\s*['"](?:\.\.\/)+data\/mock['"];?/g, (match) => {
                const depth = match.match(/\.\.\//g).length;
                const pathPrefix = '../'.repeat(depth);
                return `import { formatMontant } from '${pathPrefix}utils/format';`;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
};

findAndReplace(directoryPath);
console.log('Done formatMontant!');
