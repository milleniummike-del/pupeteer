const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const folder = "C:/Users/mike/Downloads";
const output = "slideshow.mp4";

const files = fs.readdirSync(folder);
const images = files.filter(f => /\.(jpg|jpeg|png|bmp|gif|webp|tif|tiff|jfif|heic)$/i.test(f));
const audio = files.find(f => /\.(mp3|wav|aac|flac)$/i.test(f));

console.log("Images detected:", images);
console.log("Audio detected:", audio);

if (!images.length) {
  console.error("No images found.");
  process.exit(1);
}
if (!audio) {
  console.error("No audio file found.");
  process.exit(1);
}

// ------------------------------------------------------------
// 1. Determine canvas size
// ------------------------------------------------------------
let maxW = 0;
let maxH = 0;

images.forEach(img => {
  const imgPath = path.join(folder, img);
  const info = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${imgPath}"`
  ).toString().trim().split(",");

  const w = parseInt(info[0], 10);
  const h = parseInt(info[1], 10);

  if (w > maxW) maxW = w;
  if (h > maxH) maxH = h;
});

console.log("Canvas size:", maxW, "x", maxH);

// ------------------------------------------------------------
// 2. Create padded 5-second clips
// ------------------------------------------------------------
const tempDir = path.resolve("./tempclips");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

images.forEach((img, i) => {
  const imgPath = path.join(folder, img);
  const clipPath = path.join(tempDir, `clip_${i}.mp4`);

  execSync(
    `ffmpeg -y -loop 1 -i "${imgPath}" -t 5 ` +
    `-vf "scale=${maxW}:${maxH}:force_original_aspect_ratio=decrease,` +
    `pad=${maxW}:${maxH}:(ow-iw)/2:(oh-ih)/2,format=yuv420p" ` +
    `-c:v libx264 -pix_fmt yuv420p "${clipPath}"`
  );
});

// ------------------------------------------------------------
// 3. Random transition selector (10 transitions)
// ------------------------------------------------------------
function randomTransition() {
  const list = [
    "crossfade",
    "crossblur",
    "crosszoom",
    "crossspin",
    "crossflip",
    "crosswarp",
    "crossstretch",
    "crossslide",
    "crosspush",
    "crossglitch"
  ];
  return list[Math.floor(Math.random() * list.length)];
}

// ------------------------------------------------------------
// 4. Create TRUE 1-second transitions (NO xfade transitions)
// ------------------------------------------------------------
for (let i = 0; i < images.length - 1; i++) {
  const clipA = path.join(tempDir, `clip_${i}.mp4`);
  const clipB = path.join(tempDir, `clip_${i + 1}.mp4`);
  const transPath = path.join(tempDir, `trans_${i}.mp4`);

  const effect = randomTransition();
  console.log(`Transition ${i}: ${effect}`);

  let filter = "";

  const baseA = `[0:v]trim=4:5,setpts=PTS-STARTPTS[first];`;
  const baseB = `[1:v]trim=0:1,setpts=PTS-STARTPTS[second];`;

  // ------------------ SAFE CUSTOM TRANSITIONS ------------------

  if (effect === "crossfade") {
    filter =
      baseA +
      baseB +
      `[first][second]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossblur") {
    filter =
      baseA +
      baseB +
      `[first]boxblur=10[fa];` +
      `[second]boxblur=10[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crosszoom") {
    filter =
      baseA +
      baseB +
      `[first]scale=${maxW*1.2}:${maxH*1.2},crop=${maxW}:${maxH}[fa];` +
      `[second]scale=${maxW}:${maxH}[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossspin") {
    filter =
      baseA +
      baseB +
      `[first]rotate=PI/2,scale=${maxW}:${maxH}[fa];` +
      `[second]rotate=-PI/2,scale=${maxW}:${maxH}[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossflip") {
    filter =
      baseA +
      baseB +
      `[first]hflip[fa];` +
      `[second]vflip[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crosswarp") {
    filter =
      baseA +
      baseB +
      `[first]geq='lum_expr=lum(X,Y)'[fa];` +
      `[second]geq='lum_expr=lum(X,Y)'[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossstretch") {
    filter =
      baseA +
      baseB +
      `[first]scale=${maxW*1.3}:${maxH},crop=${maxW}:${maxH}[fa];` +
      `[second]scale=${maxW}:${maxH}[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossslide") {
    filter =
      baseA +
      baseB +
      `[first]crop=${maxW}:${maxH}[fa];` +
      `[second]crop=${maxW}:${maxH}[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crosspush") {
    filter =
      baseA +
      baseB +
      `[first]crop=${maxW}:${maxH}[fa];` +
      `[second]crop=${maxW}:${maxH}[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  else if (effect === "crossglitch") {
    filter =
      baseA +
      baseB +
      `[first]noise=alls=20:allf=u[fa];` +
      `[second]noise=alls=20:allf=u[fb];` +
      `[fa][fb]blend=all_expr='A*(1-T)+B*T'[out]`;
  }

  execSync(
    `ffmpeg -y -i "${clipA}" -i "${clipB}" ` +
    `-filter_complex "${filter}" ` +
    `-map "[out]" -t 1 -c:v libx264 -pix_fmt yuv420p "${transPath}"`
  );
}

// ------------------------------------------------------------
// 5. Build concat file
// ------------------------------------------------------------
const concatFile = path.join(tempDir, "concat.txt");
let concatText = "";

for (let i = 0; i < images.length; i++) {
  concatText += `file 'clip_${i}.mp4'\n`;
  if (i < images.length - 1) {
    concatText += `file 'trans_${i}.mp4'\n`;
  }
}

fs.writeFileSync(concatFile, concatText);

// ------------------------------------------------------------
// 6. Final concat with audio
// ------------------------------------------------------------
execSync(
  `ffmpeg -y -f concat -safe 0 -i "${concatFile.replace(/\\/g, "/")}" ` +
  `-i "${path.join(folder, audio).replace(/\\/g, "/")}" ` +
  `-c:v libx264 -c:a aac -shortest "${output}"`
);

console.log("Slideshow created with SAFE custom transitions:", output);
