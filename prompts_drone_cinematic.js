
/**
 * PromptForge: Aerial Drone & Landmark Generator CLI
 * Specializing in cinematic aerial landscapes, famous landmarks,
 * castles, coastlines, mountains, cities and architectural wonders.
 *
 * Usage: node prompts_drone_landscapes.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// LANDSCAPE & LANDMARK GROUPS
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Famous Global Landmarks',
    species: [
      'Eiffel Tower rising above Paris, France',
      'Colosseum surrounded by historic Rome, Italy',
      'Taj Mahal beside the Yamuna River, India',
      'Great Wall of China winding across mountain ridges',
      'Pyramids of Giza rising from the Egyptian desert',
      'Statue of Liberty overlooking New York Harbor',
      'Machu Picchu among mist-covered Peruvian mountains',
      'Christ the Redeemer overlooking Rio de Janeiro',
      'Sydney Opera House beside the sparkling harbor',
      'Petra Treasury carved into rose-red sandstone cliffs',
      'Angkor Wat surrounded by tropical Cambodian jungle',
      'Mount Fuji towering above the Japanese countryside',
      'Acropolis of Athens above the ancient city',
      'Burj Khalifa rising above the Dubai skyline',
      'Neuschwanstein Castle among the Bavarian Alps',
      'Sagrada Familia surrounded by Barcelona',
      'Golden Gate Bridge spanning San Francisco Bay',
      'Santorini whitewashed buildings above the Aegean Sea',
      'Tower Bridge crossing the River Thames in London',
      'Chichen Itza rising above the Yucatan jungle'
    ],
    behaviors: [
      'slowly revealing the landmark from behind a foreground ridge',
      'circling the architecture in a smooth cinematic orbit',
      'ascending gradually to reveal the full surrounding landscape',
      'flying toward the landmark from a distant establishing position',
      'gliding laterally to reveal the structure against the horizon',
      'pulling backward to reveal the vast landscape surrounding the landmark'
    ],
    habitats: [
      'authentic surrounding geography and natural terrain',
      'expansive panoramic landscape with distant atmospheric haze',
      'historic surroundings with realistic architectural details',
      'natural terrain stretching toward the distant horizon',
      'environment with realistic scale and geographical features'
    ]
  },

  {
    label: 'Castles, Palaces & Historic Architecture',
    species: [
      'medieval castle perched on a dramatic rocky outcrop',
      'fairytale stone castle overlooking a forested valley',
      'ancient fortress surrounded by towering defensive walls',
      'Gothic cathedral rising above a historic European town',
      'ornate royal palace surrounded by formal gardens',
      'hilltop citadel overlooking a sprawling medieval settlement',
      'Romanesque monastery surrounded by rolling countryside',
      'fortified coastal castle above crashing ocean waves',
      'ancient temple complex hidden in dense tropical jungle',
      'medieval walled city with towers and narrow stone streets',
      'dramatic mountaintop monastery surrounded by clouds',
      'Renaissance palace beside a winding river'
    ],
    behaviors: [
      'performing a slow ascending reveal above the castle walls',
      'orbiting the entire structure while maintaining a consistent altitude',
      'approaching through a broad valley toward the main entrance',
      'tracking sideways along the outer walls and defensive towers',
      'rising from the forest canopy to reveal the entire complex',
      'pulling away from the main tower to expose the surrounding terrain'
    ],
    habitats: [
      'rolling green hills and patchwork countryside',
      'dense ancient woodland and misty valleys',
      'dramatic mountain peaks and rocky cliffs',
      'winding rivers and historic agricultural landscapes',
      'rugged coastal cliffs and open sea',
      'expansive gardens and mature woodland'
    ]
  },

  {
    label: 'Mountains, Valleys & Highlands',
    species: [
      'towering snow-covered Alpine mountain range',
      'dramatic Dolomites limestone peaks above green valleys',
      'rugged Scottish Highlands with isolated mountain lochs',
      'Himalayan peaks rising above immense cloud formations',
      'Grand Canyon carved into layered red rock',
      'Yosemite Valley surrounded by immense granite cliffs',
      'Patagonian mountains reflected in glacial lakes',
      'Icelandic volcanic mountains and black sand plains',
      'Swiss mountain villages surrounded by steep alpine slopes',
      'vast Andean mountain ridges disappearing into the distance',
      'rocky desert mountains with winding canyon formations',
      'emerald valleys surrounded by ancient mountain forests'
    ],
    behaviors: [
      'flying forward through a broad mountain valley',
      'ascending above a ridge to reveal successive mountain ranges',
      'gliding parallel to a dramatic cliff face',
      'pulling back from a foreground peak to reveal immense scale',
      'tracking above a winding river between mountain slopes',
      'flying smoothly over the ridge line and descending into the valley',
      'revealing a hidden alpine lake from behind a rocky outcrop'
    ],
    habitats: [
      'vast wilderness with realistic geological formations',
      'layered mountain ranges fading into atmospheric haze',
      'glacial lakes, rocky slopes and snow-covered summits',
      'dense evergreen forests below towering peaks',
      'remote highlands with dramatic elevation changes'
    ]
  },

  {
    label: 'Coastlines, Islands & Oceans',
    species: [
      'dramatic Algarve sea cliffs above turquoise Atlantic water',
      'Amalfi Coast villages clinging to steep coastal mountains',
      'tropical island surrounded by vivid turquoise lagoons',
      'Norwegian fjord cutting between immense rocky mountains',
      'Greek island cliffs overlooking the deep blue Aegean Sea',
      'tropical coral atoll surrounded by brilliant ocean gradients',
      'rugged Irish coastline with green headlands',
      'white limestone cliffs above a wild blue ocean',
      'remote volcanic island surrounded by crashing waves',
      'Caribbean harbor filled with colorful coastal architecture',
      'towering sea stacks rising from a misty coastline',
      'vast sandy beach bordered by tropical palm forests',
      'dramatic Cape coastline with waves breaking against rocks',
      'remote Pacific island with lush mountains and hidden coves'
    ],
    behaviors: [
      'tracking parallel to the coastline above the water',
      'flying low over the ocean before climbing toward the cliffs',
      'orbiting a prominent sea stack with the horizon in view',
      'pulling backward from a coastal village to reveal the bay',
      'following the curve of a beach in a smooth sweeping movement',
      'ascending from the shoreline to reveal a hidden lagoon',
      'gliding forward above waves toward a distant island'
    ],
    habitats: [
      'clear ocean water with visible underwater color gradients',
      'rugged coastal terrain with natural erosion patterns',
      'lush coastal vegetation and steep green hills',
      'sunlit cliffs with deep blue water below',
      'remote islands surrounded by open ocean',
      'dramatic headlands with sea mist and breaking surf'
    ]
  },

  {
    label: 'Forests, Jungles & Wilderness',
    species: [
      'vast Amazon rainforest stretching to the horizon',
      'dense tropical rainforest surrounding a winding river',
      'mist-covered Borneo jungle with layered green canopy',
      'ancient redwood forest with towering trees',
      'Canadian wilderness with lakes and evergreen forests',
      'vast African rainforest with rolling forested hills',
      'remote temperate rainforest beneath low clouds',
      'autumn woodland with colorful tree canopies',
      'dense Scandinavian forest surrounding a pristine lake',
      'tropical jungle mountains with cascading waterfalls',
      'isolated wilderness valley filled with morning fog',
      'vast green forest canopy broken by a winding river'
    ],
    behaviors: [
      'flying above the canopy in a slow forward tracking shot',
      'rising vertically to reveal the immense forest expanse',
      'following a river as it winds through dense vegetation',
      'gliding above the treetops toward distant mountains',
      'pulling upward from a forest clearing to reveal the surrounding wilderness',
      'moving forward through a broad opening between forested ridges'
    ],
    habitats: [
      'dense layers of vegetation and realistic canopy textures',
      'misty valleys with natural rivers and clearings',
      'remote wilderness with no visible modern infrastructure',
      'towering trees and lush undisturbed terrain',
      'mountain forests fading into the distant atmosphere'
    ]
  },

  {
    label: 'Deserts, Canyons & Arid Landscapes',
    species: [
      'towering sandstone formations in Monument Valley',
      'vast Sahara dunes stretching across the horizon',
      'Wadi Rum desert with monumental red rock mountains',
      'Antelope Canyon with sculpted sandstone walls',
      'Atacama Desert with salt flats and distant volcanoes',
      'Namib Desert dunes meeting the Atlantic coast',
      'dramatic red sandstone canyons in the American Southwest',
      'ancient desert oasis surrounded by barren mountains',
      'vast rocky Arabian desert with winding natural valleys',
      'white salt flats reflecting the sky',
      'remote desert plateau with towering rock formations',
      'golden dunes surrounding a secluded desert valley'
    ],
    behaviors: [
      'flying low over dune ridges before ascending to a wide panorama',
      'tracking above the edge of a deep sandstone canyon',
      'circling a monumental rock formation with a wide orbit',
      'rising above the dunes to reveal repeating sand patterns',
      'following a winding desert valley toward distant mountains',
      'pulling backward from a cliff edge to reveal the vast desert'
    ],
    habitats: [
      'vast arid terrain with realistic sand and rock textures',
      'layered sandstone formations and deep natural shadows',
      'remote desert wilderness with immense open horizons',
      'windswept dunes with naturally occurring ripples',
      'rocky plateaus and distant heat haze'
    ]
  },

  {
    label: 'Cities, Skylines & Urban Landscapes',
    species: [
      'New York City skyline surrounding Manhattan',
      'Tokyo skyline with dense urban districts',
      'Paris rooftops and the Seine River at sunset',
      'London skyline with the River Thames',
      'Hong Kong skyscrapers backed by green mountains',
      'Dubai skyline rising from the desert coastline',
      'Singapore skyline surrounded by tropical greenery',
      'Rio de Janeiro between mountains and the Atlantic Ocean',
      'Venice canals and historic buildings from above',
      'Istanbul skyline with historic domes and the Bosphorus',
      'Prague historic rooftops surrounding the old town',
      'Barcelona city blocks beside the Mediterranean coast',
      'Cape Town skyline beneath Table Mountain',
      'Lisbon rooftops cascading toward the Tagus River'
    ],
    behaviors: [
      'flying forward toward the skyline from a distant vantage point',
      'performing a smooth lateral reveal across the city',
      'ascending above the rooftops to expose the complete cityscape',
      'tracking along the river through the urban landscape',
      'pulling backward to reveal the skyline against surrounding mountains',
      'performing a broad cinematic orbit around a distinctive skyline'
    ],
    habitats: [
      'realistic city geometry and geographically appropriate surroundings',
      'dense historic districts beside modern architecture',
      'urban waterfronts with natural reflections',
      'expansive skylines with atmospheric depth',
      'cities integrated with surrounding hills, rivers or coastlines'
    ]
  },

  {
    label: 'Lakes, Rivers & Waterfalls',
    species: [
      'Iguazu Falls cascading through tropical rainforest',
      'Victoria Falls surrounded by lush African wilderness',
      'Niagara Falls with immense flowing water and mist',
      'Plitvice Lakes connected by cascading waterfalls',
      'Lake Como surrounded by Italian mountain villages',
      'Lake Louise beneath towering Canadian Rockies',
      'Milford Sound with waterfalls and steep fjord walls',
      'a winding river crossing a broad green valley',
      'a turquoise glacial river flowing through rocky terrain',
      'a remote mountain lake surrounded by dense pine forest',
      'a massive waterfall plunging from a jungle plateau',
      'a broad river delta spreading into the ocean'
    ],
    behaviors: [
      'following the watercourse in a smooth forward aerial shot',
      'ascending above the waterfall to reveal the surrounding landscape',
      'tracking along the river bends from a high oblique angle',
      'pulling away from the shoreline to reveal the entire lake',
      'orbiting a waterfall basin while maintaining a safe distance',
      'flying forward over the water toward distant mountains',
      'revealing a river delta with a gradual climb'
    ],
    habitats: [
      'natural water reflections and realistic flowing water',
      'lush riverbanks and layered forested hills',
      'rugged cliffs with drifting water mist',
      'glacial terrain with clear blue-green water',
      'remote lakes and expansive natural wilderness'
    ]
  }
];

// ---------------------------------------------------------
// CINEMATIC DRONE SHOT APPROACHES
// ---------------------------------------------------------
const DRONE_SHOTS = [
  'Aerial establishing shot: begin high and wide, slowly advancing to reveal the entire landscape',
  'Cinematic push-in: fly smoothly forward toward the main subject with controlled acceleration',
  'Slow pull-back reveal: retreat from the subject to expose the immense surrounding environment',
  'Ascending reveal: rise steadily from a lower altitude to unveil the full panorama',
  'Descending reveal: begin above the scene and gently descend toward the main subject',
  'Orbit shot: perform a smooth 180-degree orbit around the landmark while keeping it centered',
  'Full orbit: circle the main subject in a controlled 360-degree aerial movement',
  'Lateral tracking shot: glide sideways to reveal depth, foreground details and distant scenery',
  'Parallax reveal: move laterally past a foreground feature to uncover the distant landmark',
  'Flyover shot: cross directly above the main subject, revealing its shape and surrounding terrain',
  'Top-down overhead: maintain a vertical bird’s-eye view while drifting smoothly over the landscape',
  'High oblique aerial: capture the landscape from a diagonal elevated angle with deep perspective',
  'FPV-style cinematic dive: perform a controlled descent toward an open natural valley, avoiding obstacles',
  'FPV-style valley flight: follow a wide open valley with fluid forward motion and realistic turns',
  'Reveal from behind a ridge: move forward and upward until the entire landscape emerges',
  'Reveal from behind a cliff: rise carefully above the cliff edge to expose the coastline beyond',
  'Reverse reveal: start close to a distinctive feature and steadily pull back into a wide establishing shot',
  'Crane-up movement: rise vertically while gently tilting down to reveal the environment',
  'Crane-down movement: descend smoothly while tilting up to emphasize the scale of a landmark',
  'Diagonal approach: advance diagonally toward the subject while maintaining a cinematic composition',
  'S-curve flight: follow a gentle S-shaped path through open terrain toward the main subject',
  'Coastal tracking: follow the coastline parallel to the shore with the ocean filling the background',
  'River-following shot: track the natural curves of a river from above',
  'Mountain ridge run: glide parallel to a ridge with the valley and peaks visible beyond',
  'Slow panoramic sweep: rotate smoothly across the horizon to reveal the complete landscape',
  'Orbit and rise: circle the subject while gradually increasing altitude for a dramatic reveal',
  'Orbit and pull away: circle the landmark, then smoothly retreat into a wide aerial composition',
  'Low-to-high transition: begin above open ground or water and rise into a broad panoramic view',
  'Forward fly-through: travel through a wide, unobstructed natural opening toward the landscape beyond',
  'Static aerial hover: hold a stable elevated viewpoint with only subtle natural environmental motion',
  'Diagonal pull-out: move backward and sideways to reveal the relationship between foreground and background',
  'Hyperlapse-style aerial progression: simulate a smooth accelerated journey across the landscape',
  'Wide sweeping arc: travel in a broad curved path around the subject with a steady horizon',
  'Distant telephoto-style aerial: compress layers of mountains and the landmark into a dramatic composition',
  'Descending coastal approach: gradually lower toward an open shoreline while keeping the horizon stable',
  'High-altitude reveal: begin with an expansive overhead view and gently descend toward the focal subject'
];

// ---------------------------------------------------------
// LIGHTING & WEATHER
// ---------------------------------------------------------
const LIGHTING = [
  'warm golden-hour sunlight with long natural shadows',
  'soft sunrise light with delicate atmospheric haze',
  'dramatic sunset light illuminating the landscape in amber tones',
  'blue-hour twilight with realistic city and architectural lights',
  'bright natural daylight with accurate colors and clear visibility',
  'overcast cinematic light with soft shadows and muted contrast',
  'misty dawn with atmospheric depth between distant landscape layers',
  'sunlight breaking through clouds onto the landscape',
  'dramatic storm clouds with shafts of sunlight illuminating the terrain',
  'soft morning mist drifting through valleys',
  'clear midday light revealing detailed terrain and architecture',
  'warm late-afternoon light grazing mountain ridges',
  'subtle post-rain atmosphere with reflective surfaces',
  'thin clouds casting natural moving shadows across the landscape',
  'twilight glow beneath a dramatic cloud-filled sky',
  'soft winter sunlight illuminating snow-covered terrain',
  'hazy tropical sunlight above a lush green landscape',
  'moonlit landscape with realistic low-light exposure'
];

// ---------------------------------------------------------
// CAMERA & MOVEMENT QUALITY
// ---------------------------------------------------------
const CAMERA_MODIFIERS = [
  'smooth stabilized drone footage',
  'slow cinematic camera movement',
  'realistic aerial perspective and natural parallax',
  'wide-angle aerial composition',
  'high oblique drone perspective',
  'vertical overhead composition',
  'wide establishing shot with a deep horizon',
  'precise gimbal stabilization and controlled turns',
  'gradual acceleration and deceleration',
  'natural motion blur consistent with camera movement',
  'realistic altitude and believable flight paths',
  'strong foreground-to-background depth',
  'layered atmospheric perspective',
  'wide sweeping cinematic composition',
  'steady horizon with fluid camera transitions',
  'continuous single-take aerial cinematography',
  'realistic geographical scale and terrain detail',
  'natural perspective without exaggerated distortion',
  'subtle parallax between foreground and distant scenery',
  'controlled camera banking during wide turns',
  'smooth horizon reveal',
  'carefully composed leading lines',
  'clear landmark silhouette against the background',
  'natural depth of field appropriate for aerial footage'
];

// ---------------------------------------------------------
// VISUAL ENHANCERS
// ---------------------------------------------------------
const ENHANCERS = [
  'photorealistic landscape textures',
  'cinematic color grading',
  'natural atmospheric perspective',
  'highly detailed terrain and architecture',
  'realistic water reflections',
  'physically plausible sunlight and shadows',
  'natural cloud formations',
  'immersive sense of scale',
  'realistic environmental detail',
  'rich but natural landscape colors',
  'documentary-quality aerial cinematography',
  'subtle atmospheric haze',
  'realistic vegetation and geological formations',
  'crisp architectural details',
  'balanced cinematic contrast',
  'lifelike cloud and mist movement',
  'realistic ocean waves and coastline detail',
  'accurate natural colors without excessive saturation',
  'cohesive cinematic composition',
  'believable geographical features',
  'natural highlight roll-off',
  'consistent perspective and architectural proportions'
];

// ---------------------------------------------------------
// NEGATIVE PROMPT / QUALITY CONTROL
// ---------------------------------------------------------
const QUALITY_RULES = [
  'no text, subtitles, logos or watermarks',
  'no cartoon styling or artificial CGI appearance',
  'no warped buildings or distorted landmarks',
  'no duplicated architectural structures',
  'no sudden camera jumps or erratic movement',
  'no impossible camera teleportation',
  'no artificial terrain deformation',
  'no excessive sharpening or oversaturated colors',
  'no flickering, morphing or inconsistent geometry',
  'preserve realistic geographical scale and proportions',
  'keep the main landmark visually consistent throughout the shot',
  'no unwanted foreground objects obscuring the subject'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const pickN = (arr, n) =>
  [...arr]
    .sort(() => Math.random() - 0.5)
    .slice(0, n);

// ---------------------------------------------------------
// GENERATOR
// ---------------------------------------------------------
const generateDroneBatch = (count = 25) => {
  const lines = [];
  lines.push('{"shots": [');

  for (let i = 0; i < count; i++) {
    const group = getRandom(ECOLOGICAL_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const shot = getRandom(DRONE_SHOTS);

    const camera = pickN(CAMERA_MODIFIERS, 3).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');
    const quality = pickN(QUALITY_RULES, 2).join(', ');

    const prompt = [
      'CINEMATIC AERIAL DRONE VIDEO',
      `SUBJECT: ${spec}`,
      `ENVIRONMENT: ${hab}`,
      `SCENE ACTION: ${bhv}`,
      `DRONE SHOT: ${shot}`,
      `LIGHTING AND WEATHER: ${light}`,
      `CAMERA CHARACTERISTICS: ${camera}`,
      `VISUAL STYLE: ${enh}`,
      `QUALITY REQUIREMENTS: ${quality}`,
      'DURATION: 5 seconds',
      'CONTINUITY: one coherent shot, consistent geography, realistic movement and stable subject identity',
      'AUDIO: natural environmental ambience appropriate to the location, with no narration or music'
    ].join(' | ');

    lines.push(
      JSON.stringify({
        in_frame_still_prompt: prompt
      }) + (i < count - 1 ? ',' : '')
    );
  }

  lines.push(']}');
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const parsedCount = Number.parseInt(args[0], 10);
const count = Number.isFinite(parsedCount) && parsedCount > 0
  ? Math.min(parsedCount, 10000)
  : 25;

const output = generateDroneBatch(count);

fs.writeFileSync('matrix.json', output, {
  encoding: 'utf8'
});

// Validate that the output is valid JSON.
JSON.parse(output);

console.log(`🚁 Generated ${count} cinematic drone prompts successfully.`);
console.log(`📁 Output: ${require('path').resolve('matrix.json')}`);
