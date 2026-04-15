/**
 * PromptForge: Underwater Marine Life Generator CLI
 * Usage: node prompts_underwater.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Ocean Giants & Apex Predators',
    species: [
      'Great White Shark (Carcharodon carcharias)',
      'Blue Whale (Balaenoptera musculus)',
      'Orca / Killer Whale (Orcinus orca)',
      'Hammerhead Shark (Sphyrnidae)',
      'Giant Manta Ray (Mobula birostris)',
      'Sperm Whale (Physeter macrocephalus)'
    ],
    behaviors: [
      'Gliding silently through the deep open ocean',
      'Hunting in coordinated packs with precision',
      'Breaching dramatically above the ocean surface',
      'Circling curiously around a diver',
      'Diving into the abyss in search of prey',
      'Cruising powerfully through strong ocean currents'
    ],
    habitats: [
      'Deep open ocean abyss',
      'Cold nutrient-rich waters',
      'Coastal continental shelf',
      'Underwater seamounts',
      'Polar marine environments'
    ]
  },

  {
    label: 'Coral Reef Life',
    species: [
      'Clownfish (Amphiprioninae)',
      'Parrotfish (Scaridae)',
      'Angelfish (Pomacanthidae)',
      'Butterflyfish (Chaetodontidae)',
      'Moorish Idol (Zanclus cornutus)',
      'Blue Tang (Paracanthurus hepatus)'
    ],
    behaviors: [
      'Darting quickly between vibrant coral structures',
      'Grazing algae from coral surfaces',
      'Swimming in synchronized schools',
      'Hiding among anemone tentacles',
      'Defending territory aggressively',
      'Weaving gracefully through reef formations'
    ],
    habitats: [
      'Colorful tropical coral reefs',
      'Shallow lagoon ecosystems',
      'Coral atolls with crystal clear water',
      'Reef drop-offs into deep blue',
      'Warm equatorial seas'
    ]
  },

  {
    label: 'Deep Sea Creatures',
    species: [
      'Anglerfish (Lophiiformes)',
      'Giant Squid (Architeuthis dux)',
      'Vampire Squid (Vampyroteuthis infernalis)',
      'Goblin Shark (Mitsukurina owstoni)',
      'Deep Sea Jellyfish (Scyphozoa)',
      'Fangtooth Fish (Anoplogaster cornuta)'
    ],
    behaviors: [
      'Luring prey with bioluminescent light',
      'Floating motionless in the dark void',
      'Attacking suddenly with lightning speed',
      'Drifting with deep ocean currents',
      'Expanding its body to intimidate predators',
      'Emitting eerie glowing pulses in total darkness'
    ],
    habitats: [
      'Pitch-black ocean depths',
      'Hydrothermal vent fields',
      'Midnight zone of the ocean',
      'Deep sea trenches',
      'Cold, high-pressure abyssal plains'
    ]
  },

  {
    label: 'Coastal & Playful Marine Animals',
    species: [
      'Bottlenose Dolphin (Tursiops truncatus)',
      'Sea Turtle (Cheloniidae)',
      'Sea Otter (Enhydra lutris)',
      'Seal (Pinnipedia)',
      'Sea Lion (Zalophus californianus)',
      'Octopus (Octopoda)'
    ],
    behaviors: [
      'Playfully swimming alongside waves',
      'Gliding effortlessly through shallow waters',
      'Using tools or intelligence to hunt prey',
      'Resting on rocks near the shoreline',
      'Changing color and texture to camouflage',
      'Interacting curiously with divers'
    ],
    habitats: [
      'Coastal shorelines and kelp forests',
      'Rocky tide pools',
      'Shallow tropical waters',
      'Seagrass meadows',
      'Coral reef edges'
    ]
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Sun rays piercing through crystal-clear blue water',
  'Soft diffused light beneath the ocean surface',
  'Bioluminescent glow in deep dark waters',
  'Golden sunlight shimmering on shallow reefs',
  'Dark moody underwater shadows with limited visibility',
  'Sparkling caustic light patterns dancing on the seabed',
  'Twilight underwater hues with fading sunlight'
];

const MODIFIERS = [
  'National Geographic underwater cinematography',
  'Macro close-up on scales and textures',
  'Slow motion underwater capture',
  'Wide-angle lens showing vast ocean environment',
  'Diver perspective shot',
  'Underwater drone footage',
  'Cinematic tracking shot following movement',
  'Sharp focus on eyes and movement',
  'Shallow depth of field with blurred aquatic background'
];

const ENHANCERS = [
  '8K ultra-high resolution',
  'BBC Blue Planet quality',
  'hyper-realistic water physics',
  'cinematic underwater lighting',
  'vibrant marine colors',
  'ultra-detailed textures',
  'perfect composition',
  'award-winning nature documentary style'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateUnderwaterBatch = (count = 20) => {
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

const output = generateUnderwaterBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Underwater Edition)');