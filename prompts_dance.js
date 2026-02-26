/**
 * PromptForge: Dance & Music Video Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node prompts_dance.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// DANCE & MUSIC VIDEO GROUPS DATASET
// ---------------------------------------------------------
const DANCE_GROUPS = [
  {
    label: 'Electronic & Rave',
    styles: [
      'Cyberpunk Shuffle', 'Liquid Glow-stick Dance', 'Industrial Techno Stepping', 
      'High-energy Hardstyle Kick-roll', 'Futuristic Robot Popping', 'Glitch-hop breakdance', 
      'Vogueing in a neon corridor', 'Acid House shuffling', 'Modern Melodic Techno flow', 
      'Euphoric Trance arm-work'
    ],
    actions: [
      'Performing a high-speed synchronized routine', 'Dancing amidst a shower of laser beams', 
      'Leaving light trails with every limb movement', 'Bathed in strobing strobe lights', 
      'Floating in a gravity-defying rave chamber', 'Surrounded by holographic EQ bars', 
      'Moving in slow motion as bass waves ripple through the air', 'Kicking up neon dust on a dark dancefloor',
      'Wearing LED-integrated techwear that pulses to the beat', 'Spinning rapidly in a circle of glowing rings'
    ],
    environments: [
      'An abandoned underground warehouse with heavy smoke', 'A futuristic rooftop overlooking a neon megacity', 
      'A virtual reality void with infinite geometric grids', 'A high-tech laboratory with pulsating plasma tubes', 
      'A dark club with a massive LED wall background', 'A desert salt flat under a giant holographic moon', 
      'A mirrored room reflecting endless dancers', 'An industrial engine room with sparking machinery', 
      'A cybernetic garden with glowing synthetic plants', 'A spaceship cargo bay with flickering red emergency lights'
    ],
  },

  {
    label: 'Pop & Commercial',
    styles: [
      'High-fashion Contemporary', 'Slick K-Pop choreography', 'Street Jazz fusion', 
      'Afrobeats rhythmic flow', 'Modern Hip-Hop freestyle', 'Glamorous Ballroom walking', 
      'Expressive Lyrical dance', 'Flashy Disco-revival stepping', 'Tik-Tok viral choreography', 
      'Latin-Pop salsa fusion'
    ],
    actions: [
      'Strutting down a literal runway of light', 'Performing in front of a wall of vintage televisions', 
      'Dancing in a rainfall of golden glitter', 'Surrounded by a troupe of perfectly synced backup dancers', 
      'Interacting with dynamic AR graphics floating in space', 'Changing outfits instantly through a jump-cut transition', 
      'Dancing inside a giant colorful Kaleidoscope', 'Performing on a stage that slowly fills with water', 
      'Engaging with the camera in a single-take long shot', 'Leaping through a series of brightly colored geometric frames'
    ],
    environments: [
      'A vibrant pastel-colored studio set', 'A luxury penthouse with floor-to-ceiling windows', 
      'A retro-futuristic 80s arcade', 'A minimalist white gallery with pop-art installations', 
      'A sun-drenched tropical beach club', 'A high-fashion magazine cover shoot set', 
      'A colorful urban playground with graffiti murals', 'A grand theater with velvet curtains and gold trim', 
      'A dreamlike clouds-and-stars stage', 'A stylized subway station with pink neon lighting'
    ],
  },

  {
    label: 'Experimental & Abstract',
    styles: [
      'Butoh-inspired avant-garde', 'Interpretive fluid movement', 'Staccato glitch dancing', 
      'Contortionist-style flexibility', 'Shadow-play silhouette dance', 'Digital avatar motion-capture flow', 
      'Slow-burn minimal movement', 'Weightless orbital spinning'
    ],
    actions: [
      'Transforming into liquid mercury while moving', 'Dissolving into a cloud of digital particles', 
      'Dancing with a physical projection of their own shadow', 'Moving through a sea of hanging silk ribbons', 
      'Tangled in glowing fiber-optic cables', 'Painting the air with streaks of colored smoke', 
      'Shattering like glass and reforming mid-leap', 'Emerging from a pool of black ink', 
      'Generating ripples in a 3D soundscape', 'Floating through a nebula of abstract shapes'
    ],
    environments: [
      'A pitch-black void with a single spotlight', 'A surreal landscape of melting clocks and floating stairs', 
      'An underwater chamber with heavy blue lighting', 'The inside of a giant pulsating heart', 
      'A forest of crystalline pillars', 'A dimension of shifting tectonic plates', 
      'A white-out blizzard of digital data', 'A chamber of infinite echoing portals', 
      'A nebula of swirling cosmic dust', 'A world made entirely of fabric and thread'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Aggressive pink and teal neon bi-lighting',
  'Moody silhouette lighting with a strong rim light',
  'Dynamic strobe flashes synchronized to an invisible beat',
  'Warm golden hour glow through a hazy window',
  'Cool cinematic blue wash with deep shadows',
  'Rainbow prismatic refraction through glass prisms',
  'Harsh industrial top-down spotlight',
  'Soft pastel dream-pop gradients',
  'Flickering CRT monitor glow',
  'Bioluminescent pulses from the floor',
  'Laser arrays cutting through heavy theatrical fog',
  'Ultraviolet blacklight making clothes glow',
  'High-contrast black and white noir lighting'
];

const MODIFIERS = [
  'Music video aesthetic', 'Shot on 35mm film', 'Anamorphic lens flares',
  'Fish-eye lens distortion', 'Gopro-style POV action', 'Hyper-lapse motion blur',
  'Grainy VHS texture', 'Slick high-gloss commercial look', 'Rapid-fire editing style',
  'Handheld camera shakiness', 'Steady-cam smooth tracking', 'Color-blocked palette',
  'Over-saturated vibrant colors'
];

const ENHANCERS = [
  '4K resolution', 'Vevo-style production quality', 'Stunning visual effects',
  'Professional color grading', 'Volumetric fog and light', 'Masterpiece composition',
  'Award-winning cinematography', 'High-end CGI integration'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateDanceBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(DANCE_GROUPS);
    const style = getRandom(group.styles);
    const action = getRandom(group.actions);
    const env = getRandom(group.environments);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      "videos[" + i + "] = `- THEME: Dance/Music Video - STYLE: " + style + " - ACTION: " + action + " - ENVIRONMENT: " + env + " - LIGHTING: " + light + " - MODIFIERS: " + mods + " - ENHANCERS: " + enh + "`;"
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

const output = generateDanceBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with dance/music video prompts (UTF‑8 safe)');
