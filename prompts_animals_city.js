/**
 * PromptForge: Jumanji Safari Invasion Generator CLI
 * African safari animals roaming modern cities in a cinematic Jumanji-style world
 *
 * Usage:
 *   node prompts_animals_jumanji.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// SAFARI ANIMAL GROUPS
// ---------------------------------------------------------
const ANIMAL_GROUPS = [
  {
    label: 'Large Mammals',
    species: [
      'African Elephant',
      'Lion',
      'Leopard',
      'Cape Buffalo',
      'Black Rhino',
      'White Rhino',
      'Giraffe',
      'Hippopotamus',
      'Zebra',
      'Wildebeest',
      'Gazelle',
      'Impala',
      'Kudu',
      'Oryx',
      'Springbok',
      'Eland',
      'Waterbuck',
      'Hyena',
      'Cheetah',
      'Wild Dog'
    ],

    behaviors: [
      'charging through abandoned traffic',
      'walking between stalled cars',
      'running through flooded intersections',
      'staring into storefront windows',
      'crossing a destroyed highway',
      'resting beside burning vehicles',
      'moving through overgrown streets',
      'climbing over wreckage',
      'stampeding through downtown',
      'hunting through dark alleyways'
    ]
  },

  {
    label: 'Small Predators & Creatures',
    species: [
      'Honey Badger',
      'Jackal',
      'Serval',
      'Caracal',
      'Mongoose',
      'Meerkat',
      'Aardvark',
      'Bat-eared Fox',
      'Civet',
      'Genet',
      'Warthog',
      'Pangolin',
      'Aardwolf',
      'Springhare',
      'Cape Fox',
      'Meerkat Colony',
      'Hyena Clan',
      'Wild Dog Pack',
      'Mongoose Group',
      'Jackal Pair'
    ],

    behaviors: [
      'emerging from subway tunnels',
      'searching through abandoned shops',
      'running across rooftops',
      'hiding beneath wrecked buses',
      'moving through underground parking garages',
      'climbing through broken buildings',
      'gathering around neon signs',
      'watching from rain-soaked alleys',
      'crossing deserted train tracks',
      'exploring abandoned malls'
    ]
  },

  {
    label: 'Birds & Sky Creatures',
    species: [
      'Vulture',
      'Fish Eagle',
      'Martial Eagle',
      'Secretary Bird',
      'Ground Hornbill',
      'Hornbill',
      'Stork',
      'Crane',
      'Kori Bustard',
      'Ostrich',
      'Bird Flock',
      'Raptor',
      'Vulture Group',
      'Crane Pair',
      'Eagle Pair',
      'Oxpecker',
      'Starling',
      'Weaver Bird',
      'Roller',
      'Stork Colony'
    ],

    behaviors: [
      'circling skyscrapers',
      'landing on traffic lights',
      'flying through smoke-filled streets',
      'perching on abandoned billboards',
      'diving between high-rise buildings',
      'gliding over flooded avenues',
      'watching from rooftop antennas',
      'swarming through the city skyline',
      'running through urban plazas',
      'gathering around abandoned monuments'
    ]
  }
];

// ---------------------------------------------------------
// CITY ENVIRONMENTS
// ---------------------------------------------------------
const CITY_ENVIRONMENTS = [
  'overgrown New York streets',
  'abandoned Tokyo intersections',
  'flooded London avenues',
  'destroyed Los Angeles freeways',
  'rain-soaked Hong Kong alleyways',
  'empty Paris boulevards',
  'collapsed Dubai highways',
  'neon-lit cyberpunk city streets',
  'post-apocalyptic downtown district',
  'jungle-covered skyscraper district',
  'evacuated subway stations',
  'foggy urban backstreets',
  'burning financial district',
  'deserted shopping mall',
  'wrecked airport runway',
  'ruined industrial zone',
  'storm-damaged coastal city',
  'massive bridge traffic jam',
  'urban jungle overtaken by nature',
  'collapsed parking structures'
];

// ---------------------------------------------------------
// ATMOSPHERE & LIGHTING
// ---------------------------------------------------------
const LIGHTING = [
  'cinematic golden sunset',
  'stormy afternoon lighting',
  'rain-soaked neon reflections',
  'foggy dawn atmosphere',
  'moonlit urban chaos',
  'dramatic lightning storm',
  'burning orange sky',
  'dark overcast clouds',
  'post-apocalyptic dust haze',
  'blue hour cinematic lighting'
];

// ---------------------------------------------------------
// JUMANJI-STYLE ACTIONS
// ---------------------------------------------------------
const INTERACTIONS = [
  'animals invading the city together',
  'predators and prey moving through chaos',
  'tense urban wildlife encounter',
  'survival instinct taking over the streets',
  'massive stampede through downtown',
  'creatures adapting to the urban jungle',
  'chaotic wildlife migration',
  'animals reclaiming civilization',
  'urban ecosystem collapse',
  'wild safari takeover of humanity'
];

// ---------------------------------------------------------
// CAMERA & STYLE
// ---------------------------------------------------------
const CAMERA_STYLES = [
  'cinematic wildlife documentary',
  'Jumanji movie style',
  'Hollywood blockbuster',
  'low-angle action shot',
  'aerial drone footage',
  'handheld survival camera',
  'epic IMAX framing',
  'telephoto wildlife lens',
  'dynamic chase camera',
  'wide cinematic composition'
];

// ---------------------------------------------------------
// QUALITY ENHANCERS
// ---------------------------------------------------------
const ENHANCERS = [
  '8K ultra realistic',
  'hyper-detailed textures',
  'photorealistic',
  'volumetric lighting',
  'high cinematic contrast',
  'realistic destruction physics',
  'BBC Earth quality',
  'movie-quality CGI realism',
  'ultra detailed environment',
  'realistic atmospheric effects'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr =>
  arr[Math.floor(Math.random() * arr.length)];

const shuffle = arr =>
  [...arr].sort(() => 0.5 - Math.random());

const pickUniqueSpecies = (groups, count) => {
  const allSpecies = groups.flatMap(g => g.species);
  return shuffle(allSpecies).slice(0, count);
};

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateJumanjiBatch = (count = 20) => {

  const lines = [];
  lines.push('const videos = [];');

  for (let i = 0; i < count; i++) {

    const speciesCount = Math.floor(Math.random() * 3) + 1;

    const speciesList = pickUniqueSpecies(
      ANIMAL_GROUPS,
      speciesCount
    );

    const group = getRandom(ANIMAL_GROUPS);

    const behavior = getRandom(group.behaviors);

    const environment = getRandom(CITY_ENVIRONMENTS);

    const lighting = getRandom(LIGHTING);

    const interaction =
      speciesCount > 1
        ? getRandom(INTERACTIONS)
        : 'solitary animal surviving in the city';

    const camera = shuffle(CAMERA_STYLES)
      .slice(0, 3)
      .join(', ');

    const quality = shuffle(ENHANCERS)
      .slice(0, 3)
      .join(', ');

    const speciesText = speciesList.join(' + ');

    lines.push(
`videos[${i}] = \`video of - SPECIES: ${speciesText} - ACTION: ${interaction} - BEHAVIOR: ${behavior} - ENVIRONMENT: ${environment} - LIGHTING: ${lighting} - STYLE: ${camera} - QUALITY: ${quality}\`;`
    );
  }

  lines.push('');
  lines.push('module.exports = videos;');

  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);

const count = parseInt(args[0]) || 20;

const output = generateJumanjiBatch(count);

fs.writeFileSync(
  'videos.js',
  output,
  { encoding: 'utf8' }
);

console.log(
  '✔ videos.js generated (Jumanji Safari Invasion Edition)'
);