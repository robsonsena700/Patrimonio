import fs from 'fs';
import path from 'path';

const viteJsPath = path.join(process.cwd(), 'server/dist/server/vite.js');

if (!fs.existsSync(viteJsPath)) {
  console.error('✗ server/dist/server/vite.js not found');
  process.exit(1);
}

let content = fs.readFileSync(viteJsPath, 'utf8');
let fixCount = 0;

const viteConfigPattern = /import\s+viteConfig\s+from\s+["']\.\.\/vite\.config["']/;
if (viteConfigPattern.test(content)) {
  content = content.replace(viteConfigPattern, 'import viteConfig from "../vite.config.js"');
  fixCount++;
  console.log('✓ Fixed vite.config import to add .js extension');
} else {
  console.error('✗ Could not find vite.config import pattern to fix');
  process.exit(1);
}

const distPathPattern = /(const|var|let)\s+distPath\s*=\s*path\.resolve\(import\.meta\.dirname,\s*["']public["']\)/;
if (distPathPattern.test(content)) {
  content = content.replace(distPathPattern, '$1 distPath = path.resolve(import.meta.dirname, "../../../dist/public")');
  fixCount++;
  console.log('✓ Fixed static files path to ../../../dist/public');
} else {
  console.error('✗ Could not find distPath pattern to fix');
  process.exit(1);
}

fs.writeFileSync(viteJsPath, content, 'utf8');

if (fixCount === 2) {
  console.log(`✓ Successfully applied ${fixCount} fixes to server/dist/server/vite.js`);
} else {
  console.error(`✗ Only applied ${fixCount}/2 fixes`);
  process.exit(1);
}
