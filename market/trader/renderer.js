import { convertAPIResponseToCandles } from "./marketData.js";

// -----------------------------
// TAB CLASS
// -----------------------------
class Tab {
  constructor(symbol) {
    this.symbol = symbol.toUpperCase();
    this.id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.chart = null;
    this.candleSeries = null;
    this.allLines = [];
    this.marketRefLines = [];
    this.clickCount = 0;
    this.buyPrice = null;
    this.profitPrice = null;
    this.stopPrice = null;
    this.lastMarketPrice = 0;
    this.refreshTimer = null;

    this.initUI();
    this.initChart();
    this.loadSymbolData();
    this.startAutoRefresh();
  }

  initUI() {
    // Create Tab Button
    this.btn = document.createElement("div");
    this.btn.className = "tab-button";
    this.btn.id = `btn-${this.id}`;
    this.btn.innerHTML = `
      <span class="tab-label">${this.symbol}</span>
      <span class="close-tab">×</span>
    `;
    this.btn.onclick = (e) => {
      if (e.target.className === "close-tab") {
        this.close();
      } else {
        switchTab(this.id);
      }
    };
    document.getElementById("tabBar").appendChild(this.btn);

    // Create Tab Content from Template
    const template = document.getElementById("tabTemplate");
    this.content = template.content.cloneNode(true).querySelector(".tab-content");
    this.content.id = this.id;
    document.getElementById("tabContainer").appendChild(this.content);

    // Bind UI Elements
    this.ui = {
      title: this.content.querySelector(".tab-title"),
      chartLink: this.content.querySelector(".chartLink"),
      newsLink: this.content.querySelector(".newsLink"),
      loadBtn: this.content.querySelector(".loadBtn"),
      clearLinesBtn: this.content.querySelector(".clearLinesBtn"),
      symbolInput: this.content.querySelector(".symbolInput"),
      intervalSelect: this.content.querySelector(".intervalSelect"),
      makeTradeBtn: this.content.querySelector(".makeTradeBtn"),
      makeMarketTradeBtn: this.content.querySelector(".makeMarketTradeBtn"),
      currentPriceDisplay: this.content.querySelector(".currentPriceDisplay"),
      plus1: this.content.querySelector(".plus1"),
      plus2: this.content.querySelector(".plus2"),
      minus1: this.content.querySelector(".minus1"),
      minus2: this.content.querySelector(".minus2"),
      profitDollar: this.content.querySelector(".profitDollar"),
      profitPcnt: this.content.querySelector(".profitPcnt"),
      stopDollar: this.content.querySelector(".stopDollar"),
      stopPcnt: this.content.querySelector(".stopPcnt"),
      chartContainer: this.content.querySelector(".chart-container"),
      tradeHistory: this.content.querySelector(".tradeHistory"),
      leverageInput: this.content.querySelector(".leverageInput"),
      amountInput: this.content.querySelector(".amountInput"),
      marginInput: this.content.querySelector(".marginInput"),
      refreshIntervalInput: this.content.querySelector(".refreshIntervalInput"),
    };

    this.ui.title.textContent = this.symbol;
    this.ui.symbolInput.value = this.symbol;

    // Event Listeners
    this.ui.chartLink.onclick = (e) => {
      e.preventDefault();
      window.api.openExternal(`https://www.etoro.com/markets/${this.symbol}/chart`);
    };
    this.ui.newsLink.onclick = (e) => {
      e.preventDefault();
      window.api.openExternal(`https://finance.yahoo.com/quote/${this.symbol}/news/`);
    };
    this.ui.loadBtn.onclick = () => {
      this.symbol = this.ui.symbolInput.value.trim().toUpperCase();
      this.ui.title.textContent = this.symbol;
      this.btn.querySelector(".tab-label").textContent = this.symbol;
      window.api.saveSymbol(this.symbol);
      loadSymbolHistory();
      this.loadSymbolData();
    };
    this.ui.clearLinesBtn.onclick = () => this.clearLines();
    this.ui.makeTradeBtn.onclick = () => this.makeTrade();
    this.ui.makeMarketTradeBtn.onclick = () => this.makeMarketTrade();
    this.ui.refreshIntervalInput.onchange = () => this.startAutoRefresh();
    this.ui.amountInput.oninput = () => this.updatePnLDisplay();
    this.ui.leverageInput.oninput = () => this.updatePnLDisplay();
  }

  initChart() {
    this.chart = LightweightCharts.createChart(this.ui.chartContainer, {
      width: this.ui.chartContainer.clientWidth,
      height: this.ui.chartContainer.clientHeight,
      layout: { background: { color: "#0f1116" }, textColor: "#e6e6e6" },
      grid: { vertLines: { color: "#2a2e39" }, horzLines: { color: "#2a2e39" } },
      timeScale: { borderVisible: true, timeVisible: true, secondsVisible: false, rightOffset: 12, barSpacing: 6 },
      rightPriceScale: { borderVisible: true, scaleMargins: { top: 0.1, bottom: 0.1 } },
    });

    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: "#4dff88", downColor: "#ff4d4d", borderVisible: false, wickUpColor: "#4dff88", wickDownColor: "#ff4d4d"
    });

    this.chart.subscribeClick(param => {
      if (!param || !param.point) return;
      const price = this.candleSeries.coordinateToPrice(param.point.y);
      if (!price || this.clickCount > 3) return;
      this.clickCount++;

      if (this.clickCount === 1) {
        this.buyPrice = price;
        this.allLines.push(this.candleSeries.createPriceLine({ price, color: "#4da3ff", lineWidth: 2, title: "ENTER", axisLabelVisible: true }));
      } else if (this.clickCount === 2) {
        this.profitPrice = price;
        this.allLines.push(this.candleSeries.createPriceLine({ price, color: "#4dff88", lineWidth: 2, title: "PROFIT", axisLabelVisible: true }));
      } else if (this.clickCount === 3) {
        this.stopPrice = price;
        this.allLines.push(this.candleSeries.createPriceLine({ price, color: "#d2bb34", lineWidth: 2, title: "STOP", axisLabelVisible: true }));
        this.updatePnLDisplay();
      }
    });
  }

  async loadSymbolData() {
    await this.refreshChart();
    await this.loadTradeHistory();

    // Load latest trade into lines
    const trades = await window.api.getTrades(this.symbol);
    if (trades && trades.length > 0) {
      const latestTrade = trades[trades.length - 1];
      this.loadTradeLines(latestTrade);
    }
  }

  async refreshChart() {
    const interval = this.ui.intervalSelect.value;
    const isIntraday = !interval.includes("Day") && !interval.includes("Week");
    this.chart.applyOptions({ timeScale: { timeVisible: isIntraday } });

    try {
      const { candles, currentPrice } = await window.api.getCandles(this.symbol, interval);
      this.candleSeries.setData(convertAPIResponseToCandles(candles));
      this.updateMarketPriceInfo(currentPrice);
    } catch (err) {
      console.error("Error loading chart:", err);
    }
  }

  updateMarketPriceInfo(price) {
    if (!price) return;
    this.lastMarketPrice = price;
    this.ui.currentPriceDisplay.textContent = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    
    const levels = [
      { p: price * 1.01, el: this.ui.plus1, title: "+1%", color: "#4dff88" },
      { p: price * 1.02, el: this.ui.plus2, title: "+2%", color: "#00ff00" },
      { p: price * 0.99, el: this.ui.minus1, title: "-1%", color: "#f90000" },
      { p: price * 0.98, el: this.ui.minus2, title: "-2%", color: "#e81414" }
    ];

    this.marketRefLines.forEach(line => this.candleSeries.removePriceLine(line));
    this.marketRefLines = [];

    levels.forEach(l => {
      l.el.textContent = l.p.toFixed(2);
      this.marketRefLines.push(this.candleSeries.createPriceLine({ price: l.p, color: l.color, lineWidth: 2, title: l.title, axisLabelVisible: true }));
    });
  }

  updatePnLDisplay() {
    if (this.buyPrice === null || this.profitPrice === null || this.stopPrice === null) return;
    const amountValue = parseFloat(this.ui.amountInput.value) || 0;
    const leverageValue = parseFloat(this.ui.leverageInput.value) || 1;
    const isLong = this.profitPrice > this.buyPrice;
    let profitPcnt = isLong ? (this.profitPrice / this.buyPrice - 1) : (1 - this.profitPrice / this.buyPrice);
    let stopPcnt = isLong ? (this.stopPrice / this.buyPrice - 1) : (1 - this.stopPrice / this.buyPrice);
    
    this.ui.profitDollar.textContent = `$${(profitPcnt * amountValue * leverageValue).toFixed(2)}`;
    this.ui.stopDollar.textContent = `$${(stopPcnt * amountValue * leverageValue).toFixed(2)}`;
    this.ui.profitPcnt.textContent = `${(profitPcnt * 100).toFixed(2)}%`;
    this.ui.stopPcnt.textContent = `${(stopPcnt * 100).toFixed(2)}%`;
  }

  clearLines() {
    this.allLines.forEach(line => this.candleSeries.removePriceLine(line));
    this.allLines = [];
    this.buyPrice = this.profitPrice = this.stopPrice = null;
    this.clickCount = 0;
    this.ui.profitDollar.textContent = "$0.00";
    this.ui.stopDollar.textContent = "$0.00";
  }

  async makeTrade() {
    if (this.clickCount < 3) return;
    const leverage = parseInt(this.ui.leverageInput.value);
    const amount = parseFloat(this.ui.amountInput.value);
    const position = this.buyPrice < this.profitPrice ? "LONG" : "SHORT";
    for (let i = 0; i < leverage; i++) {
      const trade = await window.api.makeTrade({ symbol: this.symbol, amount, rate: this.buyPrice, profit: this.profitPrice, stop: this.stopPrice, leverage: 1, position });
      window.api.saveTrade(this.symbol, trade);
    }
    this.loadTradeHistory();
  }

  async makeMarketTrade() {
    const leverage = parseInt(this.ui.leverageInput.value);
    const margin = parseFloat(this.ui.marginInput.value) / 100;
    const amount = parseFloat(this.ui.amountInput.value);
    for (let i = 0; i < leverage; i++) {
      const trade = await window.api.makeMarketTrade({ symbol: this.symbol, amount, leverage: 1, position: "LONG", margin });
      window.api.saveTrade(this.symbol, trade);
    }
    this.loadTradeHistory();
  }

  async loadTradeHistory() {
    const trades = await window.api.getTrades(this.symbol);
    this.ui.tradeHistory.innerHTML = "";
    trades.forEach((t, index) => {
      const div = document.createElement("div");
      div.className = "trade-item";
      div.style = "margin-bottom:6px; font-family:monospace; padding:4px; border:1px solid #ccc; border-radius:4px; display:flex; justify-content:space-between; align-items:center;";
      div.innerHTML = `
        <span style="cursor:pointer">ENTER ${t.Rate} | PROFIT ${t.TakeProfitRate} | STOP ${t.StopLossRate} | ${new Date(t.timestamp * 1000).toLocaleString()}</span>
        <button>Delete</button>
      `;
      div.querySelector("span").onclick = () => this.loadTradeLines(t);
      div.querySelector("button").onclick = () => {
        window.api.deleteTrade(this.symbol, index);
        this.loadTradeHistory();
      };
      this.ui.tradeHistory.appendChild(div);
    });
  }

  loadTradeLines(trade) {
    this.clearLines();
    this.buyPrice = trade.Rate;
    this.profitPrice = trade.TakeProfitRate;
    this.stopPrice = trade.StopLossRate;
    this.clickCount = 3;
    this.allLines.push(this.candleSeries.createPriceLine({ price: this.buyPrice, color: "#4da3ff", lineWidth: 2, title: "ENTER", axisLabelVisible: true }));
    this.allLines.push(this.candleSeries.createPriceLine({ price: this.profitPrice, color: "#4dff88", lineWidth: 2, title: "PROFIT", axisLabelVisible: true }));
    this.allLines.push(this.candleSeries.createPriceLine({ price: this.stopPrice, color: "#fc0606", lineWidth: 2, title: "STOP", axisLabelVisible: true }));
    this.updatePnLDisplay();
  }

  startAutoRefresh() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    const seconds = parseInt(this.ui.refreshIntervalInput.value) || 30;
    this.refreshTimer = setInterval(() => this.refreshChart(), seconds * 1000);
  }

  resize() {
    if (this.chart && this.ui.chartContainer) {
      this.chart.resize(this.ui.chartContainer.clientWidth, this.ui.chartContainer.clientHeight);
    }
  }

  close() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.btn.remove();
    this.content.remove();
    tabs = tabs.filter(t => t.id !== this.id);
    if (tabs.length > 0) switchTab(tabs[tabs.length - 1].id);
  }
}

// -----------------------------
// TAB MANAGEMENT
// -----------------------------
let tabs = [];

function switchTab(tabId) {
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.getElementById(`btn-${tabId}`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
  
  const tab = tabs.find(t => t.id === tabId);
  if (tab) tab.resize();
}

function createTab(symbol) {
  const existingTab = tabs.find(t => t.symbol === symbol.toUpperCase());
  if (existingTab) {
    switchTab(existingTab.id);
    return;
  }
  const newTab = new Tab(symbol);
  tabs.push(newTab);
  switchTab(newTab.id);
}

// -----------------------------
// SYMBOL HISTORY
// -----------------------------
async function loadSymbolHistory() {
  const list = await window.api.getSymbols();
  const container = document.getElementById("symbolHistory");
  container.innerHTML = "";
  const sortedList = [...list].sort((a, b) => a.localeCompare(b));
  sortedList.forEach(sym => {
    const btn = document.createElement("button");
    btn.textContent = sym;
    btn.style.marginRight = "8px";
    btn.onclick = () => createTab(sym);
    container.appendChild(btn);
  });
}

// -----------------------------
// INIT
// -----------------------------
loadSymbolHistory();
createTab("BTC");
