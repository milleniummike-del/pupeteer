const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ userDataDir: "browser", 
        headless: false,
        targetFilter: target => !!target.url(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    await new Promise(resolve => setTimeout(resolve, 555000));
})();