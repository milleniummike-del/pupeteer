/**
 * PromptForge: Viral 5-Second Illusion & Transformation Engine (NEW SET)
 * Focus: weird, hypnotic, unexpected visual transformations
 * Usage: node viral_illusion.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// CORE CONCEPTS (NEW - NON-OBVIOUS)
// ---------------------------------------------------------
const CONCEPTS = [
  'a solid object melting into liquid and reforming into something new',
  'a pile of random objects merging into a single perfect shape',
  'a flat surface folding itself into a 3D structure',
  'a cracked object seamlessly healing and transforming into a different material',
  'a chaotic swirl of particles forming a recognizable object',
  'a cube unfolding into a completely different object',
  'liquid rising upward and assembling into a solid structure',
  'a shadow detaching and becoming a real object',
  'a reflection changing independently and altering reality',
  'a simple object multiplying and reorganizing into a complex pattern'
];

// ---------------------------------------------------------
// OPENING HOOK STATES (FRAME 1 IMPACT)
// ---------------------------------------------------------
const START_STATES = [
  'starts in a confusing and abstract form',
  'begins as a random unrecognizable shape',
  'opens with something visually broken or fragmented',
  'starts as scattered pieces with no clear structure',
  'begins with a strange unnatural formation'
];

// ---------------------------------------------------------
// TRANSFORMATION BEHAVIOR (UNEXPECTED MOTION)
// ---------------------------------------------------------
const MOTIONS = [
  'smoothly morphs in a continuous fluid motion',
  'rapidly reshapes with impossible physics',
  'twists and folds into a new structure',
  'breaks apart and instantly reassembles differently',
  'flows like liquid but behaves like a solid',
  'snaps into place with precise alignment',
  'expands and contracts while changing form'
];

// ---------------------------------------------------------
// END STATES (STRONG PAYOFF)
// ---------------------------------------------------------
const END_STATES = [
  'ending as a perfectly symmetrical object',
  'ending as a clean geometric structure',
  'ending as something completely different from the start',
  'ending in a visually satisfying final form',
  'ending in a polished, minimal, aesthetic object'
];

// ---------------------------------------------------------
// LOOP TRICKS (KEY TO VIRALITY)
// ---------------------------------------------------------
const LOOP_TRICKS = [
  'the final shape visually matches the starting shape for a seamless loop',
  'the ending transitions perfectly back into the beginning',
  'loop resets invisibly with no noticeable jump',
  'continuous looping illusion with perfect alignment'
];

// ---------------------------------------------------------
// CAMERA + FORMAT (LOCKED)
// ---------------------------------------------------------
const CAMERA = [
  'single static centered shot',
  'fixed camera with no movement',
  'one continuous frame with no cuts',
  'clean studio background with focus on the object'
];

// ---------------------------------------------------------
// STRICT RULES (ANTI-AI ERRORS)
// ---------------------------------------------------------
const RULES = [
  '5-second duration',
  'single continuous shot',
  'no cuts',
  'no scene changes',
  'no split screen',
  'no multiple views',
  'everything happens in one frame',
  'strictly one frame only, never show two states at the same time'
];

// ---------------------------------------------------------
// VISUAL STYLE (HIGH-END LOOK)
// ---------------------------------------------------------
const VISUAL_STYLE = [
  'ultra clean minimal aesthetic',
  'high contrast lighting',
  'smooth realistic motion',
  'glossy or matte material textures',
  'cinematic lighting with soft shadows',
  'hyper-detailed rendering'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// TITLE (MORE MYSTERY-DRIVEN)
// ---------------------------------------------------------
const buildTitle = () => {
  return `This doesn’t make sense… watch closely 👀`;
};

// ---------------------------------------------------------
// PROMPT BUILDER (COMPLETELY NEW STYLE)
// ---------------------------------------------------------
const buildPrompt = () => {
  const concept = getRandom(CONCEPTS);
  const start = getRandom(START_STATES);
  const motion = getRandom(MOTIONS);
  const end = getRandom(END_STATES);
  const loop = getRandom(LOOP_TRICKS);
  const camera = getRandom(CAMERA);
  const rules = RULES.join(', ');
  const visuals = pickN(VISUAL_STYLE, 2).join(', ');

  return `A 5-second viral visual video showing ${concept}. The video ${start}, then ${motion}, ${end}. ${loop}. ${camera}. ${rules}. ${visuals}.`;
};

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const title = buildTitle();
    const prompt = buildPrompt();

    lines.push(
      `videos[${i}] = \`${prompt}\``
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

const output = generateBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Illusion Viral Engine)');