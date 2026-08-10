const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: "browser",
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Create output folder
    const outDir = path.join("", "C:/\Users/\mike/\Downloads");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const seen = new Set();

    // ---------------------------------------------------------
    // Helper: fetch image WITHOUT leaving the page
    // ---------------------------------------------------------
    async function fetchImageInsidePage(url) {
        return await page.evaluate(async (imgUrl) => {
            const res = await fetch(imgUrl);
            const buf = await res.arrayBuffer();
            return Array.from(new Uint8Array(buf));
        }, url);
    }

    // ---------------------------------------------------------
    // Handle URLs
    // ---------------------------------------------------------
    async function handleUrl(rawUrl) {
        let url = rawUrl;

        // unwrap Next.js optimizer
        if (url.includes("_next/image")) {
            try {
                const params = new URL(url).searchParams;
                url = decodeURIComponent(params.get("url"));
            } catch {}
        }


if (
    !(
        url.endsWith(".webp") ||
        url.endsWith(".jpg")  ||
        url.endsWith(".jpeg") ||
        url.endsWith(".png")  ||
        url.endsWith(".mp4")  ||
        url.endsWith(".avi")
    )
) return;


        if (seen.has(url)) return;

        seen.add(url);

        const filename = url.split("/").pop();
        const filepath = path.join(outDir, filename);

        try {
            const bytes = await fetchImageInsidePage(url);
            fs.writeFileSync(filepath, Buffer.from(bytes));
            console.log("Saved:", filepath);
        } catch (err) {
            console.log("Failed:", url);
        }
    }

    // ---------------------------------------------------------
    // Listen for ALL network activity
    // ---------------------------------------------------------
    page.on("request", req => handleUrl(req.url()));
    page.on("response", res => handleUrl(res.url()));

    page.on("frameattached", frame => {
        frame.on("request", req => handleUrl(req.url()));
        frame.on("response", res => handleUrl(res.url()));
    });

    page.on("workercreated", worker => {
        worker.on("request", req => handleUrl(req.url()));
        worker.on("response", res => handleUrl(res.url()));
    });

    // ---------------------------------------------------------
    // Navigate to the page (only once)
    // ---------------------------------------------------------
    const url = "https://www.gentube.app/profile/user_33bUVPqjwCD1K48aZugCRe7aP4M";

    console.log("➡ Navigating...");
    await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 0
    });

})();
