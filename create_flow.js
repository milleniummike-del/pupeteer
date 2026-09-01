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

    const matrix = require('./matrix.json');
    const page = await browser.newPage();

    await page.goto(
        'https://labs.google/fx/tools/flow/project/5f470746-ea52-4acf-9473-7648b025d4ce',
        { waitUntil: "networkidle2", timeout: 0 }
    );

    const downloadDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    console.log("Total prompts:", matrix.shots.length);

    // Chunked sendCharacter to avoid Flow reload
    async function safeSendCharacter(page, text) {
        const chunks = text.match(/.{1,80}/g); // 80 chars per event = safe
        for (const chunk of chunks) {
            await page.keyboard.sendCharacter(chunk);
            await new Promise(r => setTimeout(r, 20)); // tiny delay prevents redirect
        }
    }

    for (let i = 0; i < matrix.shots.length; i++) {

        const promptText = JSON.stringify(matrix.shots[i]);

        await page.waitForSelector('[data-slate-editor="true"]', { visible: true });

        // Focus editor
        await page.click('[data-slate-editor="true"]');

        // Clear existing text
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');

        // SAFE: chunked sendCharacter
        await safeSendCharacter(page, promptText);

        console.log("Typed prompt:", promptText);

        for (let repeat = 0; repeat < 1; repeat++) {

        await page.evaluate(() => {
            const el = [...document.querySelectorAll("button i.google-symbols")]
                .find(e => e.textContent.trim() === "add_2");
            if (!el) return null;
            const btn = el.closest("button");
            btn?.click();
        });

        const coords = await page.evaluate(() => {
            const buttons = [...document.querySelectorAll("button")];

            const target = buttons.find(btn =>
                btn.textContent.trim() === "Add to Prompt"
            );

            if (!target) return null;

            const rect = target.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        });

        if (coords) {
            await page.mouse.click(coords.x, coords.y);
        }
    }

        await new Promise(r => setTimeout(r, 2000));

        // Click CREATE via mouse on the arrow_forward icon's button
        await page.evaluate(() => {
            const el = [...document.querySelectorAll("button i.google-symbols")]
                .find(e => e.textContent.trim() === "arrow_forward");
            if (!el) return null;
            const btn = el.closest("button");
            const rect = btn.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }).then(async coords => {
            if (!coords) return;
            await page.mouse.click(coords.x, coords.y);
        });

        await new Promise(r => setTimeout(r, 5000));

    }

    const pages = await browser.pages();
    for (const p of pages) await p.close();
    await browser.close();
})();
