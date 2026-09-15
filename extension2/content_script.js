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
// SELECTORS (patched)
// ======================================================
const SELECTORS = {
  editor: ".ProseMirror",

  // Unified media selector (ALL render locations)
  media: `
    div[data-testid="gallery"] img,
    div[data-testid="gallery"] video,
    div[data-testid="result-pane"] img,
    div[data-testid="result-pane"] video,
    div[data-testid="inline-result"] img,
    div[data-testid="inline-result"] video
  `,

  generateBtn: ".generate-icon-button",

  // Mode selectors
  tabTextToVideo: 'button[data-testid="tab-text-to-video"]',
  tabTextToImage: 'button[data-testid="tab-text-to-image"]',
  tabImageToImage: 'button[data-testid="tab-image-to-image"]',
  tabFrameToVideo: 'button[data-testid="tab-frame-to-video"]',
  tabIngredientsToVideo: 'button[data-testid="tab-ingredients-to-video"]',

  // Model selectors
  modelDropdown: '[data-testid="model-selector"]',
  modelVeo2: 'li[data-value="veo-2"]',
  modelVeo1: 'li[data-value="veo-1"]',

  // Aspect ratio selectors
  aspectDropdown: '[data-testid="aspect-ratio-selector"]',
  aspect169: 'li[data-value="16:9"]',
  aspect916: 'li[data-value="9:16"]',
  aspect11: 'li[data-value="1:1"]'
};

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
// EDITOR TYPING
// ======================================================
async function safeTypeIntoEditor(editorEl, text, chunkSize = 120, delay = 40) {
  debugLog("Typing into editor:", text);
  highlight(editorEl);

  editorEl.focus();

  // Clear existing content
  const range = document.createRange();
  range.selectNodeContents(editorEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand("delete");

  // Chunked typing (Flow-safe)
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    document.execCommand("insertText", false, chunk);
    await sleep(delay);
  }
}


async function typeIntoFlowTextarea(text) {
  const el = document.querySelector('textarea');
  if (!el) throw new Error("Flow textarea not found.");

  el.focus();

  // React-compatible value setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;
  nativeInputValueSetter.call(el, text);

  // Fire React synthetic events
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));

  // Extra events Flow listens for
  el.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: text }));
  el.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
  el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter" }));
  el.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
  el.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
}


function deepScanForTextarea() {
  const results = [];

  function scan(node) {
    if (!node) return;

    // Check node itself
    if (node.tagName === "TEXTAREA") {
      results.push(node);
    }

    // Check shadow root
    if (node.shadowRoot) {
      scan(node.shadowRoot);
    }

    // Scan children
    node.childNodes.forEach(child => scan(child));
  }

  scan(document);

  return results;
}

// ======================================================
// CORE QUEUE RUNNER (patched)
// ======================================================
async function runQueue({ prompts, mode, aspect, model }) {


  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  panelLog("Queue payload:", { prompts });

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

   try {

await typeIntoFlowTextarea(prompt);
panelLog("Prompt typed into textarea.");

// Add selector
SELECTORS.createBtn = 'button[aria-label="Create"]';

// Safe click helper
async function safeClickCreate() {
  const btn = document.querySelector(SELECTORS.createBtn);
  if (!btn) throw new Error("Create button not found.");

  btn.focus();
  btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
  btn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
  btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

// Patch inside runQueue
await typeIntoFlowTextarea(prompt);
panelLog("Prompt typed into textarea.");

await sleep(500);

try {
  await safeClickCreate();
  panelLog("Create button clicked.");
} catch (err) {
  panelLog("Create click failed: " + err.message);
}

await sleep(12000);


} 
 catch (err) {
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
