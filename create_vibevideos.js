const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "browser",
        args: ["--no-sandbox"]
    });

    let pages = await browser.pages();
    let page = pages[0];

    await page.goto(
        'https://vibes.ai/projects/1995c029-9732-4090-8444-c85c17c7d3dc',
        { waitUntil: 'networkidle2' }
    );

    // ---------------------------------------------------------
    // Load images
    // ---------------------------------------------------------
    const inputDir = path.join(__dirname, "inputimages");
    const files = fs.readdirSync(inputDir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    console.log("Images:", files);

    // ---------------------------------------------------------
    // Step 1: Click Start & End Frame
    // ---------------------------------------------------------
    await page.waitForSelector('button[title="Start & End Frame"]', { visible: true });
    await page.click('button[title="Start & End Frame"]');

    // ---------------------------------------------------------
    // Step 2: Click Add start frame
    // ---------------------------------------------------------
    await page.waitForFunction(() => {
        const btns = [...document.querySelectorAll('button.cursor_pointer')];
        return btns.some(b => b.innerText.includes('Add start frame'));
    });

    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button.cursor_pointer')];
        const target = btns.find(b => b.innerText.includes('Add start frame'));
        if (target) target.click();
    });

    // ---------------------------------------------------------
    // Step 3: Click Upload (open dialog ONCE)
    // ---------------------------------------------------------
    await page.waitForFunction(() => {
        const btns = [...document.querySelectorAll('button')];
        return btns.some(b => b.innerText.includes('Upload'));
    });

    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const target = btns.find(b => b.innerText.includes('Upload'));
        if (target) target.click();
    });

    // ---------------------------------------------------------
    // Step 4: LOOP — upload ALL images into SAME dialog
    // ---------------------------------------------------------
    for (const file of files) {

        const filePath = path.join(inputDir, file);
        console.log("Uploading:", file);

        // Wait for hidden input (React re-renders it each upload)
        await page.waitForFunction(() => {
            return document.querySelector('input[type="file"]');
        });

        const fileInput = await page.$('input[type="file"]');
        await fileInput.uploadFile(filePath);

        console.log("✔ Uploaded:", file);

        // React processing delay (safe for all Puppeteer versions)
        await new Promise(r => setTimeout(r, 600));
    }

    // ---------------------------------------------------------
    // Step 5: Click Confirm AFTER all uploads
    // ---------------------------------------------------------
    await page.waitForFunction(() => {
        const btns = [...document.querySelectorAll('button')];
        return btns.some(b => !b.disabled && b.innerText.trim().length > 0);
    });

    await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const enabled = btns.find(b => !b.disabled && b.innerText.trim().length > 0);
        if (enabled) enabled.click();
    });

    console.log("✅ All images uploaded and confirmed");

    // Keep browser open briefly
    await new Promise(r => setTimeout(r, 5000));

})();
