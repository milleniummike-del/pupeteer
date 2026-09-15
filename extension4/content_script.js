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
  const url = chrome.runtime.getURL(`inputimages/${name}.jpeg`);
  try {
    const blob = await fetch(url).then(r => r.blob());
    const file = new File([blob], url.split("/").pop(), { type: blob.type });

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;

    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    panelLog(`Uploaded image: ${url}`);
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

// ======================================================
// CLICK EDIT IMAGE
// ======================================================
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

  let btn = findInRoot(document);
  if (btn) {
    highlight(btn);
    btn.click();
    panelLog("Clicked Edit Image (main document).");
    return;
  }

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
    } catch (e) {}
  }

  panelLog("Edit Image button not found.");
  throw new Error("Edit Image button not found.");
}

// ======================================================
// TAG EXTRACTION
// ======================================================
function extractTags(text) {
  const characters = [];
  const images = [];

  let i = 0;
  while (i < text.length) {
    const start = text.indexOf("[", i);
    if (start === -1) break;

    const end = text.indexOf("]", start + 1);
    if (end === -1) break;

    const inside = text.slice(start + 1, end);
    const parts = inside.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(":").trim();

      if (key === "character") characters.push(value);
      else if (key === "image") images.push(value);
    }

    i = end + 1;
  }

  return {
    characters: [...new Set(characters)],
    images: [...new Set(images)]
  };
}

// ======================================================
// TYPE INTO FLOW TEXTAREA
// ======================================================
async function typeIntoFlowTextarea(text) {
  const el = document.querySelector('textarea[placeholder="Describe the change"]');
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
// DELETE IMAGE THUMBNAILS
// ======================================================
async function clickImageDeleteIfExists() {
  const thumbs = document.querySelectorAll(".relative.h-16.w-16, .relative.h-full.w-full");

  if (!thumbs.length) {
    panelLog("No thumbnails found.");
    return false;
  }

  for (const thumb of thumbs) {
    const deleteBtn = thumb.querySelector("button[class*='absolute'], svg[class*='absolute']");
    if (deleteBtn) {
      highlight(deleteBtn);
      deleteBtn.click();
      panelLog("Clicked delete button.");
      await sleep(1500);
      return true;
    }
  }

  panelLog("No delete button found.");
  return false;
}

// ======================================================
// FULL QUEUE RESUME SYSTEM
// ======================================================
async function runQueue({ prompts, startIndex = 0 }) {
  panelLog(`Queue starting at index ${startIndex}/${prompts.length}`);

  for (let i = startIndex; i < prompts.length; i++) {
    const prompt = prompts[i];

    // Save state before each prompt
    localStorage.setItem("flow_queue_state", JSON.stringify({
      prompts,
      index: i
    }));

    // Reload command
    if (prompt === "__RELOAD__") {
      panelLog("Reloading page...");
      location.reload();
      return;
    }

    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    const result = extractTags(prompt);

    for (let j = 0; j < result.images.length; j++) {
      const s = result.images[j];
      try {
        await sleep(2000);
        await uploadImageFromName(s);
        await sleep(1000);
        await clickEditImage();
        await sleep(1000);
      } catch (err) {
        panelLog(`Error on prompt ${i + 1}: ${err.message}`);
        debugLog("Error:", err);
      }
    }

    await typeIntoFlowTextarea(prompt);
    panelLog("Prompt typed.");

    await sleep(6000);
    panelLog("Reloading page after prompt...");
localStorage.setItem("flow_queue_state", JSON.stringify({
  prompts,
  index: i + 1
}));
location.reload();
return;

  }

  panelLog("Queue finished.");
  localStorage.removeItem("flow_queue_state");
}

// ======================================================
// AUTO-RESUME AFTER RELOAD
// ======================================================
window.addEventListener("load", () => {
  const state = localStorage.getItem("flow_queue_state");
  if (!state) return;

  const { prompts, index } = JSON.parse(state);

  panelLog(`Resuming queue after reload at index ${index}...`);

  runQueue({ prompts, startIndex: index });
});

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
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "FLOW_RELOAD_PAGE") {
    location.reload();
  }
});

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
