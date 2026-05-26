/**
 * YouTube Upload Automation (STABLE + VERSION SAFE)
 */

const channels = [
    'https://studio.youtube.com/channel/UCwUI5e_vV229JZZcTLoIdgg',
    'https://studio.youtube.com/channel/UCotGGoP_MQUh6lgB1smxrfw',
    'https://studio.youtube.com/channel/UC5A2FeUQSnut7JqHRNGGmBA'
];

const channel = channels[2];

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

const directory = require('./directory.js');

const DEBUG = true;

// ---------------------------------------------------------
// SAFE SLEEP (replaces waitForTimeout everywhere)
// ---------------------------------------------------------
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------
// CLI PARSER
// ---------------------------------------------------------
function getArg(name, fallback = '') {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    if (!arg) return fallback;
    return arg.split('=').slice(1).join('=');
}

// ---------------------------------------------------------
// FILE READER
// ---------------------------------------------------------
function readTextFile(filePath, fallback = '') {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8').trim();
        }
    } catch (err) {
        console.warn(`⚠️ Failed to read ${filePath}:`, err.message);
    }
    return fallback;
}

// ---------------------------------------------------------

const TITLE_FILE = path.join(__dirname, 'youtube_title.txt');
const DESC_FILE = path.join(__dirname, 'youtube_description.txt');

const TITLE = readTextFile(TITLE_FILE, getArg('title', 'My Automated Upload'));
const DESCRIPTION = readTextFile(DESC_FILE, getArg('description', 'Uploaded with Puppeteer automation'));

const CHANNEL = getArg('channel', channel);
const FILE_NAME = getArg('file', 'upscaled/final_1.mp4');

const FILE_PATH = path.join(directory.getPath(), FILE_NAME);

console.log("📂 File:", FILE_PATH);
console.log("📝 Title:", TITLE);
console.log("📄 Description:", DESCRIPTION);

puppeteer.use(StealthPlugin());

(async () => {

    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        devtools: DEBUG
    });

    // IMPORTANT: page must be OUTSIDE try/catch
    const page = (await browser.pages())[0];
    await page.bringToFront();

    try {

        page.on('dialog', async dialog => {
            console.log("⚠️ Dialog:", dialog.message());
            await dialog.dismiss();
        });

        await page.goto(CHANNEL, { waitUntil: "networkidle2" });

        console.log("👉 Login if needed...");

        await page.waitForSelector("ytcp-icon-button#upload-icon", { timeout: 0 });

        console.log("✅ Upload button found");

        await page.click("ytcp-icon-button#upload-icon");

        const fileInput = await page.waitForSelector("input[type='file']");
        await fileInput.uploadFile(FILE_PATH);

        console.log("📤 Uploading...");

        await page.waitForSelector("ytcp-video-title #textbox", { timeout: 60000 });

        // -------------------------------------------------
        // TITLE (stable input)
        // -------------------------------------------------
        const titleBox = await page.$("ytcp-video-title #textbox");

        await page.evaluate((el, text) => {
            el.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            document.execCommand('insertText', false, text);
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }, titleBox, TITLE);

        // -------------------------------------------------
        // DESCRIPTION
        // -------------------------------------------------
        const descBox = await page.$("ytcp-video-description #textbox");

        await page.evaluate((el, text) => {
            el.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            document.execCommand('insertText', false, text);
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }, descBox, DESCRIPTION);

        console.log("✍️ Title + Description set");

        // -------------------------------------------------
        // NEXT FLOW (safe + non-stuck)
        // -------------------------------------------------
        console.log("➡️ Wizard steps...");

        for (let i = 0; i < 6; i++) {

            const nextBtn = await page.$('ytcp-button#next-button');

            if (!nextBtn) break;

            const disabled = await page.evaluate(btn =>
                btn.hasAttribute('disabled') ||
                btn.getAttribute('aria-disabled') === 'true',
                nextBtn
            );

            if (disabled) {
                console.log("⏳ Waiting for step (likely audience)...");

                await sleep(2000);
                continue;
            }

            await nextBtn.click();
            await sleep(2000);
        }

        // -------------------------------------------------
        // AUDIENCE FIX (CRITICAL)
        // -------------------------------------------------
        console.log("👶 Setting audience...");

        await sleep(2000);

        const notForKids = await page.evaluateHandle(() => {
            const buttons = Array.from(
                document.querySelectorAll('tp-yt-paper-radio-button')
            );

            return buttons.find(btn => {
                const text = (btn.innerText || "").toLowerCase();

                return (
                    text.includes("not made for kids") ||
                    text.includes("no, it's not made for kids")
                );
            });
        });

        const exists = await page.evaluate(el => !!el, notForKids);

        if (exists) {
            const checked = await page.evaluate(el =>
                el.getAttribute("aria-checked") === "true",
                notForKids
            );

            if (!checked) {
                console.log("🖱️ Clicking 'Not made for kids'...");
                await page.evaluate(el => el.click(), notForKids);
                await sleep(1500);
            } else {
                console.log("ℹ️ Already set");
            }
        }

        console.log("➡️ Click next...");


            let nextBtn = await page.$('ytcp-button#next-button');

            await nextBtn.click();

            console.log("➡️ Click next...");


             nextBtn = await page.$('ytcp-button#next-button');

            await nextBtn.click();

            console.log("➡️ Click next...");


             nextBtn = await page.$('ytcp-button#next-button');

            await nextBtn.click();

        // -------------------------------------------------
        // SAVE (safe selector)
        // -------------------------------------------------
        console.log("💾 Saving...");

        let saved = false;

        for (let i = 0; i < 10; i++) {

            const saveBtn = await page.$('button[aria-label="Save"]');

            if (saveBtn) {
                const disabled = await page.evaluate(btn =>
                    btn.getAttribute("aria-disabled") === "true",
                    saveBtn
                );

                if (!disabled) {
                    await saveBtn.click();
                    saved = true;
                    break;
                }
            }

            await sleep(1500);
        }

        if (saved) {
            console.log("✅ Upload complete!");
            await sleep(5000);
        } else {
            console.log("❌ Save failed");
        }

    } catch (e) {
        console.error("🔥 Error:", e);
    } finally {
        if (browser) await browser.close();
    }
})();