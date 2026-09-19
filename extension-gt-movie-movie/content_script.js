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


async function injectPrompt(prompt) {
  // Find the Magic Edit input (placeholder varies, classes do not)
  const el = await waitForSelector("input.min-w-0.flex-1.rounded-lg");

  // React‑safe value setter
  const setter = Object.getOwnPropertyDescriptor(el.__proto__, "value").set;
  setter.call(el, prompt);

  // Notify React / UI
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  // Press Enter
  el.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true
  }));

  el.dispatchEvent(new KeyboardEvent("keyup", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true
  }));

  panelLog("Injected prompt and pressed Enter.");
}


// ======================================================
// CLICK DONE
// ======================================================
async function clickApplyEdit() {

const btns = document.querySelectorAll("button[aria-label='Apply edit']");
  const btn = btns[0];

   if (!btn) throw new Error("Apply Edit button not found.");

  highlight(btn);
  btn.click();
   panelLog("Clicked Apply Edit.");
}

async function clickEdit() {
  const btns = document.querySelectorAll("button[aria-label='Magic Edit']");
  const btn = btns[0];

  if (!btn) throw new Error("Magic Edit button not found.");

  highlight(btn);
  btn.click();
  panelLog("Clicked Magic Edit.");
}


// ======================================================
// CORE QUEUE RUNNER (FINAL VERSION)
// ======================================================
async function runQueue({ prompts }) {

  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  panelLog("Queue payload:", { prompts });

   for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {

      await clickEdit();
      await sleep(1000);

      await injectPrompt(prompt);
      await sleep(1000);
      await clickApplyEdit();
      await sleep(35000);

    } catch (err) {
      panelLog(`Error on prompt ${i + 1}: ${err.message}`);
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
