const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const inputPath = "X:/inputmixed/The Share Price_split_pieces_25_parts/";
puppeteer.use(StealthPlugin());

async function downloadViaPuppeteer(page, url, filepath) {
    const response = await page.goto(url, { timeout: 0 });
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
        protocolTimeout: 300000,
        userDataDir: "browser",
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const matrix = require(inputPath+"manifest.json");
    const page = await browser.newPage();

    await page.goto('https://www.gentube.app/genmovie', {
        waitUntil: "networkidle2",
        timeout: 0
    });

    const inputDir = path.join("",inputPath);
    let length = matrix.pieces.length;
    if (length>25) length=25;
    for (let v = 0; v < length; v++) {

        const filePath = path.join(inputDir, matrix.pieces[v].imageFileName);
        const currentPrompt = `${JSON.stringify(matrix.pieces[v].prompt)}`;
        console.log(currentPrompt);

        // ---------------------------------------------------------
        // WAIT FOR FILE INPUT
        // ---------------------------------------------------------
        await page.waitForFunction(() => {
            return document.querySelector('input[type="file"]');
        });

        const fileInput = await page.$('input[type="file"]');
        await fileInput.uploadFile(filePath);

        console.log("Uploaded:", filePath);

        // ---------------------------------------------------------
        // WAIT FOR CONFIGURE BUTTONS
        // ---------------------------------------------------------
        await page.waitForFunction(() => {
            return [...document.querySelectorAll('button')]
                .filter(el => el.textContent.trim() === 'Configure').length > 0;
        });

        const frameLabel = `Frame ${v + 1} ·`;

        await page.waitForFunction((label) => {
            return [...document.querySelectorAll('span')]
                .some(el => el.textContent.trim().startsWith(label));
        }, {}, frameLabel);

        await page.evaluate((label) => {
            const span = [...document.querySelectorAll('span')]
                .find(el => el.textContent.trim().startsWith(label));
            if (!span) return;

            const card = span.closest('.relative.w-44');
            if (!card) return;

            const btn = [...card.querySelectorAll('button')]
                .find(b => b.textContent.trim() === 'Configure');
            btn?.click();
        }, frameLabel);

        console.log("Clicked Configure for frame " + (v + 1));

        // ---------------------------------------------------------
        // TYPE INTO CONFIGURE FIELD (FAST REACT-SAFE INJECTION)
        // ---------------------------------------------------------
        await page.waitForSelector('textarea.input-field', { visible: true });

        const textarea = await page.$('textarea.input-field');
        await textarea.click({ clickCount: 3 });

        await page.evaluate((text) => {
            const el = document.querySelector('textarea.input-field');

            const setter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
            ).set;

            setter.call(el, text);

            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, currentPrompt);

        console.log("Injected prompt:", currentPrompt);

        // ---------------------------------------------------------
        // CLICK DONE
        // ---------------------------------------------------------
        await page.waitForFunction(() => {
            return [...document.querySelectorAll('button')]
                .some(el => el.textContent.trim() === 'Done');
        });

        await page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')]
                .find(el => el.textContent.trim() === 'Done');
            btn?.click();
        });

        console.log("Done for frame", v + 1);
    }

})();
