/**
 * PromptForge: Funny Animal Water Jump Generator CLI
 * Focus: Short, viral, funny clips of animals jumping into water
 * Usage: node prompts_funny_water.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ANIMALS (FUNNY / VIRAL-FRIENDLY)
// ---------------------------------------------------------
const ANIMALS = [
  'Golden Retriever',
  'Labrador Dog',
  'French Bulldog',
  'Shiba Inu',
  'Husky',
  'Baby Elephant',
  'Capybara',
  'Red Panda',
  'Raccoon',
  'Otter',
  'Monkey',
  'Chimpanzee',
  'Goat',
  'Cow',
  'Horse',
  'Duck',
  'Goose',
  'Penguin',
  'Seal',
  'Sea Lion',
  'Tiger Cub',
  'Lion Cub',
  'Bear Cub',
  'Kangaroo',
  'Squirrel',
  'Cat',
  'Kitten',
  'Puppy',
  'Piglet',
  'Hippo Calf'
];

// ---------------------------------------------------------
// FUNNY WATER JUMP BEHAVIORS
// ---------------------------------------------------------
const BEHAVIORS = [
  'jumping into water with a huge splash',
  'slipping and accidentally falling into a pool',
  'leaping dramatically into a tiny puddle',
  'jumping into water and immediately panicking',
  'doing an unexpected belly flop into the water',
  'missing the jump and falling awkwardly into water',
  'jumping in confidently then scrambling to get out',
  'copying a human and jumping into water',
  'jumping in slow motion with a goofy expression',
  'running full speed and launching into water',
  'hesitating nervously before suddenly jumping in',
  'jumping in and splashing everyone nearby',
  'falling in backwards unexpectedly',
  'jumping in while chasing something invisible',
  'overreacting to shallow water with a big splash',
  'jumping in and immediately shaking water everywhere',
  'sliding into water instead of jumping',
  'jumping in and startling itself',
  'jumping repeatedly in and out of water',
  'doing a clumsy jump that turns into a splash fail'
];

// ---------------------------------------------------------
// LOCATIONS
// ---------------------------------------------------------
const LOCATIONS = [
  'backyard swimming pool',
  'small muddy puddle',
  'lake shore',
  'beach shoreline',
  'kids inflatable pool',
  'farm water trough',
  'riverbank',
  'garden fountain',
  'water park splash area',
  'bathtub'
];

// ---------------------------------------------------------
// FUNNY REACTIONS
// ---------------------------------------------------------
const REACTIONS = [
  'people laughing in the background',
  'owner shouting in surprise',
  'kids cheering loudly',
  'camera shaking from laughter',
  'someone saying “NOOO!” just before the jump',
  'everyone reacting with shock and laughter',
  'owner facepalming in disbelief',
  'friends laughing uncontrollably'
];

// ---------------------------------------------------------
// VIDEO STYLE
// ---------------------------------------------------------
const STYLES = [
  'vertical video, TikTok style',
  'YouTube Shorts format',
  'handheld phone camera',
  'slight camera shake',
  'zoom on impact moment',
  'slow motion replay',
  'loopable ending'
];

const ENHANCERS = [
  'funny viral energy',
  'highly shareable moment',
  'cute and chaotic',
  'unexpected comedic timing',
  'meme-worthy reaction'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------
const generateFunnyWaterClips = (count = 20) => {
  const lines = [];
  lines.push(`const clips = [];`);

  for (let i = 0; i < count; i++) {
    const animal = getRandom(ANIMALS);
    const behavior = getRandom(BEHAVIORS);
    const location = getRandom(LOCATIONS);
    const reaction = getRandom(REACTIONS);
    const styles = pickN(STYLES, 2).join(', ');
    const enh = pickN(ENHANCERS, 2).join(', ');

    const title = `${animal} Jumps Into Water 😂`;

    lines.push(`videos[${i}] = \`${ratio} - SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`);
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateFunnyWaterClips(count);

fs.writeFileSync('funny_water_clips.js', output, { encoding: 'utf8' });

console.log('😂 funny_water_clips.js generated successfully');
