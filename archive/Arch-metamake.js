const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "C:\Users\Mike\ai", headless: false });
    const videos = require('../videos.js');

    const page = await browser.newPage();
    await page.goto('https://www.meta.ai/prompt/c6b5ce52-bf4a-4593-9352-fc2108549b49', { waitUntil: 'load' });


    console.log("Start loop");
    for (let i = 0; i < videos.length; i++) {

        const textareaSelector = 'div[role="textbox"]';
        console.log("looking for textbox");
        await page.waitForSelector(textareaSelector,{ visible: true });
        contentTextarea = await page.$(textareaSelector);

        await page.evaluate((text) => {
            navigator.clipboard.writeText(text + " Ensure the video has no visible signs of propellors or drone aircraft.");
        }, videos[i]);

        //await new Promise(resolve => setTimeout(resolve, 2000000));
        await contentTextarea.click();

        // press ctrl+v
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyV');
        await page.keyboard.up('Control');

        const btn = 'div[aria-label="Send"]';
        await page.waitForFunction(
            selector => !document.querySelector(selector)?.hasAttribute('disabled'),
            {},
            btn
            );
        console.log('Button is now enabled!');
        await page.waitForSelector(btn, { visible: true });
        const submitBtn = await page.$(btn);
        try {await submitBtn.click();} catch (e) {
            console.log(e);
        }
        await new Promise(resolve => setTimeout(resolve, 20000));
    }

    //await browser.close();
})();