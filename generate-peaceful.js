const fs = require('fs');

function writeWAV(filename, samples, channels = 1) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); 
  buffer.writeUInt16LE(channels, 22); 
  buffer.writeUInt32LE(44100, 24); 
  buffer.writeUInt32LE(44100 * 2 * channels, 28); 
  buffer.writeUInt16LE(2 * channels, 32); 
  buffer.writeUInt16LE(16, 34); 
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }
  fs.writeFileSync(filename, buffer);
}

const duration = 20; // 20 seconds loop
const sampleRate = 44100;
const length = duration * sampleRate;

// 1. Deep Space (Low frequency drones)
const space = new Int16Array(length * 2);
for(let i=0; i<length; i++) {
  const t = i / sampleRate;
  const mod1 = Math.sin(2 * Math.PI * 0.1 * t); // slow pulse
  const left = Math.sin(2 * Math.PI * 65.41 * t) * (0.5 + 0.5 * mod1); // C2
  const right = Math.sin(2 * Math.PI * 65.41 * t) * (0.5 - 0.5 * mod1);
  space[i*2] = left * 32767 * 0.4;
  space[i*2+1] = right * 32767 * 0.4;
}
writeWAV('public/sounds/deep-space.wav', space, 2);

// 2. Ethereal Chords (Cmaj7)
const ethereal = new Int16Array(length * 2);
const freqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3
for(let i=0; i<length; i++) {
  const t = i / sampleRate;
  let left = 0, right = 0;
  freqs.forEach((f, idx) => {
    const mod = Math.sin(2 * Math.PI * (0.05 + 0.02*idx) * t);
    const wave = Math.sin(2 * Math.PI * f * t);
    left += wave * (0.5 + 0.5*mod) * 0.25;
    right += wave * (0.5 - 0.5*mod) * 0.25;
  });
  ethereal[i*2] = left * 32767 * 0.4;
  ethereal[i*2+1] = right * 32767 * 0.4;
}
writeWAV('public/sounds/ethereal.wav', ethereal, 2);

// 3. Theta Waves (Deep Focus - 6Hz difference)
const theta = new Int16Array(length * 2);
for(let i=0; i<length; i++) {
  const t = i / sampleRate;
  const left = Math.sin(2 * Math.PI * 136.1 * t); // Om frequency
  const right = Math.sin(2 * Math.PI * 142.1 * t); 
  theta[i*2] = left * 32767 * 0.3;
  theta[i*2+1] = right * 32767 * 0.3;
}
writeWAV('public/sounds/theta-waves.wav', theta, 2);

console.log('Peaceful synth sounds generated!');
