/**
 * PromptForge: Jungle Animal Generator CLI
 * Specializing in rainforest & jungle wildlife scenes.
 * Usage: node prompts_animals_jungle.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// JUNGLE ECOLOGICAL GROUPS
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Apex Predators & Stealth Hunters',
    species: [
      'Jaguar (Panthera onca)',
      'Bengal Tiger (Panthera tigris tigris)',
      'Black Panther (melanistic leopard)',
      'Clouded Leopard (Neofelis nebulosa)',
      'Green Anaconda (Eunectes murinus)',
      'Reticulated Python (Malayopython reticulatus)'
    ],
    behaviors: [
      'silently stalking prey through dense undergrowth',
      'emerging from the shadows with piercing eyes',
      'swimming powerfully through a murky jungle river',
      'coiling around a branch waiting to ambush',
      'leaping अचानक from foliage onto prey',
      'moving stealthily through thick vines and roots'
    ],
    habitats: [
      'dense Amazon rainforest floor',
      'humid mangrove jungle',
      'thick Southeast Asian jungle canopy',
      'muddy riverbanks surrounded by vines',
      'dark forest interior with minimal sunlight'
    ],
  },

  {
    label: 'Primates & Tree Dwellers',
    species: [
      'Chimpanzee',
      'Orangutan',
      'Gorilla',
      'Capuchin Monkey',
      'Howler Monkey',
      'Spider Monkey',
      'Gibbon'
    ],
    behaviors: [
      'swinging rapidly between trees',
      'curiously observing the camera',
      'playing and chasing through branches',
      'hanging upside down effortlessly',
      'foraging for fruit in the canopy',
      'calling loudly across the jungle'
    ],
    habitats: [
      'high jungle canopy',
      'thick vine-covered treetops',
      'lush tropical forest layers',
      'sunlight breaking through dense leaves',
      'ancient trees covered in moss'
    ],
  },

  {
    label: 'Colorful Birds & Flyers',
    species: [
      'Toucan',
      'Macaw Parrot',
      'Scarlet Macaw',
      'Hornbill',
      'Harpy Eagle',
      'Kingfisher',
      'Bird of Paradise'
    ],
    behaviors: [
      'gliding between trees with vibrant feathers',
      'perching and calling loudly',
      'diving بسرعة toward water to catch prey',
      'displaying bright feathers in courtship',
      'hovering briefly before landing',
      'flapping through dense foliage'
    ],
    habitats: [
      'upper canopy with bright sunlight',
      'branches above jungle rivers',
      'dense rainforest treetops',
      'misty jungle mornings',
      'rain-soaked forest branches'
    ],
  },

  {
    label: 'Reptiles, Amphibians & Small Creatures',
    species: [
      'Poison Dart Frog',
      'Chameleon',
      'Komodo Dragon',
      'Tree Frog',
      'Gecko',
      'Iguana',
      'Leaf Insect'
    ],
    behaviors: [
      'crawling slowly along wet leaves',
      'blending perfectly into surroundings',
      'leaping between branches',
      'sticking to surfaces effortlessly',
      'remaining completely still as camouflage',
      'darting quickly across jungle floor'
    ],
    habitats: [
      'wet jungle floor covered in leaves',
      'rain-soaked foliage',
      'mossy tree trunks',
      'humid undergrowth',
      'dense tropical vegetation'
    ],
  }
];

// ---------------------------------------------------------
// LIGHTING
// ---------------------------------------------------------
const LIGHTING = [
  'sun rays piercing through dense canopy',
  'humid golden light filtering through leaves',
  'misty jungle morning with soft light',
  'dark moody forest with minimal light',
  'rainy वातावरण with diffused lighting',
  'glowing sunset through thick foliage',
  'wet reflective surfaces after rainfall'
];

// ---------------------------------------------------------
// MODIFIERS
// ---------------------------------------------------------
const MODIFIERS = [
  'National Geographic wildlife cinematography',
  'macro detail on textures and skin',
  'slow motion capture',
  'handheld documentary style',
  'low-angle jungle perspective',
  'drone shot above canopy',
  'shallow depth of field',
  'cinematic tracking shot'
];

// ---------------------------------------------------------
// ENHANCERS
// ---------------------------------------------------------
const ENHANCERS = [
  '8K ultra realistic',
  'hyper-detailed textures',
  'cinematic color grading',
  'high humidity atmosphere',
  'volumetric light rays',
  'ultra طبیعی colors',
  'immersive jungle environment'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------
const generateJungleBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(ECOLOGICAL_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 3).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = \`JUNGLE CINEMATIC VIDEO - SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateJungleBatch(count);

// Write file
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🌿 videos.js generated successfully');