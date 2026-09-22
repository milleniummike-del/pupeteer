const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
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
    const prunaFrame = await iframeElement.contentFrame();

    if (!prunaFrame) {
        console.log("Could not attach to Pruna iframe");
        return;
    }

    console.log("Attached to Pruna iframe");

    // -----------------------------------------------------
    // 1. UPLOAD IMAGE (JPEG or WEBP)
    // -----------------------------------------------------

    const imagePath = "inputimages\\1.webp"; // or .jpeg / .jpg
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBytes = Array.from(imageBuffer);

    const imageExt = path.extname(imagePath).toLowerCase();
    let imageMime = "image/jpeg";
    if (imageExt === ".webp") imageMime = "image/webp";
    if (imageExt === ".jpg") imageMime = "image/jpeg";
    if (imageExt === ".jpeg") imageMime = "image/jpeg";

    await prunaFrame.waitForSelector('#p-video-2-image-file', { timeout: 20000 });

    await prunaFrame.evaluate(async (bytes, mime) => {
        console.log("[IFRAME] Uploading IMAGE…");

        const fileInput = document.querySelector('#p-video-2-image-file');
        if (!fileInput) {
            console.log("[IFRAME] Image input not found");
            return;
        }

        const blob = new Blob([new Uint8Array(bytes)], { type: mime });
        const file = new File([blob], "upload" + (mime === "image/webp" ? ".webp" : ".jpeg"), { type: mime });

        const dt = new DataTransfer();
        dt.items.add(file);

        Object.defineProperty(fileInput, "files", {
            value: dt.files,
            writable: false
        });

        const reactKey = Object.keys(fileInput).find(k => k.startsWith("__reactProps"));
        if (reactKey && fileInput[reactKey].onChange) {
            fileInput[reactKey].onChange({
                target: fileInput,
                currentTarget: fileInput,
                bubbles: true,
                cancelable: true,
                defaultPrevented: false,
                isTrusted: true,
                type: "change"
            });
            console.log("[IFRAME] React IMAGE onChange fired");
        } else {
            console.log("[IFRAME] React IMAGE onChange not found");
        }

        console.log("[IFRAME] IMAGE uploaded");
    }, imageBytes, imageMime);

    console.log("Image upload completed");

    // -----------------------------------------------------
    // 2. UPLOAD AUDIO (WAV or MP3)
    // -----------------------------------------------------

    const audioPath = "inputaudio\\1.wav"; // or .mp3
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBytes = Array.from(audioBuffer);

    const audioExt = path.extname(audioPath).toLowerCase();
    let audioMime = "audio/wav";
    if (audioExt === ".mp3") audioMime = "audio/mpeg";
    if (audioExt === ".wav") audioMime = "audio/wav";

    await prunaFrame.waitForSelector('#p-video-2-audio-file', { timeout: 20000 });

    await prunaFrame.evaluate(async (bytes, mime) => {
        console.log("[IFRAME] Uploading AUDIO…");

        const fileInput = document.querySelector('#p-video-2-audio-file');
        if (!fileInput) {
            console.log("[IFRAME] Audio input not found");
            return;
        }

        const blob = new Blob([new Uint8Array(bytes)], { type: mime });
        const file = new File([blob], "upload" + (mime === "audio/mpeg" ? ".mp3" : ".wav"), { type: mime });

        const dt = new DataTransfer();
        dt.items.add(file);

        Object.defineProperty(fileInput, "files", {
            value: dt.files,
            writable: false
        });

        const reactKey = Object.keys(fileInput).find(k => k.startsWith("__reactProps"));
        if (reactKey && fileInput[reactKey].onChange) {
            fileInput[reactKey].onChange({
                target: fileInput,
                currentTarget: fileInput,
                bubbles: true,
                cancelable: true,
                defaultPrevented: false,
                isTrusted: true,
                type: "change"
            });
            console.log("[IFRAME] React AUDIO onChange fired");
        } else {
            console.log("[IFRAME] React AUDIO onChange not found");
        }

        console.log("[IFRAME] AUDIO uploaded");
    }, audioBytes, audioMime);

    console.log("Audio upload completed");

    // -----------------------------------------------------
    // 3. TYPE PROMPT (inside iframe)
    // -----------------------------------------------------

    // -----------------------------------------------------
// 3. TYPE PROMPT (React-controlled textarea)
// -----------------------------------------------------

await prunaFrame.waitForSelector("textarea", { timeout: 20000 });

await prunaFrame.evaluate(() => {
    const textarea = document.querySelector("textarea");
    if (!textarea) {
        console.log("[IFRAME] Textarea not found");
        return;
    }

    const newPrompt = "the character sings and matches the audio";

    // Set DOM value
    textarea.value = newPrompt;

    // Find React props key
    const reactKey = Object.keys(textarea).find(k => k.startsWith("__reactProps"));
    if (!reactKey) {
        console.log("[IFRAME] React props not found");
        return;
    }

    const props = textarea[reactKey];
    if (!props.onChange) {
        console.log("[IFRAME] React onChange not found");
        return;
    }

    // Fire React onChange so React updates its internal state
    props.onChange({
        target: textarea,
        currentTarget: textarea,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        isTrusted: true,
        type: "change"
    });

    console.log("[IFRAME] Prompt updated via React");
});

console.log("Prompt update completed");

    await new Promise(r => setTimeout(r, 60000));
}

main();
