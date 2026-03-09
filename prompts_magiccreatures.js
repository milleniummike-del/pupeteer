/**
 * PromptForge: Magic Creatures Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node prompts_magiccreatures.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// MAGIC CREATURES GROUPS DATASET
// ---------------------------------------------------------
const MAGIC_GROUPS = [
  {
    label: 'Noble & Mythical Beasts',
    species: [
      'Golden Phoenix', 'Silvery Unicorn', 'Majestic Hippogriff', 
      'Celestial Pegasus', 'Ancient Sphinx', 'Shimmering Griffin', 
      'Winged Abraxan Horse', 'Golden Snidget', 'Thunderbird', 
      'Qilin (Kirin)', 'Zouwu', 'Mooncalf', 
      'Occamy', 'Diricawl', 'Fwooper'
    ],
    behaviors: [
      'Bursting into a brilliant display of flame and rebirth', 'Galloping across a moonlit meadow with grace', 
      'Bowing its head in a gesture of mutual respect', 'Soaring through a thunderstorm while summoning lightning', 
      'Guarding an ancient treasure with a cryptic riddle', 'Disappearing in a flash of golden light', 
      'Healing a wound with a single shimmering tear', 'Displaying its iridescent wings in a mating dance',
      'Drinking from a crystalline pool of enchanted water', 'Watching over a hidden sanctuary with wisdom'
    ],
    habitats: [
      'Enchanted forest with glowing blue mushrooms', 'Hidden valley of eternal spring', 
      'Mountain peak above a sea of clouds', 'Ancient marble temple ruins', 
      'Lush garden of a wizarding estate', 'Floating island in a magical dimension', 
      'Sanctuary hidden within a desert mirage', 'Starlit clearing during a celestial alignment', 
      'Misty highland moor at dawn', 'Secret grove of Whispering Willows'
    ],
  },

  {
    label: 'Dragons & Great Serpents',
    species: [
      'Hungarian Horntail', 'Norwegian Ridgeback', 'Chinese Fireball', 
      'Swedish Short-Snout', 'Common Welsh Green', 'Ukrainian Ironbelly', 
      'Hebridean Black', 'Antipodean Opaleye', 'Romanian Longhorn', 
      'Peruvian Vipertooth', 'Great Sea Serpent', 'Basilisk', 
      'Occamy (Serpentine form)', 'Amphiptere', 'Wyvern'
    ],
    behaviors: [
      'Exhaling a jet of blue-hot magical flame', 'Coiling its massive body around a jagged peak', 
      'Diving from the clouds with a deafening roar', 'Protecting a clutch of metallic, glowing eggs', 
      'Shedding scales that shimmer like gemstones', 'Engaging in an aerial dogfight with a rival dragon', 
      'Scanning the ground with glowing, reptilian eyes', 'Slithering through a dark, ancient chamber', 
      'Rising from the ocean depths in a massive whirlpool', 'Roaring at the moon from a volcanic crater'
    ],
    habitats: [
      'Smoldering volcanic caldera', 'High-altitude mountain dragon sanctuary', 
      'Deep underground cavern filled with gold', 'Jagged sea cliffs battered by storms', 
      'Ruined stone castle reclaimed by nature', 'Dense tropical jungle with giant canopy', 
      'Frozen tundra with ice-covered peaks', 'Sun-scorched desert canyon', 
      'Shadowy dungeon with emerald-green lighting', 'Ancient redwood forest'
    ],
  },

  {
    label: 'Dark & Dangerous Monsters',
    species: [
      'Manticore', 'Chimera', 'Nemean Lion', 
      'Cerberus (Three-headed dog)', 'Acromantula (Giant Spider)', 'Werewolf', 
      'Thestral', 'Dementor (Wraith-like)', 'Lethifold', 
      'Nundu (Giant Leopard)', 'Quintaped', 'Graphorn', 
      'Blast-Ended Skrewt', 'Kappa', 'Red Cap'
    ],
    behaviors: [
      'Stalking through the shadows with glowing red eyes', 'Letting out a bone-chilling howl under a full moon', 
      'Leaping from a rocky ledge with lethal precision', 'Spinning a massive, sticky web between ancient trees', 
      'Releasing a cloud of toxic, pestilential breath', 'Prowling silently with skeletal wings folded', 
      'Draining the joy and warmth from the surrounding air', 'Charging with unstoppable force and thick hide', 
      'Hissing from the darkness of a damp cavern', 'Snapping its venomous tail-stinger in warning'
    ],
    habitats: [
      'Forbidden Forest at the witching hour', 'Subterranean labyrinth of cold stone', 
      'Fog-covered graveyard with crumbling monuments', 'Fetid swamp with bubbling green gas', 
      'Shadowed mountain pass with jagged obsidian rocks', 'Abandoned village reclaimed by dark magic', 
      'Gloomy cavern with dripping stalactites', 'Twisted forest of black, leafless trees', 
      'Deep, dark trench beneath a haunted lake', 'Ruins of a dark wizard\'s tower'
    ],
  },

  {
    label: 'Forest & Folk Creatures',
    species: [
      'Centaur Warrior', 'Niffler', 'Bowtruckle', 
      'House Elf (Free)', 'Goblin Smith', 'House Elf (Servant)', 
      'Wood Nymph', 'Dryad', 'Satyr', 
      'Pixie (Cornish Blue)', 'Imp', 'Red Cap',
      'Leprechaun', 'Gnarlak (Goblin)', 'Veela'
    ],
    behaviors: [
      'Stargazing and interpreting the movements of Mars', 'Scuttling into a hole with a stolen gold coin', 
      'Camouflaging perfectly against the bark of a tree', 'Snapping fingers to perform a burst of wandless magic', 
      'Forging a blade of silver in a subterranean forge', 'Dancing in a circle of toadstools at twilight', 
      'Playing a haunting melody on a wooden flute', 'Pranking a passing traveler with mischievous laughter', 
      'Gathering rare magical herbs by moonlight', 'Hiding among the roots of an ancient oak'
    ],
    habitats: [
      'Lush glade with ancient standing stones', 'Cozy burrow beneath a giant tree root', 
      'Subterranean goblin city with gold-veined walls', 'Greenhouse filled with venomous tentacula', 
      'Attic of a sprawling, magical manor house', 'Riverside camp under a canopy of stars', 
      'Hidden garden behind a brick wall', 'Forest floor covered in thick moss and bluebells', 
      'Hollowed-out tree trunk filled with trinkets', 'Wildflower meadow vibrating with magic'
    ],
  },

  {
    label: 'Aquatic & Icy Dwellers',
    species: [
      'Selkie (Merperson)', 'Grindylow', 'Giant Squid', 
      'Kelpie (Water Horse)', 'Sea Monk', 'Hippocampus', 
      'Yeti (Abominable Snowman)', 'Ice Troll', 'Frost Giant', 
      'Snow Leopard (Magical)', 'Arctic Phoenix', 'Shrakke',
      'Plimpy', 'Glumbumble', 'Ramora'
    ],
    behaviors: [
      'Singing an eerie melody beneath the surface', 'Grappling with its tentacles in a murky lake', 
      'Shape-shifting from a horse into a cloud of kelp', 'Emerging from a blizzard with a thunderous roar', 
      'Carving a path through a frozen mountain pass', 'Basking on an iceberg under the Aurora Borealis', 
      'Hunting for fish in a crystal-clear mountain lake', 'Leaping through the waves in a spray of silver', 
      'Guarding a passage through a wall of solid ice', 'Swimming gracefully through a forest of giant kelp'
    ],
    habitats: [
      'Crystal-clear alpine lake', 'Deep, murky waters of a haunted loch', 
      'Underwater village built of coral and shells', 'Frozen mountain peak during a whiteout', 
      'Ice cavern illuminated by glowing lichen', 'Rocky coastline with crashing waves', 
      'Abyssal trench of the magical ocean', 'Snowy evergreen forest under the North Star', 
      'Hidden hot spring in a frozen valley', 'Flooded cave system with bioluminescent algae'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Ethereal moonlight casting long, silvery shadows',
  'Magical golden hour with floating motes of light',
  'Soft bioluminescent glow from surrounding flora',
  'Dramtic lightning illuminating a stormy sky',
  'Prismatic refraction through a magical barrier',
  'Warm firelight reflecting off polished scales',
  'Eerie green mist illuminated by a nearby spell',
  'Bright Aurora Borealis dancing across the sky',
  'Twilight indigo haze with sparkling fairy lights',
  'Ray of sunlight breaking through a dark forest canopy',
  'Cold, blue winter light reflecting off ice and snow',
  'Flickering torchlight in an ancient stone corridor',
  'Radiant aura emanating from the creature itself'
];

const MODIFIERS = [
  'Wizarding World aesthetic', 'Macro extreme detail of fur and feathers', 'High-speed magical freeze',
  'Cinematic wide-angle environmental shot', 'Low-angle heroic perspective', 'Dreamy soft focus',
  'Intricate wand-lighting effects', 'Aerial broomstick-view cinematography', 'Sharp eye-focus with magical glint',
  'Shallow depth of field with sparkling bokeh', 'Atmospheric magical haze',
  'Mythical atmosphere', 'Legendary creature photography'
];

const ENHANCERS = [
  '8K resolution', 'Harry Potter film quality', 'hyper-realistic magical CGI',
  'award-winning fantasy art aesthetic', 'perfect composition', 'volumetric spell-light',
  'intricate scale and mane detail', 'professional cinematic color grading'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateMagicBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(MAGIC_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = \`- CREATURE: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateMagicBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with magic creatures (UTF‑8 safe)');
