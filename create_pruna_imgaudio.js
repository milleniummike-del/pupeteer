const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const startfile = 6;
const endFile = 7;
let firstime = true;
const inputFolder = "Watched Ibiza Burn - Afro Mix-segments";

puppeteer.use(StealthPlugin());

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
        protocolTimeout: 300000,
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const page = await browser.newPage();
    await page.goto("https://www.pruna.ai/p-video-2", { waitUntil: "networkidle2" });

    console.log("Opened Pruna");

    // Wait for iframe
    await page.waitForSelector("iframe", { timeout: 20000 });
    const iframeElement = await page.$("iframe");
    let prunaFrame = await iframeElement.contentFrame();

    if (!prunaFrame) {
        console.log("Could not attach to Pruna iframe");
        return;
    }

    console.log("Attached to Pruna iframe");

    for (let number = startfile; number <= endFile; number++) {
        // -----------------------------------------------------
        // 1. UPLOAD IMAGE
        // -----------------------------------------------------
        const imagePath = "X:\\inputimages\\" + inputFolder + "\\" + number + ".jpg";
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBytes = Array.from(imageBuffer);

        const imageExt = path.extname(imagePath).toLowerCase();
        let imageMime = imageExt === ".webp" ? "image/webp" : "image/jpeg";

        await prunaFrame.waitForSelector('#p-video-2-image-file', { timeout: 20000 });

        await prunaFrame.evaluate((bytes, mime) => {
            const fileInput = document.querySelector('#p-video-2-image-file');
            if (!fileInput) return;

            const blob = new Blob([new Uint8Array(bytes)], { type: mime });
            const file = new File([blob], "upload.webp", { type: mime });

            const dt = new DataTransfer();
            dt.items.add(file);

            // React-safe way to update file input
            fileInput._valueTracker && fileInput._valueTracker.setValue("");
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        }, imageBytes, imageMime);


        console.log("Image upload completed");

        // -----------------------------------------------------
        // 2. UPLOAD AUDIO
        // -----------------------------------------------------

        const audioPath = "X:\\inputaudio\\" + inputFolder + "\\" + number + ".wav";
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBytes = Array.from(audioBuffer);

        const audioExt = path.extname(audioPath).toLowerCase();
        let audioMime = audioExt === ".mp3" ? "audio/mpeg" : "audio/wav";

        await prunaFrame.waitForSelector('#p-video-2-audio-file', { timeout: 20000 });

        await prunaFrame.evaluate((bytes, mime) => {
            const fileInput = document.querySelector('#p-video-2-audio-file');
            if (!fileInput) return;

            const blob = new Blob([new Uint8Array(bytes)], { type: mime });
            const file = new File([blob], "upload.wav", { type: mime });

            const dt = new DataTransfer();
            dt.items.add(file);

            fileInput._valueTracker && fileInput._valueTracker.setValue("");
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        }, audioBytes, audioMime);


        console.log("Audio upload completed");

        // -----------------------------------------------------
        // 3. TYPE PROMPT
        // -----------------------------------------------------

        await prunaFrame.waitForSelector("textarea", { timeout: 20000 });

        await prunaFrame.evaluate(() => {
            const textarea = document.querySelector("textarea");
            if (!textarea) return;

            textarea.value = "the character sings and matches the audio";

            const reactKey = Object.keys(textarea).find(k => k.startsWith("__reactProps"));
            if (reactKey && textarea[reactKey].onChange) {
                textarea[reactKey].onChange({ target: textarea, type: "change" });
            }
        });

        console.log("Prompt updated");

        if (firstime) {
            // -----------------------------------------------------
            // 4. CLICK ADVANCED
            // -----------------------------------------------------

            await prunaFrame.waitForFunction(() => {
                return [...document.querySelectorAll('button')]
                    .some(b => b.textContent.trim() === 'Advanced');
            }, { timeout: 20000 });

            console.log("Advanced button appeared");

            await prunaFrame.evaluate(() => {
                const btn = [...document.querySelectorAll('button')]
                    .find(b => b.textContent.trim() === 'Advanced');
                btn?.click();
            });

            console.log("Advanced button clicked");
            firstime = false;

        }
        await prunaFrame.evaluate(() => {
            const selects = document.querySelectorAll("select");
            const resolutionSelect = selects[1];   // second <select> = Resolution

            resolutionSelect.value = "1080p";
            resolutionSelect.dispatchEvent(new Event("change", { bubbles: true }));
        });

        await prunaFrame.evaluate(() => {
            const selects = document.querySelectorAll("select");
            const resolutionSelect = selects[2];

            resolutionSelect.value = "48";
            resolutionSelect.dispatchEvent(new Event("change", { bubbles: true }));
        });

        console.log("Click primary button");

await prunaFrame.evaluate(() => {
    document.querySelector('button.pruna-btn-primary')?.click();
});

        console.log("Waiting for primary button");
        await prunaFrame.waitForFunction(() => {
            const btn = document.querySelector('button.pruna-btn-primary');
            return btn && !btn.disabled;
        }, { timeout: 200000 });

        // -----------------------------------------------------
        // 8. WAIT FOR KEYPRESS
        // -----------------------------------------------------

        await new Promise(resolve => {
            const onData = () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', onData);
                resolve();
            };

            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', onData);

            console.log("Press any key to continue...");
        });
    }
}

main();
