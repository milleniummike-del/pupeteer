const fs = require('fs');

// --- LARGE RANDOM BUILDING BLOCKS ---

const MATERIALS = [
  'colorful layered jelly','glass','frosted glass','crystal','quartz','diamond',
  'polished marble','raw marble','granite','obsidian','liquid chrome','brushed steel',
  'polished steel','rusted metal','copper','oxidized copper','bronze','gold','rose gold',
  'silver','aluminum','mirror surface','rubber','latex','silicone','gel','translucent gel',
  'slime','putty','clay','ceramic','porcelain','plastic','glossy plastic','matte plastic',
  'acrylic','resin','epoxy resin','wood','oak wood','pine wood','bamboo','charcoal',
  'ice','frosted ice','cracked ice','snow','sand','wet sand','fabric','silk','velvet',
  'leather','paper','cardboard','concrete','polished concrete','asphalt','tar',
  'wax','candle wax','soap','foam','sponge','chalk','pastel','ink-soaked material',
  'oil-coated surface','painted surface','neon material','holographic surface',
  'iridescent material','pearlescent material','carbon fiber','fiberglass',
  'mesh','wireframe material','grid texture','pixelated material','digital glass',
  'liquid metal','molten metal','lava-like material','plasma surface','energy field',
  'gelatin','gummy texture','sugar glass','caramel','chocolate','dark chocolate',
  'white chocolate','milk chocolate','honey','syrup','jelly','jam','frozen gel',
  'bubble wrap','inflatable plastic','soft foam','dense foam','microbead texture'
];

const SURFACES = [
  'dirty concrete floor','muddy ground','dusty glass panel','stained tile wall',
  'greasy kitchen counter','paint-covered wall','rusty metal sheet','oil-stained garage floor',
  'chalk-covered board','foggy mirror','dirty car surface','dusty wooden table',
  'sand-covered surface','grimy bathroom tiles','moss-covered stone','wet pavement',
  'dirty window','polluted water surface','stained fabric','burnt surface',
  'ash-covered ground','dirty plastic panel','fingerprint-covered glass','mud-splattered wall',
  'dirty marble surface','dirty granite countertop','dusty electronics surface',
  'dirty screen','rain-soaked dirty surface','snow-covered dirty surface',
  'grease-covered metal','ink-stained surface','paint-splattered floor',
  'dirty ceramic tiles','dirty brick wall','moldy surface','algae-covered surface',
  'dirty pool floor','dirty bathtub','dirty sink','dirty mirror','dusty bookshelf',
  'dirty desk','crumb-covered table','sticky surface','syrup-covered surface',
  'dirty conveyor belt','factory grime surface','construction dust surface',
  'dirty road','muddy boots surface','dirty leather surface','dirty fabric couch',
  'dirty carpet','dirty rug','dirty glass table','dirty plastic container',
  'dirty metal plate','dirty aluminum surface','dirty steel panel','dirty copper surface',
  'dirty bronze surface','dirty gold surface','dirty silver surface',
  'dirty chrome surface','dirty mirror surface','dirty acrylic panel',
  'dirty resin surface','dirty epoxy surface','dirty rubber surface',
  'dirty silicone surface','dirty foam surface','dirty sponge surface',
  'dirty chalkboard','dirty whiteboard','dirty painted wall','dirty wallpaper',
  'dirty wooden floor','dirty bamboo surface','dirty stone floor',
  'dirty tile floor','dirty asphalt road','dirty concrete wall'
];

const OBJECTS = [
  'cube','sphere','pyramid','cylinder','cone','torus','hexagon','octagon',
  'dodecahedron','icosahedron','prism','capsule','ring','disc','panel',
  'block','slab','rod','bar','tile','plate','ball','orb','droplet',
  'crystal shard','gemstone','bead','pebble','brick','tablet','chip',
  'gear','cog','spring','coil','wireframe shape','grid cube','voxel cube',
  'abstract geometric shape','low-poly object','high-poly object',
  'mechanical part','industrial component','modular block','stacked cube',
  'layered slab','floating orb','rotating disc'
];

const COLORS = [
  'vibrant neon colors','pastel tones','rainbow gradient','monochrome black and white',
  'gold and silver','blue and teal hues','purple and pink gradient',
  'orange and red tones','green and yellow palette','cyberpunk neon',
  'soft beige tones','cool gray palette','warm sunset colors',
  'deep ocean blues','electric blue','lime green','hot pink',
  'lavender tones','mint green','peach tones','sky blue',
  'metallic gradient','iridescent colors','holographic colors',
  'dark moody tones','high contrast black and white','soft faded tones'
];

const LIQUIDS = [
  'water','clear water','colored liquid','paint','oil','ink','milk',
  'chocolate syrup','caramel','honey','molten metal','lava','gel',
  'slime','foam','soap water','detergent','cleaning solution',
  'neon liquid','glowing liquid','plasma-like fluid','digital fluid',
  'shimmering liquid','sparkling liquid','bubbly liquid'
];

const ENVIRONMENTS = [
  'dark background','studio lighting','minimal clean background',
  'soft ambient lighting','high contrast lighting','neon-lit environment',
  'futuristic setting','industrial setting','laboratory setting',
  'abstract void','infinite background','white studio background',
  'black void','gradient backdrop','colorful backdrop',
  'cinematic lighting','soft shadow environment','glow lighting',
  'volumetric lighting','foggy atmosphere','misty environment'
];

const EXTRA = [
  'perfectly centered composition',
  'no visible start or end frame',
  'continuous cyclic motion',
  'no jump cuts',
  'hypnotic visual rhythm',
  'ultra smooth animation'
];

// --- HELPERS ---
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pick2 = (arr) => [...arr].sort(() => 0.5 - Math.random()).slice(0, 2).join(', ');

// --- LOOP TYPES ---

function cuttingLoop() {
  return `A perfectly seamless loop of a sharp knife slicing through ${rand(MATERIALS)}, each slice regenerates instantly, smooth continuous motion, glossy texture, satisfying cutting rhythm, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function cleaningLoop() {
  return `A seamless loop of ${rand(SURFACES)} being pressure washed with ${rand(LIQUIDS)}, the dirt continuously reappears as the water passes, smooth back-and-forth motion, highly satisfying, realistic fluid physics, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function morphLoop() {
  return `A seamless loop of a ${rand(OBJECTS)} made of ${rand(MATERIALS)} morphing into another shape and back into its original form, fluid motion, glossy reflective material, soft shadows, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function patternLoop() {
  return `A seamless looping animation of ${rand(COLORS)} geometric patterns expanding outward and folding back into themselves, symmetrical design, smooth transitions, mesmerizing motion, neon glow, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function meltingLoop() {
  return `A seamless loop of ${rand(MATERIALS)} melting smoothly and reforming into its original shape, glossy texture, slow fluid motion, highly satisfying, macro shot, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function conveyorLoop() {
  return `A seamless loop of ${rand(OBJECTS)} made of ${rand(MATERIALS)} moving on a conveyor belt, perfectly spaced, continuous motion, objects reappear endlessly, industrial aesthetic, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function liquidLoop() {
  return `A seamless looping animation of ${rand(COLORS)} ${rand(LIQUIDS)} waves flowing in a continuous cycle, smooth fluid motion, vibrant blending, hypnotic effect, high detail, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

function crushingLoop() {
  return `A seamless loop of ${rand(MATERIALS)} objects being crushed and instantly reforming, crisp textures, slow motion feel, highly satisfying, ${rand(ENVIRONMENTS)}, ${pick2(EXTRA)}, 4K`;
}

// --- MASTER GENERATOR ---
const LOOP_TYPES = [
  cuttingLoop,
  cleaningLoop,
  morphLoop,
  patternLoop,
  meltingLoop,
  conveyorLoop,
  liquidLoop,
  crushingLoop
];

function generatePrompt() {
  const fn = rand(LOOP_TYPES);
  return `videos.push(\`${fn()}\`);`;
}

// --- BATCH ---
function generateVideoBatch(count = 10) {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    lines.push(generatePrompt());
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
}

// --- CLI ---
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 10;

const output = generateVideoBatch(count);

fs.writeFileSync('videos.js', output, 'utf8');

console.log('🔁 videos.js generated with massive variation pools');