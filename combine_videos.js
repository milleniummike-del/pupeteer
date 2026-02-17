const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

  // Sort video files by name to ensure consistent order
  videoFiles.sort();

  const outputVideoPath = path.join(targetDirectory, 'combined_video.mp4');
  const fileListPath = path.join(targetDirectory, 'file_list.txt');

  // Create a file list for ffmpeg concat demuxer
  const fileListContent = videoFiles.map(file => `file '${file}'`).join('\n');
  fs.writeFileSync(fileListPath, fileListContent);

  let ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputVideoPath}"`;

  if (audioFile) {
    const videoWithAudioPath = path.join(targetDirectory, 'combined_video_with_audio.mp4');
    // First, combine videos without audio
    await new Promise((resolve, reject) => {
      console.log('Combining videos...');
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error combining videos: ${error.message}`);
          console.error(stderr);
          reject(error);
          return;
        }
        console.log('Videos combined successfully.');
        // Then, add audio to the combined video
        ffmpegCommand = `ffmpeg -i "${outputVideoPath}" -i "${audioFile}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${videoWithAudioPath}"`;
        console.log('Adding audio to combined video...');
        exec(ffmpegCommand, (audioError, audioStdout, audioStderr) => {
          if (audioError) {
            console.error(`Error adding audio: ${audioError.message}`);
            console.error(audioStderr);
            reject(audioError);
            return;
          }
          console.log('Audio added successfully. Final video:', videoWithAudioPath);
          fs.unlinkSync(outputVideoPath); // Clean up intermediate video
          fs.unlinkSync(fileListPath); // Clean up file list
          resolve();
        });
      });
    });
  } else {
    // If no audio file, just combine videos
    console.log('Combining videos...');
    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error combining videos: ${error.message}`);
          console.error(stderr);
          reject(error);
          return;
        }
        console.log('Videos combined successfully. Final video:', outputVideoPath);
        fs.unlinkSync(fileListPath); // Clean up file list
        resolve();
      });
    });
  }
};

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error('Usage: node combine_videos.js <targetDirectory>');
  process.exit(1);
}

combineVideos(targetDirectory).catch(console.error);
