/**
 * YouTube Shorts Bulk Title/Description Updater
 * FINAL FIXED VERSION — uses JS click to bypass shadow DOM issues
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const meta = require('./videos_meta.js');
const titles = meta[0];
const descriptions = meta[1];

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "browser",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = (await browser.pages())[0];

    page.on('dialog', async d => { await d.dismiss(); });

    const listUrl = "https://studio.youtube.com/channel/UC5A2FeUQSnut7JqHRNGGmBA/videos/short";
    await page.goto(listUrl, { waitUntil: "networkidle2" });
    await page.waitForSelector("ytcp-video-row");

    for (let i = 0; i <titles.length; i++) {

        console.log(`\n🔄 Editing video ${i + 1}`);

        const rows = await page.$$("ytcp-video-row");
        if (i >= rows.length) break;

        const row = rows[i];

        // Hover row
        await row.hover();
        await delay(300);

        // CLICK DETAILS BUTTON USING JS (bypasses Puppeteer clickability)
        const clicked = await page.evaluate(rowEl => {
            const btn = rowEl.querySelector('#video-details');
            if (!btn) return false;
            btn.click();   // JS click — ALWAYS works
            return true;
        }, row);

        if (!clicked) {
            console.log("❌ Could not click details button");
            continue;
        }

        // Wait for editor
        await page.waitForSelector("ytcp-video-title #textbox", { timeout: 30000 });

        // TITLE
        const titleBox = await page.$("ytcp-video-title #textbox");
        await page.evaluate((el, text) => {
            el.focus();
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, text);
        }, titleBox, titles[i]);

        // DESCRIPTION
        const descBox = await page.$("ytcp-video-description #textbox");
        await page.evaluate((el, text) => {
            el.focus();
            document.execCommand('selectAll');
            document.execCommand('delete');
            document.execCommand('insertText', false, text);
        }, descBox, descriptions[i]);

        console.log("  ✏️ Updated");

        await delay(1500);

        // CLICK X BUTTON USING JS (bypasses Puppeteer clickability)
        const closed = await page.evaluate(() => {
            const btn = document.querySelector('[aria-label="Save and close"]');
            if (!btn) return false;
            btn.click();
            return true;
        });

        if (!closed) {
            console.log("  ⚠️ No close button found, trying back()");
            await page.goBack().catch(() => {});
        } else {
            console.log("  ❌ Closed");
        }

                await delay(300);

        // Wait for list
        await page.waitForSelector("ytcp-video-row");
    }

    console.log("\n🎉 DONE — All videos processed");

})();
