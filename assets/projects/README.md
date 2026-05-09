# Project assets

Logos and screenshots for each project. Drop final files here.

## Logos (32×32 SVG)

Convention: monochrome, `currentColor` on shapes, `color` attribute on `<svg>` root as fallback for `<img>` rendering. CSS filter inverts in dark mode.

- `sayndex.svg` — placeholder (S)
- `clausulazo.svg` — placeholder (C)
- `trustforge.svg` — placeholder (T)
- `motick.svg` — placeholder (M)

Replace any placeholder by overwriting the file with the same name. The helper `renderProjectLogo(name, size)` in index.html reads `assets/projects/{name}.svg`.

## Screenshots (PNG, recommended 1280×800)

Naming: `{project}-screenshot-{n}.png` where `n` is `1..3`.

- `sayndex-screenshot-1.png` … `sayndex-screenshot-3.png`
- `clausulazo-screenshot-1.png` … `-3.png`
- `trustforge-screenshot-1.png` … `-3.png`
- `motick-screenshot-1.png` … `-3.png`
