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
            args: ["--no-sandbox"],
            devtools: DEBUG
        });

        // ---------------------------------------------------------
        // GET THE REAL PAGE (fixes your $x() issue)
        // ---------------------------------------------------------
        let pages = await browser.pages();
        let page = pages.find(p => p.url() === 'about:blank') || pages[0];

        await page.bringToFront();

        const tracker = loadTracker();

        await page.goto(
            'https://vibes.ai/projects/f599dfbd-8b22-4755-8cc8-710136498a52',
            { waitUntil: 'networkidle2' }
        );

        // ---------------------------------------------------------
        // MAIN LOOP
        // ---------------------------------------------------------
        for (let v = 0; v < videos.length; v++) {

            const currentPrompt = "video of " + videos[v];

            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`⏭ Skipping: ${currentPrompt}`);
                continue;
            }

            console.log(`\n🎬 Prompt: ${currentPrompt}`);
            console.log(`⏳ Waiting for "Add start frame" button`);

            await page.waitForSelector('button[title="Start & End Frame"]', { visible: true });
            await page.click('button[title="Start & End Frame"]');

            await page.waitForSelector('button.cursor_pointer', { visible: true });

            await page.evaluate(() => {
            const buttons = [...document.querySelectorAll('button.cursor_pointer')];
            const target = buttons.find(b => b.innerText.includes('Add start frame'));
            if (target) target.click();
            });

            await page.evaluate(() => {
            const buttons = [...document.querySelectorAll('button')];
            const target = buttons.find(b => b.innerText.includes('Upload'));
            if (target) target.click();
            });

            console.log(`🖊 Uploading image`);

            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                page.click('div[role="button"]')   // opens the file dialog
            ]);

            let img = 'C:/Users/mike_/Pictures/Screenshots/2.png';

            if (!fs.existsSync(img)) {
                throw new Error(`Image not found: ${img}`);
            }

            await fileChooser.accept([img]);


            await page.waitForFunction(() => {
    const btn = document.querySelector('#radix-_R_3r9bsnpflcilb_ > div > div.d_flex.gap_3.px_6.py_4 > button');
    return btn && !btn.disabled;
});

const btnHandle = await page.$('#radix-_R_3r9bsnpflcilb_ > div > div.d_flex.gap_3.px_6.py_4 > button');
const box = await btnHandle.boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        console.log(`⏳ Waiting 30 seconds before closing`);
        await new Promise(r => setTimeout(r, 340000));
        if (browser) await browser.close();
    }
})();
