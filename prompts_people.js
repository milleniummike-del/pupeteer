/**
 * PromptForge: Prehistoric People Generator CLI
 * Usage: node prompts_people.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// PREHISTORIC PEOPLE GROUPS DATASET
// ---------------------------------------------------------
const PEOPLE_GROUPS = [
  {
    label: 'Hunters & Gatherers',
    species: [
      'Cro-Magnon hunters', 'Neanderthal tribe members', 'Early Homo sapiens', 
      'Homo erectus foragers', 'Ice Age hunters', 'Mesolithic gatherers'
    ],
    behaviors: [
      'Tracking a herd of woolly mammoths across a snowy tundra', 'Working together to corner a giant elk in a narrow valley', 
      'Spearing salmon in a rushing glacial river', 'Gathering wild berries and roots in a sun-drenched meadow', 
      'Hiding in tall grass while stalking a steppe bison', 'Scavenging a fresh kill from a sabertooth cat', 
      'Setting a primitive trap for small game', 'Using a throwing-stick to hunt birds near a lake',
      'Carrying a heavy load of firewood back to the camp', 'Butchering a large animal with flint tools'
    ],
    habitats: [
      'Expansive snowy tundra under a pale blue sky', 'Dense pine forest with deep shadows', 
      'Rolling steppe grasslands with grazing megafauna', 'Misty river valley with limestone cliffs', 
      'Rocky shoreline with crashing waves', 'Edge of a massive retreating glacier', 
      'Lush woodland with ancient oak trees', 'Arid savannah with scattered acacia trees', 
      'Hidden valley with a winding stream', 'High mountain pass above the clouds'
    ],
  },

  {
    label: 'Craft & Survival',
    species: [
      'Flint knappers', 'Hide scrapers', 'Tool makers', 
      'Basket weavers', 'Spear crafters', 'Fire keepers'
    ],
    behaviors: [
      'Expertly knapping a flint core into a sharp hand-axe', 'Scraping a mammoth hide stretched over a wooden frame', 
      'Binding a stone tip to a wooden shaft using animal sinew', 'Drilling a hole into a shell to make jewelry', 
      'Using a hand-drill to start a fire on a piece of dry wood', 'Weaving a sturdy basket from flexible willow branches', 
      'Sewing a warm cloak using a bone needle and leather strips', 'Grinding ochre into a fine red powder for pigment', 
      'Sharpening a mammoth ivory spear point', 'Drying strips of meat over a smoky fire'
    ],
    habitats: [
      'Sheltered campsite at the base of a towering cliff', 'Interior of a large, flickering cave', 
      'Communal work area under a primitive animal-hide tent', 'Rocky outcrop with a view of the valley', 
      'Quiet riverside glade', 'Winter camp buried deep in the forest', 
      'Natural rock shelter with ancient soot on the ceiling', 'Sunlit clearing in a birch forest', 
      'Near a natural tar pit or salt lick', 'Sandy beach littered with driftwood'
    ],
  },

  {
    label: 'Art & Ritual',
    species: [
      'Cave painters', 'Shamanic figures', 'Storytellers', 
      'Ritual dancers', 'Elder wisdom-keepers', 'Musicians'
    ],
    behaviors: [
      'Blowing red pigment over a hand to create a stencil on a cave wall', 'Painting a majestic charcoal bison by torchlight', 
      'Performing a rhythmic dance around a massive central bonfire', 'Chanting a deep, guttural ritual song', 
      'Carving a small Venus figurine from soft limestone', 'Playing a haunting melody on a bone flute', 
      'Telling a story with animated gestures to a circle of listeners', 'Wearing a ceremonial headdress made of antlers', 
      'Consulting the patterns of stars in the night sky', 'Marking the changing seasons on a bone calendar'
    ],
    habitats: [
      'Deep, winding limestone cavern with crystalline formations', 'Sacred stone circle in a remote highland', 
      'Vibrant forest grove at the height of autumn', 'Nighttime campsite under a brilliant Milky Way', 
      'Mist-covered hilltop at dawn', 'Narrow passage deep within a mountain', 
      'Echoing canyon with natural acoustics', 'Edge of a sacred spring', 
      'High plateau with a panoramic view of the horizon', 'Shadowy alcove filled with prehistoric art'
    ],
  },

  {
    label: 'Social & Domestic',
    species: [
      'Mother and child', 'Tribal elders', 'Playing children', 
      'A group of friends', 'A young couple', 'The whole community'
    ],
    behaviors: [
      'Tending to a small child wrapped in furs', 'Sharing a communal meal around a central hearth', 
      'Children playing a game of tag among the huts', 'Elders engaged in a serious discussion', 
      'Walking together along a winding forest path', 'Bathing in a warm volcanic spring', 
      'Grooming each other in a social bonding ritual', 'Resting together after a long day of foraging', 
      'Building a new shelter using mammoth bones and hides', 'Watching the sunset from a high ridge'
    ],
    habitats: [
      'Buzzing village of circular huts and tents', 'Cozy interior of a winter lodge', 
      'Sunny meadow near a freshwater spring', 'Shadowy forest edge at twilight', 
      'Peaceful riverbank with swaying reeds', 'Rocky terrace with drying hides', 
      'High alpine meadow in full bloom', 'Sheltered cove on a turquoise coast', 
      'Near a field of tall wild grain', 'Garden-like oasis in a semi-arid landscape'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Flickering orange torchlight casting dramatic shadows on cave walls',
  'Warm golden hour sunlight filtering through the prehistoric forest',
  'Cold, blue moonlight reflecting off a snowy landscape',
  'Harsh, direct noon sun on the dusty steppe',
  'Soft, diffused morning mist with rays of light',
  'Dramatic silhouette against a vibrant crimson sunset',
  'Glowing embers of a campfire illuminating faces in the dark',
  'Ethereal twilight purple over the ancient hills',
  'Electric lightning flash during a fierce storm',
  'Dappled sunlight through a canopy of giant trees',
  'Soft pastel dawn colors reflecting in a still lake',
  'Cinematic backlighting highlighting the texture of fur and hide'
];

const MODIFIERS = [
  'National Geographic documentary style', 'Extreme close-up on weathered faces', 'Wide-angle landscape shot',
  'Cinematic 35mm film grain', 'Handheld camera movement for realism', 'Slow motion action shot',
  'Hyper-realistic textures of skin and fur', 'Authentic prehistoric atmosphere', 'Dramatic low-angle perspective',
  'Shallow depth of field focusing on flint tools', 'High-speed capture of a hunt', 'Aerial view of a migration',
  'Sepia-toned historical aesthetic', 'Vivid natural colors'
];

const ENHANCERS = [
  '8K resolution', 'highly detailed character models', 'masterpiece quality',
  'intricate primitive details', 'perfect anatomical accuracy', 'volumetric smoke and mist',
  'award-winning cinematography', 'professional color grading'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generatePeopleBatch = (count = 20) => {
  const lines = [];
  lines.push('const videos = [];');

  for (let i = 0; i < count; i++) {
    const group = getRandom(PEOPLE_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = "- SUBJECT: ${spec} - ACTIVITY: ${bhv} - ENVIRONMENT: ${hab} - LIGHTING: ${light} - STYLE: ${mods} - QUALITY: ${enh}";`
    );
  }

  lines.push('module.exports = videos;');
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generatePeopleBatch(count);

// Write file in UTF-8
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with prehistoric people (UTF-8 safe)');
