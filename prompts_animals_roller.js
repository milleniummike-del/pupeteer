/**
 * PromptForge: Photorealistic Animal Rollercoaster Generator
 * Usage: node rollercoaster_animals_realistic.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// ANIMALS (REALISTIC SPECIES)
// ---------------------------------------------------------
const ANIMALS = [
  "Aardvark","Aardwolf","African Buffalo","African Bush Elephant","African Civet",
  "African Grey Parrot","African Wild Dog","Agouti","Albatross","Alligator",
  "Alpaca","Anaconda","Angelfish","Ant","Anteater","Antelope","Armadillo",
  "Axolotl","Aye-Aye","Baboon","Badger","Bald Eagle","Bandicoot","Barn Owl",
  "Barracuda","Basilisk Lizard","Bass","Bat","Bearded Dragon","Beaver","Bee",
  "Beluga Whale","Bengal Tiger","Bighorn Sheep","Bison","Black Bear",
  "Black Mamba","Black Panther","Black Rhinoceros","Black Widow Spider",
  "Blue Jay","Blue Tang","Blue Whale","Boa Constrictor","Bobcat","Bonobo",
  "Booby","Bongo","Bottlenose Dolphin","Box Jellyfish","Brown Bear","Buffalo",
  "Bull","Bullfrog","Bumblebee","Burro","Bushbaby","Butterfly","Camel",
  "Capuchin Monkey","Capybara","Caracal","Caribou","Carp","Cassowary","Cat",
  "Caterpillar","Catfish","Cheetah","Chicken","Chimpanzee","Chinchilla",
  "Chipmunk","Cicada","Clam","Clownfish","Cobra","Cockatoo","Cockroach",
  "Cod","Condor","Coot","Cormorant","Cougar","Cow","Coyote","Crab","Crane",
  "Crawfish","Cricket","Crocodile","Crow","Cuckoo","Cuttlefish","Dachshund",
  "Dalmatian","Damselfish","Deer","Dhole","Dingo","Dodo","Dog","Dolphin",
  "Donkey","Dormouse","Dove","Dragonfly","Duck","Dugong","Dung Beetle",
  "Eagle","Earthworm","Echidna","Eel","Egret","Elephant","Elk","Emu",
  "Ermine","Falcon","Fangtooth Fish","Ferret","Finch","Fire Ant","Firefly",
  "Fish","Flamingo","Flea","Fly","Flying Fox","Fox","Frog","Gazelle",
  "Gecko","Gerbil","Gharial","Giant Anteater","Giant Panda","Giant Squid",
  "Gibbon","Gila Monster","Giraffe","Goat","Goldfish","Goose","Gopher",
  "Gorilla","Grasshopper","Great Dane","Great White Shark","Green Iguana",
  "Grey Wolf","Grizzly Bear","Groundhog","Grouper","Guanaco","Guinea Fowl",
  "Guinea Pig","Gull","Hamster","Hammerhead Shark","Harpy Eagle","Hare",
  "Hawk","Hedgehog","Hermit Crab","Heron","Herring","Hippopotamus","Honeybee",
  "Hornbill","Hornet","Horse","Hummingbird","Humpback Whale","Hyena","Ibis",
  "Iguana","Impala","Jackal","Jaguar","Jellyfish","Jerboa","Kakapo","Kangaroo",
  "Kangaroo Rat","King Cobra","Kingfisher","Kinkajou","Kiwi","Koala","Komodo Dragon",
  "Kookaburra","Kudu","Ladybug","Lamprey","Lancehead","Lark","Lemming","Lemur",
  "Leopard","Leopard Seal","Liger","Lion","Lionfish","Lizard","Llama","Lobster",
  "Locust","Loon","Lynx","Macaw","Magpie","Mako Shark","Mallard","Manatee",
  "Mandrill","Manta Ray","Marlin","Marmot","Meerkat","Millipede","Mink","Mole",
  "Mollusk","Mongoose","Monitor Lizard","Monkey","Moose","Moray Eel","Mosquito",
  "Moth","Mountain Goat","Mountain Lion","Mouse","Mule","Narwhal","Nautilus",
  "Newt","Nightingale","Nile Crocodile","Numbat","Ocelot","Octopus","Okapi",
  "Opossum","Orangutan","Orca","Ostrich","Otter","Owl","Ox","Oyster","Panda",
  "Panther","Parakeet","Parrot","Parrotfish","Partridge","Peacock","Pelican",
  "Penguin","Peregrine Falcon","Pheasant","Pig","Pigeon","Pike","Piranha",
  "Platypus","Polar Bear","Pony","Porcupine","Porpoise","Possum","Prairie Dog",
  "Prawn","Praying Mantis","Proboscis Monkey","Pufferfish","Puma","Python",
  "Quail","Quelea","Quetzal","Rabbit","Raccoon","Rainbow Trout","Rat","Rattlesnake",
  "Raven","Red Fox","Red Panda","Reindeer","Rhinoceros","Roadrunner","Robin",
  "Rockfish","Rooster","Saber-Toothed Cat","Salamander","Salmon","Sandpiper",
  "Sardine","Scallop","Scorpion","Sea Cucumber","Sea Lion","Sea Otter",
  "Sea Turtle","Seahorse","Seal","Serval","Shark","Sheep","Shrew","Shrimp",
  "Siamang","Siberian Tiger","Silverfish","Skink","Skunk","Sloth","Slug","Smelt",
  "Snail","Snake","Snow Leopard","Snowshoe Hare","Sparrow","Spider","Spoonbill",
  "Squid","Squirrel","Starfish","Stingray","Stoat","Stork","Sturgeon","Swan",
  "Swordfish","Tamarin","Tapir","Tarantula","Tarsier","Tasmanian Devil","Termite",
  "Tetra","Thrush","Tiger","Tiger Shark","Toad","Tortoise","Toucan","Trout",
  "Tuna","Turkey","Turtle","Uakari","Umbrellabird","Urchin","Vampire Bat",
  "Vervet Monkey","Vicuña","Viper","Vulture","Wallaby","Walrus","Warthog",
  "Wasp","Water Buffalo","Weasel","Whale","Whippet","White Tiger","White-Tailed Deer",
  "Wild Boar","Wildebeest","Wolf","Wolverine","Wombat","Woodpecker","Worm",
  "Wrasse","Yak","Yellowfin Tuna","Zebra","Zebu","Zorilla",

  // Additional unique animals to reach 500:
  "Addax","Adelie Penguin","African Clawed Frog","African Palm Civet","Agama",
  "Albatross","Alligator Gar","Amazon River Dolphin","American Badger",
  "American Bison","American Kestrel","American Robin","Amphiuma","Anemone",
  "Anglerfish","Anhinga","Anole","Archerfish","Arctic Fox","Arctic Hare",
  "Arctic Wolf","Argali","Armadillo Lizard","Asian Elephant","Asian Giant Hornet",
  "Asian Palm Civet","Asiatic Black Bear","Avocet","Babirusa","Bactrian Camel",
  "Banded Mongoose","Barasingha","Barnacle","Barramundi","Basilisk","Batfish",
  "Beisa Oryx","Beluga Sturgeon","Binturong","Bird-of-Paradise","Bison",
  "Bittern","Black Caiman","Black Kite","Black Lemur","Black Swan","Blackbuck",
  "Bluebird","Bluet","Boa","Bobolink","Bontebok","Boomslang","Bowerbird",
  "Box Turtle","Brant Goose","Bream","Brown Hyena","Budgerigar","Buff-Crested Bustard",
  "Bush Viper","Caiman","Camel Spider","Canada Goose","Cane Toad","Canvasback",
  "Caracal","Carangid","Carpet Python","Cassowary","Caterpillar Hunter",
  "Cavy","Cecropia Moth","Centipede","Chameleon","Chamois","Charr","Cheetah Gecko",
  "Chickadee","Chimaera","Chinook Salmon","Chipmunk","Civet","Clown Beetle",
  "Coati","Cobra Lily Beetle","Cockle","Coelacanth","Collared Peccary","Colobus Monkey",
  "Comorant","Conch","Coot","Copperhead","Coral","Cormorant","Cottonmouth",
  "Coyote","Crane Fly","Crested Gecko","Cricket Frog","Crocodile Monitor",
  "Crowned Eagle","Cuckoo Wasp","Curlew","Cuscus","Cuttlefish","Dace","Darter",
  "Dassie","Death Adder","Desert Tortoise","Dik-Dik","Dingo","Dipper","Doberman",
  "Dolphinfish","Dormouse","Dotterel","Dragon Moray","Drongo","Duckbill",
  "Dunlin","Eagle Ray","Earwig","Eastern Bluebird","Eastern Chipmunk",
  "Eastern Cottontail","Eastern Indigo Snake","Eelpout","Egret","Eland",
  "Electric Eel","Elephant Seal","Elver","Emperor Penguin","Emperor Tamarin",
  "Emerald Tree Boa","Ermine","Eurasian Lynx","Eurasian Sparrowhawk",
  "European Badger","European Hare","European Robin","Falconet","Fallow Deer",
  "False Killer Whale","Fangtooth Moray","Field Mouse","Fin Whale","Fire Salamander",
  "Fisher","Flounder","Flying Squirrel","Fossa","Frigatebird","Frilled Lizard",
  "Frogfish","Gadwall","Galago","Galapagos Tortoise","Gannet","Garfish",
  "Gaur","Gazelle","Geoduck","Gerenuk","Gharial","Giant Clam","Giant Isopod",
  "Giant Otter","Giant Salamander","Giant Tortoise","Gila Woodpecker",
  "Glass Frog","Glowworm","Gnat","Goanna","Golden Eagle","Golden Lion Tamarin",
  "Golden Mole","Goldfinch","Gopher Tortoise","Goral","Goshawk","Grass Snake",
  "Great Argus","Great Curassow","Great Horned Owl","Great Kiskadee",
  "Great Tit","Greater Kudu","Green Anole","Green Frog","Green Heron",
  "Green Sea Turtle","Green Woodpecker","Grey Seal","Grison","Grouse",
  "Guereza","Guillemot","Guppy","Haddock","Hagfish","Hairy Frogfish",
  "Hammerkop","Harrier","Hartebeest","Hawk Moth","Hedge Sparrow","Helmeted Guineafowl",
  "Hen","Hercules Beetle","Herring Gull","Hoatzin","Hogfish","Hoopoe",
  "Horned Lizard","Horned Toad","Horsefly","House Finch","House Mouse",
  "House Sparrow","Howler Monkey","Human","Hutia","Ibex","Ibisbill","Icterid",
  "Iguanodon","Impala","Indri","Insect","Jackrabbit","Jaeger","Jaguarundi",
  "Jay","Jellycat","Jerboa","Junco","Kagu","Kakapo","Kangaroo Mouse",
  "Katydid","Kea","Kestrel","Killdeer","Killifish","King Penguin","King Rat Snake",
  "King Vulture","Kite","Kiwifruit Bird","Klipspringer","Knot","Kodiak Bear",
  "Koi","Kookaburra","Kori Bustard","Kouprey","Kudu","Ladyfish","Lamprey",
  "Lapwing","Lark","Leaf Insect","Leafcutter Ant","Leatherback Turtle",
  "Leech","Lemming","Limpet","Lion Tamarin","Little Auk","Lizardfish",
  "Loach","Loris","Lungfish","Lynx","Macaroni Penguin","Macaque","Macaw",
  "Maggot","Magpie Goose","Mahseer","Mako","Malayan Tapir","Mallard Duck",
  "Manakin","Mandarin Duck","Mandarin Fish","Mangrove Snake","Manx Cat",
  "Margay","Markhor","Marmot","Marsupial Mole","Marten","Mastiff","Mayfly",
  "Mealybug","Meerkat","Megamouth Shark","Merlin","Merganser","Millipede",
  "Mink","Minnow","Mole Cricket","Molly","Monitor","Monkey","Monkfish",
  "Moose","Moray","Moth","Mountain Hare","Mudskipper","Mule Deer","Muntjac",
  "Musk Ox","Musk Turtle","Muskrat","Nabarlek","Nandu","Natterjack Toad",
  "Nautilus","Needlefish","Nene","Nighthawk","Nightingale","Nilgai","Nudibranch",
  "Nuthatch","Nyala","Oarfish","Ocelot","Ochre Sea Star","Olingo","Olm",
  "Opossum","Oribi","Oriole","Oryx","Osprey","Ostrich","Otterhound","Ovenbird",
  "Owl Monkey","Oxpecker","Paca","Paddlefish","Painted Dog","Pangolin",
  "Paradise Fish","Parrotlet","Partridge","Peafowl","Peccary","Pekingese",
  "Pelagic Cormorant","Peregrine","Petrel","Pheasant","Pied Crow","Pika",
  "Pine Marten","Pintail","Pipit","Piranha","Pitta","Platy","Plover",
  "Polecat","Polyp","Pompano","Potoroo","Prawn","Pronghorn","Ptarmigan",
  "Puffin","Puma","Purple Gallinule","Python","Quagga","Quokka","Quoll",
  "Rabbitfish","Raccoon Dog","Ragfish","Rail","Ram","Rattler","Ray",
  "Red Deer","Red Kite","Red Squirrel","Redstart","Reedbuck","Reef Shark",
  "Reindeer","Rhea","Ringtail","River Dolphin","Roadrunner","Robin",
  "Rock Hyrax","Rock Ptarmigan","Rodent","Rook","Rooster","Roughy",
  "Ruddy Duck","Ruff","Sable","Sailfish","Salamander","Salmon Shark",
  "Sand Cat","Sand Dollar","Sandhill Crane","Saola","Sardine","Sawfish",
  "Scaup","Scorpionfish","Sea Dragon","Sea Hare","Sea Robin","Sea Snake",
  "Seahorse","Seal","Serval","Shad","Shark","Shearwater","Shelduck",
  "Shiner","Shrike","Siamese Cat","Sifaka","Silkworm","Silver Dollar Fish",
  "Silverback Gorilla","Skate","Skimmer","Skua","Slender Loris","Sloth Bear",
  "Smew","Snook","Snow Goose","Snowy Owl","Solenodon","Sparrowhawk",
  "Spider Monkey","Spiny Lobster","Spoonbill","Sprat","Squab","Squirrel Monkey",
  "Starling","Steenbok","Stilt","Stingray","Stoat","Stonefish","Stork",
  "Sturgeon","Sun Bear","Sunbird","Swallow","Swift","Swordtail","Tahr",
  "Takin","Tamandua","Tanager","Tang","Tapir","Tarantula Hawk","Tarsier",
  "Tasmanian Tiger","Teal","Termite","Tern","Thrasher","Thrush","Tick",
  "Tiger Beetle","Tiger Salamander","Tinamou","Titi Monkey","Toadfish",
  "Topi","Tortoise","Toucanet","Tree Frog","Tree Kangaroo","Trout",
  "Trumpeter Swan","Tsetse Fly","Tuatara","Tuna","Turkey Vulture","Turtle Dove",
  "Uromastyx","Urial","Vanga","Vaquita","Vervet","Vicuña","Vine Snake",
  "Viperfish","Vireo","Vole","Vulture","Wagtail","Wallaroo","Walleye",
  "Wapiti","Warbler","Warthog","Water Dragon","Water Monitor","Waxwing",
  "Weaver","Weevil","Whale Shark","Whimbrel","Whippoorwill","Whiptail Lizard",
  "White Rhino","Whooper Swan","Widgeon","Wildcat","Wildebeest","Willet",
  "Wobbegong","Woodcock","Woodlouse","Woodrat","Woolly Monkey","Wolverine",
  "Wombat","Wren","Wrentit","Xerus","Xingu River Ray","X-ray Tetra",
  "Yak","Yellowhammer","Yellowjacket","Yellowtail Snapper","Yeti Crab",
  "Zander","Zebra Finch","Zebra Shark","Zebu","Zokor","Zorilla","Zorro"
];

const landmarks = ['Eiffel Tower', 'Louvre Museum', 'Colosseum', 'St. Peter’s Basilica', 'Big Ben and Houses of Parliament', 'Tower Bridge', 'Sagrada Familia', 'Acropolis', 'Brandenburg Gate', 'Neuschwanstein Castle', 'Burj Khalifa', 'Sheikh Zayed Grand Mosque', 'Petronas Towers', 'Marina Bay Sands', 'Great Wall near Beijing', 'Forbidden City', 'Tokyo Skytree', 'Shibuya Crossing', 'Taj Mahal', 'Statue of Liberty', 'Empire State Building', 'Central Park skyline', 'Golden Gate Bridge', 'Hollywood Sign', 'Las Vegas Strip', 'Christ the Redeemer', 'Machu Picchu', 'Chichen Itza pyramid', 'Sydney Opera House', 'Harbour Bridge', 'Table Mountain cableway', 'Pyramids of Giza'];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {

    // 1–3 animals
    const animals = pickN(ANIMALS, Math.floor(Math.random() * 3) + 1).join(' + ');
    const locations = pickN(landmarks, Math.floor(Math.random() * 3) + 1).join(' + ');


    lines.push(
      `videos[${i}] = \`photorealistic video of - ANIMALS: ${animals} seated in a rollercoaster cart as the rollercoaster comes down a steep hill CAMERA: selfie front view - ENVIRONMENT: large-scale steel rollercoaster in a theme park\`;`
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

const output = generateBatch(count);

fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('🎢 Photorealistic animal rollercoaster prompts generated successfully');