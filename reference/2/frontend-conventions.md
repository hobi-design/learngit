# Frontend Conventions — PROPS

Read `DESIGN.md` at the project root before writing any frontend code. It is the canonical spec.

---

## Source of Truth

| Priority | Source |
|----------|--------|
| 1 | `DESIGN.md` (project root) |
| 2 | This file (process rules) |
| 3 | `src/index.css` (implements tokens) |
| 4 | `tailwind.config.js` (token values) |
| 5 | `/design` page (visual verification) |

If they conflict, DESIGN.md wins.

---

## Process Rules

- Read every relevant file before changing anything.
- Don't invent colors, font sizes, or durations. Use what's defined in DESIGN.md.
- Complete one logical unit, report back, wait for feedback.
- When the user says something isn't working, find the bug. Don't argue.
- Document deviations when closing issues.

---

## Tailwind v3

- Config: `tailwind.config.js` + CSS custom properties in `src/index.css :root`.
- Prefer named token utilities (`duration-base`, `ease-enter`, `z-header`) over arbitrary values.
- `#[[file:tailwind.config.js]]` — reference for all token values.
- `#[[file:src/index.css]]` — reference for CSS custom properties and type classes.

---

## Component Architecture

### Co-location
- **Shared (2+ consumers):** `src/components/ui/`, `src/components/layout/`
- **Single-use:** `src/pages/<PageName>/` alongside their page
- **Hooks:** `src/hooks/`

### File Rules
- Page files are thin orchestrators. No inline component definitions.
- Every named piece of UI gets its own file.
- No utility functions inside components — use `src/utils/`.

### UI Primitives (use these)
`Button` (primary/secondary/tertiary), `SectionCard`, `SectionGrid`, `PageSection`, `MetaRow`, `TagPill`, `CodeBlock`, `LoadingScreen`, `Logo`, `Wordmark`.

---

## Icons (Lucide React)

| Size | Context |
|------|---------|
| 12 | Inside buttons, inline with caption |
| 14 | Body text, card actions |
| 16 | Standalone, navigation |

Decorative icons: `aria-hidden="true"`. Icon-only buttons: must have `aria-label`.

---

## Spacing

- Section padding: use `py-section-sm/md/lg` via PageSection component.
- Page padding: `px-4` mobile, `md:px-8` desktop.
- Card grid gap: `gap-6`.
- Inside cards: `p-5`.

---

## Exit Checks

Run after any frontend work:

```bash
# Zero raw palette colors
grep -rn "slate-\|gray-[0-9]" src/ --include="*.tsx" | grep -v "design/"

# Zero text-white / bg-white in components
grep -rn "text-white\|bg-white" src/ --include="*.tsx" | grep -v "design/\|admin/"

# Zero raw z-index
grep -rn "\bz-[0-9]" src/ --include="*.tsx" | grep -v "design/" | grep -v "z-base\|z-sticky\|z-header\|z-overlay"

# Zero raw duration
grep -rn "duration-[0-9]" src/ --include="*.tsx" | grep -v "design/" | grep -v "duration-instant\|duration-fast\|duration-base"

# Zero framer-motion
grep -rn "framer-motion" src/ --include="*.tsx"
```

All should return empty.
