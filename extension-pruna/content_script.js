function panelLog(message) {
  try {
    chrome.runtime.sendMessage({ type: "FLOW_LOG", message });
  } catch {
    console.log("[FLOW_LOG]", message);
  }
}

panelLog("Content script loaded.");

async function waitForIframe(timeout = 30000) {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    function check() {
      const iframe = document.querySelector('iframe[src*="p-video-2/iframe"]');
      if (iframe) return resolve(iframe);
      if (performance.now() - start > timeout)
        return reject(new Error("Timeout waiting for Pruna iframe"));
      requestAnimationFrame(check);
    }
    check();
  });
}

async function uploadImage(name) {
  panelLog("Uploading image: " + name);

  try {
    const iframe = await waitForIframe();
    panelLog("Iframe found");

    const url = chrome.runtime.getURL(`inputimages/${name}.webp`);
    panelLog("Fetching image from: " + url);

    const res = await fetch(url);
    if (!res.ok) {
      panelLog("Fetch failed: " + res.status);
      return;
    }

    const blob = await res.blob();

    iframe.contentWindow.postMessage(
      {
        type: "PRUNA_UPLOAD_IMAGE",
        name,
        blob
      },
      "https://playground.pruna.ai"
    );

    panelLog("Upload message sent to iframe");
  } catch (e) {
    panelLog("Upload error: " + e.message);
  }
}

async function runQueue({ prompts }) {
  panelLog("Queue started");
  await uploadImage("Actor-A");
  panelLog("Queue finished.");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FLOW_RUN_QUEUE") {
    runQueue(msg.payload);
    sendResponse({ ok: true });
    return true;
  }
});
