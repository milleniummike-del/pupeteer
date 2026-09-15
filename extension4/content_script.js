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

async function uploadImageFromName(name) {
  panelLog(name);
  const fileInput = await waitForSelector('input[type="file"]');
  const url = chrome.runtime.getURL(`inputimages/${name}`);
  try {
    const blob = await fetch(url).then(r => r.blob());
    const file = new File([blob], url.split("/").pop(), { type: blob.type });

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;

    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    panelLog(`Uploaded image: ${useUrl}`);
  } catch (e) { }


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

async function clickEditImage() {
  panelLog("Searching for Edit Image button...");

  function normalize(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function findInRoot(root) {
    const buttons = [...root.querySelectorAll("button")];

    for (const b of buttons) {
      const txt = normalize(b.textContent);
      if (txt.includes("Edit this image")) {
        return b;
      }
    }
    return null;
  }

  // 1. Main document
  let btn = findInRoot(document);
  if (btn) {
    highlight(btn);
    btn.click();
    panelLog("Clicked Edit Image (main document).");
    return;
  }

  // 2. Shadow DOMs
  const allElements = [...document.querySelectorAll("*")];
  for (const el of allElements) {
    if (el.shadowRoot) {
      btn = findInRoot(el.shadowRoot);
      if (btn) {
        highlight(btn);
        btn.click();
        panelLog("Clicked Edit Image (shadow DOM).");
        return;
      }
    }
  }

  // 3. Same-origin iframes
  const iframes = [...document.querySelectorAll("iframe")];
  for (const frame of iframes) {
    try {
      const doc = frame.contentDocument;
      if (!doc) continue;

      btn = findInRoot(doc);
      if (btn) {
        highlight(btn);
        btn.click();
        panelLog("Clicked Edit Image (iframe).");
        return;
      }

      // Check shadow roots inside iframe
      const iframeEls = [...doc.querySelectorAll("*")];
      for (const el of iframeEls) {
        if (el.shadowRoot) {
          btn = findInRoot(el.shadowRoot);
          if (btn) {
            highlight(btn);
            btn.click();
            panelLog("Clicked Edit Image (iframe shadow DOM).");
            return;
          }
        }
      }
    } catch (e) {
      // cross-origin iframe, ignore
    }
  }

  // If we reach here, nothing was found
  panelLog("Edit Image button not found in any reachable DOM.");
  throw new Error("Edit Image button not found.");
}

function extractTags(text) {
  const characters = [];
  const images = [];

  let i = 0;
  while (i < text.length) {
    const start = text.indexOf("[", i);
    if (start === -1) break;

    const end = text.indexOf("]", start + 1);
    if (end === -1) break;

    const inside = text.slice(start + 1, end); // e.g. "Character: Fred"
    const parts = inside.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim().toLowerCase();   // "character" or "scene"
      const value = parts.slice(1).join(":").trim(); // rest after first colon

      if (key === "character") {
        characters.push(value);
      } else if (key === "image") {
        images.push(value);
      }
    }

    i = end + 1;
  }

  // Deduplicate
  return {
    characters: [...new Set(characters)],
    images: [...new Set(images)]
  };
}


// ======================================================
// CORE QUEUE RUNNER (FINAL VERSION)
// ======================================================
async function runQueue({ prompts }) {

  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  panelLog("Queue payload:", { prompts });

  // Discover all images in inputimages/
  /*
  const imageList = await discoverImages();
  if (imageList.length === 0) {
    panelLog("ERROR: No images found in inputimages/");
    return;
  }
  */

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    const result = extractTags(prompt);

    for (let i = 0; i < result.images.length; i++) {
      const s = result.images[i];
      try {
        await uploadImageFromName(s);
        await clickEditImage();
        await sleep(1000);

      } catch (err) {
        panelLog(`Error on prompt ${i + 1}: ${err.message}`);
        debugLog("Error:", err);
      }

      await sleep(1000);
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
