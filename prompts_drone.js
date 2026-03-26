/**
 * PromptForge: Epic Travel Drone Shot Generator
 * Usage: node drone-travel.js [count]
 * Generates cinematic aerial travel shots with no people
 */

const fs = require('fs');

const SUGGESTIONS = {
  locations: [
    'Santorini cliffside villages glowing at sunset, Greece',
    'Glassy fjords winding between towering cliffs, Norway',
    'Ancient temples emerging from jungle mist, Cambodia',
    'Turquoise overwater bungalows in the Maldives',
    'Dramatic limestone karsts rising from emerald waters, Vietnam',
    'Snow-covered peaks of the Swiss Alps at golden hour',
    'Endless sand dunes rippling across the Sahara Desert',
    'Winding coastal cliffs along the Amalfi Coast, Italy',
    'Lush green rice terraces carved into mountainsides, Bali',
    'Massive waterfalls plunging into rainforest canyons, Iceland',
    'Serene cherry blossom parks in full bloom, Japan',
    'Red rock arches and desert valleys, Utah, USA',
    'Remote turquoise lagoons surrounded by coral reefs, French Polynesia',
    'Rolling lavender fields under a pastel sky, Provence',
    'Towering glaciers meeting the ocean, Patagonia',
    'White marble mosques reflecting in still water, Abu Dhabi',
    'Cliffside monasteries perched on stone pillars, Meteora, Greece',
    'Vast savanna plains with acacia trees, Tanzania',
    'Ancient stone city walls overlooking the sea, Dubrovnik',
    'Crystal-clear alpine lake surrounded by pine forests, Canada',
    'Endless tea plantations covering misty hills, Sri Lanka',
    'Dramatic basalt sea cliffs battered by waves, Ireland',
    'Golden pagodas glowing above a river valley, Myanmar',
    'Remote volcanic crater lakes with deep blue water, Indonesia',
    'Coastal highway snaking along ocean cliffs, California',
    'Frozen ice caves glowing blue beneath a glacier, Iceland',
    'Vibrant autumn forests surrounding a mountain lake, South Korea',
    'Massive sandbars and swirling tidal patterns, Brazil',
    'Sunrise over ancient pyramids emerging from desert haze, Egypt',
    'Jagged mountain spires reflected in a mirror-like lake, New Zealand'
  ],

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

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const generateDroneBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const loc = getRandom(SUGGESTIONS.locations);
    const motion = getRandom(SUGGESTIONS.naturalMotion);
    const time = getRandom(SUGGESTIONS.timeOfDay);
    const mood = getRandom(SUGGESTIONS.moods);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const visuals = pickN(VISUALS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`LOCATION: ${loc} - TIME: ${time} - MOTION: ${motion} - MOOD: ${mood} - CAMERA: ${cam} - VISUAL STYLE: ${visuals}\`;`
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

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🌍 drone-videos.js generated successfully (epic travel drone mode)');
