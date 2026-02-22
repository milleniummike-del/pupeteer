const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getTodayDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

const environment=1;

if(environment==1) {
destinationDir = `C:\\Users\\Mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
} else {
destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);

const runCommand = (command, args) => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args);
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        // console.error(data.toString()); // Commenting out to reduce console noise
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

async function getVideoDuration(videoPath) {
    try {
        const ffprobeArgs = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath];
        const durationStr = await runCommand('ffprobe', ffprobeArgs);
        return parseFloat(durationStr);
    } catch (error) {
        console.error(`Error getting duration for ${videoPath}:`, error.message);
        return 0;
    }
}

const combineVideos = async (targetDirectory) => {
  if (!fs.existsSync(targetDirectory)) {
    console.error(`Error: Directory not found: ${targetDirectory}`);
    process.exit(1);
  }

  const files = fs.readdirSync(targetDirectory);
  const videoExtensions = ['.mp4', '.mov', '.mkv', '.webm', '.avi'];
  let videoFiles = [];
  let audioFile = null;
  let tempFiles = [];

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (videoExtensions.includes(ext)) {
      videoFiles.push(path.join(targetDirectory, file));
    } else if (ext === '.wav' || ext === '.mp3' ) {
      audioFile = path.join(targetDirectory, file);
    }
  });

  if (videoFiles.length === 0) {
    console.log('No video files found to combine.');
    return;
  }

  console.log('Video files found to combine:' + videoFiles.length);

  videoFiles.sort();

  const processedVideoFiles = [];
  for (const videoFile of videoFiles) {
      const duration = await getVideoDuration(videoFile);
      const originalFileName = path.basename(videoFile);

      if (duration > 180) { // 3 minutes
          console.log(`Video ${originalFileName} is longer than 3 minutes (${duration.toFixed(2)}s). Trimming to 2m55s with audio fade.`);
          const trimmedDuration = 175; // 2 minutes 55 seconds
          const fadeDuration = 5;
          const fadeStartTime = trimmedDuration - fadeDuration;
          const tempTrimmedPath = path.join(targetDirectory, `temp_trimmed_${originalFileName}`);
          
          const ffmpegTrimArgs = [
              '-y',
              '-i', videoFile,
              '-t', trimmedDuration.toString(),
              '-vf', 'fade=t=out:st=' + (trimmedDuration - 0.5) + ':d=0.5', // Video fade out at the very end
              '-af', 'afade=t=out:st=' + fadeStartTime + ':d=' + fadeDuration,
              '-c:v', 'libx264', // Re-encode video to ensure fade works correctly
              '-preset', 'fast',
              '-crf', '23',
              '-c:a', 'aac',
              tempTrimmedPath
          ];
          await runCommand('ffmpeg', ffmpegTrimArgs);
          processedVideoFiles.push(tempTrimmedPath);
          tempFiles.push(tempTrimmedPath);
      } else {
          processedVideoFiles.push(videoFile);
      }
  }


  const outputVideoPath = path.join(targetDirectory, 'combined_video.mp4');
  const fileListPath = path.join(targetDirectory, 'file_list.txt');
  const fileListContent = processedVideoFiles.map(file => `file '${file.replace(/'/g, "'\\''")}'`).join('\n');
  fs.writeFileSync(fileListPath, fileListContent);

  try {
    const ffmpegArgs = ['-y', '-f', 'concat', '-safe', '0', '-i', fileListPath, '-c', 'copy', outputVideoPath];
    await runCommand('ffmpeg', ffmpegArgs);
    console.log('Videos combined successfully.');

    // Get duration of the initially combined video
    let currentCombinedVideoPath = outputVideoPath;
    let combinedDuration = await getVideoDuration(currentCombinedVideoPath);

    if (combinedDuration > 180) { // If combined video is longer than 3 minutes
        console.log(`Combined video is longer than 3 minutes (${combinedDuration.toFixed(2)}s). Trimming to 2m55s with audio fade.`);
        const finalTrimmedDuration = 175; // 2 minutes 55 seconds
        const fadeDuration = 5;
        const fadeStartTime = finalTrimmedDuration - fadeDuration;
        const finalTempTrimmedPath = path.join(targetDirectory, `final_trimmed_combined_video.mp4`);

        const ffmpegFinalTrimArgs = [
            '-y',
            '-i', currentCombinedVideoPath,
            '-t', finalTrimmedDuration.toString(),
            '-vf', 'fade=t=out:st=' + (finalTrimmedDuration - 0.5) + ':d=0.5', // Video fade out
            '-af', 'afade=t=out:st=' + fadeStartTime + ':d=' + fadeDuration,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            finalTempTrimmedPath
        ];
        await runCommand('ffmpeg', ffmpegFinalTrimArgs);
        console.log('Final combined video trimmed and faded successfully.');
        
        // If the original combined_video.mp4 was created, delete it and use the trimmed version
        if (fs.existsSync(outputVideoPath) && outputVideoPath !== finalTempTrimmedPath) {
            fs.unlinkSync(outputVideoPath);
        }
        currentCombinedVideoPath = finalTempTrimmedPath;
        tempFiles.push(finalTempTrimmedPath); // Add to tempFiles for cleanup
    }

    if (audioFile) {
      // Get video duration (of potentially trimmed combined video)
      const ffprobeArgs = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', currentCombinedVideoPath];
      const durationStr = await runCommand('ffprobe', ffprobeArgs);
      const duration = parseFloat(durationStr);

      console.log(`Combined video duration for audio mixing: ${duration} seconds`);

      // Trim audio
      const trimmedAudioPath = path.join(targetDirectory, 'trimmed_audio.aac');
      const fadeOutStartTime = duration - 3;
      const audioArgs = ['-y', '-i', audioFile, '-ss', '0', '-t', duration, '-af', `afade=t=out:st=${fadeOutStartTime}:d=3`, trimmedAudioPath];
      await runCommand('ffmpeg', audioArgs);
      console.log('Audio trimmed and faded successfully.');

      // Combine video and trimmed audio
      const videoWithAudioPath = path.join(targetDirectory, 'combined_video_with_audio.mp4');
      const combineArgs = ['-y', '-i', currentCombinedVideoPath, '-i', trimmedAudioPath, '-c:v', 'copy', '-c:a', 'aac', '-map', '0:v:0', '-map', '1:a:0', videoWithAudioPath];
      await runCommand('ffmpeg', combineArgs);
      console.log('Audio added successfully. Final video:', videoWithAudioPath);

      // Clean up intermediate files
      if (currentCombinedVideoPath !== outputVideoPath) { // Only unlink if it's a temp file
        fs.unlinkSync(currentCombinedVideoPath);
      }
      fs.unlinkSync(trimmedAudioPath);
    } else {
      console.log('Final video:', currentCombinedVideoPath);
    }
  } finally {
    fs.unlinkSync(fileListPath);
    for (const tempFile of tempFiles) {
        if (fs.existsSync(tempFile)) { // Check if file exists before trying to unlink
            fs.unlinkSync(tempFile);
        }
    }
  }
};

const targetDirectory = destinationDir;

if (!targetDirectory) {
  console.error('Usage: node combine_videos.js <targetDirectory>');
  process.exit(1);
}

combineVideos(targetDirectory).catch(console.error);
