// puppeteer-generatedvideo-downloader.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');
const videos = require('./videos.js');
const style = ``;

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const environment=1;

if(environment==1) {
destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
} else {
destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
}
console.log("📂 Download folder:", destinationDir);

(async () => {
  let browser;

  const downloadDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
  }
  
  async function moveLatestDownloads(destination) {
      const downloadsPath = path.join(os.homedir(), 'Downloads');
      try {
          if (!fs.existsSync(destination)) {
              fs.mkdirSync(destination, { recursive: true });
          }
  
          const files = fs.readdirSync(downloadsPath);
          if (files.length === 0) {
              console.log('No files found in downloads directory');
              return;
          }
  
          const latestFiles = files.map(file => ({
              file,
              mtime: fs.statSync(path.join(downloadsPath, file)).mtime
          })).sort((a, b) => b.mtime - a.mtime).slice(0, 4);
  
          for (const latestFile of latestFiles) {
              if (latestFile) {
                  const oldPath = path.join(downloadsPath, latestFile.file);
                  let fileName = latestFile.file;
                  let newPath = path.join(destination, fileName);

                  let counter = 1;
                  const ext = path.extname(fileName);
                  const base = path.basename(fileName, ext);

                  while (fs.existsSync(newPath)) {
                      newPath = path.join(destination, `${base}_${counter}${ext}`);
                      counter++;
                  }

                  fs.copyFileSync(oldPath, newPath);
                  fs.unlinkSync(oldPath);
                  console.log(`Moved ${latestFile.file} to ${newPath}`);
              }
          }
      } catch (error) {
          console.error('Error moving file:', error);
      }
  }

  try {
    browser = await puppeteer.launch({
      userDataDir: "browser",
      headless: false
    });

    const page = await browser.newPage();
    
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
      }, videos[v]+" "+style, v);

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
      await new Promise(resolve => setTimeout(resolve, 20000));
      console.log('waited 20 seconds');
      await moveLatestDownloads(destinationDir);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
