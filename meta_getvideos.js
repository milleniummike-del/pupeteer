const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const directory = require('./directory.js');

const TRACKER_FILE = 'prompt_tracker.json';
const DEBUG = true;

function loadTracker() {
    if (fs.existsSync(TRACKER_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
        } catch {
            return [];
        }
    }
    return [];
}

function saveTracker(tracker) {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

function downloadVideo(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Download failed: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => reject(err));
        });
    });
}

let destinationDir = directory.getPath();
console.log(destinationDir);

(async () => {
    let browser;

    try {
        browser = await puppeteer.launch({
            userDataDir: "browser",
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ["--no-sandbox"],
            devtools: DEBUG
        });

        const page = (await browser.pages())[0];
        await page.bringToFront();

        const tracker = loadTracker();
        const pageUrl = directory.loadPage();
        await page.goto(pageUrl);

        console.log(`Waiting 10`);
        await new Promise(r => setTimeout(r, 10000));
 
        const vids = await page.$$('video', { timeout: 180000 });

        console.log(vids);
        for (let count = 0; count < vids.length; count++) {
            const videoHandle = vids[count];

            const videoUrl = await page.evaluate(video => video.src, videoHandle);

            if (!videoUrl) {
                console.log(`⚠️ No video URL found for index ${count}`);
                continue;
            }

            console.log('🎥 Video URL:', videoUrl);

            const safeName = 'video';

            const filename = `${safeName}_${Date.now()}_${count}.mp4`;
            const outputPath = path.join(destinationDir, filename);

            console.log('⬇️ Downloading...');
            await downloadVideo(videoUrl, outputPath);

            console.log(`✅ Saved: ${filename}`);
            //console.log('& "C:\\Program Files\\Video2X Qt6\\video2x.exe" ` -i "'+outputPath+'" ` -o "'+destinationDir+'\\upscaled\\'+filename+'" -p "realesrgan" -s "3"');
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();