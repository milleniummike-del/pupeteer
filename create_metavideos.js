const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const videos = require('./videos.js');
const directory = require('./directory.js');

const TRACKER_FILE = 'prompt_tracker.json';
const DEBUG=false;

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

        for (let v = 0; v < videos.length; v++) {
            const currentPrompt = videos[v];

            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`⏭ Skipping: ${currentPrompt}`);
                continue;
            }

            console.log(`\n🎬 Prompt: ${currentPrompt}`);

            await page.goto('https://www.meta.ai/');
            const textareaSelector = 'div[data-testid="composer-input"]';
            await page.waitForSelector(textareaSelector, { visible: true });

            const input = await page.$(textareaSelector);

            await input.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await input.type(currentPrompt, { delay: 10 });

            await page.click('button[aria-label="Send"]');

            console.log(`\n🎬 Submitted prompt`);

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            tracker.push(requestEntry);
            saveTracker(tracker);

                await page.waitForSelector('video', { timeout: 180000 });

                const videoUrl = await page.evaluate(() => {
                    const video = document.querySelector('video');
                    return video?.src;
                });

                if (!videoUrl) throw new Error("No video URL found");

                console.log('🎥 Video URL:', videoUrl);

                const safeName = currentPrompt
                    .slice(0, 40)
                    .replace(/[^a-z0-9]/gi, '_')
                    .toLowerCase();

                const filename = `${safeName}_${Date.now()}.mp4`;
                const outputPath = path.join(destinationDir, filename);

                console.log('⬇️ Downloading...');
                await downloadVideo(videoUrl, outputPath);

                console.log(`✅ Saved: ${filename}`);

                requestEntry.status = 'success';

            saveTracker(tracker);

            await new Promise(r => setTimeout(r, 8000));
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();