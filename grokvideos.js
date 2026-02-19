const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const os = require('os');
const style = `Thick impasto brushstrokes
Paint is applied heavily, often straight from the tube, creating visible texture and sculptural surfaces. Brushstrokes remain clearly visible and directional, conveying movement and emotion.

Expressive, exaggerated color
Colors are symbolic rather than realistic—intense yellows, deep blues, vibrant greens, and fiery oranges used to express mood, energy, and inner emotion.

Dynamic motion and rhythm
Skies swirl, fields ripple, trees twist. Lines and strokes often follow curved, repetitive patterns that give scenes a sense of constant motion and life.

Emotional realism over visual realism
Perspective, proportions, and anatomy are often distorted intentionally to heighten psychological or emotional impact.

Strong outlines and simplified forms
Objects are frequently outlined or clearly separated, inspired partly by Japanese woodblock prints, giving scenes clarity despite the expressive chaos.

Intimate, personal subject matter
Common themes include self-portraits, bedrooms, cafés, fields, olive trees, cypress trees, night skies, and everyday rural life—ordinary scenes infused with profound feeling.

High contrast and bold lighting
Light is dramatic and directional, often glowing unnaturally, enhancing the sense of intensity and focus.`

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const environment=1;

if(environment==1) {
destinationDir = `C:\\Users\\Mike\\pupeteer\\videos\\${getTodayDateFormatted()}`;
} else {
destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);

puppeteer.use(StealthPlugin());

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
        headless: false,
        userDataDir: "browser",
        args: [
            '--no-sandbox',
            `--disable-web-security`,
            `--disable-features=IsolateOrigins,site-per-process`,
            `--allow-running-insecure-content`
        ]
    });

    const videos = require('./videos.js');
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

    for (let i = 0; i < videos.length; i++) {

        realVideoUrl = null;
        capturedHeaders = null;

        await page.goto('https://grok.com/imagine', { waitUntil: 'load' });
        await page.setViewport({ width: 727, height: 920 });

        //const textareaSelector = 'textarea[aria-label="Ask Grok anything"]';
        const textareaSelector = 'p[data-placeholder="Type to imagine"]';

        await page.waitForSelector(textareaSelector, { visible: true });
        const contentTextarea = await page.$(textareaSelector);

        await contentTextarea.click();
        await page.keyboard.type(videos[i]+" "+style);

        const submitBtn = await page.waitForSelector('button[aria-label="Submit"]');
        await submitBtn.click();
        console.log('🚀 Prompt submitted');

        await page.waitForSelector('video#sd-video', { timeout: 120000 });
        console.log('🎬 SD video ready');
        
        /*

        const moreBtn = await page.waitForSelector('button[aria-label="More options"]');
        await moreBtn.click();

        const elements = await page.$$('div[role="menuitem"]');
        await elements[4].click(); // HD option
        console.log('💎 Switched to HD');

        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('waited 5 seconds');

        await page.waitForSelector('video#hd-video', { timeout: 120000 });

        */

        // Wait for MP4 URL
        let tries = 0;
        while (!realVideoUrl && tries < 60) {
            await new Promise(r => setTimeout(r, 1000));
            tries++;
        }

        if (!realVideoUrl) {
            console.log('❌ Failed to capture video URL');
            continue;
        }

        console.log('🎥 Real video URL:', realVideoUrl);

        // Get cookies
        const cookies = await page.cookies();
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // Merge cookies into headers
        capturedHeaders = {
            ...capturedHeaders,
            'Cookie': cookieHeader
        };

        // Download inside browser using fetch + Blob
        console.log("⬇️ Downloading inside browser using fetch()...");

        await page.evaluate(async ({ url, headers, filename }) => {

            const res = await fetch(url, { headers });

            if (!res.ok) {
                console.error("❌ Fetch failed", res.status);
                return;
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
a.click();

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                a.remove();
            }, 5000);

        }, {
            url: realVideoUrl,
            headers: capturedHeaders,
            filename: `${videos[i]}_${i}.mp4`
        });

        console.log("✅ Browser download triggered");

        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('waited 10 seconds');
        await moveLatestDownload(destinationDir);
    }
})();
