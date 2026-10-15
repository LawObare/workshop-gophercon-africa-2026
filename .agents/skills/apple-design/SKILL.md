---
name: apple-design
description: Complete Apple Human Interface Guidelines (HIG) and WWDC fluid motion system for web applications. Use when designing, building, restyling, or facelifting interfaces to look and feel like modern Apple software (macOS/iOS) with translucent glassmorphism, squircle cards, SF Pro typography, dark mode, weather widgets, and fluid micro-interactions.
argument-hint: "[target component, page, or style to design/facelift]"
allowed-tools:
  - Bash(make templ)
  - Bash(go build ./...)
  - Bash(curl -s http://localhost:*)
  - Edit(**/web/**)
  - View(**/web/**)
---

# Apple Design System & Fluid Interface Skill

This skill equips AI agents and bots to implement Apple-grade, WWDC-standard interfaces on the web. It translates Apple's Human Interface Guidelines (HIG) and *Designing Fluid Interfaces* principles into concrete CSS tokens, semantic HTML, and component patterns.

---

## Autonomous Bot Execution Workflow

When instructed to apply Apple design or facelift the interface:

1. **Do not output generic greeting messages.** Immediately inspect the existing templates and stylesheets.
2. **Read the target files**:
   - View `web/assets/css/app.css` to inspect existing styles.
   - View `web/views/layout/layout.templ`, `web/views/pages/home.templ`, and component templates.
3. **Apply the Apple Design System**:
   - Inject the Apple CSS Design Tokens (color system, SF Pro typography, squircle radius, translucent glass, elevation).
   - Modernize HTML layout in `.templ` files (translucent sticky navigation, hero stats strip, squircle cards, weather/location badges, horizontal scroll-snap gallery).
4. **Compile & Verify**:
   - Run `make templ` to regenerate Go code from `.templ` files.
   - Run `go build ./...` to verify there are no syntax or type errors.
   - Test the HTTP response with `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/`.

---

## 1. Apple CSS Design Tokens

Inject these foundational design tokens into `:root` and `@media (prefers-color-scheme: dark)`:

```css
:root {
  /* System Fonts */
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
    "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: "SF Mono", Menlo, Monaco, Consolas, monospace;

  /* Typography Scale */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.8125rem;    /* 13px */
  --text-base: 0.9375rem;  /* 15px */
  --text-lg: 1.0625rem;    /* 17px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 2rem;        /* 32px */
  --text-4xl: 2.5rem;      /* 40px */

  /* Light Mode Palette */
  --bg-canvas: #f5f5f7;
  --bg-surface: rgba(255, 255, 255, 0.82);
  --bg-surface-solid: #ffffff;
  --bg-surface-secondary: #f2f2f7;
  --bg-surface-tertiary: #e5e5ea;

  --nav-bg: rgba(255, 255, 255, 0.78);
  --nav-border: rgba(0, 0, 0, 0.08);

  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --text-tertiary: #86868b;
  --text-quaternary: #aeaeb2;

  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.12);

  /* Shadows (Dual-layer Apple elevation) */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05);
  --shadow-card-hover: 0 12px 32px -4px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.06);
  --shadow-popover: 0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06);

  /* Apple System Accent Colors */
  --accent-blue: #0071e3;
  --accent-blue-hover: #0077ed;
  --accent-green: #34c759;
  --accent-green-subtle: rgba(52, 199, 89, 0.12);
  --accent-orange: #ff9500;
  --accent-orange-subtle: rgba(255, 149, 0, 0.12);
  --accent-purple: #af52de;
  --accent-teal: #30b0c7;

  /* Squircles & Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-card: 20px;
  --radius-pill: 9999px;

  /* Physics Springs */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out: cubic-bezier(0.25, 1, 0.5, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-canvas: #000000;
    --bg-surface: rgba(28, 28, 30, 0.82);
    --bg-surface-solid: #1c1c1e;
    --bg-surface-secondary: #2c2c2e;
    --bg-surface-tertiary: #3a3a3c;

    --nav-bg: rgba(20, 20, 22, 0.78);
    --nav-border: rgba(255, 255, 255, 0.12);

    --text-primary: #f5f5f7;
    --text-secondary: #a1a1a6;
    --text-tertiary: #86868b;
    --text-quaternary: #636366;

    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.16);

    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
    --shadow-card: 0 4px 24px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
    --shadow-card-hover: 0 12px 36px -4px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.14);

    --accent-blue: #2997ff;
    --accent-blue-hover: #40a9ff;
    --accent-green-subtle: rgba(50, 215, 75, 0.18);
    --accent-orange-subtle: rgba(255, 159, 10, 0.18);
  }
}
```

---

## 2. Typography Rules (Optical Sizing & Tracking)

Apple interfaces use tight negative letter-spacing for large text and slightly positive tracking for small text:

```css
/* Display Titles */
.apple-title-large {
  font-family: var(--font-system);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.apple-title-medium {
  font-family: var(--font-system);
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.22;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.apple-body {
  font-family: var(--font-system);
  font-size: var(--text-base);
  line-height: 1.5;
  letter-spacing: -0.005em;
  color: var(--text-secondary);
}

.apple-subheadline {
  font-family: var(--font-system);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: -0.002em;
  color: var(--text-tertiary);
}

/* Metadata Chips / Badges */
.apple-badge {
  font-family: var(--font-system);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.015em;
  text-transform: uppercase;
}
```

---

## 3. Materials & Translucency (`backdrop-filter`)

Create depth without clutter by floating functional chrome over content:

```css
/* Translucent Navigation Bar */
.apple-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--nav-border);
  transition: background 200ms ease;
}

/* Translucent Glass Card */
.apple-glass-card {
  background: var(--bg-surface);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
  transition: transform 250ms var(--ease-spring), box-shadow 250ms var(--ease-spring);
}
```

---

## 4. Physics & Fluid Feedback (Springs)

- **Respond on pointer-down**: Always set an `:active` state that shrinks by 1.5% to 2%:
```css
.apple-interactive {
  transition: transform 180ms var(--ease-spring), box-shadow 180ms var(--ease-spring);
}
.apple-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
.apple-interactive:active {
  transform: scale(0.985) translateY(0);
  transition-duration: 80ms;
}
```

- **Avoid jarring layouts**: Never animate width/height directly. Use composite-only properties (`transform` and `opacity`).

---

## 5. Apple Photos Horizontal Snap Gallery

Replace vertical stacks of pictures with an Apple Photos style horizontal snap gallery:

```css
.apple-gallery-viewport {
  position: relative;
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface-secondary);
}

.apple-gallery-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin: 0;
  padding: 0;
  list-style: none;
}
.apple-gallery-track::-webkit-scrollbar {
  display: none;
}

.apple-gallery-slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  position: relative;
}

.apple-gallery-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  transition: transform 400ms var(--ease-spring);
}
.apple-glass-card:hover .apple-gallery-img {
  transform: scale(1.025);
}

.apple-gallery-attribution {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}
```

---

## 6. Pill Chips & Status Badges

For rich metadata (e.g. weather, location, observer, animal count):

```css
.apple-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  background: var(--bg-surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.apple-pill-accent {
  background: var(--accent-green-subtle);
  color: var(--accent-green);
  border-color: transparent;
  font-weight: 600;
}

.apple-pill-weather {
  background: rgba(0, 113, 227, 0.1);
  color: var(--accent-blue);
  border-color: transparent;
  font-weight: 600;
}
```

---

## 7. Reduced Motion & Accessibility

Honor system accessibility preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
@media (prefers-reduced-transparency: reduce) {
  .apple-nav, .apple-glass-card {
    background: var(--bg-surface-solid) !important;
    backdrop-filter: none !important;
  }
}
```
