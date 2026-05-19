/**
 * PromptForge: Global Wildlife Documentary Generator CLI (2025+)
 * Generates cinematic AI prompts across all ecosystems on Earth
 * Usage: node wildlife_global.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// GLOBAL BIOMES + SPECIES DATASET
// ---------------------------------------------------------
const BIOMES = [

  // -------------------------------------------------------
  // AFRICAN SAVANNA
  // -------------------------------------------------------
  {
    name: 'African Savanna',
    species: [
      'African Elephant', 'Lion', 'Cheetah', 'Hyena',
      'Giraffe', 'Zebra', 'Wildebeest', 'Leopard'
    ],
    actions: [
      'moving in a coordinated herd across open plains',
      'stalking prey silently through tall grass',
      'running at full speed during a hunt',
      'resting under scattered acacia trees',
      'fighting for dominance in a dust-filled clash'
    ],
    environments: [
      'golden grasslands stretching to the horizon',
      'dry savanna dotted with acacia trees',
      'dusty plains under a vast sky'
    ]
  },

  // -------------------------------------------------------
  // RAINFOREST / JUNGLE
  // -------------------------------------------------------
  {
    name: 'Tropical Rainforest',
    species: [
      'Jaguar', 'Gorilla', 'Orangutan', 'Poison Dart Frog',
      'Toucan', 'Sloth', 'Anaconda', 'Chimpanzee'
    ],
    actions: [
      'moving silently through dense vegetation',
      'climbing high into the forest canopy',
      'watching cautiously from the shadows',
      'ambushing prey near a riverbank',
      'interacting socially within a close-knit group'
    ],
    environments: [
      'dense jungle filled with towering trees',
      'humid rainforest with thick foliage',
      'misty forest floor covered in vines'
    ]
  },

  // -------------------------------------------------------
  // ARCTIC / POLAR
  // -------------------------------------------------------
  {
    name: 'Arctic Wilderness',
    species: [
      'Polar Bear', 'Arctic Fox', 'Snowy Owl',
      'Walrus', 'Seal', 'Reindeer'
    ],
    actions: [
      'walking across vast frozen ice sheets',
      'hunting near cracks in the ice',
      'enduring harsh winds in extreme cold',
      'blending into the snowy environment',
      'resting against the icy terrain'
    ],
    environments: [
      'endless frozen tundra',
      'floating sea ice under pale sunlight',
      'snow-covered plains with icy winds'
    ]
  },

  // -------------------------------------------------------
  // OCEAN / MARINE
  // -------------------------------------------------------
  {
    name: 'Ocean Depths',
    species: [
      'Great White Shark', 'Blue Whale', 'Dolphin',
      'Octopus', 'Sea Turtle', 'Manta Ray'
    ],
    actions: [
      'gliding effortlessly through deep water',
      'hunting in coordinated groups',
      'diving into the dark ocean depths',
      'navigating coral reefs with precision',
      'surfacing gracefully for air'
    ],
    environments: [
      'deep blue open ocean',
      'vibrant coral reef ecosystems',
      'sunlight piercing through water from above'
    ]
  },

  // -------------------------------------------------------
  // DESERT
  // -------------------------------------------------------
  {
    name: 'Desert',
    species: [
      'Fennec Fox', 'Camel', 'Sidewinder Snake',
      'Scorpion', 'Meerkat', 'Desert Eagle'
    ],
    actions: [
      'moving across hot sand dunes',
      'searching for food in extreme heat',
      'burrowing beneath the surface',
      'hunting in the cool of night',
      'remaining still to conserve energy'
    ],
    environments: [
      'vast rolling sand dunes',
      'rocky desert under intense sun',
      'dry barren landscape with minimal vegetation'
    ]
  },

  // -------------------------------------------------------
  // MOUNTAINS
  // -------------------------------------------------------
  {
    name: 'Mountain Wilderness',
    species: [
      'Snow Leopard', 'Mountain Goat', 'Golden Eagle',
      'Puma', 'Yak', 'Red Panda'
    ],
    actions: [
      'climbing steep rocky cliffs',
      'leaping across narrow ledges',
      'soaring above valleys on thermal currents',
      'stalking prey in rugged terrain',
      'navigating dangerous heights'
    ],
    environments: [
      'snow-covered mountain peaks',
      'rocky high-altitude terrain',
      'misty mountain forests'
    ]
  },

  // -------------------------------------------------------
  // TEMPERATE FOREST
  // -------------------------------------------------------
  {
    name: 'Temperate Forest',
    species: [
      'Brown Bear', 'Wolf', 'Deer',
      'Fox', 'Owl', 'Badger'
    ],
    actions: [
      'walking quietly through dense woodland',
      'hunting under cover of trees',
      'foraging on the forest floor',
      'watching from a hidden position',
      'moving through autumn leaves'
    ],
    environments: [
      'dense green forest',
      'autumn woodland with falling leaves',
      'foggy forest with soft light'
    ]
  }
];

// ---------------------------------------------------------
// CINEMATIC LAYERS
// ---------------------------------------------------------
const TIME_OF_DAY = [
  'at golden hour with warm cinematic light',
  'in early morning mist with soft lighting',
  'under harsh midday sunlight',
  'during a dramatic sunset sky',
  'at night under a star-filled sky',
  'in blue twilight just after sunset'
];

const CAMERA = [
  'captured with a telephoto wildlife lens',
  'filmed from a low-angle ground perspective',
  'shot with a cinematic tracking shot',
  'recorded in slow motion at 120fps',
  'captured using aerial drone footage',
  'filmed handheld in documentary style'
];

const REALISM = [
  'BBC Planet Earth level cinematography',
  'National Geographic documentary quality',
  'ultra-realistic textures and lighting',
  'true-to-life animal behavior',
  'hyper-detailed natural realism'
];

const DETAILS = [
  'dust and particles moving naturally',
  'wind interacting with the environment',
  'subtle muscle movements visible',
  'natural lighting and shadows',
  'environmental immersion and realism',
  'heat haze or atmospheric effects'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// PROMPT BUILDER
// ---------------------------------------------------------
const buildPrompt = () => {
  const biome = getRandom(BIOMES);

  const species = getRandom(biome.species);
  const action = getRandom(biome.actions);
  const environment = getRandom(biome.environments);
  const time = getRandom(TIME_OF_DAY);
  const camera = getRandom(CAMERA);
  const realism = getRandom(REALISM);
  const details = pickN(DETAILS, 2).join(', ');

  return `video of a wildlife documentary scene set in the ${biome.name}: a ${species} ${action} in ${environment}, ${time}. ${camera}. ${realism}, ${details}.`;
};

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const prompt = buildPrompt();
    lines.push(`videos[${i}] = \`${prompt}\`;`);
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateBatch(count);

// Write file
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Global Wildlife Edition)');