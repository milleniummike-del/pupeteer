/**
 * PromptForge: Dinosaur Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node prompts_dinosaurs.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// DINOSAUR GROUPS DATASET
// ---------------------------------------------------------
const DINOSAUR_GROUPS = [
  {
    label: 'Apex Predators (Theropods)',
    species: [
      'Tyrannosaurus rex', 'Spinosaurus aegyptiacus', 'Giganotosaurus carolinii', 
      'Velociraptor mongoliensis', 'Deinonychus antirrhopus', 'Allosaurus fragilis', 
      'Carnotaurus sastrei', 'Baryonyx walkeri', 'Dilophosaurus wetherilli', 
      'Utahraptor ostrommaysorum', 'Albertosaurus sarcophagus', 'Tarbosaurus bataar', 
      'Acrocanthosaurus atokensis', 'Majungasaurus crenatissimus', 'Ceratosaurus nasicornis', 
      'Cryolophosaurus ellioti', 'Yutyrannus huali', 'Suchomimus tenerensis', 
      'Troodon formosus', 'Microraptor gui', 'Daspletosaurus torosus', 
      'Carcharodontosaurus saharicus', 'Gorgosaurus libratus', 'Therizinosaurus cheloniformis'
    ],
    behaviors: [
      'Letting out a bone-shaking roar that vibrates the humid air', 'Stalking through dense prehistoric ferns with silent precision', 
      'Sprinting at high velocity across a dusty floodplain', 'Ambushing a juvenile sauropod from the treeline', 
      'Scavenging a fresh carcass while fending off smaller rivals', 'Protecting a clutch of eggs in a mud-mound nest', 
      'Engaging in a territorial head-butting display', 'Wading into a shallow river to snap up a large lungfish',
      'Scanning the horizon from a rocky limestone ridge', 'Nesting in a social pack under the forest canopy'
    ],
    habitats: [
      'Lush Cretaceous fern forest with towering conifers', 'Steaming volcanic plains with ash-covered ground', 
      'Ancient river delta with wide mudflats', 'Arid badlands with sparse cycad bushes', 
      'Coastal lagoon with white sand and turquoise water', 'High-altitude mountain pass with prehistoric pines', 
      'Deep swampy marshland with giant horsetails', 'Sun-drenched redwood grove', 'Misty tropical valley after a monsoon', 
      'Open fern savanna at twilight'
    ],
  },

  {
    label: 'Gentle Giants (Sauropods)',
    species: [
      'Brachiosaurus altithorax', 'Apatosaurus ajax', 'Diplodocus longus', 
      'Argentinosaurus huinculensis', 'Dreadnoughtus schrani', 'Patagotitan mayorum', 
      'Camarasaurus lentus', 'Brontosaurus excelsus', 'Amargasaurus cazaui', 
      'Shunosaurus lii', 'Mamenchisaurus hochuanensis', 'Saltasaurus loricatus', 
      'Alamosaurus sanjuanensis', 'Giraffatitan brancai', 'Nigersaurus taqueti'
    ],
    behaviors: [
      'Stripping the high canopy of a conifer tree with a long neck', 'Wading through a deep prehistoric lake to cool off', 
      'Migrating in a massive herd across an open plain', 'Cracking its whip-like tail in a defensive warning', 
      'Lumbering through a dense forest, snapping trees like twigs', 'Drinking from a crystal-clear volcanic spring', 
      'Bathing in a sun-drenched river delta', 'Grazing on vast fields of low-lying ferns', 
      'Bellowing to the herd across a misty valley', 'Dust-bathing in a dry riverbed'
    ],
    habitats: [
      'Vast fern prairies under a midday sun', 'Dense Jurassic conifer forest', 'Flooded river basin with silt islands', 
      'Misty valley surrounded by jagged peaks', 'Semi-arid plains with scattered waterholes', 
      'Lush tropical swamp edge', 'Highland conifer grove with clear air', 'Edge of a vast inland sea', 
      'Volcanic crater valley with rich vegetation', 'Ancient woodland with giant mossy logs'
    ],
  },

  {
    label: 'Armored & Horned (Ceratopsians & Thyreophorans)',
    species: [
      'Triceratops horridus', 'Stegosaurus stenops', 'Ankylosaurus magniventris', 
      'Styracosaurus albertensis', 'Kentrosaurus aethiopicus', 'Protoceratops andrewsi', 
      'Pachyrhinosaurus lakustai', 'Nasutoceratops titani', 'Euoplocephalus tutus', 
      'Gastonia burgei', 'Edmontonia rugosidens', 'Miragaia longicollum', 
      'Chasmosaurus belli', 'Torosaurus latus', 'Psittacosaurus mongoliensis'
    ],
    behaviors: [
      'Charging through the brush with its horns lowered', 'Swinging its spiked tail-club in a defensive arc', 
      'Locking horns with a rival in a display of strength', 'Huddling in a defensive circle around the young', 
      'Foraging for tough roots and cycads', 'Sun-basking on a warm slab of sedimentary rock', 
      'Grazing peacefully in a meadow of early flowering plants', 'Drinking from a muddy watering hole', 
      'Scanning for predators with a wary eye', 'Wading through a shallow swampy inlet'
    ],
    habitats: [
      'Arid scrubland with tough cycad plants', 'Open redwood forest with dappled light', 'Rocky canyon floor with sparse vegetation', 
      'Riverside meadow with early Cretaceous flowers', 'Edge of a dense prehistoric jungle', 
      'Muddy floodplain after a heavy storm', 'Coastal dunes with salt-tolerant shrubs', 
      'Hilly terrain with scattered groves of ginkgo trees', 'Flat fern-covered plains', 'Shadowed forest floor with giant ferns'
    ],
  },

  {
    label: 'Herbivores & Ornithopods',
    species: [
      'Parasaurolophus walkeri', 'Edmontosaurus regalis', 'Iguanodon bernissartensis', 
      'Maiasaura peeblesorum', 'Corythosaurus casuarius', 'Lambeosaurus lambei', 
      'Muttaburrasaurus langdoni', 'Dryosaurus altus', 'Hypsilophodon foxii', 
      'Ouranosaurus nigeriensis', 'Tenontosaurus tilletti', 'Gallimimus bullatus',
      'Struthiomimus altus', 'Oviraptor philoceratops', 'Citipati osmolskae'
    ],
    behaviors: [
      'Trumpeting through a hollow head crest', 'Grazing on lush wetland vegetation', 
      'Running at high speed on two legs through the forest', 'Tending to a communal nesting site', 
      'Scanning the horizon for signs of T-Rex', 'Wading through a shallow lake to reach aquatic plants', 
      'Migrating in a noisy, social herd', 'Alertly pausing with one leg raised', 
      'Foraging in the leaf litter of a ginkgo grove', 'Drinking from a clear forest stream'
    ],
    habitats: [
      'Wetland marshes with tall horsetails', 'Open conifer woodland at dawn', 'Lush riverbanks with soft ferns', 
      'Prehistoric lakeshore with sandy beaches', 'Misty forest interior with ancient moss', 
      'Rolling hills covered in prehistoric shrubs', 'Fertile valleys between volcanic ridges', 
      'Dense jungle canopy with vibrant bird-like dinosaurs', 'Floodplains with rich silt deposits', 'Coastal plains under a bright sky'
    ],
  },

  {
    label: 'Ancient Skies & Seas (Pterosaurs & Marine Reptiles)',
    species: [
      'Quetzalcoatlus northropi', 'Pteranodon longiceps', 'Dimorphodon macronyx', 
      'Tupandactylus imperator', 'Mosasaurus hoffmannii', 'Plesiosaurus dolichodeirus', 
      'Ichthyosaurus communis', 'Liopleurodon ferox', 'Elasmosaurus platyurus', 
      'Kronosaurus queenslandicus', 'Tylosaurus proriger', 'Rhamphorhynchus muensteri',
      'Cearadactylus atrox', 'Tapejara wellnhoferi', 'Archelon ischyros'
    ],
    behaviors: [
      'Soaring on thermal updrafts above a prehistoric ocean', 'Diving into the waves to snatch a prehistoric fish', 
      'Basking on a high limestone cliff face', 'Breaching the water surface in a massive spray', 
      'Gliding silently over a dense jungle canopy', 'Hunting in the dark depths of an epicontinental sea', 
      'Launching from the ground with a powerful quad-launch', 'Nesting on a remote volcanic island', 
      'Patrolling the coastline for carcasses', 'Cruising through a coral reef of the Tethys Ocean'
    ],
    habitats: [
      'High coastal cliffs overlooking a turquoise sea', 'Open prehistoric ocean with massive waves', 
      'Tropical lagoon with coral reefs', 'Deep marine trenches of the Mesozoic', 
      'Sky-high views above a sprawling river delta', 'Isolated volcanic islands in the middle of the sea', 
      'Shallow epicontinental seas with abundant life', 'Rocky outcrops along a prehistoric coastline', 
      'Estuaries where the river meets the sea', 'Clear blue waters of the ancient Pacific'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour rim lighting highlighting reptilian scales',
  'Harsh high-contrast noon sun casting sharp shadows on the dusty ground',
  'Soft diffused light through a dense prehistoric canopy',
  'Moonlit silhouettes against a starry Mesozoic sky',
  'Dappled sunlight through swaying giant ferns',
  'Electric blue lightning strike illuminating a rainy Jurassic night',
  'Volumetric morning mist with god rays through the conifers',
  'Glowing lava from a nearby volcano casting an orange hue',
  'Twilight indigo haze over the fern savanna',
  'Stormy grey heavy atmosphere with dramatic prehistoric clouds',
  'Prismatic caustic light patterns dancing in a shallow Cretaceous sea',
  'Ethereal sunset casting long shadows across the floodplain',
  'Warm golden light reflecting off a prehistoric lake'
];

const MODIFIERS = [
  'National Geographic aesthetic', 'Macro extreme detail of scales', 'High-speed shutter freeze',
  'Telephoto lens compression', 'Underwater housing clarity', 'Motion blur for speed',
  'Low-angle hero perspective', 'Aerial drone cinematography', 'Sharp eye-focus',
  'Shallow depth of field with creamy bokeh', 'Extreme wide-angle environmental shot',
  'Prehistoric atmosphere', 'Cinematic lighting'
];

const ENHANCERS = [
  '8K resolution', 'BBC Planet Dinosaur quality', 'hyper-realistic CGI',
  'award-winning paleoart aesthetic', 'perfect composition', 'volumetric scattering',
  'intricate skin and feather detail', 'professional color grading'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateDinoBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(DINOSAUR_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      `videos[${i}] = \`- SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateDinoBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with dinosaurs (UTF‑8 safe)');
