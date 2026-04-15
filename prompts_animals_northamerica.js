/**
 * PromptForge: North American Animal Generator CLI
 * Specializing in North American wildlife, environments and behaviors.
 * Usage: node prompts_animals_america.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// NORTH AMERICAN ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Iconic Mammals',
    species: [
      'American Bison (Bison bison)', 'Grizzly Bear (Ursus arctos horribilis)',
      'Gray Wolf (Canis lupus)', 'Moose (Alces alces)',
      'American Black Bear (Ursus americanus)', 'White-tailed Deer (Odocoileus virginianus)',
      'Cougar (Puma concolor)', 'Elk (Cervus canadensis)',
      'Pronghorn (Antilocapra americana)'
    ],
    behaviors: [
      'Grazing across a vast prairie under open skies',
      'Roaming through dense pine forests in search of food',
      'Stalking silently through the underbrush',
      'Locking antlers in a powerful territorial clash',
      'Leading a herd across a misty valley at dawn',
      'Standing alert at the forest edge, ears twitching',
      'Charging across open grassland with thunderous force',
      'Resting beside a tranquil alpine lake'
    ],
    habitats: [
      'Great Plains grasslands stretching to the horizon',
      'Rocky Mountain alpine meadows',
      'Dense boreal forests of Canada',
      'Yellowstone wilderness valleys',
      'Appalachian mountain forests',
      'Northern tundra of Alaska',
      'Temperate forests of the Pacific Northwest'
    ],
  },

  {
    label: 'Predators & Arctic Specialists',
    species: [
      'Polar Bear (Ursus maritimus)', 'Arctic Fox (Vulpes lagopus)',
      'Canada Lynx (Lynx canadensis)', 'Wolverine (Gulo gulo)',
      'Red Fox (Vulpes vulpes)', 'Coyote (Canis latrans)',
      'Bobcat (Lynx rufus)', 'Harbor Seal (Phoca vitulina)'
    ],
    behaviors: [
      'Traversing vast icy landscapes under pale sunlight',
      'Hunting stealthily through deep snow',
      'Leaping gracefully across frozen terrain',
      'Howling into the cold night air',
      'Tracking prey with keen precision',
      'Resting on drifting sea ice',
      'Darting swiftly between snow-covered rocks',
      'Diving beneath icy waters in pursuit of fish'
    ],
    habitats: [
      'Arctic tundra of northern Alaska',
      'Frozen sea ice of the Arctic Ocean',
      'Snow-covered boreal forests',
      'Remote Yukon wilderness',
      'Rocky coastal shores of Alaska',
      'Glacial valleys of northern Canada'
    ],
  },

  {
    label: 'Wetland & River Creatures',
    species: [
      'American Alligator (Alligator mississippiensis)', 'North American Beaver (Castor canadensis)',
      'River Otter (Lontra canadensis)', 'Muskrat (Ondatra zibethicus)',
      'Snapping Turtle (Chelydra serpentina)', 'Great Blue Heron (Ardea herodias)',
      'Bullfrog (Lithobates catesbeianus)', 'Manatee (Trichechus manatus)'
    ],
    behaviors: [
      'Gliding silently through murky swamp waters',
      'Constructing a complex dam from branches and mud',
      'Diving and twisting playfully beneath the surface',
      'Basking motionless on a sunlit riverbank',
      'Wading slowly through shallow wetlands',
      'Snapping quickly at passing prey',
      'Floating lazily in warm coastal waters',
      'Calling loudly across a still evening marsh'
    ],
    habitats: [
      'Swamps of the Florida Everglades',
      'Slow-moving rivers of the Mississippi Basin',
      'Freshwater marshes of the Southeast',
      'Cold mountain streams of the Rockies',
      'Wetlands of the Great Lakes region',
      'Coastal estuaries of the Gulf of Mexico'
    ],
  },

  {
    label: 'Birds of Sky & Forest',
    species: [
      'Bald Eagle (Haliaeetus leucocephalus)', 'Peregrine Falcon (Falco peregrinus)',
      'Wild Turkey (Meleagris gallopavo)', 'Snowy Owl (Bubo scandiacus)',
      'Red-tailed Hawk (Buteo jamaicensis)', 'Blue Jay (Cyanocitta cristata)',
      'Northern Cardinal (Cardinalis cardinalis)', 'Sandhill Crane (Antigone canadensis)'
    ],
    behaviors: [
      'Soaring high above rugged cliffs on thermal currents',
      'Diving at incredible speed toward unsuspecting prey',
      'Strutting proudly through open woodland clearings',
      'Gliding silently across snowy fields at dusk',
      'Perching on a branch scanning the ground below',
      'Calling loudly from treetops at sunrise',
      'Migrating in graceful formations across the sky',
      'Wading through shallow wetlands in search of food'
    ],
    habitats: [
      'Cliffs overlooking vast river valleys',
      'Open woodlands of the eastern United States',
      'Snowy plains of the northern tundra',
      'Forests of the Pacific Northwest',
      'Grasslands of the Midwest',
      'Wetlands and marshes across North America',
      'Suburban parks and backyard feeders'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden sunset casting long shadows over the prairie',
  'Soft dawn light illuminating a misty forest',
  'Cool blue twilight over a quiet mountain valley',
  'Bright midday sun reflecting off snow-covered ground',
  'Dappled sunlight through dense woodland canopy',
  'Storm clouds gathering over open plains',
  'Warm autumn light filtering through colorful foliage',
  'Moonlight glistening on a calm northern lake',
  'Crisp winter daylight under a clear blue sky'
];

const MODIFIERS = [
  'Cinematic wildlife photography', 'Macro detail on fur and feathers',
  'Slow motion 120fps capture', 'Low-angle perspective from a hidden camera trap',
  'Telephoto lens compression', 'Aerial drone view over wilderness',
  'Handheld documentary style', 'Sharp focus on the animal\'s eyes',
  'Shallow depth of field with natural background'
];

const ENHANCERS = [
  '8K ultra-high resolution', 'BBC Planet Earth quality', 'hyper-realistic textures',
  'award-winning nature photography', 'perfect composition', 'volumetric light and atmosphere',
  'intricate fur and feather detail', 'vibrant natural colors'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateAmericaBatch = (count = 20) => {
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

const output = generateAmericaBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (North America Edition)');