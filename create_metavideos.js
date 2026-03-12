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

if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
} else {
    destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
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

    async function waitForOneNewFile(dir, initialFiles, timeout = 60000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const files = fs.readdirSync(dir);
            const currentFiles = files.filter(f => !f.endsWith('.crdownload') && !f.endsWith('.tmp') && !f.endsWith('.com.google.Chrome.tmp'));
            const newFile = currentFiles.find(f => !initialFiles.includes(f));
            if (newFile) {
                return newFile;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        return null;
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
        
        // Resolve absolute path for downloads
        const absoluteDownloadDir = path.resolve(downloadDir);
        if (!fs.existsSync(absoluteDownloadDir)) {
            fs.mkdirSync(absoluteDownloadDir, { recursive: true });
        }

        // Use Browser target for global download behavior
        const client = await browser.target().createCDPSession();
        
        client.on('Browser.downloadWillBegin', (event) => {
            console.log(`🔔 Download will begin: ${event.suggestedFilename} (guid: ${event.guid})`);
        });

        client.on('Browser.downloadProgress', (event) => {
            if (event.state === 'completed') {
                console.log(`✅ Download completed: ${event.guid}`);
            }
        });

        try {
            await client.send('Browser.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: absoluteDownloadDir,
                eventsEnabled: true,
            });
            console.log("✅ Browser download behavior set to:", absoluteDownloadDir);
        } catch (e) {
            console.warn("⚠️ Browser.setDownloadBehavior failed, falling back to Page.setDownloadBehavior:", e.message);
            const pageClient = await page.target().createCDPSession();
            await pageClient.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: absoluteDownloadDir,
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

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            tracker.push(requestEntry);
            saveTracker(tracker);

            try {
                // Wait for the FIRST download button to appear
                await page.waitForSelector('button[aria-label="Download"]', { timeout: 180000, visible: true });
                console.log('Download buttons appeared. Waiting for media to settle...');
                
                // Extended wait to ensure multiple videos are ready
                await new Promise(resolve => setTimeout(resolve, 45000));

                const elements = await page.$$('button[aria-label="Download"]');
                const toClick = Math.min(elements.length, 4);
                console.log(`Found ${elements.length} download buttons total. Clicking ${toClick} one-by-one.`);

                const movedFiles = [];
                for (let i = elements.length - 1; i >= elements.length - toClick; i--) {
                    const currentDownloadDirFiles = fs.readdirSync(downloadDir);
                    console.log(`Clicking download button @${i}`);
                    await elements[i].click();
                    
                    const newFile = await waitForOneNewFile(downloadDir, currentDownloadDirFiles, 60000);
                    if (newFile) {
                        const oldPath = path.join(downloadDir, newFile);
                        const timestamp = getPreciseTimestamp();
                        const ext = path.extname(newFile);
                        const base = path.basename(newFile, ext);
                        
                        let newFileName = `p${v}_f${elements.length - 1 - i}_${base}_${timestamp}${ext}`;
                        let newPath = path.join(destinationDir, newFileName);

                        // Final check for collisions just in case
                        let c = 1;
                        while (fs.existsSync(newPath)) {
                            newPath = path.join(destinationDir, `p${v}_f${elements.length - 1 - i}_${base}_${timestamp}_c${c}${ext}`);
                            c++;
                        }

                        fs.copyFileSync(oldPath, newPath);
                        fs.unlinkSync(oldPath);
                        console.log(`Successfully moved: ${newFileName}`);
                        movedFiles.push(newPath);
                    } else {
                        console.warn(`Timeout waiting for file from button @${i}`);
                    }
                    
                    // Small delay between downloads
                    await new Promise(r => setTimeout(r, 2000));
                }
                
                if (movedFiles.length > 0) {
                    requestEntry.status = 'success';
                    requestEntry.files = movedFiles;
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
