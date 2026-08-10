const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ---------------- CONFIG ----------------
const inputDir = path.join(__dirname, "chain/oneday");
const tempDir = path.join(__dirname, "temp_clean");
const listFile = path.join(__dirname, "imagelist.txt");
const outputVideo = path.join(__dirname, "chain/output.mp4");

// Add mp4 support
const extsImage = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const extsVideo = new Set([".mp4"]);

// ---------------- SETUP ----------------
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// ---------------- VALIDATE ----------------
function isValidMedia(file) {
    try {
        execSync(
            `ffprobe -v error -show_entries stream=codec_type -of default=noprint_wrappers=1 "${file}"`,
            { stdio: "ignore" }
        );
        return true;
    } catch {
        return false;
    }
}

function convertToPng(src, dest) {
    execSync(`ffmpeg -y -i "${src}" "${dest}"`, { stdio: "ignore" });
}

// ---------------- COLLECT FILES ----------------
const rawFiles = fs.readdirSync(inputDir)
    .filter(f => extsImage.has(path.extname(f).toLowerCase()) || extsVideo.has(path.extname(f).toLowerCase()))
    .map(f => {
        const full = path.join(inputDir, f);
        const stat = fs.statSync(full);
        return { file: full, mtime: stat.mtimeMs };
    })
    .sort((a, b) => a.mtime - b.mtime)   // oldest → newest
    .map(obj => obj.file);


const cleanFiles = [];

for (const file of rawFiles) {
    if (!isValidMedia(file)) {
        console.log("Skipping corrupted:", file);
        continue;
    }

    const ext = path.extname(file).toLowerCase();

    // If it's a video, keep as-is
    if (extsVideo.has(ext)) {
        cleanFiles.push(file);
        continue;
    }

    // If it's an image, convert to PNG
    const base = path.basename(file, ext);
    const out = path.join(tempDir, base + ".png");

    convertToPng(file, out);
    cleanFiles.push(out);
}

if (cleanFiles.length === 0) {
    console.error("No valid media found.");
    process.exit(1);
}

// ---------------- WRITE CONCAT LIST ----------------
let listContent = "";

for (const file of cleanFiles) {
    const ext = path.extname(file).toLowerCase();

    listContent += `file '${file.replace(/'/g, "'\\''")}'\n`;

    // Only images get duration
    if (extsImage.has(ext) || ext === ".png") {
        listContent += `duration 2\n`;
    }
}

// FFmpeg requires repeating last frame ONLY if last item is an image
const lastExt = path.extname(cleanFiles[cleanFiles.length - 1]).toLowerCase();
if (extsImage.has(lastExt) || lastExt === ".png") {
    listContent += `file '${cleanFiles[cleanFiles.length - 1].replace(/'/g, "'\\''")}'\n`;
}

fs.writeFileSync(listFile, listContent);

// ---------------- RUN FFMPEG ----------------
try {
    execSync(
        `ffmpeg -y -err_detect ignore_err -f concat -safe 0 -i "${listFile}" -vsync vfr -pix_fmt yuv420p "${outputVideo}"`,
        { stdio: "inherit" }
    );
    console.log("Video created:", outputVideo);
} catch (err) {
    console.error("FFmpeg failed:", err);
}
