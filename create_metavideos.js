// puppeteer-generatedvideo-downloader.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const videos = require('./videos.js');
const style = ``;

const TRACKER_FILE = 'prompt_tracker.json';

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function getPreciseTimestamp() {
    const now = new Date();
    const datePart = getTodayDateFormatted();
    const timePart = String(now.getHours()).padStart(2, '0') +
                     String(now.getMinutes()).padStart(2, '0') +
                     String(now.getSeconds()).padStart(2, '0');
    const msPart = String(now.getMilliseconds()).padStart(3, '0');
    return `${datePart}_${timePart}_${msPart}`;
}

function loadTracker() {
    if (fs.existsSync(TRACKER_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveTracker(tracker) {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

const hostname = os.hostname();
let destinationDir;
let sourceDir;
if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
    sourceDir = `??`;
} else {
    destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
    sourceDir = `C:\\Users\\mike_\\Downloads`;
}
console.log("📂 Download folder:", destinationDir);

if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir);
}

(async () => {
    let browser;

    try {
        const browser = await puppeteer.launch({ userDataDir: "browser", 
                headless: false,
                targetFilter: target => !!target.url(),
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            })

        const pages = await browser.pages();
        const page = pages[0];
        await page.bringToFront();
        const tracker = loadTracker();

        // ----------------------------------------------------
        // MAIN AUTOMATION LOOP
        // ----------------------------------------------------
        await page.goto('https://www.meta.ai/', { waitUntil: 'networkidle2' });

        await page.waitForSelector('button[data-slot="capability-pill"]');
        await page.evaluate(() => {
            const btn = [...document.querySelectorAll('button[data-slot="capability-pill"]')]
                .find(b => (b.textContent || '').toLowerCase().includes('create video'));
            btn?.click();
        });

        for (let v = 0; v < videos.length; v++) {
            const currentPrompt = videos[v];
            
            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`Skipping already completed prompt: ${currentPrompt}`);
                continue;
            }

            console.log(`${v}:${currentPrompt}`);
            const textareaSelector = 'div[data-testid="composer-input"]';
            await page.waitForSelector(textareaSelector, { visible: true });
            const contentTextarea = await page.$(textareaSelector);

            await page.evaluate((text) => {
                navigator.clipboard.writeText(text);
            }, currentPrompt + " " + style);

            await contentTextarea.focus();
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyV');
            await page.keyboard.up('Control');

            console.log('Waiting for animate button to be enabled');
            const selector = 'button[data-testid="composer-animate-button"]';

            // Wait for the element to appear and be visible
            await page.waitForSelector(selector, { visible: true });

            // Wait until the element is enabled (no 'disabled' attribute)
            await page.waitForFunction(
            sel => {
                const el = document.querySelector(sel);
                return el && !el.disabled;
            },
            {timeout:120000}, // options for waitForFunction
            selector // argument passed to the function above
            );

            const submit = await page.waitForSelector('button[data-testid="composer-animate-button"]');
            await submit.click();
            console.log('submitted prompt');       

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            tracker.push(requestEntry);
            saveTracker(tracker);

            try {
                // Wait for the FIRST download button to appear
                await page.waitForSelector('button[aria-label="Download"]', { timeout: 90000, visible: true });
                console.log('Download buttons appeared. Waiting for media to settle...');
                
                // Extended wait to ensure multiple videos are ready
                await new Promise(resolve => setTimeout(resolve, 45000));

                const elements = await page.$$('button[aria-label="Download"]');
                const toClick = Math.min(elements.length, 4);
                console.log(`Found ${elements.length} download buttons total. Clicking ${toClick} one-by-one.`);

                const movedFiles = [];
                for (let i = elements.length - 1; i >= elements.length - toClick; i--) {
                    console.log(`Clicking download button @${i}`);
                    await elements[i].click();
                    
                    // Small delay between downloads
                    await new Promise(r => setTimeout(r, 2000));
                }

                // copy all mp4 files from default download folder to destinationDir
                fs.readdirSync(sourceDir).forEach(file => {
                    if (path.extname(file) === '.mp4') {
                        const oldPath = path.join(sourceDir, file);
                        const newPath = path.join(destinationDir, file);
                
                        fs.renameSync(oldPath, newPath);
                
                        console.log(`Moved ${file} to ${destinationDir}`);
                    }
                });
                
            } catch (err) {
                console.error(`Error processing prompt ${v}:`, err);
                requestEntry.status = 'error';
                requestEntry.error = err.message;
            }
            

            saveTracker(tracker);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();
