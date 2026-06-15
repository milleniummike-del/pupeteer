const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
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
// SCAN A USER-SPECIFIED FOLDER FOR IMAGES
// ---------------------------------------------------------
function getImagesFromFolder(folderPath) {
    const abs = path.resolve(folderPath);

    if (!fs.existsSync(abs)) {
        throw new Error(`❌ Folder does not exist: ${abs}`);
    }

    const files = fs.readdirSync(abs);

    return files
        .filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f))
        .sort()
        .map(f => path.join(abs, f));
}

// ---------------------------------------------------------
// IMAGE UPLOAD (hidden input bypass)
// ---------------------------------------------------------
async function uploadImage(page, imagePath) {
    console.log("🔍 Searching for hidden file input…");

    const fileInput = await page.$('input[type="file"]');

    if (!fileInput) {
        throw new Error("❌ No file input found in DOM");
    }

    console.log("📤 Uploading file:", imagePath);
    await fileInput.uploadFile(imagePath);

    console.log("📸 Waiting for preview…");
    await page.waitForSelector('img', { visible: true });

    console.log("✅ Image preview detected");
}

// ---------------------------------------------------------
// WAIT FOR VIDEO + DOWNLOAD
// ---------------------------------------------------------
async function waitForVideoAndDownload(page, downloadDir) {
    console.log("🎥 Waiting for video container…");

    const mediaSelector = 'div[class*="group/media-item"]';
    await page.waitForSelector(mediaSelector, { timeout: 180000 });

    console.log("📦 Media container detected");

    console.log("🎬 Waiting for <video> element…");
    await page.waitForSelector("video", { timeout: 180000 });

    console.log("🔍 Waiting for video src…");
    let videoSrc = null;

    for (let i = 0; i < 120; i++) { // up to 2 minutes
        videoSrc = await page.$eval("video", el => el.getAttribute("src"));
        if (videoSrc && videoSrc.startsWith("http")) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!videoSrc) throw new Error("❌ Video src never loaded");

    console.log("🎞 Video src:", videoSrc);

    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(downloadDir, fileName);

    console.log("⬇ Downloading:", filePath);

    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(videoSrc, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Download failed: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on("finish", () => file.close(resolve));
        }).on("error", err => {
            fs.unlink(filePath, () => reject(err));
        });
    });

    console.log("✅ Download complete:", filePath);
    return filePath;
}

// ---------------------------------------------------------
let destinationDir = directory.getPath();
console.log("Download directory:", destinationDir);

// ---------------------------------------------------------
// MAIN
// ---------------------------------------------------------
(async () => {
    let browser;

    try {
        // -------------------------
        // READ INPUT FOLDER
        // -------------------------
        const folderArg = process.argv[2];
        if (!folderArg) {
            console.error("❌ Usage: node meta_createvideos_fromimage.js <folder>");
            process.exit(1);
        }

        const promptImages = getImagesFromFolder(folderArg);
        console.log("Found images:", promptImages);

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

        for (const img of promptImages) {

            await page.goto('https://www.meta.ai/');
            const currentPrompt = "make a video";

            console.log(`\n🖼 Using image: ${img}`);
            console.log(`🎬 Prompt: ${currentPrompt}`);

            const textareaSelector = 'div[data-testid="composer-input"]';
            await page.waitForSelector(textareaSelector, { visible: true });

            const input = await page.$(textareaSelector);

            await input.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await input.type(currentPrompt, { delay: 10 });

            // Upload image
            await uploadImage(page, img);

            // Send
            await page.click('button[aria-label="Send"]');
            console.log("🚀 Prompt submitted");

            // Track
            let requestEntry = {
                prompt: img,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            tracker.push(requestEntry);
            saveTracker(tracker);

            // Wait for video + download
            await waitForVideoAndDownload(page, destinationDir);

            requestEntry.status = 'success';
            saveTracker(tracker);

            console.log("✅ Completed:", img);
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        console.log(`Waiting 10 seconds before closing browser…`);
        await new Promise(r => setTimeout(r, 10000));
        if (browser) await browser.close();
    }
})();
