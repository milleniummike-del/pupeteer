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
// IMAGE DISCOVERY (non-numeric, wildcard scan)
// ======================================================
async function discoverImages() {
  const exts = ["webp", "png", "jpg", "jpeg"];
  const candidates = [];

  // Try up to 200 possible filenames
  // We cannot list directory contents, so we brute-force probe
  for (let i = 0; i < 200; i++) {
    for (const ext of exts) {
      const url = chrome.runtime.getURL(`inputimages/${i}.${ext}`);
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          candidates.push(url);
        }
      } catch (e) {}
    }
  }

  // Also probe common non-numeric names
  const commonNames = [
    "frame", "image", "shot", "pic", "photo", "still", "input", "source"
  ];

  for (const name of commonNames) {
    for (const ext of exts) {
      const url = chrome.runtime.getURL(`inputimages/${name}.${ext}`);
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          candidates.push(url);
        }
      } catch (e) {}
    }
  }

  // Remove duplicates
  const unique = [...new Set(candidates)];

  panelLog(`Discovered ${unique.length} images in inputimages/`);
  unique.forEach(u => panelLog(`Image: ${u}`));

  return unique;
}

// ======================================================
// IMAGE UPLOAD (cycles through discovered images)
// ======================================================
async function uploadImageFromList(imageList, index) {
  const fileInput = await waitForSelector('input[type="file"]');

  // If index exceeds list, reuse last image
  const useUrl = index < imageList.length ? imageList[index] : imageList[imageList.length - 1];

  const blob = await fetch(useUrl).then(r => r.blob());
  const file = new File([blob], useUrl.split("/").pop(), { type: blob.type });

  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;

  fileInput.dispatchEvent(new Event("change", { bubbles: true }));

  panelLog(`Uploaded image: ${useUrl}`);
}

// ======================================================
// CLICK CONFIGURE BUTTON
// ======================================================
async function clickConfigure(frameIndex) {
  const label = `Frame ${frameIndex} ·`;

  // Wait until the frame label exists
  await waitForSelector("span");

  const span = [...document.querySelectorAll("span")]
    .find(el => el.textContent.trim().startsWith(label));

  if (!span) {
    throw new Error(`Could not find frame label: ${label}`);
  }

  // Flow’s frame card container
  const card = span.closest(".relative.w-44");
  if (!card) {
    throw new Error(`Could not find card container for ${label}`);
  }

  // Find Configure inside this card only
  const btn = [...card.querySelectorAll("button")]
    .find(b => b.textContent.trim() === "Configure");

  if (!btn) {
    throw new Error(`Configure button not found for ${label}`);
  }

  highlight(btn);
  btn.click();
  panelLog(`Clicked Configure for ${label}`);
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

  // Discover all images in inputimages/
  const imageList = await discoverImages();
  if (imageList.length === 0) {
    panelLog("ERROR: No images found in inputimages/");
    return;
  }

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {
      // 1. Upload image (cycling)
      await uploadImageFromList(imageList, i);
      await sleep(3000);

    } catch (err) {
      panelLog(`Error on prompt ${i + 1}: ${err.message}`);
      debugLog("Error:", err);
    }
  }

   for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {

      // 2. Click Configure
      await clickConfigure(i+1);
      await sleep(1000);

      // 3. Inject prompt
      await injectPrompt(prompt);
      await sleep(500);

      // 4. Click Done
      await clickDone();
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
