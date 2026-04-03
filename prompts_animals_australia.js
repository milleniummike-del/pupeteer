/**
 * PromptForge: Australian Animal Generator CLI
 * Specializing in Australian wildlife, environments and behaviors.
 * Usage: node prompts_animals_australia.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// AUSTRALIAN ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Iconic Marsupials',
    species: [
      'Red Kangaroo (Osphranter rufus)', 'Eastern Grey Kangaroo (Macropus giganteus)', 
      'Koala (Phascolarctos cinereus)', 'Common Wombat (Vombatus ursinus)', 
      'Quokka (Setonix brachyurus)', 'Wallaby (Macropus)', 
      'Sugar Glider (Petaurus breviceps)', 'Tasmanian Devil (Sarcophilus harrisii)', 
      'Numbat (Myrmecobius fasciatus)'
    ],
    behaviors: [
      'Hopping with powerful strides across the red desert earth', 
      'Sleepily munching on silver-green eucalyptus leaves', 
      'Digging a sturdy burrow in the dry, rocky soil', 
      'Mothers with a joey peeking out from a warm pouch', 
      'Playfully wrestling in the golden afternoon scrub', 
      'Gliding gracefully between towering gum trees at twilight', 
      'Engaging in a fierce, vocal display of dominance', 
      'Basking in the sun on a granite outcrop'
    ],
    habitats: [
      'The vast, sun-baked Red Centre near Uluru', 'Eucalyptus forests of the Blue Mountains', 
      'Coastal heathlands of Rottnest Island', 'Grassy woodlands of the Victorian interior', 
      'Misty temperate rainforests of Tasmania', 'The rugged wilderness of the Kimberley', 
      'Dry sclerophyll forests of Western Australia'
    ],
  },

  {
    label: 'Ancient Reptiles & Coastal Life',
    species: [
      'Saltwater Crocodile (Crocodylus porosus)', 'Perentie (Varanus giganteus)', 
      'Thorny Devil (Moloch horridus)', 'Frilled-neck Lizard (Chlamydosaurus kingii)', 
      'Inland Taipan (Oxyuranus microlepidotus)', 'Green Sea Turtle (Chelonia mydas)', 
      'Dugong (Dugong dugon)', 'Great White Shark (Carcharodon carcharias)'
    ],
    behaviors: [
      'Lying motionless on a muddy riverbank in the tropical heat', 
      'Scurrying across the hot spinifex sands with lightning speed', 
      'Expanding its spectacular neck frill in a defensive display', 
      'Navigating the vibrant coral gardens of the Great Barrier Reef', 
      'Emerging from the turquoise surf to nest on a sandy beach', 
      'Sliding silently into the murky waters of a tidal creek', 
      'Casting a menacing silhouette through the deep blue ocean'
    ],
    habitats: [
      'Tropical mangrove swamps of the Top End', 'Arid spinifex grasslands of the Gibson Desert', 
      'The kaleidoscopic Great Barrier Reef', 'Crystal clear waters of the Whitsunday Islands', 
      'Remote, white-sand beaches of the Ningaloo Coast', 'The treacherous waters of the Bass Strait'
    ],
  },

  {
    label: 'Unique Monotremes & Small Wonders',
    species: [
      'Platypus (Ornithorhynchus anatinus)', 'Short-beaked Echidna (Tachyglossus aculeatus)', 
      'Eastern Quoll (Dasyurus viverrinus)', 'Bilby (Macrotis lagotis)', 
      'Feathertail Glider (Acrobates pygmaeus)', 'Antechinus (Antechinus flavipes)'
    ],
    behaviors: [
      'Diving into a cool, clear mountain stream to forage', 
      'Snuffling through thick leaf litter in search of ants', 
      'Curling into a protective spiny ball when threatened', 
      'Scurrying through the undergrowth under the cover of darkness', 
      'Foraging for insects on the trunk of a fallen log', 
      'Emerging from a deep sandy burrow in the moonlight'
    ],
    habitats: [
      'Freshwater creeks of the Great Dividing Range', 'Fern-filled gullies of the Dandenong Ranges', 
      'Dense forest floor of the Otways', 'Dry, sandy plains of the Mallee', 
      'Subalpine woodlands of the Australian Alps'
    ],
  },

  {
    label: 'Avian Wonders of the Bush',
    species: [
      'Emu (Dromaius novaehollandiae)', 'Laughing Kookaburra (Dacelo novaeguineae)', 
      'Sulphur-crested Cockatoo (Cacatua galerita)', 'Superb Lyrebird (Menura novaehollandiae)', 
      'Wedge-tailed Eagle (Aquila audax)', 'Southern Cassowary (Casuarius casuarius)', 
      'Rainbow Lorikeet (Trichoglossus moluccanus)', 'Galah (Eolophus roseicapilla)'
    ],
    behaviors: [
      'Striding confidently across the vast, open plains', 
      'Perched on a weathered gum branch laughing boisterously', 
      'Mimicking the complex symphony of the rainforest floor', 
      'Soaring high on warm thermals over the rugged outback', 
      'Moving silently through the dense tropical jungle', 
      'Feeding on nectar from vibrant flowering banksias', 
      'Gathering in a noisy, colorful flock at a watering hole'
    ],
    habitats: [
      'Daintree Rainforest of North Queensland', 'Open savannas of the Gulf Country', 
      'Stately river red gums lining the Murray River', 'Coastal cliffs of the Great Ocean Road', 
      'Ancient Gondwana rainforests', 'Urban parks and suburban gardens'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour sun setting over the vast red horizon',
  'Soft moonlight reflecting off a quiet billabong',
  'Harsh midday sun creating shimmering heat haze over the desert',
  'Dappled sunlight filtering through a dense rainforest canopy',
  'Dramatic storm clouds gathering over the Arnhem Land escarpment',
  'Cool morning mist clinging to a Tasmanian valley',
  'Vibrant orange glow of a bushfire on the distant horizon',
  'Pink and purple twilight over the coastal limestone stacks',
  'Bright, direct sunlight illuminating the turquoise ocean'
];

const MODIFIERS = [
  'Cinematic wildlife photography', 'Macro detail on fur and feathers', 
  'Slow motion 120fps capture', 'Low-angle perspective from a hidden camera trap', 
  'Telephoto lens compression', 'Aerial drone view over the outback', 
  'Handheld documentary style', 'Sharp focus on the animal\'s eyes', 
  'Shallow depth of field with soft bushland background'
];

const ENHANCERS = [
  '8K ultra-high resolution', 'BBC Planet Earth quality', 'hyper-realistic textures', 
  'award-winning nature photography', 'perfect composition', 'volumetric dust and light', 
  'intricate skin and scale detail', 'vibrant natural colors'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateAustraliaBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(ECOLOGICAL_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');
    const ratio = '';

    lines.push(
      `videos[${i}] = \`${ratio} - SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateAustraliaBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Australia Edition)');
