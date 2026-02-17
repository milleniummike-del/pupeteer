
/**
 * PromptForge: Sci-Fi & Fantasy Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node prompts_scifi.js [count]
 * Default count: 20
 */

const fs = require('fs');

const SUGGESTIONS = {
  subjects: [
    'A desolate alien landscape', 'An ancient sentient starship', 'A floating sky-city',
    'A knight in power armor', 'A dragon made of pure energy', 'A holographic forest',
    'A cybernetic wizard', 'A lost artifact of immense power', 'A bioluminescent cave system',
    'A rogue AI construct', 'A portal to another dimension', 'A crystal data spire',
    'A star-spanning empire', 'A forgotten alien temple', 'A mech-suit powered by magic',
    'A bustling spaceport market', 'A mythical beast with technological enhancements',
    'A terraformed planet at dawn', 'A tribal warrior wielding plasma weapons',
    'A living, breathing nebula', 'A colossal ringworld', 'An interdimensional explorer',
    'A genetically engineered creature', 'A space opera heroine', 'A steam-powered automaton',
    'A fae folk meeting advanced robotics', 'A sentient ocean planet', 'A hidden rebel base',
    'A relic from a fallen galactic civilization', 'A griffin with metallic wings',
    'A colony ship journeying through a wormhole', 'A last guardian of a magic realm',
    'A city encased in a force field', 'A mercenary with a enchanted blade',
    'A vast cosmic entity', 'A fleet of ethereal warships', 'A time-traveling rogue',
    'A colossal space station', 'A digital ghost in the machine', 'A mythical creature re-engineered',
    'A planet-sized supercomputer', 'A forest where trees are communication relays',
    'A warrior monk with psionic abilities', 'A floating island powered by arcane technology',
    'A futuristic gladiatorial arena', 'A druid interfacing with a planetary network',
    'A deep-space mining colony', 'A benevolent alien intelligence', 'A legendary sword of light'
  ],
  transformations: [
    'merging with its technological counterpart', 'phasing into an alternate reality',
    'unleashing a torrent of arcane energy', 'initiating a hyperdrive jump',
    'revealing its true alien form', 'glowing with latent psionic power',
    'integrating with the planetary network', 'converting into pure data streams',
    'crystallizing into a new energy source', 'summoning ancient guardians',
    'shifting through dimensions', 'activating cloaking technology',
    'terraforming the barren landscape', 'unraveling into cosmic dust',
    'uploading its consciousness to the cloud', 'manifesting as a digital entity',
    'recalibrating its magical matrix', 'opening a rift in spacetime',
    'evolving into a higher state of being', 'detaching from its gravitational anchor'
  ],
  environments: [
    'a newly discovered exoplanet with twin suns', 'the heart of a dying star',
    'a sprawling cyberpunk metropolis', 'an enchanted forest with bioluminescent flora',
    'the control room of a derelict space hulk', 'a fantastical kingdom powered by geothermal vents',
    'a wormhole leading to the edge of the universe', 'a crystalline cavern humming with alien energy',
    'a feudal world with advanced orbital defenses', 'the ruins of a cosmic engine',
    'a mythical realm hidden by technological illusion', 'an asteroid field teeming with space pirates',
    'a desert planet scarred by ancient wars', 'a cloud city hovering over a gas giant',
    'a sacred grove protected by energy shields', 'a vast, unexplored cosmic anomaly',
    'an ice planet with geothermal cities', 'a moon base overlooking a vibrant gas giant',
    'a dragons lair filled with advanced tech', 'a nebula forming new stars',
    'a Dyson sphere interior', 'a forgotten magical library within a space station',
    'a vibrant coral reef on an alien ocean world', 'the command deck of a flagship',
    'an ancient battleground where magic meets steel', 'a futuristic slum under a perpetually dark sky',
    'a realm where physics can be bent by will', 'a bustling interstellar trading hub'
  ],
  tones: [
    'Epic wonder', 'Cosmic dread', 'Heroic determination',
    'Mystical mystery', 'Techno-optimism', 'Grimdark realism',
    'Alien beauty', 'Arcane power', 'Frontier spirit',
    'Cybernetic serenity', 'Chaotic magic', 'Existential adventure'
  ]
};

const MODIFIERS = [
  'holographic projections', 'anti-gravity fields', 'ancient runes glowing', 'quantum entanglement effects',
  'cybernetic implants visible', 'fae magic intertwining', 'nanite swarms active', 'eldritch technology',
  'star-forged metals', 'zero-gravity environment', 'warp distortions', 'chitinous armor plating',
  'plasma discharges', 'ethereal energy trails', 'gravity manipulation', 'bio-luminescent accents'
];

const ENHANCERS = [
  'unreal engine 5', 'octane render', 'cinematic lighting',
  '4k resolution', 'hyper-detailed', 'volumetric fog',
  'ray-traced reflections', 'neon glows', 'magical particle effects', 'epic scale'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateSciFiFantasyBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);
  for (let i = 0; i < count; i++) {
    const numSubjects = Math.floor(Math.random() * 2) + 1; // 1 or 2 subjects for better focus
    const subjects = pickN(SUGGESTIONS.subjects, numSubjects).join(', ');
    
    const trans = getRandom(SUGGESTIONS.transformations);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);
    const mods = pickN(MODIFIERS, 3).join(', ');
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

const output = generateSciFiFantasyBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (UTF‑8 safe)');
