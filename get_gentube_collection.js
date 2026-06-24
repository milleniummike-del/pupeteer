const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// ---------------------------------------------------------
// Puppeteer-based download that bypasses CloudFront 403
// ---------------------------------------------------------
async function downloadViaPuppeteer(browser, url, filepath) {
    const page = await browser.newPage();
    const response = await page.goto(url, { timeout: 0, waitUntil: 'networkidle2' });
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
    await page.close();
}

// ---------------------------------------------------------
// Scroll enough to trigger lazy loading
// ---------------------------------------------------------
async function loadAllImages(page) {
    let lastHeight = 0;
    for (let i = 0; i < 30; i++) {
        const height = await page.evaluate('document.body.scrollHeight');
        if (height === lastHeight) break;
        lastHeight = height;
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise(r => setTimeout(r, 1000));
    }
}

(async () => {
    const limitArg = parseInt(process.argv[2], 10);
    const maxCount = !isNaN(limitArg) && limitArg > 0 ? limitArg : null;

    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    const IGNORE_URL = "https://d2z5znftraj9jv.cloudfront.net/jn7a2fmhfr3zfc8k1zzk004zfn7rzjz5.webp";

    const downloadDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    console.log("➡ Navigating to create-together page...");

    const url = "https://www.gentube.app/create-together/k173n7aep19y4w7g88j244es457t9nm5";

    // ---------------------------------------------------------
    // Collect all .webp URLs via network interception
    // ---------------------------------------------------------
    const collected = new Set();

    await page.setRequestInterception(true);
    page.on('request', request => {
        request.continue();
    });

    page.on('requestfinished', async request => {
        try {
            const reqUrl = request.url();
            if (reqUrl.includes('.webp')) {
                const clean = reqUrl.split('?')[0];
                collected.add(clean);
            }
        } catch {
            // ignore
        }
    });

    await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 0
    });

    console.log("🔄 Scrolling to trigger all media loads...");
    await loadAllImages(page);
    await new Promise(r => setTimeout(r, 2000));

    let profileImages = Array.from(collected);
    console.log(`📸 Network captured ${profileImages.length} .webp URLs.`);

    // Filter out avatar
    profileImages = profileImages.filter(u => u !== IGNORE_URL);
    console.log(`📸 After ignoring avatar, ${profileImages.length} images remain.`);

    // Apply limit
    if (maxCount !== null) {
        console.log(`📉 Limiting download to first ${maxCount} images`);
        profileImages = profileImages.slice(0, maxCount);
    }

    for (const imgUrl of profileImages) {
        try {
            const filename = path.basename(imgUrl);
            const filepath = path.join(downloadDir, filename);

            console.log(`⬇ Downloading image → ${filename}`);
            await downloadViaPuppeteer(browser, imgUrl, filepath);
        } catch (err) {
            console.log("❌ Error downloading image:", err);
        }
    }

    const pages = await browser.pages();
    for (const p of pages) await p.close();
    await browser.close();
})();
