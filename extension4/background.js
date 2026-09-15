// Minimal background for downloads and future expansion

chrome.runtime.onInstalled.addListener(() => {
  console.log('Updated!! Flow Veo Automation installed.');
});

// Optional: central download handler
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'FLOW_DOWNLOAD') {
    const { url, filename } = msg;
    chrome.downloads.download(
      {
        url,
        filename,
        conflictAction: 'uniquify',
        saveAs: false
      },
      downloadId => {
        sendResponse({ ok: true, downloadId });
      }
    );
    return true; // async
  }
});
