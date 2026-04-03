/**
 * PromptForge: City Landmark Flyover Generator
 * Usage: node drone-travel.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ICONIC MAN-MADE LANDMARKS (CITY-FOCUSED)
// ---------------------------------------------------------

const LANDMARKS = [
  'Eiffel Tower, Paris, France',
  'Louvre Museum, Paris, France',
  'Colosseum, Rome, Italy',
  'St. Peter’s Basilica, Vatican City',
  'Big Ben and Houses of Parliament, London, UK',
  'Tower Bridge, London, UK',
  'Sagrada Familia, Barcelona, Spain',
  'Acropolis, Athens, Greece',
  'Brandenburg Gate, Berlin, Germany',
  'Neuschwanstein Castle, Germany',

  'Burj Khalifa, Dubai, UAE',
  'Sheikh Zayed Grand Mosque, Abu Dhabi, UAE',
  'Petronas Towers, Kuala Lumpur, Malaysia',
  'Marina Bay Sands, Singapore',
  'Great Wall near Beijing, China',
  'Forbidden City, Beijing, China',
  'Tokyo Skytree, Tokyo, Japan',
  'Shibuya Crossing, Tokyo, Japan',
  'Taj Mahal, Agra, India',

  'Statue of Liberty, New York City, USA',
  'Empire State Building, New York City, USA',
  'Central Park skyline, New York City, USA',
  'Golden Gate Bridge, San Francisco, USA',
  'Hollywood Sign, Los Angeles, USA',
  'Las Vegas Strip, Las Vegas, USA',

  'Christ the Redeemer, Rio de Janeiro, Brazil',
  'Machu Picchu, Peru',
  'Chichen Itza pyramid, Mexico',

  'Sydney Opera House, Sydney, Australia',
  'Harbour Bridge, Sydney, Australia',

  'Table Mountain cableway, Cape Town, South Africa',
  'Pyramids of Giza, Egypt'
];

// ---------------------------------------------------------
// FLIGHT / CAMERA STYLE (FLYOVER-FOCUSED)
// ---------------------------------------------------------

const CAMERA_STYLE = [
  'low sweeping drone flyover',
  'high-altitude cinematic flyover',
  'forward drone glide directly over landmark',
  'smooth aerial pass above structure',
  'top-down vertical flyover reveal',
  'slow rising flyover from street level to skyline',
  'wide cinematic pass across skyline and landmark'
];

// ---------------------------------------------------------
// ENVIRONMENT + ATMOSPHERE
// ---------------------------------------------------------

const TIME_OF_DAY = [
  'golden hour sunset',
  'soft sunrise light',
  'blue hour twilight',
  'bright midday clarity',
  'night city lights glowing'
];

const MOTION = [
  'traffic flowing through surrounding streets',
  'people moving like tiny figures below',
  'city lights flickering on',
  'clouds drifting above skyline',
  'soft atmospheric haze over buildings',
  'sunlight reflecting off glass structures'
];

const MOOD = [
  'epic cinematic scale',
  'awe-inspiring urban grandeur',
  'dreamlike travel atmosphere',
  'majestic architectural beauty',
  'immersive city exploration feeling'
];

const VISUALS = [
  'ultra high resolution',
  'cinematic color grading',
  'volumetric lighting',
  'high dynamic range',
  'realistic shadows',
  'soft atmospheric haze'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------

const generateDroneBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    const landmark = getRandom(LANDMARKS);
    const cam = pickN(CAMERA_STYLE, 2).join(', ');
    const time = getRandom(TIME_OF_DAY);
    const motion = getRandom(MOTION);
    const mood = getRandom(MOOD);
    const visuals = pickN(VISUALS, 3).join(', ');

    batch.push(
      `videos[${i}] = \`FLYOVER: ${landmark} - TIME: ${time} - CAMERA: ${cam} - MOTION: ${motion} - MOOD: ${mood} - VISUAL STYLE: ${visuals}\`;`
    );
  }

  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateDroneBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🏙️ City landmark flyover prompts generated successfully');