/**
 * Start screen: New project -> goes to template picker.
 * Open saved project -> native file picker for a .onproj file.
 */

const UIStart = (() => {
  function init() {
    document.getElementById("btn-new-project").addEventListener("click", () => {
      App.goToTemplates();
    });
    document.getElementById("btn-open-project").addEventListener("click", async () => {
      await openSavedProject();
    });
    renderRecents();
  }

  function renderRecents() {
    const recents = RecentProjects.list();
    const wrap = document.getElementById("recent-projects-wrap");
    const list = document.getElementById("recent-projects-list");
    if (!recents.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    list.innerHTML = "";
    recents.forEach((r) => {
      const item = document.createElement("button");
      item.className = "start__recent-item";
      item.innerHTML = `<span class="start__recent-name">${escapeHtml(r.name)}</span>
                         <span class="start__recent-date">${formatDate(r.savedAt)}</span>`;
      item.addEventListener("click", async () => {
        UI_showToast("Use \u201cOpen saved project\u201d to pick this file again");
        await openSavedProject();
      });
      list.appendChild(item);
    });
  }

  async function openSavedProject() {
    UI_showToast("Opening…");
    const result = await NativeBridge.openFile("application/json");
    if (!result.ok) {
      if (result.error !== "cancelled") UI_showToast("Couldn't open file: " + result.error);
      return;
    }
    try {
      const jsonText = b64ToUtf8(result.dataBase64);
      const json = JSON.parse(jsonText);
      const project = await ThemeProject.fromJSON(json);
      RecentProjects.add({ name: project.name, savedAt: new Date().toISOString(), uri: result.name || "" });
      App.openEditorWithProject(project);
    } catch (e) {
      UI_showToast("That file doesn't look like a valid project: " + e.message);
    }
  }

  function b64ToUtf8(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return { init, renderRecents };
})();
