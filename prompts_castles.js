/**
 * PromptForge: Castle Flyover Generator
 * Usage: node castle-drone.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ICONIC CASTLES & FORTRESSES
// ---------------------------------------------------------

const CASTLES = [
  // --- EUROPE (CORE) ---
  'Neuschwanstein Castle, Germany',
  'Hohenzollern Castle, Germany',
  'Heidelberg Castle, Germany',
  'Eltz Castle, Germany',
  'Lichtenstein Castle, Germany',
  'Wartburg Castle, Germany',
  'Schwerin Castle, Germany',
  'Burg Kreuzenstein, Austria',
  'Hohenwerfen Castle, Austria',
  'Mirabell Palace, Austria',

  'Edinburgh Castle, Scotland',
  'Eilean Donan Castle, Scotland',
  'Stirling Castle, Scotland',
  'Urquhart Castle, Scotland',
  'Balmoral Castle, Scotland',

  'Windsor Castle, England',
  'Tower of London, England',
  'Leeds Castle, England',
  'Warwick Castle, England',
  'Dover Castle, England',

  'Kilkenny Castle, Ireland',
  'Blarney Castle, Ireland',
  'Ashford Castle, Ireland',
  'Trim Castle, Ireland',

  'Château de Chambord, France',
  'Château de Chenonceau, France',
  'Château de Versailles, France',
  'Carcassonne Fortress, France',
  'Mont Saint-Michel Abbey, France',
  'Château de Blois, France',
  'Château d’Amboise, France',

  'Alhambra Palace, Spain',
  'Alcázar of Segovia, Spain',
  'Alcázar of Seville, Spain',
  'Loarre Castle, Spain',
  'Bellver Castle, Spain',

  'Pena Palace, Portugal',
  'Castelo de São Jorge, Portugal',
  'Óbidos Castle, Portugal',

  'Prague Castle, Czech Republic',
  'Karlštejn Castle, Czech Republic',

  'Malbork Castle, Poland',
  'Wawel Castle, Poland',

  'Bran Castle, Romania',
  'Peleș Castle, Romania',
  'Corvin Castle, Romania',

  'Bled Castle, Slovenia',
  'Predjama Castle, Slovenia',

  'Hluboká Castle, Czech Republic',
  'Trakai Castle, Lithuania',
  'Sigulda Castle, Latvia',

  // --- ITALY ---
  'Castel Sant’Angelo, Rome, Italy',
  'Castello Sforzesco, Milan, Italy',
  'Castel del Monte, Italy',
  'Aragonese Castle, Ischia, Italy',
  'Castello di Miramare, Italy',

  // --- ASIA ---
  'Himeji Castle, Japan',
  'Matsumoto Castle, Japan',
  'Osaka Castle, Japan',
  'Nagoya Castle, Japan',

  'Gyeongbokgung Palace, Seoul, South Korea',
  'Changdeokgung Palace, South Korea',

  'Forbidden City, Beijing, China',
  'Potala Palace, Tibet, China',

  'Mehrangarh Fort, India',
  'Amber Fort, India',
  'Jaisalmer Fort, India',
  'Red Fort, Delhi, India',
  'Agra Fort, India',
  'Gwalior Fort, India',
  'Golconda Fort, India',
  'Chittorgarh Fort, India',

  // --- MIDDLE EAST ---
  'Krak des Chevaliers, Syria',
  'Aleppo Citadel, Syria',
  'Jerusalem Citadel, Israel',
  'Masada Fortress, Israel',

  // --- AFRICA ---
  'Citadel of Cairo, Egypt',
  'Elmina Castle, Ghana',
  'Cape Coast Castle, Ghana',

  // --- AMERICAS ---
  'Chapultepec Castle, Mexico',
  'Castillo de San Marcos, USA',
  'Hearst Castle, USA',
  'Boldt Castle, USA',

  // --- EXPANDED EUROPE (FILL TO 300) ---
  'Hohensalzburg Fortress, Austria',
  'Rosenborg Castle, Denmark',
  'Frederiksborg Castle, Denmark',
  'Gripsholm Castle, Sweden',
  'Kalmar Castle, Sweden',
  'Akershus Fortress, Norway',
  'Kronborg Castle, Denmark',
  'Chillon Castle, Switzerland',
  'Bellinzona Castles, Switzerland',
  'Vaduz Castle, Liechtenstein',

  'Spiš Castle, Slovakia',
  'Orava Castle, Slovakia',
  'Devín Castle, Slovakia',

  'Eger Castle, Hungary',
  'Buda Castle, Hungary',

  'Bojnice Castle, Slovakia',
  'Pidhirtsi Castle, Ukraine',
  'Kamianets-Podilskyi Castle, Ukraine',

  'Narva Castle, Estonia',
  'Toompea Castle, Estonia',

  'Cesky Krumlov Castle, Czech Republic',
  'Rabsztyn Castle, Poland',

  'Château de Pierrefonds, France',
  'Château de Foix, France',
  'Château de Vincennes, France',

  'Castle of Coca, Spain',
  'Castle of Almodóvar, Spain',

  'Castelo de Guimarães, Portugal',

  'Rocca Calascio, Italy',
  'Castello Estense, Italy',
  'Castelvecchio, Italy',
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