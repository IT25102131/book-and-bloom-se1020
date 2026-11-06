const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetDir = path.join(__dirname, '../src/main/resources/static/images/covers');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/jpeg,image/png,image/*,*/*'
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return download(redirectUrl, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    });
    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  const tasks = [
    {
      name: 'road-to-elephant-pass.jpg',
      url: 'https://m.media-amazon.com/images/I/51r26t3Q-uL._AC_UF1000,1000_QL80_.jpg' // Nihal de Silva Road from Elephant Pass
    },
    {
      name: 'madol-doova.jpg',
      url: 'https://m.media-amazon.com/images/I/71rI5sC8GgL._AC_UF1000,1000_QL80_.jpg'
    }
  ];

  for (const t of tasks) {
    try {
      const dest = path.join(targetDir, t.name);
      await download(t.url, dest);
      const st = fs.statSync(dest);
      console.log(`Success: ${t.name} (${st.size} bytes)`);
    } catch (e) {
      console.log(`Failed ${t.name}: ${e.message}`);
    }
  }
}

run();

