const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// ---------------------------------------------------------
// Puppeteer-based download that bypasses CloudFront 403
// ---------------------------------------------------------
async function downloadViaPuppeteer(page, url, filepath) {
    const response = await page.goto(url, { timeout: 0 });
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
}

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const videos = require('./videos.js');
    const page = await browser.newPage();

    await page.goto('https://www.gentube.app/feed/spotlight?creating=1', {
        waitUntil: "networkidle2",
        timeout: 0
    });

    // Ensure download directory exists
    const downloadDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    // Avatar image to ignore
    const IGNORE_URL = "https://d2z5znftraj9jv.cloudfront.net/jn7a2fmhfr3zfc8k1zzk004zfn7rzjz5.webp";

    // ---------------------------------------------------------
    // MAIN LOOP: Type prompts, clear model, download images
    // ---------------------------------------------------------
    for (let i = 0; i < videos.length; i++) {

        const textareaSelector = 'textarea';
        await page.waitForSelector(textareaSelector, { visible: true });

        const contentTextarea = await page.$(textareaSelector);

        // Focus and clear textarea via real keystrokes
        await contentTextarea.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');

        // Type full prompt with no delay (fast as possible)
        await page.type(textareaSelector, videos[i]); // default delay = 0

        // Wait for images to generate
        await new Promise(r => setTimeout(r, 5000));

        // Clear button
        const clearButton = await page.waitForSelector('button[aria-label="Clear"]');
        await clearButton.click();
    }

    const pages = await browser.pages();
    for (const p of pages) await p.close();
    await browser.close();
})();
