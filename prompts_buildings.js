/**
 * PromptForge: Historical Structures Flyover Generator
 * Covers temples, castles, bridges, ruins & ancient architecture (200+ years old)
 * Usage: node historical-drone.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// HISTORICAL SITES (200+ YEARS OLD)
// ---------------------------------------------------------

const HISTORICAL_SITES = [
  // --- TEMPLES & RELIGIOUS ---
  'Angkor Wat, Cambodia',
  'Borobudur Temple, Indonesia',
  'Meenakshi Temple, India',
  'Kinkaku-ji Temple, Kyoto, Japan',
  'Temple of Heaven, Beijing, China',
  'St. Peter’s Basilica, Vatican City',
  'Notre-Dame Cathedral, Paris, France',
  'Cologne Cathedral, Germany',
  'Hagia Sophia, Istanbul, Turkey',
  'Lalibela Rock-Hewn Churches, Ethiopia',

  // --- CASTLES & FORTRESSES ---
  'Neuschwanstein Castle, Germany',
  'Edinburgh Castle, Scotland',
  'Windsor Castle, England',
  'Château de Chambord, France',
  'Carcassonne Fortress, France',
  'Prague Castle, Czech Republic',
  'Alhambra Palace, Granada, Spain',
  'Krak des Chevaliers, Syria',
  'Himeji Castle, Japan',
  'Bran Castle, Romania',

  // --- ANCIENT RUINS & ARCHAEOLOGY ---
  'Machu Picchu, Peru',
  'Petra, Jordan',
  'Colosseum, Rome, Italy',
  'Roman Forum, Rome, Italy',
  'Pompeii Ruins, Italy',
  'Great Zimbabwe Ruins, Zimbabwe',
  'Tikal Mayan Ruins, Guatemala',
  'Chichen Itza, Mexico',
  'Ephesus Ancient City, Turkey',
  'Delphi Ruins, Greece',

  // --- BRIDGES & ENGINEERING ---
  'Pont du Gard Roman Aqueduct, France',
  'Charles Bridge, Prague, Czech Republic',
  'Rialto Bridge, Venice, Italy',
  'Ponte Vecchio, Florence, Italy',
  'Alcántara Bridge, Spain',

  // --- MONUMENTS & ICONIC STRUCTURES ---
  'Great Wall of China',
  'Parthenon, Athens, Greece',
  'Pantheon, Rome, Italy',
  'Tower of London, England',
  'Leaning Tower of Pisa, Italy',
  'Stonehenge, England',
  'Moai Statues, Easter Island, Chile',
  'Angkor Thom, Cambodia',
  'Forbidden City, Beijing, China'
];

// ---------------------------------------------------------
// CAMERA / DRONE MOVEMENTS
// ---------------------------------------------------------

const CAMERA_STYLE = [
  'low sweeping drone flyover across ancient walls',
  'high-altitude cinematic orbit around the structure',
  'forward glide toward monumental entrance',
  'top-down reveal of architectural symmetry',
  'slow rising shot revealing full scale',
  'wide aerial pass across surrounding landscape',
  'cinematic circular orbit around central structure',
  'descending drone shot toward ruins below'
];

// ---------------------------------------------------------
// ENVIRONMENT & ATMOSPHERE
// ---------------------------------------------------------

const TIME_OF_DAY = [
  'golden hour sunset',
  'misty sunrise',
  'blue hour twilight',
  'bright midday clarity',
  'moonlit night'
];

const ENVIRONMENT = [
  'fog drifting through ruins',
  'mountains rising in the background',
  'river reflecting ancient stone',
  'dense jungle partially reclaiming structures',
  'snow covering rooftops and pathways',
  'vast open plains surrounding the site',
  'ancient city ruins stretching into distance'
];

const MOTION = [
  'birds circling above the structure',
  'wind moving through broken stone corridors',
  'soft mist drifting across ruins',
  'sunlight reflecting off weathered surfaces',
  'subtle human presence in the distance'
];

const MOOD = [
  'ancient and mysterious atmosphere',
  'awe-inspiring historical grandeur',
  'quiet and reflective tone',
  'timeless archaeological wonder',
  'cinematic epic scale'
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

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------

const generateHistoricalBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    const site = getRandom(HISTORICAL_SITES);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const time = getRandom(TIME_OF_DAY);
    const env = getRandom(ENVIRONMENT);
    const motion = getRandom(MOTION);
    const mood = getRandom(MOOD);
    const visuals = pickN(VISUALS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`FLYOVER: ${site} - TIME: ${time} - ENVIRONMENT: ${env} - CAMERA: ${cam} - MOTION: ${motion} - MOOD: ${mood} - VISUAL STYLE: ${visuals}\`;`
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

const output = generateHistoricalBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🏛️ Historical structure flyover prompts generated successfully');