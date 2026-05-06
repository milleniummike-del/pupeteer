const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  
  // Save candle JSON to file
  saveJson: (data) => ipcRenderer.send("save-json", data),

  // Copy text (commands, JSON, etc.) to clipboard
  copyToClipboard: (text) => ipcRenderer.send("copy-to-clipboard", text),

  // Save a symbol to persistent history
  saveSymbol: (symbol) => ipcRenderer.send("save-symbol", symbol),

  // Retrieve saved symbols
  getSymbols: () => ipcRenderer.invoke("get-symbols"),

  // Save a trade for a symbol
  saveTrade: (symbol, trade) => ipcRenderer.send("save-trade", { symbol, trade }),

  // Retrieve saved trades for a symbol
  getTrades: (symbol) => ipcRenderer.invoke("get-trades", symbol)
});
