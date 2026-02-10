/**
 * PromptForge: Nature Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node nature.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// FULL ECOLOGICAL GROUPS DATASET (MERGED INTO ONE FILE)
// ---------------------------------------------------------
const ECOLOGICAL_GROUPS = [
  {
    label: 'Big Cats & Land Predators',
    species: [
      'Siberian tiger (Panthera tigris altaica)', 'Snow leopard (Panthera uncia)', 'Cheetah (Acinonyx jubatus)', 
      'Jaguar (Panthera onca)', 'Lioness (Panthera leo)', 'Black panther (Panthera onca / Panthera pardus)', 
      'Clouded leopard (Neofelis nebulosa)', 'Grey wolf (Canis lupus)', 'Lynx (Lynx lynx)', 'Caracal (Caracal caracal)',
      'Cougar (Puma concolor)', 'African Leopard (Panthera pardus pardus)', 'Serval (Leptailurus serval)', 
      'Ocelot (Leopardus pardalis)', 'Fossa (Cryptoprocta ferox)', 'Maned Wolf (Chrysocyon brachyurus)', 
      'Dingo (Canis familiaris dingo)', 'African Wild Dog (Lycaon pictus)', 'Coyote (Canis latrans)', 
      'Ethiopian Wolf (Canis simensis)', 'Red Fox (Vulpes vulpes)', 'Wolverine (Gulo gulo)', 
      'Tasmanian Devil (Sarcophilus harrisii)', 'Honey Badger (Mellivora capensis)', 'Spotted Hyena (Crocuta crocuta)', 
      'Brown Hyena (Parahyaena brunnea)', 'Bobcat (Lynx rufus)', 'Marbled Cat (Pardofelis marmorata)', 
      'Flat-headed Cat (Prionailurus planiceps)', 'Fishing Cat (Prionailurus viverrinus)', 'Sand Cat (Felis margarita)', 
      'Black-footed Cat (Felis nigripes)', 'Margay (Leopardus wiedii)', 'Iberian Lynx (Lynx pardinus)', 
      'Amur Leopard (Panthera pardus orientalis)', 'Asiatic Lion (Panthera leo leo)', 'Malayan Tiger (Panthera tigris jacksoni)', 
      'Sumatran Tiger (Panthera tigris sumatrae)', 'Indochinese Tiger (Panthera tigris corbetti)', 'Ghost Bat (Macroderma gigas)', 
      'King Cobra (Ophiophagus hannah)', 'Black Mamba (Dendroaspis polylepis)', 'Komodo Dragon (Varanus komodoensis)'
    ],
    behaviors: [
      'Stealthy descent down a near-vertical rocky incline while tracking prey', 'Pouncing on hidden prey in tall grass', 
      'Stalking through heavy undergrowth', 'Sprinting at high velocity across open savanna', 
      'Roaring in a territorial display at dusk', 'Surveying territory from a high jagged rock', 
      'Hunting in a synchronized pack', 'Camouflaged in dead leaves before a strike',
      'Dragging a heavy kill up into a tree', 'Defending territory against a rival'
    ],
    habitats: [
      'Deep Amazonian rainforest canopy', 'African savanna at sunset', 'High-altitude jagged crags of the Himalayan mountains', 
      'Golden autumn woodland', 'Snow-capped Siberian pine forest', 'Lush tropical valley with mist', 
      'Arid volcanic landscape', 'Red rock canyons of the American West', 'Misty swamp edge', 'Dense bamboo thicket'
    ],
  },

  {
    label: 'Marine & Aquatic Life',
    species: [
      'Great White shark (Carcharodon carcharias)', 'Humpback whale (Megaptera novaeangliae)', 'Orca (Killer whale) (Orcinus orca)', 
      'Manta ray (Mobula alfredi)', 'Blue-ringed octopus (Hapalochlaena)', 'Hammerhead shark (Sphyrnidae)', 
      'Blue whale (Balaenoptera musculus)', 'Colossal squid (Mesonychoteuthis hamiltoni)', 'Swordfish (Xiphias gladius)', 
      'Leatherback sea turtle (Dermochelys coriacea)', 'Whale Shark (Rhincodon typus)', 'Narwhal (Monodon monoceros)', 
      'Bottlenose Dolphin (Tursiops truncatus)', 'Giant Pacific Octopus (Enteroctopus dofleini)', 'Lion\'s Mane Jellyfish (Cyanea capillata)', 
      'Box Jellyfish (Chironex fleckeri)', 'Sperm Whale (Physeter macrocephalus)', 'Green Sea Turtle (Chelonia mydas)', 
      'Moray Eel (Muraenidae)', 'Barracuda (Sphyraena)', 'Dugong (Dugong dugon)', 'Manatee (Trichechus)', 
      'Sea Lion (Otariinae)', 'Elephant Seal (Mirounga)', 'Leopard Seal (Hydrurga leptonyx)', 'Mako Shark (Isurus oxyrinchus)', 
      'Tiger Shark (Galeocerdo cuvier)', 'Bull Shark (Carcharhinus leucas)', 'Oceanic Whitetip Shark (Carcharhinus longimanus)', 
      'Basking Shark (Cetorhinus maximus)', 'Greenland Shark (Somniosus microcephalus)', 'Thresher Shark (Alopias)', 
      'Sawfish (Pristidae)', 'Electric Eel (Electrophorus electricus)', 'Giant Isopod (Bathynomus giganteus)', 
      'Nautilus (Nautilus pompilius)', 'Vampire Squid (Vampyroteuthis infernalis)', 'Mimic Octopus (Thaumoctopus mimicus)', 
      'Reef Triggerfish (Rhinecanthus rectangulus)', 'Sailfish (Istiophorus)', 'Leafy Seadragon (Phycodurus eques)', 
      'Sunfish (Mola mola)', 'Beluga Whale (Delphinapterus leucas)'
    ],
    behaviors: [
      'Investigating with a "spy-hop" head rise above the waterline', 'Breaching high above the waves in a massive splash', 
      'Diving into deep turquoise water through caustic light', 'Navigating intricate coral reefs', 
      'Swimming in a bioluminescent sea at night', 'Struggling against powerful surface currents', 
      'Emerging from the abyssal zone into the light', 'Hunting schools of silver fish', 'Camouflaged against the sandy seabed'
    ],
    habitats: [
      'Deep blue waters at the edge of a kelp forest', 'Pacific coral reef with prismatic sun rays', 'Abyssal ocean zone', 
      'Bioluminescent lagoon under a full moon', 'Pacific island shallow beach', 'Deep sea geothermal vents', 
      'Flooded mangrove swamps', 'Open ocean blue water', 'Rocky underwater canyon', 'Shipwreck reclaimed by nature'
    ],
  },

  {
    label: 'Birds of Prey & Flight',
    species: [
      'Bald eagle (Haliaeetus leucocephalus)', 'Peregrine falcon (Falco peregrinus)', 'Golden eagle (Aquila chrysaetos)', 
      'Harpy eagle (Harpia harpyja)', 'Common kingfisher (Alcedo atthis)', 'Puffin (Fratercula)', 
      'Secretary bird (Sagittarius serpentarius)', 'Great Horned Owl (Bubo virginianus)', 'Osprey (Pandion haliaetus)', 
      'Red-tailed Hawk (Buteo jamaicensis)', 'Barn Owl (Tyto alba)', 'Eurasian Eagle-Owl (Bubo bubo)', 
      'Snowy Owl (Bubo scandiacus)', 'California Condor (Gymnogyps californianus)', 'Andean Condor (Vultur gryphus)', 
      'Lammergeier (Gypaetus barbatus)', 'Lappet-faced Vulture (Torgos tracheliotos)', 'Kestrel (Falco tinnunculus)', 
      'Gyrfalcon (Falco rusticolus)', 'Goshawk (Accipiter gentilis)', 'Cooper\'s Hawk (Accipiter cooperii)', 
      'Harris\'s Hawk (Parabuteo unicinctus)', 'Black Kite (Milvus migrans)', 'Red Kite (Milvus milvus)', 
      'Martial Eagle (Polemaetus bellicosus)', 'Wedge-tailed Eagle (Aquila audax)', 'Steller\'s Sea Eagle (Haliaeetus pelagicus)', 
      'Philippine Eagle (Pithecophaga jefferyi)', 'Crowned Eagle (Stephanoaetus coronatus)', 'African Fish Eagle (Icthyophaga vocifer)', 
      'Screech Owl (Megascops)', 'Burrowing Owl (Athene cunicularia)', 'Albatross (Diomedeidae)', 'Frigatebird (Fregata)', 
      'Wandering Albatross (Diomedea exulans)', 'Brown Pelican (Pelecanus occidentalis)', 'Shoebill Stork (Balaeniceps rex)', 
      'Marabou Stork (Leptoptilos crumenifer)', 'Blue Jay (Cyanocitta cristata)', 'Raven (Corvus corax)', 
      'Hummingbird (Trochilidae)', 'Toucan (Ramphastidae)'
    ],
    behaviors: [
      'Mid-air high-speed strike with talons outstretched', 'Diving like a bullet into a crystalline stream', 
      'Perched on a gnarled, mossy branch', 'Soaring on thermal updrafts above mountain peaks', 
      'Building an intricate nest on a vertical cliff face', 'Navigating a heavy tropical monsoon storm',
      'Scanning the ground with telescopic vision', 'Displaying vibrant plumage in a courtship dance'
    ],
    habitats: [
      'Jagged coastal cliffs of the Atlantic', 'Crystalline mountain stream in the Rockies', 'Ancient sequoia grove', 
      'Misty Scottish highlands', 'Arctic tundra at dawn', 'Sky-high tropical rainforest canopy', 
      'Arid desert mesa', 'Dense urban skyline at twilight'
    ],
  },

  {
    label: 'Arctic & Cold Climate',
    species: [
      'Polar bear (Ursus maritimus)', 'Emperor penguin (Aptenodytes forsteri)', 'Arctic fox (Vulpes lagopus)', 
      'Walrus (Odobenus rosmarus)', 'Reindeer (Rangifer tarandus)', 'Snowy owl (Bubo scandiacus)', 
      'Muskox (Ovibos moschatus)', 'Arctic Hare (Lepus arcticus)', 'Arctic Wolf (Canis lupus arctos)', 
      'Narwhal (Monodon monoceros)', 'Ribbon Seal (Histriophoca fasciata)', 'Harp Seal (Pagophilus groenlandicus)', 
      'Weddell Seal (Leptonychotes weddellii)', 'Crabeater Seal (Lobodon carcinophaga)', 'Ross Seal (Ommatophoca rossii)', 
      'Southern Elephant Seal (Mirounga leonina)', 'Gentoo Penguin (Pygoscelis papua)', 'Adélie Penguin (Pygoscelis adeliae)', 
      'Chinstrap Penguin (Pygoscelis antarcticus)', 'King Penguin (Aptenodytes patagonicus)', 'Rockhopper Penguin (Eudyptes chrysocome)', 
      'Macaroni Penguin (Eudyptes chrysolophus)', 'Antarctic Petrel (Thalassoica antarctica)', 'Snow Petrel (Pagodroma nivea)', 
      'Wandering Albatross (Diomedea exulans)', 'South Polar Skua (Stercorarius maccormicki)', 'Antarctic Tern (Sterna vittata)', 
      'Blue Whale (Balaenoptera musculus)', 'Minke Whale (Balaenoptera acutorostrata)', 'Killer Whale (Orcinus orca)', 
      'Sperm Whale (Physeter macrocephalus)', 'Fin Whale (Balaenoptera physalus)', 'Sei Whale (Balaenoptera borealis)', 
      'Ross Sea Killer Whale (Orcinus orca type C)', 'Colossal Squid (Mesonychoteuthis hamiltoni)', 'Antarctic Krill (Euphausia superba)', 
      'Arctic Tern (Sterna paradisaea)', 'Ptarmigan (Lagopus muta)', 'Lemming (Lemmini)', 'Wolverine (Gulo gulo)',
      'Beluga Whale (Delphinapterus leucas)'
    ],
    behaviors: [
      'Sliding down a jagged icy slope into the sea', 'Playing in deep, powdery snow', 
      'Peeking from behind a frozen snow ridge', 'Walking across floating ice floes at twilight', 
      'Navigating a blinding arctic blizzard', 'Fishing in a sub-zero lead in the ice pack',
      'Huddling for warmth in a massive colony', 'Breaching through a thin layer of sea ice'
    ],
    habitats: [
      'Shattered glacial valley', 'Vast Arctic steppe under a winter storm', 'Frozen northern fjords', 
      'Floating ice floes in the North Atlantic', 'Arctic tundra during the midnight sun', 
      'Icebound coastline of Antarctica', 'Underneath a massive ice shelf'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour rim lighting highlighting fur texture',
  'Harsh high-contrast noon sun casting sharp shadows',
  'Soft diffused overcast light through dense canopy',
  'Moonlit silhouettes against a starry sky',
  'Dappled sunlight through swaying leaves',
  'Electric blue lightning strike illuminating the scene',
  'Volumetric morning mist with god rays',
  'Glowing bioluminescent accents',
  'Twilight indigo haze',
  'Stormy grey heavy atmosphere with dramatic clouds',
  'Prismatic caustic light patterns dancing underwater',
  'Ethereal aurora borealis glow casting green light',
  'Warm desert sunset with deep orange gradients'
];

const MODIFIERS = [
  'National Geographic aesthetic', 'Macro extreme detail', 'High-speed shutter freeze',
  'Telephoto lens compression', 'Underwater housing clarity', 'Motion blur for speed',
  'Low-angle hero perspective', 'Aerial drone cinematography', 'Sharp eye-focus',
  'Shallow depth of field with creamy bokeh', 'Extreme wide-angle environmental shot'
];

const ENHANCERS = [
  '8K resolution', 'BBC Earth quality', 'hyper-realistic renders',
  'award-winning wildlife shot', 'perfect composition', 'volumetric scattering',
  'intricate fur and feather detail', 'professional color grading'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateNatureBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(ECOLOGICAL_GROUPS);
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

const output = generateNatureBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (UTF‑8 safe)');
