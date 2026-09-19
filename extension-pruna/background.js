// Minimal background for downloads and future expansion

chrome.runtime.onInstalled.addListener(() => {
  console.log('Updated!! Automation installed.');
});


chrome.webNavigation.onCommitted.addListener((details) => {
  // We only care about the Pruna playground iframe
  if (!details.url.includes("playground.pruna.ai/p-video-2/iframe")) return;

  console.log("[BG] Pruna iframe committed:", details);

  chrome.scripting.executeScript({
    target: { tabId: details.tabId, frameIds: [details.frameId] },
    files: ["iframe_inject.js"]
  }).then(() => {
    console.log("[BG] iframe_inject.js injected into frame", details.frameId);
  }).catch(err => {
    console.error("[BG] Injection failed:", err);
  });
});
