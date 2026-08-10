/**
 * PromptForge: Animals Doing Human Things Generator CLI (Single-File, UTF-8 Safe)
 * Usage: node animals_tasks.js [count]
 * Default count: 20
 */

const fs = require('fs');

const SUGGESTIONS = {
  animals: [
    'red panda',
    'golden retriever',
    'snowy owl',
    'capybara',
    'arctic fox',
    'koala',
    'penguin',
    'hummingbird',
    'baby elephant',
    'squirrel',
    'hedgehog',
    'otter',
    'tortoise',
    'parrot',
    'hamster',
    'lynx',
    'meerkat',
    'seal pup',
    'chipmunk',
    'puffin',
    'ferret',
    'fawn',
    'raccoon',
    'black cat',
    'white rabbit',
    'fox cub',
    'duckling',
    'goat kid',
    'lemur',
    'sloth',
    'mouse',
    'wolf pup',
    'bear cub',
    'chinchilla',
    'frog',
    'gecko',
    'alpaca',
    'donkey',
    'horse foal',
    'tiger cub',
    'lion cub',
    'zebra foal',
    'kangaroo joey',
    'beaver',
    'porcupine',
    'otter pup',
    'quokka',
    'toucan',
    'armadillo'
  ],
  tasks: [
    'baking cupcakes',
    'painting a sunset',
    'writing in a journal',
    'watering tiny plants',
    'reading a bedtime story',
    'building a miniature house',
    'folding laundry',
    'making tea',
    'playing the piano',
    'typing on a laptop',
    'sweeping the floor',
    'decorating a cake',
    'taking photographs',
    'knitting a scarf',
    'practicing yoga',
    'doing calligraphy',
    'drawing a portrait',
    'building a sandcastle',
    'flying a kite',
    'making breakfast',
    'organizing books',
    'wrapping gifts',
    'painting tiny figurines',
    'writing letters',
    'planting flowers',
    'mixing paint colors',
    'playing chess',
    'crafting paper art',
    'cleaning windows',
    'making lemonade',
    'playing violin',
    'sewing buttons',
    'building a birdhouse',
    'writing poetry',
    'making smoothies',
    'folding origami',
    'practicing meditation',
    'setting up a picnic',
    'designing a poster',
    'making a tiny garden',
    'building a toy car',
    'writing music notes',
    'organizing a desk',
    'painting a mural',
    'making hot cocoa',
    'drawing maps',
    'crafting jewelry',
    'writing a story',
    'making candles',
    'decorating a room'
  ],
  environments: [
    'inside a cozy cottage',
    'in a tiny art studio',
    'on a floating cloud island',
    'inside a miniature library',
    'in a pastel-colored kitchen',
    'inside a tiny greenhouse',
    'in a warm candlelit room',
    'inside a treehouse loft',
    'in a tiny bakery',
    'inside a magical workshop',
    'in a soft glowing garden',
    'inside a tiny café',
    'in a peaceful reading nook',
    'inside a floating lantern village',
    'in a tiny seaside cabin',
    'inside a rainbow-lit attic',
    'in a miniature classroom',
    'inside a tiny observatory',
    'in a pastel craft room',
    'inside a tiny forest hut',
    'in a glowing moonlit studio',
    'inside a tiny flower shop',
    'in a cozy winter lodge',
    'inside a tiny cloud bakery',
    'in a soft dreamlike meadow',
    'inside a tiny stargazing room',
    'in a miniature workshop',
    'inside a tiny pastel cottage',
    'in a floating dream garden',
    'inside a tiny enchanted library',
    'in a warm sunlit studio',
    'inside a tiny ocean-view hut',
    'in a miniature fantasy village',
    'inside a tiny sakura house',
    'in a glowing lantern-lit room',
    'inside a tiny rainbow workshop',
    'in a miniature cloud café',
    'inside a tiny moonlit cabin',
    'in a pastel dream studio',
    'inside a tiny forest cottage',
    'in a miniature tea house',
    'inside a tiny craft loft',
    'in a floating pastel village',
    'inside a tiny magical bakery',
    'in a cozy dream workshop',
    'inside a tiny cloud observatory',
    'in a miniature flower loft',
    'inside a tiny enchanted cottage',
    'in a pastel-lit dream room'
  ],
  tones: [
    'whimsical charm',
    'gentle humor',
    'soft inspiration',
    'heartwarming sweetness',
    'calm creativity',
    'peaceful joy',
    'playful imagination',
    'quiet magic',
    'uplifting delight',
    'dreamlike wonder',
    'cozy comfort',
    'pure innocence',
    'gentle laughter',
    'warm nostalgia',
    'soft emotional glow',
    'tiny triumph',
    'calm determination',
    'joyful curiosity',
    'sweet encouragement',
    'gentle motivation',
    'soft optimism',
    'warm-hearted whimsy',
    'peaceful focus',
    'creative serenity',
    'tiny bravery',
    'gentle perseverance',
    'soft kindness',
    'warm creative energy',
    'playful creativity',
    'quiet joy',
    'gentle inspiration',
    'soft-hearted humor',
    'warm imagination',
    'peaceful delight',
    'tiny creative magic',
    'gentle artistic joy',
    'soft whimsical glow',
    'warm emotional charm',
    'tiny hopeful spark',
    'gentle creative courage',
    'soft dreamlike humor',
    'warm gentle wonder',
    'tiny joyful magic',
    'peaceful creative play',
    'soft uplifting charm',
    'warm tiny triumph',
    'gentle cozy joy',
    'soft imaginative glow',
    'warm whimsical peace'
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateAnimalTaskBatch = (count = 20) => {
  const batch = [];
  batch.push(`const animalTasks = [];`);

  for (let i = 0; i < count; i++) {
    const animal = getRandom(SUGGESTIONS.animals);
    const task = getRandom(SUGGESTIONS.tasks);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);

    batch.push(
      `animalTasks[${i}] = \`${animal} ${task} ${env} — TONE: ${tone}\`;`
    );
  }

  batch.push(`module.exports = animalTasks;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateAnimalTaskBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ animalTasks.js generated successfully (UTF-8 safe)');
