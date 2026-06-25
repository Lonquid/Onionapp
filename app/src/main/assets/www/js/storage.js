/**
 * ThemeProject: the in-memory model for one theme being edited. Owns a
 * LayerStack per asset slot (lazily created), plus project metadata.
 * Serializes to a single JSON document (the ".onproj" project file) that
 * embeds every layer as a PNG data URL — simple, portable, and easy to
 * round-trip without a binary format.
 */

class ThemeProject {
  constructor({ name = "Untitled Theme", author = "", templateId = "blank" } = {}) {
    this.name = name;
    this.author = author;
    this.templateId = templateId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.stacks = {}; // slotId -> LayerStack
  }

  getStack(slotId) {
    if (!this.stacks[slotId]) {
      const slot = findSlot(slotId);
      if (!slot) throw new Error("Unknown slot: " + slotId);
      const stack = new LayerStack(slot.w, slot.h);
      applyTemplateFill(stack, getTemplate(this.templateId), slot);
      this.stacks[slotId] = stack;
    }
    return this.stacks[slotId];
  }

  hasStack(slotId) {
    return !!this.stacks[slotId];
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    const stacksJson = {};
    for (const [slotId, stack] of Object.entries(this.stacks)) {
      stacksJson[slotId] = stack.toJSON();
    }
    return {
      formatVersion: 1,
      name: this.name,
      author: this.author,
      templateId: this.templateId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stacks: stacksJson,
    };
  }

  static async fromJSON(json) {
    const project = new ThemeProject({ name: json.name, author: json.author, templateId: json.templateId });
    project.createdAt = json.createdAt || project.createdAt;
    project.updatedAt = json.updatedAt || project.updatedAt;
    const entries = Object.entries(json.stacks || {});
    for (const [slotId, stackJson] of entries) {
      project.stacks[slotId] = await LayerStack.fromJSON(stackJson);
    }
    return project;
  }
}

/** Paints a simple starting fill into a brand-new layer stack based on the chosen template's recipe. */
function applyTemplateFill(stack, template, slot) {
  const layer = stack.addLayer("Background");
  const ctx = layer.ctx;
  const w = stack.width, h = stack.height;
  const fill = template.fill || { mode: "transparent" };

  if (fill.mode === "transparent") {
    // leave empty
  } else if (fill.mode === "solid") {
    ctx.fillStyle = fill.bg;
    ctx.fillRect(0, 0, w, h);
  } else if (fill.mode === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, fill.from);
    grad.addColorStop(1, fill.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (fill.mode === "grid") {
    ctx.fillStyle = fill.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fill.line;
    ctx.lineWidth = 1;
    const gap = Math.max(8, Math.round(Math.min(w, h) / 20));
    for (let x = 0; x <= w; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  } else if (fill.mode === "weave") {
    ctx.fillStyle = fill.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fill.line;
    ctx.lineWidth = 1;
    const gap = Math.max(6, Math.round(Math.min(w, h) / 28));
    for (let i = -h; i < w; i += gap) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
    }
  }

  // A second, empty layer on top so users always start painting on a
  // fresh layer rather than directly into the template fill.
  stack.addLayer("Layer 1");
}

/**
 * Local recent-projects index, stored in localStorage purely as a
 * "continue where you left off" convenience list (file contents live in
 * the .onproj files themselves via Android's Storage Access Framework;
 * this index just remembers display names + the content URI string so
 * "Open saved project" can offer shortcuts without forcing a file picker
 * every single time).
 */
const RecentProjects = {
  KEY: "onionthemer.recents.v1",

  list() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  add(entry) {
    const items = this.list().filter(i => i.uri !== entry.uri);
    items.unshift(entry);
    while (items.length > 8) items.pop();
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },
};
