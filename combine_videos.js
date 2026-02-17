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

  const runCommand = (command, args) => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`${command} process exited with code ${code}`));
        }
      });
    });
  };

  try {
    const ffmpegArgs = ['-y', '-f', 'concat', '-safe', '0', '-i', fileListPath, '-c', 'copy', outputVideoPath];
    await runCommand('ffmpeg', ffmpegArgs);
    console.log('Videos combined successfully.');

    if (audioFile) {
      // Get video duration
      const ffprobeArgs = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', outputVideoPath];
      const durationStr = await runCommand('ffprobe', ffprobeArgs);
      const duration = parseFloat(durationStr);

      console.log(`Combined video duration: ${duration} seconds`);

      // Trim audio
      const trimmedAudioPath = path.join(targetDirectory, 'trimmed_audio.aac');
      const fadeOutStartTime = duration - 3;
      const audioArgs = ['-y', '-i', audioFile, '-ss', '0', '-t', duration, '-af', `afade=t=out:st=${fadeOutStartTime}:d=3`, trimmedAudioPath];
      await runCommand('ffmpeg', audioArgs);
      console.log('Audio trimmed and faded successfully.');

      // Combine video and trimmed audio
      const videoWithAudioPath = path.join(targetDirectory, 'combined_video_with_audio.mp4');
      const combineArgs = ['-y', '-i', outputVideoPath, '-i', trimmedAudioPath, '-c:v', 'copy', '-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', videoWithAudioPath];
      await runCommand('ffmpeg', combineArgs);
      console.log('Audio added successfully. Final video:', videoWithAudioPath);

      // Clean up intermediate files
      fs.unlinkSync(outputVideoPath);
      fs.unlinkSync(trimmedAudioPath);
    } else {
      console.log('Final video:', outputVideoPath);
    }
  } finally {
    //fs.unlinkSync(fileListPath);
  }
};

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error('Usage: node combine_videos.js <targetDirectory>');
  process.exit(1);
}

combineVideos(targetDirectory).catch(console.error);
