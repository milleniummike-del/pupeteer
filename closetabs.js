const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "browser", headless: false });
    const pages = await browser.pages();
    for (const page of pages) {
        await page.close();
    }
    await browser.close();
    console.log('All tabs closed.');
})();