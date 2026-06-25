/**
 * Wraps the native AndroidBridge (exposed via WebView addJavascriptInterface)
 * with Promises, and provides a fallback implementation when running in a
 * plain desktop/mobile browser (useful for developing/previewing the web
 * layer without building the APK each time). The fallback uses a download
 * link for "save" and a file <input> for "open".
 */

const NativeBridge = (() => {
  const hasNative = typeof AndroidBridge !== "undefined";
  let saveResolvers = [];
  let openResolvers = [];

  if (hasNative) {
    window.AndroidCallbacks = {
      onSaveComplete(payload) {
        const resolve = saveResolvers.shift();
        if (resolve) resolve(payload);
      },
      onOpenComplete(payload) {
        const resolve = openResolvers.shift();
        if (resolve) resolve(payload);
      },
    };
  }

  function saveFile(suggestedName, mimeType, base64Data) {
    if (hasNative) {
      return new Promise((resolve) => {
        saveResolvers.push(resolve);
        AndroidBridge.saveFile(suggestedName, mimeType, base64Data);
      });
    }
    return new Promise((resolve) => {
      try {
        const byteChars = atob(base64Data);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve({ ok: true, uri: "browser-download:" + suggestedName });
      } catch (e) {
        resolve({ ok: false, error: e.message });
      }
    });
  }

  function openFile(mimeType) {
    if (hasNative) {
      return new Promise((resolve) => {
        openResolvers.push(resolve);
        AndroidBridge.openFile(mimeType);
      });
    }
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = mimeType === "application/json" ? ".onproj,application/json" : "*/*";
      input.onchange = () => {
        const file = input.files[0];
        if (!file) { resolve({ ok: false, error: "cancelled" }); return; }
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve({ ok: true, dataBase64: base64, name: file.name });
        };
        reader.onerror = () => resolve({ ok: false, error: "read failed" });
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  function toast(message) {
    if (hasNative) {
      AndroidBridge.toast(message);
    }
    UI_showToast(message);
  }

  return { saveFile, openFile, toast, isNative: hasNative };
})();

function UI_showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("toast--visible");
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove("toast--visible"), 2400);
}
