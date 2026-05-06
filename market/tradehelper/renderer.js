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

      const symbol = document.getElementById("symbol").value.trim().toUpperCase();

      // SAVE TRADE
      const trade = {
        buy: buyPrice,
        profit: profitPrice,
        stop: stopPrice,
        timestamp: Math.floor(Date.now() / 1000)
      };

      window.api.saveTrade(symbol, trade);
      loadTradeHistory(symbol);

      clickCount = 0;
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

  if (!chart) initChart();

  try {
    const json = await getCandles(symbol, interval);
    const candles = convertAPIResponseToCandles(json);
    candleSeries.setData(candles);

    loadTradeHistory(symbol);
  } catch (err) {
    console.error("Error loading chart:", err);
  }
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

  document.getElementById("output").textContent = "";
});

// -----------------------------
// MAKE TRADE BUTTON
// -----------------------------
document.getElementById("makeTrade").addEventListener("click", () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();

  let position = buyPrice < profitPrice ? "LONG" : "SHORT";

  makeTrade(symbol, 1000, buyPrice, profitPrice, stopPrice, leverage, position);
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

  trades.forEach(t => {
    const div = document.createElement("div");
    div.style.marginBottom = "6px";
    div.style.fontFamily = "monospace";
    div.style.cursor = "pointer";
    div.style.padding = "4px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "4px";

    div.textContent =
      `ENTER ${t.buy.toFixed(5)} | PROFIT ${t.profit.toFixed(5)} | STOP ${t.stop.toFixed(5)} | ${new Date(t.timestamp * 1000).toLocaleString()}`;

    div.onclick = () => loadTradeLines(t);

    container.appendChild(div);
  });
}

// -----------------------------
// LOAD TRADE LINES
// -----------------------------
function loadTradeLines(trade) {
  allLines.forEach(line => candleSeries.removePriceLine(line));
  allLines = [];

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

// -----------------------------
// AUTO REFRESH EVERY 10 SECONDS
// -----------------------------
setInterval(() => {
  document.getElementById("load").click();
  console.log('reload');
}, 10000);

// -----------------------------
// INIT
// -----------------------------
loadSymbolHistory();
loadChart();
