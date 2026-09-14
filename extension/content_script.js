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
// GLOBAL CHARACTER (set dynamically from side panel)
// ======================================================
let GLOBAL_CHARACTER = null;

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
// MEDIA DETECTOR
// ======================================================
async function waitForNewMedia(previousSet, timeout = 60000) {
  const start = performance.now();

  while (true) {
    const current = Array.from(document.querySelectorAll(SELECTORS.media));
    const newItem = current.find(el => !previousSet.includes(el));
    if (newItem) return newItem;

    if (performance.now() - start > timeout) {
      throw new Error("Render did not finish in time.");
    }

    await sleep(500);
  }
}

async function clickCharactersFilter() {
  panelLog("Clicking Characters filter...");

  // 1. Find Angular CDK overlay container
  const overlay = document.querySelector(".cdk-overlay-container");
  if (!overlay) {
    panelLog("CDK overlay container not found.");
    return false;
  }

  // 2. Find all overlay panes
  const panes = [...overlay.querySelectorAll(".cdk-overlay-pane")];

  // 3. Find the pane that contains the side nav list
  const sideNavPane = panes.find(pane =>
    pane.querySelector("mat-nav-list") ||
    pane.querySelector(".side-nav-list")
  );

  if (!sideNavPane) {
    panelLog("Side nav pane not found inside CDK overlays.");
    return false;
  }

  // 4. Find all tabs inside the overlay pane
  const tabs = [...sideNavPane.querySelectorAll('[role="tab"]')];

  // 5. Find the Characters tab
  const charactersTab = tabs.find(el => {
    const title = el.querySelector(".side-nav-list-item-title");
    const text = (title ? title.textContent : el.textContent) || "";
    return text.trim().toLowerCase() === "characters";
  });

  if (!charactersTab) {
    panelLog("Characters tab not found inside overlay pane.");
    return false;
  }

  // 6. Click the actual clickable element
  const clickable = charactersTab.querySelector(".mdc-list-item__content") || charactersTab;

  clickable.scrollIntoView({ block: "center" });
  highlight(clickable);

  clickable.click();

  await sleep(500);

  panelLog("Characters filter clicked (CDK overlay).");
  return true;
}



// ======================================================
// EDITOR TYPING (stable across all prompts)
// ======================================================
async function safeTypeIntoEditor(editorEl, text) {
  debugLog("Typing into editor:", text);
  highlight(editorEl);

  editorEl.focus();

  // Clear existing content safely
  document.execCommand("selectAll", false, null);
  document.execCommand("delete", false, null);

  await sleep(50);

  // Type text in chunks
  const chunkSize = 120;
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    document.execCommand("insertText", false, chunk);
    await sleep(40);
  }
}

// ======================================================
// INGREDIENT SEARCH + ADD
// ======================================================
async function addCharacterIngredient(characterName) {
  panelLog(`Adding ingredient: ${characterName}`);

  const addBtn = [...document.querySelectorAll("button")].find(b =>
    b.className.includes("add-menu-trigger") &&
    b.getAttribute("aria-label") === "Add ingredients to the prompt box"
  );

  if (!addBtn) {
    panelLog("Add-menu-trigger button not found.");
    return false;
  }

  highlight(addBtn);
  addBtn.click();
  panelLog("Ingredient menu opened.");

  await sleep(300);
  await clickCharactersFilter();

  const searchInput = await waitForSelector('input.search-input[aria-label="Search assets"]');
  highlight(searchInput);

  searchInput.focus();
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));

  searchInput.value = characterName;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  searchInput.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));

  panelLog(`Searching for: ${characterName}`);

  await sleep(800);

  const assetItems = [...document.querySelectorAll("button.asset-item")];

  if (assetItems.length === 0) {
    panelLog(`No ingredient results found for: ${characterName}`);
    return false;
  }

  const firstItem = assetItems[0];
  highlight(firstItem);
  await sleep(800);

  firstItem.click();
  panelLog(`Ingredient selected: ${characterName}`);

  await sleep(300);
  return true;
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
// CORE QUEUE RUNNER (patched to accept character)
// ======================================================
async function runQueue({ prompts, mode, aspect, model, character }) {
  GLOBAL_CHARACTER = character;
  panelLog(`Global ingredient set to: ${GLOBAL_CHARACTER}`);

  panelLog(`Content script: received queue (${prompts.length} prompts).`);
  debugLog("Queue payload:", { prompts, mode, aspect, model, character });

  await setMode(mode);
  await setModel(model);
  await setAspect(aspect);

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    panelLog(`Prompt ${i + 1}/${prompts.length}: "${prompt.slice(0, 80)}..."`);

    try {
      const editor = await waitForSelector(SELECTORS.editor);
      panelLog("Editor found for this prompt.");

      await safeTypeIntoEditor(editor, prompt);
      panelLog("Prompt typed into editor.");

      if (GLOBAL_CHARACTER) {
        await addCharacterIngredient(GLOBAL_CHARACTER);
      }

      const generateBtn = await waitForGenerateEnabled();
      generateBtn.click();

      await sleep(1500);
    } catch (err) {
      panelLog(`Error on prompt ${i + 1}: ${err.message}`);
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
