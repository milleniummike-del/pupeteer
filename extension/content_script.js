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

async function waitForGenerateEnabled(timeout = 30000) {
  const start = performance.now();
  while (true) {
    const btn = document.querySelector(SELECTORS.generateBtn);
    if (btn && !btn.classList.contains("mat-mdc-button-disabled")) {
      return btn;
    }
    if (performance.now() - start > timeout) {
      throw new Error("Generate button did not become enabled.");
    }
    await sleep(300);
  }
}

// ======================================================
// NEW MEDIA DETECTOR (bulletproof)
// ======================================================
async function waitForNewMedia(previousSet, timeout = 60000) {
  const start = performance.now();

  while (true) {
    const current = Array.from(document.querySelectorAll(SELECTORS.media));

    // Find element not in previous set
    const newItem = current.find(el => !previousSet.includes(el));
    if (newItem) return newItem;

    if (performance.now() - start > timeout) {
      throw new Error("Render did not finish in time.");
    }

    await sleep(500);
  }
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

// ======================================================
// DOWNLOAD URL EXTRACTOR
// ======================================================
function getDownloadUrlFromMedia(el) {
  const link = el.querySelector("a[href]");
  if (link) return link.href;

  const video = el.querySelector("video[src]");
  if (video) return video.src;

  const img = el.querySelector("img[src]");
  if (img) return img.src;

  return null;
}

// ======================================================
// MODE / MODEL / ASPECT SWITCHING
// ======================================================
async function setMode(mode) {
  const map = {
    "text-video": SELECTORS.tabTextToVideo,
    "text-image": SELECTORS.tabTextToImage,
    "image-image": SELECTORS.tabImageToImage,
    "frame-video": SELECTORS.tabFrameToVideo,
    "ingredients-video": SELECTORS.tabIngredientsToVideo
  };

  const selector = map[mode];
  const btn = document.querySelector(selector);

  if (btn) {
    btn.click();
    panelLog(`Mode switched to ${mode}.`);
    await sleep(500);
  } else {
    panelLog(`Mode button not found for ${mode}.`);
  }
}

async function setModel(model) {
  const dropdown = document.querySelector(SELECTORS.modelDropdown);
  if (!dropdown) return panelLog("Model dropdown not found.");

  dropdown.click();
  await sleep(300);

  const option = document.querySelector(
    model === "veo-2" ? SELECTORS.modelVeo2 : SELECTORS.modelVeo1
  );

  if (option) {
    option.click();
    panelLog(`Model set to ${model}.`);
    await sleep(300);
  } else {
    panelLog(`Model option not found for ${model}.`);
  }
}

async function setAspect(aspect) {
  const dropdown = document.querySelector(SELECTORS.aspectDropdown);
  if (!dropdown) return panelLog("Aspect dropdown not found.");

  dropdown.click();
  await sleep(300);

  const map = {
    "16:9": SELECTORS.aspect169,
    "9:16": SELECTORS.aspect916,
    "1:1": SELECTORS.aspect11
  };

  const option = document.querySelector(map[aspect]);
  if (option) {
    option.click();
    panelLog(`Aspect ratio set to ${aspect}.`);
    await sleep(300);
  } else {
    panelLog(`Aspect option not found for ${aspect}.`);
  }
}

// ======================================================
// CORE QUEUE RUNNER (patched)
// ======================================================
async function runQueue({ prompts, mode, aspect, model }) {
  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  debugLog("Queue payload:", { prompts, mode, aspect, model });

  await setMode(mode);
  await setModel(model);
  await setAspect(aspect);

  const editor = await waitForSelector(SELECTORS.editor);
  panelLog("Editor found.");

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {
      // Capture existing media
      const previousMedia = Array.from(document.querySelectorAll(SELECTORS.media));

      // Type prompt
      await safeTypeIntoEditor(editor, prompt);
      panelLog("Prompt typed into editor.");

      // Wait for generate button
      const generateBtn = await waitForGenerateEnabled();
      highlight(generateBtn);
      panelLog("Generate button enabled.");

      // Click generate
      generateBtn.click();
      panelLog("Generate clicked, waiting for render...");

      // Scroll to ensure Flow loads media
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(300);

      // Wait for new media
      const mediaEl = await waitForNewMedia(previousMedia);
      panelLog("New render detected.");
      highlight(mediaEl);

      // Extract download URL
      const url = getDownloadUrlFromMedia(mediaEl);
      if (!url) {
        panelLog("No download URL found.");
        continue;
      }

      const filenameSafe = prompt.replace(/[^\w\d\-]+/g, "_").slice(0, 40);
      const ext = url.includes(".mp4") ? ".mp4" :
                  url.includes(".webm") ? ".webm" : ".png";

      const filename = `flow-veo/${i + 1}_${filenameSafe}${ext}`;
      panelLog(`Downloading: ${filename}`);

      chrome.runtime.sendMessage(
        { type: "FLOW_DOWNLOAD", url, filename },
        resp => {
          if (resp && resp.ok) {
            panelLog(`Download started (id: ${resp.downloadId}).`);
          } else {
            panelLog("Download failed.");
          }
        }
      );

      await sleep(1500);

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
