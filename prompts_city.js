/**
 * PromptForge: Urban Cityscape Generator CLI (Expanded Edition)
 * 
 * This script generates a JavaScript array of detailed, prompt-engineered 
 * video generation prompts based on urban environments.
 * Usage: node prompts_cityscape_generator.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// URBAN SCENERY ECOLOGICAL GROUPS DATASET (20+ THEMES EACH)
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Mega-Structures & Civic Grandeur', // The "Big Five" of the City
    species: [
      'Iconic Skyscrapers at dawn',
      'Historic European opera house facade',
      'Massive suspension bridge under construction',
      'Vast metropolitan train station hall (Art Deco)',
      'Central plaza filled with global flags',
      'Triumphal arch over a busy boulevard',
      'Modern glass curtain wall office tower',
      'Underpass covered in neon signs and graffiti',
      'Monumental government building entrance',
      'Marketplace square overflowing with life',
      'Industrial dockyard with cranes towering high',
      'Colonial-era residential street canyon',
      'Overpass network at rush hour peak',
      'A massive public library facade',
      'University campus quadrangle in autumn light',
      'Grand theater marquee lit up at night',
      'Stadium architecture after a game',
      'Multi-level pedestrian walkway system',
      'Waterfront promenade lined with kiosks',
      'City hall clock tower visible from miles away',
      'The central railway hub junction point' 
    ],
    behaviors: [
      'Crowds moving quickly during rush hour commute',
      'Reflection of the skyline in wet pavement after rain',
      'Drones flying between skyscrapers at high altitude',
      'Automobiles creating streaks of light from passing traffic (long exposure)',
      'Street vendors arranging goods on a busy corner',
      'People gathering and celebrating an event outdoors',
      'The steady flow of people down a narrow alleyway',
      'Vehicles forming synchronized patterns at a major intersection',
      'Workers scaling massive building scaffolding',
      'Smoke plumes rising from industrial chimneys',
      'Boats navigating a river through the city center',
      'A crowd stopping to admire street art on a wall',
      'The dramatic closing of day-glo advertisement signs',
      'Emergency vehicles speeding past bystanders',
      'Students congregating outside an educational institution',
      'Street musicians playing for passing foot traffic',
      'Delivery trucks navigating narrow historical streets',
      'A grand parade winding through the main boulevard',
      'The collective energy of a massive sporting event crowd',
      'Maintenance workers on the rooftop edges looking out over the sprawl' 
    ],
    habitats: [
      'Downtown Financial District canyon',
      'Historic Chinatown alleyways',
      'Rain-soaked waterfront promenade',
      'Modernist glass riverbank development',
      'Artsy industrial warehouse district',
      'Overhead metro railway lines crisscrossing the sky',
      'Dense, narrow European back streets',
      'University quarter filled with ancient trees',
      'The massive central train terminal area',
      'Commercial shopping mall atrium space',
      'Financial District plaza under a grand dome',
      'Riverside park bordering corporate towers',
      'Tidal flats and docks where ships unload goods',
      'Historical district with cobblestone streets',
      'Slums adjacent to gleaming wealth (juxtaposition)',
      'The elevated rail line track structure',
      'Parkland separating two skyscrapers',
      'A large, bustling farmers market setup',
      'University campus quadrangle during a festival',
      'The area beneath massive concrete viaducts',
      'A major transportation interchange point' 
    ],
  },

  {
    label: 'Transit & Dynamic Movement', // The "Plains Game" of the City
    species: [
      'Trams pulling through a historical street',
      'Stream of yellow taxis during rush hour',
      'Skateboarding groups traversing pedestrian zones',
      'Construction crane boom reaching into the sky',
      'Motorcycles weaving through slow traffic',
      'Bicycles lining a dedicated bike path',
      'The movement of crowds leaving an entertainment venue',
      'A subway train arriving at full speed (motion blur)',
      'Delivery workers on scooters navigating curbs',
      'Pedestrians grouped for a concert or festival',
      'The flashing sequence of traffic lights changing colors',
      'Buses idling and waiting at designated stops',
      'People walking briskly with professional purpose',
      'Long exposure streaks of car headlights',
      'A group crossing the street against the light',
      'People looking up in awe at a towering facade',
      'The sudden rush of humanity exiting a station',
      'Floating barges moving down an artificial canal',
      'High-speed commuter rail passing through the landscape',
      'Aerial view of traffic patterns creating geometric flow',
      'A riverboat gliding silently under a bridge'
    ],
    behaviors: [
      'Following the golden path of car headlights at dusk',
      'Huddling in groups waiting for a public transport vehicle',
      'Zooming past storefronts with kinetic energy',
      'Performing stunts on elevated urban infrastructure',
      'Passing through areas of high foot traffic concentration',
      'Moving away from an illuminated central point',
      'The coordinated movement of construction workers',
      'Sudden halts and starts at busy junctions',
      'Grouping together to take a perfect photograph',
      'Walking with purpose, heads down against the wind',
      'Swarming around a street food cart in the evening',
      'Navigating through obstacles like market stalls or tourists',
      'The sense of endless movement across the cityscape panorama',
      'Being swept up in the energy of a massive public gathering',
      'The collective hurried pace of millions of lives intertwining',
      'Creating patterns with their footsteps on wet pavement',
      'Observing life from a high-rise window looking down',
      'Crossing paths with strangers, momentary connections',
      'Moving through the transition zone between work and leisure',
      'The rhythmic pulse of the city waking up or slowing down' 
    ],
    habitats: [
      'Rush hour main avenue intersection',
      'Riverfront boardwalk during a festival',
      'Elevated pedestrian bridge walkway',
      'Under the viaduct structure near rail tracks',
      'A major public transit interchange hub',
      'The crosswalk at a busy downtown corner',
      'The central square connecting commercial streets',
      'Near the mouth of a large industrial river',
      'A bustling pedestrian shopping arcade',
      'The area immediately surrounding a subway exit',
      'Overlooking a major bridge suspension span',
      'The transition zone between business and residential areas',
      'Underneath glowing neon signage on narrow streets',
      'Near the mouth of a navigable canal',
      'A waterfront pier used for fishing and leisure',
      'Between two massive corporate glass towers',
      'On the edge of a sprawling market district',
      'At the confluence of multiple transportation routes',
      'Within an architectural canyon formed by tall buildings',
      'By a large, accessible public park bordered by commerce',
      'The interchange point where land and water meet' 
    ],
  },

  {
    label: 'Hidden Corners & Micro-Worlds', // The "Small Wonders" of the City
    species: [
      'Street musician playing saxophone in an alleyway',
      'Elderly woman selling flowers from a cart',
      'Graffiti artist finishing a mural on brick wall',
      'A dog wandering alone through a quiet residential street',
      'Street cat sleeping in sunbeam on cobblestones',
      'Small child laughing while chasing pigeons',
      'Coffee shop patrons watching the world go by',
      'Window display showing vintage relics and nostalgia',
      'Steam rising from a street food vendor’s pot',
      'A single bicycle leaning against an ornate railing',
      'Weeds growing through cracked pavement slabs',
      'Small puddle reflecting the colorful sky and buildings',
      'The detail of peeling paint on an old doorframe',
      'Graffiti layers telling untold urban stories',
      'Steam vents puffing mist onto a quiet sidewalk',
      'A patch of resilient greenery in a concrete planter',
      'Forgotten architectural details (statues, carvings)',
      'Small, localized gathering of people talking quietly',
      'A hidden staircase leading to a forgotten rooftop garden',
      'The intimate view from an upstairs window looking out' 
    ],
    behaviors: [
      'Curling up in the shadow of a doorway to avoid the crowd',
      'Searching for lost items on the pavement',
      'Whispering secrets between friends in a secluded corner',
      'Observing passersby from a fixed, quiet vantage point',
      'Making momentary eye contact with a stranger',
      'Interacting solely with inanimate objects (e.g., sketching)',
      'Peeling back layers of decay to reveal color beneath',
      'Taking refuge in the natural growth that defies concrete',
      'Collecting small bits of litter or discarded art supplies',
      'Passing time by watching the drip from a broken fountain',
      'Hiding and observing from behind market stalls',
      'The quiet, unnoticed moment between two major events',
      'Exploring the forgotten corners of a mega-building complex',
      'Peeking out from beneath an awning into the street life',
      'Sharing a moment over coffee or tea in quiet contemplation',
      'Cleaning and polishing an overlooked piece of architecture',
      'The slow passage of time measured by light shifts',
      'Discovering unexpected pockets of nature within concrete',
      'A sense of timeless isolation amidst urban chaos',
      'Capturing the transient beauty of decay and rebirth' 
    ],
    habitats: [
      'Cobblestone alleyway between two grand buildings',
      'Under the awning of a closed shop',
      'Forgotten service entrance door',
      'The neglected courtyard behind a market',
      'A rooftop garden oasis in a dense city block',
      'A small, derelict side street off the main avenue',
      'Behind an ornate iron gate',
      'Near a perpetually dripping drainpipe',
      'The overlooked area under a subway platform entrance',
      'A graffiti-covered service passage',
      'The narrow space between two large utility boxes',
      'The sheltered nook of an old library corner',
      'An outdoor seating arrangement with low visibility',
      'Behind stacks of discarded wooden crates',
      'By a mural that tells a community story',
      'A small, abandoned construction site area',
      'Between the foundation pillars of two buildings',
      'Underneath an old metal fire escape ladder',
      'The shadowed corner of a large plaza away from the light',
      'Near the junction of utilities and forgotten history',
      'Where commerce meets neglect' 
    ],
  }
];

const MODIFIERS = [
  'National Geographic cinematography',
  'Macro fur detail',
  'Slow motion 120fps',
  'Low-angle camera trap',
  'Telephoto compression',
  'Aerial drone view',
  'Handheld documentary style',
  'Sharp eye focus',
  'Shallow depth of field'
];

const ENHANCERS = [
  '8K resolution',
  'BBC Planet Earth quality',
  'hyper-realistic',
  'award-winning photography',
  'perfect composition',
  'volumetric lighting',
  'extreme detail',
  'natural colors'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateCityscapeBatch = (count = 20) => {
  const lines = [];
  lines.push(`/**\n * Generated prompt template for Cityscapes - ${new Date().toLocaleDateString()}\n */`);
  lines.push(`const videoPrompts = [];`);

  for (let i = 0; i < count; i++) {
    // Cycle through the defined ecological groups
    const groupIndex = Math.floor(Math.random() * ECOLOGICAL_GROUPS.length);
    const group = ECOLOGICAL_GROUPS[groupIndex];

    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    // Use a specific lighting/mood modifier for urban settings, rather than generic ones
    const light = ['Golden Hour Fog', 'Rain-slicked Neon Glow', 'Harsh Midday Contrast', 'Twilight Blue Hour'].includes(getRandom(['Golden Hour Fog', 'Rain-slicked Neon Glow', 'Harsh Midday Contrast', 'Twilight Blue Hour'])) ? getRandom(['Golden Hour Fog', 'Rain-slicked Neon Glow', 'Harsh Midday Contrast', 'Twilight Blue Hour']) : 'Overcast Daylight';
    
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videoPrompts[${i}] = \`video of - SCENE TYPE: ${group.label} (Focus: ${spec}) - ACTION/BEHAVIOR: ${bhv} in a ${hab} setting under ${light} light - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
    );
  }

  lines.push(`module.exports = videoPrompts;`);
  return lines.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 15; // Defaulting to 15 for readability when running the script

console.log(`=======================================================`);
console.log(`🚀 Running Cityscape Prompt Generator: ${count} Prompts`);
console.log(`=======================================================`);


const output = generateCityscapeBatch(count);

// Write file
fs.writeFileSync('videoPrompts_cityscapes.js', output, { encoding: 'utf8' });

console.log(`✅ Success! File written to 'videoPrompts_cityscapes.js'`);
console.log(`\nInstructions: Run the script using node prompts_cityscape_generator.js [Number of Prompts]`);

// ---------------------------------------------------------
