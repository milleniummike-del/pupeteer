document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("run");
  const logEl = document.getElementById("log");
  const toggleDownload = document.getElementById("toggleDownload");
  const extCheckboxes = document.querySelectorAll(".extFilter");

  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    logEl.textContent += `[${ts}] ${msg}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  // Load settings
  chrome.storage.local.get(["autoDownloadEnabled", "allowedExtensions"], data => {
    toggleDownload.checked = data.autoDownloadEnabled ?? true;

    const allowed = data.allowedExtensions ?? ["png","jpg","webp","mp4","webm"];
    extCheckboxes.forEach(cb => {
      cb.checked = allowed.includes(cb.value);
    });
  });

  // Save toggle
  toggleDownload.addEventListener("change", () => {
    chrome.storage.local.set({ autoDownloadEnabled: toggleDownload.checked });
    log(`Auto-download: ${toggleDownload.checked}`);
  });

  // Save extension filters
  extCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const allowed = Array.from(extCheckboxes)
        .filter(x => x.checked)
        .map(x => x.value);

      chrome.storage.local.set({ allowedExtensions: allowed });
      log(`Allowed extensions: ${allowed.join(", ")}`);
    });
  });

  // Get active tab
  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });
    return tab;
  }

  // Run queue
  runBtn.addEventListener("click", async () => {
    const payload = { prompts: [{ item: "1" }] };

    runBtn.disabled = true;
    log(`Starting queue`);

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

  // Logging from content script
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "FLOW_LOG") {
      log(msg.message);
    }
  });

  log("Side panel JS loaded.");
});
