# Frontend Conventions — HANGAR01

Read `DESIGN.md` at the project root before writing or modifying any frontend code. That file is the canonical design system spec — tokens, rationale, rules, and Do's/Don'ts. This steering file covers process, architecture, and behavioral rules that DESIGN.md doesn't.

---

## How to Think

> Reduce the number of options, then name the ones we choose.

If a token, class, or pattern isn't named in DESIGN.md, it doesn't belong in the codebase. Don't invent new values. Don't grab whatever looks right from context. Use what's defined or ask.

---

## Source of Truth

| Priority | Source | Who sees it |
|----------|--------|-------------|
| 1 | `DESIGN.md` (project root) | AI agents read this |
| 2 | `src/index.css` (`@theme {}` block) | Implements tokens as CSS custom properties |
| 3 | `/design` page | Maintainer reviews this (live rendering) |

All three must stay in sync. If they conflict, DESIGN.md wins. There is no `tailwind.config.js` — this is Tailwind v4.

---

## Process Rules

- **Don't cut corners.** Read every relevant file before changing anything. Verify your work.
- **Don't hallucinate numbers.** State exact, verifiable counts. If you say "12 violations," there better be exactly 12 when someone checks.
- **Don't rush ahead.** Complete one logical unit, report back, wait for feedback before continuing.
- **Avoid browser subagents / screenshots.** Do not invoke browser subagents or screenshot capture/analysis tools. Rely on static code audits, CSS layout reasoning, and explicit user bug reports to preserve system resources and prevent incorrect visual assessments.
- **Verify edge cases.** If you define a token in CSS, confirm it actually generates a usable utility in the build output. TW4 only auto-generates utilities for recognized namespaces (`--color-*`, `--text-*`). Generic vars like `--z-*` and `--duration-*` need explicit utility definitions in `@layer utilities`.
- **Document deviations.** When closing an issue, comment what you did and any deviations from the spec. Even if there are none, add a brief note for reference.

---

## Tailwind v4

- Config lives in `@theme {}` block of `src/index.css`. No config file.
- `@import "tailwindcss"` at the top.
- Tokens in `@theme` auto-generate utilities for recognized namespaces.
- Custom tokens (`--z-*`, `--duration-*`) need explicit utilities in `@layer utilities`.
- Prefer token utilities (`duration-base`, `z-header`) over arbitrary value syntax (`duration-[200ms]`, `z-[40]`).

---

## Component Architecture

### Co-location

- **Shared (2+ consumers):** `src/components/ui/` (primitives), `src/components/layout/` (app shell), `src/components/seo/`
- **Single-use:** `src/pages/<PageName>/` alongside their page
- **Utilities:** `src/utils/` — pure functions, constants, never inside components

### File Rules

- Page files are thin orchestrators: imports, hooks, composition. No inline JSX blocks, no local component definitions.
- Every named piece of UI gets its own file. If it has a name and renders JSX, extract it.
- No utility functions inside components — move them to `src/utils/`.

### UI Primitives (use these, don't hand-roll)

`Button` (primary/outline/ghost), `Card` (hoverEffect prop), `NavLink`, `BackButton`, `CardBadge` (update/news/tutorial/new variants), `Accordion`, `AircraftCard`, `BlogCard`, `PageLoadingState` (inline/fullPage).

---

## Icons (Lucide React)

Three sizes only:

| Size | Context |
|------|---------|
| 12 | Inline with caption text, inside badges |
| 14 | Inline with body text, inside buttons |
| 16 | Standalone icons, navigation, card actions |

Illustrative (success/error state art): 40, 56 allowed. Everything else is wrong.

All decorative icons (next to visible text): `aria-hidden="true"`.
Icon-only buttons: must have `aria-label`.

---

## Animation & Interaction — CSS First

Always prefer pure CSS for animations, transitions, and interactions. CSS transitions/animations are hardware-accelerated by default, don't add JS bundle weight, and work with `prefers-reduced-motion` natively via media queries.

**Use CSS (`transition-*`, `@keyframes`) for:**
- Hover/focus/active state changes
- Opacity fades, color shifts, transforms (scale, translate, rotate)
- Staggered grid appearances (`animation-delay` via inline style or nth-child)
- Accordion height transitions (use `grid-template-rows: 0fr → 1fr` trick)
- Page load fade-ins

**Use Framer Motion ONLY when CSS cannot do it:**
- Layout animations (`layoutId` shared-element transitions)
- Spring physics that require interruptible animation state
- Gesture-driven animations (drag, pan)
- `AnimatePresence` for unmount animations (CSS cannot animate elements being removed from DOM)

**Legitimate Framer Motion usages (keep these):**
- `ReportPanel` — spring slide-in + unmount animation
- `InfoBubble` — portal tooltip fade with unmount
- `HomeHero` — phase transition crossfade with `AnimatePresence mode="wait"`
- `Header` mobile menu — unmount fade
- `AircraftSearch` dropdown — unmount fade
- `Accordion` — height auto animation (no clean CSS equivalent)

**Converted to CSS (do not revert):**
- `AircraftCard` — removed entirely, zero animation needed
- `BlogCard` — simple fade-in via CSS animation
- `ChangelogEntry` — CSS `@keyframes fadeUp`
- `BlogPostPage` — CSS `@keyframes fadeUp`
- `ContactPage` — CSS `@keyframes fadeUp`
- `ChecklistItem` checkmark — CSS `transform: scale()` transition

**Rationale:** Each Framer Motion `motion.div` creates a GPU-composited layer + React reconciliation overhead. On pages with many items (16 aircraft cards, 50+ checklist items), this causes measurable scroll jank and memory bloat (observed: ~150MB overhead from animation layers on /aircrafts page).

**Reduced motion:** The `@media (prefers-reduced-motion: reduce)` block in `index.css` disables all CSS animations/transitions globally. Framer Motion is handled by `<MotionConfig reducedMotion="user">` at the app root.

---

## Spacing Pattern

Single-direction spacing: bottom padding creates gaps between elements. Don't use both top and bottom padding on stacked sections — it creates double gaps.

- Page sections: `pb-16` (with small `pt-8` only when a border separator needs breathing room)
- Between heading and content: `mb-6` to `mb-10`
- Card grid gap: `gap-6`
- Inside card: `p-5`

---

## Mobile Responsiveness

- Every layout must work at 375px width minimum. No horizontal scroll.
- Use `flex-wrap` on inline token displays, `truncate` on long text in constrained rows.
- Hide decorative visualizations on mobile (`hidden sm:block`) if they'd cause overflow.
- Test: grids collapse, text truncates, bars/staircase visualizations don't push content.
- `overflow-x-hidden` on page wrappers if inner content has edge cases.

---

## Focus & Accessibility

Global focus ring in `index.css`: `outline: 2px solid accent; outline-offset: 2px` on `:focus-visible`. Don't add per-component focus styles. Exception: inputs with `focus:border-accent` for in-field feedback.

See `.kiro/steering/accessibility.md` for full a11y rules.

---

## Links

| Context | Pattern |
|---------|---------|
| Body/prose | `className="prose-link"` (defined in `@layer base`) |
| Navigation | `text-muted hover:text-primary transition-colors` |

---

## Exit Checks

Run after any frontend work:

```bash
# Zero raw palette colors in components
grep -rn "slate-\|gray-[0-9]" src/ --include="*.tsx" | grep -v "design-system\|mockData"

# Zero text-white / bg-white
grep -rn "text-white\|bg-white" src/ --include="*.tsx" | grep -v "design-system"

# Zero raw z-index values
grep -rn "\bz-[0-9]" src/ --include="*.tsx" | grep -v "design-system" | grep -v "z-behind\|z-base\|z-sticky\|z-header\|z-overlay\|z-tooltip\|z-modal\|z-skip"

# Zero raw duration values
grep -rn "duration-[0-9]" src/ --include="*.tsx" | grep -v "design-system" | grep -v "duration-instant\|duration-fast\|duration-base"

# Zero font-mono on UI labels
grep -rn "font-mono" src/ --include="*.tsx" | grep -v "design-system\|mockData\|utils/" | grep -v "action\|code\|callsign\|value\|counter\|type-mono"
```

All should return empty (or only legitimate exceptions).
