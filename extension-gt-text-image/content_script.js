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

// ======================================================
// SELECTORS
// ======================================================
const SELECTORS = {
  editor: ".ProseMirror",

  media: `
    div[data-testid="gallery"] img,
    div[data-testid="gallery"] video,
    div[data-testid="result-pane"] img,
    div[data-testid="result-pane"] video,
    div[data-testid="inline-result"] img,
    div[data-testid="inline-result"] video
  `,

  generateBtn: ".generate-icon-button",

  tabTextToVideo: 'button[data-testid="tab-text-to-video"]',
  tabTextToImage: 'button[data-testid="tab-text-to-image"]',
  tabImageToImage: 'button[data-testid="tab-image-to-image"]',
  tabFrameToVideo: 'button[data-testid="tab-frame-to-video"]',
  tabIngredientsToVideo: 'button[data-testid="tab-ingredients-to-video"]',

  modelDropdown: '[data-testid="model-selector"]',
  modelVeo2: 'li[data-value="veo-2"]',
  modelVeo1: 'li[data-value="veo-1"]',

  aspectDropdown: '[data-testid="aspect-ratio-selector"]',
  aspect169: 'li[data-value="16:9"]',
  aspect916: 'li[data-value="9:16"]',
  aspect11: 'li[data-value="1:1"]'
};

// ======================================================
// EDITOR TYPING
// ======================================================
async function typeIntoFlowTextarea(text) {
  const el = document.querySelector('textarea');
  if (!el) throw new Error("Flow textarea not found.");

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
// BASE FILENAME EXTRACTION
// ======================================================
function extractBaseFilename(promptText, fallbackBaseFilename) {
  try {
    const obj = JSON.parse(promptText);
    if (obj && typeof obj === "object" && obj.tag) {
      return obj.tag;
    }
  } catch (e) {}

  if (fallbackBaseFilename && fallbackBaseFilename.trim() !== "") {
    return fallbackBaseFilename.trim();
  }

  return "Unknown-" + Date.now();
}

// ======================================================
// QUEUE RUNNER
// ======================================================
async function runQueue({ prompts }) {

  panelLog(`Content script: received queue (${prompts.length} prompts).`);

  // Load fallback base filename from storage
  const storage = await chrome.storage.local.get(["baseFilename"]);
  const fallbackBaseFilename = storage.baseFilename ?? "";

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    const baseFilename = extractBaseFilename(prompt, fallbackBaseFilename);

    chrome.runtime.sendMessage({
      type: "FLOW_SET_BASE_FILENAME",
      baseFilename
    });

    panelLog(`Prompt ${i + 1}/${prompts.length}: baseFilename=${baseFilename}`);

    try {
      await typeIntoFlowTextarea(prompt);
      panelLog("Prompt typed into textarea.");

      SELECTORS.createBtn = 'button[aria-label="Create"]';

      async function safeClickCreate() {
        const btn = document.querySelector(SELECTORS.createBtn);
        if (!btn) throw new Error("Create button not found.");

        btn.focus();
        btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        btn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }

      await sleep(500);
      await safeClickCreate();
      panelLog("Create button clicked.");

      await sleep(12000);

    } catch (err) {
      panelLog(`Error on prompt ${i + 1}: ${err.message}`);
    }
  }

  panelLog("Queue finished.");
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
});

// ======================================================
// DEDUPE HASHING
// ======================================================
const seenBase64Hashes = new Set();

function hashBase64(base64) {
  let hash = 0;
  for (let i = 0; i < base64.length; i++) {
    hash = (hash * 31 + base64.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ======================================================
// DATA URL HANDLING
// ======================================================
function handleDataUrl(url) {
  if (!url.startsWith("data:image") && !url.startsWith("data:video")) return;

  const mime = url.slice(5, url.indexOf(";"));
  const ext = mime.split("/")[1] || "bin";

  const base64 = url.split(",")[1] || "";
  const hash = hashBase64(base64);

  if (seenBase64Hashes.has(hash)) {
    debugLog("Duplicate skipped (content hash)");
    return;
  }

  seenBase64Hashes.add(hash);

  chrome.runtime.sendMessage({
    type: "FLOW_DOWNLOAD_DATA_URL",
    url,
    ext
  });
}

// ======================================================
// UNIVERSAL MEDIA DETECTOR
// ======================================================
const seenSrc = new WeakMap();

function detect(el) {
  if (!el) return;

  if (el.tagName === "IMG" && el.src) {
    const last = seenSrc.get(el);
    if (el.src !== last) {
      seenSrc.set(el, el.src);
      if (el.src.startsWith("data:")) handleDataUrl(el.src);
    }
  }

  if (el.tagName === "VIDEO" && el.poster) {
    const last = seenSrc.get(el);
    if (el.poster !== last) {
      seenSrc.set(el, el.poster);
      if (el.poster.startsWith("data:")) handleDataUrl(el.poster);
    }
  }

  const bg = el.style?.backgroundImage || "";
  if (bg.includes("data:")) {
    const match = bg.match(/url\("(data:[^"]+)/);
    if (match) handleDataUrl(match[1]);
  }
}

function scanDeep(root) {
  if (!root) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    detect(node);

    if (node.shadowRoot) {
      scanDeep(node.shadowRoot);
    }
  }
}

setInterval(() => {
  scanDeep(document.documentElement);
}, 300);

console.log("Content script loaded.");
panelLog("Content script loaded.");
