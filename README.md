# D30 Design System

> **D30** — short for **"Dev aos 30"** ("Dev at 30") — a free, open community in **Brazilian Portuguese** for people transitioning into a developer career, especially those starting later in life (around 30, but explicitly open to any age). Built by **Augusto** (`@Dev.aos30` on Instagram), who is documenting his own transition from scratch.

This design system codifies the look, voice and components of the D30 product so we can design new screens, landing variants, social cards, decks and prototypes that feel like they belong to the same world.

---

## What's in scope

D30 today is a **single surface — a marketing + community website** with four pages:

1. **Home** — hero, value props ("O que você encontra aqui"), CTAs.
2. **Sobre (About)** — origin story, four-card horizontal-scroll values pillars, founder card.
3. **Fórum** — split layout, threaded discussion with tags (dúvida, conquista, recurso, carreira).
4. **Road Map** — vertical 4-phase timeline (Fundação → Construção → Mercado → Crescimento).

Auxiliary surfaces: **Login**, **Sign-up**, **New Post** modals; **Toast** notifications; **User chip** dropdown for the logged state. There is currently **no mobile app, no docs site, no separate marketing micro-sites** — everything ships from a single SPA-ish HTML+CSS+JS bundle.

## Sources used to build this system

All sources were provided as uploads and copied into this project under `reference/`:

| File | Origin | Role |
|---|---|---|
| `reference/d30-original-index.html` | uploads/index.html | The "real" production HTML — references external `styles.css` + `app.js` (app.js was NOT provided; behaviour inferred from the v3 single-file). |
| `reference/d30-original-styles.css` | uploads/styles.css | The authoritative stylesheet for tokens, components and layouts. **Primary source of truth.** |
| `reference/d30-v3-single-file.html` | uploads/d30_site_v3.html | A self-contained earlier version with inline `<style>` + inline `<script>` — used to recover the JS behaviour (Lenis smooth scroll, custom cursor, letter-by-letter hero animation, story horizontal scroll, forum split, fórum data fixtures). |
| `assets/augusto.png` | uploads/augusto.png | Black-and-white portrait of the founder, Augusto. Used in the About / profile card. |
| `uploads/0226011D-…PNG` | duplicate of augusto.png | Same image — not copied a second time. |

No Figma file, no GitHub repo, no codebase, no logo SVG, no slide deck and no brand guidelines doc was supplied. The system below is reverse-engineered from the two HTML files and one stylesheet.

---

## Quick index — files in this project

```
README.md                  ← you are here
SKILL.md                   ← invocation prompt for Claude / Claude Code
colors_and_type.css        ← all design tokens (CSS vars) + semantic type classes
assets/
  augusto.png              ← founder portrait
preview/                   ← cards rendered into the Design System tab
  *.html
ui_kits/
  website/
    README.md
    index.html             ← interactive recreation of the marketing + community site
    *.jsx                  ← React components (Nav, Hero, Buttons, ForumSplit, …)
reference/                 ← raw source uploads, preserved verbatim
  d30-original-index.html
  d30-original-styles.css
  d30-v3-single-file.html
```

There is **one UI kit**, `ui_kits/website/`, because D30 is a single-product brand. If a mobile app or a separate docs site appears later, add a sibling folder under `ui_kits/`.

### `ui_kits/website/` — the only product

A React-on-Babel recreation of the four-page SPA. Open `ui_kits/website/index.html` for the click-through demo:

- **Pages** — `HomePage`, `AboutPage`, `ForumPage`, `RoadmapPage`.
- **Chrome** — `Nav` (with `Logo` and `UserChip`), `Footer`.
- **Forms** — `LoginModal`, `SignupModal`, `NewPostModal`, `Field`, `ToastStack`.
- **Forum** — `TopicsPane`, `ThreadPane`, fixture data in `ForumData.jsx`.
- **Other** — `CustomCursor` (dot + lagging ring), `ProfileCard`, `ValuesGrid`, `Phase`/`RoadmapItem`.

See `ui_kits/website/README.md` for the full file map and the demo script (sign up → reply on a forum thread → log out).

---

## CONTENT FUNDAMENTALS — how D30 talks

**Language: Brazilian Portuguese, always.** All copy uses `pt-BR`. Never English-default ("Sign up", "About"); use "Criar conta", "Sobre". The only English fragments that survive are deliberate dev-culture words ("dev", "road map", "GitHub", "LinkedIn"), which appear inline mid-Portuguese.

**Person & address: informal `você` ("voce@email.com"), often the even more informal contracted forms** — `tá`, `pra`, `vocês`, `cê`, `tô`. D30 speaks like a friend at a kitchen table, not like a teacher. Verbs land in the present and the imperative without softening particles.

**Tone: blunt, honest, anti-hype.** The brand is explicitly positioned **against** the "career-change influencer" archetype. Look at the receipts:

- *"Não é mais um curso. É uma comunidade."* ("It's not another course. It's a community.")
- *"sem atalhos, sem promessas vazias. Só pessoas reais na luta."* ("no shortcuts, no empty promises. Just real people in the fight.")
- *"Não tem fórmula mágica."* ("There's no magic formula.")
- *"O segredo é regularidade, não intensidade. 1h por dia > 5h só no domingo."*
- *"Síndrome do impostor é praticamente um rito de passagem na área."*

**Casing rules:**
- Sentence case everywhere — **never Title Case** for headings.
- Eyebrow labels are **UPPERCASE with 2px letter-spacing** (`SOBRE A D30`, `ROAD MAP`, `O QUE VOCÊ ENCONTRA AQUI`).
- Numerals like phase numbers are zero-padded: `01`, `02`, `03`, `04`.
- Buttons are sentence case with no punctuation except an optional trailing arrow: `Quero fazer parte →`, `Saber mais`, `Entrar`.

**Punctuation & rhythm:**
- Em-dashes ` — ` (with spaces) are everywhere — they're the brand's favourite rhetorical move. Use them for asides and reversals.
- Period-stop short sentences. *"Consistência. Comunidade. Coragem."*-style lists are on-brand.
- Avoid exclamation marks; D30's emotion is conviction, not enthusiasm.
- Ellipses appear in placeholders only (`Conta mais detalhes, contexto, o que você já tentou...`).

**No emoji in product chrome.** No emoji in headings, buttons, labels, nav. Emoji appear *only* if a forum user types one in a message. Don't decorate cards or strip labels with 🚀 ✨ 💡 — the brand reads as more serious than that.

**Unicode characters that DO appear** are used as semantic glyphs: `→` (CTA arrow, post-hover indicator), `✓` (done check), `▶` (active phase), `◯` (upcoming item), `×` (modal close), `·` (separator in footers and metadata), `∞` and `0` and `100%` as stat-numbers in the hero.

**Vocabulary anchors — keep these words on-brand:**
| Concept | D30 says | NOT |
|---|---|---|
| career switch | *transição (de carreira)* | "career pivot" |
| beginner | *iniciante*, *quem tá começando* | "newbie" |
| question | *dúvida* | "issue" |
| achievement | *conquista* | "win" |
| journey | *jornada*, *caminho* | "path to success" |
| resource | *recurso* | "asset" |
| community | *comunidade* | "tribe" |
| consistency | *consistência*, *constância* | "discipline" |
| free | *gratuito*, *grátis* | "no-cost" |

**Standing closing line:** every footer reads `Feito por @Dev.aos30 · D30 é de todo mundo`. Treat it as a brand signature — keep it on every page.

---

## VISUAL FOUNDATIONS — the look of D30

### Colour vibe — near-black + one purple

D30 is a **dark-mode-only** product. The canvas isn't pure black but a stack of four near-blacks:
- `#080808` page, `#0f0f0f` cards, `#141414` card-hover, `#1a1a1a` active tab.

The single accent is **purple**, in three steps:
- `#8b7cf8` (hover, dot, glow), `#6d5ce6` (default — buttons), `#4c3db5` (deep — gradient anchor).

Tags re-use **subtle alpha-tinted accents** (`#4ade80` green for *conquista*, `#fbbf24` amber for *recurso*, `#f472b6` pink for *carreira*, `#fb923c` orange for the "EM ALTA"/hot marker). These are tints only — they only ever appear at 12–15% alpha as a pill background with the saturated hue as text. They are **never used as primary surfaces or full buttons.**

There are no warm whites, no off-whites, no cream. Text is `#f0f0f0`, secondary is `#888`, tertiary `#555`. That's it.

### Typography

**One family: Inter** (loaded from Google Fonts), weights `300 / 400 / 500 / 600 / 700 / 800 / 900`. The display weight (`900`) is used aggressively on the hero `D30` wordmark with extreme negative tracking (`-4px`); body settles back to `400`/`500`.

Pattern:
- **Display** — `Inter 900`, `clamp(56px, 10vw, 96px)`, tracking `-4px`, the `30` always in purple.
- **H1 page titles** — `Inter 800`, `clamp(36px, 6vw, 56px)`, tracking `-2px`, second clause often wrapped in `<span>` purple.
- **Eyebrow labels** above every page title — `Inter 600`, `12px`, **uppercase**, tracking `2px`, purple.
- **Body** — `Inter 400`, `15–17px`, line-height `1.6–1.8`, color `--muted` (`#888`) — note: **body text is muted by default, not the brightest white**, so headlines pop.
- **Strong inside body** — re-asserts to `#f0f0f0` at weight `500–600`, no underline.

There is no serif. No script. No mono in production currently — we tentatively include **JetBrains Mono** as `--d30-font-mono` for future code blocks since this is a dev community; flag if/when you use it for the first time.

### Backgrounds, motifs, texture

- **No photographic backgrounds** other than the one founder portrait (B&W, low-key lit, looks-at-camera). No stock photos. No illustrations.
- **Grid overlay** — a `60×60px` rgba-white grid masked with a radial gradient sits behind the hero. Subtle (`0.03` opacity), aspirational/scientific feel.
- **Soft radial gradients** — two purple radial blobs (top-centre and bottom-right) glow at 7–12% alpha behind the hero. These are the *only* gradients; they're used as ambient light, never as button fills.
- The profile avatar is the **only** filled gradient (`linear-gradient(135deg, var(--purple3), var(--purple))` for the empty/initial-letter state — when an image is present it replaces the gradient).
- No noise, no grain, no patterns. The aesthetic is *clean dark*, not gritty dark.

### Borders, radii, cards

| Element | Radius |
|---|---|
| Tag pill | 4px |
| Nav link | 6px |
| Input, item, small button | 8px |
| Primary / ghost button | 10px |
| Card, menu, toast | 12px |
| Large surface (forum split) | 14px |
| Feature grid, profile card | 16px |
| Modal | 20px |
| Story card | 24px |
| Badge, chip, hero badge | 999px |

**Hairlines, not heavy borders.** All borders are `1px` with rgba-white tints: `0.07` default, `0.12` stronger, `0.25–0.5` purple on focus/hover.

**Cards** have: `--bg-2` background + `1px` hairline border + radius from the table above + occasional shadow `0 8px 24px rgba(0,0,0,0.4)`. On hover, border shifts to `rgba(139,124,248,0.3)`, card translates `-2px to -3px`, and an inner radial glow may fade in. Cards are **never plain rectangles** — they always animate state.

### Shadows / elevation

Two shadow families:
- **Black drop** — `0 8px 24px rgba(0,0,0,0.40)` for cards, `0 12px 32px rgba(0,0,0,0.50)` for modals.
- **Purple glow** — `0 8px 28px rgba(139,124,248,0.25)` reserved for the hovered avatar / focused active dot. Used as a soft "this is live" signal, not as a brand stamp on every element.

Avatars also use a `box-shadow: 0 0 0 2px` ring trick instead of a real border, so it can scale on hover without re-laying out.

### Animation language

**Easing curve:** `cubic-bezier(.2, .7, .2, 1)` (a strong out-cubic) for entrances. Plain `ease` for hover swaps. **No bouncing, no spring, no overshoot.**

**Durations:**
- `0.15s` for button transforms (translateY -1/-2px).
- `0.2s` for background / color swaps.
- `0.3s` for transforms and scale.
- `0.35s` for full-page fades.
- `0.5s` for the avatar image zoom on hover.

**Signature animations:**
1. **Letter-by-letter hero entrance** — each letter starts `translateY(40px) rotateX(-90deg)` and falls into place. Staggered ~80ms per character for the wordmark, ~25ms for the sub-line.
2. **Reveal-on-scroll** — generic `.reveal` class — opacity 0 → 1, `translateY(30px) → 0`, 0.8s ease. Driven by `IntersectionObserver` at `0.15` threshold.
3. **Sticky horizontal scroll** — the "Por que existe" four cards slide horizontally as you scroll vertically; the section is `400vh` tall, the inner is `position: sticky`, and the track's `translateX` is driven by scroll progress.
4. **Page fade transitions** — when navigating between Home/About/Fórum/Roadmap, the current page fades out (`opacity 0`) for 280ms, then the new page fades in.
5. **Pulsing badge dot** — `@keyframes pulse` 50% to 0.4 opacity, infinite 2s.
6. **Active-phase glow** — `@keyframes glow` ping-pongs the box-shadow from `0 0 8px` → `0 0 20px` at 0.4–0.7 alpha.

**Lenis** is used for smooth-scroll (`duration: 1.2`, custom easing). All scrolling is buttery. Avoid jarring jumps.

### Hover, focus, press states

- **Hover, primary button** — `background: var(--purple-2)` → `var(--purple)` (lighter, more saturated) + `translateY(-2px)` + a radial highlight tracks the cursor inside the button (`--mx --my` CSS vars set on mousemove).
- **Hover, ghost button** — text muted → bright, border `0.12` → `0.25` white, `translateY(-2px)`.
- **Hover, nav link** — muted text → bright, background `transparent` → `rgba(255,255,255,0.05)`.
- **Hover, card** — border `0.07` white → `0.3` purple, `translateY(-2-3px)`, sometimes background shifts to `--bg-3`, sometimes an inner radial glow fades in.
- **Hover, forum post-item** — entire row shifts **right** with `padding-left` going `1.5rem → 2rem`, an inserted `→` arrow fades in from the left, title color shifts to purple, avatar scales 1.08.
- **Hover, roadmap item** — `translateX(4px)` + border to soft purple.
- **Focus, input** — border → `rgba(139,124,248,0.5)`, background → `--bg-2` (one step lighter).
- **Press / clicking** — the custom cursor ring shrinks to `28×28` with a `0.3` purple fill — there's no "scale-down" on the element itself.
- **Disabled button** — background `--bg-4`, text `--muted-2`, no transform.

### Custom cursor

This is a **defining** brand element. The page sets `cursor: none` on `<body>` and renders two divs:
- A solid `6px` purple **dot** that tracks the mouse 1:1.
- A `36px` purple-outlined **ring** that lags behind with 18% easing per frame.

On hoverable elements (`[data-cursor="hover"]`), the ring **enlarges** to `64×64` and fills with `rgba(139,124,248,0.15)`. On press, it shrinks to `28×28` with `rgba(139,124,248,0.3)`. On `mouseleave` of the window both fade out.

Disabled below `768px` and on `(hover: none)` devices. **When using this design system in mocks, recreate the cursor.** When using it in a real serious context (PDF deck, screenshot), consider keeping `cursor: auto`.

### Layout rules

- **Fixed top nav, 56px tall, full-width, translucent `rgba(8,8,8,0.85)` + `backdrop-filter: blur(20px)`**, hairline bottom border.
- Pages get `padding-top: 56px` to clear it.
- Content containers: narrow `720px` (roadmap, modal body), prose `760px` (about), wide `1100px` (forum), full `1280px` if needed.
- The fórum split is the only **two-column** layout: fixed `340px` left rail + flex right pane. Collapses to one column under `768px`.

### Transparency & blur

- Nav: `rgba(8,8,8,0.85)` + `blur(20px)`.
- Modal backdrop: `rgba(0,0,0,0.7)` + `blur(8px)`.
- Purple alpha tints on backgrounds: `0.08 / 0.10 / 0.14 / 0.30` (badge, hover, press).
- Grid overlay: `0.03` white on near-black.

Transparency is **always used to layer**, never just for novelty. Blur happens in chrome (nav + modal), not in content.

### Image vibe

The single image (`augusto.png`) is **black-and-white, low-key, studio-lit**, ~`1040×1550px`, plain dark-grey backdrop. If we add more imagery, match this treatment: portrait, B&W, looks-direct-at-camera, no smiling on cue, soft single-source key light, never lifestyle stock. Warm tones would feel off-brand; the image vocabulary is **cool, grain-free, almost-noir**.

### Spacing

The system uses an 8px-ish scale via Tailwind-like rem values. Section padding is generous: `5rem` (80px) vertical on most sections, `6rem 2rem 4rem` for the About hero, `4rem 2rem` on the home hero (with a `min-height: 100vh` constraint).

Gap-between-cards is mostly `1rem` (16px) or `1.5rem` (24px). Inside-card padding is `1.25–2rem`. Buttons have `12px 28px` (primary) or `7px 16px` (nav cta) padding.

---

## ICONOGRAPHY

D30 takes a **maximally minimal** approach to iconography — the system has essentially **two icons across the whole product**:

1. **A search lens** — inline SVG, 13×13, `stroke-width: 2`, rounded caps. Used in the topics search and the forum search.
2. **A logo wordmark** — there is **no logo SVG**. The brand mark is rendered in **text** as `D30` (Inter 900, the `30` in `--purple`). Treat the wordmark as text in all uses; if you ever need it as a static image, render it from CSS and screenshot, don't hand-draw an SVG.

Everything else that *looks* like an icon is a **unicode glyph** styled in CSS:

| Glyph | Use |
|---|---|
| `→` | CTA buttons (`Quero fazer parte →`), post-item hover indicator |
| `✓` | Done items in roadmap, done dots |
| `▶` | Active phase dot, active sub-item |
| `◯` | Upcoming / not-yet-started item |
| `×` | Modal close button |
| `+` | "Nova publicação" button prefix |
| `·` | Separator in metadata + footer |
| `•` (dot, 3×3px div) | Inline separator in `.topic-meta` |

There is **no icon font, no Heroicons / Lucide / Feather** in the source. There are no PNG icon assets.

**Recommended substitution for new icons:** **Lucide** (`https://unpkg.com/lucide@latest`) — it visually matches the existing inline-SVG style (`stroke-width: 2`, rounded caps, 24×24 viewbox). Use it sparingly: if you find yourself adding more than ~3 icons to a screen, you've drifted off-brand. When you DO use Lucide, set `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"` to match the existing search-lens SVG.

**Avatars are not icons** — they're either:
- An image (`<img>` inside a circle with `box-shadow: 0 0 0 2px` ring), or
- A solid-color circle (`#7c3aed`, `#059669`, `#b45309`, `#be185d`, `#fbbf24`) with the user's **initials in `#fff Inter 700`**. Avatar size varies: 28 (chip), 32 (msg), 36 (post-item), 88 (profile card).

**Emoji are not part of the system.** Do not add them.

---

## Font note (flagged substitution)

The source loads Inter from Google Fonts via `@import` — there are no `.ttf`/`.woff2` files in the uploads, so we mirror that approach in `colors_and_type.css`. **No substitution was needed.** If you ever need to ship offline, drop the Inter `.woff2` files in `fonts/` and rewrite `@import` as a local `@font-face`.

JetBrains Mono is included as a forward-looking mono choice (not used in the source) — flag it the first time you actually use it so the user can decide if it's the right call.

---

## How to use this system

1. Link `colors_and_type.css` at the top of any new HTML file. All tokens are namespaced `--d30-*` so they won't collide.
2. For high-fidelity recreations of D30 UI, lift components from `ui_kits/website/`. Copy the JSX, don't re-derive from screenshots.
3. For deck slides, social cards or one-off mocks, lean on the **CONTENT FUNDAMENTALS** rules above so the voice doesn't drift, and the **VISUAL FOUNDATIONS** rules so the look stays in-family.
4. New imagery: B&W portrait or no imagery at all. New iconography: Lucide, sparingly. New copy: Brazilian Portuguese, blunt, no emoji.

When in doubt: **less is more, dark not gritty, purple is the only accent.**
