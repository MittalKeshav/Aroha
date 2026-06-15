const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Rain_falling_on_a_tent.ogg', name: 'rain.ogg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Ocean_waves_sound.ogg', name: 'ocean.ogg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Forest_birds.ogg', name: 'forest.ogg' },
];

if (!fs.existsSync('public/sounds')) {
  fs.mkdirSync('public/sounds', { recursive: true });
}

urls.forEach(item => {
  const dest = path.join('public/sounds', item.name);
  https.get(item.url, { headers: { 'User-Agent': 'MyNodeApp/1.0' } }, res => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => console.log('Downloaded:', item.name));
    } else {
      console.log('Failed:', item.name, res.statusCode);
    }
  }).on('error', err => console.log('Error:', err.message));
});
