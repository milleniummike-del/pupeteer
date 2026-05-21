import { convertAPIResponseToCandles } from "./marketData.js";

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
let lastMarketPrice = 0;

// Track ALL price lines for robust clearing
let allLines = [];
let marketRefLines = [];

// -----------------------------
// INIT CHART
// -----------------------------
function initChart() {
  const container = document.getElementById("chart");

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    layout: { 
      background: { color: "#0f1116" }, 
      textColor: "#e6e6e6" 
    },
    grid: {
      vertLines: { color: "#2a2e39" },
      horzLines: { color: "#2a2e39" }
    },
    timeScale: { 
      borderVisible: true,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 6,
    },
    rightPriceScale: {
      borderVisible: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: "#4dff88",
    downColor: "#ff4d4d",
    borderVisible: false,
    wickUpColor: "#4dff88",
    wickDownColor: "#ff4d4d"
  });

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
        color: "#4da3ff", 
        lineWidth: 2,
        lineStyle: 0, 
        title: "ENTER",
        axisLabelVisible: true
      });

      allLines.push(line);
    }

    // PROFIT
    else if (clickCount === 2) {
      profitPrice = price;

      const line = candleSeries.createPriceLine({
        price,
        color: "#4dff88", 
        lineWidth: 2,
        lineStyle: 0, 
        title: "PROFIT",
        axisLabelVisible: true
      });

      allLines.push(line);
    }

    // STOP
    else if (clickCount === 3) {
      stopPrice = price;

      const line = candleSeries.createPriceLine({
        price,
        color: "#d2bb34", 
        lineWidth: 2,
        lineStyle: 0, 
        title: "STOP",
        axisLabelVisible: true
      });

      allLines.push(line);
      updatePnLDisplay();
    }
  });
}

// -----------------------------
// MARKET PRICE INFO
// -----------------------------
function updateMarketPriceInfo(price) {
  if (!price) return;
  lastMarketPrice = price;
  
  document.getElementById("currentPriceDisplay").textContent = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  
  const p1 = price * 1.01;
  const p2 = price * 1.02;
  const p3 = price * 1.05;
  const m1 = price * 0.99;
  const m2 = price * 0.98;
  const m3 = price * 0.95;

  document.getElementById("plus1").textContent = p1.toFixed(2);
  document.getElementById("plus2").textContent = p2.toFixed(2);
  document.getElementById("minus1").textContent = m1.toFixed(2);
  document.getElementById("minus2").textContent = m2.toFixed(2);

  // Clear old reference lines
  marketRefLines.forEach(line => candleSeries.removePriceLine(line));
  marketRefLines = [];

  // Add new reference lines to chart
  const levels = [
    { price: p1, title: "+1%", color: "#4dff88", width: 2, style: 0 },
    { price: p2, title: "+2%", color: "#00ff00", width: 2, style: 0 },
    { price: p3, title: "+5%", color: "#00ff00", width: 2, style: 0 },
    { price: m1, title: "-1%", color: "#f90000", width: 2, style: 0 },
    { price: m2, title: "-2%", color: "#e81414", width: 2, style: 0 },
    { price: m3, title: "-5%", color: "#e81414", width: 2, style: 0 }
  ];

  levels.forEach(l => {
    const line = candleSeries.createPriceLine({
      price: l.price,
      color: l.color,
      lineWidth: l.width,
      lineStyle: l.style, 
      title: l.title,
      axisLabelVisible: true,
    });
    marketRefLines.push(line);
  });
}

// -----------------------------
// PNL DISPLAY
// -----------------------------
function updatePnLDisplay() {
  const profitSpan = document.getElementById("profitDollar");
  const stopSpan = document.getElementById("stopDollar");
  const profitPcntSpan = document.getElementById("profitPcnt");
  const stopPcntSpan = document.getElementById("stopPcnt");

  if (buyPrice === null || profitPrice === null || stopPrice === null) {
    profitSpan.textContent = "$0.00";
    stopSpan.textContent = "$0.00";
    profitPcntSpan.textContent = "0.00%";
    stopPcntSpan.textContent = "0.00%";
    return;
  }

  const amountValue = parseFloat(document.getElementById("amount").value) || 0;
  const leverageValue = parseFloat(document.getElementById("leverage").value) || 1;

  const isLong = profitPrice > buyPrice;
  
  let profitPcnt = (profitPrice / buyPrice) - 1;
  let stopPcnt = (stopPrice / buyPrice) - 1;

  if (!isLong) {
    profitPcnt = 1 - (profitPrice / buyPrice);
    stopPcnt = 1 - (stopPrice / buyPrice);
  }

  const profitDollar = profitPcnt * amountValue * leverageValue;
  const stopDollar = stopPcnt * amountValue * leverageValue;

  profitSpan.textContent = `$${profitDollar.toFixed(2)}`;
  stopSpan.textContent = `$${stopDollar.toFixed(2)}`;
  profitPcntSpan.textContent = `${(profitPcnt * 100).toFixed(2)}%`;
  stopPcntSpan.textContent = `${(stopPcnt * 100).toFixed(2)}%`;
}

document.getElementById("amount").addEventListener("input", updatePnLDisplay);
document.getElementById("leverage").addEventListener("input", updatePnLDisplay);

// -----------------------------
// LOAD CHART (BTC default)
// -----------------------------
const loadChart = async () => {
  if (!chart) initChart();

  try {
    const { candles, currentPrice } = await window.api.getCandles("BTC");
    const chartCandles = convertAPIResponseToCandles(candles);
    candleSeries.setData(chartCandles);
    updateMarketPriceInfo(currentPrice);
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
  updatePnLDisplay();
});

// -----------------------------
// MAKE TRADE BUTTON
// -----------------------------
document.getElementById("makeTrade").addEventListener("click", async () => {
  if (clickCount<3) {return}
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const amount = parseFloat(document.getElementById("amount").value.trim());

  let position = buyPrice < profitPrice ? "LONG" : "SHORT";
  for (let i = 0; i < leverage; i++) {
    const trade = await window.api.makeTrade({ 
      symbol, 
      amount, 
      rate: buyPrice, 
      profit: profitPrice, 
      stop: stopPrice, 
      leverage: 1, 
      position 
    });

    console.log(trade);
    window.api.saveTrade(symbol, trade);
    loadTradeHistory(symbol);
  }
});

// -----------------------------
// MAKE MARKET TRADE BUTTON
// -----------------------------
document.getElementById("makeMarketTrade").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const margin = parseFloat(document.getElementById("margin").value.trim()) / 100;
  const amount = parseFloat(document.getElementById("amount").value.trim());

  let position = "LONG";

  for (let i = 0; i < leverage; i++) {
  const trade = await window.api.makeMarketTrade({ symbol, amount, leverage: 1, position, margin });
  window.api.saveTrade(symbol, trade);
  loadTradeHistory(symbol);
  }


});
/*
document.getElementById("makeShortMarketTrade").addEventListener("click", async () => {
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  const leverage = document.getElementById("leverage").value.trim();
  const margin = parseFloat(document.getElementById("margin").value.trim()) / 100;
  const amount = parseFloat(document.getElementById("amount").value.trim());

  let position = "SHORT";

   for (let i = 0; i < leverage; i++) {
  const trade = await window.api.makeMarketTrade({ symbol, amount, leverage: 1, position, margin });

  window.api.saveTrade(symbol, trade);
  loadTradeHistory(symbol);
   }
});
*/
// -----------------------------
// SYMBOL HISTORY
// -----------------------------
async function loadSymbolHistory() {
  const list = await window.api.getSymbols();
  const container = document.getElementById("symbolHistory");

  container.innerHTML = "";

  // Sort alphabetically
  const sortedList = [...list].sort((a, b) => a.localeCompare(b));

  sortedList.forEach(sym => {
    const btn = document.createElement("button");
    btn.textContent = sym;
    btn.style.marginRight = "8px";
    btn.onclick = async () => {
      document.getElementById("symbol").value = sym;
      await refreshChart();
      loadTradeHistory(sym);

      // Load latest trade into lines
      const trades = await window.api.getTrades(sym);
      if (trades && trades.length > 0) {
        const latestTrade = trades[trades.length - 1];
        loadTradeLines(latestTrade);
      }
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
      `ENTER ${t.Rate} | PROFIT ${t.TakeProfitRate} | STOP ${t.StopLossRate} | AMOUNT ${t.Amount} |LEVERAGE ${t.Leverage} | POSITION ${t.Position} | ${new Date(t.timestamp * 1000).toLocaleString()}}`;
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

  buyPrice = trade.Rate;
  profitPrice = trade.TakeProfitRate;
  stopPrice = trade.StopLossRate;
  clickCount = 3;

  const buyLine = candleSeries.createPriceLine({
    price: buyPrice,
    color: "#4da3ff",
    lineWidth: 2,
    lineStyle: 0,
    title: "ENTER",
    axisLabelVisible: true
  });
  allLines.push(buyLine);

  const profitLine = candleSeries.createPriceLine({
    price: profitPrice,
    color: "#4dff88",
    lineWidth: 2,
    lineStyle: 0,
    title: "PROFIT",
    axisLabelVisible: true
  });
  allLines.push(profitLine);

  const stopLine = candleSeries.createPriceLine({
    price: stopPrice,
    color: "#fc0606",
    lineWidth: 2,
    lineStyle: 0,
    title: "STOP",
    axisLabelVisible: true
  });
  allLines.push(stopLine);
  updatePnLDisplay();
}


async function refreshChart() {

  if (!chart) initChart();
  const interval = document.getElementById("interval").value.trim();
  const symbol = document.getElementById("symbol").value.trim().toUpperCase();
  if (!symbol) { return }

  const isIntraday = !interval.includes("Day") && !interval.includes("Week");
  chart.applyOptions({
    timeScale: {
      timeVisible: isIntraday,
    }
  });

  try {
    const { candles, currentPrice } = await window.api.getCandles(symbol, interval);
    const chartCandles = convertAPIResponseToCandles(candles);
    candleSeries.setData(chartCandles);
    updateMarketPriceInfo(currentPrice);

  } catch (err) {
    console.error("Error loading chart:", err);
  }
}

// -----------------------------
// AUTO REFRESH
// -----------------------------
let refreshTimer = null;

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);

  const seconds = parseInt(document.getElementById("refreshInterval").value.trim()) || 10;
  refreshTimer = setInterval(() => {
    refreshChart();
    console.log('refresh chart');
  }, seconds * 1000);
}

// Update timer when value changes
document.getElementById("refreshInterval").addEventListener("change", startAutoRefresh);

// -----------------------------
// INIT
// -----------------------------
loadSymbolHistory();
loadChart();
startAutoRefresh();
