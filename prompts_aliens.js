/**
 * PromptForge: Sci‑Fi Alien Life Generator CLI
 * Usage: node prompts_aliens.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ALIEN ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ALIEN_GROUPS = [
  {
    label: 'Bioluminescent Deep‑Space Species',
    species: [
      'Astraeon Lattice‑Serpent',
      'Lumivyre Photonic Ray',
      'Veyr Dominion Crystal Arthropod',
      'Star‑Drifting Nebula Manta',
      'Quantum‑Phase Ribbon Eel',
      'Void‑Blooming Plasma Jelly'
    ],
    behaviors: [
      'Weaving glowing trails through vacuum',
      'Communicating via harmonic light pulses',
      'Shifting between physical and photonic states',
      'Orbiting stars in synchronized spirals',
      'Absorbing stellar radiation to recharge',
      'Folding briefly into higher dimensions'
    ],
    habitats: [
      'Free‑floating in nebula clouds',
      'Near the corona of unstable stars',
      'Inside ionized plasma rivers',
      'Drifting through cosmic dust fields',
      'Orbiting collapsed stellar remnants'
    ]
  },

  {
    label: 'Terrestrial Alien Civilizations',
    species: [
      'Kharxan Swarm‑Dynasty Warrior Drone',
      'Ooloi Gas‑Giant Floater',
      'Luminid Stellar Entity',
      'Shardborn Silicon Titan',
      'Aetherborn Desert Walker',
      'Mycelid Hive‑Mind Sporeform'
    ],
    behaviors: [
      'Constructing megastructures with organic tools',
      'Engaging in ritualized territorial displays',
      'Communicating through telepathic resonance',
      'Harvesting geothermal vents for energy',
      'Shapeshifting to adapt to environmental stress',
      'Synchronizing neural patterns with the hive'
    ],
    habitats: [
      'Crystalline canyon worlds',
      'Gas‑giant upper atmosphere layers',
      'Binary‑star desert planets',
      'Subterranean fungal super‑colonies',
      'Titan‑sized living megacities'
    ]
  },

  {
    label: 'Predators & Apex Alien Lifeforms',
    species: [
      'Rift‑Stalker Phase Panther',
      'Chrono‑Raptor Temporal Hunter',
      'Void‑Leviathan Planet‑Eater',
      'Gravimorph Density Shifter',
      'Spectral Fangbeast',
      'Apex Helion Strider'
    ],
    behaviors: [
      'Phasing in and out of local spacetime',
      'Tracking prey across multiple timelines',
      'Emitting gravity‑distorting roars',
      'Camouflaging by bending visible light',
      'Hunting in coordinated telepathic packs',
      'Leaping between dimensional fractures'
    ],
    habitats: [
      'Fractured dimensional rifts',
      'High‑gravity volcanic worlds',
      'Dark‑matter infused caverns',
      'Temporal storm regions',
      'Abandoned megastructure ruins'
    ]
  },

  {
    label: 'Peaceful & Intelligent Alien Species',
    species: [
      'Astraeus‑Class Starship Symbiote',
      'Elyndra Crystal‑Mind Diplomat',
      'Seraphel Floating Arbiter',
      'Auralis Harmonic Weaver',
      'Thalorian Water‑Breathing Scholar',
      'Zenithian Cloud‑Dweller'
    ],
    behaviors: [
      'Exchanging knowledge through light‑patterns',
      'Floating serenely above alien landscapes',
      'Manipulating matter with soft telekinesis',
      'Singing harmonic tones that shape the air',
      'Growing living architecture from bio‑crystals',
      'Guiding travelers through cosmic anomalies'
    ],
    habitats: [
      'Floating citadels above alien oceans',
      'Crystal forests on ancient worlds',
      'Atmospheric cities suspended in clouds',
      'Bioluminescent caverns of knowledge',
      'Orbiting sanctuaries around peaceful moons'
    ]
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Twin‑sun illumination casting long alien shadows',
  'Bioluminescent glow from alien flora',
  'Pulsing nebula light reflecting off exoskeletons',
  'Dim starlight filtered through cosmic dust',
  'Iridescent atmospheric scattering',
  'Harsh ultraviolet alien daylight',
  'Soft luminous fog drifting across alien terrain'
];

const MODIFIERS = [
  'Cinematic sci‑fi composition',
  'Ultra‑wide alien landscape shot',
  'Macro detail on alien skin textures',
  'Dynamic motion capture of alien movement',
  'Drone‑style orbital sweep',
  'First‑person explorer perspective',
  'Slow‑motion capture of energy emissions',
  'High‑contrast cosmic lighting',
  'Shallow depth of field on alien anatomy'
];

const ENHANCERS = [
  '8K ultra‑resolution',
  'Hyper‑realistic sci‑fi rendering',
  'Cinematic volumetric lighting',
  'Alien color spectrum enhancement',
  'Ultra‑detailed exobiology textures',
  'High‑fidelity atmospheric scattering',
  'Award‑winning sci‑fi documentary style'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateAlienBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(ALIEN_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');
    const meta = 'video of';

    lines.push(
      `videos[${i}] = \`${meta} - SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateAlienBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Sci‑Fi Alien Edition)');
