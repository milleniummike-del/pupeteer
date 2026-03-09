const fs = require('fs');

const MUSIC_GENRES = [
  'ambient electronic', 'orchestral cinematic', 'folk acoustic', 'jazz fusion',
  'classical chamber', 'experimental drone', 'world fusion', 'lo-fi hip hop',
  'indie pop', 'epic symphonic metal', 'bluesy folk', 'meditative soundscape'
];

const NATURE_ELEMENTS = [
  'dense rainforest canopy', 'vast open ocean', 'calm moonlit lake',
  'snowy mountain peak', 'sun-drenched desert', 'whispering bamboo forest',
  'crashing waterfall', 'gentle flowing river', 'blustery autumn woods',
  'ethereal misty valley', 'vibrant coral reef'
];

const ANIMALS = [
  'howler monkey', 'humpback whale', 'solitary wolf', 'majestic eagle',
  'playful dolphin', 'nocturnal owl', 'graceful deer', 'buzzing bees',
  'chattering squirrels', 'singing birds', 'croaking frogs', 'rustling snake'
];

const WILDLIFE_SCENES = [
  'a serene underwater world with slow-moving creatures',
  'a bustling forest floor at dawn as animals awaken',
  'the silent, watchful presence of a predator in tall grass',
  'a herd of wild horses galloping across plains',
  'birds migrating across vast skies',
  'the energetic dance of insects around a light',
  'a family of otters playing in a freshwater stream',
  'polar bears roaming an icy landscape',
  'a chameleon blending into its environment',
  'fireflies illuminating a summer night'
];

const INSTRUMENTS = [
  'flute and strings', 'piano and cello', 'acoustic guitar and subtle percussion',
  'synthesizer pads and bass', 'traditional tribal drums and wind instruments',
  'harp and ethereal vocals', 'upright bass and saxophone',
  'grand piano with orchestral backing', 'ukulele and light glockenspiel',
  'electric guitar with atmospheric effects'
];

const EMOTIONAL_TONES = [
  'peaceful and contemplative', 'mysterious and intriguing', 'powerful and awe-inspiring',
  'playful and whimsical', 'melancholic and reflective', 'energetic and vibrant',
  'calm and serene', 'wild and untamed', 'hopeful and uplifting', 'somber and introspective'
];

const SOUND_MODIFIERS = [
  'with rich natural reverb', 'sparse and echoing', 'dense and layered',
  'rhythmic and pulsating', 'flowing and continuous', 'sharp and percussive',
  'warm and inviting', 'chilling and atmospheric', 'bright and clear',
  'deep and resonant'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

const generateMusicPrompt = () => {
  const genre = getRandom(MUSIC_GENRES);
  const natureElement = getRandom(NATURE_ELEMENTS);
  const animal = getRandom(ANIMALS);
  const wildlifeScene = getRandom(WILDLIFE_SCENES);
  const instrument = getRandom(INSTRUMENTS);
  const emotionalTone = getRandom(EMOTIONAL_TONES);
  const soundModifiers = pickN(SOUND_MODIFIERS, 2).join(' and ');

  return `music.push(\`Generate a ${genre} track. The setting is a ${natureElement}, with the prominent sound of a ${animal}. The piece should evoke ${wildlifeScene}, featuring ${instrument}. The overall tone should be ${emotionalTone}, with a sound that is ${soundModifiers}.\`);`;
};

const generateMusicBatch = (count = 15) => {
  const lines = [];
  lines.push(`const music = [];`);

  for (let i = 0; i < count; i++) {
    lines.push(generateMusicPrompt());
  }

  lines.push(`module.exports = music;`);
  return lines.join('\n');
};

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 15;

const output = generateMusicBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🎶 music.js generated successfully (music prompts enabled)');
