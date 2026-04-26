const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const os = require('os');
const style = ``;
const videos = require('./videos.js');

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const hostname = os.hostname();
let destinationDir;

if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
} else {
    destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);


// 📁 Folder where Chrome will save files
const downloadDir = path.resolve(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

async function moveLatestDownload(destination) {
    const downloadsPath = path.join(os.homedir(), 'Downloads');
    try {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        const files = fs.readdirSync(downloadsPath);
        if (files.length === 0) {
            console.log('No files found in downloads directory');
            return;
        }

        const latestFile = files.map(file => ({
            file,
            mtime: fs.statSync(path.join(downloadsPath, file)).mtime
        })).sort((a, b) => b.mtime - a.mtime)[0];

        if (latestFile) {
            const oldPath = path.join(downloadsPath, latestFile.file);
            const newPath = path.join(destination, latestFile.file);
            fs.copyFileSync(oldPath, newPath);
            fs.unlinkSync(oldPath);
            console.log(`Moved ${latestFile.file} to ${destination}`);
        }
    } catch (error) {
        console.error('Error moving file:', error);
    }
}

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        protocolTimeout: 0
    });

    const page = await browser.newPage();
    let realVideoUrl = null;
    let capturedHeaders = null;

    // Capture real MP4 request + headers
    page.on('request', req => {
        const url = req.url();

        if (req.resourceType() === 'media' && url.includes('mp4')) {
            console.log(url);
            realVideoUrl = url;
            capturedHeaders = req.headers();
            console.log('🎥 Captured real video URL + headers');
        }
    });

    for (let i = 0; i < 2; i++) {
        const musicprompt = 'soundtrack for ' + videos[i];

        await page.goto('https://producer.ai', {});
        const textareaSelector = 'textarea[aria-label="Chat message"]';
        await page.waitForSelector(textareaSelector, { visible: true });
        const contentTextarea = await page.$(textareaSelector);

        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, musicprompt);

        await contentTextarea.focus();

        // press ctrl+v
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyV');
        await page.keyboard.up('Control');
        await page.keyboard.press('Enter');

         // Download inside browser using fetch + Blob
        console.log("⬇️ GET DOWNLOADING WORKING!");
    }
    if (browser) await browser.close();

})();
