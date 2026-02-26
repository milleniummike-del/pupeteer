/**
 * PromptForge: Fantasy Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node prompts_fantasy.js [count]
 */

const fs = require('fs');

// ---------------------------------------------------------
// FANTASY GROUPS DATASET
// ---------------------------------------------------------
const FANTASY_GROUPS = [
  {
    label: 'Heroes & Fellowship',
    species: [
      'Gondorian Ranger', 'Istari Wizard', 'Noble Knight of Narnia', 
      'Elven Archer from Mirkwood', 'Dwarven Axeman of Erebor', 'Halfling Rogue', 
      'Paladin of the Silver Hand', 'High King of Men', 'Mystic Seer', 
      'Beorn skin-changer', 'Shieldmaiden of Rohan', 'Royal Guard', 
      'Nomadic Tracker', 'Ancient Sage', 'Valiant Prince', 
      'Guardian of the Sacred Grove', 'Wandering Bard', 'Champion of Light'
    ],
    behaviors: [
      'Drawing a glowing blade in the face of darkness', 'Reciting an ancient incantation that echoes through the halls', 
      'Riding a white steed across the golden plains', 'Sharing a moment of camaraderie by a crackling campfire', 
      'Standing defiant against an overwhelming shadow', 'Pledging an oath of honor on a family heirloom', 
      'Tracking a mysterious trail through the whispering woods', 'Gazing at the distant mountains with hope and resolve',
      'Defending a humble village from a marauding threat', 'Unfurling a tattered map to plan the next adventure'
    ],
    habitats: [
      'The soaring white spires of a majestic citadel', 'A cozy hole under a rolling green hill', 
      'Ancient stone ruins overgrown with ivy and magic', 'A hidden valley where time seems to stand still', 
      'The Great Hall of a mountain fortress', 'A starlit balcony overlooking an endless forest', 
      'A mist-shrouded bridge over a bottomless chasm', 'The throne room of a long-lost kingdom', 
      'A sun-dappled glade deep within an enchanted woods', 'A windswept ridge overlooking a field of battle'
    ],
  },

  {
    label: 'Mythical Creatures',
    species: [
      'Great Fire-Drake', 'Silver-maned Pegasus', 'Forest-dwelling Ent', 
      'Golden Phoenix', 'Mountain Giant', 'Ancient Sea Serpent', 
      'Twin-headed Griffin', 'Shadowy Warg', 'Celestial Stag', 
      'Frost Giant of the North', 'Winged Fell Beast', 'Crystal Golem',
      'Emerald Hydra', 'Majestic Centaur', 'Sovereign Eagle'
    ],
    behaviors: [
      'Hoarding a mountain of shimmering gold and jewels', 'Soaring through the clouds with a deafening screech', 
      'Awakening from a centuries-long slumber in the deep earth', 'Protecting the heart of the forest with ancient wisdom', 
      'Engaging in an epic aerial duel above the peaks', 'Drinking from a moonlit pool of liquid starlight', 
      'Summoning a localized storm with a flap of mighty wings', 'Guarding the entrance to a forbidden labyrinth', 
      'Resonating with the natural rhythm of the earth', 'Vanishing into the mist with a haunting cry'
    ],
    habitats: [
      'A cavernous lair filled with the treasures of ages', 'The peak of a mountain that touches the stars', 
      'A dense jungle where the trees walk and talk', 'The swirling depths of an azure ocean', 
      'A floating island suspended by ancient ley lines', 'A volcanic crater glowing with inner fire', 
      'A hidden oasis in the middle of a shifting desert', 'The ruins of a temple dedicated to forgotten gods', 
      'A field of wildflowers that never fade', 'The edge of the world where the sky meets the sea'
    ],
  },

  {
    label: 'Dark Forces & Monsters',
    species: [
      'Wraith of the Nine', 'Orc Chieftain', 'Uruk-hai Captain', 
      'Ancient Lich', 'Shadow Demon', 'Cave Troll', 
      'Venomous Giant Spider', 'Dark Sorcerer', 'Blighted Treant', 
      'Skeleton Knight', 'Goblin King', 'Chaos Elemental', 
      'Nightmare Steed', 'Void Stalker', 'Abyssal Horror'
    ],
    behaviors: [
      'Emerging from the shadows with a chilling hiss', 'Commanding a legion of darkness from a black throne', 
      'Forging a weapon of malice in the fires of doom', 'Corrupting the land with every step taken', 
      'Howling a battle cry that strikes terror into the brave', 'Searching the horizon with a burning, lidless eye', 
      'Spinning a web of deceit and literal silk', 'Marching in lockstep through a desolate wasteland', 
      'Casting a dark spell that eclipses the sun', 'Lurking in the lightless depths of a forgotten mine'
    ],
    habitats: [
      'A fortress of obsidian and eternal shadow', 'The blasted plains of a scorched land', 
      'A damp and claustrophobic cave system', 'A cursed forest where the sun never shines', 
      'The ruins of a city reclaimed by the underworld', 'A tower of iron reaching into a stormy sky', 
      'A swamp of black bile and skeletal remains', 'The threshold of the void', 
      'A battlefield littered with the remnants of fallen heroes', 'A temple of malice carved from a single ruby'
    ],
  },

  {
    label: 'Ancient Races & Cities',
    species: [
      'High Elf Architect', 'Dwarven Master Smith', 'Wood Elf Scout', 
      'Numenorean Mariner', 'Stone-giant Hermit', 'Faerie Queen', 
      'Deep-sea Atlantean', 'Desert Nomad King', 'Sky-dwelling Avariel', 
      'Ancient Spirit of the Mountain', 'Library Guardian', 'Moon-elf Priestess'
    ],
    behaviors: [
      'Crafting a legendary artifact with rhythmic hammer blows', 'Singing a song that makes the flowers bloom', 
      'Studying a scroll that contains the secrets of the stars', 'Sailing a white-winged ship into the West', 
      'Sculpting the very living rock into beautiful shapes', 'Dancing in a circle under the full moon', 
      'Guarding a library of infinite knowledge', 'Navigating the currents of magic in the air', 
      'Communing with the spirits of the ancestors', 'Presiding over a council of the wise'
    ],
    habitats: [
      'A city of white marble carved into a cliffside', 'Deep subterranean halls illuminated by crystals', 
      'A treetop village connected by rope bridges', 'A port city with ships made of swan-wood', 
      'A desert palace made of shimmering glass', 'A library that stretches into other dimensions', 
      'A garden where the statues speak and move', 'A lighthouse that guides souls across the sea', 
      'A forge powered by the heart of a star', 'A crystal spire that pierces the clouds'
    ],
  }
];

// ---------------------------------------------------------
// OTHER DATA ARRAYS
// ---------------------------------------------------------
const LIGHTING = [
  'Ethereal moonlight filtering through enchanted leaves',
  'The warm, flickering glow of a hundred torches',
  'A dramatic sunrise over the peaks of the Misty Mountains',
  'The harsh, ominous red light of a volcanic eruption',
  'Soft, golden morning light on the dew-covered fields',
  'God rays piercing through the stained glass of a cathedral',
  'The bioluminescent glow of strange fungi in a deep cave',
  'A magical aura of shimmering blue energy',
  'Twilight purple haze over a tranquil lake',
  'The brilliant, blinding flash of a sorcerer’s spell',
  'Fading embers of a dying sun casting long, epic shadows',
  'Starlight reflecting off the polished surface of a magic pool',
  'Warm hearthfire lighting up a cozy interior'
];

const MODIFIERS = [
  'Epic cinematic wide shot', 'Lord of the Rings aesthetic', 'Chronicles of Narnia atmosphere',
  'Hyper-detailed armor and fabric', 'Painterly concept art style', 'Low-angle heroic perspective',
  'Magical particle effects', 'Atmospheric depth and fog', 'Intricate rune carvings',
  'Dramatic silhouette against the sky', 'Close-up of a legendary weapon',
  'Vibrant fantasy colors', 'Mythic atmosphere'
];

const ENHANCERS = [
  '8K UHD resolution', 'Weta Workshop quality', 'Stunning fantasy illustration',
  'Masterpiece composition', 'Volumetric lighting', 'Unreal Engine 5 render',
  'High-fantasy epic scale', 'Professional digital art grading'
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

// ---------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------
const generateFantasyBatch = (count = 20) => {
  const lines = [];
  lines.push(`const videos = [];`);

  for (let i = 0; i < count; i++) {
    const group = getRandom(FANTASY_GROUPS);
    const spec = getRandom(group.species);
    const bhv = getRandom(group.behaviors);
    const hab = getRandom(group.habitats);
    const light = getRandom(LIGHTING);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');

    lines.push(
      "videos[" + i + "] = `- THEME: Fantasy - CHARACTER/ENTITY: " + spec + " - ACTION: " + bhv + " - LOCATION: " + hab + " - LIGHTING: " + light + " - MODIFIERS: " + mods + " - ENHANCERS: " + enh + "`;"
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

const output = generateFantasyBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully with fantasy prompts (UTF‑8 safe)');
