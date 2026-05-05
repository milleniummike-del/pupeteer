const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
let symbolsFile = path.join(__dirname, "symbols.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// -----------------------------
// SAVE JSON TO FILE
// -----------------------------
ipcMain.on("save-json", (event, data) => {
  const filePath = path.join(__dirname, "candleData.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
    if (err) console.error("Error writing JSON:", err);
    else console.log("Saved candleData.json");
  });
});

ipcMain.on("save-symbol", (event, symbol) => {
  let list = [];

  try {
    if (fs.existsSync(symbolsFile)) {
      list = JSON.parse(fs.readFileSync(symbolsFile, "utf8"));
    }
  } catch {}

  symbol = symbol.toUpperCase();

  if (!list.includes(symbol)) {
    list.push(symbol);
    fs.writeFileSync(symbolsFile, JSON.stringify(list, null, 2));
  }
});

ipcMain.handle("get-symbols", async () => {
  try {
    if (fs.existsSync(symbolsFile)) {
      return JSON.parse(fs.readFileSync(symbolsFile, "utf8"));
    }
  } catch {}

  return [];
});



