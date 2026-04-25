/**
 * PromptForge: Church & Temple Flyover Generator
 * Usage: node sacred-drone.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ICONIC CHURCHES, CATHEDRALS & TEMPLES
// ---------------------------------------------------------

const SACRED_SITES = [
  // --- EUROPE ---
  'St. Peter’s Basilica, Vatican City',
  'Notre-Dame Cathedral, Paris, France',
  'Sagrada Familia, Barcelona, Spain',
  'Cologne Cathedral, Germany',
  'Westminster Abbey, London, England',
  'St. Paul’s Cathedral, London, England',
  'Milan Cathedral (Duomo di Milano), Italy',
  'Florence Cathedral (Santa Maria del Fiore), Italy',
  'St. Mark’s Basilica, Venice, Italy',
  'Chartres Cathedral, France',
  'Reims Cathedral, France',
  'Canterbury Cathedral, England',
  'Salisbury Cathedral, England',
  'Durham Cathedral, England',
  'Hagia Sophia, Istanbul, Turkey',
  'Blue Mosque (Sultan Ahmed Mosque), Istanbul, Turkey',
  'Church of the Savior on Spilled Blood, Saint Petersburg, Russia',
  'Saint Basil’s Cathedral, Moscow, Russia',
  'Alexander Nevsky Cathedral, Sofia, Bulgaria',
  'Hallgrímskirkja, Reykjavik, Iceland',

  // --- ASIA ---
  'Angkor Wat, Cambodia',
  'Wat Phra Kaew, Bangkok, Thailand',
  'Wat Arun, Bangkok, Thailand',
  'Shwedagon Pagoda, Yangon, Myanmar',
  'Borobudur Temple, Indonesia',
  'Prambanan Temple, Indonesia',
  'Meenakshi Temple, Madurai, India',
  'Golden Temple (Harmandir Sahib), Amritsar, India',
  'Akshardham Temple, Delhi, India',
  'Kashi Vishwanath Temple, Varanasi, India',
  'Todai-ji Temple, Nara, Japan',
  'Kinkaku-ji (Golden Pavilion), Kyoto, Japan',
  'Senso-ji Temple, Tokyo, Japan',
  'Jokhang Temple, Lhasa, Tibet',
  'Temple of Heaven, Beijing, China',

  // --- MIDDLE EAST ---
  'Al-Aqsa Mosque, Jerusalem',
  'Dome of the Rock, Jerusalem',
  'Sheikh Zayed Grand Mosque, Abu Dhabi, UAE',
  'Imam Reza Shrine, Mashhad, Iran',
  'Nasir al-Mulk Mosque (Pink Mosque), Shiraz, Iran',

  // --- AFRICA ---
  'Lalibela Rock-Hewn Churches, Ethiopia',
  'St. George’s Cathedral, Cape Town, South Africa',
  'Great Mosque of Djenné, Mali',

  // --- AMERICAS ---
  'St. Patrick’s Cathedral, New York, USA',
  'Washington National Cathedral, USA',
  'Salt Lake Temple, Utah, USA',
  'Basilica of Our Lady of Guadalupe, Mexico City, Mexico',
  'Metropolitan Cathedral, Rio de Janeiro, Brazil',
  'Catedral de Sevilla, Spain (Americas link via influence)',

  // --- EXPANDED (FILL VARIETY) ---
  'La Sagrada Familia Crypt, Spain',
  'Basilica of Sacré-Cœur, Paris, France',
  'Rouen Cathedral, France',
  'Ulm Minster, Germany',
  'Speyer Cathedral, Germany',
  'Monreale Cathedral, Sicily, Italy',
  'Assisi Basilica of St. Francis, Italy',
  'San Vitale Basilica, Ravenna, Italy',
  'St. Nicholas Church, Prague, Czech Republic',
  'Wawel Cathedral, Kraków, Poland',
  'Vilnius Cathedral, Lithuania',
  'Riga Cathedral, Latvia',
  'Helsinki Cathedral, Finland',
  'Oslo Cathedral, Norway',
  'Stockholm Cathedral, Sweden'
];

// ---------------------------------------------------------
// CAMERA / DRONE MOVEMENTS
// ---------------------------------------------------------

const CAMERA_STYLE = [
  'low sweeping drone flyover across rooftops and courtyards',
  'high-altitude cinematic orbit around domes and towers',
  'forward glide toward grand entrance',
  'top-down reveal of architectural symmetry',
  'slow rising shot from ground level to spires',
  'wide aerial pass across surrounding cityscape',
  'cinematic circular orbit around central dome',
  'descending drone shot toward main plaza'
];

// ---------------------------------------------------------
// ENVIRONMENT & ATMOSPHERE
// ---------------------------------------------------------

const TIME_OF_DAY = [
  'golden hour sunset',
  'misty sunrise',
  'blue hour twilight',
  'bright midday clarity',
  'moonlit night with glowing interiors'
];

const ENVIRONMENT = [
  'fog drifting through surrounding streets',
  'mountains or hills in the background',
  'river or water reflecting the structure',
  'urban cityscape surrounding the site',
  'snow covering rooftops and courtyards',
  'lush gardens and open plazas'
];

const MOTION = [
  'bells gently ringing in the distance',
  'birds circling above domes and spires',
  'soft mist drifting across architecture',
  'sunlight reflecting off glass and stone',
  'people moving subtly in the plaza below'
];

const MOOD = [
  'spiritual and serene atmosphere',
  'awe-inspiring sacred grandeur',
  'peaceful and reflective tone',
  'ancient historical reverence',
  'cinematic divine majesty'
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

const generateSacredBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    const site = getRandom(SACRED_SITES);
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

const output = generateSacredBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('⛪ Sacred site flyover prompts generated successfully');