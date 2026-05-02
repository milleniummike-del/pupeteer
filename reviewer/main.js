const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const directory = require('../directory.js');

let destinationDir = directory.getPath() + '\\upscaled';
destinationDir = directory.getPath();
console.log("📂 Download folder:", destinationDir);


const VIDEO_FOLDER = path.join(destinationDir);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}

ipcMain.handle("getVideos", () => {
  return fs.readdirSync(VIDEO_FOLDER)
    .filter(f => f.match(/\.(mp4|mov|avi|mkv)$/i))
    .map(f => path.join(VIDEO_FOLDER, f));
});

ipcMain.handle("deleteVideo", (event, filePath) => {
  fs.unlinkSync(filePath);
  return true;
});

app.whenReady().then(createWindow);
