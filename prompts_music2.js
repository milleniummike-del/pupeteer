/**
 * PromptForge: Cinematic Music Prompt Generator
 * Pairs with drone/action generators
 */

const fs = require('fs');

// ---------------------------------------------------------
// CORE MUSICAL DIMENSIONS
// ---------------------------------------------------------

const GENRES = [
  'epic orchestral',
  'hybrid cinematic (orchestra + synth)',
  'dark ambient',
  'electronic cinematic',
  'trailer music',
  'industrial',
  'cyberpunk synthwave',
  'minimal piano with atmosphere'
];

const MOODS = [
  'intense and adrenaline-fueled',
  'dark and ominous',
  'uplifting and heroic',
  'tense and suspenseful',
  'mysterious and atmospheric',
  'melancholic and emotional',
  'epic and awe-inspiring'
];

const ENERGY = [
  'slow build intro leading to powerful climax',
  'immediate high-energy impact',
  'gradual tension with rhythmic pulses',
  'explosive drops with dynamic transitions',
  'steady driving momentum'
];

// ---------------------------------------------------------
// INSTRUMENTATION
// ---------------------------------------------------------

const INSTRUMENTS = [
  'deep cinematic drums and percussion',
  'booming bass hits and impacts',
  'string orchestra with rising tension',
  'braams and trailer hits',
  'synth arpeggios and pulsing basslines',
  'distorted electronic textures',
  'choir vocals for epic scale',
  'solo piano with ambient pads',
  'electric guitar for aggressive tone'
];

// ---------------------------------------------------------
// RHYTHM / TEMPO
// ---------------------------------------------------------

const TEMPO = [
  'slow tempo (60-80 BPM)',
  'moderate tempo (90-110 BPM)',
  'fast-paced (120-140 BPM)',
  'very fast and aggressive (140+ BPM)'
];

const RHYTHM = [
  'syncopated percussion patterns',
  'steady driving beat',
  'pulsing rhythmic patterns',
  'irregular tension-building hits',
  'rapid hi-hat sequences'
];

// ---------------------------------------------------------
// STRUCTURE / CINEMATIC FLOW
// ---------------------------------------------------------

const STRUCTURE = [
  'intro → build → climax → cinematic finish',
  'ambient intro → sudden drop → aggressive section',
  'gradual layering of instruments leading to peak',
  'repeating motif with evolving intensity',
  'quiet tension → explosive payoff'
];

// ---------------------------------------------------------
// TEXTURE / SOUND DESIGN
// ---------------------------------------------------------

const TEXTURES = [
  'cinematic risers and impacts',
  'atmospheric drones and pads',
  'reverb-heavy soundscapes',
  'distorted transitions and glitches',
  'deep sub-bass rumble',
  'whooshes and reverse effects'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------

const generateMusicBatch = (count = 20) => {
  const batch = [];
  batch.push(`const music = [];`);

  for (let i = 0; i < count; i++) {
    const genre = getRandom(GENRES);
    const mood = getRandom(MOODS);
    const energy = getRandom(ENERGY);
    const tempo = getRandom(TEMPO);
    const rhythm = getRandom(RHYTHM);
    const structure = getRandom(STRUCTURE);
    const instruments = pickN(INSTRUMENTS, 3).join(', ');
    const textures = pickN(TEXTURES, 2).join(', ');

    batch.push(
      `music[${i}] = \`STYLE: ${genre} - MOOD: ${mood} - ENERGY: ${energy} - TEMPO: ${tempo} - RHYTHM: ${rhythm} - INSTRUMENTS: ${instruments} - STRUCTURE: ${structure} - SOUND DESIGN: ${textures}\`;`
    );
  }

  batch.push(`module.exports = music;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateMusicBatch(count);

fs.writeFileSync('music-prompts.js', output, { encoding: 'utf8' });

console.log('🎧 music-prompts.js generated (cinematic scoring mode)');