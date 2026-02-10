const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "browser", headless: false });
    const videos = require('./videos.js');
    const page = await browser.newPage();

    //await page.goto('https://www.gentube.app/feed/spotlight?creating=1', { });
    await new Promise(resolve => setTimeout(resolve, 555000));
})();