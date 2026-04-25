const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const DEBUG = true;

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        targetFilter: target => !!target.url(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        devtools: DEBUG
    })
    const page = (await browser.pages())[0];
    await page.bringToFront();
    await page.goto('https://studio.youtube.com/channel/UCwUI5e_vV229JZZcTLoIdgg', {
        waitUntil: "networkidle2",
    });

    console.log("👉 Please log in manually if not already logged in...");

    // Wait for user to be logged in (checks for Create button)
    await page.waitForSelector("ytcp-icon-button#upload-icon", {
        timeout: 0,
    });

    console.log("✅ Logged in!");

    // Step 2: Click "Create" button
    await page.click("ytcp-icon-button#upload-icon");

    // Step 3: Click "Upload videos"

    await page.click("ytcp-button#select-files-button");

    // Wait for the hidden file input
    const fileInput = await page.waitForSelector("input[type='file']", { visible: false });

    // Upload file directly
    await fileInput.uploadFile("F:\\AI\\Videos\\20260425\\cute\\upscaled\\final_1.mp4");

    console.log("📤 Uploading video...");

    // Step 5: Wait for upload input field (title)
    await page.waitForSelector("#textbox", { timeout: 60000 });

   // --- SET TITLE ---
await page.waitForSelector("ytcp-video-title #textbox");

const titleBox = await page.$("ytcp-video-title #textbox");

await page.evaluate((el, text) => {
    el.textContent = text;
    el.dispatchEvent(new Event("input", { bubbles: true }));
}, titleBox, "My Automated Upload");


// --- SET DESCRIPTION ---
await page.waitForSelector("ytcp-video-description #textbox");

const descBox = await page.$("ytcp-video-description #textbox");

await page.evaluate((el, text) => {
    el.textContent = text;
    el.dispatchEvent(new Event("input", { bubbles: true }));
}, descBox, "This is my automated description added by Puppeteer.");


    // Step 6: Click "Next" through steps
    const nextBtnSelector = "ytcp-button#next-button";

    for (let i = 0; i < 3; i++) {
        await page.waitForSelector(nextBtnSelector);
        await page.click(nextBtnSelector);
    }

    // Step 7: Set visibility to Public (optional)
    const publicRadio = await page.$("tp-yt-paper-radio-button[name='PUBLIC']");
    if (publicRadio) {
        await publicRadio.click();
    }

    // Step 8: Publish
    const doneBtn = await page.$("ytcp-button#done-button");
    if (doneBtn) {
        await doneBtn.click();
    }

    console.log("🎉 Upload complete!");

    await new Promise(resolve => setTimeout(resolve, 555000));
})();