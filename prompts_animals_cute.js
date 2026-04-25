/**
 * PromptForge: Cute & Viral Animal Generator CLI (2025 Edition)
 * Generates funny, adorable, internet-style animal video prompts
 * Usage: node cute_animals.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// CUTE ANIMAL GROUPS
// ---------------------------------------------------------
const ANIMAL_GROUPS = [

  {
    label: 'Dogs (Goofy & Loyal)',
    species: [
      'Golden Retriever puppy', 'Corgi', 'French Bulldog',
      'Shiba Inu', 'Dachshund', 'Labrador puppy'
    ],
    actions: [
      'sliding uncontrollably across a shiny floor',
      'wearing oversized sunglasses and posing confidently',
      'chasing its own tail in a chaotic circle',
      'jumping excitedly into a pile of leaves',
      'failing hilariously at catching a treat mid-air',
      'running toward the camera in slow motion with floppy ears'
    ],
    environments: [
      'a cozy living room',
      'a sunny backyard',
      'a park full of autumn leaves',
      'a modern kitchen floor',
      'a soft carpeted hallway'
    ]
  },

  {
    label: 'Cats (Chaotic & Sassy)',
    species: [
      'fluffy kitten', 'Scottish Fold cat',
      'British Shorthair', 'orange tabby cat',
      'hairless Sphynx cat'
    ],
    actions: [
      'knocking objects off a table with deliberate attitude',
      'squeezing into a box that is far too small',
      'suddenly zooming across the room at full speed',
      'staring dramatically out of a window',
      'playfully attacking a dangling string',
      'sitting like a human on a couch'
    ],
    environments: [
      'a minimalist apartment',
      'a cluttered desk setup',
      'a sunny windowsill',
      'a cozy bedroom',
      'a modern living space'
    ]
  },

  {
    label: 'Pigs & Farm Cuties',
    species: [
      'mini pig', 'piglet', 'baby goat',
      'fluffy lamb', 'baby cow calf'
    ],
    actions: [
      'running in tiny excited bursts across the field',
      'rolling around happily in soft mud',
      'wearing a tiny outfit and walking proudly',
      'jumping energetically in random directions',
      'sniffing curiously at the camera lens',
      'falling asleep mid-play in a cute way'
    ],
    environments: [
      'a sunny farmyard',
      'a grassy meadow',
      'a rustic barn',
      'a muddy field',
      'a countryside pasture'
    ]
  },

  {
    label: 'Small Pets & Pocket Animals',
    species: [
      'hamster', 'guinea pig', 'bunny',
      'ferret', 'hedgehog'
    ],
    actions: [
      'stuffing its cheeks full of snacks',
      'running quickly on a tiny wheel',
      'hopping around playfully',
      'curled up into a tiny ball',
      'exploring a miniature obstacle course',
      'falling over in a clumsy but adorable way'
    ],
    environments: [
      'a colorful play enclosure',
      'a soft blanket setup',
      'a tiny pet habitat',
      'a miniature playground',
      'a cozy indoor corner'
    ]
  }

];

// ---------------------------------------------------------
// VIRAL VIDEO STYLE ELEMENTS
// ---------------------------------------------------------
const VIDEO_STYLES = [
  'funny viral TikTok style',
  'cute Instagram reel aesthetic',
  'YouTube shorts comedic timing',
  'wholesome pet video vibe',
  'meme-worthy internet content'
];

const CAMERA = [
  'shot on a handheld smartphone camera',
  'close-up framing focused on facial expressions',
  'slight shaky cam for realism',
  'low-angle perspective for comedic effect',
  'tracking shot following the animal'
];

const MOTION = [
  'captured in slow motion at 120fps',
  'real-time with natural movement',
  'slightly sped-up comedic pacing',
  'loopable action for replay value'
];

const DETAILS = [
  'adorable expressive eyes',
  'soft fluffy textures clearly visible',
  'natural lighting from nearby windows',
  'playful and energetic atmosphere',
  'highly relatable pet behavior',
  'perfect comedic timing'
];

const ENHANCERS = [
  'ultra-realistic detail',
  'high-definition video quality',
  'sharp focus with soft background blur',
  'vibrant natural colors',
  'cinematic but playful composition'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// PROMPT BUILDER
// ---------------------------------------------------------
const buildPrompt = () => {
  const group = getRandom(ANIMAL_GROUPS);

  const species = getRandom(group.species);
  const action = getRandom(group.actions);
  const environment = getRandom(group.environments);

  const style = getRandom(VIDEO_STYLES);
  const camera = getRandom(CAMERA);
  const motion = getRandom(MOTION);
  const details = pickN(DETAILS, 2).join(', ');
  const enhancers = pickN(ENHANCERS, 2).join(', ');

  return `Funny cute animal video of a ${species} ${action} in ${environment}. ${style}, ${camera}, ${motion}. ${details}, ${enhancers}.`;
};

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const prompt = buildPrompt();
    lines.push(`videos[${i}] = \`${prompt}\`;`);
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateBatch(count);

// Write file
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Cute Viral Animals Edition)');