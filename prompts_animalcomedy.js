/**
 * PromptForge: Funny Animal Generator CLI
 * Usage: node funny-nature.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// COMEDIC ANIMAL INTERACTION DATASET
// ---------------------------------------------------------
const COMEDY_GROUPS = [
  {
    label: 'Pets Being Absolute Gremlins',
    species: [
      'Golden retriever', 'Shiba Inu', 'British Shorthair cat', 'Maine Coon cat',
      'French bulldog', 'Cockatiel', 'Parrot', 'Ferret', 'Hamster', 'Goat'
    ],
    behaviors: [
      'stealing food and running away at top speed',
      'dramatically overreacting to absolutely nothing',
      'refusing to move while being gently pushed by a human',
      'zooming in chaotic circles around the living room',
      'knocking objects off a table while maintaining eye contact',
      'getting stuck in something they definitely could have avoided',
      'interrupting a human trying to work',
      'falling off furniture in a completely avoidable way',
      'trying to fit into a box that is clearly too small'
    ],
    interactions: [
      'while a human films and laughs uncontrollably',
      'while a human desperately tries to stop the chaos',
      'while a human is on an important video call',
      'while a human offers treats as a failed negotiation tactic',
      'while a child cheers them on like a tiny hype squad'
    ],
    locations: [
      'messy living room', 'sunny backyard patio', 'tiny apartment kitchen',
      'freshly cleaned room that is about to be destroyed', 'bed covered in laundry'
    ]
  },

  {
    label: 'Farmyard Comedy',
    species: [
      'Goat', 'Donkey', 'Alpaca', 'Pig', 'Chicken', 'Duck', 'Sheep', 'Mini cow'
    ],
    behaviors: [
      'jumping onto something they absolutely should not be standing on',
      'chasing a human who is mildly concerned',
      'screaming dramatically for no clear reason',
      'sneaking up behind someone and startling them',
      'refusing to cooperate in the most stubborn way possible',
      'running in a tiny panic for absolutely no reason',
      'stealing a hat right off a human’s head'
    ],
    interactions: [
      'while a farmer tries to stay serious but starts laughing',
      'while tourists film like they just discovered comedy',
      'while another animal watches in silent judgment',
      'while a human bribes them with snacks',
      'while a human slowly realizes this was a mistake'
    ],
    locations: [
      'muddy barnyard', 'sunlit open pasture', 'wooden farm fence',
      'feeding trough area', 'small rural petting zoo'
    ]
  },

  {
    label: 'Wild Animals Acting Suspiciously Unwild',
    species: [
      'Raccoon', 'Squirrel', 'Fox', 'Deer', 'Seagull', 'Crow', 'Monkey'
    ],
    behaviors: [
      'stealing food from an unsuspecting human',
      'staring directly into the camera like they pay rent here',
      'trying to open a container with surprising intelligence',
      'fighting another animal over a snack in dramatic fashion',
      'posing like they know they are being filmed',
      'boldly approaching humans with zero fear',
      'running off triumphantly with stolen loot'
    ],
    interactions: [
      'while humans watch in disbelief',
      'while someone yells “HEY!” in the background',
      'while a human slowly reaches for their phone to record',
      'while another animal tries to join the chaos',
      'while a human accepts defeat and lets it happen'
    ],
    locations: [
      'city park picnic area', 'suburban backyard', 'outdoor café seating',
      'campsite in the woods', 'beach boardwalk'
    ]
  },

  {
    label: 'Inter-Animal Chaos',
    species: [
      'Two dogs', 'Cat and dog', 'Duck and dog', 'Goat and chicken',
      'Parrot and cat', 'Baby elephant and birds', 'Otters', 'Penguins'
    ],
    behaviors: [
      'engaging in chaotic zoomies together',
      'play-fighting in an overly dramatic way',
      'arguing loudly over absolutely nothing',
      'copying each other’s movements like a comedy routine',
      'stealing each other’s food in a never-ending loop',
      'sliding, tumbling, and crashing into each other',
      'having a synchronized moment of confusion'
    ],
    interactions: [
      'while a human narrates like a nature documentary but badly',
      'while people nearby stop to watch the unfolding nonsense',
      'while one animal clearly regrets getting involved',
      'while a human tries and fails to separate them',
      'while bystanders record vertically on their phones'
    ],
    locations: [
      'grassy park field', 'living room with rugs sliding everywhere',
      'zoo enclosure play area', 'snowy yard', 'shallow pond edge'
    ]
  }
];

// ---------------------------------------------------------
// CINEMATIC BUT SILLY STYLE
// ---------------------------------------------------------
const LIGHTING = [
  'dramatic golden hour lighting for no reason',
  'harsh indoor lighting that makes everything look more chaotic',
  'soft morning light contrasting the nonsense',
  'overcast skies adding emotional weight to the silliness',
  'bright midday sun exposing every embarrassing detail'
];

const MODIFIERS = [
  'handheld phone camera energy',
  'slight motion blur from laughing too hard',
  'sudden chaotic zoom-ins',
  'accidental shaky cam realism',
  'perfectly timed slow motion replay',
  'wide-angle lens making everything funnier'
];

const ENHANCERS = [
  'viral video vibes',
  'unintentional comedy gold',
  'internet meme potential',
  'chaotic wholesome energy',
  'perfect comedic timing',
  'certified “wait for it” moment'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateFunnyBatch = (count = 5) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(COMEDY_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const inter = getRandom(group.interactions);
    const loc = getRandom(group.locations);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 3).join(', ');
    const enh = pickN(ENHANCERS, 2).join(', ');

    lines.push(
      `videos[${i}] = \`- SCENE: ${spec} ${bhv} ${inter} - LOCATION: ${loc} - LIGHTING: ${light} - STYLE: ${mods} - TONE: ${enh}\`;`
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

const output = generateFunnyBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('😂 videos.js generated successfully (comedy mode enabled)');
