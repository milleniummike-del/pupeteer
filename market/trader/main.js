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

/* -------------------------------------------------
   API LOGIC
------------------------------------------------- */
const { headers } = require("./headers.js");
const tradelive = true;

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

ipcMain.handle("get-candles", async (event, symbol, interval = "FifteenMinutes") => {
  const direction = "asc";

  try {
    const searchUrl = `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(i => i.internalSymbolFull === symbol);
    if (!instrument) throw new Error(`Instrument not found: ${symbol}`);

    const instrumentId = instrument.instrumentId;

    const priceUrl = `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;
    const priceRes = await fetch(priceUrl, { method: "GET", headers });
    const priceData = await safeJson(priceRes);

    const price = priceData.rates?.[0]?.bid;
    if (!price) throw new Error("Price not available");

    const candleUrl = `https://public-api.etoro.com/api/v1/market-data/instruments/${instrumentId}/history/candles/${direction}/${interval}/100`;
    const candleRes = await fetch(candleUrl, { method: "GET", headers });
    const candleData = await safeJson(candleRes);

    return { candles: candleData.candles, currentPrice: price };
  } catch (err) {
    console.error("ERROR in get-candles:", err.message);
    throw err;
  }
});

ipcMain.handle("make-trade", async (event, { symbol, amount, rate, profit, stop, leverage, position }) => {
  try {
    const searchUrl = `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(i => i.internalSymbolFull === symbol);
    if (!instrument) throw new Error(`Instrument not found for ${symbol}`);

    const instrumentId = instrument.instrumentId;

    const orderBody = {
      InstrumentId: instrumentId,
      Amount: amount,
      Rate: rate,
      StopLossRate: stop,
      TakeProfitRate: profit,
      Leverage: leverage || 1,
      IsBuy: position === "LONG",
      Position: position || "LONG",
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (tradelive === false) return orderBody;

    const orderUrl = "https://public-api.etoro.com/api/v1/trading/execution/demo/limit-orders";
    const orderRes = await fetch(orderUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(orderBody)
    });

    const result = await safeJson(orderRes);
    console.log("Order Response:", result);
    return orderBody;
  } catch (err) {
    console.error("ERROR in make-trade:", err.message);
    throw err;
  }
});

ipcMain.handle("make-market-trade", async (event, { symbol, amount, leverage, position, margin }) => {
  try {
    const searchUrl = `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(i => i.internalSymbolFull === symbol);
    if (!instrument) throw new Error(`Instrument not found for ${symbol}`);

    const instrumentId = instrument.instrumentId;

    const priceUrl = `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;
    const priceRes = await fetch(priceUrl, { method: "GET", headers });
    const priceData = await safeJson(priceRes);
    const price = priceData.rates?.[0]?.bid;

    let stop = price * (1 - (margin || 0.02) * 0.5);
    let profit = price * (1 + (margin || 0.02));

    if (position !== "LONG") {
      stop = price * (1 + (margin || 0.02) * 0.5);
      profit = price * (1 - (margin || 0.02));
    }

    const orderBody = {
      InstrumentId: instrumentId,
      Amount: amount,
      Rate: price,
      StopLossRate: stop,
      TakeProfitRate: profit,
      Leverage: leverage || 1,
      Position: position || "LONG",
      IsBuy: position === "LONG",
      timestamp: Math.floor(Date.now() / 1000)
    };

    if (tradelive === false) return orderBody;

    const orderUrl = 'https://public-api.etoro.com/api/v1/trading/execution/demo/market-open-orders/by-amount';
    const orderRes = await fetch(orderUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderBody)
    });

    return orderBody;
  } catch (err) {
    console.error("ERROR in make-market-trade:", err.message);
    throw err;
  }
});
