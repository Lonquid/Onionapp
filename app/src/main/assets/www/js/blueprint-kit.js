/**
 * Blueprint drawing kit: procedurally generates the "Blueprint" starter
 * template's per-slot guide art, in the style of the real "Blueprint by
 * Aemiii91" OnionOS theme — a blue engineering-grid backdrop with a
 * simple white line-sketch of what that specific asset is for, plus its
 * filename as a label. This isn't a fixed set of pre-made images; each
 * sketch is drawn with canvas primitives so it scales cleanly to
 * whatever pixel size a slot actually needs.
 *
 * Categorization (which sketch a given slot gets) lives in
 * BlueprintKit.sketchFor(slot) at the bottom of this file.
 */

const BlueprintKit = (() => {
  const BG = "#1A418D";
  const LINE = "#3C5D9E";
  const MAJOR = "#768DBB";
  const INK = "#FFFFFF";

  function drawGrid(ctx, w, h, { minorStep = 8, majorEvery = 10 } = {}) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1;
    for (let x = 0, i = 0; x <= w; x += minorStep, i++) {
      ctx.strokeStyle = (i % majorEvery === 0) ? MAJOR : LINE;
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
    }
    for (let y = 0, i = 0; y <= h; y += minorStep, i++) {
      ctx.strokeStyle = (i % majorEvery === 0) ? MAJOR : LINE;
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
    }
  }

  function drawLabel(ctx, w, h, text, opts = {}) {
    const size = opts.size || Math.max(9, Math.min(18, Math.floor(w / 14)));
    ctx.save();
    ctx.font = `700 ${size}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillStyle = INK;
    const pad = opts.pad ?? Math.max(3, Math.floor(size * 0.4));
    const y = opts.y ?? pad;
    ctx.textBaseline = opts.y !== undefined ? "bottom" : "top";
    if (opts.center) {
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, y);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(text, pad, y);
    }
    ctx.restore();
  }

  function strokeShape(ctx, draw, opts = {}) {
    ctx.save();
    ctx.strokeStyle = opts.color || INK;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opts.alpha ?? 0.9;
    draw(ctx);
    ctx.restore();
  }

  // ---- Individual sketches. Each receives (ctx, w, h) and draws centered/contained art. ----

  const sketches = {
    logo(ctx, w, h) {
      const size = Math.min(w, h) * 0.18;
      ctx.save();
      ctx.font = `800 ${size}px -apple-system, "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = INK;
      ctx.fillText("ONION", w / 2 - size * 1.05, h / 2);
      ctx.globalAlpha = 0.55;
      ctx.fillText("OS", w / 2 + size * 1.55, h / 2);
      ctx.restore();
    },

    star(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.32;
      strokeShape(ctx, (c) => {
        c.beginPath();
        for (let i = 0; i < 10; i++) {
          const ang = (Math.PI / 5) * i - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.45;
          const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
          i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.closePath();
        c.stroke();
      }, { lineWidth: Math.max(2, r * 0.08) });
    },

    gamepad(ctx, w, h) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.5;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.roundRect(cx - s, cy - s * 0.55, s * 2, s * 1.1, s * 0.5);
        c.stroke();
        c.beginPath();
        c.moveTo(cx - s * 0.45, cy - s * 0.18); c.lineTo(cx - s * 0.45, cy + s * 0.18);
        c.moveTo(cx - s * 0.62, cy); c.lineTo(cx - s * 0.28, cy);
        c.stroke();
        [[0.35, -0.12], [0.55, 0]].forEach(([dx, dy]) => {
          c.beginPath();
          c.arc(cx + s * dx, cy + s * dy, s * 0.1, 0, Math.PI * 2);
          c.stroke();
        });
      }, { lineWidth: Math.max(2, s * 0.05) });
    },

    grid2x2(ctx, w, h) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.55, gap = s * 0.12;
      strokeShape(ctx, (c) => {
        const cell = (s - gap) / 2;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
          c.beginPath();
          c.roundRect(cx + dx * (cell / 2 + gap / 2) - cell / 2, cy + dy * (cell / 2 + gap / 2) - cell / 2, cell, cell, cell * 0.18);
          c.stroke();
        });
      }, { lineWidth: Math.max(2, s * 0.04) });
    },

    gear(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
        c.stroke();
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
          const ang = (Math.PI * 2 / teeth) * i;
          const x1 = cx + Math.cos(ang) * r * 0.7, y1 = cy + Math.sin(ang) * r * 0.7;
          const x2 = cx + Math.cos(ang) * r, y2 = cy + Math.sin(ang) * r;
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
        }
      }, { lineWidth: Math.max(2, r * 0.1) });
    },

    controllerCallout(ctx, w, h) {
      const cx = w / 2, cy = h * 0.6, s = Math.min(w, h * 1.1) * 0.32;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.roundRect(cx - s, cy - s * 1.1, s * 2, s * 2.1, s * 0.4);
        c.stroke();
        // d-pad cross
        const px = cx - s * 0.45, py = cy + s * 0.15, a = s * 0.16;
        c.beginPath();
        c.rect(px - a / 2, py - a * 1.5, a, a * 3);
        c.rect(px - a * 1.5, py - a / 2, a * 3, a);
        c.stroke();
        // face buttons
        [[0.45, -0.05], [0.62, 0.15], [0.45, 0.35], [0.28, 0.15]].forEach(([dx, dy]) => {
          c.beginPath();
          c.arc(cx + s * dx, cy + s * dy, a * 0.55, 0, Math.PI * 2);
          c.stroke();
        });
        // shoulder buttons L/R as small boxes above, with callout lines
        c.beginPath();
        c.rect(cx - s * 0.85, cy - s * 1.5, s * 0.4, s * 0.32);
        c.rect(cx + s * 0.45, cy - s * 1.5, s * 0.4, s * 0.32);
        c.stroke();
        c.beginPath();
        c.moveTo(cx - s * 1.4, cy - s * 1.34); c.lineTo(cx - s * 0.85, cy - s * 1.34);
        c.moveTo(cx + s * 0.85, cy - s * 1.34); c.lineTo(cx + s * 1.4, cy - s * 1.34);
        c.stroke();
      }, { lineWidth: Math.max(1.5, s * 0.045) });
    },

    circleProgress(ctx, w, h, opts = {}) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.34;
      const dots = 24;
      const litCount = opts.litCount ?? 1;
      for (let i = 0; i < dots; i++) {
        const ang = (Math.PI * 2 / dots) * i - Math.PI / 2;
        const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.085, 0, Math.PI * 2);
        if (i < litCount) {
          ctx.fillStyle = INK; ctx.fill();
        } else {
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8; ctx.stroke();
        }
        ctx.restore();
      }
      strokeShape(ctx, (c) => { c.beginPath(); c.arc(cx, cy, r * 1.15, 0, Math.PI * 2); c.stroke(); }, { lineWidth: 1, alpha: 0.5 });
    },

    battery(ctx, w, h, opts = {}) {
      const pct = opts.pct ?? 1;
      const bw = w * 0.7, bh = h * 0.45, bx = (w - bw) / 2, by = (h - bh) / 2;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.roundRect(bx, by, bw, bh, 3); c.stroke();
        c.beginPath(); c.rect(bx + bw, by + bh * 0.28, bw * 0.08, bh * 0.44); c.stroke();
        if (pct > 0) {
          c.save();
          c.fillStyle = INK;
          c.globalAlpha = 0.85;
          const innerPad = 3;
          c.fillRect(bx + innerPad, by + innerPad, (bw - innerPad * 2) * pct, bh - innerPad * 2);
          c.restore();
        }
      }, { lineWidth: Math.max(1.5, w * 0.04) });
    },

    batteryCharge(ctx, w, h) {
      sketches.battery(ctx, w, h, { pct: 0.6 });
      const cx = w / 2, cy = h / 2;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.moveTo(cx + 2, cy - h * 0.22);
        c.lineTo(cx - 4, cy + 2);
        c.lineTo(cx + 3, cy + 2);
        c.lineTo(cx - 2, cy + h * 0.22);
        c.stroke();
      }, { lineWidth: 1.5, color: BG, alpha: 1 });
    },

    wifiBars(ctx, w, h, opts = {}) {
      const lit = opts.lit ?? 4;
      const bars = 4;
      const bw = w * 0.13, gap = w * 0.05;
      const totalW = bars * bw + (bars - 1) * gap;
      const startX = (w - totalW) / 2;
      for (let i = 0; i < bars; i++) {
        const bh = h * (0.22 + i * 0.16);
        const x = startX + i * (bw + gap), y = h * 0.78 - bh;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, bw, bh);
        if (i < lit) { ctx.fillStyle = INK; ctx.globalAlpha = 0.85; ctx.fill(); }
        else { ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8; ctx.stroke(); }
        ctx.restore();
      }
    },

    wifiLocked(ctx, w, h) {
      sketches.wifiBars(ctx, w, h, { lit: 4 });
      const cx = w * 0.78, cy = h * 0.28, s = w * 0.16;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.roundRect(cx - s / 2, cy - s * 0.1, s, s * 0.7, 2); c.stroke();
        c.beginPath(); c.arc(cx, cy - s * 0.1, s * 0.35, Math.PI, 0); c.stroke();
      }, { lineWidth: 1.5 });
    },

    soundIcon(ctx, w, h) {
      const cx = w * 0.4, cy = h / 2, s = Math.min(w, h) * 0.28;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.moveTo(cx - s * 0.6, cy - s * 0.3);
        c.lineTo(cx - s * 0.2, cy - s * 0.3);
        c.lineTo(cx + s * 0.3, cy - s * 0.7);
        c.lineTo(cx + s * 0.3, cy + s * 0.7);
        c.lineTo(cx - s * 0.2, cy + s * 0.3);
        c.lineTo(cx - s * 0.6, cy + s * 0.3);
        c.closePath();
        c.stroke();
        c.beginPath(); c.arc(cx + s * 0.55, cy, s * 0.45, -0.6, 0.6); c.stroke();
        c.beginPath(); c.arc(cx + s * 0.55, cy, s * 0.75, -0.6, 0.6); c.stroke();
      }, { lineWidth: 1.5 });
    },

    headphones(ctx, w, h) {
      const cx = w / 2, cy = h * 0.45, r = Math.min(w, h) * 0.32;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, Math.PI, 0); c.stroke();
        c.beginPath(); c.roundRect(cx - r - r * 0.25, cy - r * 0.1, r * 0.3, r * 0.55, 3); c.stroke();
        c.beginPath(); c.roundRect(cx + r - r * 0.05, cy - r * 0.1, r * 0.3, r * 0.55, 3); c.stroke();
      }, { lineWidth: 1.5 });
    },

    sdCard(ctx, w, h) {
      const pad = w * 0.15;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.moveTo(pad, pad * 0.6);
        c.lineTo(w - pad * 1.4, pad * 0.6);
        c.lineTo(w - pad * 0.6, pad * 1.6);
        c.lineTo(w - pad * 0.6, h - pad * 0.6);
        c.lineTo(pad, h - pad * 0.6);
        c.closePath();
        c.stroke();
      }, { lineWidth: 1.5 });
    },

    brightnessIcon(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.18;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI / 4) * i;
          const x1 = cx + Math.cos(ang) * r * 1.5, y1 = cy + Math.sin(ang) * r * 1.5;
          const x2 = cx + Math.cos(ang) * r * 2.1, y2 = cy + Math.sin(ang) * r * 2.1;
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
        }
      }, { lineWidth: 1.5 });
    },

    infoIcon(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
      }, { lineWidth: 1.5 });
      drawLabel(ctx, w, h, "i", { center: true, size: Math.min(w, h) * 0.4, y: h / 2 + Math.min(w, h) * 0.14 });
    },

    resetIcon(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.28;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, 0.4, Math.PI * 1.7); c.stroke();
        c.beginPath();
        c.moveTo(cx + r * Math.cos(0.4), cy + r * Math.sin(0.4));
        c.lineTo(cx + r * 1.3, cy + r * Math.sin(0.4) - r * 0.2);
        c.moveTo(cx + r * Math.cos(0.4), cy + r * Math.sin(0.4));
        c.lineTo(cx + r * Math.cos(0.4) - r * 0.2, cy + r * Math.sin(0.4) + r * 0.35);
        c.stroke();
      }, { lineWidth: 1.5 });
    },

    keyIcon(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.16;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx - r * 0.6, cy, r, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + r * 1.8, cy); c.stroke();
        c.beginPath(); c.moveTo(cx + r * 1.2, cy); c.lineTo(cx + r * 1.2, cy + r * 0.6); c.stroke();
        c.beginPath(); c.moveTo(cx + r * 1.8, cy); c.lineTo(cx + r * 1.8, cy + r * 0.8); c.stroke();
      }, { lineWidth: 1.5 });
    },

    languageIcon(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(cx - r, cy); c.lineTo(cx + r, cy); c.stroke();
      }, { lineWidth: 1.5 });
    },

    folder(ctx, w, h) {
      const pad = w * 0.12;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.moveTo(pad, h * 0.32);
        c.lineTo(pad + w * 0.28, h * 0.32);
        c.lineTo(pad + w * 0.36, h * 0.22);
        c.lineTo(w - pad, h * 0.22);
        c.lineTo(w - pad, h * 0.78);
        c.lineTo(pad, h * 0.78);
        c.closePath();
        c.stroke();
      }, { lineWidth: 1.5 });
    },

    powerOff(ctx, w, h) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.28;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.arc(cx, cy, r, 0.9, Math.PI * 2 - 0.9); c.stroke();
        c.beginPath(); c.moveTo(cx, cy - r * 1.25); c.lineTo(cx, cy - r * 0.2); c.stroke();
      }, { lineWidth: 2 });
    },

    arrowLeft(ctx, w, h) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.3;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.moveTo(cx + s * 0.4, cy - s); c.lineTo(cx - s * 0.4, cy); c.lineTo(cx + s * 0.4, cy + s); c.stroke();
      }, { lineWidth: 2 });
    },
    arrowRight(ctx, w, h) {
      const cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.3;
      strokeShape(ctx, (c) => {
        c.beginPath(); c.moveTo(cx - s * 0.4, cy - s); c.lineTo(cx + s * 0.4, cy); c.lineTo(cx - s * 0.4, cy + s); c.stroke();
      }, { lineWidth: 2 });
    },

    segmentBar(ctx, w, h, opts = {}) {
      const segments = opts.segments ?? 10;
      const lit = opts.lit ?? 0;
      const pad = 4, gap = 2;
      const segW = (w - pad * 2 - gap * (segments - 1)) / segments;
      for (let i = 0; i < segments; i++) {
        const x = pad + i * (segW + gap);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, h * 0.22, segW, h * 0.56, 2);
        if (i < lit) { ctx.fillStyle = INK; ctx.fill(); }
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    },

    dpadGlyph(ctx, w, h) {
      const cx = w / 2, cy = h / 2, a = Math.min(w, h) * 0.16;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.rect(cx - a / 2, cy - a * 1.5, a, a * 3);
        c.rect(cx - a * 1.5, cy - a / 2, a * 3, a);
        c.stroke();
      }, { lineWidth: 1.5 });
    },

    rectOutline(ctx, w, h, opts = {}) {
      const pad = opts.pad ?? Math.min(w, h) * 0.12;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.roundRect(pad, pad, w - pad * 2, h - pad * 2, opts.radius ?? 4);
        c.stroke();
      }, { lineWidth: 1.5, alpha: 0.7 });
    },

    lineH(ctx, w, h) {
      ctx.save();
      ctx.strokeStyle = MAJOR;
      ctx.lineWidth = Math.max(1, h);
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      ctx.restore();
    },
    lineV(ctx, w, h) {
      ctx.save();
      ctx.strokeStyle = MAJOR;
      ctx.lineWidth = Math.max(1, w);
      ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
      ctx.restore();
    },

    dot(ctx, w, h, opts = {}) {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.32;
      ctx.save();
      if (opts.filled) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    },

    consoleGlyph(ctx, w, h) {
      const pad = w * 0.18;
      strokeShape(ctx, (c) => {
        c.beginPath();
        c.roundRect(pad, h * 0.3, w - pad * 2, h * 0.45, 6);
        c.stroke();
        c.beginPath();
        c.arc(w * 0.32, h * 0.52, w * 0.06, 0, Math.PI * 2);
        c.arc(w * 0.68, h * 0.52, w * 0.06, 0, Math.PI * 2);
        c.stroke();
      }, { lineWidth: 1.5, alpha: 0.85 });
    },
  };

  /** Renders the appropriate sketch (or none) onto a 2D context sized w×h. */
  function render(ctx, w, h, slot) {
    drawGrid(ctx, w, h);
    const plan = sketchFor(slot);
    if (!plan) return;
    if (plan.sketch) sketches[plan.sketch](ctx, w, h, plan.opts || {});
    if (plan.label !== false) {
      const text = (plan.labelText || slot.file.split("/").pop().replace(/\.png$/i, "")).toUpperCase();
      drawLabel(ctx, w, h, text, plan.labelOpts || {});
    }
  }

  /**
   * Maps a slot to { sketch, opts, label, labelText, labelOpts }.
   * Returns null for slots that should stay a plain functional
   * transparent canvas (no grid/sketch at all) — matching the real
   * theme's choice to leave small icon-style assets as real artwork
   * rather than diagrams.
   */
  function sketchFor(slot) {
    const id = slot.id;

    // Full-screen scenes: grid + logo + filename.
    if (["background", "boot-screen", "screen-off", "screen-off-save", "lowBat", "bg-io-testing"].includes(id)) {
      return { sketch: "logo", labelOpts: { center: true, y: slot.h * 0.5 + 40 } };
    }
    if (id.startsWith("chargingState")) {
      const n = parseInt(id.replace("chargingState", ""), 10) || 0;
      return { sketch: "circleProgress", opts: { litCount: n + 1 }, labelText: id };
    }
    if (id === "bg-keysetting") return { sketch: "controllerCallout", labelText: id };

    // Mid-size structural backgrounds: just the grid (rounded panel feel), filename label.
    if (["preview-bg", "bg-title", "tips-bar-bg", "pop-bg", "miyoo-topbar", "bg-list-l", "bg-list-s",
      "bg-game-item-n", "bg-game-item-f", "bg-ra-list-item", "bg-button-f", "bg-keysetting-f",
      "bg-pop-menu-1", "bg-pop-menu-2", "bg-pop-menu-3", "bg-pop-menu-4", "Empty", "list-num", "num-bg"].includes(id)) {
      return { sketch: null, labelText: id, labelOpts: { pad: 4 } };
    }

    // Nav tab icons: simple representative glyphs.
    const navMap = {
      "ic-game-n": "gamepad", "ic-game-f": "gamepad",
      "ic-favorite-n": "star", "ic-favorite-f": "star",
      "ic-app-n": "grid2x2", "ic-app-f": "grid2x2",
      "ic-setting-n": "gear", "ic-setting-f": "gear",
      "ic-recent-n": "consoleGlyph", "ic-recent-f": "consoleGlyph",
      "ic-retroarch-n": "consoleGlyph", "ic-retroarch-f": "consoleGlyph",
    };
    if (navMap[id]) return { sketch: navMap[id], labelText: id, labelOpts: { y: slot.h - 14 } };

    // Divider lines — colored line, no label (too thin to read text anyway).
    if (id === "div-line-h") return { sketch: "lineH", label: false };
    if (id === "div-line-v-01") return { sketch: "lineV", label: false };

    // Brightness slider steps — segmented bar with N lit. No label: the
    // canvas is only 30px tall, too short to fit text without
    // overlapping the segments, and the bar shape is self-explanatory.
    if (/^lum(\d+)$/.test(id)) {
      const n = parseInt(id.replace("lum", ""), 10);
      return { sketch: "segmentBar", opts: { segments: 10, lit: n }, label: false };
    }

    // Status / settings icons get a small representative glyph, no grid
    // background (they're transparent overlays in the real theme) —
    // we still draw the grid for visibility while editing, since an
    // all-transparent starting canvas with no guide would be confusing,
    // but keep the label compact.
    const iconMap = {
      "power-full-icon": ["battery", { pct: 1 }], "power-80%-icon": ["battery", { pct: 0.8 }],
      "power-50%-icon": ["battery", { pct: 0.5 }], "power-20%-icon": ["battery", { pct: 0.2 }],
      "power-0%-icon": ["battery", { pct: 0 }], "ic-power-charge-100%": ["batteryCharge", {}],
      "icon-wifi-connected": ["wifiBars", { lit: 4 }], "icon-wifi-locked": ["wifiLocked", {}],
      "icon-wifi-signal-01": ["wifiBars", { lit: 1 }], "icon-wifi-signal-02": ["wifiBars", { lit: 2 }],
      "icon-wifi-signal-03": ["wifiBars", { lit: 3 }], "icon-wifi-signal-04": ["wifiBars", { lit: 4 }],
      "sound-icon": ["soundIcon", {}], "headphone-icon": ["headphones", {}], "icon-TF": ["sdCard", {}],
      "icon-brightness-48": ["brightnessIcon", {}], "icon-device-info-48": ["infoIcon", {}],
      "icon-factory-reset-48": ["resetIcon", {}], "icon-key-setting-48": ["keyIcon", {}],
      "icon-language-48": ["languageIcon", {}], "icon-setting-wifi": ["wifiBars", { lit: 3 }],
      "icon-Shutdown": ["powerOff", {}], "icon-folder": ["folder", {}], "fixit": ["resetIcon", {}],
      "icon-left-arrow-24": ["arrowLeft", {}], "icon-right-arrow-24": ["arrowRight", {}],
      "dot-a": ["dot", { filled: true }], "dot-n": ["dot", { filled: false }],
      "progress-dot": ["dot", { filled: true }],
      "icon-A-54": ["dot", { filled: false }], "icon-B-54": ["dot", { filled: false }],
    };
    if (iconMap[id]) {
      const [sketch, opts] = iconMap[id];
      return { sketch, opts, label: false };
    }

    // App icons & system icons: a generic representative glyph + short label.
    if (id.startsWith("appicon-")) return { sketch: "rectOutline", labelText: id.replace("appicon-", ""), labelOpts: { center: true, pad: 4, y: slot.h - 8 } };
    if (id.startsWith("sysicon-")) return { sketch: "consoleGlyph", labelText: id.replace("sysicon-", ""), labelOpts: { center: true, y: slot.h - 8 } };

    // Toggle switches: real-looking but simplified, no grid needed visually
    // — keep grid for consistency, label only.
    if (id === "toggle-on") return { sketch: "dot", opts: { filled: true }, labelText: "ON" };
    if (id === "toggle-off") return { sketch: "dot", opts: { filled: false }, labelText: "OFF" };

    // Everything else not explicitly covered: grid + filename label, a
    // reasonable generic default rather than leaving it unhandled.
    return { sketch: null, labelText: id };
  }

  return { render, drawGrid, drawLabel, sketches };
})();
