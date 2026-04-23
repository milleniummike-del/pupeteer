/**
 * Video2X Batch Upscaler (Node.js)
 * Equivalent of PowerShell script
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const directory = require('./directory.js');
const inputDir = directory.getPath();
console.log(inputDir);

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
    }
}

function getAllFiles(dir) {
    let results = [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
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
                //console.error(`❌ Failed (${code}): ${inputPath}`);
                //reject(new Error(`Exit code ${code}`));
                resolve();
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
        ensureDir(outputDir);

        const files = getAllFiles(inputDir);

        console.log(`📁 Found ${files.length} video(s)`);

        for (const file of files) {
            const fileName = path.basename(file);
            const outputPath = path.join(outputDir, fileName);

            await upscaleVideo(file, outputPath);
        }

        console.log('\n🚀 All videos processed!');
    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    }
})();