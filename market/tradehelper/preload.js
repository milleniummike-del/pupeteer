const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the renderer
contextBridge.exposeInMainWorld("api", {

  // Save a symbol to persistent history
  saveSymbol: (symbol) => ipcRenderer.send("save-symbol", symbol),

  // Retrieve saved symbols
  getSymbols: () => ipcRenderer.invoke("get-symbols")
});
