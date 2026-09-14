document.addEventListener("DOMContentLoaded", () => {

  const promptsEl = document.getElementById("prompts");
  const modeEl = document.getElementById("mode");
  const aspectEl = document.getElementById("aspect");
  const modelEl = document.getElementById("model");
  const runBtn = document.getElementById("run");
  const debugOnBtn = document.getElementById("debugOn");
  const debugOffBtn = document.getElementById("debugOff");
  const testSelectorsBtn = document.getElementById("testSelectors");
  const logEl = document.getElementById("log");

  const jsonInputEl = document.getElementById("jsonInput");
  const parseJsonBtn = document.getElementById("parseJson");
  const jsonFieldSelector = document.getElementById("jsonFieldSelector");
  const jsonPreviewEl = document.getElementById("jsonPreview");

  let parsedJsonItems = [];

  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    logEl.textContent += `[${ts}] ${msg}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });
    return tab;
  }

  /* ---------------------------
     JSON PARSING
  ---------------------------- */
  parseJsonBtn.addEventListener("click", () => {
    log("Parse JSON clicked.");

    const raw = jsonInputEl.value.trim();
    if (!raw) {
      log("JSON input is empty.");
      return;
    }

    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) {
        log("JSON must be an array of objects.");
        return;
      }

      parsedJsonItems = arr;
      log(`Parsed ${arr.length} items from JSON.`);

      const fields = new Set();
      arr.forEach(item => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach(k => fields.add(k));
        }
      });

      jsonFieldSelector.innerHTML = `<option value="__whole">Use whole item</option>`;
      fields.forEach(f => {
        jsonFieldSelector.innerHTML += `<option value="${f}">${f}</option>`;
      });

      jsonPreviewEl.textContent = JSON.stringify(arr, null, 2);

    } catch (err) {
      log("JSON parse error: " + err.message);
    }
  });

  /* ---------------------------
     RUN QUEUE
  ---------------------------- */
  runBtn.addEventListener("click", async () => {
    let prompts = [];

    if (parsedJsonItems.length > 0) {
      const field = jsonFieldSelector.value;

      if (field === "__whole") {
        prompts = parsedJsonItems.map(item => JSON.stringify(item));
      } else {
        prompts = parsedJsonItems.map(item => {
          if (item[field] !== undefined) return String(item[field]);
          return JSON.stringify(item);
        });
      }

      log(`Using ${prompts.length} prompts from JSON.`);
    } else {
      const raw = promptsEl.value.trim();
      if (!raw) {
        log("No prompts provided.");
        return;
      }
      prompts = raw.split("\n").map(p => p.trim()).filter(Boolean);
      log(`Using ${prompts.length} prompts from textarea.`);
    }

    if (!prompts.length) {
      log("No valid prompts found.");
      return;
    }

    const characterInputEl = document.getElementById("characterInput");

const payload = {
  prompts,
  character: characterInputEl.value.trim() || null
};


    runBtn.disabled = true;
    log(`Starting queue with ${prompts.length} prompts...`);

    try {
      const tab = await getActiveTab();
      if (!tab || !tab.id) {
        log("No active tab found.");
        runBtn.disabled = false;
        return;
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: "FLOW_RUN_QUEUE",
        payload
      });

      log("Queue sent to content script.");
    } catch (err) {
      log(`Error sending queue: ${err.message}`);
    } finally {
      runBtn.disabled = false;
    }
  });

  /* ---------------------------
     DEBUG
  ---------------------------- */
  debugOnBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "FLOW_DEBUG_ON" });
    log("Debug mode enabled.");
  });

  debugOffBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "FLOW_DEBUG_OFF" });
    log("Debug mode disabled.");
  });

  /* ---------------------------
     SELECTOR TEST
  ---------------------------- */
  testSelectorsBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "FLOW_TEST_SELECTORS" });
    log("Requested selector test run.");
  });

  /* ---------------------------
     LOGGING FROM CONTENT SCRIPT
  ---------------------------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "FLOW_LOG") {
      log(msg.message);
    }
  });

  log("Side panel JS loaded.");
});
