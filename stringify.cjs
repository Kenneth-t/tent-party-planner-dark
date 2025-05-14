const fs = require('fs');

const raw = fs.readFileSync('feest-in-de-tent-41ceb56d050c.json', 'utf8');
const json = JSON.parse(raw);
const stringified = JSON.stringify(json);

fs.writeFileSync('escaped-key.txt', stringified);
console.log('✅ Escaped key saved to escaped-key.txt');