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

    // -----------------------------
    // ENABLE NETWORK INTERCEPTION
    // -----------------------------
    await page.setRequestInterception(true);

    page.on('request', (req) => {
        req.continue(); // allow all requests
    });

    page.on('response', async (res) => {
        try {
            const url = res.url();

            // Only capture .ogg files
            if (!url.endsWith('.ogg')) return;

            console.log('Detected OGG:', url);

            const buffer = await res.buffer();

            const filename = elementsname[0] + ".ogg";

            const saveDir = destinationDir;
            const filepath = path.join(saveDir, filename);

            fs.mkdirSync(saveDir, { recursive: true });
            fs.writeFileSync(filepath, buffer);

            console.log('Saved:', filepath);
        } catch (err) {
            console.error('Error saving OGG:', err);
        }
    });

    // -----------------------------
    // YOUR ORIGINAL SCRIPT
    // -----------------------------
    const musicprompt = 'Cinematic ambient world music inspired by wildlife at dawn in a vast, untouched rainforest. Gentle layers of atmospheric pads and soft wooden flutes mimic morning mist rising through the trees. Light percussion made from natural textures (wood taps, seed shakers, distant tribal drums) creates an organic heartbeat. Subtle bird calls echo in the distance, blending musically with high, airy synth tones. A warm, earthy bass hums underneath like the slow movement of large animals through foliage. Midway, the track swells with orchestral strings to evoke herds migrating across open plains, then softens into delicate piano notes like sunlight breaking through leaves. Peaceful, immersive, reverent toward nature. Tempo slow to moderate. Emotion: wonder, serenity, quiet majesty.';

    await page.goto('https://sonauto.ai/create', {});
    const textareaSelector = 'textarea';
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

    await page.goto('https://sonauto.ai/create', {});
    await new Promise(resolve => setTimeout(resolve, 15000));
    console.log('waited 15 seconds');

    const elementsname = await page.$$eval('h3[class="text-lg font-medium truncate group-hover:underline"]', elements =>
      elements.map(el => el.textContent.trim())
    );

    console.log(elementsname.length);
    console.log(elementsname[0]);


    const elements = await page.$$('button[aria-label="Play"]');
    console.log(elements.length);

    for (let i = 0; i < 2; i++) {
        console.log("click @" + i);
        await elements[i].click();
    }

})();
