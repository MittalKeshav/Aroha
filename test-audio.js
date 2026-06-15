const https = require('https');

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/4/41/Brown_noise.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9c/White_noise.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/7/76/Pink_noise.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/5/5e/Binaural_Beat_-_10_Hz_Alpha_-_Base_frequency_200_Hz.ogg',
  'https://upload.wikimedia.org/wikipedia/commons/c/ce/Tibetan_singing_bowls.ogg'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, res.statusCode);
  }).on('error', (e) => {
    console.error(url, e.message);
  });
});
