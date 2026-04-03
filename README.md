# HKSC Interactive Floor Map

This repository contains floor-plan SVG files and a web-based viewer that supports:

- 3D stacked floor visualization
- single-level front-view inspection
- automatic flat (non-3D) mode for selected levels
- zoom/rotate controls

## Project Structure

### Viewer

- `index.html`: Main page structure and control panel
- `styles.css`: Visual style, 3D prism rendering, flat-mode rendering
- `app.js`: Floor loading, view state, interactions, and camera behavior

### Floor Sources

- `G_F.svg`
- `1_F.svg`
- `2_F.svg`
- `3_F.svg`
- `4_F.svg`
- `5_F.svg`

### Legacy/Reference Files

- `G_F.html`
- `1_F.html`
- `2_F.html`
- `3_F.html`
- `4_F.html`
- `5_F.html`

These HTML files are no longer used by the viewer runtime; the viewer loads from the `.svg` files.

## Final Behavior Implemented

### Floor Selection

- `All`: shows full stack
- specific level (`G`, `1F`, `2F`, `3F`, `4F`, `5F`): shows only that one level

### Camera/View Rules

- selecting `All` switches to isometric
- selecting a specific level switches to front view
- selected single level uses flat non-3D zoom mode
- multi-level stack remains in 3D mode

### Zoom and Interaction

- expanded zoom range for closer inspection
- wheel zoom and +/- button zoom use shared limits
- drag/click suppression fix to prevent accidental view reset after drag

### Visual Rendering

- stronger wall depth for 3D slab effect
- removed per-floor card-style white fill
- removed floor face borders
- reduced blur from CSS filter compositing
- SVG render hints enabled for better vector precision at zoom

## SVG Cleanup Completed

The following cleanups were applied across floor SVG assets:

- removed all `xlink:*` usage (`xlink:href`, etc.)
- removed `xmlns:xlink` declarations
- removed all `#fas-fa-circle` icon wrapper uses
- removed all `svg-inline--fa fa-circle` icon blocks

## Run Locally

The viewer fetches local `.svg` files, so run with a local HTTP server (not `file://`).

Options:

- VS Code Live Server: open `index.html` with Live Server
- any static server from this folder

Then open `index.html` via the server URL.

## Notes

- Floor order is currently reversed in the UI/stack: `5F -> 4F -> 3F -> 2F -> 1F -> G`.
- If you want to change order, edit `FLOOR_FILES` in `app.js`.

## License

Add your project license details here.
