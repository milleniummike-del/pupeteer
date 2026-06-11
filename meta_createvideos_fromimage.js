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

async function waitForVideoAndDownload(page, downloadDir) {
    console.log("🎥 Waiting for video container…");

    // 1. Wait for the media item container
    const mediaSelector = 'div.group\\/media-item, div[class*="group/media-item"]';
    await page.waitForSelector(mediaSelector, { timeout: 180000 }); // 3 minutes

    console.log("📦 Media container detected");

    // 2. Wait for the <video> tag to appear
    console.log("🎬 Waiting for <video> element…");
    await page.waitForSelector("video", { timeout: 180000 });

    // 3. Wait for the video src to be non-empty
    console.log("🔍 Waiting for video src to load…");
    let videoSrc = null;

    for (let i = 0; i < 60; i++) { // retry for up to 60 seconds
        videoSrc = await page.$eval("video", el => el.getAttribute("src"));
        if (videoSrc && videoSrc.startsWith("http")) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    if (!videoSrc) {
        throw new Error("❌ Video src never loaded");
    }

    console.log("🎞 Video src:", videoSrc);

    // 4. Extract data-video-url (if available)
    let dataVideoUrl = null;
    try {
        dataVideoUrl = await page.$eval('[data-testid="generated-video"]', el =>
            el.getAttribute("data-video-url")
        );
    } catch {}

    const finalUrl = dataVideoUrl || videoSrc;

    console.log("🔗 Final video URL:", finalUrl);

    // 5. Download the video
    const fileName = `video_${Date.now()}.mp4`;
    const filePath = path.join(downloadDir, fileName);

    console.log("⬇ Downloading video to:", filePath);

    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(finalUrl, response => {
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

    console.log("✅ Video downloaded:", filePath);
    return filePath;
}



async function uploadImage(page, imagePath) {
    console.log("🔍 Searching for hidden file input…");

    // Find ANY file input on the page, even if hidden
    const fileInput = await page.$('input[type="file"]');

    if (!fileInput) {
        throw new Error("❌ No file input found in DOM");
    }

    console.log("📤 Uploading file directly (bypassing menu + OS dialog)…");
    await fileInput.uploadFile(imagePath);

    console.log("📸 Waiting for preview…");
    await page.waitForSelector('img', { visible: true });

    console.log("✅ Image preview detected");
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
            const currentPrompt = "make a video";
            const imagePath = path.join(__dirname, "prompt.webp");

            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`⏭ Skipping: ${currentPrompt}`);
            }

            console.log(`\n🎬 Prompt: ${currentPrompt}`);
            console.log(`Waiting for textarea`);

            const textareaSelector = 'div[data-testid="composer-input"]';
            await page.waitForSelector(textareaSelector, { visible: true });

            const input = await page.$(textareaSelector);

            // Clear previous text
            await input.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');

            // Type prompt
            await input.type(currentPrompt, { delay: 10 });

            // Upload image using the Add Attachment menu flow
            await uploadImage(page, imagePath);

            console.log(`Waiting for send`);

            await page.click('button[aria-label="Send"]');

            console.log(`✅ Submitted prompt with image`);

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            tracker.push(requestEntry);
            saveTracker(tracker);

            // Wait for video and download it
            await waitForVideoAndDownload(page, destinationDir);



            let url = page.url();
            console.log(`🌐 URL: ${url}`);

            // SAVE URL
            savePageURL(url);

            requestEntry.status = 'success';
            saveTracker(tracker);

        } catch (err) {
            console.log('⚠ Loop error:', err);
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();
