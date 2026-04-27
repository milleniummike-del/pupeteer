const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "browser", 
        headless: false,
        targetFilter: target => !!target.url(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })

    let pages = await browser.pages();
        let page;

        if (pages.length === 0) {
            // No tabs at all → create one
            page = await browser.newPage();
        } else {
            // Keep first tab
            page = pages[0];

            // Close all others
            for (let i = 1; i < pages.length; i++) {
                await pages[i].close();
            }
        }
        
    await new Promise(resolve => setTimeout(resolve, 555000));
})();