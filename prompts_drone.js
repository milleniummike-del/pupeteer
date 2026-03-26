/**
 * PromptForge: Epic Travel Drone Shot Generator (Enhanced)
 * Usage: node drone-travel.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// PROCEDURAL LOCATION SYSTEM (10k+ combinations)
// ---------------------------------------------------------

const REGIONS = [
  'Iceland','Norway','Switzerland','Italy','France','Spain','Greece',
  'Turkey','Morocco','Egypt','Tanzania','Kenya','South Africa',
  'USA','Canada','Mexico','Peru','Chile','Brazil','Argentina',
  'Japan','South Korea','China','Vietnam','Thailand','Indonesia',
  'Philippines','India','Nepal','Sri Lanka','Maldives',
  'Australia','New Zealand','Fiji','French Polynesia'
];

const TERRAINS = [
  'mountain range','coastal cliffs','tropical island','desert dunes',
  'rainforest valley','glacial lagoon','volcanic crater',
  'river canyon','alpine lake','rolling hills',
  'savanna plains','ancient ruins','waterfall basin',
  'fjord landscape','coral reef lagoon','high plateau',
  'forest canopy','delta wetlands','rocky arch formations'
];

const DESCRIPTORS = [
  'dramatic','vast','remote','untouched','breathtaking',
  'serene','wild','majestic','otherworldly','cinematic',
  'fog-covered','sunlit','stormy','golden','lush'
];

const EXTRAS = [
  'with mist rolling through the landscape',
  'glowing under golden hour light',
  'with clouds drifting below peaks',
  'surrounded by crystal-clear water',
  'with dramatic shadows stretching across terrain',
  'covered in vibrant natural colors',
  'with waves crashing against formations',
  'blanketed in soft atmospheric haze',
  'with sunlight reflecting across surfaces',
  'revealed through lifting fog'
];

const generateLocations = () => {
  const locations = [];
  for (const region of REGIONS) {
    for (const terrain of TERRAINS) {
      for (const desc of DESCRIPTORS) {
        const extra = EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
        locations.push(`${desc} ${terrain} in ${region}, ${extra}`);
      }
    }
  }
  return locations;
};

// ---------------------------------------------------------
// ICONIC LANDMARKS & NATURAL WONDERS
// ---------------------------------------------------------

const LANDMARKS = [
  'Santorini caldera cliffs, Greece',
  'Amalfi Coast cliffs, Italy',
  'Dolomites mountain peaks, Italy',
  'Mont Saint-Michel tidal island, France',
  'Cliffs of Moher, Ireland',
  'Plitvice Lakes waterfalls, Croatia',
  'Lake Bled island church, Slovenia',
  'Geirangerfjord, Norway',
  'Preikestolen cliff, Norway',
  'Hallstatt alpine village, Austria',
  'Matterhorn peak, Switzerland',
  'Acropolis overlooking Athens, Greece',
  'Neuschwanstein Castle, Germany',
  'Faroe Islands sea cliffs',

  'Great Wall over mountains, China',
  'Zhangjiajie pillar mountains, China',
  'Mount Fuji, Japan',
  'Arashiyama bamboo forest, Japan',
  'Ha Long Bay karsts, Vietnam',
  'Angkor Wat temples, Cambodia',
  'Bagan temple plains, Myanmar',
  'Sigiriya rock fortress, Sri Lanka',
  'Taj Mahal, India',
  'Petra rock city, Jordan',
  'Wadi Rum desert, Jordan',
  'Burj Khalifa skyline, Dubai',
  'Sheikh Zayed Grand Mosque, Abu Dhabi',

  'Grand Canyon, USA',
  'Horseshoe Bend, USA',
  'Yosemite Valley, USA',
  'Niagara Falls',
  'Lake Louise, Canada',
  'Moraine Lake, Canada',
  'Torres del Paine, Chile',
  'Perito Moreno Glacier, Argentina',
  'Machu Picchu, Peru',
  'Amazon rainforest basin',
  'Christ the Redeemer, Brazil',
  'Iguazu Falls',
  'Antelope Canyon, USA',
  'Monument Valley, USA',
  'Salar de Uyuni, Bolivia',

  'Serengeti plains, Tanzania',
  'Mount Kilimanjaro, Tanzania',
  'Victoria Falls',
  'Namib Desert dunes',
  'Table Mountain, South Africa',

  'Great Barrier Reef, Australia',
  'Uluru rock, Australia',
  'Twelve Apostles, Australia',
  'Milford Sound, New Zealand',
  'Mount Cook, New Zealand',

  'Maldives lagoons',
  'Bora Bora lagoon',
  'Seychelles beaches',
  'Galápagos Islands'
];

// ---------------------------------------------------------
// ORIGINAL SYSTEM ELEMENTS
// ---------------------------------------------------------

const SUGGESTIONS = {
  locations: generateLocations(),

  naturalMotion: [
    'waves rolling gently toward the shore',
    'clouds drifting slowly through valleys',
    'mist weaving between mountain peaks',
    'waterfalls thundering into deep pools',
    'wind rippling across tall grass',
    'sunlight glittering across ocean surfaces',
    'fog lifting to reveal the landscape',
    'shadows stretching as the sun sets',
    'snow blowing across high ridgelines',
    'birds flying far below as tiny silhouettes'
  ],

  timeOfDay: [
    'golden hour sunset',
    'soft pastel sunrise',
    'bright midday clarity',
    'blue hour twilight',
    'moody overcast afternoon',
    'dramatic storm-light skies'
  ],

  moods: [
    'awe-inspiring natural grandeur',
    'peaceful cinematic serenity',
    'epic sense of scale',
    'dreamlike wanderlust atmosphere',
    'majestic untouched beauty',
    'calm reflective stillness'
  ]
};

const CAMERA_STYLE = [
  'slow forward drone glide',
  'high-altitude aerial panorama',
  'cinematic orbit around landscape feature',
  'top-down vertical reveal shot',
  'long sweeping side-to-side flyover',
  'gradual pullback revealing massive scale',
  'low-to-high altitude rising reveal'
];

const VISUALS = [
  'volumetric sunlight rays',
  'ultra high resolution detail',
  'natural cinematic color grading',
  'soft atmospheric haze',
  'high dynamic range lighting',
  'crisp environmental textures',
  'gentle motion blur from drone movement'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------

const generateDroneBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const useLandmark = Math.random() < 0.35;

    const loc = useLandmark
      ? getRandom(LANDMARKS)
      : getRandom(SUGGESTIONS.locations);

    const motion = getRandom(SUGGESTIONS.naturalMotion);
    const time = getRandom(SUGGESTIONS.timeOfDay);
    const mood = getRandom(SUGGESTIONS.moods);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const visuals = pickN(VISUALS, 3).join(', ');

    const label = useLandmark ? 'ICONIC LOCATION' : 'LOCATION';

    batch.push(
      `videos[${i}] = \`${label}: ${loc} - TIME: ${time} - MOTION: ${motion} - MOOD: ${mood} - CAMERA: ${cam} - VISUAL STYLE: ${visuals}\`;`
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

const output = generateDroneBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🌍 drone-videos.js generated successfully (enhanced cinematic mode)');