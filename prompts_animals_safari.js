/**
 * PromptForge: African Safari Animal Generator CLI (Expanded Edition)
 * Usage: node prompts_animals_safari.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// SAFARI ECOLOGICAL GROUPS DATASET (20+ SPECIES EACH)
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
    behaviors: [
      'Leading a herd through a dust storm on the open plains',
      'Surveying the vast landscape from a high granite kopje',
      'Moving with powerful grace through thick vegetation',
      'Kicking up thick dust in a defensive formation',
      'Grazing peacefully in early morning mist',
      'Engaging in a powerful display of dominance',
      'Emerging from the water in a territorial display',
      'Sunning itself on muddy riverbanks'
    ],
    habitats: [
      'The vast plains of the Serengeti',
      'The Okavango Delta flood channels',
      'Ngorongoro Crater slopes',
      'Arid acacia scrubland of Tsavo',
      'Baobab landscapes of Tarangire',
      'Kalahari desert edge',
      'Chobe floodplains'
    ],
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
      'Topi (Damaliscus lunatus jimela)',
      'Hartebeest (Alcelaphus buselaphus)',
      'Tsessebe (Damaliscus lunatus)',
      'Eland (Taurotragus oryx)',
      'Steenbok (Raphicerus campestris)',
      'Klipspringer (Oreotragus oreotragus)',
      'Dik-dik (Madoqua kirkii)',
      'Oribi (Ourebia ourebi)',
      'Reedbuck (Redunca arundinum)'
    ],
    behaviors: [
      'Sprinting across the savanna at full speed',
      'Huddling tightly to confuse predators',
      'Crossing a dangerous river during migration',
      'Performing high leaps into the air',
      'Standing alert in tall grass',
      'Silhouetted against a vivid sunset',
      'Galloping across the horizon'
    ],
    habitats: [
      'Short-grass plains',
      'Dry savanna with thorn trees',
      'Mopane woodland',
      'Riverine forest edges',
      'Etosha salt pans',
      'Maasai Mara hills'
    ],
  },

  {
    label: 'Scavengers & Small Wonders',
    species: [
      'Spotted Hyena (Crocuta crocuta)',
      'Striped Hyena (Hyaena hyaena)',
      'Brown Hyena (Parahyaena brunnea)',
      'African Wild Dog (Lycaon pictus)',
      'Black-backed Jackal (Lupulella mesomelas)',
      'Side-striped Jackal (Lupulella adusta)',
      'Honey Badger (Mellivora capensis)',
      'Meerkat (Suricata suricatta)',
      'Banded Mongoose (Mungos mungo)',
      'Dwarf Mongoose (Helogale parvula)',
      'Warthog (Phacochoerus africanus)',
      'Aardvark (Orycteropus afer)',
      'Aardwolf (Proteles cristata)',
      'Serval (Leptailurus serval)',
      'Caracal (Caracal caracal)',
      'African Civet (Civettictis civetta)',
      'Genet (Genetta genetta)',
      'Bat-eared Fox (Otocyon megalotis)',
      'Cape Fox (Vulpes chama)',
      'Ground Pangolin (Smutsia temminckii)',
      'Springhare (Pedetes capensis)'
    ],
    behaviors: [
      'Competing over a carcass at night',
      'Hunting in coordinated packs',
      'Standing guard at a burrow',
      'Running with tail raised',
      'Leaping to catch prey mid-air',
      'Facing off larger predators',
      'Scavenging through tall grass'
    ],
    habitats: [
      'Termite mound landscapes',
      'Dry riverbeds',
      'Rocky kopjes',
      'Burrow-filled plains',
      'Tall grass regions',
      'Woodland edges'
    ],
  },

  {
    label: 'Birds of the Savanna',
    species: [
      'Ostrich (Struthio camelus)',
      'Somali Ostrich (Struthio molybdophanes)',
      'Secretary Bird (Sagittarius serpentarius)',
      'Kori Bustard (Ardeotis kori)',
      'Denham’s Bustard (Neotis denhami)',
      'Lappet-faced Vulture (Torgos tracheliotos)',
      'White-backed Vulture (Gyps africanus)',
      'Rüppell’s Vulture (Gyps rueppelli)',
      'African Fish Eagle (Icthyophaga vocifer)',
      'Martial Eagle (Polemaetus bellicosus)',
      'Tawny Eagle (Aquila rapax)',
      'Lilac-breasted Roller (Coracias caudatus)',
      'European Roller (Coracias garrulus)',
      'Grey Crowned Crane (Balearica regulorum)',
      'Marabou Stork (Leptoptilos crumenifer)',
      'Saddle-billed Stork (Ephippiorhynchus senegalensis)',
      'Ground Hornbill (Bucorvus leadbeateri)',
      'Yellow-billed Hornbill (Tockus leucomelas)',
      'Red-billed Oxpecker (Buphagus erythrorhynchus)',
      'Superb Starling (Lamprotornis superbus)',
      'Weaver Bird (Ploceus spp.)'
    ],
    behaviors: [
      'Running at high speed across plains',
      'Striking prey with powerful legs',
      'Circling on thermal currents',
      'Diving to catch fish',
      'Performing aerial acrobatics',
      'Perching on large mammals',
      'Engaging in courtship dance'
    ],
    habitats: [
      'Acacia treetops',
      'Waterhole edges',
      'Open sky',
      'Tall grass',
      'Riverbank trees'
    ],
  }
];

// ---------------------------------------------------------
// VALIDATION (ENSURES ≥20 SPECIES)
// ---------------------------------------------------------
ECOLOGICAL_GROUPS.forEach(group => {
  if (group.species.length < 20) {
    throw new Error(`Group "${group.label}" has fewer than 20 species.`);
  }
});

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Golden hour dust glow',
  'Blood-red sunset silhouette',
  'Soft dawn haze',
  'Harsh midday contrast',
  'Moonlit savanna under stars',
  'Storm clouds over plains',
  'Dappled forest light',
  'Campfire glow',
  'Blue twilight moonrise'
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
const generateSafariBatch = (count = 20) => {
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
      `videos[${i}] = \`video of - SPECIES: ${spec} - BEHAVIOR: ${bhv} - HABITAT: ${hab} - LIGHTING: ${light} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`
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

const output = generateSafariBatch(count);

// Write file
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (Safari Expanded Edition)');