/**
 * Video2X Batch Upscaler (Improved)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const directory = require('./directory.js');

const inputDir = directory.getPath();
console.log(`📂 Input directory: ${inputDir}`);

// ---------------------------------------------------------
// CONFIG
// ---------------------------------------------------------
const outputDir = path.join(inputDir, 'upscaled');

const video2xPath = 'C:/Program Files/Video2X Qt6/video2x.exe';

const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
}

function isInsideOutputDir(filePath) {
    return filePath.startsWith(outputDir);
}

function alreadyUpscaled(outputPath) {
    return fs.existsSync(outputPath);
}

function getAllFiles(dir) {
    let results = [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip the output directory entirely
            if (filePath === outputDir) return;

            results = results.concat(getAllFiles(filePath));
        } else {
            if (videoExtensions.includes(path.extname(file).toLowerCase())) {
                results.push(filePath);
            }
        }
    });

    return results;
}

function upscaleVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`\n🎬 Upscaling: ${inputPath}`);

        const args = [
            '-i', inputPath,
            '-o', outputPath,
            '-p', 'realesrgan',
            '-s', '3'
        ];

        const proc = spawn(video2xPath, args, {
            stdio: 'inherit'
        });

        proc.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Done: ${outputPath}`);
                resolve();
            } else {
                console.warn(`⚠️ Skipped/Failed (${code}): ${inputPath}`);
                resolve(); // continue batch
            }
        });

        proc.on('error', (err) => {
            console.error(`🔥 Error: ${err.message}`);
            reject(err);
        });
    });
}

// ---------------------------------------------------------
// MAIN
// ---------------------------------------------------------
(async () => {
    try {
        // Ensure output directory exists
        ensureDir(outputDir);

        const files = getAllFiles(inputDir);

        console.log(`📁 Found ${files.length} video(s)`);

        let skipped = 0;
        let processed = 0;

        for (const file of files) {
            // Skip if already in output directory
            if (isInsideOutputDir(file)) {
                console.log(`⏭️ Skipping (already in output dir): ${file}`);
                skipped++;
                continue;
            }

            const fileName = path.basename(file);
            const outputPath = path.join(outputDir, fileName);

            // Skip if output already exists
            if (alreadyUpscaled(outputPath)) {
                console.log(`⏭️ Skipping (already upscaled): ${fileName}`);
                skipped++;
                continue;
            }

            await upscaleVideo(file, outputPath);
            processed++;
        }

        console.log('\n🚀 All videos processed!');
        console.log(`✅ Processed: ${processed}`);
        console.log(`⏭️ Skipped: ${skipped}`);

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    }
})();