const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const matrix = require('./matrix.js');
    const page = await browser.newPage();

    await page.goto(
        'https://www.gentube.app/create-together/k17e0enegvgsec6fy4epj16zrx8d9w78?creating=1',
        { waitUntil: "networkidle2", timeout: 0 }
    );

    // CLICK CHARACTER CARD
    await page.waitForSelector('img[alt="Amina"]', { visible: true });
    await page.click('img[alt="Amina"]');

    // Ensure download directory exists
    const downloadDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    // ---------------------------------------------------------
    // Save DATA URI image ONLY
    // ---------------------------------------------------------
    async function saveDataImage(src) {
        const match = src.match(/^data:(image\/\w+);base64,(.*)$/);
        if (!match) return;

        const ext = match[1].split("/")[1];
        const base64 = match[2];

        const buffer = Buffer.from(base64, "base64");
        const filename = `dataimg_${Date.now()}.${ext}`;
        const filepath = path.join(downloadDir, filename);

        fs.writeFileSync(filepath, buffer);
        console.log("[DATA] Saved:", filepath);
    }

    console.log("Total prompts:", matrix.length);

    // ---------------------------------------------------------
    // MAIN LOOP: Type prompts, wait, capture largest DATA image, clear
    // ---------------------------------------------------------
    for (let i = 0; i < matrix.length; i++) {

        const textareaSelector = 'textarea';
        await page.waitForSelector(textareaSelector, { visible: true });

        const contentTextarea = await page.$(textareaSelector);

        // Clear textarea
        await contentTextarea.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');

        // Type full prompt using setter trick
        const text = `${JSON.stringify(matrix[i].still_frame_prompt)}`;

        await page.evaluate((selector, value) => {
            const el = document.querySelector(selector);
            const setter = Object.getOwnPropertyDescriptor(el.__proto__, 'value').set;
            setter.call(el, value);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }, textareaSelector, text);

        // Wait for images to generate
        await new Promise(r => setTimeout(r, 10000));

        // ---------------------------------------------------------
        // Capture ONLY the largest data:image/... image
        // ---------------------------------------------------------
        const dataImages = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("img"))
                .map(img => ({
                    src: img.src,
                    size: img.src.startsWith("data:image")
                        ? img.src.length
                        : 0
                }))
                .filter(obj => obj.src.startsWith("data:image"));
        });

        if (dataImages.length === 0) {
            console.log("[DATA] No data images found for prompt", i + 1);
        } else {
            const largest = dataImages.reduce((a, b) => (b.size > a.size ? b : a));
            await saveDataImage(largest.src);
        }

        // Clear button
        const clearButton = await page.waitForSelector('button[aria-label="Clear"]');
        await clearButton.click();
    }

    const pages = await browser.pages();
    for (const p of pages) await p.close();
    await browser.close();
})();
