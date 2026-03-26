const fs = require('fs');
const path = require('path');
const os = require('os');
const hostname = os.hostname();
let destinationDir;
let sourceDir;

function getTodayDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


if (hostname === 'DESKTOP-QPNJTTJ') {
    destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
    sourceDir = `??`;
} else {
    destinationDir = `C:\\Users\\mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
    sourceDir = `C:\\Users\\mike_\\Downloads`;
}
console.log("📂 Download folder:", destinationDir);

if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir);
}

fs.readdirSync(sourceDir).forEach(file => {
    if (path.extname(file) === '.mp4') {
        const oldPath = path.join(sourceDir, file);
        const newPath = path.join(destinationDir, file);

        fs.renameSync(oldPath, newPath);

        console.log(`Moved ${file} to ${destinationDir}`);
    }
});

