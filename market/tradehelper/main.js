const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");

const symbolsFile = path.join(__dirname, "symbols.json");
const tradesFile = path.join(__dirname, "trades.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1000,
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

/* -------------------------------------------------
   SAVE JSON (candle data)
------------------------------------------------- */
ipcMain.on("save-json", (event, data) => {
  const filePath = path.join(__dirname, "candleData.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

/* -------------------------------------------------
   COPY TO CLIPBOARD
------------------------------------------------- */
ipcMain.on("copy-to-clipboard", (event, text) => {
  clipboard.writeText(text);
});

/* -------------------------------------------------
   SAVE SYMBOL HISTORY
------------------------------------------------- */
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

/* -------------------------------------------------
   GET SYMBOL HISTORY
------------------------------------------------- */
ipcMain.handle("get-symbols", async () => {
  try {
    if (fs.existsSync(symbolsFile)) {
      return JSON.parse(fs.readFileSync(symbolsFile, "utf8"));
    }
  } catch {}

  return [];
});

/* -------------------------------------------------
   SAVE TRADE (per symbol)
------------------------------------------------- */
ipcMain.on("save-trade", (event, { symbol, trade }) => {
  let db = {};

  try {
    if (fs.existsSync(tradesFile)) {
      db = JSON.parse(fs.readFileSync(tradesFile, "utf8"));
    }
  } catch {}

  symbol = symbol.toUpperCase();

  if (!db[symbol]) db[symbol] = [];
  db[symbol].push(trade);

  fs.writeFileSync(tradesFile, JSON.stringify(db, null, 2));
});

/* -------------------------------------------------
   GET TRADES (per symbol)
------------------------------------------------- */
ipcMain.handle("get-trades", async (event, symbol) => {
  try {
    if (fs.existsSync(tradesFile)) {
      const db = JSON.parse(fs.readFileSync(tradesFile, "utf8"));
      return db[symbol.toUpperCase()] || [];
    }
  } catch {}

  return [];
});
