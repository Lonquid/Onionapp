/**
 * Exporter: walks every painted slot in a ThemeProject, flattens its
 * layers to a PNG, and writes it into the correct path inside the
 * standard OnionOS theme zip layout:
 *
 *   <Theme Name>/
 *     config.json
 *     skin/
 *       background.png, logo.png, ...
 *       extra/
 *         bootScreen.png, chargingState0.png..23.png, lum0..10.png,
 *         toggle-on.png, toggle-off.png, ...
 *
 * Slots the user never touched are skipped (Onion falls back to its own
 * defaults for any file a theme doesn't provide), so an in-progress theme
 * still exports cleanly.
 */

const Exporter = (() => {

  async function buildZip(project, onProgress) {
    const zip = new JSZip();
    const rootName = sanitizeFolderName(project.name || "My Theme");
    const root = zip.folder(rootName);

    root.file("config.json", JSON.stringify(defaultOnionConfig(project.name, project.author), null, 2));

    const touchedSlotIds = Object.keys(project.stacks);
    let done = 0;
    for (const slotId of touchedSlotIds) {
      const slot = findSlot(slotId);
      if (!slot) continue;
      const stack = project.stacks[slotId];
      const flatCanvas = stack.flatten();
      const blob = await canvasToBlob(flatCanvas);
      root.file(slot.file, blob);
      done++;
      if (onProgress) onProgress(done, touchedSlotIds.length, slot.file);
    }

    root.file(
      "README_FROM_ONION_THEMER.txt",
      [
        "Exported by Onion Themer.",
        "",
        "To install: copy the '" + rootName + "' folder into /Themes on your",
        "Miyoo Mini SD card, then open Apps > Theme Switcher and select it.",
        "",
        "Only the asset slots you actually painted are included — anything",
        "left untouched falls back to Onion's own built-in defaults.",
        "",
        "Painted slots: " + touchedSlotIds.length + " / " + ONION_SLOTS_FLAT.length,
      ].join("\n")
    );

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    return { blob, suggestedName: rootName + ".zip" };
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  function sanitizeFolderName(name) {
    return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "My Theme";
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return { buildZip, blobToBase64 };
})();
