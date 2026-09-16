console.log("Background worker started");

// Map Content-Type → extension
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

// Detect media via headers
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
      console.log("Media detected:", details.url, "ext:", ext);

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


// Keep a short-term cache of downloaded URLs
const downloadedCache = new Set();

// Optional: auto-clear cache every few minutes
setInterval(() => downloadedCache.clear(), 5 * 60 * 1000); // 5 minutes

// Download handler with toggle + extension filter
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FLOW_DOWNLOAD") {
    const { url, ext } = msg;

    chrome.storage.local.get(["autoDownloadEnabled", "allowedExtensions"], data => {
      const enabled = data.autoDownloadEnabled ?? true;
      const allowed = data.allowedExtensions ?? ["png","jpg","webp","mp4","webm"];

      if (!enabled) {
        console.log("Auto-download disabled, skipping:", url);
        sendResponse({ ok: false, skipped: true });
        return;
      }

      if (!allowed.includes(ext)) {
        console.log("Extension filtered out:", ext, url);
        sendResponse({ ok: false, filtered: true });
        return;
      }

      const filename = `FlowCaptures/${Date.now()}.${ext}`;

      chrome.downloads.download(
        {
          url,
          filename,
          conflictAction: "uniquify",
          saveAs: false
        },
        downloadId => {
          sendResponse({ ok: true, downloadId });
        }
      );
    });

    return true;
  }

  if (msg.type === "FLOW_DOWNLOAD_DATA_URL") {
    const { url, ext } = msg;

    // Prevent duplicates
    if (downloadedCache.has(url)) {
      console.log("Skipping duplicate data URL:", url);
      sendResponse({ ok: false, duplicate: true });
      return true;
    }

    chrome.storage.local.get(["autoDownloadEnabled", "allowedExtensions"], data => {
      const enabled = data.autoDownloadEnabled ?? true;
      const allowed = data.allowedExtensions ?? ["png","jpeg","mov","jpg","webp","mp4","webm"];

      if (!enabled) {
        console.log("Auto-download disabled (data URL), skipping");
        sendResponse({ ok: false, skipped: true });
        return;
      }

      if (!allowed.includes(ext)) {
        console.log("Filtered data URL ext:", ext);
        sendResponse({ ok: false, filtered: true });
        return;
      }

      const filename = `FlowCaptures/${Date.now()}.${ext}`;

      chrome.downloads.download(
        {
          url,
          filename,
          conflictAction: "uniquify",
          saveAs: false
        },
        downloadId => {
          if (downloadId) {
            downloadedCache.add(url);   // ⭐ Mark as downloaded
            sendResponse({ ok: true, downloadId });
          } else {
            sendResponse({ ok: false, error: true });
          }
        }
      );
    });

    return true;
}

});
