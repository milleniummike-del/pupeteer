const fs = require('fs');
const path = require('path');

function getTodayDateFormatted() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

const environment=2;

if(environment==1) {
destinationDir = `C:\\Users\\Mike_\\pupeteer\\videos\\${getTodayDateFormatted()}`;
} else {
destinationDir = `F:\\AI\\Videos\\${getTodayDateFormatted()}`;
}

const shuffleFiles = (directoryPath) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach(file => {
      const oldPath = path.join(directoryPath, file);
      const randomNumber = Math.floor(Math.random() * 1000000); // Generate a random number
      const newFileName = `${randomNumber}-${file}`;
      const newPath = path.join(directoryPath, newFileName);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming file ${file}: ${err}`);
        } else {
          console.log(`Renamed ${file} to ${newFileName}`);
        }
      });
    });
  });
};

shuffleFiles(destinationDir);
