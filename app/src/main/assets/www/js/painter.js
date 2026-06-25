/**
 * Painter: turns pointer input on the stage canvas into strokes/shapes on
 * the active layer of the current LayerStack. Tools are small, focused
 * functions rather than a class hierarchy, since each one just needs
 * (ctx, point, state) — easier to read and extend with new brushes later.
 */

const Painter = (() => {
  let stack = null;         // active LayerStack
  let viewCanvas = null;    // visible composited canvas
  let overlayCanvas = null; // for live previews (shape drag, selection)
  let viewCtx = null;
  let overlayCtx = null;

  let tool = "brush";
  let color = "#ffffff";
  let size = 10;
  let opacityPct = 100;
  let hardnessPct = 85;

  let isDrawing = false;
  let lastPoint = null;
  let strokeSnapshot = null;
  let shapeStart = null;
  let zoom = 1;

  const recentColors = [];

  function init({ view, overlay }) {
    viewCanvas = view;
    overlayCanvas = overlay;
    viewCtx = view.getContext("2d");
    overlayCtx = overlay.getContext("2d");

    overlayCanvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function setStack(newStack) {
    stack = newStack;
    resizeCanvasesToStack();
    redraw();
  }

  function resizeCanvasesToStack() {
    if (!stack) return;
    viewCanvas.width = stack.width;
    viewCanvas.height = stack.height;
    overlayCanvas.width = stack.width;
    overlayCanvas.height = stack.height;
    applyZoomToDom();
  }

  function setTool(t) { tool = t; }
  function getTool() { return tool; }
  function setColor(c) {
    color = c;
    if (!recentColors.includes(c)) {
      recentColors.unshift(c);
      if (recentColors.length > 8) recentColors.pop();
    }
  }
  function getColor() { return color; }
  function setSize(s) { size = s; }
  function setOpacity(p) { opacityPct = p; }
  function setHardness(h) { hardnessPct = h; }
  function setZoom(z) { zoom = z; applyZoomToDom(); }
  function getZoom() { return zoom; }

  function applyZoomToDom() {
    const frame = document.getElementById("stage-frame");
    if (!frame || !stack) return;
    frame.style.width = (stack.width * zoom) + "px";
    frame.style.height = (stack.height * zoom) + "px";
  }

  function canvasPointFromEvent(e) {
    const rect = overlayCanvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * stack.width;
    const y = ((e.clientY - rect.top) / rect.height) * stack.height;
    return { x, y };
  }

  function onPointerDown(e) {
    if (!stack) return;
    e.preventDefault();
    overlayCanvas.setPointerCapture && overlayCanvas.setPointerCapture(e.pointerId);
    const layer = stack.activeLayer;
    if (!layer) return;

    isDrawing = true;
    const p = canvasPointFromEvent(e);
    lastPoint = p;
    strokeSnapshot = stack.snapshotBefore(stack.activeLayerIndex);

    if (tool === "brush" || tool === "eraser") {
      stampDab(layer.ctx, p);
      redraw();
    } else if (tool === "fill") {
      floodFill(layer.ctx, Math.round(p.x), Math.round(p.y), color);
      redraw();
      finishStroke();
      isDrawing = false;
    } else if (tool === "eyedropper") {
      const c = sampleColor(p);
      if (c) {
        setColor(c);
        document.dispatchEvent(new CustomEvent("painter:colorpicked", { detail: c }));
      }
      isDrawing = false;
    } else if (tool === "rect" || tool === "ellipse" || tool === "line") {
      shapeStart = p;
    }
  }

  function onPointerMove(e) {
    if (!isDrawing || !stack) return;
    const layer = stack.activeLayer;
    if (!layer) return;
    const p = canvasPointFromEvent(e);

    if (tool === "brush" || tool === "eraser") {
      drawLineOfDabs(layer.ctx, lastPoint, p);
      lastPoint = p;
      redraw();
    } else if (tool === "rect" || tool === "ellipse" || tool === "line") {
      drawShapePreview(shapeStart, p);
    }
  }

  function onPointerUp(e) {
    if (!isDrawing || !stack) return;
    const layer = stack.activeLayer;

    if ((tool === "rect" || tool === "ellipse" || tool === "line") && layer && shapeStart) {
      const endPoint = canvasPointFromEvent(e);
      commitShape(layer.ctx, shapeStart, endPoint);
      overlayCtx.clearRect(0, 0, stack.width, stack.height);
      shapeStart = null;
      redraw();
    }

    if (tool === "brush" || tool === "eraser" || tool === "rect" || tool === "ellipse" || tool === "line") {
      finishStroke();
    }

    isDrawing = false;
    lastPoint = null;
  }

  function finishStroke() {
    if (strokeSnapshot) {
      stack.commitChange(strokeSnapshot);
      strokeSnapshot = null;
      document.dispatchEvent(new CustomEvent("painter:historychange"));
      document.dispatchEvent(new CustomEvent("painter:dirty"));
    }
  }

  // ---- Brush dabbing ----
  function stampDab(ctx, p) {
    ctx.save();
    ctx.globalAlpha = opacityPct / 100;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    const r = size / 2;
    const hardness = hardnessPct / 100;
    const grad = ctx.createRadialGradient(p.x, p.y, Math.max(0, r * hardness), p.x, p.y, Math.max(0.01, r));
    const fillColor = tool === "eraser" ? "rgba(0,0,0,1)" : hexToRgba(color, 1);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLineOfDabs(ctx, from, to) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, size / 6);
    const steps = Math.max(1, Math.floor(dist / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      stampDab(ctx, { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
    }
  }

  // ---- Shapes ----
  function drawShapePreview(start, end) {
    overlayCtx.clearRect(0, 0, stack.width, stack.height);
    overlayCtx.save();
    overlayCtx.globalAlpha = opacityPct / 100;
    overlayCtx.strokeStyle = color;
    overlayCtx.lineWidth = Math.max(1, size / 4);
    overlayCtx.fillStyle = color;
    drawShapePath(overlayCtx, tool, start, end);
    overlayCtx.stroke();
    overlayCtx.restore();
  }

  function commitShape(ctx, start, end) {
    ctx.save();
    ctx.globalAlpha = opacityPct / 100;
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, size / 4);
    drawShapePath(ctx, tool, start, end);
    ctx.stroke();
    ctx.restore();
  }

  function drawShapePath(ctx, shape, start, end) {
    ctx.beginPath();
    if (shape === "rect") {
      ctx.rect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
    } else if (shape === "ellipse") {
      const cx = (start.x + end.x) / 2, cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2, ry = Math.abs(end.y - start.y) / 2;
      ctx.ellipse(cx, cy, Math.max(rx, 0.01), Math.max(ry, 0.01), 0, 0, Math.PI * 2);
    } else if (shape === "line") {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    }
  }

  // ---- Flood fill (stack-based, alpha-aware, tolerance-based) ----
  function floodFill(ctx, x, y, fillColorHex) {
    const w = stack.width, h = stack.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const startIdx = (y * w + x) * 4;
    const targetR = data[startIdx], targetG = data[startIdx + 1], targetB = data[startIdx + 2], targetA = data[startIdx + 3];
    const fill = hexToRgbInt(fillColorHex);
    const tolerance = 32;

    if (colorsClose(targetR, targetG, targetB, targetA, fill.r, fill.g, fill.b, 255, tolerance)) return;

    const stackArr = [[x, y]];
    const visited = new Uint8Array(w * h);
    while (stackArr.length) {
      const [cx, cy] = stackArr.pop();
      if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
      const vIdx = cy * w + cx;
      if (visited[vIdx]) continue;
      const idx = vIdx * 4;
      if (!colorsClose(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], targetR, targetG, targetB, targetA, tolerance)) continue;
      visited[vIdx] = 1;
      data[idx] = fill.r; data[idx + 1] = fill.g; data[idx + 2] = fill.b; data[idx + 3] = 255;
      stackArr.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function colorsClose(r1, g1, b1, a1, r2, g2, b2, a2, tol) {
    return Math.abs(r1 - r2) <= tol && Math.abs(g1 - g2) <= tol && Math.abs(b1 - b2) <= tol && Math.abs(a1 - a2) <= tol;
  }

  function sampleColor(p) {
    const flat = stack.flatten();
    const ctx = flat.getContext("2d");
    const x = Math.round(p.x), y = Math.round(p.y);
    if (x < 0 || y < 0 || x >= stack.width || y >= stack.height) return null;
    const d = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex(d[0], d[1], d[2]);
  }

  // ---- helpers ----
  function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgbInt(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function hexToRgbInt(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  }

  function redraw() {
    if (!stack) return;
    stack.composite(viewCtx);
  }

  return {
    init, setStack, setTool, getTool, setColor, getColor, setSize, setOpacity, setHardness,
    setZoom, getZoom, redraw, get recentColors() { return recentColors; },
  };
})();
