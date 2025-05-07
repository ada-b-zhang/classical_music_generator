import fs from 'fs';
import path from 'path';

const from = path.resolve('src/main/config.json');
const to = path.resolve('dist/main/config.json');

fs.copyFileSync(from, to);
console.log(`✅ Copied config.json to ${to}`);
