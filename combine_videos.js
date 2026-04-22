const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const directory = require('./directory.js');

let destinationDir = directory.getPath() + '\\upscaled';
console.log("📂 Download folder:", destinationDir);

const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', () => {});

    child.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
};

async function getVideoDuration(videoPath) {
  try {
    const args = [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ];
    const out = await runCommand('ffprobe', args);
    return parseFloat(out);
  } catch {
    return 0;
  }
}

// Trim individual video if >3 min
async function processVideo(videoFile, targetDirectory, tempFiles) {
  const duration = await getVideoDuration(videoFile);
  const name = path.basename(videoFile);

  if (duration > 180) {
    const trimmedPath = path.join(targetDirectory, `temp_${name}`);

    const args = [
      '-y',
      '-i', videoFile,
      '-t', '175',
      '-vf', 'fade=t=out:st=174.5:d=0.5',
      '-af', 'afade=t=out:st=170:d=5',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      trimmedPath
    ];

    await runCommand('ffmpeg', args);
    tempFiles.push(trimmedPath);
    return { path: trimmedPath, duration: 175 };
  }

  return { path: videoFile, duration };
}

// Split into batches
function createBatches(videos, maxDuration) {
  const batches = [];
  let currentBatch = [];
  let currentDuration = 0;

  for (const vid of videos) {
    if (currentDuration + vid.duration > maxDuration && currentBatch.length) {
      batches.push(currentBatch);
      currentBatch = [];
      currentDuration = 0;
    }

    currentBatch.push(vid);
    currentDuration += vid.duration;
  }

  if (currentBatch.length) batches.push(currentBatch);
  return batches;
}

// Combine videos
async function combineBatch(batch, index, targetDirectory) {
  const fileListPath = path.join(targetDirectory, `file_list_${index}.txt`);
  const outputPath = path.join(targetDirectory, `combined_${index}.mp4`);

  const content = batch
    .map(v => `file '${v.path.replace(/'/g, "'\\''")}'`)
    .join('\n');

  fs.writeFileSync(fileListPath, content);

  await runCommand('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', fileListPath,
    '-c', 'copy',
    outputPath
  ]);

  fs.unlinkSync(fileListPath);

  console.log(`✅ Created: combined_${index}.mp4`);
  return outputPath;
}

// 🔊 Add audio to video
async function addAudioToVideo(videoPath, audioPath, index, targetDirectory) {
  const outputPath = path.join(targetDirectory, `final_${index}.mp4`);

  await runCommand('ffmpeg', [
    '-y',
    '-i', videoPath,
    '-i', audioPath,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    outputPath
  ]);

  console.log(`🎵 Added audio -> final_${index}.mp4`);
}

// Main function
const combineVideos = async (targetDirectory) => {
  if (!fs.existsSync(targetDirectory)) {
    console.error("Directory not found");
    return;
  }

  const files = fs.readdirSync(targetDirectory);

  const videoExt = ['.mp4', '.mov', '.mkv', '.webm', '.avi'];
  const audioExt = ['.mp3', '.wav'];

  let videoFiles = [];
  let audioFiles = [];
  let tempFiles = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    if (videoExt.includes(ext)) {
      videoFiles.push(path.join(targetDirectory, file));
    }

    if (audioExt.includes(ext)) {
      audioFiles.push(path.join(targetDirectory, file));
    }
  }

  if (!videoFiles.length) {
    console.log("No videos found");
    return;
  }

  videoFiles.sort();
  audioFiles.sort();

  console.log(`Found ${videoFiles.length} videos`);
  console.log(`Found ${audioFiles.length} audio files`);

  // Step 1: preprocess videos
  const processed = [];
  for (const v of videoFiles) {
    const result = await processVideo(v, targetDirectory, tempFiles);
    processed.push(result);
  }

  // Step 2: batch into 2-minute chunks
  const batches = createBatches(processed, 120);
  console.log(`Creating ${batches.length} output videos`);

  // Step 3: combine + attach audio
  let index = 0;
  for (const batch of batches) {
    const combinedPath = await combineBatch(batch, index + 1, targetDirectory);

    if (audioFiles.length > 0) {
      // 🔁 recycle audio if fewer than videos
      const audioIndex = index % audioFiles.length;
      const audioPath = audioFiles[audioIndex];

      await addAudioToVideo(combinedPath, audioPath, index + 1, targetDirectory);
    }

    index++;
  }

  // Cleanup temp files
  for (const file of tempFiles) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  console.log("🎉 Done");
};

const targetDirectory = destinationDir;

if (!targetDirectory) {
  console.error("Missing directory");
  process.exit(1);
}

combineVideos(targetDirectory).catch(console.error);