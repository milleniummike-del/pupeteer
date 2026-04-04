// puppeteer-generatedvideo-downloader.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const videos = require('./videos.js');

const style = ``;
const TRACKER_FILE = 'prompt_tracker.json';

function getTodayDateFormatted() {
    const today = new Date();
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
}

function loadTracker() {
    if (fs.existsSync(TRACKER_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
        } catch {
            return [];
        }
    }
    return [];
}

function saveTracker(tracker) {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(tracker, null, 2));
}

const hostname = os.hostname();
let destinationDir;
let sourceDir;

if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
    sourceDir = `C:\\Users\\mike\\Downloads`;
} else {
    destinationDir = `C:\\Users\\mike_\\puppeteer\\videos\\${getTodayDateFormatted()}`;
    sourceDir = `C:\\Users\\mike_\\Downloads`;
}

console.log("📂 Download folder:", destinationDir);

if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
}

(async () => {
    let browser;
    console.log('get browser');
    try {
        // ✅ FIXED: no shadowing
        browser = await puppeteer.launch({
            userDataDir: "browser",
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        console.log('Opening page');

        const page = (await browser.pages())[0];
        await page.bringToFront();

        const tracker = loadTracker();

        for (let v = 0; v < videos.length; v++) {

            const currentPrompt = videos[v];

            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`⏭ Skipping: ${currentPrompt}`);
                continue;
            }

            console.log(`\n🎬 [${v}] Prompt:`, currentPrompt);

            // Go fresh every time
            await page.goto('https://www.meta.ai/', { waitUntil: 'networkidle2' });

            // Click "Create video"
            console.log("📝 waiting capability");
            await page.waitForSelector('button[data-slot="capability-pill"]');
            await page.evaluate(() => {
                const btn = [...document.querySelectorAll('button[data-slot="capability-pill"]')]
                    .find(b => (b.textContent || '').toLowerCase().includes('create image'));
                btn?.click();
            });

            /*
            <button type="button" role="combobox" aria-controls="radix-_r_1g_" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" class="text-text-primary flex w-full cursor-pointer select-none items-center justify-between gap-1.5 rounded-16 text-subheadline transition-all duration-150 ease-in-out focus-visible:outline -outline-offset-1 enabled:active:scale-98 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-text-secondary h-8 pe-2 bg-transparent enabled:hover:bg-fill-secondary-elevated ps-2.5" data-slot="select-trigger"><svg viewBox="0 0 32 32" fill="none" width="20" height="20"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.6 4.125c1.105 0 1.988 0 2.699.058.72.059 1.342.182 1.914.473a4.877 4.877 0 0 1 2.13 2.131c.292.572.416 1.193.474 1.914.058.711.058 1.594.058 2.7V20.6c0 1.105 0 1.988-.058 2.699-.058.72-.182 1.342-.473 1.914a4.877 4.877 0 0 1-2.131 2.13c-.572.292-1.193.416-1.914.474-.711.058-1.594.058-2.7.058H15.4c-1.105 0-1.988 0-2.699-.058-.72-.058-1.342-.182-1.914-.473a4.877 4.877 0 0 1-2.13-2.131c-.292-.572-.415-1.193-.474-1.914-.058-.711-.058-1.594-.058-2.7V11.4c0-1.105 0-1.988.058-2.699.059-.72.182-1.342.473-1.914a4.877 4.877 0 0 1 2.131-2.13c.572-.292 1.193-.415 1.914-.474.711-.058 1.594-.058 2.7-.058H16.6zm-1.2 1.75c-1.134 0-1.933 0-2.556.052-.613.05-.98.144-1.263.289-.588.3-1.066.777-1.365 1.365-.145.284-.24.65-.29 1.263-.05.623-.051 1.422-.051 2.556v9.2c0 1.134 0 1.933.052 2.556.05.613.144.98.289 1.263.3.588.777 1.066 1.365 1.365.284.145.65.24 1.263.29.623.05 1.422.051 2.556.051h1.2c1.134 0 1.933 0 2.556-.052.613-.05.98-.144 1.263-.289a3.125 3.125 0 0 0 1.365-1.365c.145-.284.24-.65.29-1.263.05-.623.051-1.422.051-2.556v-9.2c0-1.134 0-1.933-.052-2.556-.05-.613-.144-.98-.289-1.263a3.125 3.125 0 0 0-1.365-1.365c-.284-.145-.65-.24-1.263-.29-.623-.05-1.422-.051-2.556-.051h-1.2z" fill="currentColor"></path></svg><span class="truncate hidden md:inline"><span data-slot="select-value" style="pointer-events: none;">9:16</span></span><span class="hidden md:inline"><svg viewBox="0 0 32 32" fill="none" width="20" height="20" class="text-text-tertiary" aria-hidden="true"><path d="M24.62 12.38a.876.876 0 0 1 0 1.24l-8 8a.876.876 0 0 1-1.24 0l-8-8a.876.876 0 0 1 1.24-1.24L16 19.763l7.38-7.381a.876.876 0 0 1 1.24 0z" fill="currentColor"></path></svg></span></button>
*/

            await page.waitForSelector('[data-slot="select-trigger"]');

            const triggers = await page.$$('[data-slot="select-trigger"]');
            if (triggers.length >= 2) {
                await triggers[1].click();
            }

            const options = await page.$$('[role="option"]');
            await options[2].click();

            const textareaSelector = 'div[data-testid="composer-input"]';
            console.log("📝 waiting for composer-input");
            await page.waitForSelector(textareaSelector, { visible: true });

            const input = await page.$(textareaSelector);

            // ✅ Clear existing text
            await input.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');

            // ✅ Type instead of clipboard
            await input.type(currentPrompt + " " + style, { delay: 10 });

            // Debug check
            const typed = await page.evaluate(sel => {
                return document.querySelector(sel)?.innerText;
            }, textareaSelector);

            console.log("📝 Typed:", typed);
            /*
                    <button aria-label="Send" class="enabled:active:scale-98 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-round focus:not-focus-visible:outline-none transition-transform duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 select-none size-8 text-text-on-accent enabled:hover:filter-[brightness(0.95)] enabled:active:filter-[brightness(0.9)] dark:enabled:hover:filter-[brightness(1.025)] dark:enabled:active:filter-[brightness(0.95)] bg-linear-to-r from-gradient-blue-indigo-650-stop1 to-gradient-blue-indigo-650-stop2 outline-offset-2 m-0.5" data-slot="button" data-testid="composer-send-button"><svg viewBox="0 0 32 32" fill="none" width="24" height="24" class="m-0.5"><path d="M16 6.125a.89.89 0 0 0-.265.04l-.014.006a.869.869 0 0 0-.273.15l-.067.06-7.5 7.5a.876.876 0 0 0 1.239 1.238l6.005-6.006V25a.875.875 0 1 0 1.75 0V9.113l6.006 6.006a.876.876 0 0 0 1.239-1.238l-7.5-7.5a.89.89 0 0 0-.414-.232.874.874 0 0 0-.15-.021l-.027-.002L16 6.125z" fill="currentColor"></path></svg></button>
                    */


            await page.evaluate(() => {
                const options = document.querySelectorAll('[role="option"]');
                if (options.length >= 3) {
                    options[2].click();
                }
            });

            //await new Promise(resolve => setTimeout(resolve, 555000));

            const animateBtn = 'button[aria-label="Send"]';

            await page.click(animateBtn);
            console.log('🚀 Submitted');

            let requestEntry = {
                prompt: currentPrompt,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            tracker.push(requestEntry);
            saveTracker(tracker);

            try {

                console.log('⏳ Waiting for images to finish...');
                await new Promise(r => setTimeout(r, 45000));

                /*
                <button class="enabled:active:scale-98 shrink-0 cursor-pointer select-none items-center justify-center gap-0.5 focus:not-focus-visible:outline-none transition-transform duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 rounded-round text-subheadline-medium h-9 px-3.5 shadow-blur-elevation-01 backdrop-blur-elevation-01 enabled:hover:filter-[brightness(0.99)] enabled:active:filter-[brightness(0.975)] dark:enabled:active:filter-[brightness(0.9)] text-text-primary relative enabled:hover:after:absolute enabled:hover:after:inset-0 enabled:hover:after:rounded-round enabled:hover:after:bg-[rgba(255,255,255,0.025)] enabled:hover:after:content-[''] dark:enabled:hover:filter-none bg-fill-primary-elevated hidden md:flex w-full" data-slot="button"><span class="truncate">Animate</span></button>
                */

                await page.evaluate(() => {
                    const buttons = document.querySelectorAll('[data-slot="button"]');
                    const target = Array.from(buttons).find(btn =>
                        btn.textContent.includes('Animate')
                    );
                    target?.click();
                });

                console.log('⏳ Waiting for video to finish...');
                await new Promise(r => setTimeout(r, 45000));

                await page.waitForSelector('button[aria-label="Download"]');

                const elements = await page.$$('button[aria-label="Download"]');
                const toClick = Math.min(elements.length, 4);

                console.log(`⬇ Found ${elements.length}, downloading ${toClick}`);

                let i = 4;
                console.log(`Clicking ${i}`);
                await elements[i].click();
                await new Promise(r => setTimeout(r, 10000));

                // Move files
                fs.readdirSync(sourceDir).forEach(file => {
                    if (path.extname(file) === '.mp4') {
                        const oldPath = path.join(sourceDir, file);

                        // Create timestamp
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

                        // Build new filename
                        const baseName = path.basename(file, '.mp4');
                        const newFileName = `${baseName}_${timestamp}.mp4`;

                        const newPath = path.join(destinationDir, newFileName);

                        try {
                            fs.copyFileSync(oldPath, newPath);
                            fs.unlinkSync(oldPath);
                            console.log(`📦 Moved ${file} → ${newFileName}`);
                        } catch (err) {
                            console.error(`❌ Move error:`, err.message);
                        }
                    }
                });

                requestEntry.status = 'success';

            } catch (err) {
                console.error(`❌ Error on prompt ${v}:`, err.message);
                requestEntry.status = 'error';
                requestEntry.error = err.message;
            }

            saveTracker(tracker);

            await new Promise(r => setTimeout(r, 10000));
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();