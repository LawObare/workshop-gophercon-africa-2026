# Jambo — The Living East African Safari Camp & Field Expedition

**Jambo** transforms wildlife occurrence records from GBIF and historical atmospheric telemetry from Open-Meteo into an interactive East African safari camp and bushcraft field journal.

## Design Philosophy & Emotional Direction

- **Built-In Circadian Savanna Sky**: Instead of a user-toggled dark mode or a flat beige template, Jambo sits beneath a continuous, built-in **24-Hour Savanna Sky** (*Alfajiri / Crimson Dawn*, *Mchana / Savanna Day*, *Machweo / Bright Red Dusk*, *Usiku / Starry Savanna Night*) complete with multi-depth feathered cloud wisps, an arcing equatorial sun and crescent moon, and a 300+ star twinkling night sky canvas.
- **Tactile Safari Postage & Specimen Dispatches**: Every wildlife sighting is presented as a stamped field dispatch carrying a real country postmark (`KENYA`, `TANZANIA`, `SOUTH AFRICA`), cardinal GPS coordinates, specimen serial (`JMB-xxx`), time-of-day light ribbon, and Open-Meteo weather badge.
- **Playful Bushcraft with Real Purpose**:
  - **Jambo Field Passport**: Visitors earn 6 rubber ink stamps as they witness the circadian savanna sky, test camouflage, play the silhouette challenge, and analyze field plates.
  - **Web Audio Bush Radio**: A zero-dependency Web Audio API synthesizer generates gentle savanna breeze, weaver-bird calls, and nocturnal crickets matched to the active sky phase.
  - **"Whose Silhouette in the Tall Grass?"**: An interactive wildlife identification game on `/spot` powered by real GBIF sighting photographs and field clues.
  - **HTML5 Canvas Biome Palette & Light Lab**: Extracts 5 real HEX colour swatches and estimates time-of-day light warmth from any wildlife photograph.

## Core Tokens (`web/assets/css/app.css`)

| Phase | Sky Dome Atmosphere | Primary Ink (`--text`) | Accent (`--accent`) |
|---|---|---|---|
| `dawn` (*Alfajiri*) | Deep ruby `#380818` → Maasai crimson `#be1e18` → scarlet-gold `#f7a43b` | `#FFF7ED` | `#FFCB57` |
| `day` (*Mchana*) | Equatorial cerulean `#4585c7` → azure `#8ec2eb` → warm dust `#f3e6ce` | `#121820` | `#B83C10` |
| `dusk` (*Machweo*) | Twilight garnet `#240615` → blazing red `#db2212` → ember `#f9b036` | `#FFF6EB` | `#FFC247` |
| `night` (*Usiku*) | Starlight cosmos `#030612` → nocturnal sapphire `#162f5c` + 300+ stars | `#F5F2EA` | `#FFBE4F` |

## Typography

- **Display & Species Titles**: **Fraunces** (`--display`) — optical-size serif with warm storybook curves.
- **Body & Field Notes**: **Plus Jakarta Sans** (`--body`) — clean, high-legibility humanist sans.
- **Telemetry, Coordinates & Postmarks**: **JetBrains Mono** (`--font-mono`) with `tabular-nums`.
