/**
 * PromptForge: Cinematic Spy Environment Generator
 * Usage: node spy-sets.js [count]
 * Generates epic espionage-style locations and vehicle set pieces
 * NO PEOPLE — only environments, vehicles, and cinematic motion
 */

const fs = require('fs');

const SUGGESTIONS = {
  locations: [
    'Glass skyscraper rooftops above a neon мегacity at night',
    'Abandoned Soviet radar station buried in snowy mountains',
    'Cliffside luxury casino complex overlooking crashing waves',
    'Neon-drenched night market streets after rainfall',
    'High-speed rail line cutting through a frozen mountain pass',
    'Underground weapons facility beneath a decaying city',
    'Private island compound with brutalist concrete architecture',
    'Desert airstrip surrounded by endless dunes',
    'Frozen harbor packed with silent military submarines',
    'Ultra-modern art museum made of steel and glass',
    'Cargo port stacked with towering shipping containers',
    'Ancient stone fortress retrofitted with satellite dishes',
    'Floating ocean platforms connected by metal bridges',
    'Luxury penthouse tower piercing low clouds',
    'Secret laboratory built into a volcanic crater',
    'Massive European train station under vaulted glass سقroofs',
    'Mountain monastery overlooking mist-filled valleys',
    'Oil rig in the middle of a violent electrical storm',
    'Subterranean metro tunnels beneath a sleeping capital city',
    'Deserted seaside amusement park at dusk',
    'Arctic research station under aurora-filled skies',
    'Jungle airfield with overgrown runways',
    'Mediterranean superyacht marina at golden hour',
    'Border checkpoint surrounded by floodlights and fog',
    'Hydroelectric dam spanning a deep canyon',
    'Old city rooftops linked by antennas and water towers',
    'Underground parking megastructure during a blackout',
    'Secluded vineyard estate with long winding access roads'
  ],

  vehicles: [
    'black armored SUV',
    'sleek electric hypercar',
    'military cargo helicopter',
    'stealth attack drone',
    'armored motorcycle',
    'luxury speedboat',
    'military patrol boat',
    'private stealth jet',
    'high-speed bullet train',
    'matte-black sports car',
    'armored personnel carrier',
    'off-road tactical truck',
    'surveillance van',
    'experimental VTOL aircraft',
    'unmarked pursuit sedan'
  ],

  vehicleActions: [
    'racing along wet reflective pavement',
    'drifting around tight concrete turns',
    'flying low between skyscrapers',
    'skimming across dark ocean water',
    'speeding through narrow mountain roads',
    'crossing a massive bridge at full throttle',
    'descending toward a hidden landing pad',
    'moving silently through heavy fog',
    'weaving between industrial structures',
    'emerging from a tunnel into blinding light',
    'circling high above like a predator',
    'cutting across desert terrain leaving dust trails',
    'gliding over frozen terrain under moonlight'
  ],

  environmentalMotion: [
    'rainwater cascading down glass surfaces',
    'fog rolling through the streets',
    'snow whipping across open structures',
    'loose papers and debris blowing in the wind',
    'waves crashing violently against structures',
    'electrical arcs flickering from damaged lights',
    'distant lightning illuminating the skyline',
    'steam rising from underground vents',
    'dust clouds drifting across floodlights',
    'neon signs flickering in the darkness'
  ],

  moods: [
    'cold high-tech tension',
    'silent pre-storm atmosphere',
    'slick neon-noir intensity',
    'ominous large-scale stillness',
    'gritty industrial realism',
    'moody cinematic isolation',
    'high-stakes atmospheric suspense'
  ]
};

const CAMERA_STYLE = [
  'slow aerial drone flyover',
  'wide anamorphic establishing shot',
  'long tracking shot following vehicle movement',
  'extreme wide environmental framing',
  'low-angle ground tracking perspective',
  'top-down satellite-style shot',
  'slow cinematic push-in'
];

const VISUALS = [
  'volumetric lighting',
  'realistic motion blur',
  'wet surface reflections',
  'cinematic color grading',
  'high dynamic range lighting',
  'subtle film grain',
  'deep contrast shadows'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const generateSpyBatch = (count = 5) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const loc = getRandom(SUGGESTIONS.locations);
    const vehicle = getRandom(SUGGESTIONS.vehicles);
    const action = getRandom(SUGGESTIONS.vehicleActions);
    const envMotion = getRandom(SUGGESTIONS.environmentalMotion);
    const mood = getRandom(SUGGESTIONS.moods);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const visuals = pickN(VISUALS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`- LOCATION: ${loc} - VEHICLE: ${vehicle} ${action} - ENVIRONMENT: ${envMotion} - MOOD: ${mood} - CAMERA: ${cam} - VISUAL STYLE: ${visuals}\`;`
    );
  }

  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};


// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateSpyBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🎬 spy-videos.js generated successfully (cinematic environment mode)');
