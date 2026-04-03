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
                    .find(b => (b.textContent || '').toLowerCase().includes('create video'));
                btn?.click();
            });

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

            // Wait for animate button
            const animateBtn = 'button[data-testid="composer-animate-button"]';

            await page.waitForSelector(animateBtn, { visible: true });

            await page.waitForFunction(
                sel => {
                    const el = document.querySelector(sel);
                    return el && !el.disabled;
                },
                { timeout: 120000 },
                animateBtn
            );

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
                // Wait for downloads
                await page.waitForSelector('button[aria-label="Download"]', { timeout: 90000 });

                console.log('⏳ Waiting for videos to finish...');
                await new Promise(r => setTimeout(r, 45000));

                // ✅ Reload AND re-init UI (important)
                await page.reload({ waitUntil: 'networkidle2' });

                await page.waitForSelector('button[aria-label="Download"]');

                const elements = await page.$$('button[aria-label="Download"]');
                const toClick = Math.min(elements.length, 4);

                console.log(`⬇ Found ${elements.length}, downloading ${toClick}`);

                for (let i = elements.length - 1; i >= elements.length - toClick; i--) {
                    console.log(`Clicking ${i}`);
                    await elements[i].click();
                    await new Promise(r => setTimeout(r, 2000));
                }

                // Move files
                fs.readdirSync(sourceDir).forEach(file => {
                    if (path.extname(file) === '.mp4') {
                        const oldPath = path.join(sourceDir, file);
                        const newPath = path.join(destinationDir, file);

                        try {
                            fs.copyFileSync(oldPath, newPath);
                            fs.unlinkSync(oldPath);
                            console.log(`📦 Moved ${file}`);
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