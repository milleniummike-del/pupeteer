/**
 * PromptForge: Viral YouTube Generator (2026 Algorithm Edition)
 * Built from real YouTube trend analysis
 * Usage: node viral_youtube.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// VIRAL HOOKS (FIRST 2 SECONDS = EVERYTHING)
// ---------------------------------------------------------
const HOOKS = [
  'I tried this and instantly regretted it',
  'This should NOT have worked',
  'I tested the most viral trend on the internet',
  'Nobody expected this to happen',
  'This went completely wrong',
  'I pushed this to the limit',
  'I found the weirdest thing online',
  'This is why people are freaking out about this',
  'I did this so you don’t have to',
  'This changed everything'
];

// ---------------------------------------------------------
// VIDEO FORMATS (PROVEN)
// ---------------------------------------------------------
const FORMATS = [
  '24-hour challenge',
  'extreme experiment',
  'before vs after transformation',
  'viral trend test',
  'social experiment',
  'AI experiment',
  'life hack test',
  'reaction + commentary',
  'POV scenario',
  'mini documentary'
];

// ---------------------------------------------------------
// SUBJECT IDEAS (HIGH CTR)
// ---------------------------------------------------------
const SUBJECTS = [
  'AI controlling my day',
  'living with zero money',
  'eating only one color food',
  'copying a billionaire routine',
  'testing TikTok viral hacks',
  'training like an athlete',
  'living in complete silence',
  'letting strangers decide everything',
  'surviving on the internet trends',
  'using only AI to make decisions'
];

// ---------------------------------------------------------
// ESCALATION (MAKE IT CRAZY)
// ---------------------------------------------------------
const ESCALATIONS = [
  'but it got out of control fast',
  'and things escalated quickly',
  'and I wasn’t ready for what happened',
  'but it became a disaster',
  'and it turned into chaos',
  'and it pushed me to the limit',
  'but something unexpected happened',
  'and it completely changed halfway through'
];

// ---------------------------------------------------------
// PAYOFFS (REWARD)
// ---------------------------------------------------------
const PAYOFFS = [
  'the ending shocked me',
  'I couldn’t believe the result',
  'this actually worked',
  'this was a complete failure',
  'I learned something insane',
  'this changed my perspective',
  'I would never do this again',
  'this might be the future'
];

// ---------------------------------------------------------
// STYLE ELEMENTS (MODERN YOUTUBE)
// ---------------------------------------------------------
const STYLE = [
  'fast-paced editing with jump cuts',
  'high retention storytelling structure',
  'cinematic documentary style',
  'raw authentic vlog style',
  'YouTube Shorts optimized pacing',
  'loopable ending for replay value'
];

const CAMERA = [
  'handheld camera for realism',
  'close-up emotional shots',
  'wide-angle cinematic shots',
  'POV perspective',
  'screen recording mixed with real footage'
];

const DETAILS = [
  'strong emotional reactions',
  'relatable human moments',
  'unexpected twists',
  'high-energy pacing',
  'clear story progression',
  'viral thumbnail moment built in'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// TITLE GENERATOR (CTR OPTIMIZED)
// ---------------------------------------------------------
const buildTitle = () => {
  const hook = getRandom(HOOKS);
  const subject = getRandom(SUBJECTS);
  const escalation = getRandom(ESCALATIONS);

  return `${hook} (${subject}) ${escalation}`;
};

// ---------------------------------------------------------
// PROMPT GENERATOR
// ---------------------------------------------------------
const buildPrompt = () => {
  const format = getRandom(FORMATS);
  const subject = getRandom(SUBJECTS);
  const escalation = getRandom(ESCALATIONS);
  const payoff = getRandom(PAYOFFS);

  const style = getRandom(STYLE);
  const camera = getRandom(CAMERA);
  const details = pickN(DETAILS, 2).join(', ');

  return `YouTube viral video: ${format} about ${subject}, ${escalation}. Ends with: ${payoff}. Style: ${style}, ${camera}. Includes ${details}.`;
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
      `videos[${i}] = \`${prompt}\`;`
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

// Write file
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Viral YouTube 2026 Edition)');