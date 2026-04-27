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

        let pages = await browser.pages();
        let page;

        if (pages.length === 0) {
            // No tabs at all → create one
            page = await browser.newPage();
        } else {
            // Keep first tab
            page = pages[0];

            // Close all others
            for (let i = 1; i < pages.length; i++) {
                await pages[i].close();
            }
        }

        // Safety check
        if (!page) {
            throw new Error("No page available");
        }

        await page.bringToFront();

        const tracker = loadTracker();

        await page.goto('https://www.meta.ai/');


    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        console.log(`Waiting 30 seconds as final thing`);
        await new Promise(r => setTimeout(r, 30000));
        if (browser) await browser.close();
    }
})();