/**
 * PromptForge: African Safari Animal Generator CLI (Multi-Species Edition)
 * Generates scenes with 1–3 interacting species
 * Usage: node prompts_animals_safari.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ECOLOGICAL GROUPS (20+ SPECIES EACH)
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Large Predators & Giants',
    species: [
      'African Elephant','Lion','Leopard','Cape Buffalo','Black Rhino','White Rhino',
      'Giraffe','Hippopotamus','Nile Crocodile','Eland','Sable Antelope','Roan Antelope',
      'Waterbuck','Bushbuck','Nyala','Bongo','Forest Elephant','Giant Forest Hog',
      'Buffalo Bull','Dominant Bull Elephant','Hippo Bull'
    ],
    behaviors: [
      'moving through thick vegetation',
      'resting under acacia shade',
      'displaying dominance',
      'crossing a river channel',
      'kicking up dust while advancing'
    ],
    habitats: [
      'Serengeti plains','Okavango Delta','Ngorongoro Crater','Tsavo scrubland',
      'Tarangire baobab valley','Chobe floodplains'
    ],
  },

  {
    label: 'Plains Game',
    species: [
      'Cheetah','Zebra','Grevy Zebra','Wildebeest','Gazelle','Impala','Kudu',
      'Oryx','Springbok','Topi','Hartebeest','Tsessebe','Steenbok','Klipspringer',
      'Dik-dik','Oribi','Reedbuck','Eland Herd','Antelope Herd','Migrating Wildebeest'
    ],
    behaviors: [
      'sprinting across open ground',
      'grazing cautiously',
      'grouping tightly in defense',
      'crossing a river during migration',
      'standing alert in tall grass'
    ],
    habitats: [
      'open savanna','short-grass plains','riverbanks','dry woodland','salt pans'
    ],
  },

  {
    label: 'Scavengers & Small Predators',
    species: [
      'Hyena','Wild Dog','Jackal','Honey Badger','Meerkat','Mongoose',
      'Warthog','Aardvark','Aardwolf','Serval','Caracal','Civet',
      'Genet','Bat-eared Fox','Cape Fox','Pangolin','Springhare',
      'Hyena Clan','Wild Dog Pack','Meerkat Colony'
    ],
    behaviors: [
      'scavenging a carcass',
      'coordinating a hunt',
      'standing guard at burrows',
      'moving stealthily through grass',
      'searching for food scraps'
    ],
    habitats: [
      'dry riverbeds','burrow plains','rocky outcrops','grassland edges','savanna scrub'
    ],
  },

  {
    label: 'Birds of the Savanna',
    species: [
      'Ostrich','Secretary Bird','Kori Bustard','Vulture','Fish Eagle',
      'Martial Eagle','Hornbill','Crane','Stork','Roller',
      'Oxpecker','Starling','Weaver Bird','Ground Hornbill',
      'Eagle Pair','Vulture Group','Stork Colony','Crane Pair','Bird Flock','Raptor'
    ],
    behaviors: [
      'circling overhead',
      'diving for prey',
      'running across plains',
      'perching on animals',
      'performing courtship display'
    ],
    habitats: [
      'open sky','tree branches','water edges','savanna grass','riverbanks'
    ],
  }
];

// ---------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------
ECOLOGICAL_GROUPS.forEach(group => {
  if (group.species.length < 20) {
    throw new Error(`Group "${group.label}" must have at least 20 species`);
  }
});

// ---------------------------------------------------------
// OTHER ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'golden hour dust glow',
  'dramatic red sunset',
  'soft dawn haze',
  'harsh midday light',
  'moonlit savanna',
  'storm clouds gathering'
];

const MODIFIERS = [
  'cinematic wildlife documentary',
  'telephoto lens',
  'slow motion',
  'low-angle camera trap',
  'aerial drone shot',
  'shallow depth of field'
];

const ENHANCERS = [
  '8K resolution',
  'hyper-realistic',
  'BBC quality',
  'volumetric lighting',
  'ultra detail'
];

const INTERACTIONS = [
  'interacting cautiously',
  'engaged in a tense standoff',
  'coexisting in close proximity',
  'one observing the other carefully',
  'sharing the same environment'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const pickUniqueSpecies = (groups, count) => {
  const allSpecies = groups.flatMap(g => g.species);
  const shuffled = [...allSpecies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateSafariBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    const speciesCount = Math.floor(Math.random() * 3) + 1; // 1–3 species
    const speciesList = pickUniqueSpecies(ECOLOGICAL_GROUPS, speciesCount);

    const group = getRandom(ECOLOGICAL_GROUPS);
    const behavior = getRandom(group.behaviors);
    const habitat = getRandom(group.habitats);
    const lighting = getRandom(LIGHTING);
    const mods = [...MODIFIERS].sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');
    const enh = [...ENHANCERS].sort(() => 0.5 - Math.random()).slice(0, 2).join(', ');

    let speciesText = speciesList.join(' + ');

    let interactionText = '';
    if (speciesList.length > 1) {
      interactionText = ` - INTERACTION: ${getRandom(INTERACTIONS)}`;
    }

    lines.push(
      `videos[${i}] = \`video of - SPECIES: ${speciesText}${interactionText} - BEHAVIOR: ${behavior} - HABITAT: ${habitat} - LIGHTING: ${lighting} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
    );
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateSafariBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated (Multi-Species Safari Edition)');