/**
 * PromptForge: Historical + Futuristic People Generator CLI
 * Usage: node prompts_people.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// PEOPLE GROUPS ACROSS HISTORY & FUTURE
// ---------------------------------------------------------
const PEOPLE_GROUPS = [
  // PREHISTORIC
  {
    label: 'Prehistoric',
    species: [
      'Cro-Magnon hunters', 'Neanderthal tribe members', 'Early Homo sapiens',
      'Homo erectus foragers', 'Ice Age hunters', 'Mesolithic gatherers',
      'Primitive tool artisans', 'Tribal healers', 'Nomadic fire-keepers'
    ],
    behaviors: [
      'Tracking a herd of mammoths across a tundra', 'Knapping flint tools beside a fire',
      'Painting symbols deep inside a cave', 'Gathering roots and berries',
      'Teaching children how to use a spear', 'Preparing hides for clothing',
      'Constructing a shelter from branches and bones'
    ],
    habitats: [
      'Snowy glacial plains', 'Dense pine forests', 'Rocky cave shelters',
      'Open steppe grasslands', 'River valleys with limestone cliffs',
      'Ancient volcanic plains'
    ],
  },

  // ANCIENT CIVILIZATIONS
  {
    label: 'Ancient Civilizations',
    species: [
      'Egyptian scribes', 'Roman legionaries', 'Greek philosophers',
      'Babylonian astronomers', 'Mayan priests', 'Han dynasty farmers',
      'Phoenician traders', 'Persian archers', 'Nubian artisans'
    ],
    behaviors: [
      'Carving hieroglyphs into stone tablets', 'Marching in tight formation',
      'Debating ethics in an open-air forum', 'Charting the movement of stars',
      'Performing a sacred ritual', 'Harvesting rice in terraced fields',
      'Trading goods across desert routes', 'Crafting bronze tools'
    ],
    habitats: [
      'Bustling ancient marketplaces', 'Grand marble temples',
      'Desert pyramids under scorching sun', 'Stone amphitheaters',
      'Jungle-covered temple complexes', 'Terraced farmlands',
      'River harbors filled with wooden ships'
    ],
  },

  // MEDIEVAL ERA
  {
    label: 'Medieval',
    species: [
      'Knights in armor', 'Peasant farmers', 'Monks in scriptoria',
      'Viking raiders', 'Medieval merchants', 'Castle guards',
      'Apothecaries', 'Traveling bards', 'Master blacksmiths'
    ],
    behaviors: [
      'Copying illuminated manuscripts', 'Training with swords in a courtyard',
      'Tending livestock in a muddy field', 'Sailing longships across rough seas',
      'Trading goods along a caravan route', 'Standing watch atop castle walls',
      'Brewing herbal remedies', 'Performing songs in a tavern'
    ],
    habitats: [
      'Stone castles surrounded by moats', 'Foggy medieval villages',
      'Monastery libraries lit by candles', 'Windy coastal fjords',
      'Crowded market squares', 'Rolling green farmlands',
      'Wooden workshops filled with tools'
    ],
  },

  // EARLY MODERN (RENAISSANCE–1800s)
  {
    label: 'Early Modern',
    species: [
      'Renaissance painters', 'Sailors of the Age of Exploration',
      'Blacksmiths', 'Court musicians', 'Enlightenment scientists',
      'Industrial-era factory workers', 'Clockmakers', 'Cartographers',
      'Steam-engine engineers'
    ],
    behaviors: [
      'Mixing pigments for a fresco', 'Charting new sea routes',
      'Forging iron tools on an anvil', 'Performing in a royal court',
      'Studying natural philosophy', 'Operating early steam machinery',
      'Drafting detailed maps', 'Repairing intricate clockwork'
    ],
    habitats: [
      'Renaissance workshops', 'Tall wooden sailing ships',
      'Bustling port cities', 'Lavish palace halls',
      'Candlelit laboratories', 'Smoky industrial foundries',
      'Early railway stations'
    ],
  },

  // MODERN & CONTEMPORARY
  {
    label: 'Modern',
    species: [
      'Urban commuters', 'Scientists in laboratories', 'Construction workers',
      'Artists in studios', 'Athletes in training', 'Photographers on assignment',
      'Software developers', 'Medical professionals', 'Aerospace engineers',
      'Environmental researchers', 'Robotics technicians'
    ],
    behaviors: [
      'Rushing to catch a train', 'Analyzing samples under a microscope',
      'Welding steel beams', 'Sketching on a large canvas',
      'Practicing on a running track', 'Capturing street photography',
      'Writing code on multiple monitors', 'Performing surgery',
      'Testing components in a wind tunnel', 'Collecting climate data in the field'
    ],
    habitats: [
      'Skyscraper-filled cityscapes', 'High-tech research labs',
      'Busy construction sites', 'Modern art studios',
      'Sports stadiums', 'Urban parks at sunrise',
      'Hospital operating rooms', 'Aerospace testing facilities',
      'Robotics workshops'
    ],
  },

  // FUTURISTIC ERAS
  {
    label: 'Futuristic',
    species: [
      'Mars colonists', 'Cybernetic engineers', 'AI ethicists',
      'Starship navigators', 'Quantum technicians', 'Terraforming specialists',
      'Hologram architects', 'Zero‑gravity athletes', 'Galactic diplomats',
      'Asteroid miners', 'Nanotech surgeons'
    ],
    behaviors: [
      'Repairing a rover on the Martian surface', 'Designing cybernetic implants',
      'Debating AI rights in a virtual forum', 'Navigating a starship through nebulae',
      'Calibrating quantum processors', 'Shaping atmospheric generators',
      'Constructing holographic environments', 'Training in zero‑gravity arenas',
      'Negotiating peace between off‑world colonies', 'Extracting minerals from asteroids'
    ],
    habitats: [
      'Pressurized Mars domes', 'Neon-lit cyber cities', 'Orbital research stations',
      'Deep‑space starships', 'Terraforming outposts', 'Virtual reality megastructures',
      'Floating cloud cities', 'Asteroid mining colonies', 'Quantum computing chambers'
    ],
  }
];

// ---------------------------------------------------------
// LIGHTING, MODIFIERS, ENHANCERS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour sunlight', 'Soft morning mist', 'Harsh desert midday sun',
  'Candlelit interiors', 'Torchlight flickering on stone walls',
  'Blue twilight glow', 'Overcast diffused daylight',
  'Neon reflections on wet pavement', 'Industrial floodlights',
  'Moonlight casting long shadows', 'Bioluminescent futuristic glow',
  'Holographic ambient lighting'
];

const MODIFIERS = [
  'National Geographic documentary style', 'Cinematic 35mm film grain',
  'Wide-angle dramatic composition', 'Handheld realism',
  'Hyper-detailed textures', 'Historical authenticity',
  'Low-angle heroic framing', 'Soft portrait-style focus',
  'Dynamic action framing', 'Aerial sweeping perspective',
  'Futuristic sci-fi aesthetic', 'High-contrast cyberpunk palette'
];

const ENHANCERS = [
  '8K resolution', 'masterpiece quality', 'highly detailed models',
  'volumetric lighting', 'professional color grading',
  'photorealistic rendering', 'award-winning cinematography',
  'ultra‑realistic atmospheric effects'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generatePeopleBatch = (count = 20) => {
  const lines = [];
  lines.push('const videos = [];');

  for (let i = 0; i < count; i++) {
    const group = getRandom(PEOPLE_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = "- SUBJECT: ${spec} - ACTIVITY: ${bhv} - ENVIRONMENT: ${hab} - LIGHTING: ${light} - STYLE: ${mods} - QUALITY: ${enh}";`
    );
  }

  lines.push('module.exports = videos;');
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generatePeopleBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with historical + futuristic people (UTF-8 safe)');
