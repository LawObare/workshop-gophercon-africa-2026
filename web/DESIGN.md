# Jambo — The Living East African Safari Camp & Field Expedition

**Jambo** transforms wildlife occurrence records from GBIF and historical atmospheric telemetry from Open-Meteo into an interactive East African safari camp and bushcraft field journal.

## Design Philosophy & Emotional Direction

- **Circadian Savanna Atmosphere**: Instead of a static dark-mode SaaS dashboard or a flat beige template, Jambo revolves around the **24-Hour Savanna Sun Dial** (*Alfajiri / Dawn*, *Mchana / Daylight*, *Machweo / Golden Hour*, *Usiku / Night Patrol*). Visitors can shift the camp's sky atmosphere at any time, or click a circadian time window to filter sightings recorded during those hours.
- **Tactile Safari Postage & Specimen Dispatches**: Every wildlife sighting is presented as a stamped field dispatch carrying a real country postmark (`KENYA`, `TANZANIA`, `SOUTH AFRICA`), cardinal GPS coordinates, specimen serial (`JMB-xxx`), time-of-day light ribbon, and Open-Meteo weather badge.
- **Playful Bushcraft with Real Purpose**:
  - **Jambo Field Passport**: Visitors earn 6 rubber ink stamps as they explore the sky dial, test camouflage, play the silhouette challenge, and analyze field plates.
  - **Web Audio Bush Radio**: A zero-dependency Web Audio API synthesizer generates gentle savanna breeze, weaver-bird calls, and nocturnal crickets matched to the active sky mode.
  - **"Whose Silhouette in the Tall Grass?"**: An interactive wildlife identification game on `/spot` powered by real GBIF sighting photographs and field clues.
  - **HTML5 Canvas Biome Palette & Light Lab**: Extracts 5 real HEX colour swatches and estimates time-of-day light warmth from any wildlife photograph.

## Core Tokens (`web/assets/css/app.css`)

| Token | Daylight (`day`) | Night Patrol (`night`) | Role |
|---|---|---|---|
| `--bg` | `#F6EFE0` | `#10161F` | Sun-bleached papyrus canvas / Starlight indigo |
| `--surface` | `#FFFDF8` | `#18212E` | Field specimen cardstock / Nocturnal slate |
| `--text` | `#1B1611` | `#F4EFE6` | Roasted acacia charcoal / Moonlight bone |
| `--accent` | `#C85219` | `#E89923` | Tsavo red-earth terracotta / Headlamp amber |
| `--accent-acacia` | `#234E33` | `#3D7A52` | Fever-tree acacia canopy green |
| `--accent-gold` | `#D99316` | `#F6C453` | Mara sun gold |

## Typography

- **Display & Species Titles**: **Fraunces** (`--display`) — optical-size serif with warm storybook curves.
- **Body & Field Notes**: **Plus Jakarta Sans** (`--body`) — clean, high-legibility humanist sans.
- **Telemetry, Coordinates & Postmarks**: **JetBrains Mono** (`--font-mono`) with `tabular-nums`.
