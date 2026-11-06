const https = require('https');
const fs = require('fs');
const path = require('path');

const imgUrl = 'https://upload.wikimedia.org/wikipedia/en/a/a1/Road_from_the_Elephant_Pass_book_over.jpg';
const out = path.join(__dirname, '../src/main/resources/static/images/covers/road-to-elephant-pass.jpg');

const req = https.get(imgUrl, {
  headers: {
    'User-Agent': 'BookStoreDemo/1.0 (academic project; contact: student@example.com)'
  }
}, res => {
  console.log('Status code:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(out);
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        console.log('Successfully saved elephant pass cover, size:', fs.statSync(out).size);
      });
    });
  } else {
    console.log('Failed with status:', res.statusCode);
  }
});

req.on('error', err => console.log('Req error:', err.message));
