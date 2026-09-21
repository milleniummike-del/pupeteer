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

    const imagePath = "C:\\Users\\mike\\auto\\inputimages\\1.webp"; // or .webp
    const buffer = fs.readFileSync(imagePath);
    const uint8 = Array.from(buffer);

    // Detect MIME type from extension
    const ext = path.extname(imagePath).toLowerCase();
    let mime = "image/jpeg";
    if (ext === ".webp") mime = "image/webp";
    if (ext === ".jpg") mime = "image/jpeg";
    if (ext === ".jpeg") mime = "image/jpeg";

    await prunaFrame.waitForSelector('#p-video-2-image-file', { timeout: 20000 });

    await prunaFrame.evaluate(async (uint8, mime) => {
        console.log("[IFRAME] Starting upload…");

        const fileInput = document.querySelector('#p-video-2-image-file');
        if (!fileInput) {
            console.log("[IFRAME] File input not found");
            return;
        }

        // Convert Uint8Array → Blob (correct binary)
        const blob = new Blob([new Uint8Array(uint8)], { type: mime });
        const file = new File([blob], "upload" + (mime === "image/webp" ? ".webp" : ".jpeg"), { type: mime });

        const dt = new DataTransfer();
        dt.items.add(file);

        // Assign real FileList
        Object.defineProperty(fileInput, "files", {
            value: dt.files,
            writable: false
        });

        // Trigger React's internal onChange handler
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
            console.log("[IFRAME] React onChange fired");
        } else {
            console.log("[IFRAME] React onChange not found");
        }

        console.log("[IFRAME] Image uploaded successfully");
    }, uint8, mime);

    console.log("Image upload completed");

    // -----------------------------------------------------
    // 2. TYPE PROMPT (inside iframe)
    // -----------------------------------------------------

    await prunaFrame.waitForSelector("textarea", { timeout: 20000 });
    const textarea = await prunaFrame.$("textarea");

    console.log("Textarea found");
    await textarea.click();

    const client = await page.target().createCDPSession();

    // CLEAR FIELD — Ctrl+A
    await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "a",
        windowsVirtualKeyCode: 0x41,
        nativeVirtualKeyCode: 0x41,
        modifiers: 2
    });
    await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "a",
        windowsVirtualKeyCode: 0x41,
        nativeVirtualKeyCode: 0x41,
        modifiers: 2
    });

    // CLEAR FIELD — Backspace
    await client.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Backspace",
        windowsVirtualKeyCode: 0x08,
        nativeVirtualKeyCode: 0x08
    });
    await client.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Backspace",
        windowsVirtualKeyCode: 0x08,
        nativeVirtualKeyCode: 0x08
    });

    console.log("Textarea cleared");

    // TYPE NEW PROMPT
    await client.send("Input.insertText", {
        text: "testing prompt"
    });

    console.log("Typed new prompt");

    await new Promise(r => setTimeout(r, 60000));
}

main();
