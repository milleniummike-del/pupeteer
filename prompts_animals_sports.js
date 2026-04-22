// prompts_animal_sports.js (compressed realistic version)
const fs=require("fs");const r=a=>a[Math.floor(Math.random()*a.length)];

// 120+ ANIMALS (compressed)
const animals=["golden retriever","labrador","german shepherd","border collie","beagle","boxer","husky","dalmatian","corgi","great dane","tiger","lion","cheetah","leopard","jaguar","panther","lynx","bobcat","wolf","fox","coyote","hyena","brown bear","black bear","polar bear","panda","gorilla","chimpanzee","orangutan","baboon","gibbon","horse","pony","mustang","zebra","donkey","mule","cow","bull","goat","sheep","ram","bison","buffalo","deer","elk","moose","reindeer","antelope","gazelle","ibex","boar","warthog","hippo","rhino","camel","llama","alpaca","kangaroo","wallaby","otter","beaver","raccoon","badger","wolverine","skunk","porcupine","hedgehog","ferret","weasel","mink","seal","sea lion","walrus","dolphin","penguin","puffin","eagle","hawk","falcon","owl","vulture","swan","goose","duck","turkey","chicken","pigeon","seagull","parrot","macaw","flamingo","peacock","sparrow","crow","raven"];

// SPORT GROUPS (aligned environments + actions)
const sports=[
{sport:"soccer",
 phrases:["playing competitive soccer","taking a shot on goal","dribbling with control","making a diving save"],
 env:["in a packed soccer stadium","on a professional grass pitch","on a turf soccer field"],
 act:["sprinting down the wing","passing to a teammate","sliding for a tackle","jumping for a header","celebrating a goal"]},

{sport:"basketball",
 phrases:["playing competitive basketball","driving to the basket","taking a jump shot","going for a rebound"],
 env:["in a professional basketball arena","on a polished indoor court","on an outdoor street court"],
 act:["executing a pick and roll","contesting a layup","blocking a shot","diving for a loose ball"]},

{sport:"tennis",
 phrases:["playing competitive tennis","serving with power","returning a fast serve"],
 env:["on a hard tennis court","on a clay tennis court","on a grass tennis court"],
 act:["hitting a forehand winner","charging the net","smashing an overhead"]},

{sport:"baseball",
 phrases:["playing competitive baseball","pitching a fastball","swinging for a hit"],
 env:["in a professional baseball stadium","on a baseball diamond"],
 act:["throwing a precise pitch","diving for a catch","sliding into base"]},

{sport:"hockey",
 phrases:["playing competitive ice hockey","taking a slapshot","blocking a shot"],
 env:["on a professional ice rink","in a packed hockey arena"],
 act:["skating at high speed","checking cleanly","fighting for puck control"]},

{sport:"swimming",
 phrases:["competing in a swimming relay","swimming freestyle","diving off the starting block"],
 env:["in an Olympic-size pool","in a 25m competition pool"],
 act:["cutting through the water","surfacing for air","executing a turn"]},

{sport:"track",
 phrases:["running a 100m sprint","competing in a relay race"],
 env:["on an Olympic running track","on a synthetic athletics track"],
 act:["exploding from the blocks","sprinting at full speed","leaning at the finish line"]}
];

// DETAILS (compressed realistic)
const details=["realistic fur texture","defined muscles","visible sweat","motion blur","dust kicked up","grass flying","fabric creases","team jersey visible","stadium crowd blurred","sharp facial focus","whiskers detailed","eye reflections","paw pressure on ground","realistic shadows","highlight reflections","slight dirt stains","grass stains","water droplets","chalk lines visible","sharp depth of field"];

// LIGHTING (realistic only)
const lighting=["even stadium lighting","bright daylight","soft overcast light","warm golden hour","cool morning light","strong floodlights","balanced indoor lighting","slightly backlit","front-lit arena lights","clear broadcast lighting"];

// RESOLUTION DESCRIPTORS
const resolutions=["photorealistic","hyper-realistic","ultra high definition","8k","crisp sports broadcast quality","sharp detailed rendering"];

// GENERATOR
function generatePrompt(){
  const s=r(sports);
  return `A ${r(resolutions)} ${r(animals)} ${r(s.phrases)} ${r(s.env)}, ${r(s.act)}, ${r(details)}, ${r(lighting)}, ${r(resolutions)}`;
}

// GENERATE 10 PROMPTS → videos.js
const videos=Array.from({length:10},generatePrompt);
const out="const videos="+JSON.stringify(videos,null,2)+";\n\nmodule.exports=videos;\n";
fs.writeFileSync("videos.js",out,"utf8");
console.log("videos.js generated.");
