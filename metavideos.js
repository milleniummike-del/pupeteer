// puppeteer-generatedvideo-downloader.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const videos = require('./videos.js');

(async () => {
  let browser;

  const downloadDir = path.join(__dirname, "../Downloads/meta");
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

  function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      }).on("error", (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    });
  }

  async function handleDownload(url) {
    const filename = path.basename(url.split("?")[0]);
    const filepath = path.join(downloadDir, filename);

    if (fs.existsSync(filepath)) return;

    console.log(`⬇ Downloading: ${filename}`);
    try {
      await downloadFile(url, filepath);
      console.log(`✅ Saved: ${filename}`);
    } catch (err) {
      console.log(`❌ Failed to download ${filename}:`, err.message);
    }
  }

  try {
    browser = await puppeteer.launch({
      userDataDir: "browser",
      headless: false
    });

    const page = await browser.newPage();
    
    // ----------------------------------------------------
    // 1. SSE HANDLER (requestfinished)
    // ----------------------------------------------------
    page.on('requestfinishedx', async (request) => {
      try {
        const response = await request.response();
        if (!response) return;

        const headers = response.headers();
        const contentType = headers['content-type'] || '';

        if (!contentType.includes('text/event-stream')) return;

        const buffer = await response.buffer();
        const text = buffer.toString();

        const matches = text.match(/data:\s*(\{[\s\S]*?\})(?=\n|$)/g);
        if (!matches) return;

        for (const match of matches) {
          const jsonStr = match.replace(/^data:\s*/, '');

          try {
            const evt = JSON.parse(jsonStr);
            const stream = evt?.data?.batchedGenerationStatusStream;

            if (
              stream &&
              stream.status === "COMPLETE" &&
              stream.generatedVideo &&
              stream.generatedVideo.url
            ) {
              const url = stream.generatedVideo.url;
              console.log("🎥 SSE Video URL:", url);
              await handleDownload(url);
            }

          } catch (err) { }
        }

      } catch (err) {
        console.log("SSE error:", err.message);
      }
    });

    // ----------------------------------------------------
    // 2. NORMAL JSON RESPONSES
    // ----------------------------------------------------
    page.on('responsex', async (response) => {
      try {
        const headers = response.headers();
        const contentType = headers['content-type'] || '';

        if (!contentType.includes('application/json')) return;

        const jsonData = await response.json();

        function findGeneratedVideos(obj, results = []) {
          if (obj && typeof obj === 'object') {
            if (
              obj.__isGeneratedMediaInterface === "GeneratedVideo" &&
              obj.url
            ) {
              results.push(obj.url);
            }
            for (const key in obj) {
              findGeneratedVideos(obj[key], results);
            }
          }
          return results;
        }

        function findMetaAIGeneratedVideos(obj, results = []) {
          if (obj && typeof obj === 'object') {
            if (
              obj.status === "COMPLETE" &&
              obj.generatedVideo &&
              obj.generatedVideo.url
            ) {
              results.push(obj.generatedVideo.url);
            }
            for (const key in obj) {
              findMetaAIGeneratedVideos(obj[key], results);
            }
          }
          return results;
        }

        const urls = [
          ...findGeneratedVideos(jsonData),
          ...findMetaAIGeneratedVideos(jsonData)
        ];

        for (const url of urls) {
          await handleDownload(url);
        }

      } catch (err) { }
    });

    // ----------------------------------------------------
    // MAIN AUTOMATION LOOP
    // ----------------------------------------------------
    await page.goto('https://www.meta.ai/', { waitUntil: 'networkidle2' });

    await page.waitForSelector('button[data-slot="capability-pill"]');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button[data-slot="capability-pill"]')]
        .find(b => (b.textContent || '').toLowerCase().includes('create video'));
      btn?.click();
    });


    for (let v = 0; v < videos.length; v++) {

      console.log(v + ":" + videos[v]);
      const textareaSelector = 'div[data-testid="composer-input"]';
      await page.waitForSelector(textareaSelector, { visible: true });
      const contentTextarea = await page.$(textareaSelector);

      await page.evaluate((text, v) => {

        navigator.clipboard.writeText(text);
      }, videos[v], v);

      await contentTextarea.focus();

      await page.keyboard.down('Control');
      await page.keyboard.press('KeyV');
      await page.keyboard.up('Control');

      const submit = await page.waitForSelector('button[data-testid="composer-animate-button"]');
      await submit.click();
      console.log('submitted prompt');
      const media = await page.waitForSelector('button[aria-label="Download"]', { timeout: 120000 });
      console.log('waited for Download media');
      await new Promise(resolve => setTimeout(resolve, 50000));
      console.log('waited 50 seconds');

      const elements = await page.$$('button[aria-label="Download"]');
      console.log(elements.length);

      for (i = elements.length - 1; i > elements.length - 5; i--) {
        console.log("click @" + i);
        await elements[i].click();
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('waited 2 seconds');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
