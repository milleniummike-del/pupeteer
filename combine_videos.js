const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const directory = require('./directory.js');

let destinationDir = directory.getPath() + '\\upscaled';
//destinationDir = directory.getPath();
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

// 🧹 Cleanup old generated files
function cleanOldOutputs(dir) {
  const files = fs.readdirSync(dir);

  let deleted = 0;

  for (const file of files) {
    if (
      file.startsWith('combined_') ||
      file.startsWith('final_') ||
      file.startsWith('file_list_')
    ) {
      const filePath = path.join(dir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${file}`);
        deleted++;
      } catch (err) {
        console.warn(`⚠️ Failed to delete ${file}: ${err.message}`);
      }
    }
  }

  console.log(`🧹 Cleanup complete (${deleted} files removed)\n`);
}

// 🎲 Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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

// 🔊 Add audio
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

// No-audio fallback
async function createFinalWithoutAudio(videoPath, index, targetDirectory) {
  const outputPath = path.join(targetDirectory, `final_${index}.mp4`);

  await runCommand('ffmpeg', [
    '-y',
    '-i', videoPath,
    '-c', 'copy',
    outputPath
  ]);

  console.log(`📦 No audio -> final_${index}.mp4`);
}

// Main
const combineVideos = async (targetDirectory) => {
  if (!fs.existsSync(targetDirectory)) {
    console.error("Directory not found");
    return;
  }

  // 🧹 Clean old outputs FIRST
  cleanOldOutputs(targetDirectory);

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

  shuffleArray(videoFiles);
  shuffleArray(audioFiles);

  console.log(`🎲 Shuffled ${videoFiles.length} videos`);
  console.log(`Found ${audioFiles.length} audio files`);

  const processed = [];
  for (const v of videoFiles) {
    const result = await processVideo(v, targetDirectory, tempFiles);
    processed.push(result);
  }

  const batches = createBatches(processed, 120);
  console.log(`Creating ${batches.length} output videos`);

  let index = 0;
  for (const batch of batches) {
    const combinedPath = await combineBatch(batch, index + 1, targetDirectory);

    if (audioFiles.length > 0) {
      const audioIndex = index % audioFiles.length;
      await addAudioToVideo(combinedPath, audioFiles[audioIndex], index + 1, targetDirectory);
    } else {
      await createFinalWithoutAudio(combinedPath, index + 1, targetDirectory);
    }

    index++;
  }

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