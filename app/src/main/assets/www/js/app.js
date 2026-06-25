/**
 * App: top-level screen router + shared modal helpers. Each "screen" is a
 * <section class="screen"> toggled via the screen--active class; no
 * client-side routing library needed for three screens.
 */

const App = (() => {
  let confirmHandler = null;

  function init() {
    UIStart.init();
    UITemplates.init();
    UIEditor.init();
    bindConfirmModal();
    bindExportModal();
    showScreen("screen-start");
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((el) => el.classList.remove("screen--active"));
    document.getElementById(id).classList.add("screen--active");
  }

  function goToStart() {
    UIStart.renderRecents();
    showScreen("screen-start");
  }

  function goToTemplates() {
    showScreen("screen-templates");
  }

  function openEditorWithProject(project) {
    UIEditor.openProject(project);
    showScreen("screen-editor");
  }

  function confirm({ title, body, onConfirm }) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-body").textContent = body;
    confirmHandler = onConfirm;
    document.getElementById("modal-confirm").hidden = false;
  }

  /**
   * Called from MainActivity.onBackPressed() via evaluateJavascript so the
   * hardware/gesture back button matches the in-app back arrow on every
   * screen. Returns true if the web app handled it (native code should do
   * nothing further), false if native should fall back to its own default
   * (closing the app, since start is the root screen).
   */
  function handleNativeBack() {
    // An open modal takes priority — dismiss it rather than navigating.
    const confirmModal = document.getElementById("modal-confirm");
    if (confirmModal && !confirmModal.hidden) {
      document.getElementById("confirm-cancel").click();
      return true;
    }
    const exportModal = document.getElementById("modal-export");
    if (exportModal && !exportModal.hidden && !document.getElementById("btn-export-close").hidden) {
      exportModal.hidden = true;
      return true;
    }

    if (document.getElementById("screen-editor").classList.contains("screen--active")) {
      document.getElementById("btn-editor-back").click();
      return true;
    }
    if (document.getElementById("screen-templates").classList.contains("screen--active")) {
      goToStart();
      return true;
    }
    // Already on the start screen: nothing left for the web app to do.
    return false;
  }

  function bindConfirmModal() {
    document.getElementById("confirm-cancel").addEventListener("click", () => {
      document.getElementById("modal-confirm").hidden = true;
      confirmHandler = null;
    });
    document.getElementById("confirm-ok").addEventListener("click", () => {
      document.getElementById("modal-confirm").hidden = true;
      const handler = confirmHandler;
      confirmHandler = null;
      if (handler) handler();
    });
  }

  function bindExportModal() {
    document.getElementById("btn-export-close").addEventListener("click", () => {
      document.getElementById("modal-export").hidden = true;
    });
  }

  return { init, showScreen, goToStart, goToTemplates, openEditorWithProject, confirm, handleNativeBack };
})();

window.App = App;

document.addEventListener("DOMContentLoaded", () => App.init());
