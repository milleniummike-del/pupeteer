console.log("[IFRAME] iframe_inject.js loaded in playground iframe");

window.addEventListener("message", async (event) => {
  const data = event.data;
  if (!data) return;

  // ============================
  // IMAGE UPLOAD
  // ============================
  if (data.type === "PRUNA_UPLOAD_IMAGE") {
    const { name, blob } = data;

    const fileInput = document.querySelector('#p-video-2-image-file');
    if (!fileInput) {
      console.log("[IFRAME] File input not found");
      return;
    }

    const file = new File([blob], name + ".webp", { type: blob.type });
    const dt = new DataTransfer();
    dt.items.add(file);

    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event("input", { bubbles: true }));
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    console.log("[IFRAME] Image uploaded successfully");
  }

    if (data.type === "PRUNA_UPLOAD_AUDIO") {
    const { name, blob } = data;

    const fileInput = document.querySelector('#p-video-2-audio-file');
    if (!fileInput) {
      console.log("[IFRAME] File input not found");
      return;
    }

    const file = new File([blob], name + ".wav", { type: blob.type });
    const dt = new DataTransfer();
    dt.items.add(file);

    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event("input", { bubbles: true }));
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    console.log("[IFRAME] Image uploaded successfully");
  }

  // ============================
  // PROMPT UPDATE
  // ============================
  if (data.type === "PRUNA_SET_PROMPT") {
    const { prompt } = data;

    // This selector matches the real textarea
    const textarea = document.querySelector('textarea[placeholder="Describe motion, camera, audio…"]');

    if (!textarea) {
      console.log("[IFRAME] Prompt textarea not found");
      return;
    }

    textarea.value = prompt;

    // Trigger React/Framer update
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));

    console.log("[IFRAME] Prompt updated");
  }
});
