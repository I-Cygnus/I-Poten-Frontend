const fs = require('fs'); const path = require('path');
const SRC = path.resolve(__dirname, '..', 'build-static');
const DEST = path.resolve(__dirname, '..', '..', 'main-container', 'public');
function copyDir(s, d) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    for (const n of fs.readdirSync(s)) {
        const S = path.join(s, n), D = path.join(d, n);
        fs.statSync(S).isDirectory() ? copyDir(S, D) : fs.copyFileSync(S, D);
    }
}
copyDir(SRC, DEST);
console.log('✅ SSG pages → main-container/public');
