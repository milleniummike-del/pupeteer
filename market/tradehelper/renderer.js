import { convertAPIResponseToCandles } from "./marketData.js";
import { headers } from "./headers.js";

// -----------------------------
// GLOBAL STATE
// -----------------------------
let chart = null;
let candleSeries = null;

let clickCount = 0;
let buyPrice = null;
let profitPrice = null;
let stopPrice = null;
let amount = 1000;

// Track ALL price lines for robust clearing
let allLines = [];

// -----------------------------
// INIT CHART
// -----------------------------
function initChart() {
  const container = document.getElementById("chart");

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    layout: { background: { color: "#ffffff" }, textColor: "#000000" },
    timeScale: { borderVisible: true }
  });

  candleSeries = chart.addCandlestickSeries();

  // CLICK HANDLER
  chart.subscribeClick(param => {
    if (!param || !param.point) return;

    const price = candleSeries.coordinateToPrice(param.point.y);
    if (!price) return;
    if (clickCount > 3) return;
    clickCount++;

    // ENTER
    if (clickCount === 1) {
      buyPrice = price;

      const line = candleSeries.createPriceLine({
        price,
        color: "blue",
        lineWidth: 2,
        lineStyle: 2,
        title: "ENTER"
      });

      allLines.push(line);
    }

    // PROFIT
    else if (clickCount === 2) {
      profitPrice = price;

      const line = candleSeries.createPriceLine({
        price,
        color: "green",
        lineWidth: 2,
        lineStyle: 2,
        title: "PROFIT"
      });

      allLines.push(line);
    }

    // STOP
    else if (clickCount === 3) {
      stopPrice = price;

      const line = candleSeries.createPriceLine({
        price,
        color: "red",
        lineWidth: 2,
        lineStyle: 2,
        title: "STOP"
      });

      allLines.push(line);
    }
  });
}

// -----------------------------
// LOAD CHART (BTC default)
// -----------------------------
const loadChart = async () => {
  if (!chart) initChart();

  try {
    const json = await getCandles("BTC");
    const candles = convertAPIResponseToCandles(json);
    candleSeries.setData(candles);
  } catch (err) {
    console.error("Error loading BTC:", err);
  }
};

// -----------------------------
// LOAD BUTTON
// -----------------------------
document.getElementById("load").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const interval = document.getElementById("interval").value.trim();
  if (!symbol) return;

  window.api.saveSymbol(symbol);
  loadSymbolHistory();
  loadTradeHistory(symbol);
  refreshChart();
});

// -----------------------------
// CLEAR LINES
// -----------------------------
document.getElementById("clearLines").addEventListener("click", () => {
  allLines.forEach(line => candleSeries.removePriceLine(line));
  allLines = [];

  buyPrice = null;
  profitPrice = null;
  stopPrice = null;

  clickCount = 0;
});

// -----------------------------
// MAKE TRADE BUTTON
// -----------------------------
document.getElementById("makeTrade").addEventListener("click", () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const amount = 1000; //todo get from gui

  let position = buyPrice < profitPrice ? "LONG" : "SHORT";

  // SAVE TRADE
  const trade = {
    buy: buyPrice,
    amount: amount,
    leverage: leverage,
    position: position,
    amount: amount,
    profit: profitPrice,
    stop: stopPrice,
    timestamp: Math.floor(Date.now() / 1000)
  };

  makeTrade(symbol, amount, buyPrice, profitPrice, stopPrice, leverage, position);
  window.api.saveTrade(symbol, trade);
  loadTradeHistory(symbol);
});

// -----------------------------
// MAKE MARKET TRADE BUTTON
// -----------------------------
document.getElementById("makeMarketTrade").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const amount = 1000; //todo get from gui

  let position = "LONG";
  const price = await makeMarketTrade(symbol, amount, buyPrice, profitPrice, stopPrice, leverage, position);


  // SAVE TRADE
  const trade = {
    buy: price,
    amount: amount,
    leverage: leverage,
    position: position,
    amount: amount,
    profit: profitPrice,
    stop: stopPrice,
    timestamp: Math.floor(Date.now() / 1000)
  };

  window.api.saveTrade(symbol, trade);
  loadTradeHistory(symbol);
});

document.getElementById("makeShortMarketTrade").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const amount = 1000; //todo get from gui

  let position = "SHORT";
  const price = await makeMarketTrade(symbol, amount, buyPrice, profitPrice, stopPrice, leverage, position);

  // SAVE TRADE
  const trade = {
    buy: price,
    amount: amount,
    leverage: leverage,
    position: position,
    amount: amount,
    profit: profitPrice,
    stop: stopPrice,
    timestamp: Math.floor(Date.now() / 1000)
  };

  window.api.saveTrade(symbol, trade);
  loadTradeHistory(symbol);
});

// -----------------------------
// SAFE JSON
// -----------------------------
async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// -----------------------------
// GET CANDLES
// -----------------------------
const getCandles = async (symbol, interval = "FifteenMinutes") => {
  const direction = "asc";

  try {
    // 1. Search instrument
    const searchUrl =
      `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(i => i.internalSymbolFull === symbol);
    if (!instrument) throw new Error(`Instrument not found: ${symbol}`);

    const instrumentId = instrument.instrumentId;

    // 2. Get price
    const priceUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;

    const priceRes = await fetch(priceUrl, { method: "GET", headers });
    const priceData = await safeJson(priceRes);

    const price = priceData.rates?.[0]?.bid;
    if (!price) throw new Error("Price not available");

    // 3. Get candles
    const candleUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/${instrumentId}/history/candles/${direction}/${interval}/100`;

    const candleRes = await fetch(candleUrl, { method: "GET", headers });
    const candleData = await safeJson(candleRes);

    return candleData.candles;
  } catch (err) {
    console.error("ERROR:", err.message);
  }
};

// -----------------------------
// MAKE TRADE
// -----------------------------
const makeTrade = async (symbol, amount, rate, profit, stop, leverage = 1, position = "LONG") => {
  const searchUrl =
    `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

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
    Leverage: leverage,
    IsBuy: position === "LONG"
  };

  console.log(orderBody);

  const orderUrl =
    "https://public-api.etoro.com/api/v1/trading/execution/demo/limit-orders";

  const orderRes = await fetch(orderUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(orderBody)
  });

  const result = await safeJson(orderRes);
  console.log("Order Response:", result);
};

// -----------------------------
// MAKE MARKET TRADE
// -----------------------------
const makeMarketTrade = async (symbol, amount, rate, profit, stop, leverage = 1, position = "LONG") => {

  const searchUrl =
    `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await safeJson(searchRes);

  const instrument = searchData.items?.find(i => i.internalSymbolFull === symbol);
  if (!instrument) throw new Error(`Instrument not found for ${symbol}`);

  const instrumentId = instrument.instrumentId;


  // 2. Get price
  const priceUrl =
    `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;

  const priceRes = await fetch(priceUrl, { method: "GET", headers });
  const priceData = await safeJson(priceRes);

  const price = priceData.rates?.[0]?.bid;


  const orderBody = {
    InstrumentId: instrumentId,
    Amount: amount,
    // Rate: rate,
    // StopLossRate: stop,
    // TakeProfitRate: profit,
    Leverage: leverage,
    IsBuy: position === "LONG"
  };

  console.log(orderBody);

  const orderUrl =
    'https://public-api.etoro.com/api/v1/trading/execution/demo/market-open-orders/by-amount';

  const orderRes = await fetch(orderUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderBody)
  });

  return price;
};

// -----------------------------
// SYMBOL HISTORY
// -----------------------------
async function loadSymbolHistory() {
  const list = await window.api.getSymbols();
  const container = document.getElementById("symbolHistory");

  container.innerHTML = "";

  list.forEach(sym => {
    const btn = document.createElement("button");
    btn.textContent = sym;
    btn.style.marginRight = "8px";
    btn.onclick = () => {
      document.getElementById("symbol").value = sym;
      document.getElementById("load").click();
    };
    container.appendChild(btn);
  });
}

// -----------------------------
// TRADE HISTORY
// -----------------------------
async function loadTradeHistory(symbol) {
  const trades = await window.api.getTrades(symbol);
  const container = document.getElementById("tradeHistory");

  container.innerHTML = "";

  trades.forEach((t, index) => {
    const div = document.createElement("div");
    div.style.marginBottom = "6px";
    div.style.fontFamily = "monospace";
    div.style.padding = "4px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "4px";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    const text = document.createElement("span");
    text.textContent =
      `ENTER ${t.buy} | PROFIT ${t.profit} | STOP ${t.stop} | AMOUNT ${t.amount} |LEVERAGE ${t.leverage} | POSITION ${t.position} | ${new Date(t.timestamp * 1000).toLocaleString()}}`;
    text.style.cursor = "pointer";
    text.onclick = () => loadTradeLines(t);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => {
      window.api.deleteTrade(symbol, index);
      loadTradeHistory(symbol);
    };

    div.appendChild(text);
    div.appendChild(delBtn);
    container.appendChild(div);
  });
}

// -----------------------------
// LOAD TRADE LINES
// -----------------------------
function loadTradeLines(trade) {
  allLines.forEach(line => candleSeries.removePriceLine(line));
  allLines = [];

  buyPrice = trade.buy;
  profitPrice = trade.profit;
  stopPrice = trade.stop;
  clickCount = 3;

  const buyLine = candleSeries.createPriceLine({
    price: trade.buy,
    color: "blue",
    lineWidth: 2,
    lineStyle: 2,
    title: "ENTER"
  });
  allLines.push(buyLine);

  const profitLine = candleSeries.createPriceLine({
    price: trade.profit,
    color: "green",
    lineWidth: 2,
    lineStyle: 2,
    title: "PROFIT"
  });
  allLines.push(profitLine);

  const stopLine = candleSeries.createPriceLine({
    price: trade.stop,
    color: "red",
    lineWidth: 2,
    lineStyle: 2,
    title: "STOP"
  });
  allLines.push(stopLine);
}


async function refreshChart() {

  if (!chart) initChart();
  const interval = document.getElementById("interval").value.trim();
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  if (!symbol) { return }

  try {
    const json = await getCandles(symbol, interval);
    const candles = convertAPIResponseToCandles(json);
    candleSeries.setData(candles);

  } catch (err) {
    console.error("Error loading chart:", err);
  }
}

// -----------------------------
// AUTO REFRESH EVERY 10 SECONDS
// -----------------------------
setInterval(() => {
  refreshChart();
  console.log('refresh chart');
}, 10000);

// -----------------------------
// INIT
// -----------------------------
loadSymbolHistory();
loadChart();
