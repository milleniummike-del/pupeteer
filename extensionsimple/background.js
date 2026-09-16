// Minimal background for downloads and media detection

chrome.runtime.onInstalled.addListener(() => {
  console.log("Updated!! Automation installed.");
});

// Helper: map Content-Type → file extension
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

// Media detection via response headers
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

    // Only treat as media if extension looks like image/video
    if (
      ["png", "jpg", "jpeg", "webp", "gif", "mp4", "webm", "mov"].includes(ext)
    ) {
      console.log("Media detected:", details.url, "ct:", contentType, "ext:", ext);

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

// Download handler: saves into Downloads/FlowCaptures/
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FLOW_DOWNLOAD") {
    const { url, ext } = msg;

    const safeExt = ext || "bin";
    const filename = `FlowCaptures/${Date.now()}.${safeExt}`;

    console.log("Downloading:", url, "as", filename);

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

    return true; // keep worker alive for async sendResponse
  }
});
