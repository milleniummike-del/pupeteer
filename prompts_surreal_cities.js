/**
 * PromptForge: Futuristic City Surrealism Generator
 * Usage: node surreal_city.js [count]
 */

const fs = require('fs');

const SUGGESTIONS = {
  subjects: [
    'A towering megacity skyline',
    'A floating train station',
    'A network of suspended highways',
    'A skyscraper made of glass and data streams',
    'A subway system with transparent tunnels',
    'A city built inside a massive sphere',
    'A cluster of hovering buildings',
    'A neon-lit cyberpunk district',
    'A vertical city stretching into the clouds',
    'A monorail wrapped around a skyscraper',
    'A city powered by glowing energy cores',
    'A transit hub with infinite platforms',
    'A bridge made of flowing light',
    'A city where buildings walk on mechanical legs',
    'A skyline made of shifting holograms',
    'A futuristic airport floating above the ocean',
    'A city with roads made of liquid metal',
    'A train that loops through the sky endlessly',
    'A tower that pierces through multiple dimensions',
    'A city where vehicles are sentient',
    'A ring-shaped city orbiting in the sky',
    'A massive underground metropolis',
    'A city built on moving platforms',
    'A skyscraper that folds like origami',
    'A network of glowing transit veins across a city',
    'A floating highway system between clouds',
    'A city powered by lightning storms',
    'A transit system made of teleportation gates',
    'A city growing like a living organism',
    'A skyline reflected infinitely in glass structures'
  ],

  transformations: [
    'reconfiguring itself like a living machine',
    'shifting into impossible geometric forms',
    'folding into higher dimensions',
    'glitching between timelines',
    'transforming into streams of data',
    'melting into flowing neon light',
    'expanding into infinite recursion',
    'fragmenting into floating districts',
    'merging with a digital consciousness',
    'evolving into organic architecture',
    'collapsing into a singularity',
    'rebuilding itself in real time',
    'splitting into parallel realities',
    'rotating in non-Euclidean space',
    'turning into a network of neural pathways',
    'phasing between physical and virtual states',
    'unfolding like a mechanical organism',
    'assembling from swarms of nanobots',
    'transmuting into pure energy infrastructure',
    'stretching across time itself'
  ],

  environments: [
    'a hyper-dense cyberpunk мегacity',
    'a sky filled with flying vehicles and drones',
    'a layered city spanning multiple altitudes',
    'an endless urban sprawl under artificial skies',
    'a city orbiting a distant planet',
    'a neon-lit nightscape with constant rain',
    'a floating metropolis above the clouds',
    'a city submerged under a transparent ocean dome',
    'a high-speed transit grid spanning continents',
    'a city built inside a colossal structure',
    'a vertical world with no ground level',
    'a metropolis illuminated by holographic suns',
    'a dystopian city ruled by AI systems',
    'a utopian city powered by clean energy',
    'a transport network stretching into space',
    'a city existing between parallel dimensions',
    'a megastructure housing millions of inhabitants',
    'a city where gravity shifts unpredictably',
    'an abandoned futuristic metropolis',
    'a glowing city under a black starless sky'
  ],

  tones: [
    'Cyberpunk intensity',
    'Futuristic awe',
    'Dystopian tension',
    'Utopian serenity',
    'Technological transcendence',
    'Cold synthetic beauty',
    'Hyper-modern isolation',
    'Digital dreamscape',
    'Mechanical harmony',
    'Existential futurism'
  ]
};

const MODIFIERS = [
  'non-Euclidean architecture',
  'infinite scale',
  'AI-driven systems',
  'quantum transportation',
  'gravity-defying structures',
  'holographic materials',
  'dynamic city evolution',
  'interdimensional transit',
  'hyper-dense infrastructure',
  'time-looping traffic systems',
  'living architecture',
  'energy-based construction'
];

const ENHANCERS = [
  'cinematic lighting',
  'neon glow effects',
  'volumetric fog',
  'ray-traced reflections',
  'ultra-detailed textures',
  'dynamic motion blur',
  'high contrast cyberpunk grading'
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
    const numSubjects = Math.floor(Math.random() * 2) + 1;
    const subjects = pickN(SUGGESTIONS.subjects, numSubjects).join(', ');
    
    const trans = getRandom(SUGGESTIONS.transformations);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`- SUBJECT: ${subjects} - TRANSFORMATION: ${trans} - ENVIRONMENT: ${env} - TONE: ${tone} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
    );
  }

  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};

// EXECUTION
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateSurrealBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ Futuristic city videos.js generated successfully');