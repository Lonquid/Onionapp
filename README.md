# Onion Themer

A paint-program-style Android app for designing OnionOS themes (built for
the Miyoo Mini's 640×480 / 480×640 portrait screen). Start a new project
from a built-in template or open a saved one, paint every themeable asset
slot on its own layer stack — brush, eraser, fill, shapes, eyedropper,
blend modes, opacity, undo/redo — then export a ready-to-flash theme ZIP.

This repo has **no committed APK**. It's the full Android Studio /
Gradle project source. You get the actual installable `.apk` by letting
GitHub build it for you, for free, in the cloud — no Android Studio
required.

## Get the APK (no tools needed)

1. Create a new repository on GitHub (any name, can be private).
2. Upload every file in this folder to that repo, preserving the folder
   structure (the `.github/workflows/build.yml` file especially — GitHub
   only picks up workflows from that exact path).
   - Easiest way if you don't use git: on the repo's GitHub page, use
     "Add file → Upload files" and drag the whole folder in. GitHub's
     web uploader preserves subfolders when you drag a folder.
3. Go to the **Actions** tab of your repo. A workflow run called
   "Build APK" should start automatically (it runs on every push). If it
   doesn't, click "Build APK" in the left sidebar -> "Run workflow".
4. Wait for the green checkmark (a few minutes -- first run is slower).
5. Click into the finished run, scroll to **Artifacts**, and download
   `OnionThemer-debug-apk`. Unzip it -- that's your `.apk`.
6. Copy the APK to your phone (email it to yourself, Google Drive, USB,
   whatever's easiest) and tap it to install. Android will warn about
   "unknown sources" the first time -- that's expected for a sideloaded
   app; allow it for this file.

That's it -- no Android Studio, no command line, no signing keys to
manage (it's signed with the standard Android debug key, which is fine
for installing on your own device).

## What it does

- **Start screen** -> New project or Open saved project (`.onproj` files).
- **Template picker** -> six starting points (Blank, Blueprint, Sunset
  Handheld, Mono Terminal, Pastel Pocket, Carbon Fiber), each pre-filling
  every asset slot with a simple background so you're not staring at a
  blank canvas.
- **Editor**:
  - Left rail (top strip on phones) lists every paintable OnionOS asset
    slot -- background, logo, battery frame, charging animation frames,
    brightness slider steps, toggle switch states, boot screens, etc. --
    each at its correct pixel size.
  - Each slot has its own independent layer stack: add/duplicate/delete
    layers, reorder, toggle visibility, set blend mode and opacity.
  - Tools: brush (size/opacity/hardness), eraser, flood fill, rectangle,
    ellipse, line, eyedropper. Undo/redo per slot.
  - Save the whole project (every slot, every layer) to a `.onproj` file
    via Android's normal file picker, so you can pick it up later.
  - Export bundles every painted slot into the real OnionOS folder
    layout (`<Theme Name>/config.json`, `<Theme Name>/skin/*.png`,
    `<Theme Name>/skin/extra/*.png`) inside a ZIP, ready to unzip into
    `/Themes` on your Miyoo Mini's SD card.

## A note on the theme spec

The asset slot names, paths, and pixel sizes here are built from Onion's
public theme-design documentation and the community theme repo
structure. A few sizes (battery frame, clock, footer, scrollbar) aren't
published as an exact pixel spec anywhere -- those are reasonable
defaults based on the Miyoo Mini's screen. If something doesn't line up
once you flash a theme to a real device, the **file names and folder
structure are still correct** (that's the part Onion actually requires);
only the starting canvas size for a couple of slots might need
adjusting. Cross-checking against a real downloaded theme (e.g.
"Blueprint by Aemiii91" from the OnionUI/Themes repo) before your first
real flash is a good sanity check.

## Developing / previewing without building the APK

Everything under `app/src/main/assets/www/` is a self-contained, fully
offline web app (no CDN dependencies -- JSZip is bundled locally). You
can open `app/src/main/assets/www/index.html` directly in a desktop
browser to iterate on the UI quickly; a small fallback layer
(`js/bridge.js`) swaps in normal browser downloads/file-pickers when the
native Android bridge isn't present, so save/open/export all still work
for local testing.

## Project structure

```
app/src/main/
  java/com/onionthemer/app/MainActivity.kt   - WebView host + native file I/O bridge
  assets/www/                                - the entire app (HTML/CSS/JS)
    index.html
    css/                                      - base, start, templates, editor styles
    js/
      spec.js              - OnionOS asset slot definitions (names, paths, sizes)
      templates-data.js    - built-in starting templates
      layer-engine.js       - per-slot layer stack: compositing, undo/redo, serialization
      painter.js            - brush/eraser/fill/shapes/eyedropper input handling
      storage.js            - ThemeProject model, recent-projects list
      bridge.js             - native Android bridge wrapper + browser fallback
      exporter.js           - flattens layers, builds the OnionOS ZIP
      ui-start.js / ui-templates.js / ui-editor.js - screen controllers
      app.js                - screen router / bootstrap
.github/workflows/build.yml  - CI: builds a debug APK on every push
```
