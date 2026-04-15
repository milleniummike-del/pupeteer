const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const videos = require('./videos.js');

const TRACKER_FILE = 'prompt_tracker.json';

function getTodayDateFormatted() {
    const today = new Date();
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
}

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

const hostname = os.hostname();
let destinationDir;

if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
} else {
    destinationDir = `C:\\Users\\mike_\\puppeteer\\videos\\${getTodayDateFormatted()}`;
}

if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
}

(async () => {
    let browser;

    try {
        browser = await puppeteer.launch({
            userDataDir: "browser",
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ["--no-sandbox"],
            devtools: true
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

            // Click "Create image/video"
            console.log(`\n🎬 Looking to click Create Image`);
            await page.waitForSelector('button[data-slot="capability-pill"]');
            await page.evaluate(() => {
                const btn = [...document.querySelectorAll('button[data-slot="capability-pill"]')];
                btn[2].click();
                console.log(`\n🎬 Clicked button`);

            });

            

            // Wait input
            const textareaSelector = 'div[data-testid="composer-input"]';
            await page.waitForSelector(textareaSelector, { visible: true });

            const input = await page.$(textareaSelector);

            await input.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await input.type(currentPrompt, { delay: 10 });

            await page.waitForSelector('[data-slot="select-trigger"]');

            const triggers = await page.$$('[data-slot="select-trigger"]');
            if (triggers.length >= 2) {
                await triggers[1].click();
            }

            const options = await page.$$('[role="option"]');
            // defaults to vertical if not clicked
            //await options[2].click();

            //await page.evaluate(() => {debugger;});
            
            // Send
            await page.click('button[aria-label="Send"]');

            console.log(`\n🎬 Submitted animation`);

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            tracker.push(requestEntry);
            saveTracker(tracker);

            try {
                // Wait for Animate button
                await page.waitForFunction(() => {
                    return [...document.querySelectorAll('button')]
                        .some(b => b.textContent.includes('Animate'));
                }, { timeout: 120000 });

                // Click Animate
                await page.evaluate(() => {
                    const btn = [...document.querySelectorAll('button')]
                        .find(b => b.textContent.includes('Animate'));
                    btn?.click();
                });

                // Wait for video element
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

            } catch (err) {
                console.error(`❌ Error:`, err.message);
                requestEntry.status = 'error';
                requestEntry.error = err.message;
            }

            saveTracker(tracker);

            await new Promise(r => setTimeout(r, 8000));
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();