/**
 * PromptForge: Travel Dreams Generator CLI (Single-File, UTF-8 Safe)
 * Usage: node prompts_travel.js [count]
 * Default count: 20
 */

const fs = require('fs');

const SUGGESTIONS = {
  destinations: [
    'Santorini cliffside villages at sunset',
    'Kyoto bamboo forest in the morning mist',
    'Maldives overwater villas above turquoise lagoons',
    'Swiss Alps covered in fresh snow',
    'Sahara desert dunes under a golden sky',
    'Venice canals glowing at twilight',
    'Icelandic waterfalls surrounded by moss',
    'Patagonia mountains under dramatic clouds',
    'Parisian rooftops overlooking the Eiffel Tower',
    'Great Barrier Reef coral gardens underwater',
    'Amalfi Coast winding roads above the sea',
    'Norwegian fjords with mirror-like water',
    'Tokyo neon streets at night',
    'Bali rice terraces glowing in sunrise light',
    'Scottish Highlands covered in fog',
    'New Zealand alpine lakes with crystal clarity',
    'Dubai skyline at golden hour',
    'Amazon rainforest canopy from above',
    'Antarctic icebergs glowing blue',
    'Hawaiian volcanic landscapes at dusk',
    'Marrakech markets full of color and texture',
    'Banff National Park lakes reflecting mountains',
    'Greek islands with white and blue architecture',
    'California coastal cliffs at sunset',
    'Istanbul skyline with mosques and birds in flight',
    'Petra carved into rose-red stone',
    'Serengeti plains during wildlife migration',
    'Lapland northern lights in a frozen sky',
    'Hong Kong skyline over Victoria Harbour',
    'Galápagos islands with untouched wildlife'
  ],
  activities: [
    'slowly drifting in a hot air balloon',
    'walking barefoot along pristine beaches',
    'sailing across calm open waters',
    'hiking through breathtaking mountain trails',
    'exploring ancient ruins at sunrise',
    'diving into crystal-clear waters',
    'relaxing in a natural hot spring',
    'wandering through vibrant local markets',
    'riding a train through scenic landscapes',
    'kayaking across still reflective lakes',
    'watching wildlife in their natural habitat',
    'enjoying a candlelit dinner by the sea',
    'skiing down untouched snowy slopes',
    'cycling through quiet countryside roads',
    'stargazing under a perfectly clear sky',
    'floating in an infinity pool overlooking nature',
    'exploring hidden waterfalls',
    'walking through historic old towns',
    'taking a scenic helicopter ride',
    'enjoying street food in a lively night market'
  ],
  environments: [
    'bathed in golden hour sunlight',
    'under a sky full of stars',
    'wrapped in soft morning fog',
    'glowing under northern lights',
    'illuminated by vibrant city lights',
    'surrounded by lush greenery',
    'covered in fresh snowfall',
    'reflected in calm water surfaces',
    'under dramatic storm clouds',
    'lit by lanterns and warm ambient light',
    'under a pastel sunset sky',
    'in crystal-clear tropical light',
    'shimmering with ocean reflections',
    'under a bright blue summer sky',
    'surrounded by towering cliffs',
    'in a quiet, peaceful atmosphere',
    'with waves gently crashing nearby',
    'in an endless panoramic landscape'
  ],
  tones: [
    'Peaceful escape',
    'Luxurious relaxation',
    'Adventurous spirit',
    'Romantic getaway',
    'Soulful solitude',
    'Dreamlike wonder',
    'Vibrant cultural immersion',
    'Serene stillness',
    'Euphoric freedom',
    'Timeless beauty'
  ]
};

const MODIFIERS = [
  'cinematic composition',
  'ultra-wide perspective',
  'aerial viewpoint',
  'hyperreal details',
  'soft natural lighting',
  'atmospheric depth',
  'rich color grading',
  'immersive scale',
  'dreamlike ambiance',
  'postcard-perfect framing'
];

const ENHANCERS = [
  '8k resolution',
  'HDR lighting',
  'global illumination',
  'volumetric light rays',
  'ultra-realistic textures',
  'cinematic depth of field',
  'sharp focus',
  'vivid color contrast'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateTravelBatch = (count = 20) => {
  const batch = [];
  batch.push(`const travelVideos = [];`);

  for (let i = 0; i < count; i++) {
    const numDest = Math.floor(Math.random() * 2) + 1;
    const dest = pickN(SUGGESTIONS.destinations, numDest).join(', ');

    const activity = getRandom(SUGGESTIONS.activities);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);
    const mods = pickN(MODIFIERS, 3).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    batch.push(`travelVideos[${i}] = \`- DESTINATION: ${dest} - ACTIVITY: ${activity} - ENVIRONMENT: ${env} - TONE: ${tone} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`);
  }

  batch.push(`module.exports = travelVideos;`);
  return batch.join('\n');
};


// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateTravelBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (UTF-8 safe)');