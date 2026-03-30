/**
 * PromptForge: African Safari Animal Generator CLI
 * Specializing in African safari animals, environments and behaviors.
 * Usage: node prompts_animals_safari.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// SAFARI ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'The Big Five & Large Giants',
    species: [
      'African Elephant (Loxodonta africana)', 'South African Lion (Panthera leo melanochaita)', 
      'African Leopard (Panthera pardus pardus)', 'Cape Buffalo (Syncerus caffer)', 
      'Black Rhinoceros (Diceros bicornis)', 'White Rhinoceros (Ceratotherium simum)', 
      'Masai Giraffe (Giraffa tippelskirchi)', 'Hippopotamus (Hippopotamus amphibius)', 
      'Nile Crocodile (Crocodylus niloticus)'
    ],
    behaviors: [
      'Leading a herd through a dust storm on the open plains', 
      'Surveying the vast landscape from a high granite kopje', 
      'Moving with powerful grace through the thick vegetation', 
      'Kicking up thick dust in a defensive formation', 
      'Grazing or resting peacefully in the early morning mist', 
      'Engaging in a powerful display of dominance', 
      'Emerging from the water in a sudden territorial display', 
      'Sunning itself on the muddy banks of a winding river'
    ],
    habitats: [
      'The vast, golden plains of the Serengeti', 'The lush, water-logged channels of the Okavango Delta', 
      'The steep, forested walls of the Ngorongoro Crater', 'Arid acacia scrubland of the Tsavo', 
      'Baobab-studded landscape of Tarangire', 'The red dunes of the Kalahari Desert', 
      'The marshy floodplains of Chobe National Park'
    ],
  },

  {
    label: 'Plains Game & Fast Runners',
    species: [
      'Cheetah (Acinonyx jubatus)', 'Plains Zebra (Equus quagga)', 'Blue Wildebeest (Connochaetes taurinus)', 
      'Thompson\'s Gazelle (Eudorcas thomsonii)', 'Impala (Aepyceros melampus)', 'Greater Kudu (Tragelaphus strepsiceros)', 
      'Oryx / Gemsbok (Oryx gazella)', 'Springbok (Antidorcas marsupialis)', 'Topi (Damaliscus lunatus jimela)'
    ],
    behaviors: [
      'Sprinting in a high-speed blur across the savanna', 
      'Huddling together in a tight group to confuse predators', 
      'Navigating a chaotic river crossing during migration', 
      'Performing spectacular high leaps into the air', 
      'Standing perfectly still and alert in the thicket', 
      'Casting a sharp silhouette against a vibrant desert sunset', 
      'Galloping in a long, endless line across the horizon'
    ],
    habitats: [
      'Short-grass plains stretching to the horizon', 'Dry savanna with scattered whistling thorn trees', 
      'Dense mopane woodland', 'Riverine forest edges', 'Vast salt pans of the Etosha', 
      'Hilly grasslands of the Maasai Mara'
    ],
  },

  {
    label: 'Scavengers & Small Wonders',
    species: [
      'Spotted Hyena (Crocuta crocuta)', 'African Wild Dog (Lycaon pictus)', 'Black-backed Jackal (Lupulella mesomelas)', 
      'Honey Badger (Mellivora capensis)', 'Meerkat (Suricata suricatta)', 'Warthog (Phacochoerus africanus)', 
      'Aardvark (Orycteropus afer)', 'Serval (Leptailurus serval)', 'Caracal (Caracal caracal)'
    ],
    behaviors: [
      'Competing over a scavenged carcass in the dark of night', 
      'Working together in a highly coordinated hunting pack', 
      'Standing on sentry duty at the entrance of a burrow', 
      'Running quickly with its tail held high in the air', 
      'Jumping high into the air to catch prey in mid-flight', 
      'Fearlessly facing off against a much larger predator', 
      'Trotting through the tall grass in search of food scraps'
    ],
    habitats: [
      'Termite mound-dotted landscape', 'Dry riverbeds with sandy bottoms', 'Rocky outcrops and kopjes', 
      'Burrow-filled open plains', 'Tall yellow elephant grass', 'Fringe of a woodland thicket'
    ],
  },

  {
    label: 'Birds of the Savanna',
    species: [
      'Ostrich (Struthio camelus)', 'Secretary Bird (Sagittarius serpentarius)', 'Kori Bustard (Ardeotis kori)', 
      'Lappet-faced Vulture (Torgos tracheliotos)', 'African Fish Eagle (Icthyophaga vocifer)', 
      'Lilac-breasted Roller (Coracias caudatus)', 'Grey Crowned Crane (Balearica regulorum)', 
      'Marabou Stork (Leptoptilos crumenifer)', 'Red-billed Oxpecker (Buphagus erythrorhynchus)'
    ],
    behaviors: [
      'Sprinting across the flat plains at incredible speed', 
      'Using its powerful legs to strike at prey on the ground', 
      'Circling high above on warm thermal updrafts', 
      'Diving with precision to snatch prey from the water', 
      'Performing a series of dazzling aerial acrobatic displays', 
      'Landing on a large mammal to search for small insects', 
      'Engaging in an elegant and complex courtship dance'
    ],
    habitats: [
      'Top of a flat-topped acacia tree', 'Reeds at the edge of a watering hole', 'Open sky over the savanna', 
      'Tall grass hiding ground-dwelling birds', 'Dead tree branches overlooking the river'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour sun low on the horizon, glowing through the dust',
  'Dramatic silhouette against a blood-red African sunset',
  'Soft dawn light with rising heat haze',
  'Harsh midday sun creating high-contrast shadows under acacia trees',
  'Moonlit savanna with a vast, starry Milky Way above',
  'Stormy sky over the plains',
  'Dappled sunlight through the leaves of a fever tree forest',
  'Warm, orange glow of a campfire illuminating the foreground',
  'Cool, blue twilight with a rising full moon'
];

const MODIFIERS = [
  'National Geographic wildlife cinematography', 'Macro detail on fur and whiskers', 
  'Slow motion 120fps capture', 'Low-angle perspective from a hidden camera trap', 
  'Telephoto lens compression', 'Aerial drone view over a migration', 
  'Handheld documentary style', 'Sharp focus on the predator\'s eyes', 
  'Shallow depth of field with soft savanna background'
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
const generateSafariBatch = (count = 20) => {
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

const output = generateSafariBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Safari Edition)');
