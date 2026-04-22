const os = require('os');
const path = require('path');
const hostname = os.hostname();
const tag = loadTag();

function getPath() {
    const fs = require('fs');
    let baseDir;

    if (hostname === 'DESKTOP-QPNJTTJ') {
        baseDir = 'F:\\AI\\Videos';
    } else {
        baseDir = 'C:\\Users\\mike_\\pupeteer\\videos';
    }

    // destinationDir now includes tag from tag.txt
    const destinationDir = path.join(baseDir, getTodayDateFormatted());
    const destinationSubDir = path.join(baseDir, getTodayDateFormatted(), tag);
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }


    if (!fs.existsSync(destinationSubDir)) {
    fs.mkdirSync(destinationSubDir, { recursive: true });
    console.log('Created:', destinationSubDir);
} else {
    console.log('Already exists:', destinationSubDir);
}

    return destinationSubDir;
}

function getTodayDateFormatted() {
    const today = new Date();
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
}



function loadTag() {
    const TAG_FILE = path.join(__dirname, 'tag.txt');
    console.log(TAG_FILE);
    const fs = require('fs');
    try {
        if (fs.existsSync(TAG_FILE)) {
            const tag = fs.readFileSync(TAG_FILE, 'utf8').trim();
            return tag || 'default';
        }
    } catch (err) {
        console.log(err);
        console.warn('⚠️ Failed to read tag.txt, using default');
    }
    return 'default';
}

module.exports = {
    getPath
};