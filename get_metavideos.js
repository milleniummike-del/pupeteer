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

            try {
                // Wait for the FIRST download button to appear
                await page.waitForSelector('button[aria-label="Download"]', { timeout: 180000, visible: true });
                console.log('Download buttons appeared. Waiting for media to settle...');
                
                // Extended wait to ensure multiple videos are ready
                //await new Promise(resolve => setTimeout(resolve, 45000));

                const elements = await page.$$('button[aria-label="Download"]');
                const toClick = Math.min(elements.length, 4);
                console.log(`Found ${elements.length} download buttons total. Clicking ${toClick} one-by-one.`);

                for (let i = elements.length - 1; i >= elements.length - toClick; i--) {
                    console.log(`${i}`);
                
                }
            } catch (err) {
                console.error(`Error processing `, err);
              }
            
            saveTracker(tracker);
            await new Promise(resolve => setTimeout(resolve, 10000));


    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();
