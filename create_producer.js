const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const hostname = os.hostname();
let destinationDir;
const videos = require('./videos.js');

if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
} else {
    destinationDir = `C:\\Users\\Mike\\pupeteer\\videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false
    });

    const page = await browser.newPage();
    const musicprompt = videos[0];

    await page.goto('https://producer.ai', {});
    const textareaSelector = 'textarea[aria-label="Chat message"]';
    await page.waitForSelector(textareaSelector, { visible: true });
    const contentTextarea = await page.$(textareaSelector);

    await page.evaluate((text) => {
        navigator.clipboard.writeText(text);
    }, musicprompt);

    await contentTextarea.focus();

    // press ctrl+v
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyV');
    await page.keyboard.up('Control');
    await page.keyboard.press('Enter');

    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log('waited 50 seconds');

})();
