/**
 * Editor controller. Wires together:
 *  - the slot rail (which asset are we painting)
 *  - the tool grid + options (brush/eraser/fill/shapes/eyedropper)
 *  - the layers panel (add/duplicate/delete/reorder/blend/opacity)
 *  - save project / export theme zip
 */

const UIEditor = (() => {
  let project = null;
  let currentSlotId = "background";

  const TOOLS = [
    { id: "brush", label: "Brush", icon: "🖌️" },
    { id: "eraser", label: "Eraser", icon: "🧹" },
    { id: "fill", label: "Fill", icon: "🪣" },
    { id: "rect", label: "Rect", icon: "▭" },
    { id: "ellipse", label: "Ellipse", icon: "◯" },
    { id: "line", label: "Line", icon: "╱" },
    { id: "eyedropper", label: "Picker", icon: "💧" },
  ];

  function init() {
    Painter.init({
      view: document.getElementById("canvas-view"),
      overlay: document.getElementById("canvas-overlay"),
    });

    document.getElementById("btn-editor-back").addEventListener("click", onBackPressed);
    document.getElementById("editor-project-name").addEventListener("blur", onNameEdited);
    document.getElementById("editor-project-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); e.target.blur(); }
    });

    document.getElementById("btn-undo").addEventListener("click", () => { doUndo(); });
    document.getElementById("btn-redo").addEventListener("click", () => { doRedo(); });
    document.getElementById("btn-save-project").addEventListener("click", saveProject);
    document.getElementById("btn-export").addEventListener("click", exportTheme);

    document.getElementById("btn-zoom-in").addEventListener("click", () => setZoom(Painter.getZoom() + 0.25));
    document.getElementById("btn-zoom-out").addEventListener("click", () => setZoom(Painter.getZoom() - 0.25));
    document.getElementById("btn-zoom-fit").addEventListener("click", fitZoom);
    window.addEventListener("resize", () => { if (project) fitZoom(); });

    bindToolOptions();
    bindLayerPanel();
    bindSidepanelTabs();
    bindMobileDrawer();

    document.addEventListener("painter:historychange", refreshUndoRedoButtons);
    document.addEventListener("painter:dirty", () => { refreshLayerThumbnails(); });
    document.addEventListener("painter:colorpicked", (e) => {
      document.getElementById("opt-color").value = e.detail;
      renderRecentColors();
    });

    renderToolGrid();
  }

  function openProject(p) {
    project = p;
    currentSlotId = "background";
    document.getElementById("editor-project-name").textContent = project.name;
    renderSlotRail();
    selectSlot(currentSlotId);
  }

  function onBackPressed() {
    App.confirm({
      title: "Leave editor?",
      body: "Unsaved changes will be lost unless you've saved your project.",
      onConfirm: () => App.goToStart(),
    });
  }

  function onNameEdited(e) {
    const newName = e.target.textContent.trim() || "Untitled Theme";
    e.target.textContent = newName;
    project.name = newName;
    project.touch();
  }

  // ---- Slot rail ----
  function renderSlotRail() {
    const rail = document.getElementById("slot-rail");
    rail.innerHTML = "";
    ONION_SPEC.groups.forEach((group) => {
      const groupEl = document.createElement("div");
      groupEl.className = "slotrail__group";
      const heading = document.createElement("div");
      heading.className = "slotrail__heading";
      heading.textContent = group.label;
      groupEl.appendChild(heading);

      group.slots.forEach((slot) => {
        const btn = document.createElement("button");
        btn.className = "slotitem";
        btn.dataset.slotId = slot.id;
        const painted = project.hasStack(slot.id);
        btn.innerHTML = `
          <span class="slotitem__thumb" id="thumb-${slot.id}"></span>
          <span class="slotitem__meta">
            <span class="slotitem__name">${humanizeSlotName(slot.id)}</span>
            <span class="slotitem__dim">${slot.w}×${slot.h}${painted ? "" : " · empty"}</span>
          </span>
        `;
        btn.addEventListener("click", () => selectSlot(slot.id));
        groupEl.appendChild(btn);
      });
      rail.appendChild(groupEl);
    });
    updateSlotRailSelection();
    refreshLayerThumbnails();
  }

  function humanizeSlotName(id) {
    return id.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).replace(/state(\d+)/i, "frame $1");
  }

  function updateSlotRailSelection() {
    document.querySelectorAll(".slotitem").forEach((el) => {
      el.classList.toggle("slotitem--active", el.dataset.slotId === currentSlotId);
    });
  }

  function selectSlot(slotId) {
    currentSlotId = slotId;
    updateSlotRailSelection();
    const stack = project.getStack(slotId);
    Painter.setStack(stack);
    requestAnimationFrame(() => requestAnimationFrame(fitZoom));
    renderLayerList();
    refreshUndoRedoButtons();
    refreshSlotThumbnail(slotId);
    refreshSlotEmptyLabel(slotId);
  }

  function refreshSlotEmptyLabel(slotId) {
    const btn = document.querySelector(`.slotitem[data-slot-id="${slotId}"]`);
    if (!btn) return;
    const dimEl = btn.querySelector(".slotitem__dim");
    const slot = findSlot(slotId);
    if (dimEl && slot) dimEl.textContent = `${slot.w}×${slot.h}`;
  }

  // ---- Tools ----
  function renderToolGrid() {
    const grid = document.getElementById("tool-grid");
    const dock = document.getElementById("mobile-dock");
    grid.innerHTML = "";
    dock.innerHTML = "";
    TOOLS.forEach((tool, i) => {
      const make = (container, cls) => {
        const btn = document.createElement("button");
        btn.className = cls;
        btn.dataset.tool = tool.id;
        btn.innerHTML = `<span class="toolbtn__icon">${tool.icon}</span><span class="toolbtn__label">${tool.label}</span>`;
        btn.addEventListener("click", () => setActiveTool(tool.id));
        container.appendChild(btn);
        return btn;
      };
      make(grid, "toolbtn" + (i === 0 ? " toolbtn--active" : ""));
      make(dock, "dockbtn" + (i === 0 ? " dockbtn--active" : ""));
    });
    Painter.setTool(TOOLS[0].id);

    const layersDockBtn = document.createElement("button");
    layersDockBtn.className = "dockbtn dockbtn--layers";
    layersDockBtn.innerHTML = `<span class="toolbtn__icon">📚</span><span class="toolbtn__label">Layers</span>`;
    layersDockBtn.addEventListener("click", () => {
      document.querySelector('.sidepanel__tab[data-panel="layers"]').click();
      openMobileDrawer();
    });
    dock.appendChild(layersDockBtn);
  }

  function setActiveTool(toolId) {
    Painter.setTool(toolId);
    document.querySelectorAll(".toolbtn").forEach(b => b.classList.toggle("toolbtn--active", b.dataset.tool === toolId));
    document.querySelectorAll(".dockbtn").forEach(b => b.classList.toggle("dockbtn--active", b.dataset.tool === toolId));
    document.getElementById("brush-options").classList.toggle("toolopt--hidden", !["brush", "eraser"].includes(toolId));
    if (window.matchMedia("(max-width: 760px)").matches) {
      openMobileDrawer();
    }
  }

  function bindMobileDrawer() {
    const panel = document.getElementById("sidepanel");
    const handle = document.getElementById("sidepanel-handle");
    handle.addEventListener("click", () => panel.classList.toggle("sidepanel--open"));
    document.getElementById("canvas-overlay").addEventListener("pointerdown", () => {
      if (window.matchMedia("(max-width: 760px)").matches) closeMobileDrawer();
    });
  }
  function openMobileDrawer() {
    document.getElementById("sidepanel").classList.add("sidepanel--open");
  }
  function closeMobileDrawer() {
    document.getElementById("sidepanel").classList.remove("sidepanel--open");
  }

  function bindToolOptions() {
    bindSlider("opt-size", "opt-size-val", (v) => Painter.setSize(v));
    bindSlider("opt-opacity", "opt-opacity-val", (v) => Painter.setOpacity(v));
    bindSlider("opt-hardness", "opt-hardness-val", (v) => Painter.setHardness(v));

    const colorInput = document.getElementById("opt-color");
    colorInput.addEventListener("input", (e) => {
      Painter.setColor(e.target.value);
      renderRecentColors();
    });
    Painter.setColor(colorInput.value);
    renderRecentColors();
  }

  function bindSlider(inputId, labelId, onChange, fireOnInit = true) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    input.addEventListener("input", () => {
      label.textContent = input.value;
      onChange(Number(input.value));
    });
    if (fireOnInit) onChange(Number(input.value));
  }

  function renderRecentColors() {
    const wrap = document.getElementById("recent-colors");
    wrap.innerHTML = "";
    Painter.recentColors.forEach((c) => {
      const sw = document.createElement("button");
      sw.className = "swatch";
      sw.style.background = c;
      sw.addEventListener("click", () => {
        document.getElementById("opt-color").value = c;
        Painter.setColor(c);
      });
      wrap.appendChild(sw);
    });
  }

  // ---- Layers panel ----
  function bindSidepanelTabs() {
    document.querySelectorAll(".sidepanel__tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".sidepanel__tab").forEach(t => t.classList.remove("sidepanel__tab--active"));
        document.querySelectorAll(".sidepanel__pane").forEach(p => p.classList.remove("sidepanel__pane--active"));
        tab.classList.add("sidepanel__tab--active");
        document.querySelector(`.sidepanel__pane[data-pane="${tab.dataset.panel}"]`).classList.add("sidepanel__pane--active");
      });
    });
  }

  function bindLayerPanel() {
    document.getElementById("btn-add-layer").addEventListener("click", () => {
      const stack = project.getStack(currentSlotId);
      stack.addLayer();
      project.touch();
      renderLayerList();
      Painter.redraw();
    });
    document.getElementById("btn-dup-layer").addEventListener("click", () => {
      const stack = project.getStack(currentSlotId);
      stack.duplicateLayer(stack.activeLayerIndex);
      project.touch();
      renderLayerList();
      Painter.redraw();
    });
    document.getElementById("btn-del-layer").addEventListener("click", () => {
      const stack = project.getStack(currentSlotId);
      if (stack.layers.length <= 1) {
        UI_showToast("A slot needs at least one layer");
        return;
      }
      stack.removeLayer(stack.activeLayerIndex);
      project.touch();
      renderLayerList();
      Painter.redraw();
    });
    document.getElementById("layer-blend").addEventListener("change", (e) => {
      const stack = project.getStack(currentSlotId);
      if (stack.activeLayer) stack.activeLayer.blend = e.target.value;
      Painter.redraw();
    });
    bindSlider("layer-opacity", "layer-opacity-val", (v) => {
      const stack = project.getStack(currentSlotId);
      if (stack.activeLayer) stack.activeLayer.opacity = v / 100;
      Painter.redraw();
    }, false);
  }

  function renderLayerList() {
    const stack = project.getStack(currentSlotId);
    const list = document.getElementById("layer-list");
    list.innerHTML = "";
    // Render top-of-stack first (visually matches paint-program convention).
    for (let i = stack.layers.length - 1; i >= 0; i--) {
      const layer = stack.layers[i];
      const row = document.createElement("div");
      row.className = "layerrow" + (i === stack.activeLayerIndex ? " layerrow--active" : "");
      row.innerHTML = `
        <button class="layerrow__vis" data-idx="${i}" title="Toggle visibility">${layer.visible ? "👁️" : "🚫"}</button>
        <span class="layerrow__thumb"><canvas width="${stack.width}" height="${stack.height}"></canvas></span>
        <span class="layerrow__name" data-idx="${i}">${layer.name}</span>
      `;
      const thumbCanvas = row.querySelector("canvas");
      thumbCanvas.getContext("2d").drawImage(layer.canvas, 0, 0);

      row.querySelector(".layerrow__vis").addEventListener("click", (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        Painter.redraw();
        renderLayerList();
      });
      row.addEventListener("click", () => {
        stack.activeLayerIndex = i;
        document.getElementById("layer-blend").value = layer.blend;
        document.getElementById("layer-opacity").value = Math.round(layer.opacity * 100);
        document.getElementById("layer-opacity-val").textContent = Math.round(layer.opacity * 100);
        renderLayerList();
      });
      list.appendChild(row);
    }
    const active = stack.activeLayer;
    if (active) {
      document.getElementById("layer-blend").value = active.blend;
      document.getElementById("layer-opacity").value = Math.round(active.opacity * 100);
      document.getElementById("layer-opacity-val").textContent = Math.round(active.opacity * 100);
    }
  }

  function refreshLayerThumbnails() {
    refreshSlotThumbnail(currentSlotId);
    if (document.querySelector('.sidepanel__pane--active[data-pane="layers"]')) {
      renderLayerList();
    }
  }

  function refreshSlotThumbnail(slotId) {
    const thumbEl = document.getElementById("thumb-" + slotId);
    if (!thumbEl || !project.hasStack(slotId)) return;
    const stack = project.getStack(slotId);
    const flat = stack.flatten();
    thumbEl.style.backgroundImage = `url(${flat.toDataURL("image/png")})`;
  }

  // ---- Undo/redo ----
  function doUndo() {
    const stack = project.getStack(currentSlotId);
    if (stack.undo()) { Painter.redraw(); refreshUndoRedoButtons(); refreshLayerThumbnails(); }
  }
  function doRedo() {
    const stack = project.getStack(currentSlotId);
    if (stack.redo()) { Painter.redraw(); refreshUndoRedoButtons(); refreshLayerThumbnails(); }
  }
  function refreshUndoRedoButtons() {
    const stack = project.getStack(currentSlotId);
    document.getElementById("btn-undo").disabled = !stack.canUndo();
    document.getElementById("btn-redo").disabled = !stack.canRedo();
  }

  // ---- Zoom ----
  function setZoom(z) {
    Painter.setZoom(Math.max(0.25, Math.min(8, z)));
    document.getElementById("zoom-label").textContent = Math.round(Painter.getZoom() * 100) + "%";
  }
  function fitZoom() {
    const stage = document.getElementById("stage");
    const stack = project.getStack(currentSlotId);
    const availW = stage.clientWidth - 32;
    const availH = stage.clientHeight - 80;
    const scale = Math.min(availW / stack.width, availH / stack.height, 4);
    setZoom(Math.max(0.25, scale));
  }

  // ---- Save / Export ----
  async function saveProject() {
    UI_showToast("Saving project…");
    const json = project.toJSON();
    const text = JSON.stringify(json);
    const base64 = utf8ToB64(text);
    const filename = sanitizeFileName(project.name) + ".onproj";
    const result = await NativeBridge.saveFile(filename, "application/json", base64);
    if (result.ok) {
      RecentProjects.add({ name: project.name, savedAt: new Date().toISOString(), uri: result.uri || filename });
      UI_showToast("Project saved");
      UIStart.renderRecents();
    } else if (result.error !== "cancelled") {
      UI_showToast("Save failed: " + result.error);
    }
  }

  async function exportTheme() {
    const modal = document.getElementById("modal-export");
    const status = document.getElementById("export-status");
    const bar = document.getElementById("export-progress");
    const closeBtn = document.getElementById("btn-export-close");
    modal.hidden = false;
    closeBtn.hidden = true;
    bar.style.width = "0%";
    status.textContent = "Packing assets…";

    try {
      const { blob, suggestedName } = await Exporter.buildZip(project, (done, total, file) => {
        const pct = total ? Math.round((done / total) * 100) : 100;
        bar.style.width = pct + "%";
        status.textContent = `Packing ${file} (${done}/${total})`;
      });
      const base64 = await Exporter.blobToBase64(blob);
      status.textContent = "Choose where to save the ZIP…";
      const result = await NativeBridge.saveFile(suggestedName, "application/zip", base64);
      if (result.ok) {
        status.textContent = "Exported! Copy the ZIP's contents to /Themes on your SD card.";
        bar.style.width = "100%";
      } else if (result.error === "cancelled") {
        status.textContent = "Export cancelled.";
      } else {
        status.textContent = "Export failed: " + result.error;
      }
    } catch (e) {
      status.textContent = "Export failed: " + e.message;
    }
    closeBtn.hidden = false;
  }

  function utf8ToB64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  function sanitizeFileName(name) {
    return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "theme";
  }

  return { init, openProject, get currentSlotId() { return currentSlotId; } };
})();
