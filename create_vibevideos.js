const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require("path");

puppeteer.use(StealthPlugin());

const userDataDir = process.argv[2] || "browser";   // RESTORED

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
        userDataDir,                                 // RESTORED
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const page = await browser.newPage();
    await page.goto("https://www.pruna.ai/p-video-2", { waitUntil: "networkidle2" });

    console.log("Opened Pruna");

    // Wait for iframe to appear
    await page.waitForSelector("iframe", { timeout: 20000 });

    const iframeElement = await page.$("iframe");
    const prunaFrame = await iframeElement.contentFrame();

    if (!prunaFrame) {
        console.log("Could not attach to Pruna iframe");
        return;
    }

    console.log("Attached to Pruna iframe");

    // -----------------------------
    // 1. UPLOAD IMAGE
    // -----------------------------
    const fileInput = await prunaFrame.waitForSelector('input[type="file"]', { timeout: 20000 });

    if (!fileInput) {
        console.log("File input not found inside iframe");
        return;
    }

    console.log("File input found");

    const imagePath = "C:\\Users\\mike\\auto\\inputimages\\1.jpeg";
    await fileInput.uploadFile(imagePath);

    console.log("Image uploaded:", imagePath);

    // -----------------------------
    // 2. TYPE PROMPT
    // -----------------------------
    await prunaFrame.waitForSelector("textarea", { timeout: 20000 });
    const textarea = await prunaFrame.$("textarea");

    if (!textarea) {
        console.log("Textarea not found inside iframe");
        return;
    }

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
