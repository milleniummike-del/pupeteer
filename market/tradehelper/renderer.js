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

// Store ALL price lines created (robust clearing)
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

    // BUY
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

      let cmd = `node .\\market_open_touch.js symbol=MU stop=${stopPrice.toFixed(5)} profit=${profitPrice.toFixed(5)} rate=${buyPrice.toFixed(5)}`;
      if (buyPrice > profitPrice) {
        cmd = cmd + ' position=SHORT';
      }
      document.getElementById("output").textContent = cmd;

      document.getElementById("copyJson").onclick = () => {
        window.api.copyToClipboard(cmd);
      };

      clickCount = 0; // reset for next trade
    }
  });
}


const loadChart = async () => {


  if (!chart) initChart();

  try {
    const json = await getCandles('BTC');
    const candles = convertAPIResponseToCandles(json);

    candleSeries.setData(candles);

  } catch (err) {
    console.error("Error loading mock.json:", err);
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
  } catch (err) {
    console.error("Error loading mock.json:", err);
  }
});

// -----------------------------
// CLEAR LINES BUTTON (ROBUST)
// -----------------------------
document.getElementById("clearLines").addEventListener("click", () => {
  // Remove ALL price lines ever created
  allLines.forEach(line => candleSeries.removePriceLine(line));
  allLines = [];

  buyPrice = null;
  profitPrice = null;
  stopPrice = null;

  clickCount = 0;

  document.getElementById("output").textContent = "";
});

document.getElementById("makeTrade").addEventListener("click", () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  let position = 'LONG';
  if (buyPrice < profitPrice) { position = 'LONG' } else { position = 'SHORT' };

  makeTrade(symbol, 1000, buyPrice, profitPrice, stopPrice, leverage, position);

});

async function safeJson(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

const getCandles = async (symbol, interval = 'FifteenMinutes') => {
  const direction = 'asc';
  try {
    // -------------------------
    // 1. Get instrument
    // -------------------------
    const searchUrl =
      `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await safeJson(searchRes);

    const instrument = searchData.items?.find(
      i => i.internalSymbolFull === symbol
    );

    if (!instrument) {
      throw new Error(`Instrument not found: ${symbol}`);
    }

    const instrumentId = instrument.instrumentId;
    console.log('Instrument ID:', instrumentId);

    // -------------------------
    // 2. Get price
    // -------------------------
    const priceUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/rates?instrumentIds=${instrumentId}`;

    const priceRes = await fetch(priceUrl, {
      method: 'GET',
      headers
    });

    const priceData = await safeJson(priceRes);
    const price = priceData.rates?.[0]?.bid;

    if (!price) {
      throw new Error('Price not available');
    }

    console.log('Price:', price);
    const candleUrl =
      `https://public-api.etoro.com/api/v1/market-data/instruments/${instrumentId}/history/candles/${direction}/${interval}/100`;

    const candleRes = await fetch(candleUrl, {
      method: 'GET',
      headers
    });

    const candleData = await safeJson(candleRes);

    console.log(candleData.candles);
    return candleData.candles;


  } catch (err) {
    console.error('ERROR:', err.message);
  }
};

const makeTrade = async (symbol, amount, rate, profit, stop, leverage = 1, position = "LONG") => {
  // -------------------------
  // 1. Get instrument ID
  // -------------------------
  const searchUrl =
    `https://public-api.etoro.com/api/v1/market-data/search?internalSymbolFull=${symbol}`;

  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await safeJson(searchRes);
  console.log('Looking up ' + symbol);
  const instrument = searchData.items?.find(
    i => i.internalSymbolFull === symbol
  );

  if (!instrument) {
    throw new Error(`Instrument not found for ${symbol}`);
  }

  const instrumentId = instrument.instrumentId;
  console.log('Instrument ID:', instrumentId);

  // -------------------------
  // 4. Build order
  // -------------------------
  const orderBody = {
    InstrumentId: instrumentId,
    Amount: amount,
    Rate: rate, // IMPORTANT: may need valid value for limit orders
    StopLossRate: stop,
    TakeProfitRate: profit,
    Leverage: leverage,
    IsBuy: position === 'LONG'
  };

  console.log('Order Payload:');
  console.log(JSON.stringify(orderBody, null, 2));

  // -------------------------
  // 5. Place order
  // -------------------------
  const orderUrl =
    'https://public-api.etoro.com/api/v1/trading/execution/demo/limit-orders';

  const orderRes = await fetch(orderUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderBody)
  });

  const result = await safeJson(orderRes);

  console.log('--- RESPONSE ---');
  console.log('Status:', orderRes.status);
}

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

loadSymbolHistory();

loadChart();

// -----------------------------
// AUTO REFRESH EVERY 10 SECONDS
// -----------------------------
setInterval(() => {
    document.getElementById("load").click();
}, 10000);
