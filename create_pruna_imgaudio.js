const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

let firstime = true;

const inputFolder = `X:\\inputmixed\\test1`;

puppeteer.use(StealthPlugin());

async function waitForKeypress() {
    return new Promise(resolve => {

        const onData = () => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);
            resolve();
        };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onData);

        console.log('Press any key to continue...');
    });
}

async function uploadFileToInput(frame, selector, filePath, mimeType) {

    const buffer = fs.readFileSync(filePath);
    const bytes = Array.from(buffer);

    const fileName = path.basename(filePath);

    await frame.waitForSelector(selector, {
        timeout: 20000
    });

    await frame.evaluate(
        (sel, bytes, mime, fileName) => {

            const fileInput = document.querySelector(sel);

            if (!fileInput) return false;

            const blob = new Blob(
                [new Uint8Array(bytes)],
                { type: mime }
            );

            const file = new File(
                [blob],
                fileName,
                { type: mime }
            );

            const dt = new DataTransfer();
            dt.items.add(file);

            if (fileInput._valueTracker) {
                fileInput._valueTracker.setValue('');
            }

            fileInput.files = dt.files;

            fileInput.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );

            return true;
        },
        selector,
        bytes,
        mimeType,
        fileName
    );
}

async function main() {

    // -----------------------------------------------------
    // LOAD MANIFEST
    // -----------------------------------------------------

    const manifestFile = fs
        .readdirSync(inputFolder)
        .find(f => f.toLowerCase().endsWith('.json'));

    if (!manifestFile) {
        throw new Error(
            `No manifest json found in ${inputFolder}`
        );
    }

    const manifestPath = path.join(
        inputFolder,
        manifestFile
    );

    const manifest = JSON.parse(
        fs.readFileSync(manifestPath, 'utf8')
    );

    console.log(
        `Loaded manifest with ${manifest.totalPieces} piece(s)`
    );

    // -----------------------------------------------------
    // BROWSER
    // -----------------------------------------------------

    const browser = await puppeteer.launch({
        headless: false,
        executablePath:
            'C:/Program Files/Google/Chrome/Application/chrome.exe',
        defaultViewport: null,
        protocolTimeout: 300000,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.pruna.ai/p-video-2',
        {
            waitUntil: 'networkidle2'
        }
    );

    console.log('Opened Pruna');

    // -----------------------------------------------------
    // IFRAME
    // -----------------------------------------------------

    await page.waitForSelector('iframe', {
        timeout: 20000
    });

    const iframeElement = await page.$('iframe');

    const prunaFrame =
        await iframeElement.contentFrame();

    if (!prunaFrame) {
        throw new Error(
            'Could not attach to Pruna iframe'
        );
    }

    console.log('Attached to Pruna iframe');

    // -----------------------------------------------------
    // PROCESS EACH PIECE
    // -----------------------------------------------------

    for (const piece of manifest.pieces) {

        console.log('');
        console.log(
            `========== PIECE ${piece.index}/${manifest.totalPieces} ==========`
        );

        
            console.log(
                `Piece: ${JSON.stringify(piece)}`
            );

        // -----------------------------------------------------
        // IMAGE
        // -----------------------------------------------------

        if (
            piece.hasAttachedImage &&
            piece.imageFileName
        ) {

            const imagePath = path.join(
                inputFolder,
                piece.imageFileName
            );

            if (!fs.existsSync(imagePath)) {
                throw new Error(
                    `Missing image file: ${imagePath}`
                );
            }

            const imageExt = path
                .extname(imagePath)
                .toLowerCase();

            let imageMime = 'image/jpeg';

            switch (imageExt) {
                case '.png':
                    imageMime = 'image/png';
                    break;

                case '.webp':
                    imageMime = 'image/webp';
                    break;

                case '.jpg':
                case '.jpeg':
                    imageMime = 'image/jpeg';
                    break;
            }

            console.log(
                `Uploading image: ${piece.imageFileName}`
            );

            await uploadFileToInput(
                prunaFrame,
                '#p-video-2-image-file',
                imagePath,
                imageMime
            );

            console.log('Image upload completed');
        }

        // -----------------------------------------------------
        // AUDIO
        // -----------------------------------------------------

        const audioPath = path.join(
            inputFolder,
            piece.audioFileName
        );

        if (!fs.existsSync(audioPath)) {
            throw new Error(
                `Missing audio file: ${audioPath}`
            );
        }

        const audioExt = path
            .extname(audioPath)
            .toLowerCase();

        let audioMime = 'audio/wav';

        switch (audioExt) {
            case '.mp3':
                audioMime = 'audio/mpeg';
                break;

            case '.wav':
                audioMime = 'audio/wav';
                break;

            case '.ogg':
                audioMime = 'audio/ogg';
                break;
        }

        console.log(
            `Uploading audio: ${piece.audioFileName}`
        );

        await uploadFileToInput(
            prunaFrame,
            '#p-video-2-audio-file',
            audioPath,
            audioMime
        );

        console.log('Audio upload completed');

        // -----------------------------------------------------
        // PROMPT
        // -----------------------------------------------------

        await prunaFrame.waitForSelector(
            'textarea',
            {
                timeout: 20000
            }
        );

        await prunaFrame.evaluate(prompt => {

            const textarea =
                document.querySelector('textarea');

            if (!textarea) return;

            textarea.focus();

            textarea.value = prompt;

            textarea.dispatchEvent(
                new Event('input', {
                    bubbles: true
                })
            );

            textarea.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );

            const reactKey = Object.keys(textarea)
                .find(key =>
                    key.startsWith('__reactProps')
                );

            if (
                reactKey &&
                textarea[reactKey]?.onChange
            ) {
                textarea[reactKey].onChange({
                    target: textarea,
                    type: 'change'
                });
            }

        }, piece.prompt);

        console.log(
            `Prompt applied: ${piece.prompt}`
        );

        // -----------------------------------------------------
        // ADVANCED FIRST RUN
        // -----------------------------------------------------

        if (firstime) {

            await prunaFrame.waitForFunction(() => {
                return [
                    ...document.querySelectorAll('button')
                ].some(
                    b =>
                        b.textContent.trim() ===
                        'Advanced'
                );
            }, {
                timeout: 20000
            });

            await prunaFrame.evaluate(() => {

                const btn =
                    [...document.querySelectorAll('button')]
                        .find(
                            b =>
                                b.textContent.trim() ===
                                'Advanced'
                        );

                btn?.click();
            });

            console.log(
                'Advanced button clicked'
            );

            firstime = false;
        }

        // -----------------------------------------------------
        // SETTINGS
        // -----------------------------------------------------

        await prunaFrame.evaluate(() => {

            const selects =
                document.querySelectorAll('select');

            if (selects[1]) {

                selects[1].value = '1080p';

                selects[1].dispatchEvent(
                    new Event('change', {
                        bubbles: true
                    })
                );
            }
        });

        await prunaFrame.evaluate(() => {

            const selects =
                document.querySelectorAll('select');

            if (selects[2]) {

                selects[2].value = '48';

                selects[2].dispatchEvent(
                    new Event('change', {
                        bubbles: true
                    })
                );
            }
        });

        console.log(
            'Settings updated'
        );

        // -----------------------------------------------------
        // GENERATE
        // -----------------------------------------------------

        console.log(
            'Clicking generate button'
        );

        await prunaFrame.evaluate(() => {

            document
                .querySelector(
                    'button.pruna-btn-primary'
                )
                ?.click();
        });

        console.log(
            'Waiting for generation to finish...'
        );

        await prunaFrame.waitForFunction(() => {

            const btn =
                document.querySelector(
                    'button.pruna-btn-primary'
                );

            return btn && !btn.disabled;

        }, {
            timeout: 200000
        });

        console.log(
            `Piece ${piece.index} completed`
        );

        // -----------------------------------------------------
        // MANUAL PAUSE
        // -----------------------------------------------------

        await waitForKeypress();
    }

    console.log(
        'All manifest pieces processed.'
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});