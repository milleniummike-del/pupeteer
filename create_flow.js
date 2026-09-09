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

    const page = await browser.newPage();
    const matrix = require('./matrix.json');

    await page.goto(
        'https://labs.google/fx/tools/flow/project/5f470746-ea52-4acf-9473-7648b025d4ce',
        { waitUntil: "networkidle2", timeout: 0 }
    );

    console.log("Total prompts:", matrix.shots.length);

    // -------------------------------------------------------
    // SAFE CHUNKED TYPING FOR PROSEMIRROR
    // -------------------------------------------------------
    async function safeType(page, text) {
        const chunks = text.match(/.{1,120}/g) || [text];
        for (const chunk of chunks) {
            await page.keyboard.type(chunk, { delay: 12 });
        }
    }

    // -------------------------------------------------------
    // WAIT FOR FLOW TO ENABLE GENERATION
    // -------------------------------------------------------
    async function waitForGenerateEnabled(page) {
        await page.waitForFunction(() => {
            const btn = document.querySelector('.generate-icon-button');
            if (!btn) return false;

            // Angular removes this class when ready
            return !btn.classList.contains('mat-mdc-button-disabled');
        }, { timeout: 0 });
    }

    // -------------------------------------------------------
    // CLICK THE REAL BUTTON (NOT THE ICON)
    // -------------------------------------------------------
    async function clickGenerate(page) {
        await page.evaluate(() => {
            const btn = document.querySelector('.generate-icon-button');
            if (!btn) return;

            btn.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                composed: true
            }));
        });
    }

    // -------------------------------------------------------
    // CLICK "Add to Prompt"
    // -------------------------------------------------------
    async function clickAddToPrompt(page) {
        const coords = await page.evaluate(() => {
            const btn = [...document.querySelectorAll("button")]
                .find(b => b.innerText.trim().includes("Add to Prompt"));
            if (!btn) return null;
            const r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
        if (coords) await page.mouse.click(coords.x, coords.y);
    }

    // -------------------------------------------------------
    // MAIN LOOP
    // -------------------------------------------------------
    for (let i = 0; i < matrix.shots.length; i++) {

        const promptText = JSON.stringify(matrix.shots[i].in_frame_still_prompt);
        console.log(`\n--- Prompt ${i + 1}/${matrix.shots.length} ---`);

        // Wait for editor
        await page.waitForSelector('.ProseMirror', { visible: true });

        // Focus editor
        await page.click('.ProseMirror');
        await page.evaluate(() => document.querySelector('.ProseMirror')?.focus());

        // Clear existing text
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');

        // Type safely
        await safeType(page, promptText);
        console.log("Typed prompt:", promptText);

        // Add to Prompt (if needed)
        await clickAddToPrompt(page);

        // ⭐ WAIT FOR REAL ENABLE STATE
        await waitForGenerateEnabled(page);

        // ⭐ CLICK REAL BUTTON
        await clickGenerate(page);
        console.log("Generate clicked!");

        // ⭐ FIXED DELAY FOR YOUR PUPPETEER VERSION
        await new Promise(r => setTimeout(r, 6000));
    }

    await browser.close();
})();
