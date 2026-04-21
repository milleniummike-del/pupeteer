/**
 * PromptForge: Photorealistic Wild Animal Dance Generator CLI
 * Focus: Viral, realistic clips of wild animals dancing in nightlife environments
 * Usage: node prompts_photorealistic_dance.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// WILD ANIMALS
// ---------------------------------------------------------
const ANIMALS = [
  'Lion',
  'Tiger',
  'Leopard',
  'Cheetah',
  'Elephant',
  'Gorilla',
  'Chimpanzee',
  'Orangutan',
  'Wolf',
  'Hyena',
  'Fox',
  'Brown Bear',
  'Polar Bear',
  'Panda',
  'Kangaroo',
  'Koala',
  'Sloth',
  'Zebra',
  'Giraffe',
  'Hippo',
  'Rhino',
  'Crocodile',
  'Alligator',
  'Flamingo',
  'Peacock',
  'Eagle',
  'Owl',
  'Penguin',
  'Seal',
  'Octopus'
];

// ---------------------------------------------------------
// DANCE BEHAVIORS (REALISTIC MOTION)
// ---------------------------------------------------------
const BEHAVIORS = [
  'moving rhythmically to loud electronic music with surprisingly natural body motion',
  'awkwardly attempting human dance movements while maintaining animal posture',
  'shifting weight and swaying to the beat under flashing lights',
  'making subtle but rhythmic movements reacting to bass vibrations',
  'energetically jumping and reacting to music drops',
  'mirroring nearby dancers with slightly off-timing movements',
  'reacting instinctively to sound and vibration in a dance-like motion',
  'moving unpredictably but in sync with the music energy',
  'performing repeated rhythmic motions that resemble dancing',
  'responding to crowd energy with heightened physical movement'
];

// ---------------------------------------------------------
// DANCE ENVIRONMENTS (REAL-WORLD)
// ---------------------------------------------------------
const LOCATIONS = [
  'a crowded nightclub with neon lights and dense fog',
  'an underground techno rave with strobe lighting',
  'a large outdoor music festival at night with stage lights',
  'a packed concert venue with flashing LEDs and smoke effects',
  'a retro disco dance floor with reflective surfaces',
  'a luxury VIP nightclub with laser lighting and dark ambiance',
  'a warehouse rave with industrial lighting and haze',
  'a beach party at sunset transitioning into night lighting',
  'a rooftop nightclub overlooking a realistic city skyline',
  'a massive EDM festival stage with thousands of people'
];

// ---------------------------------------------------------
// CROWD REACTIONS (REALISTIC)
// ---------------------------------------------------------
const REACTIONS = [
  'crowd members recording on smartphones with realistic motion blur',
  'people reacting with genuine surprise and stepping back',
  'nearby dancers watching and reacting naturally',
  'DJ briefly noticing and reacting while continuing performance',
  'crowd forming space around the animal instinctively',
  'subtle facial expressions of confusion and excitement',
  'people adjusting positions to avoid the animal',
  'security cautiously observing from a distance'
];

// ---------------------------------------------------------
// VIDEO STYLE (PHOTOREALISTIC)
// ---------------------------------------------------------
const STYLES = [
  'shot on handheld smartphone camera',
  'shallow depth of field with realistic focus falloff',
  'cinematic lighting with natural shadows',
  'low-light high ISO grain typical of nightlife footage',
  'lens flare from stage lighting',
  'motion blur during fast movement',
  'dynamic exposure shifts from flashing lights',
  'slight camera shake from handheld filming'
];

const CAMERA = [
  'captured on a 35mm lens',
  'captured on a 50mm lens',
  'wide angle lens with slight distortion',
  'close-up framing with background compression'
];

const ENHANCERS = [
  'ultra photorealistic textures',
  'high detail fur and skin rendering',
  'physically accurate lighting',
  'realistic environmental interaction',
  'natural color grading',
  'cinematic realism',
  'lifelike motion and physics'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------
const generatePhotorealisticDanceClips = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const animal = getRandom(ANIMALS);
    const behavior = getRandom(BEHAVIORS);
    const location = getRandom(LOCATIONS);
    const reaction = getRandom(REACTIONS);
    const styles = pickN(STYLES, 2).join(', ');
    const camera = getRandom(CAMERA);
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = \`Photorealistic video of a ${animal} inside ${location}, ${behavior}, surrounded by humans in a realistic nightlife setting, ${reaction}, ${styles}, ${camera}, with ${enh}, natural movement, believable anatomy, realistic physics, no cartoon style, real-world documentary footage feel\`;`
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

const output = generatePhotorealisticDanceClips(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🎬 Photorealistic videos.js generated successfully');