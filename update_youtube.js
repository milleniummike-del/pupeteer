/**
 * YouTube Update Automation (Title & Description)
 * Updates the last 15 uploaded videos using youtube_title1.txt and youtube_description1.txt
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
const fs = require('fs');

const directory = require('./directory.js');

const DEBUG = true;

// ---------------------------------------------------------
// 🧠 CLI ARG PARSER
// ---------------------------------------------------------
function getArg(name, fallback = '') {
    const arg = process.argv.find(a => a.startsWith(`--${name}=`));
    if (!arg) return fallback;
    return arg.split('=').slice(1).join('=');
}

// ---------------------------------------------------------
// 📄 READ TEXT FILE HELPER
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
// INPUTS
// ---------------------------------------------------------

// Final values (Moved into loop for per-video customization)
const FALLBACK_TITLE = readTextFile(path.join(__dirname, 'youtube_title1.txt'), "Default Title");
const FALLBACK_DESC = readTextFile(path.join(__dirname, 'youtube_description1.txt'), "Default Description");

// Other CLI inputs
const CHANNEL = getArg('channel', channel);
const COUNT = parseInt(getArg('count', '15'));

console.log("📺 Channel:", CHANNEL);
console.log("🔢 Count:", COUNT);

// ---------------------------------------------------------

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

        const contentUrl = CHANNEL.replace(/\/$/, '') + '/videos/short';
        console.log(`🌐 Going to content page: ${contentUrl}`);

        await page.goto(contentUrl, {
            waitUntil: "networkidle2",
        });

        console.log("👉 Log in if needed...");

        await page.waitForSelector("ytcp-video-row", {
            timeout: 0,
        });

        console.log("✅ Content list loaded!");

        for (let i = 0; i < COUNT; i++) {
            const n = i + 1;
            console.log(`\n🔄 Updating video ${n}/${COUNT}...`);

            // Read specific files for this video index
            const titleFile = path.join(__dirname, `youtube_title${n}.txt`);
            const descFile = path.join(__dirname, `youtube_description${n}.txt`);
            
            const videoTitle = readTextFile(titleFile, FALLBACK_TITLE);
            const videoDesc = readTextFile(descFile, FALLBACK_DESC);

            // Wait for rows to be present
            await page.waitForSelector("ytcp-video-row");
            const rows = await page.$$("ytcp-video-row");

            if (i >= rows.length) {
                console.warn(`⚠️ Only ${rows.length} videos found. Stopping.`);
                break;
            }

            const row = rows[i];
            
            // Look for the "Details" pencil icon
            let detailsBtn = await row.$("#edit-button");
            
            if (!detailsBtn) {
                console.log("  🖱️ Hovering to reveal edit button...");
                await row.hover();
                await new Promise(r => setTimeout(r, 500));
                detailsBtn = await row.$("#edit-button");
            }

            if (!detailsBtn) {
                console.log("  ⚠️ Edit button not found, trying title link...");
                detailsBtn = await row.$("a#video-title");
            }

            if (!detailsBtn) {
                console.error("  ❌ Could not find a way to edit this video.");
                continue;
            }

            await detailsBtn.click();
            console.log("  📂 Opening details...");

            // Wait for the edit page to load
            await page.waitForSelector("ytcp-video-title #textbox", { timeout: 30000 });

            // --- TITLE ---
            const titleBox = await page.$("ytcp-video-title #textbox");
            await page.evaluate((el, text) => {
                el.textContent = text;
                el.dispatchEvent(new Event("input", { bubbles: true }));
            }, titleBox, videoTitle);
            console.log(`  ✅ Title updated: ${videoTitle.substring(0, 30)}...`);

            // --- DESCRIPTION ---
            const descBox = await page.$("ytcp-video-description #textbox");
            await page.evaluate((el, text) => {
                el.textContent = text;
                el.dispatchEvent(new Event("input", { bubbles: true }));
            }, descBox, videoDesc);
            console.log("  ✅ Description updated.");

            // --- AUDIENCE & NAVIGATION ---
            try {
                console.log("  👶 Checking audience setting...");
                
                // Wait a bit for the audience section to potentially appear
                await new Promise(r => setTimeout(r, 2000));
                
                const notForKidsRadio = await page.evaluateHandle(() => {
                    const findCorrectElement = () => {
                        // 1. Try specific IDs first (ID #off-radio-item is standard for "No")
                        const specificId = document.querySelector('tp-yt-paper-radio-button#off-radio-item, #off-radio-item');
                        if (specificId && specificId.getBoundingClientRect().width > 0) return specificId;

                        // 2. Search all potential elements and filter by text
                        const candidates = Array.from(document.querySelectorAll('tp-yt-paper-radio-button, ytcp-ve, label, span, div.radio-label'));
                        return candidates.find(el => {
                            const txt = (el.innerText || el.textContent || "").toLowerCase();
                            const rect = el.getBoundingClientRect();
                            const isVisible = rect.width > 0 && rect.height > 0;
                            
                            // Must contain "no" or "not" and definitely NOT "yes" (to avoid false positives)
                            const isNoOrNot = txt.includes("not made for kids") || txt.includes("no, it's not made for kids");
                            const isNotYes = !txt.startsWith("yes") && !txt.includes("yes, it's made");

                            return isVisible && isNoOrNot && isNotYes;
                        });
                    };

                    return findCorrectElement();
                });

                const exists = await page.evaluate(el => !!el, notForKidsRadio);
                if (exists) {
                    const isChecked = await page.evaluate(el => {
                        if (el.tagName.toLowerCase() === 'tp-yt-paper-radio-button') {
                            return el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true';
                        }
                        // For ytcp-ve or others, we might need to check parent or aria state
                        return el.getAttribute('aria-checked') === 'true' || el.classList.contains('checked');
                    }, notForKidsRadio);

                    if (!isChecked) {
                        console.log("  🖱️ Clicking 'Not for kids'...");
                        await page.evaluate(el => el.click(), notForKidsRadio);
                        await new Promise(r => setTimeout(r, 1000));
                    } else {
                        console.log("  ℹ️ Already set to 'Not for kids'.");
                    }
                } else {
                    console.log("  ⚠️ Could not find 'Not for kids' setting, may already be set or skipped.");
                }

                // Click "NEXT" until we hit the final screen or find a "Save/Publish" button
                console.log("  ➡️ Navigating through wizard steps...");
                for (let step = 0; step < 5; step++) {
                    const nextBtn = await page.evaluateHandle(() => {
                        const btns = Array.from(document.querySelectorAll('ytcp-button#next-button, ytcp-button[label="Next"], ytcp-button#next-button ytcp-button-shape'));
                        return btns.find(b => {
                            const rect = b.getBoundingClientRect();
                            const style = window.getComputedStyle(b);
                            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
                        });
                    });

                    const exists = await page.evaluate(el => !!el, nextBtn);
                    if (!exists) {
                        console.log("  ℹ️ No more 'Next' buttons found.");
                        break;
                    }

                    let isDisabled = await page.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true', nextBtn);
                    if (isDisabled) {
                        console.log("  ⏳ 'Next' button is disabled, waiting for it to enable...");
                        for (let retry = 0; retry < 5; retry++) {
                            await new Promise(r => setTimeout(r, 2000));
                            isDisabled = await page.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true', nextBtn);
                            if (!isDisabled) break;
                            console.log(`  ⏳ Still disabled (Attempt ${retry + 1}/5)...`);
                        }
                    }

                    if (isDisabled) {
                        console.log("  ⚠️ 'Next' button still disabled after waiting. Breaking loop.");
                        break;
                    }

                    console.log(`  ➡️ Clicking Next (Step ${step + 1})...`);
                    await page.evaluate(el => el.click(), nextBtn);
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (err) {
                console.log("  ℹ : Navigation info:", err.message);
            }

            // --- VISIBILITY ---
            try {
                console.log("  🔒 Checking visibility setting...");
                const privateSelector = 'tp-yt-paper-radio-button[name="PRIVATE"], tp-yt-paper-radio-button[label*="Private"]';
                const privateRadio = await page.evaluateHandle((sel) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        const style = window.getComputedStyle(el);
                        if (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') return el;
                    }
                    // Text search fallback
                    const allRadios = Array.from(document.querySelectorAll('tp-yt-paper-radio-button'));
                    return allRadios.find(r => (r.innerText || r.textContent || "").toUpperCase().includes("PRIVATE"));
                }, privateSelector);

                const exists = await page.evaluate(el => !!el, privateRadio);
                if (exists) {
                    const isChecked = await page.evaluate(el => el.hasAttribute('checked') || el.getAttribute('aria-checked') === 'true', privateRadio);
                    if (!isChecked) {
                        console.log("  🖱️ Clicking 'Private'...");
                        await page.evaluate(el => el.click(), privateRadio);
                        await new Promise(r => setTimeout(r, 1000));
                        console.log("  ✅ Set visibility to Private.");
                    } else {
                        console.log("  ℹ️ Visibility already set to Private.");
                    }
                }
            } catch (err) {
                console.log("  ℹ️ Visibility setting info:", err.message);
            }

            // --- SAVE ---
            console.log("  💾 Finalizing and saving...");
            
            let saveBtnClicked = false;
            for (let attempt = 0; attempt < 10; attempt++) {
                const saveBtn = await page.evaluateHandle(() => {
                    const selectors = [
                        'ytcp-button#save-button',
                        'ytcp-button#publish-button',
                        'ytcp-button#done-button',
                        'ytcp-button#save',
                        'ytcp-button[label="Save"]',
                        'ytcp-button[label="Publish"]',
                        'ytcp-button[label="Done"]',
                        'ytcp-button#save-button ytcp-button-shape',
                        'ytcp-button#publish-button ytcp-button-shape'
                    ];
                    
                    for (const sel of selectors) {
                        const b = document.querySelector(sel);
                        if (b) {
                            const rect = b.getBoundingClientRect();
                            const style = window.getComputedStyle(b);
                            const isVisible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
                            const isEnabled = !b.hasAttribute('disabled') && b.getAttribute('aria-disabled') !== 'true';
                            if (isVisible && isEnabled) return b;
                        }
                    }

                    // Fallback to text matching
                    const allBtns = Array.from(document.querySelectorAll('ytcp-button, tp-yt-paper-button, ytcp-button-shape'));
                    return allBtns.find(b => {
                        const txt = (b.innerText || b.textContent || "").toUpperCase();
                        const rect = b.getBoundingClientRect();
                        const isVisible = rect.width > 0 && rect.height > 0;
                        const isEnabled = !b.hasAttribute('disabled') && b.getAttribute('aria-disabled') !== 'true';
                        return isVisible && isEnabled && (txt.includes('SAVE') || txt.includes('PUBLISH') || txt.includes('DONE'));
                    });
                });

                const exists = await page.evaluate(el => !!el, saveBtn);
                if (exists) {
                    const btnText = await page.evaluate(btn => (btn.innerText || btn.textContent || "Save/Publish").trim(), saveBtn);
                    console.log(`  🖱️ Clicking ${btnText} button...`);
                    await page.evaluate(el => el.click(), saveBtn);
                    saveBtnClicked = true;
                    break;
                }
                
                await new Promise(r => setTimeout(r, 2000));
                if (attempt % 2 === 0) console.log(`  ⏳ Waiting for Save/Publish button (Attempt ${attempt + 1})...`);
            }

            if (saveBtnClicked) {
                console.log("  ✅ Save/Publish clicked successfully.");
                // Wait for the save to complete
                await new Promise(r => setTimeout(r, 5000));
            } else {
                console.error("  ❌ Could not find a clickable Save/Publish/Done button after multiple attempts.");
            }


            // Go back to the list
            console.log("  ⬅️ Returning to list...");
            await page.goto(contentUrl, { waitUntil: "networkidle2" }).catch(e => console.log("  ⚠️ Navigation warning:", e.message));
        }

        console.log("\n🎉 All updates complete!");

    } catch (e) {
        console.error("🔥 Error:", e);
    } finally {
        // Keep browser open for a bit
        console.log("🏁 Script finished. Closing in 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        await browser.close();
    }
})();
