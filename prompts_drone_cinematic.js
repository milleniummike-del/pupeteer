/**
 * PromptForge: Cinematic One-Off Drone Shot Generator
 * Usage: node drone-travel.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// SUBJECTS (100 cinematic one-off subjects)
// ---------------------------------------------------------

const SUBJECTS = [
  'a lone lighthouse standing against crashing waves',
  'a winding mountain road cutting through dense fog',
  'a single kayaker drifting across a glassy alpine lake',
  'a herd of wild horses running across open plains',
  'a cliffside monastery perched above the clouds',
  'a desert caravan moving across golden dunes',
  'a glacier calving into icy blue waters',
  'a volcanic crater glowing with molten light',
  'a coral reef teeming with marine life',
  'a waterfall plunging into a hidden jungle pool',
  'a snow-covered cabin glowing with warm interior light',
  'a train snaking through rugged mountain terrain',
  'a massive storm front rolling over farmland',
  'a surfer riding a towering ocean wave',
  'a hot air balloon drifting over patchwork fields',
  'a dense bamboo forest swaying in the wind',
  'a canyon river carving through ancient stone',
  'a remote island surrounded by turquoise water',
  'a frozen lake with deep blue cracks',
  'a lone tree standing in a vast desert',
  'a city skyline emerging through morning fog',
  'a lighthouse beam sweeping across stormy seas',
  'a whale surfacing beside a small boat',
  'a winding river glowing under sunset light',
  'a cliffside arch carved by centuries of waves',
  'a mountain peak piercing through cloud layers',
  'a rainforest canopy alive with movement',
  'a volcanic ash plume rising into the sky',
  'a salt flat reflecting the sky like a mirror',
  'a medieval castle overlooking rolling hills',
  'a canyon arch framing the rising sun',
  'a frozen waterfall suspended in time',
  'a tropical lagoon glowing with bioluminescence',
  'a herd of elephants crossing savanna grasslands',
  'a fisherman casting a net at dawn',
  'a desert highway stretching to the horizon',
  'a massive red rock formation glowing at sunset',
  'a fjord surrounded by towering cliffs',
  'a lone sailboat cutting through calm waters',
  'a thunderstorm illuminating distant mountains',
  'a rice terrace cascading down green hillsides',
  'a geyser erupting into the sky',
  'a dense forest with sunlight piercing through fog',
  'a canyon overlook revealing vast landscapes',
  'a snowy ridgeline with blowing powder',
  'a tropical waterfall hidden deep in jungle',
  'a massive sand dune casting long shadows',
  'a glacial river winding through rocky terrain',
  'a coastal cliff battered by storm waves',
  'a desert oasis surrounded by palm trees',
  'a mountain lake reflecting jagged peaks',
  'a lone hiker standing on a summit',
  'a valley filled with low-lying clouds',
  'a coral atoll forming a perfect ring',
  'a lava river flowing through volcanic rock',
  'a dense mangrove forest twisting through water',
  'a canyon slot glowing with reflected light',
  'a snowy forest blanketed in silence',
  'a tropical island with white sand beaches',
  'a massive waterfall viewed from above',
  'a savanna sunset silhouetting acacia trees',
  'a glacier-fed river delta branching outward',
  'a rugged coastline with natural arches',
  'a mountain monastery carved into stone',
  'a desert plateau stretching endlessly',
  'a rainforest river winding through dense foliage',
  'a volcanic island rising from the sea',
  'a canyon ridge overlooking vast emptiness',
  'a frozen tundra under aurora skies',
  'a cliffside village overlooking the sea',
  'a massive rock spire jutting into the sky',
  'a jungle temple reclaimed by nature',
  'a turquoise lake surrounded by pine forests',
  'a desert canyon glowing in golden hour',
  'a snowy mountain pass cutting through peaks',
  'a tropical reef shelf dropping into deep blue',
  'a lone windmill turning in open fields',
  'a stormy coastline with crashing surf',
  'a mountain glacier stretching into the distance',
  'a fog-covered valley revealing hidden ridges',
  'a volcanic caldera filled with emerald water',
  'a desert arch framing distant mesas',
  'a rainforest waterfall cascading into mist',
  'a frozen coastline with drifting icebergs',
  'a canyon river glowing in sunset light',
  'a remote cabin surrounded by autumn colors',
  'a savanna watering hole filled with wildlife',
  'a mountain ridge illuminated by sunrise',
  'a coral lagoon shimmering in sunlight',
  'a desert monolith rising from flat sands',
  'a snowy forest with long winter shadows',
  'a cliffside waterfall plunging into the sea',
  'a volcanic ridge glowing with heat',
  'a tropical sandbar stretching into the ocean',
  'a canyon overlook revealing layered stone',
  'a mountain valley filled with wildflowers'
];

// ---------------------------------------------------------
// CINEMATIC ELEMENTS
// ---------------------------------------------------------

const CAMERA = [
  'slow cinematic flyover',
  'smooth POV glide',
  'high-altitude reveal shot',
  'low sweeping pass',
  'orbiting cinematic rotation',
  'top-down tracking shot',
  'forward push-in toward subject',
  'dramatic pullback reveal'
];

const MOOD = [
  'epic scale and atmosphere',
  'quiet reflective beauty',
  'dramatic natural intensity',
  'serene dreamlike calm',
  'wild untamed energy',
  'cinematic wanderlust tone'
];

const VISUAL = [
  'soft atmospheric haze',
  'golden hour glow',
  'volumetric sunlight rays',
  'high dynamic range contrast',
  'crisp environmental detail',
  'natural cinematic color grading',
  'gentle motion blur from movement'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------

const generateDroneBatch = (count = 100) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const subject = getRandom(SUBJECTS);
    const cam = pickN(CAMERA, 2).join(', ');
    const mood = getRandom(MOOD);
    const visuals = pickN(VISUAL, 3).join(', ');

    batch.push(
      `videos[${i}] = \`SHOT: ${subject} - CAMERA: ${cam} - MOOD: ${mood} - VISUALS: ${visuals}\`;`
    );
  }

  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 100;

const output = generateDroneBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🎥 cinematic-drone-shots.js generated successfully');
