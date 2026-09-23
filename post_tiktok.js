const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require("path");
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function uploadToTikTok(jsonPromptPath, videoPath, caption = "") {

    // ---------------------------------------------
    // READ PROMPT FROM JSON FILE
    // ---------------------------------------------
    if (!fs.existsSync(jsonPromptPath)) {
        throw new Error("JSON prompt file not found: " + jsonPromptPath);
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPromptPath, "utf8"));
    const promptText = jsonData.prompt || "";

    console.log("Loaded prompt:", promptText);

    // Ensure video exists
    if (!fs.existsSync(videoPath)) {
        throw new Error("Video file not found: " + videoPath);
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
        args: [
            "--start-maximized",
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ],
        userDataDir: "browser"
    });

    const page = await browser.newPage();

    // Go to TikTok upload page
    await page.goto("https://www.tiktok.com/upload?lang=en", {
        waitUntil: "networkidle2"
    });

    console.log("Opened TikTok upload page");

    // Wait for hidden file input
    await page.waitForSelector('input[type="file"]', { visible: false });
    const fileInput = await page.$('input[type="file"]');

    // Upload file
    await fileInput.uploadFile(path.resolve(videoPath));

    console.log("File injected… firing React events");

    // Fire React synthetic event
    await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        const evt = new Event('change', { bubbles: true });
        evt.simulated = true;
        input.dispatchEvent(evt);
    });

    // Force React Fiber onChange
    await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        const key = Object.keys(input).find(k => k.startsWith("__reactFiber"));
        if (!key) return;

        let fiber = input[key];
        while (fiber) {
            if (fiber.pendingProps && typeof fiber.pendingProps.onChange === "function") {
                fiber.pendingProps.onChange({
                    target: input,
                    type: "change",
                    bubbles: true,
                    simulated: true
                });
                break;
            }
            fiber = fiber.return;
        }
    });

    console.log("React Fiber upload handler invoked");

    // Wait for TikTok to begin processing
    await page.waitForFunction(() => {
        const el = document.querySelector('[data-e2e="upload-progress"]');
        return el && el.textContent.includes("%");
    }, { timeout: 0 });

    console.log("TikTok started processing…");

    // Wait for Post button to become enabled
    await page.waitForFunction(() => {
        const btn = document.querySelector('[data-e2e="post-button"]');
        return btn && !btn.disabled;
    }, { timeout: 0 });

    console.log("TikTok finished processing");

    // Add caption (simple field)
    if (caption) {
        await page.waitForSelector('[data-e2e="caption-input"]');
        await page.type('[data-e2e="caption-input"]', caption, { delay: 20 });
    }

    // ---------------------------------------------------------
    // WRITE promptText INTO THE DRAFTJS CAPTION EDITOR
    // ---------------------------------------------------------
    await page.waitForSelector('.public-DraftEditor-content[contenteditable="true"]');

    const editor = await page.$('.public-DraftEditor-content[contenteditable="true"]');
    await editor.focus();

    const client = await page.target().createCDPSession();
    await client.send("Input.insertText", { text: "\n" + promptText });

    console.log("DraftJS caption updated with promptText");

    // Click Post
    await page.click('[data-e2e="post-button"]');

    console.log("Post button clicked… waiting for confirmation");

    // Wait for success modal
    await page.waitForFunction(() => {
        const el = document.querySelector('[data-e2e="success-modal"]');
        return !!el;
    }, { timeout: 0 });

    console.log("Upload successful!");
}

// Run it
uploadToTikTok(
    "inputtext\\1.json",
    "inputvideo\\1.mp4",
    "My automated upload"
);
