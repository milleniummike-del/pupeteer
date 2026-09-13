// ======================================================
// DEBUG MODE
// ======================================================
let DEBUG = false;

function debugLog(...args) {
  if (DEBUG) console.log("%c[Flow Debug]", "color:#60a5fa;font-weight:bold;", ...args);
}

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

// ======================================================
// WAIT HELPERS
// ======================================================
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

// ======================================================
// REACT-SAFE TEXTAREA TYPING
// ======================================================
async function reactSafeType(el, text) {
  if (!el) throw new Error("Textarea not found.");

  el.focus();

  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;

  setter.call(el, text);

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ======================================================
// IMAGE UPLOAD (extension local file)
// ======================================================
async function uploadImageFromExtension(index) {
  const fileInput = await waitForSelector('input[type="file"]');

  const fileUrl = chrome.runtime.getURL(`inputimages/${index}.webp`);
  const blob = await fetch(fileUrl).then(r => r.blob());
  const file = new File([blob], `${index}.webp`, { type: blob.type });

  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;

  fileInput.dispatchEvent(new Event("change", { bubbles: true }));

  panelLog(`Uploaded image: ${index}.png`);
}

// ======================================================
// CLICK CONFIGURE BUTTON
// ======================================================
async function clickConfigure() {
  await waitForSelector("button");

  const configureBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim() === "Configure");

  if (!configureBtn) throw new Error("Configure button not found.");

  highlight(configureBtn);
  configureBtn.click();
  panelLog("Clicked Configure.");
}

// ======================================================
// TYPE PROMPT INTO CONFIGURE FIELD
// ======================================================
async function injectPrompt(prompt) {
  const cfgTextarea = await waitForSelector("textarea.input-field");
  highlight(cfgTextarea);

  await reactSafeType(cfgTextarea, prompt);

  panelLog("Injected prompt into configure field.");
}

// ======================================================
// CLICK DONE
// ======================================================
async function clickDone() {
  const doneBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim() === "Done");

  if (!doneBtn) throw new Error("Done button not found.");

  highlight(doneBtn);
  doneBtn.click();
  panelLog("Clicked Done.");
}

// ======================================================
// CORE QUEUE RUNNER (FINAL VERSION)
// ======================================================
async function runQueue({ prompts }) {

  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  panelLog("Queue payload:", { prompts });

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const frameIndex = i + 1;

    panelLog(`Prompt ${frameIndex}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {
      // 1. Upload image
      await uploadImageFromExtension(frameIndex);
      await sleep(3000);

      // 2. Click Configure
      await clickConfigure();
      await sleep(1000);

      // 3. Inject prompt
      await injectPrompt(prompt);
      await sleep(500);

      // 4. Click Done
      await clickDone();
      await sleep(1500);

    } catch (err) {
      panelLog(`Error on prompt ${frameIndex}: ${err.message}`);
      debugLog("Error:", err);
    }
  }

  panelLog("Queue finished.");
}

// ======================================================
// SELECTOR TEST HARNESS
// ======================================================
function runFlowSelectorTests() {
  if (!DEBUG) {
    panelLog("Enable debug mode to run selector tests.");
    return;
  }

  const results = [];
  const SELECTORS = {
    fileInput: 'input[type="file"]',
    configureBtn: 'button',
    cfgTextarea: 'textarea.input-field',
    doneBtn: 'button'
  };

  for (const [name, selector] of Object.entries(SELECTORS)) {
    const nodes = document.querySelectorAll(selector);
    results.push({ name, selector, count: nodes.length, nodes });
  }

  console.group("%cSelector Test Harness", "color:#22c55e;font-size:16px;");
  results.forEach(r => {
    const color =
      r.count === 0 ? "color:#ef4444" :
      r.count === 1 ? "color:#22c55e" :
      "color:#eab308";

    console.groupCollapsed(`%c${r.name} → ${r.selector}`, color);
    console.log("Matches:", r.count);
    console.log("Nodes:", r.nodes);
    console.groupEnd();
  });
  console.groupEnd();

  panelLog("Selector test completed.");
}

// ======================================================
// MESSAGE HANDLERS
// ======================================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FLOW_RUN_QUEUE") {
    runQueue(msg.payload);
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "FLOW_DEBUG_ON") {
    DEBUG = true;
    panelLog("Debug mode enabled.");
  }

  if (msg.type === "FLOW_DEBUG_OFF") {
    DEBUG = false;
    panelLog("Debug mode disabled.");
  }

  if (msg.type === "FLOW_TEST_SELECTORS") {
    runFlowSelectorTests();
  }
});

// Initial log
console.log("Content script loaded.");
panelLog("Content script loaded.");
