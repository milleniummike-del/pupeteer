const prompt = ``;
const checkin = false;

const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const path = require('path');
const https = require('https');
const videos = require('./videos.js');
const directory = require('./directory.js');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const TRACKER_FILE = 'prompt_tracker.json';
const DEBUG = false;

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

function downloadVideo(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Download failed: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => reject(err));
        });
    });
}

let destinationDir = directory.getPath();
console.log(destinationDir);

(async () => {
    let browser;

    try {
        browser = await puppeteer.launch({
            userDataDir: "browser1",
            headless: false,
            //defaultViewport: { width: 4000, height: 1080 },
            args: ["--no-sandbox"],
            devtools: DEBUG
        });

        const page = (await browser.pages())[0];
        await page.bringToFront();

        const tracker = loadTracker();

        for (let v = 0; v < 1; v++) {
            const currentPrompt = videos[v];

            if (tracker.find(t => t.prompt === currentPrompt && t.status === 'success')) {
                console.log(`⏭ Skipping: ${currentPrompt}`);
                continue;
            }

            console.log(`\n🎬 Prompt: ${currentPrompt}`);

            await page.goto('https://create.wan.video/');

            /*
          akahhsmsbssnsgv+sheffield@googlemail.com
Passw0rd

samantha.lib.ra.14@googlemail.com
Passw0rd

behejohon264+spivey@gmail.com
Passw0rd

*/

            console.log(`\n🎬 Login`);
            try {

                await page.evaluate(() => {
                    const btn = [...document.querySelectorAll('button, span')]
                        .find(el => el.textContent.trim() === 'Log in');
                    if (btn) btn.click();
                });

                await page.click('button[data-test-id="login-form-button-submit"]');
                // Fill email
                await page.type('input[data-test-id="login-form-box-address"]', 'akahhsmsbssnsgv+sheffield@googlemail.com');

                // Fill password
                await page.type('input[data-test-id="login-form-box-password"]', 'Passw0rd');


                // Wait for login button to enable
                await page.waitForFunction(() => {
                    const btn = document.querySelector('button[data-test-id="login-form-button-submit"]');
                    return btn && !btn.disabled;
                });

                // Click login
                await page.click('button[data-test-id="login-form-button-submit"]');

            }
            catch (e) {
                console.log(e);
            }

            if (checkin){
            console.log(`\n🎬 Check in to get credit`);
            try {
                
                await page.waitForSelector('div[class^="CheckInBtnContent"]', { visible: true });
                await page.click('div[class^="CheckInBtnContent"]');
            }
            catch (e) {
                console.log(e);
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }

            console.log(`\n🎬 Upload image`);

            try {

                await page.waitForSelector('.CoverTitle-sc-71sks-4.fMVStG', { visible: true });
                await page.click('.CoverTitle-sc-71sks-4.fMVStG');

                // Wait for Upload from device to appear
                await page.waitForFunction(() => {
                    return [...document.querySelectorAll('span, div')]
                        .some(el => el.textContent.trim() === 'Upload from device');
                });

                // Click Upload from device
                await page.evaluate(() => {
                    const el = [...document.querySelectorAll('span, div')]
                        .find(el => el.textContent.trim() === 'Upload from device');
                    if (el) el.click();
                });

                const fileInput = await page.waitForSelector('input[type="file"]');
                await fileInput.uploadFile('inputimages/test.jpeg');

                // Focus the Slate editor
                await page.waitForSelector('div[role="textbox"][data-slate-editor="true"]', { visible: true });
                await page.click('div[role="textbox"][data-slate-editor="true"]');

                // Type the prompt
                await page.keyboard.type(prompt);

            }
            catch (e) {
                console.log(e);
            }

            console.log(`\n🎬 Submitted prompt`);

            saveTracker(tracker);

            await new Promise(resolve => setTimeout(resolve, 555000));
        }

    } catch (err) {
        console.error('🔥 Fatal Error:', err);
    } finally {
        if (browser) await browser.close();
    }
})();