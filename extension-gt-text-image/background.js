console.log("Background worker started");

// ======================================================
// EXTENSION MAPPING
// ======================================================
function extFromContentType(ct) {
  if (!ct) return "bin";
  ct = ct.toLowerCase();

  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/jpeg")) return "jpg";
  if (ct.includes("image/jpg")) return "jpg";
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/gif")) return "gif";

  if (ct.includes("video/mp4")) return "mp4";
  if (ct.includes("video/webm")) return "webm";
  if (ct.includes("video/quicktime")) return "mov";

  return "bin";
}

// ======================================================
// MEDIA DETECTION
// ======================================================
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    const headers = details.responseHeaders || [];
    let contentType = null;

    for (const h of headers) {
      if (h.name && h.name.toLowerCase() === "content-type") {
        contentType = (h.value || "").toLowerCase();
        break;
      }
    }

    if (!contentType) return;

    const ext = extFromContentType(contentType);

    if (["png","jpg","jpeg","webp","gif","mp4","webm","mov"].includes(ext)) {
      chrome.tabs.sendMessage(details.tabId, {
        type: "FLOW_MEDIA_DETECTED",
        url: details.url,
        ext
      });
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

// ======================================================
// DEDUPE HASHING
// ======================================================
const seenHashes = new Set();

function hashBase64(base64) {
  let hash = 0;
  for (let i = 0; i < base64.length; i++) {
    hash = (hash * 31 + base64.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ======================================================
// PER-TAG LETTER COUNTERS
// ======================================================
const perTagCounters = new Map();
let currentBaseFilename = "image";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "FLOW_SET_BASE_FILENAME") {
    currentBaseFilename = msg.baseFilename || ("Unknown-" + Date.now());
  }
});

function nextLetterFor(baseFilename) {
  if (!perTagCounters.has(baseFilename)) {
    perTagCounters.set(baseFilename, 0);
  }
  const count = perTagCounters.get(baseFilename);
  perTagCounters.set(baseFilename, count + 1);
  return String.fromCharCode(65 + (count % 26)); // A-Z loop
}

// ======================================================
// DOWNLOAD HANDLER
// ======================================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "FLOW_DOWNLOAD_DATA_URL") {
    const { url, ext } = msg;

    const base64 = url.split(",")[1] || "";
    const hash = hashBase64(base64);

    if (seenHashes.has(hash)) {
      sendResponse({ ok: false, duplicate: true });
      return true;
    }

    chrome.storage.local.get(
      ["autoDownloadEnabled", "allowedExtensions", "downloadDirectory", "baseFilename"],
      data => {

        const enabled = data.autoDownloadEnabled ?? true;
        const allowed = data.allowedExtensions ?? ["png","jpg","jpeg","webp","mp4","webm"];
        const directory = data.downloadDirectory ?? "FlowCaptures";

        const fallbackBaseFilename = data.baseFilename ?? "";
        const baseFilename =
          currentBaseFilename ||
          fallbackBaseFilename ||
          ("Unknown-" + Date.now());

        if (!enabled) {
          sendResponse({ ok: false, skipped: true });
          return;
        }

        if (!allowed.includes(ext)) {
          sendResponse({ ok: false, filtered: true });
          return;
        }

        // If baseFilename already ends with -A, -B, -C... skip letter suffix
        const endsWithLetter = /^.+-[A-Z]$/.test(baseFilename);

        let finalFilename;
        if (endsWithLetter) {
          finalFilename = `${directory}/${baseFilename}.${ext}`;
        } else {
          const letter = nextLetterFor(baseFilename);
          finalFilename = `${directory}/${baseFilename}-${letter}.${ext}`;
        }

        chrome.downloads.download(
          {
            url,
            filename: finalFilename,
            conflictAction: "uniquify",
            saveAs: false
          },
          downloadId => {
            if (downloadId) {
              seenHashes.add(hash);
              sendResponse({ ok: true, downloadId });
            } else {
              sendResponse({ ok: false, error: true });
            }
          }
        );
      }
    );

    return true;
  }
});
