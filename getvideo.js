const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const TV_SHOWS_DIR = 'C:\\Users\\Mike\\Downloads\\TVShows';

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
            
            try {
                await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
            } catch (e) {
                console.log('⚠️ Navigation took too long or failed, continuing...');
            }

            const results = await page.evaluate(() => {
                const data = [];
                const entries = document.querySelectorAll('ol#torrents li.list-entry');
                entries.forEach(entry => {
                    const nameElement = entry.querySelector('span.item-name a');
                    const magnetElement = entry.querySelector('a[href^="magnet:"]');
                    if (nameElement && magnetElement) {
                        data.push({ name: nameElement.innerText.trim(), magnetLink: magnetElement.href });
                    }
                });
                return data;
            });

            const match = results.find(r => r.name.toUpperCase().includes(targetStr.toUpperCase()));

            if (match) {
                console.log(`🎯 Found Match: ${match.name}`);
                
                await page.evaluate((targetName) => {
                    const entries = document.querySelectorAll('ol#torrents li.list-entry');
                    for (const entry of entries) {
                        const name = entry.querySelector('span.item-name a')?.innerText || '';
                        if (name.includes(targetName)) {
                            const magnetBtn = entry.querySelector('a[href^="magnet:"]');
                            if (magnetBtn) {
                                magnetBtn.click();
                                return true;
                            }
                        }
                    }
                    return false;
                }, match.name);
                
                console.log(`✅ Clicked magnet link for ${show} ${targetStr}`);
                // Wait a bit for the magnet protocol to trigger
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.log(`❌ ${targetStr} not found for "${show}"`);
                
                // Optional: If E01 of next season is wanted if current season is finished, 
                // but that requires knowing how many episodes are in a season.
                // For now, just skipping.
            }
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
