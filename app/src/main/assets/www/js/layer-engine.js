/**
 * Layer engine. Each "asset slot" (e.g. background.png, toggle-on.png) has
 * its own independent layer stack, because OnionOS assets are separate
 * files, not one big canvas. Switching slots in the editor swaps which
 * stack is active.
 *
 * A Layer is a plain object wrapping an offscreen canvas:
 *   { id, name, visible, opacity (0-1), blend (canvas globalCompositeOperation),
 *     canvas, ctx }
 *
 * Undo/redo is per-slot and snapshot-based (full ImageData snapshots of
 * the affected layer before+after a stroke). That's simple and reliable
 * for theme-sized canvases (tens to low hundreds of px); it would not
 * scale to huge images, which is fine here.
 */

class LayerStack {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.activeLayerIndex = 0;
    this.undoStack = [];
    this.redoStack = [];
    this._maxHistory = 40;
  }

  addLayer(name, opts = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    const layer = {
      id: "layer_" + Math.random().toString(36).slice(2, 10),
      name: name || "Layer " + (this.layers.length + 1),
      visible: true,
      opacity: 1,
      blend: "source-over",
      canvas,
      ctx,
    };
    if (opts.fillSolid) {
      ctx.fillStyle = opts.fillSolid;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    this.layers.push(layer);
    this.activeLayerIndex = this.layers.length - 1;
    return layer;
  }

  removeLayer(index) {
    if (this.layers.length <= 1) return false;
    this.layers.splice(index, 1);
    this.activeLayerIndex = Math.max(0, Math.min(this.activeLayerIndex, this.layers.length - 1));
    return true;
  }

  duplicateLayer(index) {
    const src = this.layers[index];
    if (!src) return null;
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(src.canvas, 0, 0);
    const layer = {
      id: "layer_" + Math.random().toString(36).slice(2, 10),
      name: src.name + " copy",
      visible: src.visible,
      opacity: src.opacity,
      blend: src.blend,
      canvas,
      ctx,
    };
    this.layers.splice(index + 1, 0, layer);
    this.activeLayerIndex = index + 1;
    return layer;
  }

  moveLayer(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= this.layers.length) return;
    const [l] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, l);
    this.activeLayerIndex = toIndex;
  }

  get activeLayer() {
    return this.layers[this.activeLayerIndex];
  }

  /** Composite all visible layers onto a target context, top of array = top of stack. */
  composite(targetCtx) {
    targetCtx.clearRect(0, 0, this.width, this.height);
    for (const layer of this.layers) {
      if (!layer.visible) continue;
      targetCtx.save();
      targetCtx.globalAlpha = layer.opacity;
      targetCtx.globalCompositeOperation = layer.blend;
      targetCtx.drawImage(layer.canvas, 0, 0);
      targetCtx.restore();
    }
  }

  /** Flatten to a single canvas (used for thumbnails and export). */
  flatten() {
    const out = document.createElement("canvas");
    out.width = this.width;
    out.height = this.height;
    this.composite(out.getContext("2d"));
    return out;
  }

  // ---- Undo / redo ----
  snapshotBefore(layerIndex) {
    const layer = this.layers[layerIndex];
    if (!layer) return null;
    return {
      layerIndex,
      imageData: layer.ctx.getImageData(0, 0, this.width, this.height),
    };
  }

  commitChange(beforeSnapshot) {
    if (!beforeSnapshot) return;
    const layer = this.layers[beforeSnapshot.layerIndex];
    if (!layer) return;
    const after = layer.ctx.getImageData(0, 0, this.width, this.height);
    this.undoStack.push({ layerIndex: beforeSnapshot.layerIndex, before: beforeSnapshot.imageData, after });
    if (this.undoStack.length > this._maxHistory) this.undoStack.shift();
    this.redoStack = [];
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  undo() {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    const layer = this.layers[entry.layerIndex];
    if (layer) layer.ctx.putImageData(entry.before, 0, 0);
    this.redoStack.push(entry);
    return true;
  }

  redo() {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    const layer = this.layers[entry.layerIndex];
    if (layer) layer.ctx.putImageData(entry.after, 0, 0);
    this.undoStack.push(entry);
    return true;
  }

  // ---- Serialization ----
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      activeLayerIndex: this.activeLayerIndex,
      layers: this.layers.map(l => ({
        id: l.id,
        name: l.name,
        visible: l.visible,
        opacity: l.opacity,
        blend: l.blend,
        dataUrl: l.canvas.toDataURL("image/png"),
      })),
    };
  }

  static fromJSON(json) {
    const stack = new LayerStack(json.width, json.height);
    stack.layers = [];
    return new Promise((resolve) => {
      let remaining = json.layers.length;
      if (remaining === 0) {
        stack.addLayer("Layer 1");
        resolve(stack);
        return;
      }
      const loaded = new Array(json.layers.length);
      json.layers.forEach((ldata, i) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = json.width;
          canvas.height = json.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          loaded[i] = {
            id: ldata.id,
            name: ldata.name,
            visible: ldata.visible,
            opacity: ldata.opacity,
            blend: ldata.blend,
            canvas,
            ctx,
          };
          remaining--;
          if (remaining === 0) {
            stack.layers = loaded;
            stack.activeLayerIndex = Math.min(json.activeLayerIndex || 0, loaded.length - 1);
            resolve(stack);
          }
        };
        img.src = ldata.dataUrl;
      });
    });
  }
}
