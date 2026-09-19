# Chiropractic Nerd brand assets

The approved Variation 2 masters live in `public/brand/v2/`. Keep their vector
paths as the source artwork. The site uses SVG directly for sharp logos at any
screen resolution; PNG and ICO versions are browser and home-screen fallbacks.

| Asset | Use |
| --- | --- |
| `brand/v2/chiropractic-nerd-logo-horizontal.svg` | Compact header logo, derived from the original mark and outlined wordmark |
| `brand/v2/chiropractic-nerd-logo.svg` | Original stacked logo and tagline, used in the footer |
| `brand/v2/chiropractic-nerd-mark.svg` | Standalone colored brain-question-mark |
| `favicon.svg` | V2 browser icon with a light background for visibility in light or dark tabs |
| `favicon.ico` | Legacy fallback with 16, 32, and 48px images |
| `favicon-16x16.png`, `favicon-32x32.png` | Small raster exports; the 32px version is linked in the document head |
| `apple-touch-icon.png` | Opaque 180px Apple home-screen icon |
| `icon-192.png`, `icon-512.png` | Opaque app/bookmark icons referenced by `site.webmanifest` |

All paths in the table are relative to `public/`. The shared layout links the
icons and manifest on every page. Logo images have explicit dimensions and
accessible home links. The manifest retains ordinary browser navigation and
does not add a service worker or offline behavior.

## Regeneration

The generated files are committed, so normal builds need no image-conversion
dependencies. To regenerate after updating the masters, install Python 3,
Pillow, and Inkscape, then run `python3 scripts/generate-brand-assets.py` from
the repository. The script reuses the exact mark and wordmark paths and exports
the icon sizes locally. It does not use a conversion website or require fonts.

After regeneration, inspect the header on desktop and mobile and check the
16px and 32px icons. Run `npm test` and `npm run build`. Updating the shared
layout also requires the semantic review described in `docs/model-review.md`.

Browser favicons may remain cached after deployment. When checking a newly
deployed version, also open `/favicon.svg` directly or use a fresh browser
profile.
