const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

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

    const matrix = require('./matrix.json');
    const page = await browser.newPage();

    await page.goto('https://www.gentube.app/genmovie', {
        waitUntil: "networkidle2",
        timeout: 0
    });

    const inputDir = path.join(__dirname, "inputimages");
    if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir);

    // ---------------------------------------------------------
    // READ AND SORT FILES FROM inputimages DIRECTORY
    // ---------------------------------------------------------
    let files = fs.readdirSync(inputDir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    files.sort((a, b) => {
        const na = parseInt(a);
        const nb = parseInt(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
    });

    console.log("Files detected:", files);

    await new Promise(r => setTimeout(r, 2000));

    for (let v = 0; v < files.length; v++) {

        const filePath = path.join(inputDir, files[v]);
        const currentPrompt = `${JSON.stringify(matrix.shots[v])}`;
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
