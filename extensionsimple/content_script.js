function panelLog(message) {
  chrome.runtime.sendMessage({ type: "FLOW_LOG", message });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function highlight(el) {
  if (!DEBUG || !el) return;
  el.style.outline = "2px solid #22c55e";
  el.style.outlineOffset = "2px";
}

// Wait helper
function waitForSelector(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    function check() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (performance.now() - start > timeout)
        return reject(new Error(`Timeout waiting for ${selector}`));
      requestAnimationFrame(check);
    }
    check();
  });
}

// Editor typing
async function safeTypeIntoEditor(editorEl, text) {
  highlight(editorEl);
  editorEl.focus();

  document.execCommand("selectAll", false, null);
  document.execCommand("delete", false, null);

  await sleep(50);

  const chunkSize = 120;
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    document.execCommand("insertText", false, chunk);
    await sleep(40);
  }
}

// Queue runner
async function runQueue({ prompts }) {
  panelLog("Queue started");

  for (let i = 0; i < 5; i++) {
    panelLog(`Item ${i + 1}`);
  }

  panelLog("Queue finished.");
}

// Message handlers
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FLOW_RUN_QUEUE") {
    runQueue(msg.payload);
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "FLOW_MEDIA_DETECTED") {
    panelLog(`Media detected: ${msg.url} (ext: ${msg.ext})`);

    chrome.runtime.sendMessage({
      type: "FLOW_DOWNLOAD",
      url: msg.url,
      ext: msg.ext
    });
  }
});

console.log("Content script loaded.");
panelLog("Content script loaded.");
