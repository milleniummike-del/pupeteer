/**
 * YouTube Upload Automation (File-based metadata)
 */

const channels = ['https://studio.youtube.com/channel/UCwUI5e_vV229JZZcTLoIdgg','https://studio.youtube.com/channel/UCotGGoP_MQUh6lgB1smxrfw', 'https://studio.youtube.com/channel/UC5A2FeUQSnut7JqHRNGGmBA']; // drone, creation, animals

const channel = channels[2];

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

const directory = require('./directory.js');

const DEBUG = true;

// ---------------------------------------------------------
// 🧠 CLI ARG PARSER
// ---------------------------------------------------------
function getArg(name, fallback = '') {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    if (!arg) return fallback;
    return arg.split('=').slice(1).join('=');
}

// ---------------------------------------------------------
// 📄 READ TEXT FILE HELPER
// ---------------------------------------------------------
function readTextFile(filePath, fallback = '') {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8').trim();
        }
    } catch (err) {
        console.warn(`⚠️ Failed to read ${filePath}:`, err.message);
    }
    return fallback;
}

// ---------------------------------------------------------
// INPUTS
// ---------------------------------------------------------

// File-based inputs (priority)
const TITLE_FILE = path.join(__dirname, 'youtube_title.txt');
const DESC_FILE = path.join(__dirname, 'youtube_description.txt');

// CLI fallback
const TITLE_CLI = getArg('title', 'My Automated Upload');
const DESC_CLI = getArg('description', 'Uploaded with Puppeteer automation');

// Final values (file overrides CLI)
const TITLE = readTextFile(TITLE_FILE, TITLE_CLI);
const DESCRIPTION = readTextFile(DESC_FILE, DESC_CLI);

// Other CLI inputs
const CHANNEL = getArg('channel', channel);
const FILE_NAME = getArg('file', 'final_1.mp4');

// Paths
let destinationDir = directory.getPath() + '\\upscaled';
const FILE_PATH = path.join(destinationDir, FILE_NAME);

console.log("📂 Upload folder:", destinationDir);
console.log("🎬 File:", FILE_PATH);
console.log("📝 Title:", TITLE);
console.log("📄 Description:", DESCRIPTION);
console.log("📺 Channel:", CHANNEL);

// ---------------------------------------------------------

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        devtools: DEBUG
    });

    try {
        const page = (await browser.pages())[0];
        await page.bringToFront();

        await page.goto(CHANNEL, {
            waitUntil: "networkidle2",
        });

        console.log("👉 Log in if needed...");

        await page.waitForSelector("ytcp-icon-button#upload-icon", {
            timeout: 0,
        });

        console.log("✅ Logged in!");

        // Click Create
        await page.click("ytcp-icon-button#upload-icon");

        // Click Upload
        await page.click("ytcp-button#select-files-button");

        // Upload file
        const fileInput = await page.waitForSelector("input[type='file']", { visible: false });
        await fileInput.uploadFile(FILE_PATH);

        console.log("📤 Uploading video...");

        // Wait for title field
        await page.waitForSelector("#textbox", { timeout: 60000 });

        // --- TITLE ---
        await page.waitForSelector("ytcp-video-title #textbox");
        const titleBox = await page.$("ytcp-video-title #textbox");

        await page.evaluate((el, text) => {
            el.textContent = text;
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }, titleBox, TITLE);

        // --- DESCRIPTION ---
        await page.waitForSelector("ytcp-video-description #textbox");
        const descBox = await page.$("ytcp-video-description #textbox");

        await page.evaluate((el, text) => {
            el.textContent = text;
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }, descBox, DESCRIPTION);

        // --- NEXT BUTTONS ---
        const nextBtnSelector = "ytcp-button#next-button";

        for (let i = 0; i < 3; i++) {
            await page.waitForSelector(nextBtnSelector);
            await page.click(nextBtnSelector);
        }

        // --- VISIBILITY (PRIVATE safer default) ---
        const privateRadio = await page.$("tp-yt-paper-radio-button[name='PRIVATE']");
        if (privateRadio) {
            await privateRadio.click();
        }

        // --- SAVE ---
        const saveBtn = await page.$('button[aria-label="Save"]');
        if (saveBtn) {
            await saveBtn.click();
        }

        console.log("🎉 Upload complete!");

    } catch (e) {
        console.error("🔥 Error:", e);
    } finally {
        // Keep browser open for debugging
        await new Promise(resolve => setTimeout(resolve, 555000));
    }
})();