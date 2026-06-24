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
    // Read limit parameter
    const limitArg = parseInt(process.argv[2], 10);
    const maxCount = !isNaN(limitArg) && limitArg > 0 ? limitArg : null;

    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Avatar image to ignore
    const IGNORE_URL = "https://d2z5znftraj9jv.cloudfront.net/jn7a2fmhfr3zfc8k1zzk004zfn7rzjz5.webp";

    // Ensure download directory exists
    const downloadDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    // ---------------------------------------------------------
    // GO TO PROFILE PAGE AND DOWNLOAD IMAGES
    // ---------------------------------------------------------
    console.log("➡ Navigating to profile page...");

    //const url="https://www.gentube.app/create-together/k17b00r5crh4j4p153w644xjm57vmcvd";
    const url="https://www.gentube.app/profile/user_33bUVPqjwCD1K48aZugCRe7aP4M";

    await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 0
    });

    await page.waitForSelector("#user-images-section img", { timeout: 15000 }).catch(() => {});

    let profileImages = await page.evaluate(() => {
        const container = document.querySelector("#user-images-section");
        if (!container) return [];

        return Array.from(container.querySelectorAll("img"))
            .map(img => img.src)
            .filter(src => src && src.includes(".webp"));
    });

    console.log(`📸 Found ${profileImages.length} images inside the user-images-section.`);

    // 1) Filter out ignored URLs first
    profileImages = profileImages.filter(url => url !== IGNORE_URL);

    console.log(`📸 After ignoring avatar, ${profileImages.length} images remain.`);

    // 2) Apply limit AFTER filtering
    if (maxCount !== null) {
        console.log(`📉 Limiting download to first ${maxCount} images`);
        profileImages = profileImages.slice(0, maxCount);
    }

    for (const url of profileImages) {
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
