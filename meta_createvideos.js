const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const videos = require('./videos.js');
const directory = require('./directory.js');

const TRACKER_FILE = 'prompt_tracker.json';
const PAGE_FILE = 'page.txt';
const DEBUG = false;

// ---------------------------------------------------------
// TRACKER
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// SAVE PAGE URL
// ---------------------------------------------------------
function savePageURL(url) {
    const line = `${url}\n`;
    fs.writeFileSync(PAGE_FILE, line, 'utf8');
}

// ---------------------------------------------------------
// DOWNLOAD VIDEO (unused but kept)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
let destinationDir = directory.getPath();
console.log(destinationDir);

// ---------------------------------------------------------
// MAIN
// ---------------------------------------------------------
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

        await page.goto('https://www.meta.ai/');

        try {
            for (let v = 0; v < videos.length; v++) {
                const currentPrompt = videos[v];

                if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                    console.log(`⏭ Skipping: ${currentPrompt}`);
                    continue;
                }

                console.log(`\n🎬 Prompt: ${currentPrompt}`);
                console.log(`✅ Waiting for textarea`);
                const textareaSelector = 'div[data-testid="composer-input"]';
                await page.waitForSelector(textareaSelector, { visible: true });

                
                const input = await page.$(textareaSelector);

                await input.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');
                await input.type(currentPrompt, { delay: 10 });

                console.log(`Waiting for send`);

                await page.click('button[aria-label="Send"]');

                console.log(`✅ Submitted prompt`);

                let requestEntry = {
                    prompt: currentPrompt,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                };

                tracker.push(requestEntry);
                saveTracker(tracker);

                // wait for response to generate
                console.log(`Waiting 60 seconds`);
                await new Promise(r => setTimeout(r, 60000));

                let url = page.url();
                console.log(`🌐 URL: ${url}`);

                // ✅ SAVE URL TO FILE
                savePageURL(url);

                requestEntry.status = 'success';
                saveTracker(tracker);

            }
        }
        catch (err) {
            console.log('⚠ Loop error:', err);
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        console.log(`Waiting 30 seconds as final thing`);
        await new Promise(r => setTimeout(r, 30000));
        if (browser) await browser.close();
    }
})();