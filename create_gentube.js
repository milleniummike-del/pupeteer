const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "browser", 
            headless: false,
            //targetFilter: target => !!target.url(),
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        })
    const videos = require('./videos.js');
    const page = await browser.newPage();

    await page.goto('https://www.gentube.app/feed/spotlight?creating=1', {});
    await new Promise(resolve => setTimeout(resolve, 5000));

    for (let i = 0; i < videos.length; i++) {

        const textareaSelector = 'textarea';
        await page.waitForSelector(textareaSelector, { visible: true });
        const contentTextarea = await page.$(textareaSelector);

        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, videos[i]);

        await contentTextarea.focus();

        // press ctrl+v
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyV');
        await page.keyboard.up('Control');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const modelselect = await page.waitForSelector('button[aria-label="Clear"]');
        await modelselect.click();

    }
    const pages = await browser.pages();
    for (const page of pages) {
        await page.close();
    }
    await browser.close();
})();