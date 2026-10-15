# Golden Hour: design

A cinematic, dark wildlife site. Full-screen photos under dark gradients, very large serif
headlines, one warm accent, and thin outlined buttons and frames. Every sighting is tinted by
the time of day it happened and the weather on the day.

## Colours (`web/assets/css/app.css`, `:root`)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#1C1110` | page background, deep maroon-brown |
| `--bg-deep` | `#120B0A` | banner behind photos, footer |
| `--surface` / `--surface-2` | `#241614` / `#2E1D1A` | tiles, panels, empty photo slots |
| `--text` | `#F4EADF` | cream text |
| `--text-soft` | cream at 82% | body copy on photos |
| `--muted` | `#A8857C` | rosewood labels (5.4:1 on `--bg`) |
| `--accent` | `#F07A4A` | sunset coral: eyebrows, counters, chips, map markers |
| `--line` / `--line-strong` | cream at 14% / 36% | hairline borders, outlined buttons |

The light tints, set by `.tone--*` from when the sighting happened:

| Class | Hours | Name shown | `--glow` |
|-------|-------|-----------|----------|
| `tone--dawn` | 5–8 | First light | `#F2A7A0` rose |
| `tone--day` | 8–16 | Daylight | `#F5C76A` gold |
| `tone--dusk` | 16–20 | Golden hour | `#F07A4A` coral |
| `tone--night` | 20–5 | After dark | `#7D8CC4` moon blue |
| `tone--unknown` | only a date | Time unknown | `#C9A98F` sand |

The weather classes (`sky--rain`, `--fog`, `--snow` and so on) set `--haze`, which is washed over
the photo, and `--wash`, which desaturates it. The glow is blended with `soft-light` from the
bottom edge up.

## Lettering

- Headlines: **Marcellus** (`--display`), chiselled wedge serifs. Banner title 6–18rem with wide
  letter-spacing; section titles from `.display` at 2.25–4.25rem.
- Body: **Nunito Sans** (`--body`), soft and rounded. 300 weight for ledes, 600–700 for labels.
- Eyebrows: 0.78rem, uppercase, 0.24em tracking, in the accent colour.
- Animal names are capitalised in CSS (`text-transform: capitalize`), because GBIF's names
  arrive in mixed case.

## Shape and space

- Radii: `--radius-sm` 8px, `--radius` 14px, `--radius-lg` 22px for tiles and panels, `--pill`
  for buttons and chips.
- `--gutter` is clamp(1.25rem, 4vw, 3rem); content is at most `--max` 76rem wide.
- Sections are roomy: 5–9rem padding top and bottom.

## Components

- **Header**: fixed. A dark gradient at the top of the page, frosted glass once scrolled (an
  IntersectionObserver on `.scroll-sentinel`). The logo is an acacia against a coral sun; the
  wordmark hides below 480px.
- **Banner** (`components.Hero`): three featured sightings that cross-fade every 8s.
  - Each photo drifts slowly (scale 1.12 to 1.02 over 14s).
  - The letters of WILD rise in one after another.
  - A thin outlined frame is inset from the edges.
  - An "01/03" counter and caption, the stats inline at the bottom right, and the data sources
    running up the left edge.
  - The slideshow pauses on hover, focus or with its pause button, and doesn't auto-play under
    reduced motion.
- **Tile** (`components.SightingCard`): a 4:3 photo with the light's glow and a chip naming it,
  and a 2px glow line along the top. Below the photo: a serif name, the scientific name in
  italics, then a details list (seen, where, weather, count, recorded by). It lifts 4px on hover
  (pointer devices only) and presses to 0.985.
- **Latest finds**: a row that snaps into place like Apple Photos, outside the container so it
  runs to the edge of the screen.
- **Globe** (`scenes/globe.js`): a dark sphere of Fibonacci dots, with each sighting a glowing
  point in its light's colour. Drag sideways to spin it; vertical drags scroll the page.
- **Journal**: filter chips for light, animal and country, plus search, in a surface panel above
  a grid of tiles.
- **Sighting page**: a full-screen photo that morphs from the banner or latest card it was opened
  from (`view-transition-name: var(--vt)`). Below it, frosted panels for field notes, conditions
  on the day, a dark Leaflet map and a snapping photo strip with the lightbox.
- **Gallery**: a photo wall in which every 7th tile is 2×2. Captions show on hover on a laptop
  and are always shown on touch screens.
- **Stats**: large serif numbers, a sparkline and bar charts. The light chart is coloured per
  light.
- **404**: "The trail went cold". Paw prints appear one by one, fade, and end at a pulsing coral
  dot.

## Motion

From the `.agents` skills (apple-design, animate, animation-performance):

- Curves:
  - `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` for UI.
  - `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)` for cross-fades.
  - `--ease-spring` `cubic-bezier(0.16, 1, 0.3, 1)` for lifts.
- Presses respond on `:active` at 80ms. Hovers are gated behind
  `(hover: hover) and (pointer: fine)`.
- Only `transform` and `opacity` are animated. `backdrop-filter` is used only on the header and
  the few panels, never on the 100 tiles.
- Reduced motion: no drift, letter rise, autoplay or paw-print loop; cross-fades become
  instant. Reduced transparency: the glass becomes solid `--surface`.

## Avoid

- Blue, or any second accent colour.
- Light backgrounds.
- Sans-serif headlines.
- Blur on repeated elements.
- More than one `view-transition-name` per sighting on a page, and never one on the journal list.
