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
    // MAIN LOOP: Paste prompts, clear model, download images
    // ---------------------------------------------------------
    for (let i = 0; i < videos.length; i++) {

        const textareaSelector = 'textarea';
        await page.waitForSelector(textareaSelector, { visible: true });
        const contentTextarea = await page.$(textareaSelector);

        await page.evaluate(text => navigator.clipboard.writeText(text), videos[i]);
        await contentTextarea.focus();

        await page.keyboard.down('Control');
        await page.keyboard.press('KeyV');
        await page.keyboard.up('Control');

        await new Promise(r => setTimeout(r, 5000));

        const clearButton = await page.waitForSelector('button[aria-label="Clear"]');
        await clearButton.click();

        // ---------------------------------------------------------
        // DOWNLOAD ONLY WEBP IMAGES INSIDE THE USER IMAGES SECTION
        // ---------------------------------------------------------
        const imageUrls = await page.evaluate(() => {
            const container = document.querySelector("#user-images-section");
            if (!container) return [];

            return Array.from(container.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src && src.includes(".webp"));
        });

        for (const url of imageUrls) {
            if (url === IGNORE_URL) continue;

            try {
                const cleanUrl = url.split("?")[0];
                const filename = path.basename(cleanUrl);
                const filepath = path.join(downloadDir, filename);

                console.log(`⬇ Downloading ${url} → ${filename}`);
                await downloadViaPuppeteer(page, url, filepath);

            } catch (err) {
                console.log("❌ Error downloading image:", err);
            }
        }
    }

    // ---------------------------------------------------------
    // AFTER LOOP: GO TO PROFILE PAGE AND DOWNLOAD IMAGES
    // ---------------------------------------------------------
    console.log("➡ Navigating to profile page...");

    await page.goto("https://www.gentube.app/profile/user_33bUVPqjwCD1K48aZugCRe7aP4M", {
        waitUntil: "networkidle2",
        timeout: 0
    });

    await page.waitForSelector("#user-images-section img", { timeout: 15000 }).catch(() => {});

    const profileImages = await page.evaluate(() => {
        const container = document.querySelector("#user-images-section");
        if (!container) return [];

        return Array.from(container.querySelectorAll("img"))
            .map(img => img.src)
            .filter(src => src && src.includes(".webp"));
    });

    console.log(`📸 Found ${profileImages.length} images inside the user-images-section.`);

    for (const url of profileImages) {
        if (url === IGNORE_URL) continue;

        try {
            const cleanUrl = url.split("?")[0];
            const filename = path.basename(cleanUrl);
            const filepath = path.join(downloadDir, filename);

            console.log(`⬇ Downloading profile image → ${filename}`);
            await downloadViaPuppeteer(page, url, filepath);

        } catch (err) {
            console.log("❌ Error downloading profile image:", err);
        }
    }

    const pages = await browser.pages();
    for (const p of pages) await p.close();
    await browser.close();
})();
