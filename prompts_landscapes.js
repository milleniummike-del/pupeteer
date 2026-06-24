/**
 * PromptForge: Relaxing Natural Landscape Drone Shot Generator
 * Usage: node drone-travel.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// REGIONS (calmer, nature‑focused)
// ---------------------------------------------------------

const REGIONS = [
  'Japan','South Korea','France','Italy','Spain','Portugal','Greece',
  'Thailand','Indonesia','Vietnam','Malaysia','Sri Lanka',
  'New Zealand','Australia','Canada','USA','Mexico','Costa Rica',
  'Brazil','Argentina','Peru','Nepal','India',
  'Morocco','South Africa','Kenya','Tanzania',
  'United Kingdom','Ireland','Netherlands','Switzerland','Austria'
];

// ---------------------------------------------------------
// TERRAINS (relaxing, restorative environments)
// ---------------------------------------------------------

const TERRAINS = [
  'flower gardens',
  'botanical sanctuaries',
  'coastal beaches',
  'soft sandy shores',
  'pine forests',
  'bamboo groves',
  'lush green meadows',
  'rolling countryside fields',
  'mountain foothills',
  'gentle riverbanks',
  'lakeside clearings',
  'tea terraces',
  'orchard valleys',
  'lavender fields',
  'sunflower plains',
  'zen rock gardens',
  'tropical palm coves',
  'misty forest trails'
];

// ---------------------------------------------------------
// DESCRIPTORS (calm, soothing, peaceful)
// ---------------------------------------------------------

const DESCRIPTORS = [
  'peaceful','serene','calming','soothing','gentle',
  'sunlit','breezy','lush','tranquil','dreamlike',
  'quiet','restorative','warm','inviting','harmonious'
];

// ---------------------------------------------------------
// EXTRAS (relaxation‑focused ambience)
// ---------------------------------------------------------

const EXTRAS = [
  'with soft wind moving through the trees',
  'glowing under warm golden hour light',
  'with gentle waves lapping at the shore',
  'surrounded by birdsong and rustling leaves',
  'with sunlight filtering through branches',
  'blanketed in soft morning mist',
  'with flowers swaying lightly in the breeze',
  'with calm water reflecting the sky',
  'with drifting clouds casting soft shadows',
  'revealed slowly through rising fog'
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
// LANDMARKS (natural, peaceful, iconic but relaxing)
// ---------------------------------------------------------

const LANDMARKS = [
  'Arashiyama bamboo forest, Japan',
  'Lake Kawaguchi at Mount Fuji, Japan',
  'Jeju Island coastal gardens, South Korea',
  'Provence lavender fields, France',
  'Lake Como shoreline, Italy',
  'Tuscany rolling hills, Italy',
  'Cornwall coastal paths, United Kingdom',
  'Cliffs and beaches of Algarve, Portugal',
  'Bali rice terraces, Indonesia',
  'Ubud jungle sanctuaries, Indonesia',
  'Hoi An river gardens, Vietnam',
  'Banff lakes and forests, Canada',
  'Lake Louise shoreline, Canada',
  'New Zealand South Island meadows',
  'Hobbiton green hills, New Zealand',
  'Hawaiian tropical beaches, USA',
  'Big Sur coastal cliffs, USA',
  'Costa Rica cloud forests',
  'Sri Lankan tea fields',
  'Swiss alpine flower valleys',
  'Austrian lakeside villages',
  'Irish green countryside',
  'Dutch tulip fields',
  'Thai island coves',
  'Seychelles white‑sand beaches',
  'Maldives turquoise lagoons'
];

// ---------------------------------------------------------
// ORIGINAL SYSTEM ELEMENTS (kept, but tuned for calmness)
// ---------------------------------------------------------

const SUGGESTIONS = {
  locations: generateLocations(),

  naturalMotion: [
    'gentle waves rolling onto the shore',
    'soft breeze moving through tall grass',
    'clouds drifting slowly overhead',
    'mist rising quietly from the ground',
    'sunlight shimmering across calm water',
    'leaves rustling softly in the wind',
    'birds gliding peacefully across the sky',
    'shadows shifting gently as the sun moves',
    'flowers swaying lightly in the breeze',
    'ripples spreading across a still lake'
  ],

  timeOfDay: [
    'golden hour sunrise',
    'soft pastel morning light',
    'warm late afternoon glow',
    'blue hour calmness',
    'gentle overcast daylight',
    'sunset warmth'
  ],

  moods: [
    'deep relaxation and calm',
    'peaceful natural harmony',
    'soothing restorative energy',
    'quiet meditative stillness',
    'warm inviting tranquility',
    'gentle dreamlike serenity'
  ]
};

const CAMERA_STYLE = [
  'slow forward drift',
  'smooth aerial glide',
  'gentle orbit around landscape',
  'soft rising reveal',
  'low sweeping pass over terrain',
  'calm top‑down drift',
  'steady pullback to reveal scenery'
];

const VISUALS = [
  'soft natural color grading',
  'warm diffused sunlight',
  'gentle atmospheric haze',
  'high‑detail natural textures',
  'calm reflective surfaces',
  'smooth motion blur',
  'subtle volumetric light rays'
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

    const label = useLandmark ? 'ICONIC RELAXATION SPOT' : 'RELAXING LOCATION';

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

console.log('🌿 Relaxing natural landscapes generated successfully');
