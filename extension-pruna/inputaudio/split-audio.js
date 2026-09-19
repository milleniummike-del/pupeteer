// audio-split.js
// Usage: node audio-split.js input.mp3 20

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function splitAudio(inputFile, segmentSeconds) {
  if (!fs.existsSync(inputFile)) {
    console.error("Input file not found:", inputFile);
    process.exit(1);
  }

  const base = path.basename(inputFile, path.extname(inputFile));
  const outDir = `${base}-segments`;

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const outputPattern = path.join(outDir, `%01d.wav`);

  console.log(`Splitting "${inputFile}" into ${segmentSeconds}-second segments…`);

  const ff = spawn("ffmpeg", [
    "-i", inputFile,
    "-f", "segment",
    "-segment_time", segmentSeconds.toString(),
    "-c", "copy",
    outputPattern
  ]);

  ff.stdout.on("data", d => process.stdout.write(d));
  ff.stderr.on("data", d => process.stdout.write(d));

  ff.on("close", code => {
    if (code === 0) {
      console.log("Done. Segments saved in:", outDir);
    } else {
      console.error("ffmpeg exited with code", code);
    }
  });
}

// CLI
const input = process.argv[2];
const seconds = parseInt(process.argv[3], 10);

if (!input || !seconds) {
  console.log("Usage: node audio-split.js <file.wav|file.mp3> <segment_seconds>");
  process.exit(1);
}

splitAudio(input, seconds);
