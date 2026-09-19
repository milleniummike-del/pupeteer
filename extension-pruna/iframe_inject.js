console.log("[IFRAME] iframe_inject.js loaded in playground iframe");

window.addEventListener("message", async (event) => {
  const data = event.data;
  if (!data || data.type !== "PRUNA_UPLOAD_IMAGE") return;

  try {
    const { name, blob } = data;
    console.log("[IFRAME] Upload request:", name);

    // Adjust selector if needed after inspecting iframe DOM
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
  } catch (e) {
    console.error("[IFRAME] Upload error:", e);
  }
});
