const fs = require('fs');
const path = require('path');
const os = require('os');
const hostname = os.hostname();
const directory = require('./directory.js');

let destinationDir = directory.getPath();
console.log(destinationDir);

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
