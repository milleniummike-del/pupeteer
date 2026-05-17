const { shell, app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");

ipcMain.on("open-external", (event, url) => {
  shell.openExternal(url);
});

const symbolsFile = path.join(__dirname, "symbols.json");
const tradesFile = path.join(__dirname, "trades.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
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
   HELPERS: LOAD & SAVE TRADES
------------------------------------------------- */
function loadTrades(symbol) {
  try {
    if (fs.existsSync(tradesFile)) {
      const db = JSON.parse(fs.readFileSync(tradesFile, "utf8"));
      return db[symbol.toUpperCase()] || [];
    }
  } catch {}

  return [];
}

function saveTrades(symbol, trades) {
  let db = {};

  try {
    if (fs.existsSync(tradesFile)) {
      db = JSON.parse(fs.readFileSync(tradesFile, "utf8"));
    }
  } catch {}

  db[symbol.toUpperCase()] = trades;
  fs.writeFileSync(tradesFile, JSON.stringify(db, null, 2));
}

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
  const trades = loadTrades(symbol);
  trades.push(trade);
  saveTrades(symbol, trades);
});

/* -------------------------------------------------
   GET TRADES (per symbol)
------------------------------------------------- */
ipcMain.handle("get-trades", async (event, symbol) => {
  return loadTrades(symbol);
});

/* -------------------------------------------------
   DELETE TRADE (per symbol)
------------------------------------------------- */
ipcMain.handle("delete-trade", async (event, symbol, index) => {
  const trades = loadTrades(symbol);
  trades.splice(index, 1);
  saveTrades(symbol, trades);
  return true;
});
