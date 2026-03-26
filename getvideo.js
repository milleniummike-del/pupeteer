const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Utility function to wait for a key press in the terminal
function waitForKeyPress(promptText = 'Press ENTER to continue...') {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(promptText, () => {
            rl.close();
            resolve();
        });
    });
}

puppeteer.use(StealthPlugin());

const TV_SHOWS_DIR = 'C:\\Users\\mike_\\Downloads\\media';

function getNextEpisode(showPath) {
    const files = fs.readdirSync(showPath);
    let maxS = 1;
    let maxE = 0;

    const pattern = /S(\d+)E(\d+)/i;
    files.forEach(file => {
        const match = file.match(pattern);
        if (match) {
            const s = parseInt(match[1]);
            const e = parseInt(match[2]);
            if (s > maxS) {
                maxS = s;
                maxE = e;
            } else if (s === maxS) {
                if (e > maxE) {
                    maxE = e;
                }
            }
        }
    });

    // Default to S01E01 if no files found
    if (maxE === 0 && maxS === 1 && files.length === 0) {
        return { season: 1, episode: 1 };
    }

    return { season: maxS, episode: maxE + 1 };
}

(async () => {
    let browser;
    try {
        const shows = fs.readdirSync(TV_SHOWS_DIR).filter(f => fs.statSync(path.join(TV_SHOWS_DIR, f)).isDirectory());
        console.log(`📂 Found ${shows.length} shows in ${TV_SHOWS_DIR}`);

        browser = await puppeteer.launch({ userDataDir: "browser", headless: false });
        const page = await browser.newPage();

        for (const show of shows) {
            const showPath = path.join(TV_SHOWS_DIR, show);
            const { season, episode } = getNextEpisode(showPath);
            
            const seasonPadded = season.toString().padStart(2, '0');
            const episodePadded = episode.toString().padStart(2, '0');
            const targetStr = `S${seasonPadded}E${episodePadded}`;
            const query = show.replace(/\./g, ' ');

            console.log(`\n🔍 Searching for: "${query}" ${targetStr}`);

            await page.goto('https://thepiratebay.org/index.html', { waitUntil: 'networkidle2' });
            
            const textareaSelector = 'input[name="q"]';
            await page.waitForSelector(textareaSelector, { visible: true });
            const contentTextarea = await page.$(textareaSelector);
            
            // Clear and type
            await contentTextarea.click({ clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.keyboard.type(`${query} ${targetStr}`);
            
            const submitBtn = await page.waitForSelector('input[name="search"]');
            await submitBtn.click();
            await new Promise(resolve => setTimeout(resolve, 10000));
            console.log('waited 10 seconds')
        }

        console.log('\n🏁 Finished processing all shows.');
        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
