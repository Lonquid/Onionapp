/**
 * Built-in starting templates. Each template provides a base fill color
 * (or simple gradient) per slot group, so a new project doesn't open to
 * a totally blank canvas. These are intentionally simple — they're a
 * starting point for painting, not finished themes.
 */

const ONION_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Every slot starts transparent. Full creative control.",
    swatch: ["#15131A", "#15131A", "#15131A"],
    fill: { mode: "transparent" },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description: "Cool technical-drawing blue, fine grid lines, white accents.",
    swatch: ["#0E2A47", "#1C4D7C", "#FFFFFF"],
    fill: { mode: "grid", bg: "#123A5E", line: "#1C5C94", accent: "#FFFFFF" },
  },
  {
    id: "sunset",
    name: "Sunset Handheld",
    description: "Warm gradient background, soft orange-to-purple.",
    swatch: ["#2B1055", "#7C2F6E", "#FF7A45"],
    fill: { mode: "gradient", from: "#2B1055", to: "#FF7A45" },
  },
  {
    id: "mono",
    name: "Mono Terminal",
    description: "High-contrast black & green, monospace energy.",
    swatch: ["#05140A", "#0C2B17", "#39FF7A"],
    fill: { mode: "solid", bg: "#05140A", accent: "#39FF7A" },
  },
  {
    id: "pastel",
    name: "Pastel Pocket",
    description: "Soft pink/lilac palette, rounded and friendly.",
    swatch: ["#FBE9F2", "#E8D5F2", "#C9A6E0"],
    fill: { mode: "solid", bg: "#F3E3F1", accent: "#9B6BB5" },
  },
  {
    id: "carbon",
    name: "Carbon Fiber",
    description: "Dark woven-texture look, red accent highlights.",
    swatch: ["#161616", "#262626", "#D8232A"],
    fill: { mode: "weave", bg: "#1A1A1A", line: "#262626", accent: "#D8232A" },
  },
];

function getTemplate(id) {
  return ONION_TEMPLATES.find(t => t.id === id) || ONION_TEMPLATES[0];
}
