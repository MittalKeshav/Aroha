const fs = require('fs');

function writeWAV(filename, samples, channels = 1) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22); // Channels
  buffer.writeUInt32LE(44100, 24); // Sample rate
  buffer.writeUInt32LE(44100 * 2 * channels, 28); // Byte rate
  buffer.writeUInt16LE(2 * channels, 32); // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);

  // Data
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public/sounds')) {
  fs.mkdirSync('public/sounds', { recursive: true });
}

// Generate 10 seconds
const duration = 10;
const sampleRate = 44100;
const length = duration * sampleRate;

// White Noise
const white = new Int16Array(length);
for(let i=0; i<length; i++) {
  white[i] = (Math.random() * 2 - 1) * 32767 * 0.3; // Lower volume
}
writeWAV('public/sounds/white-noise.wav', white);

// Brown Noise
const brown = new Int16Array(length);
let lastOut = 0;
for(let i=0; i<length; i++) {
  let white = (Math.random() * 2 - 1);
  let out = (lastOut + (0.02 * white)) / 1.02;
  lastOut = out;
  brown[i] = out * 32767 * 3.5; 
}
writeWAV('public/sounds/brown-noise.wav', brown);

// Pink Noise
const pink = new Int16Array(length);
let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
for(let i=0; i<length; i++) {
  let white = (Math.random() * 2 - 1);
  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  b3 = 0.86650 * b3 + white * 0.3104856;
  b4 = 0.55000 * b4 + white * 0.5329522;
  b5 = -0.7616 * b5 - white * 0.0168980;
  let out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
  b6 = white * 0.115926;
  pink[i] = out * 32767 * 0.1; 
}
writeWAV('public/sounds/pink-noise.wav', pink);

// Binaural Beats (Stereo, 200Hz Left, 210Hz Right = 10Hz Alpha beat)
const binaural = new Int16Array(length * 2);
for(let i=0; i<length; i++) {
  const t = i / sampleRate;
  const left = Math.sin(2 * Math.PI * 200 * t);
  const right = Math.sin(2 * Math.PI * 210 * t);
  binaural[i*2] = left * 32767 * 0.3; // left channel
  binaural[i*2+1] = right * 32767 * 0.3; // right channel
}
writeWAV('public/sounds/binaural-beats.wav', binaural, 2);

console.log('Audio files generated successfully.');
