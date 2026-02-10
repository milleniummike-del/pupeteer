const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "C:\Users\Mike\ai", headless: false });
    const videos = require('../videos.js');

    const page = await browser.newPage();
    await page.goto('https://www.meta.ai', {waitUntil: 'load'});
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    for (let i = 0; i < videos.length; i++) {

    await page.waitForSelector('button[data-slot="capability-pill"]');
    
    await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button[data-slot="capability-pill"]')]
          .find(b => (b.textContent || '').toLowerCase().includes('create video'));
        btn?.click();
      });

      const textareaSelector = 'div[data-testid="composer-input"]';
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

        const submit = await page.waitForSelector('button[data-testid="composer-animate-button"]');
        await submit.click();
              
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
})();