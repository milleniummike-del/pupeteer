/**
 * FPV Drone Adventure Generator — Fast‑Paced First‑Person Natural Landscapes
 * Usage: node drone-travel.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// LOCATION SYSTEM — Natural Landscapes Only
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
  'jagged mountain ridges','coastal cliffs','tropical islands','towering desert dunes',
  'dense rainforest valleys','glacial blue lagoons','volcanic craters',
  'deep river canyons','mirror‑still alpine lakes','rolling green hills',
  'wide open savanna plains','ancient stone formations','thundering waterfall basins',
  'massive fjord walls','coral reef shallows','high wind‑carved plateaus',
  'lush forest canopies','labyrinthine delta wetlands','natural rock arches'
];

const DESCRIPTORS = [
  'raw','untamed','wild','massive','sweeping',
  'surreal','electric','wind‑carved','sun‑blasted','mist‑covered',
  'storm‑charged','golden‑lit','fog‑shrouded','crystal‑clear','otherworldly'
];

const EXTRAS = [
  'as wind tears past the drone',
  'with sunlight flashing across the lens',
  'as mist explodes upward from the terrain',
  'with shadows racing beneath the flight path',
  'as clouds whip by at high speed',
  'with the landscape unfolding violently below',
  'as the drone slices through rising fog',
  'with the horizon bending during sharp turns',
  'as reflections shimmer across water surfaces',
  'with atmospheric haze streaking past'
];

const generateLocations = () => {
  const locations = [];
  for (const region of REGIONS) {
    for (const terrain of TERRAINS) {
      for (const desc of DESCRIPTORS) {
        const extra = EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
        locations.push(`ripping over ${desc} ${terrain} in ${region}, ${extra}`);
      }
    }
  }
  return locations;
};

// ---------------------------------------------------------
// NATURAL WONDERS (kept, but rewritten for FPV style)
// ---------------------------------------------------------

const LANDMARKS = [
  'diving past the cliffs of Moher, Ireland',
  'blasting over the Dolomites spires, Italy',
  'threading between the peaks of the Matterhorn, Switzerland',
  'racing above the fjords of Norway',
  'skimming the surface of Lake Louise, Canada',
  'charging through Yosemite Valley, USA',
  'slicing between the karsts of Ha Long Bay, Vietnam',
  'dropping into the canyon walls of Zion, USA',
  'sweeping across Torres del Paine, Chile',
  'banking hard around Mount Fuji, Japan',
  'rocketing over the dunes of the Namib Desert',
  'diving the cliffs of the Faroe Islands',
  'surging above Milford Sound, New Zealand',
  'cutting across the glaciers of Iceland',
  'flying low over the savanna plains of Tanzania'
];

// ---------------------------------------------------------
// MOTION / TIME / MOOD — rewritten for speed & intensity
// ---------------------------------------------------------

const SUGGESTIONS = {
  locations: generateLocations(),

  naturalMotion: [
    'banking hard through narrow gaps',
    'diving steeply toward the terrain',
    'ripping forward at high speed',
    'threading tight lines between rock formations',
    'skimming just above the surface',
    'punching upward into open sky',
    'slingshotting around cliffs',
    'rolling sideways along ridgelines',
    'charging through rising mist',
    'slicing through turbulent wind currents'
  ],

  timeOfDay: [
    'golden hour fire‑light',
    'blue hour glow',
    'harsh midday brilliance',
    'storm‑charged twilight',
    'sunrise haze streaking across the sky'
  ],

  moods: [
    'adrenaline‑charged intensity',
    'fast‑paced cinematic energy',
    'raw immersive speed',
    'high‑stakes aerial precision',
    'wild first‑person exhilaration'
  ]
};

const CAMERA_STYLE = [
  'aggressive forward FPV thrust',
  'tight proximity chase line',
  'low‑altitude terrain‑hugging run',
  'sharp banking turns',
  'rapid elevation drop',
  'snap‑roll directional shift',
  'long‑range high‑speed push'
];

const VISUALS = [
  'motion‑blurred edges',
  'high‑contrast natural lighting',
  'wind‑buffeted camera shake',
  'crisp environmental detail',
  'dynamic exposure shifts',
  'fast‑moving atmospheric particles',
  'sun‑flare streaks during turns'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR — FPV STYLE
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

    batch.push(
      `videos[${i}] = \`FPV RUN: ${loc} — TIME: ${time} — ACTION: ${motion} — MOOD: ${mood} — CAMERA: ${cam} — VISUALS: ${visuals}\`;`
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

console.log('🚀 FPV drone‑videos.js generated — high‑speed mode engaged');
