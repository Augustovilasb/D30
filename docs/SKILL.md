---
name: d30-design
description: Use this skill to generate well-branded interfaces and assets for D30 (Dev aos 30) — a Brazilian Portuguese community for people transitioning into developer careers. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping in the D30 voice and look.
user-invocable: true
---

# d30-design

D30 is a Brazilian Portuguese community for people transitioning into developer careers, especially later in life. The aesthetic is **dark, minimal, indie, one-accent-purple** with a single typeface (Inter), a distinctive custom cursor, and a blunt, anti-hype tone of voice (`pt-BR`, `você`, no emoji, em-dashes everywhere).

## How to use this skill

1. **Read `README.md`** — it contains the full content fundamentals, visual foundations, and iconography rules. Don't skip it; every rule there is a guard-rail against drifting off-brand.
2. **Read `colors_and_type.css`** — the token source of truth. Every color, radius, shadow, motion duration and typographic step is defined here, namespaced `--d30-*`.
3. **Scan `preview/`** — small specimen cards for each token group. The fastest way to see the system at a glance.
4. **Reuse from `ui_kits/website/`** — pixel-honest React+Babel components for every page and modal in the product. When the user wants more product UI, lift JSX from here, don't rebuild from screenshots.
5. **`reference/`** — the original uploads kept verbatim. Use as ground truth when something feels off.

## If creating visual artifacts (slides, mocks, throwaway prototypes)

Copy the assets you need (`assets/augusto.png`, `colors_and_type.css`, and any JSX/CSS from `ui_kits/website/`) into your output's working directory. Build static HTML files for the user to view. Honor the system:

- Dark canvas (`#080808`), one purple accent (`#6d5ce6`/`#8b7cf8`).
- Inter only. No serif, no script.
- Brazilian Portuguese, blunt, no emoji.
- Em-dashes ` — ` for asides.
- Eyebrow caps labels above page titles.
- Cards: hairline border + radius + on-hover translateY/border-purple swap.
- Buttons: solid purple primary OR hairline ghost. Never gradient-on-button.
- For icons: prefer unicode glyphs that already exist in the system (`→ ✓ ▶ ◯ × +`); add Lucide only when truly necessary and flag the addition.

## If working on production code

You can reference `d30.css` (in `ui_kits/website/`) as-is — it's the authoritative stylesheet from the live product. The components in `ui_kits/website/*.jsx` are cosmetic-only recreations; treat them as a visual spec, not a backend implementation.

## If the user invokes this skill with no other guidance

Ask them what they want to build or design. Useful clarifying questions:

- A new page/section for the existing site, or a separate artifact (deck, social card, mock)?
- Marketing-facing or community-facing?
- Brazilian Portuguese (default) or do they need an English translation pass?
- Any new content? (Then probe for the voice — D30 sounds like a friend at a kitchen table, not a teacher.)

Then act as an expert designer. Output HTML artifacts by default; offer production code if the user is shipping to the site.

## Things to refuse / push back on

- **Emoji in product chrome.** It's off-brand. Decline gracefully.
- **Light mode.** D30 is dark-mode-only. If a deck needs a light slide, propose a B&W treatment instead.
- **Replacing Inter with a trendy display face.** Stay with Inter; lean into weight + tracking instead.
- **Adding a second accent color.** Purple is the only saturated hue. Tag tints exist but are tints only.
- **Replacing the wordmark with a custom logo.** The text mark `D30` (Inter 900, the `30` purple) is the logo.
