const fs = require('fs');

// --- NEW ARRAYS FOR CHILL HOUSE VIDEO GENERATION ---

const CHILL_HOUSE_VIBES = [
  'deep chill house', 'tropical house', 'sunset lounge house',
  'beachside deep house', 'summer chillwave', 'balearic house'
];

const BEACH_ELEMENTS = [
  'golden sandy beach', 'sun-drenched coastline', 'crystal-clear turquoise water',
  'palm-tree-lined shore', 'quiet hidden cove', 'sunset horizon over the ocean',
  'gentle rolling waves', 'bright midday sunshine', 'warm tropical breeze'
];

const HOLIDAY_ACTIVITIES = [
  'lounging in a hammock', 'sipping a cold drink by the water',
  'walking barefoot along the shore', 'floating on a pool inflatable',
  'sunbathing under a parasol', 'reading a book by the sea',
  'playing beach volleyball', 'snorkeling near coral reefs',
  'riding a bicycle along the coast'
];

const LEISURE_SCENES = [
  'friends laughing together at a beach bar',
  'slow-motion waves washing over seashells',
  'a couple enjoying a sunset walk',
  'aerial drone shots of a tropical island',
  'people relaxing on sunbeds with cocktails',
  'a peaceful empty beach at sunrise',
  'a boat drifting calmly on open water',
  'shimmering reflections on the ocean surface'
];

const COLOR_STYLES = [
  'warm golden tones', 'soft pastel hues', 'vibrant tropical colors',
  'sunset gradients of orange and pink', 'cool blue and teal palette',
  'bright and airy summer tones'
];

const VIDEO_MODIFIERS = [
  'smooth slow-motion shots', 'gentle camera pans', 'soft depth of field',
  'cinematic drone footage', 'loop-friendly visuals', 'minimalist clean framing',
  'subtle film grain', 'high-saturation summer glow'
];

// --- HELPERS ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// --- NEW GENERATOR FOR CHILL HOUSE VIDEOS ---
const generateChillHouseVideoPrompt = () => {
  const vibe = getRandom(CHILL_HOUSE_VIBES);
  const beach = getRandom(BEACH_ELEMENTS);
  const activity = getRandom(HOLIDAY_ACTIVITIES);
  const scene = getRandom(LEISURE_SCENES);
  const colors = getRandom(COLOR_STYLES);
  const modifiers = pickN(VIDEO_MODIFIERS, 2).join(' and ');

  return `videos.push(\`Create a ${vibe} video. The setting features a ${beach}, capturing moments of ${activity}. The visuals should evoke ${scene}, using a color style of ${colors}. The overall aesthetic should include ${modifiers}.\`);`;
};

// --- BATCH GENERATOR ---
const generateVideoBatch = (count = 1) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    lines.push(generateChillHouseVideoPrompt());
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
};

// --- CLI HANDLING ---
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 10;

const output = generateVideoBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🌴 videos.js generated successfully (deep chill house prompts enabled)');
