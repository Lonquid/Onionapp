/**
 * OnionOS theme asset specification — Miyoo Mini target (480x640 portrait
 * framebuffer, commonly referred to as the "640x480 portrait" screen).
 *
 * Sources for the structure below (verified against official Onion docs,
 * onionui.github.io/docs/theme-design, and the community Themes repo at
 * github.com/OnionUI/Themes):
 *   - Theme root contains a `skin/` folder plus `config.json`.
 *   - `skin/extra/` holds the v4+ override-able assets: bootScreen,
 *     Screen_Off, Screen_Off_Save, chargingState0..23, lum0..10,
 *     toggle-on / toggle-off.
 *   - ROM box-art goes under Roms/<SYSTEM>/Imgs as separate per-game PNGs
 *     (max ~250x360) — that's scraped art, not theme-authored, so it's
 *     intentionally out of scope for this editor.
 *
 * Where the public docs describe a slot by name/purpose but not by exact
 * pixel size, this file uses the Miyoo Mini's native 640x480 landscape /
 * 480x640 portrait panel as the source of truth and notes the assumption
 * inline. Treat WIDTH/HEIGHT here as a starting canvas size you can verify
 * against a real downloaded theme (e.g. Blueprint by Aemiii91) before
 * flashing to a device — the exporter writes standard file/folder names
 * either way, so a slightly-off canvas size won't break the zip layout.
 */

const ONION_SPEC = {
  device: "Miyoo Mini / Mini+",
  screen: { width: 640, height: 480 },

  groups: [
    {
      id: "core",
      label: "Core UI",
      slots: [
        { id: "background", file: "skin/background.png", w: 640, h: 480,
          desc: "Main menu background" },
        { id: "preview-bg", file: "skin/preview-bg.png", w: 640, h: 480,
          desc: "Backdrop behind game list / scraped art overlay" },
        { id: "logo", file: "skin/logo.png", w: 400, h: 120,
          desc: "Top logo / wordmark shown on home" },
        { id: "battery-frame", file: "skin/battery.png", w: 28, h: 14,
          desc: "Battery icon frame (charging look set in skin/extra)" },
        { id: "clock", file: "skin/clock.png", w: 80, h: 24,
          desc: "Clock background plate" },
      ],
    },
    {
      id: "navigation",
      label: "Navigation & Lists",
      slots: [
        { id: "cartridge-bg", file: "skin/cartridge.png", w: 460, h: 80,
          desc: "Game list row / selected item background" },
        { id: "cartridge-bg-focus", file: "skin/cartridge-focus.png", w: 460, h: 80,
          desc: "Focused/highlighted row background" },
        { id: "scrollbar", file: "skin/scrollbar.png", w: 12, h: 200,
          desc: "List scrollbar track" },
        { id: "footer", file: "skin/footer.png", w: 640, h: 48,
          desc: "Bottom button-hint bar" },
      ],
    },
    {
      id: "boot",
      label: "Boot & Power",
      slots: [
        { id: "boot-screen", file: "skin/extra/bootScreen.png", w: 640, h: 480,
          desc: "Shown while the device boots" },
        { id: "screen-off", file: "skin/extra/Screen_Off.png", w: 640, h: 480,
          desc: "Shown while shutting down" },
        { id: "screen-off-save", file: "skin/extra/Screen_Off_Save.png", w: 640, h: 480,
          desc: "Shown while saving + shutting down" },
      ],
    },
    {
      id: "charging",
      label: "Charging Animation",
      slots: chargingSlots(),
    },
    {
      id: "brightness",
      label: "Brightness Slider",
      slots: lumSlots(),
    },
    {
      id: "toggle",
      label: "Toggle Switch",
      slots: [
        { id: "toggle-on", file: "skin/extra/toggle-on.png", w: 60, h: 30,
          desc: "Switch in the ON position (Package Manager, Tweaks)" },
        { id: "toggle-off", file: "skin/extra/toggle-off.png", w: 60, h: 30,
          desc: "Switch in the OFF position" },
      ],
    },
  ],
};

function chargingSlots() {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push({
      id: "chargingState" + i,
      file: "skin/extra/chargingState" + i + ".png",
      w: 28, h: 14,
      desc: "Charging animation frame " + (i + 1) + " / 24",
    });
  }
  return slots;
}

function lumSlots() {
  const slots = [];
  for (let i = 0; i <= 10; i++) {
    slots.push({
      id: "lum" + i,
      file: "skin/extra/lum" + i + ".png",
      w: 200, h: 20,
      desc: "Brightness slider step " + i + " / 10",
    });
  }
  return slots;
}

// Flat lookup, built once.
const ONION_SLOTS_FLAT = ONION_SPEC.groups.flatMap(g => g.slots.map(s => ({ ...s, group: g.id, groupLabel: g.label })));

function findSlot(id) {
  return ONION_SLOTS_FLAT.find(s => s.id === id);
}

/**
 * Default config.json written into exported themes. Keys reflect the
 * documented, stable parts of Onion's theme config (font path overrides,
 * which by v4+ can point at the bundled system fonts instead of shipping
 * font files — see onionui.github.io/docs/theme-design). Color/layout
 * keys are left as sensible documented-style defaults; verify against a
 * real theme's config.json if you need pixel-exact menu text placement,
 * since that level of layout detail isn't published as a single schema.
 */
function defaultOnionConfig(themeName, author) {
  return {
    name: themeName || "My Theme",
    author: author || "",
    version: "1.0",
    fonts: {
      regular: "/mnt/SDCARD/miyoo/app/Exo-2-Bold-Italic.ttf",
      title: "/mnt/SDCARD/miyoo/app/BPreplayBold.otf",
    },
    colors: {
      text: "#FFFFFF",
      textSelected: "#FFD23F",
      textMuted: "#999999",
    },
  };
}
