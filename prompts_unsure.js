// generate-video-prompts.js
const fs = require("fs");

// --- 100+ LOCATIONS ---
const locations = [
  "a misty Nordic fjord at sunrise",
  "a neon‑lit cyberpunk megacity at night",
  "a tropical island with crystal‑clear water",
  "a vast red‑sand desert with towering dunes",
  "a snowy mountain ridge above the clouds",
  "a dense rainforest canopy glowing with golden hour light",
  "an abandoned coastal fortress battered by waves",
  "a futuristic floating city hovering above the ocean",
  "a volcanic landscape with flowing lava rivers",
  "a sprawling savannah under a blazing sunset",
  "a frozen arctic wasteland with drifting ice sheets",
  "a lush valley carved by ancient glaciers",
  "a massive canyon with layered red rock formations",
  "a serene alpine lake reflecting towering peaks",
  "a stormy coastline with crashing waves",
  "a bioluminescent forest glowing at night",
  "a medieval castle perched on a cliffside",
  "a futuristic desert outpost surrounded by dunes",
  "a remote fishing village on stilts above turquoise water",
  "a massive waterfall plunging into a misty basin",
  "a dense bamboo forest swaying in the wind",
  "a sprawling vineyard in rolling hills",
  "a high‑altitude plateau with jagged rock formations",
  "a flooded ancient temple reclaimed by nature",
  "a neon‑soaked market district in a futuristic city",
  "a quiet rural countryside dotted with old barns",
  "a massive open‑pit mine with terraced layers",
  "a glowing lava field under a star‑filled sky",
  "a futuristic solar farm stretching to the horizon",
  "a remote monastery carved into a mountainside",
  "a vast tundra with migrating herds",
  "a dense mangrove swamp with winding waterways",
  "a massive glacier calving into the sea",
  "a serene Japanese garden in early morning mist",
  "a rugged coastline with towering sea stacks",
  "a futuristic megastructure rising above the clouds",
  "a sprawling coral reef visible through clear water",
  "a desert oasis surrounded by palm trees",
  "a remote island chain connected by sandbars",
  "a high‑tech industrial complex glowing at night",
  "a massive crater lake formed by an ancient impact",
  "a windswept prairie stretching endlessly",
  "a towering redwood forest with shafts of sunlight",
  "a futuristic floating research station",
  "a remote Arctic research base",
  "a massive hydroelectric dam spanning a canyon",
  "a glowing alien landscape with strange flora",
  "a serene monastery surrounded by cherry blossoms",
  "a rugged volcanic island rising from the sea",
  "a sprawling metropolis with layered highways",
  "a desert canyon filled with slot‑carved passages",
  "a snowy forest blanketed in fresh powder",
  "a massive abandoned shipyard",
  "a futuristic underwater dome city",
  "a remote lighthouse battered by storms",
  "a vast salt flat reflecting the sky",
  "a dense cloud forest dripping with moisture",
  "a massive wind farm spinning in strong gusts",
  "a futuristic vertical farm tower",
  "a remote tribal village deep in the jungle",
  "a sprawling ancient ruin overtaken by vines",
  "a massive bridge stretching across the ocean",
  "a glowing crystal cave opening to daylight",
  "a serene rice terrace landscape",
  "a futuristic hover‑train line cutting through mountains",
  "a remote desert plateau with strange rock spires",
  "a massive crater filled with turquoise water",
  "a storm‑ridden open ocean with towering waves",
  "a futuristic biodome ecosystem",
  "a sprawling junkyard of abandoned machines",
  "a remote canyon with hidden waterfalls",
  "a massive frozen lake with cracking ice",
  "a futuristic drone port buzzing with activity",
  "a quiet coastal village with colorful houses",
  "a towering cliffside monastery",
  "a glowing cyber‑forest with neon flora",
  "a remote island volcano with smoke plumes",
  "a massive stepwell descending underground",
  "a futuristic skybridge between megatowers",
  "a serene lavender field at sunset",
  "a rugged mountain pass with swirling snow",
  "a futuristic energy reactor complex",
  "a vast wheat field rippling in the wind",
  "a remote desert ghost town",
  "a massive sinkhole revealing hidden caverns",
  "a futuristic orbital elevator base",
  "a sprawling marshland with winding rivers",
  "a massive abandoned theme park",
  "a glowing geothermal field with steam vents",
  "a futuristic cyber‑harbor with floating docks",
  "a remote cliffside village overlooking the sea",
  "a massive canyon carved by ancient rivers",
  "a futuristic terraforming site on alien terrain",
  "a serene monastery floating above clouds",
  "a vast steppe with galloping herds",
  "a futuristic crystalline cityscape",
  "a remote polar desert with blue ice formations",
  "a massive underwater trench illuminated by drones"
];

// --- 100+ SUBJECTS ---
const subjects = [
  "wind rippling across tall grass",
  "birds flying far below as tiny silhouettes",
  "a lone wild horse galloping across the terrain",
  "a futuristic hover‑vehicle racing below",
  "a group of explorers trekking through the landscape",
  "a massive ancient statue partially buried in the earth",
  "a soaring eagle cutting through the sky",
  "a convoy of off‑road vehicles kicking up dust",
  "a waterfall cascading into a hidden valley",
  "a colossal sci‑fi structure dominating the skyline",
  "a migrating herd of elephants crossing the plains",
  "a lone astronaut surveying alien terrain",
  "a high‑speed train streaking across the landscape",
  "a pack of wolves moving through the snow",
  "a futuristic mech walking across the desert",
  "a group of monks walking in single file",
  "a massive cargo ship navigating rough seas",
  "a swarm of drones performing synchronized maneuvers",
  "a volcanic eruption sending ash into the sky",
  "a flock of birds forming shifting patterns",
  "a team of climbers ascending a sheer cliff",
  "a futuristic aircraft taking off vertically",
  "a lone lighthouse keeper walking the shoreline",
  "a massive whale breaching the ocean surface",
  "a group of surfers riding giant waves",
  "a futuristic robot dog scouting ahead",
  "a herd of wild bison thundering across the plains",
  "a glowing alien creature moving through the forest",
  "a team of scientists exploring a geothermal field",
  "a massive airship drifting overhead",
  "a group of samurai practicing in a courtyard",
  "a futuristic armored vehicle patrolling the desert",
  "a lone traveler crossing a vast dune sea",
  "a group of children flying kites in the wind",
  "a massive storm cell rotating ominously",
  "a futuristic drone swarm mapping terrain",
  "a pod of dolphins leaping through waves",
  "a group of firefighters battling a forest blaze",
  "a massive glacier collapsing into the sea",
  "a futuristic exosuit soldier scanning the horizon",
  "a herd of reindeer migrating across snow",
  "a lone wolf standing on a ridge",
  "a futuristic cargo drone delivering supplies",
  "a group of archaeologists uncovering ruins",
  "a massive sandstorm rolling across the desert",
  "a school of fish shimmering beneath the surface",
  "a futuristic hover‑bike weaving through canyons",
  "a group of dancers performing in an open plaza",
  "a massive tornado forming in the distance",
  "a lone tree standing in a barren landscape",
  "a futuristic scout drone scanning the area",
  "a group of nomads traveling with pack animals",
  "a massive waterfall exploding into mist",
  "a futuristic sentinel robot guarding a facility",
  "a herd of wild horses running free",
  "a group of skydivers performing formations",
  "a massive meteor streaking across the sky",
  "a futuristic rover exploring rocky terrain",
  "a group of kayakers navigating rapids",
  "a massive flock of starlings swirling in unison",
  "a futuristic mining machine carving rock",
  "a group of farmers harvesting crops",
  "a massive iceberg drifting through the sea",
  "a futuristic drone racing through obstacles",
  "a group of monks lighting lanterns",
  "a massive thunderhead building overhead",
  "a futuristic humanoid robot walking alone",
  "a group of hikers crossing a suspension bridge",
  "a massive manta ray gliding underwater",
  "a futuristic shuttle landing vertically",
  "a group of soldiers marching in formation",
  "a massive dust storm engulfing the horizon",
  "a futuristic AI‑controlled vehicle convoy",
  "a group of musicians performing outdoors",
  "a massive wave crashing against cliffs",
  "a futuristic sky‑freighter unloading cargo",
  "a group of wildlife photographers tracking animals",
  "a massive sinkhole opening suddenly",
  "a futuristic drone‑taxi flying overhead",
  "a group of engineers repairing a megastructure",
  "a massive plume of volcanic ash rising",
  "a futuristic robotic swarm repairing infrastructure",
  "a group of surfers waiting for the perfect wave",
  "a massive herd of wildebeest migrating",
  "a futuristic terraforming machine altering terrain",
  "a group of spelunkers entering a cavern",
  "a massive lightning bolt striking nearby",
  "a futuristic hover‑tank rolling across the plains",
  "a group of villagers celebrating a festival",
  "a massive avalanche cascading down a slope",
  "a futuristic sky‑train gliding silently",
  "a group of scientists releasing weather balloons",
  "a massive whale shark drifting through clear water",
  "a futuristic drone‑camera filming autonomously",
  "a group of adventurers crossing a rope bridge",
  "a massive plume of steam rising from vents",
  "a futuristic mech‑suit worker repairing structures",
  "a group of paragliders soaring on thermals",
  "a massive celestial object looming overhead"
];

// --- WEATHER (used as TIME descriptor) ---
const weather = [
  "golden hour sunset",
  "dramatic storm-light skies",
  "soft drifting snow",
  "dense morning fog",
  "sunbeams breaking through clouds",
  "clear blue midday light",
  "deep twilight ambience",
  "neon-lit night atmosphere"
];

// --- CAMERA MOVES ---
const cameraMoves = [
  "high-altitude aerial panorama",
  "slow forward drone glide",
  "top-down vertical reveal shot",
  "orbiting cinematic sweep",
  "smooth parallax fly-by",
  "fast forward chase descent",
  "slow rising tilt to reveal scale",
  "wide establishing flyover"
];

// --- MOODS ---
const moods = [
  "epic sense of scale",
  "awe-inspiring natural grandeur",
  "mysterious atmospheric tension",
  "serene dreamlike calm",
  "dramatic cinematic intensity",
  "warm nostalgic immersion",
  "tense foreboding energy",
  "majestic uplifting wonder"
];

// --- VISUAL STYLES ---
const visualStyles = [
  "natural cinematic color grading",
  "ultra high resolution detail",
  "crisp environmental textures",
  "volumetric sunlight rays",
  "soft atmospheric haze",
  "high-contrast golden hour tones",
  "deep shadows with glowing highlights",
  "hyper-realistic environmental rendering"
];

// --- RANDOM PICKER ---
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- PROMPT GENERATOR (FORMATTED FOR video.js) ---
function generateFormattedPrompt() {
  return `LOCATION: ${random(locations)} - TIME: ${random(weather)} - MOTION: ${random(subjects)} - MOOD: ${random(moods)} - CAMERA: ${random(cameraMoves)} - VISUAL STYLE: ${random(visualStyles)}`;
}

// --- GENERATE MULTIPLE PROMPTS ---
const NUM_VIDEOS = 20; // adjust as needed
let output = "const videos = [];\n";

for (let i = 0; i < NUM_VIDEOS; i++) {
  output += `videos[${i}] = \`${generateFormattedPrompt()}\`;\n`;
}

output += `module.exports = videos;`;

// --- WRITE TO video.js ---
fs.writeFileSync("videos.js", output, "utf8");

console.log("✔ videos.js has been generated with", NUM_VIDEOS, "video prompts.");
