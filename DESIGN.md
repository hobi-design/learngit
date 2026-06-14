---
version: 1.0
name: learngit
description: >
  Git fundamentals microsite for vibe coders. Dark-first. Architectural
  minimalism. Zero decorative radius. Departure Mono pixel-art title accent.
  Two neutrals only — Inter for UI, IBM Plex Mono for code/data values.
colors:
  base:          "#0c0c0c"
  surface:       "#141414"
  surface-raised:"#1c1c1c"
  surface-high:  "#242424"
  surface-hover: "#2e2e2e"
  border-subtle: "#1e1e1e"
  border:        "#2a2a2a"
  border-strong: "#383838"
  primary:       "#e8e8e8"
  secondary:     "#a0a0a0"
  muted:         "#666666"
  faint:         "#3f3f3f"
---

# learngit — Design System

## Guiding Principle

> Depth through surface layers. Contrast through restraint.

No pure white. No pure black. Never flat — always one step up or down on the
grey scale. If it isn't defined here, it doesn't exist in the codebase.

---

## Source of Truth Hierarchy

1. **This file (`DESIGN.md`)** — canonical spec. All agents read this first.
2. **`src/css/tokens.css`** — implements tokens as CSS custom properties.
3. **`src/css/global.css`** — imports tokens + defines all named utility classes.
4. **`src/pages/design-system.html`** — live visual reference. Review after changes.

All four must stay in sync. This file wins on conflicts.

---

## Color Tokens

### Surface Hierarchy (dark → light = deeper → elevated)

| Token | Hex | Role |
|---|---|---|
| `--color-base` | #0c0c0c | Page background — deepest layer |
| `--color-surface` | #141414 | First-level surface (section backgrounds) |
| `--color-surface-raised` | #1c1c1c | Elevated cards, code blocks, dissolve overlays |
| `--color-surface-high` | #242424 | Table rows, input backgrounds |
| `--color-surface-hover` | #2e2e2e | Hover states, selected rows |

### Border Hierarchy

| Token | Hex | Role |
|---|---|---|
| `--color-border-subtle` | #1e1e1e | Barely-visible section dividers |
| `--color-border` | #2a2a2a | Standard component borders |
| `--color-border-strong` | #383838 | Active/emphasized borders, hover states |

### Text Hierarchy

| Token | Hex | Role |
|---|---|---|
| `--color-text-primary` | #e8e8e8 | Headlines, primary readable text. Never pure white |
| `--color-text-secondary` | #a0a0a0 | Descriptions, body copy |
| `--color-text-muted` | #666666 | Labels, secondary metadata |
| `--color-text-faint` | #3f3f3f | Stamps, index tags, disabled |

### Do NOT:
- Use `#ffffff` or `#000000` anywhere — ever
- Invent ad-hoc hex values
- Use CSS named colors (`white`, `black`, `gray`, etc.)

---

## Typography

Two faces only. Rule: mono is for CODE and DATA VALUES exclusively.

| Face | Token | Use |
|---|---|---|
| Inter | `--font-sans` | All UI: headings, body, nav, labels, descriptions |
| IBM Plex Mono | `--font-mono` | Git commands, code, type prefixes (feat/fix), hash values |
| Departure Mono | `--font-pixel` | Hero display title word only |

### Named Type Classes

Use these. Never write raw `font-size` values in pages or components.

| Class | Size | Weight | Line-height | Role |
|---|---|---|---|---|
| `.type-display` | clamp(3.5rem, 8vw, 7rem) | 400 | 1.0 | Hero title — one per page |
| `.type-title` | clamp(1.75rem, 3vw, 2.5rem) | 400 | 1.1 | Section title (sticky label col) |
| `.type-heading` | 1.125rem | 500 | 1.3 | Card/subsection heading |
| `.type-body` | 1.0625rem | 400 | 1.65 | Body descriptions |
| `.type-body-sm` | 0.875rem | 400 | 1.55 | Table cells, captions |
| `.type-caption` | 0.75rem | 500 | 1.4 | Uppercase eyebrows, index tags |
| `.type-mono` | 0.875rem | 400 | 1.5 | Code blocks, commands, prefixes |
| `.type-mono-sm` | 0.75rem | 400 | 1.5 | Small code, table first-column |
| `.type-label` | 0.6875rem | 500 | 1.4 | UPPERCASE nav labels, stamps |

---

## Spacing Scale

| Token | Value | Role |
|---|---|---|
| `--space-1` | 0.25rem | Micro gaps |
| `--space-2` | 0.5rem | Tight inline |
| `--space-3` | 0.75rem | Component padding tight |
| `--space-4` | 1rem | Base unit |
| `--space-6` | 1.5rem | Component padding |
| `--space-8` | 2rem | Section inner padding |
| `--space-12` | 3rem | Gap between layout columns |
| `--space-16` | 4rem | Section vertical padding |
| `--space-24` | 6rem | Large section gaps |
| `--space-32` | 8rem | Column gap in wide layout |
| `--space-40` | 10rem | Hero bottom padding |

### Page Containers

| Class | Max-width | Use |
|---|---|---|
| `.container-page` | 1440px | All pages — nav, hero, sections |
| `.container-content` | 900px | Narrow reading / centered content |

Both: `margin-inline: auto` + `padding-inline: var(--space-12)`.
Mobile (<720px): `padding-inline: var(--space-6)`.

---

## Z-Index

Named tokens only. Raw `z-50`, `z-40` are forbidden.

| Token | Value | Role |
|---|---|---|
| `--z-behind` | -1 | Hidden elements |
| `--z-base` | 0 | Default stacking |
| `--z-sticky` | 30 | Sticky label columns |
| `--z-header` | 40 | Fixed nav |
| `--z-overlay` | 50 | Canvas overlays |
| `--z-tooltip` | 60 | Tooltips, info bubbles |
| `--z-modal` | 70 | Modals (future) |

---

## Motion

Three durations. One easing curve.

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 100ms | Active/pressed states |
| `--duration-fast` | 150ms | Hover color/border changes |
| `--duration-base` | 250ms | Panels, reveals, transitions |
| `--ease` | cubic-bezier(0.16, 1, 0.3, 1) | Everything |

---

## Geometry

Zero-radius everywhere. This is a deliberate, named constraint.

| Token | Value | Use |
|---|---|---|
| `--radius` | 0px | Everything |
| `--radius-full` | 9999px | Info bubble circles only |

No `border-radius` on cards, tables, panels, inputs, or nav. If it exists, remove it.

---

## Named Component Classes

### Layout
- `.nav` — fixed top nav
- `.nav-inner` — max-width wrapper inside nav
- `.hero` — 100vh hero section
- `.section` — generic content section with border-top divider
- `.section-label` — sticky left column (index + title)
- `.section-body` — right content column

### Cards / Surfaces
- `.card` — border + surface-raised background
- `.card-raised` — one level higher (surface-high)
- `.compare-grid` — two-column good/bad comparison layout
- `.compare-card` — individual comparison cell
- `.compare-card--good` — elevated bg, standard border
- `.compare-card--bad` — dimmer bg, weaker border, 0.65 opacity

### Tables
- `.data-table` — full-width data table with token borders
- `.data-table th` — surface header
- `.data-table td` — surface-high row

### Interactive
- `.dissolve-panel` — pixel-dissolve reveal container
- `.info-bubble` — circular inline tooltip trigger
- `.info-bubble .tip` — tooltip content

### Typography helpers
- `.type-*` — see Typography section above
- `.eyebrow` — alias for `.type-label` + `text-transform: uppercase` + `letter-spacing: 0.1em`

---

## Do's and Don'ts

### Do
- Use semantic color tokens exclusively
- Use named type classes — never raw font-size values
- Use named z-index tokens
- Use named duration tokens
- Use `.container-page` or `.container-content` for all layout
- Use `--font-mono` only on code, git commands, type prefixes, hash values
- Use the grey surface hierarchy to create depth (bg-0 deepest, hover lightest)

### Don't
- Don't use `#ffffff`, `#000000`, or any CSS named colors
- Don't invent hex values not in this spec
- Don't use `border-radius` except `--radius-full` on circles
- Don't use `box-shadow` — depth comes from surface layers + borders
- Don't use `--font-pixel` (Departure Mono) outside the hero title word
- Don't use `--font-mono` on headings, labels, nav, dates, descriptions
- Don't write inline `font-size`, `color`, `background` in HTML files — use classes
- Don't use raw duration values — use `--duration-*` tokens
- Don't use raw z-index values — use `--z-*` tokens
