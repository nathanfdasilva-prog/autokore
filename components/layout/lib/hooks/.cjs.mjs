const sharp = require('sharp');
const fs = require('fs');

fs.mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#E85D04"/>
  <text x="50" y="68" font-family="Arial Black,Arial" font-weight="900" font-size="52" text-anchor="middle" fill="white">A</text>
</svg>`;

const buf = Buffer.from(svg);

const todos = [
  ...sizes.map(s => sharp(buf).resize(s, s).png().toFile(`public/icons/icon-${s}x${s}.png`)),
  sharp(buf).resize(96, 96).png().toFile('public/icons/shortcut-os.png'),
  sharp(buf).resize(96, 96).png().toFile('public/icons/shortcut-agenda.png'),
];

await Promise.all(todos);
console.log('✅ Ícones criados com sucesso!');