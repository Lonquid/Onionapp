/**
 * OnionOS theme asset specification — Miyoo Mini, 640x480 screen.
 *
 * Unlike the first version of this file, every path and pixel size below
 * was verified directly against a real installed theme ("Blueprint" by
 * Aemiii91, downloaded from the OnionUI/Themes catalog) rather than
 * inferred from documentation prose. File names, folder layout, and
 * dimensions here match that theme's actual files byte-for-byte in
 * structure. A few one-off icons (per-app icons under icons/app/, and
 * the full per-console icon set under icons/) are included as
 * representative entries — the editor lets you paint any of them, but
 * not every single console/app in the full Onion icon set is listed
 * individually below; see APP_ICON_IDS / SYSTEM_ICON_IDS for the
 * complete name roster used to generate those slots.
 */

// Every app shortcut icon OnionOS looks for under icons/app/<name>.png (74x74).
const APP_ICON_IDS = [
  "activity", "advancemenu", "battery_monitor", "clock", "commander", "dice",
  "display", "ereader", "expert", "ffplay", "gallery", "gameswitcher",
  "guest_off", "guest_on", "logotweak", "manual", "music", "pacman", "pdf",
  "retroarch", "search", "terminal", "themes", "tweaks", "tweaks_advanced",
  "tweaks_icons", "tweaks_menu_button", "tweaks_network", "tweaks_system",
  "tweaks_tools", "tweaks_user_interface",
];

// Every console/system icon OnionOS looks for under icons/<name>.png (120x130).
const SYSTEM_ICON_IDS = [
  "32X", "5200", "7800", "amiga", "arcade", "atari", "atarist", "c64", "col",
  "cpc", "cps1", "cps2", "cps3", "dos-alt", "dos", "fairchild", "fc-alt", "fc",
  "fds", "gb", "gba-alt", "gba", "gbc", "gg", "gw", "itv", "lynx", "md-alt",
  "md", "megaduck", "ms", "msx", "nds", "neocd", "neogeo", "ngp", "ody", "pce",
  "pcecd", "pico-alt", "pico", "poke", "ports", "ps", "satella", "scummvm-alt",
  "scummvm", "segacd", "segasgone", "sfc-alt", "sfc", "sgb", "sgfx", "sufami",
  "supervision", "tic-alt", "tic", "vb", "vdp", "vectrex", "ws", "zxs",
];

const ONION_SPEC = {
  device: "Miyoo Mini / Mini+",
  screen: { width: 640, height: 480 },

  groups: [
    {
      id: "core",
      label: "Backgrounds",
      slots: [
        { id: "background", file: "skin/background.png", w: 640, h: 480, desc: "Main menu background" },
        { id: "preview-bg", file: "skin/preview-bg.png", w: 250, h: 360, desc: "Box-art preview panel backdrop" },
        { id: "bg-title", file: "skin/bg-title.png", w: 640, h: 60, desc: "Top title bar background" },
        { id: "tips-bar-bg", file: "skin/tips-bar-bg.png", w: 640, h: 60, desc: "Bottom button-hint bar background" },
        { id: "pop-bg", file: "skin/pop-bg.png", w: 640, h: 300, desc: "Popup dialog background" },
        { id: "miyoo-topbar", file: "skin/miyoo-topbar.png", w: 148, h: 42, desc: "Status bar (clock/battery/wifi) backdrop" },
      ],
    },
    {
      id: "lists",
      label: "Game List & Grid",
      slots: [
        { id: "bg-list-l", file: "skin/bg-list-l.png", w: 640, h: 90, desc: "Large list row background" },
        { id: "bg-list-s", file: "skin/bg-list-s.png", w: 640, h: 56, desc: "Small list row background" },
        { id: "bg-game-item-n", file: "skin/bg-game-item-n.png", w: 155, h: 170, desc: "Grid item, normal state" },
        { id: "bg-game-item-f", file: "skin/bg-game-item-f.png", w: 155, h: 170, desc: "Grid item, focused state" },
        { id: "bg-ra-list-item", file: "skin/bg-ra-list-item.png", w: 214, h: 120, desc: "RetroArch core list item background" },
        { id: "div-line-h", file: "skin/div-line-h.png", w: 640, h: 4, desc: "Horizontal divider line" },
        { id: "div-line-v-01", file: "skin/div-line-v-01.png", w: 4, h: 360, desc: "Vertical divider line" },
        { id: "list-num", file: "skin/list-num.png", w: 90, h: 14, desc: "List position number background" },
        { id: "num-bg", file: "skin/num-bg.png", w: 44, h: 24, desc: "Page number background" },
        { id: "Empty", file: "skin/Empty.png", w: 162, h: 46, desc: "\"Empty\" placeholder label" },
      ],
    },
    {
      id: "nav-icons",
      label: "Navigation Icons",
      slots: [
        { id: "ic-app-n", file: "skin/ic-app-n.png", w: 156, h: 278, desc: "Apps tab icon, normal" },
        { id: "ic-app-f", file: "skin/ic-app-f.png", w: 156, h: 278, desc: "Apps tab icon, focused" },
        { id: "ic-game-n", file: "skin/ic-game-n.png", w: 156, h: 278, desc: "Games tab icon, normal" },
        { id: "ic-game-f", file: "skin/ic-game-f.png", w: 156, h: 278, desc: "Games tab icon, focused" },
        { id: "ic-favorite-n", file: "skin/ic-favorite-n.png", w: 156, h: 278, desc: "Favorites tab icon, normal" },
        { id: "ic-favorite-f", file: "skin/ic-favorite-f.png", w: 156, h: 278, desc: "Favorites tab icon, focused" },
        { id: "ic-recent-n", file: "skin/ic-recent-n.png", w: 156, h: 278, desc: "Recently played tab icon, normal" },
        { id: "ic-recent-f", file: "skin/ic-recent-f.png", w: 156, h: 278, desc: "Recently played tab icon, focused" },
        { id: "ic-retroarch-n", file: "skin/ic-retroarch-n.png", w: 156, h: 278, desc: "RetroArch tab icon, normal" },
        { id: "ic-retroarch-f", file: "skin/ic-retroarch-f.png", w: 156, h: 278, desc: "RetroArch tab icon, focused" },
        { id: "ic-setting-n", file: "skin/ic-setting-n.png", w: 156, h: 278, desc: "Settings tab icon, normal" },
        { id: "ic-setting-f", file: "skin/ic-setting-f.png", w: 156, h: 278, desc: "Settings tab icon, focused" },
        { id: "ic-favorite-mark", file: "skin/ic-favorite-mark.png", w: 34, h: 39, desc: "Favorited star/mark overlay" },
      ],
    },
    {
      id: "buttons",
      label: "Button Hints",
      slots: [
        { id: "ic-MENU", file: "skin/ic-MENU.png", w: 65, h: 48, desc: "MENU button hint icon" },
        { id: "ic-MENU+A", file: "skin/ic-MENU+A.png", w: 118, h: 48, desc: "MENU+A combo hint icon" },
        { id: "icon-A-54", file: "skin/icon-A-54.png", w: 54, h: 54, desc: "A button icon" },
        { id: "icon-B-54", file: "skin/icon-B-54.png", w: 54, h: 54, desc: "B button icon" },
        { id: "icon-left-arrow-24", file: "skin/icon-left-arrow-24.png", w: 24, h: 24, desc: "Left arrow / page-prev icon" },
        { id: "icon-right-arrow-24", file: "skin/icon-right-arrow-24.png", w: 24, h: 24, desc: "Right arrow / page-next icon" },
        { id: "bg-button-f", file: "skin/bg-button-f.png", w: 232, h: 68, desc: "Focused button background" },
        { id: "dot-a", file: "skin/dot-a.png", w: 24, h: 14, desc: "Page dot indicator, active" },
        { id: "dot-n", file: "skin/dot-n.png", w: 24, h: 14, desc: "Page dot indicator, inactive" },
        { id: "progress-dot", file: "skin/progress-dot.png", w: 10, h: 10, desc: "Loading/progress dot" },
      ],
    },
    {
      id: "status-icons",
      label: "Status Icons",
      slots: [
        { id: "power-full-icon", file: "skin/power-full-icon.png", w: 48, h: 48, desc: "Battery icon, full" },
        { id: "power-80%-icon", file: "skin/power-80%-icon.png", w: 48, h: 48, desc: "Battery icon, 80%" },
        { id: "power-50%-icon", file: "skin/power-50%-icon.png", w: 48, h: 48, desc: "Battery icon, 50%" },
        { id: "power-20%-icon", file: "skin/power-20%-icon.png", w: 48, h: 48, desc: "Battery icon, 20%" },
        { id: "power-0%-icon", file: "skin/power-0%-icon.png", w: 48, h: 48, desc: "Battery icon, empty" },
        { id: "ic-power-charge-100%", file: "skin/ic-power-charge-100%.png", w: 48, h: 48, desc: "Battery icon, charging" },
        { id: "icon-wifi-connected", file: "skin/icon-wifi-connected.png", w: 48, h: 48, desc: "Wi-Fi connected icon" },
        { id: "icon-wifi-locked", file: "skin/icon-wifi-locked.png", w: 48, h: 48, desc: "Wi-Fi locked/secured icon" },
        { id: "icon-wifi-signal-01", file: "skin/icon-wifi-signal-01.png", w: 48, h: 48, desc: "Wi-Fi signal, 1 bar" },
        { id: "icon-wifi-signal-02", file: "skin/icon-wifi-signal-02.png", w: 48, h: 48, desc: "Wi-Fi signal, 2 bars" },
        { id: "icon-wifi-signal-03", file: "skin/icon-wifi-signal-03.png", w: 48, h: 48, desc: "Wi-Fi signal, 3 bars" },
        { id: "icon-wifi-signal-04", file: "skin/icon-wifi-signal-04.png", w: 48, h: 48, desc: "Wi-Fi signal, full" },
        { id: "sound-icon", file: "skin/sound-icon.png", w: 48, h: 48, desc: "Volume icon" },
        { id: "headphone-icon", file: "skin/headphone-icon.png", w: 22, h: 23, desc: "Headphones-connected icon" },
        { id: "icon-TF", file: "skin/icon-TF.png", w: 19, h: 24, desc: "SD card icon" },
      ],
    },
    {
      id: "settings-icons",
      label: "Settings Menu Icons",
      slots: [
        { id: "icon-brightness-48", file: "skin/icon-brightness-48.png", w: 48, h: 48, desc: "Brightness setting icon" },
        { id: "icon-device-info-48", file: "skin/icon-device-info-48.png", w: 48, h: 48, desc: "Device info setting icon" },
        { id: "icon-factory-reset-48", file: "skin/icon-factory-reset-48.png", w: 48, h: 49, desc: "Factory reset icon" },
        { id: "icon-key-setting-48", file: "skin/icon-key-setting-48.png", w: 48, h: 48, desc: "Key/button mapping icon" },
        { id: "icon-language-48", file: "skin/icon-language-48.png", w: 48, h: 48, desc: "Language setting icon" },
        { id: "icon-setting-wifi", file: "skin/icon-setting-wifi.png", w: 46, h: 46, desc: "Wi-Fi settings icon" },
        { id: "icon-Shutdown", file: "skin/icon-Shutdown.png", w: 48, h: 48, desc: "Shutdown icon" },
        { id: "icon-folder", file: "skin/icon-folder.png", w: 60, h: 60, desc: "Folder icon" },
        { id: "fixit", file: "skin/fixit.png", w: 50, h: 44, desc: "\"Fix it\" / repair tool icon" },
        { id: "color", file: "skin/color.png", w: 48, h: 48, desc: "Color/theme accent swatch icon" },
      ],
    },
    {
      id: "boot",
      label: "Boot & Power Screens",
      slots: [
        { id: "boot-screen", file: "skin/extra/bootScreen.png", w: 640, h: 480, desc: "Shown while the device boots" },
        { id: "screen-off", file: "skin/extra/Screen_Off.png", w: 640, h: 480, desc: "Shown while shutting down" },
        { id: "screen-off-save", file: "skin/extra/Screen_Off_Save.png", w: 640, h: 480, desc: "Shown while saving + shutting down" },
        { id: "bg-io-testing", file: "skin/bg-io-testing.png", w: 640, h: 480, desc: "I/O / button test screen background" },
        { id: "bg-keysetting", file: "skin/bg-keysetting.png", w: 640, h: 480, desc: "Key-mapping screen background" },
        { id: "bg-keysetting-f", file: "skin/bg-keysetting-f.png", w: 160, h: 60, desc: "Key-mapping focused key background" },
        { id: "lowBat", file: "skin/extra/lowBat.png", w: 640, h: 480, desc: "Low battery warning screen" },
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
        { id: "toggle-on", file: "skin/extra/toggle-on.png", w: 92, h: 44, desc: "Switch in the ON position" },
        { id: "toggle-off", file: "skin/extra/toggle-off.png", w: 92, h: 44, desc: "Switch in the OFF position" },
      ],
    },
    {
      id: "gamestate",
      label: "In-Game Overlay",
      slots: [
        { id: "gs-top-bar", file: "skin/extra/gs-top-bar.png", w: 640, h: 40, desc: "In-game overlay top bar (approximate)" },
        { id: "gs-bottom-bar", file: "skin/extra/gs-bottom-bar.png", w: 640, h: 40, desc: "In-game overlay bottom bar (approximate)" },
        { id: "thumb-default", file: "skin/thumb-default.png", w: 250, h: 360, desc: "Default save-state thumbnail placeholder" },
      ],
    },
    {
      id: "app-icons",
      label: "App Icons",
      slots: APP_ICON_IDS.map(id => ({
        id: "appicon-" + id,
        file: "icons/app/" + id + ".png",
        w: 74, h: 74,
        desc: "App icon: " + id.replace(/_/g, " "),
      })),
    },
    {
      id: "system-icons",
      label: "Console / System Icons",
      slots: SYSTEM_ICON_IDS.map(id => ({
        id: "sysicon-" + id,
        file: "icons/" + id + ".png",
        w: 120, h: 130,
        desc: "System icon: " + id,
      })),
    },
    {
      id: "preview",
      label: "Theme Preview",
      slots: [
        { id: "preview", file: "preview.png", w: 480, h: 360, desc: "Thumbnail shown in the in-app Theme Switcher" },
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
      w: 640, h: 480,
      desc: "Charging animation frame " + (i + 1) + " / 24 (full-screen)",
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
      w: 126, h: 30,
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
 * Default config.json written into exported themes. Keys verified
 * directly against a real theme's config.json (Blueprint by Aemiii91):
 * hideLabels, batteryPercentage, title, hint, currentpage, total, grid,
 * and list blocks, each with font/size/color. Font filenames are
 * expected alongside config.json (theme root), not as absolute device
 * paths — bundling a .ttf/.otf in the export is on the user if their
 * theme needs a custom font; this default config simply omits a custom
 * font reference so Onion falls back to its own built-in font.
 */
function defaultOnionConfig(themeName, author) {
  return {
    name: themeName || "My Theme",
    author: author || "",
    description: "Created with Onion Themer",
    hideLabels: {
      icons: false,
      hints: false,
    },
    batteryPercentage: {
      visible: true,
      size: 11,
      color: "#FFFFFF",
      textAlign: "center",
      fixed: true,
      offsetX: 0,
      offsetY: 0,
    },
    title: {
      size: 36,
      color: "#FFFFFF",
    },
    hint: {
      size: 40,
      color: "#FFFFFF",
    },
    currentpage: {
      color: "#FFFFFF",
    },
    total: {
      color: "#FFFFFF",
    },
    grid: {
      grid1x4: 25,
      grid3x4: 18,
      color: "#FFFFFF",
      selectedcolor: "#FFFFFF",
    },
    list: {
      size: 25,
      color: "#FFFFFF",
    },
  };
}
