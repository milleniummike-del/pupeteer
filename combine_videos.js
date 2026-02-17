const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const combineVideos = async (targetDirectory) => {
  if (!fs.existsSync(targetDirectory)) {
    console.error(`Error: Directory not found: ${targetDirectory}`);
    process.exit(1);
  }

  const files = fs.readdirSync(targetDirectory);
  const videoExtensions = ['.mp4', '.mov', '.mkv', '.webm', '.avi'];
  let videoFiles = [];
  let audioFile = null;

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (videoExtensions.includes(ext)) {
      videoFiles.push(path.join(targetDirectory, file));
    } else if (ext === '.wav') {
      audioFile = path.join(targetDirectory, file);
    }
  });

  if (videoFiles.length === 0) {
    console.log('No video files found to combine.');
    return;
  }

  console.log('Video files found to combine:' + videoFiles.length);

  videoFiles.sort();

  const outputVideoPath = path.join(targetDirectory, 'combined_video.mp4');
  const fileListPath = path.join(targetDirectory, 'file_list.txt');
  const fileListContent = videoFiles.map(file => `file '${file.replace(/'/g, "'\\''")}'`).join('\n');
  fs.writeFileSync(fileListPath, fileListContent);

  const runFfmpeg = (args) => {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg process exited with code ${code}`));
        }
      });
    });
  };

  try {
    const ffmpegArgs = ['-f', 'concat', '-safe', '0', '-i', fileListPath, '-c', 'copy', outputVideoPath];
    await runFfmpeg(ffmpegArgs);
    console.log('Videos combined successfully.');

    if (audioFile) {
      const videoWithAudioPath = path.join(targetDirectory, 'combined_video_with_audio.mp4');
      const audioArgs = ['-i', outputVideoPath, '-i', audioFile, '-c:v', 'copy', '-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', videoWithAudioPath];
      await runFfmpeg(audioArgs);
      console.log('Audio added successfully. Final video:', videoWithAudioPath);
      fs.unlinkSync(outputVideoPath);
    } else {
      console.log('Final video:', outputVideoPath);
    }
  } finally {
    fs.unlinkSync(fileListPath);
  }
};

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error('Usage: node combine_videos.js <targetDirectory>');
  process.exit(1);
}

combineVideos(targetDirectory).catch(console.error);
