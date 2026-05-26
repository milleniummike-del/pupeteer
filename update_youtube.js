/**
 * YouTube Update Automation (Title & Description)
 * Stable version - prevents "Leave site?" popup
 */

const channels = [
    'https://studio.youtube.com/channel/UCwUI5e_vV229JZZcTLoIdgg', // drone
    'https://studio.youtube.com/channel/UCotGGoP_MQUh6lgB1smxrfw', // creation
    'https://studio.youtube.com/channel/UC5A2FeUQSnut7JqHRNGGmBA'  // animals
];

const channel = channels[2];

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');

const meta = require('./videos_meta.js');

// meta[0] = titles
// meta[1] = descriptions
const video_title = meta[0];
const video_description = meta[1];

const DEBUG = true;

// ---------------------------------------------------------
// CLI
// ---------------------------------------------------------
function getArg(name, fallback = '') {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    if (!arg) return fallback;
    return arg.split('=').slice(1).join('=');
}

const CHANNEL = getArg('channel', channel);
const COUNT = parseInt(getArg('count', '15'));

console.log("📺 Channel:", CHANNEL);
console.log("🔢 Count:", COUNT);

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        devtools: DEBUG
    });

    try {
        const page = (await browser.pages())[0];
        await page.bringToFront();

        // ✅ BLOCK "Leave site?" dialogs
        page.on('dialog', async dialog => {
            console.log("⚠️ Dialog blocked:", dialog.message());
            await dialog.dismiss();
        });

        const contentUrl = CHANNEL.replace(/\/$/, '') + '/videos/short';

        console.log(`🌐 Opening: ${contentUrl}`);

        await page.goto(contentUrl, { waitUntil: "networkidle2" });

        console.log("👉 Login if required...");

        await page.waitForSelector("ytcp-video-row", { timeout: 0 });

        console.log("✅ Videos loaded");

        for (let i = 0; i < COUNT; i++) {

            const n = i + 1;

            const title = video_title[i] || `Animal Chill Video ${n}`;
            const desc = video_description[i] || `Relaxing animal visuals with chilled music.`;

            console.log(`\n🔄 Video ${n}/${COUNT}`);

            const rows = await page.$$("ytcp-video-row");

            if (i >= rows.length) {
                console.warn(`⚠️ Only ${rows.length} videos found`);
                break;
            }

            const row = rows[i];

            let editBtn = await row.$("#edit-button");

            if (!editBtn) {
                await row.hover();
                await new Promise(r => setTimeout(r, 500));
                editBtn = await row.$("#edit-button");
            }

            if (!editBtn) {
                editBtn = await row.$("a#video-title");
            }

            if (!editBtn) {
                console.log("❌ No edit button found");
                continue;
            }

            await editBtn.click();

            await page.waitForSelector("ytcp-video-title #textbox", { timeout: 30000 });

            // -------------------------------------------------
            // TITLE (real typing simulation)
            // -------------------------------------------------
            const titleBox = await page.$("ytcp-video-title #textbox");

            await page.evaluate((el, text) => {
                el.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('delete', false, null);
                document.execCommand('insertText', false, text);

                el.dispatchEvent(new Event("input", { bubbles: true }));
                el.dispatchEvent(new Event("change", { bubbles: true }));
            }, titleBox, title);

            console.log("  ✅ Title set");

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
                el.dispatchEvent(new Event("change", { bubbles: true }));
            }, descBox, desc);

            console.log("  ✅ Description set");

            // -------------------------------------------------
            // NEXT / SAVE FLOW
            // -------------------------------------------------
            try {
                console.log("  ➡️ Navigating wizard...");

                for (let step = 0; step < 5; step++) {
                    const nextBtn = await page.$('ytcp-button#next-button');

                    if (!nextBtn) break;

                    const disabled = await page.evaluate(btn =>
                        btn.hasAttribute('disabled') ||
                        btn.getAttribute('aria-disabled') === 'true',
                        nextBtn
                    );

                    if (disabled) {
                        await new Promise(r => setTimeout(r, 2000));
                        continue;
                    }

                    await nextBtn.click();
                    await new Promise(r => setTimeout(r, 2000));
                }

            } catch (e) {
                console.log("Wizard skip:", e.message);
            }

            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------
            console.log("  💾 Saving...");

let saved = false;

for (let attempt = 0; attempt < 10; attempt++) {

    const saveBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(
            document.querySelectorAll('button.ytcpButtonShapeImplHost')
        );

        return buttons.find(btn => {
            const text = (btn.innerText || "").trim().toLowerCase();
            const aria = (btn.getAttribute("aria-label") || "").toLowerCase();

            const visible = btn.offsetParent !== null;
            const enabled = btn.getAttribute("aria-disabled") !== "true";

            return visible && enabled && (
                text === "save" ||
                aria === "save"
            );
        });
    });

    const exists = await page.evaluate(el => !!el, saveBtn);

    if (exists) {
        const disabled = await page.evaluate(el =>
            el.getAttribute("aria-disabled") === "true",
            saveBtn
        );

        if (!disabled) {
            console.log("  🖱️ Clicking Save...");
            await page.evaluate(el => el.click(), saveBtn);

            saved = true;
            break;
        }
    }

    await new Promise(r => setTimeout(r, 1500));
}

if (saved) {
    console.log("  ✅ Save successful");
    await new Promise(r => setTimeout(r, 5000));
} else {
    console.log("  ❌ Save button not found or not clickable");
}

            await page.goto(contentUrl, { waitUntil: "networkidle2" });

        }

        console.log("\n🎉 DONE");

    } catch (e) {
        console.error("🔥 Error:", e);
    } finally {
        console.log("🏁 Closing in 10 seconds...");
        await new Promise(r => setTimeout(r, 10000));
        await browser.close();
    }
})();