
/**
 * PromptForge: Surrealism Generator CLI (Single‑File, UTF‑8 Safe, Fully Merged)
 * Usage: node surreal.js [count]
 * Default count: 20
 */

const fs = require('fs');

const SUGGESTIONS = {
  subjects: [
    'A solitary figure', 'A colossal human heart', 'A fractured ceramic mask', 
    'A vintage pocket watch', 'A grand piano', 'A glass eye', 
    'An ancient gnarled tree', 'A floating chess piece', 'A lighthouse made of bone',
    'A human skull blooming with flowers', 'A mechanical bird', 'A translucent marble hand',
    'An ornate brass key', 'A tattered umbrella', 'A floating silver fish',
    'A chair made of woven light', 'A paper lantern', 'A swarm of crystal butterflies',
    'A mirror reflecting a different world', 'A faceless tailor',
    'A giant snail with a city on its back', 'A melting chandelier', 'A violin made of glass',
    'A cloud trapped in a birdcage', 'A staircase leading into the sun',
    'A hand holding a miniature galaxy', 'A clock where the numbers are birds',
    'A suit of armor filled with flowers', 'A book with blank pages that bleed light',
    'A lighthouse beam that reveals hidden ghosts', 'A telephone receiver leaking ocean water',
    'A floating mountain of discarded letters', 'A mannequin made of porcelain and wood',
    'A giant keyhole in the middle of a desert', 'A telescope looking into the past',
    'A heart made of interlocking gears', 'A transparent umbrella shielding from stars',
    'A teapot pouring liquid shadows', 'A camera capturing dreams instead of light',
    'A harp with strings made of rain', 'A dandelion with seeds like tiny lanterns',
    'A crown of thorns and electric wire', 'A shadow with its own physical presence',
    'A compass pointing to "nowhere"', 'A typewriter that writes in butterflies',
    'A floating door with no frame', 'A giant eyeball encased in ice',
    'A ship with sails made of tattered memories', 'A silent bell made of frozen smoke',
    'A candle that casts darkness instead of light',
    'A weeping violin leaking starlight', 'An octopus with lightbulb tentacles', 'A floating mask with multiple expressions', 
    'A pair of lungs made of forest leaves', 'A golden cage containing a miniature hurricane', 'A fountain where the water flows upwards', 
    'A chess set where pieces move themselves', 'A gramophone playing the sound of waves', 'A staircase that spirals into a nebula', 
    'A human eye with a clock face for an iris', 'A cluster of keys floating in mid-air', 'A tree whose fruit are glowing lanterns', 
    'A giant hollow head filled with a library', 'A ship sailing across a desert of glass', 'A hand sewing a tapestry of the night sky', 
    'A clock melting over the edge of a table', 'A bird made of origami paper that breathes fire', 'A forest of stone hands reaching for the sky', 
    'A giant hourglass filled with black sand', 'A doorway floating in the middle of an ocean', 'A human figure made of interlocking mirrors', 
    'A teapot pouring a galaxy into a cup', 'A mirror that shows the viewer as a child', 'A garden where flowers are made of gears', 
    'A massive bell ringing underwater', 'A lighthouse whose light reveals the future', 'A typewriter that prints actual flowers', 
    'A crown of ice that never melts', 'A shadow that detaches from its owner', 'A compass pointing towards the dreamer', 
    'A tattered flag made of butterfly wings', 'A grand piano floating in a storm of sheet music', 'A human heart encased in a glass prism', 
    'A forest of umbrellas growing from the ground', 'A giant eyeball watching the stars', 'A suit of armor made of autumn leaves', 
    'A clock where time runs backwards', 'A book that whispers its contents to the reader', 'A lighthouse beam that turns water into stone', 
    'A telephone receiver emitting a swarm of bees', 'A mountain of clocks ticking in unison', 'A mannequin whose skin is made of velvet', 
    'A keyhole through which one can see the sun', 'A telescope that views distant memories', 'A heart made of woven thorns', 
    'A transparent umbrella collecting falling stars', 'A teapot pouring liquid lightning', 'A camera that takes photos of the soul', 
    'A harp with strings of laser light', 'A dandelion with seeds like glowing embers',
    'A crown of bioluminescent fungi', 'A shadow that holds its own lantern', 'A compass that points to lost things', 
    'A typewriter that writes in constellations', 'A floating door that leads to yesterday', 'A giant eyeball made of swirling mist', 
    'A ship with sails made of tattered clouds', 'A silent bell that vibrates the air', 'A candle whose flame is a miniature galaxy', 
    'A weeping willow with crystal tears', 'An anatomical heart made of porcelain', 'A porcelain doll with clockwork joints', 
    'A vintage radio emitting spectral voices', 'A grand piano with keys made of teeth', 'A glass eye that sees infrared ghosts', 
    'An ancient tree with roots made of iron', 'A chess piece that bleeds ink', 'A lighthouse made of stacked books', 
    'A human skull with internal celestial gears', 'A mechanical butterfly with stained-glass wings', 'A translucent hand holding a lightning bolt', 
    'An ornate key that unlocks the wind', 'A tattered umbrella shielding from rain of gold', 'A floating silver fish with humanoid eyes', 
    'A chair made of frozen smoke', 'A paper lantern containing a trapped star', 'A swarm of crystal moths', 
    'A mirror reflecting the room as it was 100 years ago', 'A faceless clockmaker', 'A giant snail with a cathedral on its back', 
    'A melting chandelier dripping liquid pearls', 'A violin made of thorns and roses', 'A cloud in a cage that rains ink', 
    'A staircase leading into a giant eye', 'A hand holding a compass of bone', 'A clock where the numbers are eyes', 
    'A suit of armor filled with liquid mercury', 'A book whose pages are mirrors', 'A lighthouse beam that reveals the hidden city', 
    'A telephone receiver leaking molten gold', 'A floating mountain of rusted gears', 'A mannequin with a galaxy for a head', 
    'A giant keyhole in a wall of clouds', 'A telescope that views the beginning of time', 'A heart made of interlocking clock hands', 
    'A transparent umbrella shielding from falling feathers', 'A teapot pouring liquid shadows into a void', 'A camera that captures the smell of rain', 
    'A harp with strings made of spider silk', 'A dandelion with seeds like tiny eyes',
    'A crown of thorns and digital glitches', 'A shadow that has a different shape than its owner', 'A compass pointing to the North Star in a room', 
    'A typewriter that writes in bird songs', 'A floating door in a forest of mirrors', 'A giant eyeball at the bottom of a well', 
    'A ship with sails made of silk ribbons', 'A silent bell that rings color', 'A candle that casts a shadow of a bird', 
    'A tree that grows out of a grand piano', 'An anatomical heart made of clockwork and moss', 'A porcelain hand reaching out of a mirror', 
    'A vintage watch that measures heartbeats', 'A grand piano being played by the wind', 'A glass eye in a velvet-lined box', 
    'An ancient gnarled tree with human-like features', 'A floating chess piece in a field of flowers', 'A lighthouse made of sea shells', 
    'A human skull blooming with crystalline fungi', 'A mechanical bird in a gilded cage', 'A translucent marble statue that breathes', 
    'An ornate brass key on a bed of velvet', 'A tattered umbrella in a field of stars', 'A floating silver fish in a forest of kelp', 
    'A chair made of sunlight and shadows', 'A paper lantern floating over a dark lake', 'A swarm of crystal dragonflies', 
    'A mirror reflecting a world without people', 'A faceless weaver spinning light', 'A giant snail with a castle on its back', 
    'A melting chandelier in a flooded ballroom', 'A violin made of glass and starlight', 'A cloud in a cage that lightning strikes', 
    'A staircase leading into the center of the earth', 'A hand holding a miniature sun', 'A clock where the hands are snakes', 
    'A suit of armor filled with flowers and vines', 'A book that bleeds ink when closed', 'A lighthouse beam that creates a path of light', 
    'A telephone receiver leaking sand', 'A floating mountain of mirrors', 'A mannequin in a room of mannequins', 
    'A giant keyhole in a desert of ice', 'A telescope that views the inner workings of a heart', 'A heart made of interlocking keys', 
    'A transparent umbrella shielding from falling leaves', 'A teapot pouring liquid rainbows', 'A camera that captures the feeling of nostalgia', 
    'A harp with strings made of moonbeams', 'A dandelion with seeds like tiny lanterns of glass',
    'A hollow ribcage acting as a birdcage', 'A piano whose keys are frozen waterfalls', 'A grand clock submerged in honey',
    'A silver fox with tails of smoke', 'A pair of hands knitting a lightning bolt', 'A telescope viewing the dreams of a sleeping giant',
    'A field of mirrors reflecting the sky in different seasons', 'A lighthouse that emits darkness', 'A giant thimble containing a tiny forest',
    'A book where the words fly off the page as moths', 'A suit of armor made of shattered stained glass', 'A floating door in the middle of a thunderstorm',
    'A hand holding a vial of liquid gravity', 'A clock where the numbers are moving ants', 'A grand piano overgrown with bioluminescent coral',
    'A glass eye that projects the viewer\'s childhood', 'An ancient tree with silver leaves that chime in the wind', 'A floating chess piece made of solid light',
    'A lighthouse made of salt in a sea of mercury', 'A human skull containing a miniature solar system', 'A mechanical bird with feathers of tattered maps',
    'A translucent marble hand writing in a book of shadows', 'An ornate key that opens a door in the air', 'A tattered umbrella catching falling ink',
    'A floating silver fish in a city of clouds', 'A chair made of interwoven storm clouds', 'A paper lantern containing a swarm of fireflies',
    'A mirror reflecting a different version of reality', 'A faceless tailor sewing shadows', 'A giant snail with a clockwork shell',
    'A melting chandelier dripping liquid gold', 'A violin made of obsidian and silk', 'A cloud in a cage that snows glitter',
    'A staircase leading into a giant pocket watch', 'A hand holding a pearl that contains a storm', 'A clock where the time is measured in heartbeats',
    'A suit of armor made of woven light', 'A book whose pages are made of water', 'A lighthouse beam that turns shadows into objects',
    'A telephone receiver echoing the voices of the stars', 'A floating mountain of clockwork parts', 'A mannequin in a field of sunflowers',
    'A giant keyhole in a wall of iron', 'A telescope viewing a city made of glass', 'A heart made of interlocking gears and flowers'
  ],
  transformations: [
    'turning into liquid gold', 'dissolving into constellations', 
    'sprouting crystalline wings', 'shattering into mirror shards', 
    'melting into a cityscape', 'bleeding neon light', 
    'weaving into storm clouds', 'sprouting internal gardens',
    'evaporating into ink smoke', 'crumbling into floating sand',
    'integrating with gears and wires', 'unfolding like blooming silk',
    'fracturing into geometric facets', 'flickering with a digital glitch',
    'burning with cold obsidian fire', 'vibrating into white static',
    'unspooling as velvet ribbons', 'glowing with bioluminescent moss',
    'hardening into stained glass', 'dripping like heavy mercury',
    'warping into a spiraling vortex', 'calcifying into ancient coral',
    'stretching into infinite threads', 'transforming into a swarm of moths',
    'petrifying into black marble', 'blooming into thousand-petaled lotus',
    'bleeding liquid moonlight', 'shattering into floating embers',
    'dissolving into a flock of white ravens', 'pixelating into geometric dust',
    'uncurling like a serpent of smoke', 'turning into a network of roots',
    'freezing into jagged ice sculptures', 'radiating waves of pure sound',
    'liquefying into a sea of tears', 'transmuting into iridescent oil',
    'shedding skin like a snake', 'glowing with internal starlight',
    'withering into a skeleton of lace', 'expanding into a fractal pattern',
    'vibrating until it becomes invisible', 'weeping liquid rubies',
    'turning into a hollow shell of gold leaf', 'sprouting feathers of iridescent peacock',
    'merging with its own shadow', 'unraveling like a ball of yarn',
    'turning into a cluster of bubbles', 'hardening into a diamond core',
    'exploding into a silent supernova', 'weaving back into reality'
  ],
  environments: [
    'vast desert of mirrors', 'flooded upside-down cathedral', 
    'endless hallway of doors', 'void of floating geometry', 
    'forest of frozen time', 'ocean of liquid mercury', 
    'liminal airport lounge', 'cosmic nebula library',
    'city built on clouds', 'field of giant paper poppies',
    'infinite white void', 'glass labyrinth',
    'underwater petrified forest', 'ruins of a giant clock',
    'cosmic train station', 'valley of moving shadows',
    'mountains of torn maps', 'crystalline cave of whispers',
    'endless spiral staircase', 'library where books are stars',
    'room with no corners or shadows', 'garden of iron flowers',
    'city submerged in amber', 'wasteland of giant clockwork gears',
    'abandoned theater on the moon', 'bridge between two different dimensions',
    'field of floating umbrellas', 'forest of giant stone hands',
    'city made entirely of glass', 'empty cathedral made of water',
    'floating island of discarded memories', 'room where the ceiling is the sea',
    'landscape of melting architectural ruins', 'valley of giant, silent bells',
    'desert under a green and purple sun', 'ocean of floating books',
    'city inside a giant seashell', 'forest where the trees are made of light',
    'abandoned carnival in the middle of space', 'labyrinth of infinite reflections',
    'room where gravity works sideways', 'city carved into a giant skull',
    'field of giant, glowing mushrooms', 'floating palace of clouds and lightning',
    'empty street in a ghost city', 'landscape of giant, frozen waves',
    'forest where it rains static', 'room with windows into different centuries',
    'desert where the sand is ground diamonds', 'garden of bioluminescent jellyfish'
  ],
  tones: [
    'Melancholic awe', 'Quiet dread', 'Divine serenity', 
    'Existential mystery', 'Sacred decay', 'Chaotic wonder', 
    'Nostalgic dream', 'Vibrant hallucination', 'Cold detachment',
    'Primal terror', 'Timeless stillness', 'Ethereal joy'
  ]
};

const MODIFIERS = [
  'impossible geometry', 'dream logic', 'symbolic anatomy', 'metaphysical scale',
  'time folding onto itself', 'sacred + decayed', 'hyperreal textures',
  'paradoxical lighting', 'liminal space', 'slow cosmic motion', 'silence made visible'
];

const ENHANCERS = [
  'ultra-fine grain', 'global illumination', 'volumetric lighting',
  'ray-traced reflections', 'painterly realism', 'cinematic color grading', 'shallow depth of field'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const generateSurrealBatch = (count = 20) => {
  const batch = [];
  batch.push(`const videos = [];`);
  for (let i = 0; i < count; i++) {
    // Randomly mix up to 3 subjects for that chaotic surreal feel
    const numSubjects = Math.floor(Math.random() * 3) + 1;
    const subjects = pickN(SUGGESTIONS.subjects, numSubjects).join(', ');
    
    const trans = getRandom(SUGGESTIONS.transformations);
    const env = getRandom(SUGGESTIONS.environments);
    const tone = getRandom(SUGGESTIONS.tones);
    const mods = pickN(MODIFIERS, 4).join(', ');
    const enh = pickN(ENHANCERS, 3).join(', ');
    
    batch.push(`videos[${i}] = \`- SUBJECT: ${subjects} - TRANSFORMATION: ${trans} - ENVIRONMENT: ${env} - TONE: ${tone} - MODIFIERS: ${mods} - ENHANCERS: ${enh}\`;`);

  }
  batch.push(`module.exports = videos;`);
  return batch.join('\n');
};


// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 20;

const output = generateSurrealBatch(count);

// Write file in UTF‑8 (NO BOM)
fs.writeFileSync('videos.js', output, { encoding: 'utf8' });

console.log('✔ videos.js generated successfully (UTF‑8 safe)');
