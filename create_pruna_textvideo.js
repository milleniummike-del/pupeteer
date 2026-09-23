const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        defaultViewport: null,
        args: [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    const page = await browser.newPage();
    await page.goto("https://www.pruna.ai/p-video-2", { waitUntil: "networkidle2" });

    console.log("Opened Pruna");

    // Wait for iframe
    await page.waitForSelector("iframe", { timeout: 20000 });
    const iframeElement = await page.$("iframe");
    let prunaFrame = await iframeElement.contentFrame();

    if (!prunaFrame) {
        console.log("Could not attach to Pruna iframe");
        return;
    }

    console.log("Attached to Pruna iframe");

    // -----------------------------------------------------
    // 3. TYPE PROMPT
    // -----------------------------------------------------

    await prunaFrame.waitForSelector("textarea", { timeout: 20000 });

    await prunaFrame.evaluate(() => {
        const textarea = document.querySelector("textarea");
        if (!textarea) return;

        textarea.value = "the character sings and matches the audio";

        const reactKey = Object.keys(textarea).find(k => k.startsWith("__reactProps"));
        if (reactKey && textarea[reactKey].onChange) {
            textarea[reactKey].onChange({ target: textarea, type: "change" });
        }
    });

    console.log("Prompt updated");


    // -----------------------------------------------------
    // 4. CLICK ADVANCED
    // -----------------------------------------------------

    await prunaFrame.waitForFunction(() => {
        return [...document.querySelectorAll('button')]
            .some(b => b.textContent.trim() === 'Advanced');
    }, { timeout: 20000 });

    console.log("Advanced button appeared");

    await prunaFrame.evaluate(() => {
        const btn = [...document.querySelectorAll('button')]
            .find(b => b.textContent.trim() === 'Advanced');
        btn?.click();
    });

    console.log("Advanced button clicked");
    await prunaFrame.evaluate(() => {
        const selects = document.querySelectorAll("select");
        const resolutionSelect = selects[1];   // second <select> = Resolution

        resolutionSelect.value = "1080p";
        resolutionSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await prunaFrame.evaluate(() => {
        const selects = document.querySelectorAll("select");
        const resolutionSelect = selects[2];

        resolutionSelect.value = "48";
        resolutionSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

        await prunaFrame.evaluate(() => {
        const selects = document.querySelectorAll("select");
        const resolutionSelect = selects[0];

        resolutionSelect.value = "9:16";
        resolutionSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await prunaFrame.evaluate(() => {
    // Find the label
    const label = [...document.querySelectorAll("label")]
        .find(l => l.textContent.trim() === "Duration (s)");

    if (!label) {
        console.log("Duration label not found");
        return;
    }

    // The input is inside the same parent <div>
    const container = label.parentElement;
    const input = container.querySelector("input[type='number']");

    if (!input) {
        console.log("Duration input not found");
        return;
    }

    // Set value
    input.value = 20;

    // Trigger React onChange if present
    const reactKey = Object.keys(input).find(k => k.startsWith("__reactProps"));
    if (reactKey && input[reactKey].onChange) {
        input[reactKey].onChange({
            target: input,
            currentTarget: input,
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            isTrusted: true,
            type: "change"
        });
    }

    console.log("Duration set to 20");
});

    // -----------------------------------------------------
    // 8. WAIT FOR KEYPRESS
    // -----------------------------------------------------

    await new Promise(resolve => {
        const onData = () => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);
            resolve();
        };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onData);

        console.log("Press any key to continue...");
    });


    console.log("Got here!");
}

main();
