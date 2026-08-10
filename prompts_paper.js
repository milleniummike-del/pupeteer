/**
 * PromptForge: Viral PaperCraft ASMR Generator CLI (Single-File, UTF-8 Safe)
 * Usage: node papercraft_prompts.js [count]
 * Default count: 20
 */

const fs = require('fs');

const SUGGESTIONS = {
  themes: [
    'floating dream islands',
    'miniature cloud kingdoms',
    'whimsical treehouse worlds',
    'ocean creatures carrying tiny villages',
    'angelic guardians of wishes',
    'cute food-based fantasy towns',
    'magical butterfly sanctuaries',
    'forest spirits protecting glowing objects',
    'tiny Japanese garden villages',
    'cosmic stargazing family moments',
    'rainbow waterfalls in the sky',
    'floating lantern cities',
    'tiny mushroom villages',
    'enchanted sakura forests',
    'whale-shaped floating temples',
    'sunbeam-powered fairy gardens',
    'crystal-winged birds carrying messages',
    'miniature cloud bakeries',
    'floating castle observatories',
    'tiny koi pond worlds',
    'paper phoenix nests',
    'dream libraries floating in space',
    'tiny pastel flower farms',
    'cloud-hopping bunny villages',
    'miniature rainbow bridges',
    'floating tea houses',
    'tiny celestial gardens',
    'forest guardian shrines',
    'miniature aurora villages',
    'floating origami dragons',
    'tiny cloud cafés',
    'paper star nurseries',
    'miniature pastel oceans',
    'floating jellyfish cities',
    'tiny enchanted windmills',
    'paper mermaid sanctuaries',
    'miniature rainbow orchards',
    'floating umbrella villages',
    'tiny cloud temples',
    'paper hummingbird gardens',
    'miniature dream observatories',
    'floating pastel farms',
    'tiny moonlit villages',
    'paper angel tea gardens',
    'miniature cloud libraries',
    'floating rainbow treehouses',
    'tiny celestial bakeries',
    'paper butterfly villages',
    'miniature kindness shrines'
  ],
  emotions: [
    'hope and gentle transformation',
    'pure kindness and protection',
    'nostalgic family love',
    'quiet magical wonder',
    'joyful whimsy',
    'peaceful serenity',
    'uplifting friendship',
    'soft emotional rescue',
    'dreamlike curiosity',
    'heartwarming connection',
    'tender guardianship',
    'childlike awe',
    'calm spiritual comfort',
    'gentle encouragement',
    'warm gratitude',
    'innocent delight',
    'soft melancholy turning into hope',
    'reassuring presence',
    'playful imagination',
    'deep emotional healing',
    'renewed optimism',
    'quiet celebration',
    'gentle rebirth',
    'protective affection',
    'sacred stillness',
    'joyful discovery',
    'soft wonder',
    'peaceful reflection',
    'magical reassurance',
    'uplifting purity',
    'calm renewal',
    'loving guidance',
    'whimsical joy',
    'dreamlike peace',
    'comforting nostalgia',
    'gentle triumph',
    'innocent magic',
    'warm companionship',
    'soft courage',
    'quiet hope',
    'healing kindness',
    'pure emotional clarity',
    'gentle unity',
    'heartfelt wonder',
    'calm enchantment',
    'tender imagination',
    'warm emotional glow',
    'soft protective love',
    'peaceful magic'
  ],
  progressions: [
    'built from the ground upward in satisfying layers',
    'revealing glowing elements one layer at a time',
    'unfolding a magical transformation at the end',
    'stacking tiny architectural details with ASMR precision',
    'layering soft pastel skies behind the main subject',
    'adding shimmering accents in the final reveal',
    'building a miniature world piece by piece',
    'ending with a glowing paper light effect',
    'revealing a hidden character in the final layer',
    'finishing with floating decorative elements',
    'gradually forming a floating island',
    'layering clouds to create depth',
    'building tiny houses one by one',
    'revealing a glowing core at the end',
    'stacking petals into a blooming flower',
    'forming a rainbow arc layer by layer',
    'building a treehouse from trunk to canopy',
    'revealing a magical creature at the top',
    'adding lanterns in ascending order',
    'stacking waves to form an ocean scene',
    'building a castle tower by tower',
    'layering stars into a night sky',
    'revealing a glowing moon at the end',
    'building a tiny village street upward',
    'stacking mushrooms into a forest scene',
    'layering sakura petals into a canopy',
    'building a floating bakery from base to pastries',
    'revealing a glowing tea cup at the end',
    'stacking clouds into a kingdom',
    'building a butterfly wing layer by layer',
    'revealing a transformation moment at the top',
    'stacking crystals into a magical shrine',
    'building a koi pond from water to fish',
    'layering pastel waves into a dream ocean',
    'building a floating windmill from base to blades',
    'revealing a glowing lantern at the end',
    'stacking umbrellas into a floating village',
    'building a hummingbird garden from flowers upward',
    'layering moonlight into a night scene',
    'building a celestial bakery from base to glow',
    'revealing a starburst at the end',
    'stacking kindness symbols upward',
    'building a cloud library from shelves to sky',
    'layering rainbow smoke into the final reveal',
    'building a dream observatory from base to telescope',
    'revealing a glowing galaxy at the end',
    'stacking pastel farms into a floating world',
    'building a cloud temple from base to halo',
    'layering butterfly wings into a final bloom'
  ],
  aesthetics: [
    'luxury handcrafted paper textures',
    'premium pastel color palettes',
    'rainbow shimmer accents',
    'clean minimal composition',
    'soft glowing highlights',
    'high-contrast layered silhouettes',
    'delicate micro-details',
    'ultra-clean visual hierarchy',
    'Pinterest-worthy elegance',
    'rich fantasy color grading',
    'pearl-coated paper surfaces',
    'translucent layered glow effects',
    'soft gradient skies',
    'holographic shimmer accents',
    'velvety matte paper textures',
    'crisp micro-edge detailing',
    'floating decorative elements',
    'pastel dream lighting',
    'gold foil highlights',
    'iridescent wing textures',
    'premium cloud layering',
    'soft watercolor-inspired palettes',
    'luxury sakura pink gradients',
    'deep ocean blues with glow',
    'sunrise pastel blends',
    'moonlit silver accents',
    'gentle rainbow diffusion',
    'soft-focus atmospheric depth',
    'clean architectural silhouettes',
    'premium fantasy color harmony',
    'glowing lantern accents',
    'crystal-inspired paper cuts',
    'soft mossy greens',
    'warm candlelight tones',
    'floating sparkles',
    'delicate floral gradients',
    'ultra-premium pastel harmony',
    'soft cosmic glow',
    'gentle cloud diffusion',
    'warm emotional color grading',
    'tiny gold-trim details',
    'premium micro-embellishments',
    'soft angelic lighting',
    'floating petal accents',
    'luxury dreamscape palette',
    'clean glowing edges',
    'soft magical haze',
    'premium layered depth',
    'warm shimmering highlights'
  ],
  modifiers: [
    'ASMR cutting sounds',
    'slow peeling transitions',
    'perfect alignment moments',
    'satisfying layer stacking',
    'gentle fingertip placement',
    'crispy paper edge reveals',
    'soft brushing motions',
    'precision micro-detail placement',
    'slow glowing reveal',
    'floating element lift-off',
    'tiny paper flick sounds',
    'soft tapping for emphasis',
    'gentle crease smoothing',
    'slow-motion layer drop',
    'perfectly centered placement',
    'tiny tweezer micro-placement',
    'soft paper bending',
    'slow reveal of hidden glow',
    'gentle air puff transitions',
    'floating paper dust sparkle',
    'slow unfolding wings',
    'soft pastel brushing',
    'tiny paper snap sounds',
    'gentle layer slide',
    'slow lantern lift',
    'soft fingertip glide',
    'perfect micro-alignment',
    'slow rainbow reveal',
    'gentle cloud placement',
    'soft wave stacking',
    'tiny house placement',
    'slow star reveal',
    'gentle petal drop',
    'soft glowing tea pour',
    'tiny pastry placement',
    'slow moonrise reveal',
    'gentle butterfly wing lift',
    'soft shimmering dust',
    'tiny lantern alignment',
    'slow sakura fall',
    'gentle cloud puff',
    'soft cosmic swirl',
    'tiny mushroom placement',
    'slow castle tower reveal',
    'gentle hummingbird lift',
    'soft pastel smoke puff',
    'tiny kindness symbol placement',
    'slow glowing heart reveal'
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generatePaperCraftBatch = (count = 20) => {
  const batch = [];
  batch.push(`const papercraftIdeas = [];`);

  for (let i = 0; i < count; i++) {
    const theme = getRandom(SUGGESTIONS.themes);
    const emotion = getRandom(SUGGESTIONS.emotions);
    const progression = getRandom(SUGGESTIONS.progressions);
    const aesthetics = pickN(SUGGESTIONS.aesthetics, 3).join(', ');
    const mods = pickN(SUGGESTIONS.modifiers, 3).join(', ');

    batch.push(
      `papercraftIdeas[${i}] = \`THEME: ${theme} — EMOTION: ${emotion} — PROGRESSION: ${progression} — AESTHETICS: ${aesthetics} — ASMR: ${mods}\`;`
    );
  }

  batch.push(`module.exports = papercraftIdeas;`);
  return batch.join('\n');
};

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generatePaperCraftBatch(count);

// Write file in UTF-8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ papercraftIdeas.js generated successfully (UTF-8 safe)');
