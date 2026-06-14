---
version: 1.0
name: PROPS
description: Shopify custom sections library. Carbon-adapted design system. Inter font. Flat 0px geometry. Single green accent. Glass floating navbar.
---

# Design System

## Identity

- **Font:** Inter (primary), IBM Plex Sans (fallback), IBM Plex Mono (code)
- **Geometry:** 0px border-radius everywhere. No rounded corners.
- **Shadows:** Only on floating navbar (`shadow-[0_4px_30px_rgba(0,0,0,0.06)]`). No other shadows.
- **Gradients:** None.
- **Philosophy:** Carbon-adapted. Depth through hairline borders and brand-dark hover inversion.

---

## Colors

### Brand (2 tokens only)
```yaml
brand-green: "#9fe870"   # CTA fill, accent on dark
brand-dark: "#173401"    # Hover invert fill, secondary bg
```

### Text Hierarchy
```yaml
carbon-ink: "#161616"         # Headlines, primary text
carbon-ink-muted: "#525252"   # Body, descriptions
carbon-ink-subtle: "#8c8c8c"  # Captions, metadata
```

### Surfaces
```yaml
carbon-canvas: "#ffffff"      # Page bg
carbon-surface-1: "#f4f4f4"   # Card meta panels (NEVER full section bg)
carbon-surface-2: "#e0e0e0"   # Rare (scrollbar tracks)
carbon-surface-3: "#c6c6c6"   # Rare (scrollbar thumbs)
```

### Borders
```yaml
carbon-hairline: "#e0e0e0"    # Default 1px borders, dividers
```
Use `border-carbon-ink` for focus/active states. No separate "hairline-strong" token.

### Inverse (text on dark surfaces)
```yaml
inverse-ink: "#ffffff"                  # Headings on dark bg
inverse-ink-muted: "rgba(255,255,255,0.6)"   # Body on dark bg
inverse-ink-subtle: "rgba(255,255,255,0.5)"  # Tertiary on dark bg
```
Use `text-inverse-ink` NOT `text-white` on brand-dark/carbon-ink surfaces.

### Feedback
```yaml
support-error: "#da1e28"
support-error-bg: "#fff1f1"
```

### Hover Colors
No dedicated hover tokens. Use `hover:opacity-90` or invert pattern (`hover:bg-brand-dark hover:text-brand-green`).

---

## Typography

### Type Classes (use these, never raw font-size)

| Class | Desktop | Mobile | Weight | Use |
|-------|---------|--------|--------|-----|
| `.type-display-xl` | 72px (clamp) | 36px | 300 | Hero headline |
| `.type-display-lg` | 48px (clamp) | 30px | 300 | Section headings |
| `.type-display-md` | 36px (clamp) | 28px | 300 | Page titles, CTA headlines |
| `.type-headline` | 24px (clamp) | 20px | 400 | Card collection heading |
| `.type-card-title` | 20px (clamp) | 18px | 400 | Card titles, sub-section headings |
| `.type-subhead` | 20px (clamp) | 16px | 300 | Lead paragraphs |
| `.type-body-lg` | 18px (clamp) | 16px | 400 | Feature descriptions |
| `.type-body` | 16px | 14px mobile | 400 | Default body |
| `.type-body-sm` | 14px | 12px mobile | 400 | Card descriptions, footer, metadata |
| `.type-body-emphasis` | 14px | 14px | 600 | Active labels, small headings |
| `.type-caption` | 12px | 12px | 700 | Uppercase eyebrows, category labels |
| `.type-button` | 14px | 14px | 600 | Button labels (uppercase) |
| `.type-mono` | 13px (clamp) | 12px | 400 | Code, file names |

### Rules
- Never use raw `text-sm`, `text-lg`, etc. for content. Use type classes.
- `font-bold` is used sparingly. Default weight is 400. Headers use 300.
- No custom letter-spacing tokens. Use Tailwind defaults (`tracking-wider`, `tracking-widest`) only on uppercase text.

---

## Motion

### Duration (3 tiers)
```yaml
duration-instant: 100ms   # Active/pressed states, toggles
duration-fast: 150ms      # Hover color/border changes
duration-base: 200ms      # Everything else (panels, cards, menus)
```

### Easing (1 curve)
```yaml
ease-enter: "cubic-bezier(0, 0, 0.3, 1)"   # All transitions
```

### Rules
- No Framer Motion. CSS transitions only.
- Max transition duration is 200ms (`duration-base`).
- Use `transition-colors`, `transition-all`, or `transition-transform`. Never raw `transition-duration`.

---

## Spacing

### Section Padding
```yaml
section-sm: 3rem (48px)    # Compact bands
section-md: 5rem (80px)    # Default content sections
section-lg: 7.5rem (120px) # Hero/marquee emphasis
```

### Containers
```yaml
max-w-grid: 1584px   # Full-width page constraint
max-w-blog: 900px    # Blog/article reading width
```

Page padding: `px-4` mobile, `px-8` desktop.

---

## Z-Index
```yaml
z-base: 0
z-sticky: 30
z-header: 40
z-overlay: 50
```

---

## Components

### Navbar (Floating Glass)
- `fixed top-3 left-4 right-4 md:left-6 md:right-6`
- `bg-white/75 backdrop-blur-xl`
- No bottom border. Shadow only.
- Navlinks: `text-sm font-medium capitalize`
- Contact button: V4 arrow reveal (bg inverts on hover, arrow slides in)
- Mobile menu: rendered OUTSIDE `<header>` (backdrop-filter creates stacking context)

### Buttons (V4 — Invert + Arrow)
- Primary: `bg-brand-green text-brand-dark` → hover: `bg-brand-dark text-brand-green` + arrow slides in
- Size: `text-[10px] px-12 py-4` (10px text, 48px horizontal, 16px vertical)
- Arrow is `position: absolute right-4`, text shifts left on hover via `translate-x`
- Secondary: `bg-brand-dark text-white` → hover: `bg-brand-green text-brand-dark`
- Tertiary: `border border-carbon-ink` → hover: `bg-carbon-ink text-white`

### SectionCard
- Category label: right-aligned
- Thumbnail: `aspect-[1.6]`, scale on hover
- Body: title + subtitle at top, arrow pinned bottom-right via `mt-auto`
- Hover: full card inverts to brand-dark, text flips to brand-green
- All cards same height via `h-full` + `flex-1` on body

### Hover Patterns
```
.hover-card         — border darkens + surface-1 fill (secondary cards)
.hover-card-invert  — full brand-dark fill + green text (primary cards)
.hover-link         — muted → ink
.hover-link-accent  — → brand-dark
.hover-cta          — opacity-90
```

### Footer Wordmark
- SVG `<Wordmark>` component, stroke-only
- `fill: #161616` (matches bg), `stroke: #444444`, `stroke-width: 10`, `paint-order: stroke fill`
- `overflow-visible` on SVG to prevent stroke clipping
- Mobile: `scale-[1.2]`

---

## Do's and Don'ts

### Do
- Use named type classes (`.type-display-lg`, `.type-body-sm`)
- Use named duration/easing (`duration-base ease-enter`)
- Use `border-carbon-hairline` for all borders
- Use `text-inverse-ink` on dark surfaces
- Use the Button component with variant prop
- Reference `#[[file:tailwind.config.js]]` for exact token values

### Don't
- Don't use `text-white`, `bg-white`, or raw Tailwind color utilities
- Don't use `font-bold` unless specifically on `.type-caption` or emphasis
- Don't use `rounded-*` anywhere (0px geometry)
- Don't use Framer Motion
- Don't use `duration-300`, `duration-500`, or any raw duration
- Don't use multiple easing curves — only `ease-enter`
- Don't create new color tokens without updating this file
- Don't use `z-50`, `z-40` — use `z-overlay`, `z-header`
