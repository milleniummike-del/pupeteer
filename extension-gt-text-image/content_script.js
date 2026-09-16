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

  const range = document.createRange();
  range.selectNodeContents(editorEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand("delete");

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

  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;
  setter.call(el, text);

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ======================================================
// CORE QUEUE RUNNER
// ======================================================
async function runQueue({ prompts }) {

  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  panelLog("Queue payload:", { prompts });

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

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

      try {
        await safeClickCreate();
        panelLog("Create button clicked.");
      } catch (err) {
        panelLog("Create click failed: " + err.message);
      }

      await sleep(12000);

    } catch (err) {
      panelLog(`Error on prompt ${i + 1}: ${err.message}`);
      debugLog("Error:", err);
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

  if (msg.type === "FLOW_MEDIA_DETECTED") {
    panelLog(`Media detected: ${msg.url} (ext: ${msg.ext})`);

    /*
    chrome.runtime.sendMessage({
      type: "FLOW_DOWNLOAD",
      url: msg.url,
      ext: msg.ext
    });

    */
  }
});

// Cache of seen base64 hashes
const seenBase64Hashes = new Set();

// Fast hash function for base64 strings
function hashBase64(base64) {
  let hash = 0;
  for (let i = 0; i < base64.length; i++) {
    hash = (hash * 31 + base64.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function handleDataUrl(url) {
  if (!url.startsWith("data:image") && !url.startsWith("data:video")) return;

  // Extract MIME → extension
  const mime = url.slice(5, url.indexOf(";"));
  const ext = mime.split("/")[1] || "bin";

  // Extract base64 payload
  const base64 = url.split(",")[1] || "";
  const hash = hashBase64(base64);

  // Duplicate check
  if (seenBase64Hashes.has(hash)) {
    debugLog("Duplicate data URL skipped (hash match)");
    return; // ⭐ Skip sending to background
  }

  // Mark as seen
  seenBase64Hashes.add(hash);

  panelLog(`Data URL detected (${ext})`);

  chrome.runtime.sendMessage({
    type: "FLOW_DOWNLOAD_DATA_URL",
    url,
    ext
  });
}


// ======================================================
// UNIVERSAL MEDIA DETECTOR (FINAL WORKING VERSION)
// ======================================================

// Track last-seen src/poster values
const seen = new WeakMap();

function detect(el) {
  if (!el) return;

  // IMG
  if (el.tagName === "IMG" && el.src) {
    const last = seen.get(el);
    if (el.src !== last) {
      seen.set(el, el.src);
      if (el.src.startsWith("data:")) handleDataUrl(el.src);
    }
  }

  // VIDEO poster
  if (el.tagName === "VIDEO" && el.poster) {
    const last = seen.get(el);
    if (el.poster !== last) {
      seen.set(el, el.poster);
      if (el.poster.startsWith("data:")) handleDataUrl(el.poster);
    }
  }

  // background-image
  const bg = el.style?.backgroundImage || "";
  if (bg.includes("data:")) {
    const match = bg.match(/url\("(data:[^"]+)/);
    if (match) handleDataUrl(match[1]);
  }
}

// Deep scan shadow DOM
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

// Poll every 300ms
setInterval(() => {
  scanDeep(document.documentElement);
}, 300);

// ======================================================
// INITIAL LOG
// ======================================================
console.log("Content script loaded.");
panelLog("Content script loaded.");
