const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "C:\Users\Mike\ai", headless: false });
    const videos = require('./videos.js');
    const page = await browser.newPage();

    await page.goto('https://www.facebook.com/artificialfiretiger');

    const b = await page.waitForSelector('div[aria-label="Photo/video"]');
    await b.click();

    await new Promise(resolve => setTimeout(resolve, 555000));


    //await browser.close();
})();