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

const environment = 2;
let destinationDir;

if (environment == 1) {
    destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
} else {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);

(async () => {
    let browser;
    const downloadDir = path.join(__dirname, 'downloads');

    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    // Clean up local download dir at start to avoid confusion with old files
    const existingTempFiles = fs.readdirSync(downloadDir);
    for (const file of existingTempFiles) {
        fs.unlinkSync(path.join(downloadDir, file));
    }

    async function waitForDownloads(dir, initialCount, expectedCount, timeout = 60000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const files = fs.readdirSync(dir);
            const currentFiles = files.filter(f => !f.endsWith('.crdownload') && !f.endsWith('.tmp'));
            if (currentFiles.length >= initialCount + expectedCount) {
                return currentFiles;
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        return fs.readdirSync(dir).filter(f => !f.endsWith('.crdownload') && !f.endsWith('.tmp'));
    }

    async function moveNewDownloads(source, destination, knownFiles) {
        try {
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }

            const currentFiles = fs.readdirSync(source);
            const newFiles = currentFiles.filter(f => !knownFiles.includes(f) && !f.endsWith('.crdownload') && !f.endsWith('.tmp'));

            const movedFiles = [];
            for (const fileName of newFiles) {
                const oldPath = path.join(source, fileName);
                let newPath = path.join(destination, fileName);

                let counter = 1;
                const ext = path.extname(fileName);
                const base = path.basename(fileName, ext);

                while (fs.existsSync(newPath)) {
                    newPath = path.join(destination, `${base}_${counter}${ext}`);
                    counter++;
                }

                fs.copyFileSync(oldPath, newPath);
                fs.unlinkSync(oldPath);
                console.log(`Moved ${fileName} to ${newPath}`);
                movedFiles.push(newPath);
            }
            return movedFiles;
        } catch (error) {
            console.error('Error moving file:', error);
            return [];
        }
    }

    try {
        browser = await puppeteer.launch({
            userDataDir: "browser",
            headless: false,
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0];
        await page.bringToFront();
        
        const client = await page.target().createCDPSession();
        
        // Use Browser.setDownloadBehavior for more reliable across-page behavior
        try {
            await client.send('Browser.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadDir,
                eventsEnabled: true,
            });
            console.log("✅ Browser download behavior set to:", downloadDir);
        } catch (e) {
            console.warn("⚠️ Browser.setDownloadBehavior failed, falling back to Page.setDownloadBehavior:", e.message);
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadDir,
            });
        }

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
            
            // Skip if already successfully processed (optional, but good for "keep track")
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

            const submit = await page.waitForSelector('button[data-testid="composer-animate-button"]');
            await submit.click();
            console.log('submitted prompt');

            // Log requested prompt
            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            tracker.push(requestEntry);
            saveTracker(tracker);

            try {
                const media = await page.waitForSelector('button[aria-label="Download"]', { timeout: 120000 });
                console.log('waited for Download media');
                
                // Wait for generation to settle
                await new Promise(resolve => setTimeout(resolve, 30000));

                const elements = await page.$$('button[aria-label="Download"]');
                console.log(`Found ${elements.length} download buttons`);

                const initialFiles = fs.readdirSync(downloadDir).filter(f => !f.endsWith('.crdownload') && !f.endsWith('.tmp'));
                
                // Click last 4 (or fewer if not available)
                const toClick = Math.min(elements.length, 4);
                for (let i = elements.length - 1; i >= elements.length - toClick; i--) {
                    console.log("clicking download button @" + i);
                    await elements[i].click();
                }

                console.log('Waiting for downloads to complete...');
                const currentFiles = await waitForDownloads(downloadDir, initialFiles.length, toClick, 60000);
                
                const moved = await moveNewDownloads(downloadDir, destinationDir, initialFiles);
                
                if (moved.length > 0) {
                    requestEntry.status = 'success';
                    requestEntry.files = moved;
                } else {
                    requestEntry.status = 'failed';
                    requestEntry.error = 'No files moved';
                }
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
