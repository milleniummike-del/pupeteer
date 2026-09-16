document.addEventListener("DOMContentLoaded", () => {;
  const runBtn = document.getElementById("run");
  const logEl = document.getElementById("log");

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
     RUN QUEUE
  ---------------------------- */
  runBtn.addEventListener("click", async () => {

    //const textInputEl = document.getElementById("textInput");

    const payload = {
      prompts:[{"item":"1"}]
    };

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
