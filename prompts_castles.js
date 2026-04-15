/**
 * PromptForge: Castle Flyover Generator
 * Usage: node castle-drone.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ICONIC CASTLES & FORTRESSES
// ---------------------------------------------------------

const CASTLES = [
  'Neuschwanstein Castle, Germany',
  'Edinburgh Castle, Scotland',
  'Windsor Castle, England',
  'Château de Chambord, France',
  'Mont Saint-Michel Abbey, France',
  'Himeji Castle, Japan',
  'Bran Castle (Dracula’s Castle), Romania',
  'Prague Castle, Czech Republic',
  'Alhambra Palace, Granada, Spain',
  'Castel Sant’Angelo, Rome, Italy',

  'Bled Castle, Slovenia',
  'Eilean Donan Castle, Scotland',
  'Kilkenny Castle, Ireland',
  'Pena Palace, Sintra, Portugal',
  'Mehrangarh Fort, Jodhpur, India',
  'Amber Fort, Jaipur, India',
  'Gyeongbokgung Palace, Seoul, South Korea',
  'Matsumoto Castle, Japan',
  'Malbork Castle, Poland',
  'Conwy Castle, Wales',

  'Lichtenstein Castle, Germany',
  'Château de Chenonceau, France',
  'Heidelberg Castle, Germany',
  'Alcázar of Segovia, Spain',
  'Krak des Chevaliers, Syria'
];

// ---------------------------------------------------------
// CAMERA / DRONE MOVEMENTS
// ---------------------------------------------------------

const CAMERA_STYLE = [
  'low sweeping drone flyover over castle walls',
  'high-altitude cinematic orbit around fortress',
  'forward glide through castle approach',
  'top-down reveal of castle layout',
  'slow rising shot from moat to towers',
  'wide aerial pass across surrounding landscape',
  'cinematic circular orbit around towers',
  'descending drone shot toward main gate'
];

// ---------------------------------------------------------
// ENVIRONMENT & ATMOSPHERE
// ---------------------------------------------------------

const TIME_OF_DAY = [
  'golden hour sunset',
  'misty sunrise',
  'blue hour twilight',
  'bright midday clarity',
  'moonlit night with glowing windows'
];

const ENVIRONMENT = [
  'fog rolling through hills',
  'mountains towering in the background',
  'river flowing beside the castle',
  'dense forest surrounding the fortress',
  'snow covering rooftops and landscape',
  'lush green countryside stretching outward'
];

const MOTION = [
  'flags waving in the wind',
  'birds circling above towers',
  'soft mist drifting across stone walls',
  'sunlight reflecting off rooftops',
  'shadows moving across ancient structures'
];

const MOOD = [
  'epic medieval grandeur',
  'mysterious and legendary atmosphere',
  'fairytale fantasy feeling',
  'ancient historical majesty',
  'cinematic adventure tone'
];

const VISUALS = [
  'ultra high resolution',
  'cinematic color grading',
  'volumetric lighting',
  'high dynamic range',
  'realistic shadows',
  'soft atmospheric haze'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------

const generateCastleBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    const castle = getRandom(CASTLES);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const time = getRandom(TIME_OF_DAY);
    const env = getRandom(ENVIRONMENT);
    const motion = getRandom(MOTION);
    const mood = getRandom(MOOD);
    const visuals = pickN(VISUALS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`FLYOVER: ${castle} - TIME: ${time} - ENVIRONMENT: ${env} - CAMERA: ${cam} - MOTION: ${motion} - MOOD: ${mood} - VISUAL STYLE: ${visuals}\`;`
    );
  }

  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateCastleBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🏰 Castle flyover prompts generated successfully');