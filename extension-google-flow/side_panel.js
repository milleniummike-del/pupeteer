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
  let filteredJsonPreview = [];

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
     JSON PARSING (MULTI-FIELD)
  ---------------------------- */
  parseJsonBtn.addEventListener("click", () => {
    log("Parse JSON clicked.");

    const raw = jsonInputEl.value.trim();
    if (!raw) {
      log("JSON input is empty.");
      return;
    }

    let arr;
    try {
      arr = JSON.parse(raw);
      if (!Array.isArray(arr)) {
        log("JSON must be an array of objects.");
        return;
      }
    } catch (err) {
      log("JSON parse error: " + err.message);
      return;
    }

    parsedJsonItems = arr;
    log(`Parsed ${arr.length} items from JSON.`);

    /* -----------------------------------------
       Extract ALL possible fields (nested too)
    ------------------------------------------ */
    function extractFields(obj, prefix = "") {
      const fields = [];
      for (const key in obj) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;

        fields.push(fullKey);

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          fields.push(...extractFields(value, fullKey));
        }
      }
      return fields;
    }

    const allFields = new Set();
    arr.forEach(item => {
      if (typeof item === "object" && item !== null) {
        extractFields(item).forEach(f => allFields.add(f));
      }
    });

    /* -----------------------------------------
       Build multi-select dropdown
    ------------------------------------------ */
    jsonFieldSelector.innerHTML = "";
    [...allFields].forEach(f => {
      jsonFieldSelector.innerHTML += `<option value="${f}">${f}</option>`;
    });

    // Auto-select all fields initially
    [...jsonFieldSelector.options].forEach(opt => (opt.selected = true));

    /* -----------------------------------------
       Build preview JSON using selected fields
    ------------------------------------------ */
    function buildPreview() {
      const selected = [...jsonFieldSelector.selectedOptions].map(o => o.value);

      const effective = selected.length ? selected : [...allFields];

      const preview = arr.map(item => {
        const out = {};

        effective.forEach(path => {
          const parts = path.split(".");
          let ref = item;

          for (const p of parts) {
            if (ref && typeof ref === "object" && p in ref) {
              ref = ref[p];
            } else {
              ref = undefined;
              break;
            }
          }

          out[path] = ref;
        });

        return out;
      });

      filteredJsonPreview = preview;
      jsonPreviewEl.textContent = JSON.stringify(preview, null, 2);
    }

    buildPreview();

    jsonFieldSelector.addEventListener("change", buildPreview);
  });

  /* ---------------------------
     RUN QUEUE
  ---------------------------- */
  runBtn.addEventListener("click", async () => {
    let prompts = [];

    if (parsedJsonItems.length > 0) {
      if (filteredJsonPreview.length > 0) {
        prompts = filteredJsonPreview.map(item => JSON.stringify(item));
        log(`Using ${prompts.length} filtered JSON prompts.`);
      } else {
        log("JSON parsed but no filtered preview available.");
        return;
      }
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
    const imageInputEl = document.getElementById("imageInput");

    const payload = {
      prompts,
      character: null,
      image: null
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
     LOGGING FROM CONTENT SCRIPT
  ---------------------------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "FLOW_LOG") {
      log(msg.message);
    }
  });

  log("Side panel JS loaded.");
});
