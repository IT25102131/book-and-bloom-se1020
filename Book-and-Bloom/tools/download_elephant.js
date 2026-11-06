const https = require('https');
const http = require('http');
const fs = require('fs');

function get(url, dest) {
  const p = url.startsWith('https') ? https : http;
  p.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return get(res.headers.location, dest);
    }
    const ws = fs.createWriteStream(dest);
    res.pipe(ws);
    ws.on('finish', () => {
      ws.close(() => {
        console.log('Done! Size:', fs.statSync(dest).size);
      });
    });
  });
}

get('https://covers.openlibrary.org/b/id/12929902-L.jpg', 'Book-and-Bloom/src/main/resources/static/images/covers/road-to-elephant-pass.jpg');

