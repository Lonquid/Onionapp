/**
 * Template picker: shows ONION_TEMPLATES as cards. Picking one creates a
 * fresh ThemeProject and jumps into the editor.
 */

const UITemplates = (() => {
  function init() {
    document.getElementById("btn-templates-back").addEventListener("click", () => App.goToStart());
    render();
  }

  function render() {
    const grid = document.getElementById("templates-grid");
    grid.innerHTML = "";
    ONION_TEMPLATES.forEach((t) => {
      const card = document.createElement("button");
      card.className = "tplcard";
      const gradient = `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]}, ${t.swatch[2]})`;
      card.innerHTML = `
        <div class="tplcard__preview" style="background:${gradient}">
          <div class="tplcard__previewframe"></div>
        </div>
        <div class="tplcard__body">
          <div class="tplcard__name">${t.name}</div>
          <div class="tplcard__desc">${t.description}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        const project = new ThemeProject({ name: t.defaultProjectName || "Untitled Theme", templateId: t.id });
        App.openEditorWithProject(project);
      });
      grid.appendChild(card);
    });
  }

  return { init };
})();
