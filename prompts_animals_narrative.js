/**
 * PromptForge: African Safari Narrative Generator (2-Minute Stories)
 * Each video = 24 clips × 5 seconds
 * Usage: node prompts_animals_safari_story.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// SAFARI ECOLOGICAL GROUPS DATASET
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'The Big Five & Large Giants',
    species: [
      'African Elephant (Loxodonta africana)',
      'African Forest Elephant (Loxodonta cyclotis)',
      'South African Lion (Panthera leo melanochaita)',
      'African Leopard (Panthera pardus pardus)',
      'Cape Buffalo (Syncerus caffer)',
      'Black Rhinoceros (Diceros bicornis)',
      'White Rhinoceros (Ceratotherium simum)',
      'Masai Giraffe (Giraffa tippelskirchi)',
      'Reticulated Giraffe (Giraffa reticulata)',
      'Hippopotamus (Hippopotamus amphibius)',
      'Nile Crocodile (Crocodylus niloticus)',
      'Common Eland (Taurotragus oryx)',
      'Giant Eland (Taurotragus derbianus)',
      'Sable Antelope (Hippotragus niger)',
      'Roan Antelope (Hippotragus equinus)',
      'Waterbuck (Kobus ellipsiprymnus)',
      'Bushbuck (Tragelaphus scriptus)',
      'Nyala (Tragelaphus angasii)',
      'Bongo (Tragelaphus eurycerus)',
      'Giant Forest Hog (Hylochoerus meinertzhageni)',
      'Bull Hippopotamus (dominant male)'
    ],
    habitats: [
      'Serengeti plains',
      'Okavango Delta',
      'Ngorongoro Crater',
      'Tsavo scrubland',
      'Tarangire baobab valley',
      'Kalahari edge',
      'Chobe floodplains'
    ]
  },

  {
    label: 'Plains Game & Fast Runners',
    species: [
      'Cheetah (Acinonyx jubatus)',
      'Plains Zebra (Equus quagga)',
      'Grevy’s Zebra (Equus grevyi)',
      'Blue Wildebeest (Connochaetes taurinus)',
      'Black Wildebeest (Connochaetes gnou)',
      'Thomson’s Gazelle (Eudorcas thomsonii)',
      'Grant’s Gazelle (Nanger granti)',
      'Impala (Aepyceros melampus)',
      'Greater Kudu (Tragelaphus strepsiceros)',
      'Lesser Kudu (Tragelaphus imberbis)',
      'Oryx / Gemsbok (Oryx gazella)',
      'Springbok (Antidorcas marsupialis)',
      'Topi (Damaliscus lunatus)',
      'Hartebeest (Alcelaphus buselaphus)',
      'Tsessebe (Damaliscus lunatus)',
      'Steenbok (Raphicerus campestris)',
      'Klipspringer (Oreotragus oreotragus)',
      'Dik-dik (Madoqua kirkii)',
      'Oribi (Ourebia ourebi)',
      'Reedbuck (Redunca arundinum)'
    ],
    habitats: [
      'Open savanna',
      'Short grass plains',
      'Dry thornveld',
      'River edges',
      'Salt pans'
    ]
  },

  {
    label: 'Scavengers & Small Predators',
    species: [
      'Spotted Hyena',
      'Striped Hyena',
      'African Wild Dog',
      'Black-backed Jackal',
      'Honey Badger',
      'Meerkat',
      'Banded Mongoose',
      'Serval',
      'Caracal',
      'Bat-eared Fox',
      'Cape Fox',
      'Warthog',
      'Aardvark',
      'Aardwolf',
      'Genet',
      'African Civet',
      'Ground Pangolin',
      'Springhare',
      'Dwarf Mongoose',
      'Side-striped Jackal'
    ],
    habitats: [
      'Dry plains',
      'Burrow fields',
      'Rocky outcrops',
      'Scrubland',
      'Woodland edges'
    ]
  },

  {
    label: 'Birds of the Savanna',
    species: [
      'Ostrich',
      'Secretary Bird',
      'Kori Bustard',
      'Lappet-faced Vulture',
      'White-backed Vulture',
      'African Fish Eagle',
      'Martial Eagle',
      'Lilac-breasted Roller',
      'Grey Crowned Crane',
      'Marabou Stork',
      'Ground Hornbill',
      'Yellow-billed Hornbill',
      'Superb Starling',
      'Weaver Bird',
      'Saddle-billed Stork',
      'Denham’s Bustard',
      'Rüppell’s Vulture',
      'Tawny Eagle',
      'European Roller',
      'Oxpecker'
    ],
    habitats: [
      'Acacia trees',
      'Riverbanks',
      'Open skies',
      'Grasslands',
      'Wetlands'
    ]
  }
];

// ---------------------------------------------------------
// STORY ARC
// ---------------------------------------------------------
const STORY_ARCS = {
  intro: [
    'wide establishing shot',
    'calm observation',
    'slow movement',
    'environment detail focus'
  ],
  tension: [
    'becomes alert',
    'scans horizon',
    'senses danger',
    'pauses and listens'
  ],
  action: [
    'sudden movement',
    'running at speed',
    'chase begins',
    'rapid escape'
  ],
  climax: [
    'intense confrontation',
    'peak action moment',
    'dust and chaos',
    'life-or-death struggle'
  ],
  resolution: [
    'calm returns',
    'slow breathing',
    'returns to normal',
    'wide closing shot'
  ]
};

// ---------------------------------------------------------
const LIGHTING = [
  'golden hour',
  'sunset red glow',
  'dawn mist',
  'harsh daylight',
  'storm clouds',
  'moonlight'
];

const CAMERA = [
  'cinematic pan',
  'tracking shot',
  'low angle',
  'aerial drone',
  'close-up',
  'handheld'
];

const STYLE = [
  'BBC Earth style',
  'National Geographic',
  'hyper realistic',
  '8K detail',
  'cinematic depth',
  'wildlife documentary'
];

// ---------------------------------------------------------
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------
const generateStory = () => {
  const group = rand(ECOLOGICAL_GROUPS);
  const species = rand(group.species);
  const habitat = rand(group.habitats);

  const seq = [];

  const add = (phase, n) => {
    for (let i = 0; i < n; i++) {
      seq.push({
        species,
        habitat,
        behavior: rand(STORY_ARCS[phase]),
        lighting: rand(LIGHTING),
        camera: rand(CAMERA),
        style: rand(STYLE)
      });
    }
  };

  add('intro', 1);
  add('action', 1);
  add('climax', 1);

  return seq;
};

// ---------------------------------------------------------
const generate = (count = 1) => {
  const lines = [];
  lines.push(`const videos = [];`);

  let index = 0;

  for (let v = 0; v < count; v++) {
    const story = generateStory();

    story.forEach((s) => {
      lines.push(
        `videos[${index}] = \`video of ${s.species}, ${s.behavior}, in ${s.habitat}, ${s.lighting}, ${s.camera}, ${s.style}, 5 seconds\`;`
      );
      index++;
    });
  }

  lines.push(`module.exports = videos;`);
  return lines.join('\n');
};


// ---------------------------------------------------------
const count = parseInt(process.argv[2]) || 1;
const output = generate(1);

fs.writeFileSync('videos.js', output);
console.log('✔ Generated narrative safari prompts');
