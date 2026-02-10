/**
 * PromptForge: Nature Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node nature.js [count]
 */

const fs = require('fs');


/**
 * PromptForge: Surrealism Generator CLI
 * Usage: node surreal.js [count]
 * Default count: 20
 */

const SUGGESTIONS = {
  subjects: [
    'A solitary figure', 'A colossal human heart', 'A fractured ceramic mask', 
    'A vintage pocket watch', 'A grand piano', 'A glass eye', 
    'An ancient gnarled tree', 'A floating chess piece', 'A lighthouse made of bone',
    'A human skull blooming with flowers', 'A mechanical bird', 'A translucent marble hand',
    'An ornate brass key', 'A tattered umbrella', 'A floating silver fish',
    'A chair made of woven light', 'A paper lantern', 'A swarm of crystal butterflies',
    'A mirror reflecting a different world', 'A faceless tailor',
    'A giant snail with a city on its back', 'A melting chandelier', 'A violin made of glass',
    'A cloud trapped in a birdcage', 'A staircase leading into the sun',
    'A hand holding a miniature galaxy', 'A clock where the numbers are birds',
    'A suit of armor filled with flowers', 'A book with blank pages that bleed light',
    'A lighthouse beam that reveals hidden ghosts', 'A telephone receiver leaking ocean water',
    'A floating mountain of discarded letters', 'A mannequin made of porcelain and wood',
    'A giant keyhole in the middle of a desert', 'A telescope looking into the past',
    'A heart made of interlocking gears', 'A transparent umbrella shielding from stars',
    'A teapot pouring liquid shadows', 'A camera capturing dreams instead of light',
    'A harp with strings made of rain', 'A dandelion with seeds like tiny lanterns',
    'A crown of thorns and electric wire', 'A shadow with its own physical presence',
    'A compass pointing to "nowhere"', 'A typewriter that writes in butterflies',
    'A floating door with no frame', 'A giant eyeball encased in ice',
    'A ship with sails made of tattered memories', 'A silent bell made of frozen smoke',
    'A candle that casts darkness instead of light'
  ],
  transformations: [
    'turning into liquid gold', 'dissolving into constellations', 
    'sprouting crystalline wings', 'shattering into mirror shards', 
    'melting into a cityscape', 'bleeding neon light', 
    'weaving into storm clouds', 'sprouting internal gardens',
    'evaporating into ink smoke', 'crumbling into floating sand',
    'integrating with gears and wires', 'unfolding like blooming silk',
    'fracturing into geometric facets', 'flickering with a digital glitch',
    'burning with cold obsidian fire', 'vibrating into white static',
    'unspooling as velvet ribbons', 'glowing with bioluminescent moss',
    'hardening into stained glass', 'dripping like heavy mercury',
    'warping into a spiraling vortex', 'calcifying into ancient coral',
    'stretching into infinite threads', 'transforming into a swarm of moths',
    'petrifying into black marble', 'blooming into thousand-petaled lotus',
    'bleeding liquid moonlight', 'shattering into floating embers',
    'dissolving into a flock of white ravens', 'pixelating into geometric dust',
    'uncurling like a serpent of smoke', 'turning into a network of roots',
    'freezing into jagged ice sculptures', 'radiating waves of pure sound',
    'liquefying into a sea of tears', 'transmuting into iridescent oil',
    'shedding skin like a snake', 'glowing with internal starlight',
    'withering into a skeleton of lace', 'expanding into a fractal pattern',
    'vibrating until it becomes invisible', 'weeping liquid rubies',
    'turning into a hollow shell of gold leaf', 'sprouting feathers of iridescent peacock',
    'merging with its own shadow', 'unraveling like a ball of yarn',
    'turning into a cluster of bubbles', 'hardening into a diamond core',
    'exploding into a silent supernova', 'weaving back into reality'
  ],
  environments: [
    'vast desert of mirrors', 'flooded upside-down cathedral', 
    'endless hallway of doors', 'void of floating geometry', 
    'forest of frozen time', 'ocean of liquid mercury', 
    'liminal airport lounge', 'cosmic nebula library',
    'city built on clouds', 'field of giant paper poppies',
    'infinite white void', 'glass labyrinth',
    'underwater petrified forest', 'ruins of a giant clock',
    'cosmic train station', 'valley of moving shadows',
    'mountains of torn maps', 'crystalline cave of whispers',
    'endless spiral staircase', 'library where books are stars',
    'room with no corners or shadows', 'garden of iron flowers',
    'city submerged in amber', 'wasteland of giant clockwork gears',
    'abandoned theater on the moon', 'bridge between two different dimensions',
    'field of floating umbrellas', 'forest of giant stone hands',
    'city made entirely of glass', 'empty cathedral made of water',
    'floating island of discarded memories', 'room where the ceiling is the sea',
    'landscape of melting architectural ruins', 'valley of giant, silent bells',
    'desert under a green and purple sun', 'ocean of floating books',
    'city inside a giant seashell', 'forest where the trees are made of light',
    'abandoned carnival in the middle of space', 'labyrinth of infinite reflections',
    'room where gravity works sideways', 'city carved into a giant skull',
    'field of giant, glowing mushrooms', 'floating palace of clouds and lightning',
    'empty street in a ghost city', 'landscape of giant, frozen waves',
    'forest where it rains static', 'room with windows into different centuries',
    'desert where the sand is ground diamonds', 'garden of bioluminescent jellyfish'
  ],
  tones: [
    'Melancholic awe', 'Quiet dread', 'Divine serenity', 
    'Existential mystery', 'Sacred decay', 'Chaotic wonder', 
    'Nostalgic dream', 'Vibrant hallucination', 'Cold detachment',
    'Primal terror', 'Timeless stillness', 'Ethereal joy'
  ]
};

const MODIFIERS = [
  'impossible geometry', 'dream logic', 'symbolic anatomy', 'metaphysical scale',
  'time folding onto itself', 'sacred + decayed', 'hyperreal textures',
  'paradoxical lighting', 'liminal space', 'slow cosmic motion', 'silence made visible'
];

const ENHANCERS = [
  'ultra-fine grain', 'global illumination', 'volumetric lighting',
  'ray-traced reflections', 'painterly realism', 'cinematic color grading', 'shallow depth of field'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateSurrealBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);
  for (let i = 0; i < count; i++) {
    // Randomly mix up to 3 subjects for that chaotic surreal feel
    const numSubjects = Math.floor(Math.random() * 3) + 1;
    const subjects = pickN(SUGGESTIONS.subjects, numSubjects).join(', ');
    
    const trans = getRandom(SUGGESTIONS.transformations);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');
    
    batch.push(`videos[${i}] = \`- SUBJECT: ${subjects} - TRANSFORMATION: ${trans} - ENVIRONMENT: ${env} - TONE: ${tone} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`);

  }
  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};


// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateSurrealBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (UTF‑8 safe)');
