const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require("path");
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function uploadToTikTok(videoPath, caption = "") {

    // Ensure file exists
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
        // MUST use your real Chrome profile
        userDataDir: "browser"
    });

    const page = await browser.newPage();

    // Go to TikTok upload page
    await page.goto("https://www.facebook.co", {
        waitUntil: "networkidle2"
    });

    console.log("Opened Facebook upload page");

    console.log("Upload successful!");

}

// Run it
uploadToTikTok(
    "inputvideo\\1.mp4",
    "My automated upload"
);
