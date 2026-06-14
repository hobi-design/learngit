# 🧠 AI INSTRUCTIONS: READ FIRST
> **MANDATORY:** Always read this file at the start of every session. It contains all context, constraints, and historical decisions for this project.
> **CONTINUITY:** This document is the single source of truth for the project's curriculum and design.
> **RECORDING:** Log every user instruction, design pivot, and vision verbatim (grammatically cleaned). Do not add summaries or "takeaways."

# Git Microsite: Vision & Design Log

## 🛡️ Core Constraints & Design Rules
- **Target Audience:** Absolute beginners who are completely new to coding and Git.
- **Aesthetic:** Premium, structural, and "Shadcn-esque." Apple HIG-inspired. Clean white and grayscale.
- **Borders & Radius:** Strict `0px` or very subtle `2px`-`4px`. No excessive rounding.
- **Color Palette:** No gradients. No purple-blue color schemas. No blue-ish dark modes. Use grayscale (white, off-white, ink, muted grays).
- **Typography:** `Inter` for all UI, labels, navigation, and headers. Standard mixed-case only. `IBM Plex Mono` or `Departure Mono` for code and technical metadata ONLY.
- **Tone:** Absolute neutrality for documentation sections (Wikipedia/GitHub Docs style). The hero section may use a slightly more relatable hook for "vibe coders."
- **Content Design:** Chunked information with progressive disclosure. Avoid monolithic paragraphs. Use a linear, docs-style static path.

---

## Vision Log

### [Project Scope]
The target audience is someone completely new to coding and Git. We need to cover the 10 most common Git commands, including a subsection for those with subcommands/flags. Mention interchangeable commands like `git checkout` and `git switch` and explain how they differ.

### [Information Architecture]
The site should be a guided, linear path: What is Git → Core Concepts → 10 Commands → Real Workflow. It should feel like a crash course. We are using a docs-style layout—no AI-powered search or query boxes. The focus is on a clean, polished visual direction with glassmorphism, transitions, and shadows.

### [Visual Identity & Typography]
The design must be premium and Apple HIG-esque. No gradients, no purple-blue schemas, and no blue-ish dark modes. Avoid excessive corner radius. **Monospace is for code only.** Use Inter for all UI elements. We want a "soft" Shadcn design.

### [AI Project Lifecycle Timeline]
Convey Git commands through the lifecycle of an AI project. Generate a beautiful vertical scroll timeline showing Git commands in the context of when they would be used (e.g., initializing, branching for experiments, staging scripts, pushing models). Text hierarchy is extremely important; be very mindful and deliberate about how people pay attention to different texts.

### [Timeline Structure & Interactivity]
The timeline should be centered with no sidebars or section tags. Each item should be "grand" and attention-grabbing. Include extensive, beautiful SVG diagrams under each command that geometrically illustrate the concepts (e.g., workspace vs. index, commit trees, branching paths). The interaction must be scroll-connected, with a center progress bar that fills as the user moves down the page. Interactions should be bidirectional.

### [The Hero Section]
The hero section should be exactly `90vh` high. The background color should be a neutral dark **slate grey** (`#1a1a1b`) with **absolutely zero blue tint**. The word "Git" in the title should be styled as pixel-art typography using the `Departure Mono` font (hosted locally). The description should read: "A quick reference guide for vibe coders who want to be in control of how their code is managed." Ensure the vertical spacing above and below the hero text is perfectly equal.

### [The Pixel Grid Transition]
Between the hero and the timeline, implement an interactive canvas pixel grid (40vh high). The pixels should be large (3x scale, roughly 96px). As the user scrolls, the grid should turn from neutral slate grey (`#1a1a1b`) to white pixel-by-pixel, disappearing completely over roughly 40vh of scroll distance. The dissolution must feel random and organic, not uniform.

### [Technical Details]
Code blocks should be small and distinct (12px font), using a "deep inset" style with dark backgrounds, inset shadows, and 1px borders. These should look like refined, premium interactive buttons.
