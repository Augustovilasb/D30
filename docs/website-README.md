# D30 Website — UI Kit

A pixel-honest React recreation of the D30 marketing + community site. Open `index.html`.

## Stack
- React 18 (UMD) + Babel Standalone — no build step.
- One global stylesheet `d30.css` (lifted verbatim from `uploads/styles.css`).
- Component-scoped overrides in `kit.css` — just disables the always-on `cursor: none` so the OS arrow is a visible fallback while the JS cursor loads.

## Files

| File | What it does |
|---|---|
| `index.html`       | Mounts the kit. Loads React + Babel + every .jsx in load order. |
| `App.jsx`          | Top-level router (no real router — just `useState('home' \| 'about' \| 'forum' \| 'roadmap')`), modal coordinator, toast plumbing. |
| `CustomCursor.jsx` | Recreates the brand cursor — dot tracks 1:1, ring lags 18%/frame, swells on hoverable elements, shrinks on press. Disabled below 768px / on touch. |
| `Nav.jsx`          | Fixed top nav. Includes `Logo` (text wordmark) and `UserChip` (avatar + dropdown menu for the logged state). |
| `HomePage.jsx`     | Hero (badge, display, desc, CTAs, stats) + `FeaturesStrip` (4-up grid). Also exports `Footer`. |
| `AboutPage.jsx`    | Page title + origin story copy + `ValuesGrid` (hover-to-focus values) + `ProfileCard` for Augusto. |
| `ForumData.jsx`    | The five fixture topics with full thread fixtures lifted from the original site. |
| `ForumPage.jsx`    | Tabs + search + split layout. `TopicsPane` (left) and `ThreadPane` (right). Allows replies *only when logged in* — falls back to a sign-in nudge otherwise. |
| `RoadmapPage.jsx`  | Vertical 4-phase timeline. Each `Phase` has dot variants (done · active-with-glow · upcoming). |
| `Modals.jsx`       | `Modal` shell + `Field` + `LoginModal`, `SignupModal`, `NewPostModal`, `ToastStack`, `useToasts`. Real client-side validation. |
| `d30.css`          | The authoritative stylesheet. Don't edit casually — it doubles as the design-token source. |
| `kit.css`          | Two small overrides (cursor fallback, render-safe defaults so `.reveal`/letter animations don't leave content invisible). |

## Click-through flow you can demo

1. Land on **Home** — hero, stats, features.
2. Click **Saber mais** → goes to **About**. Hover the four value cards to swap the focused one.
3. Click **Fórum** in the nav — try the search field, switch tabs, click between topics on the left, see the thread render on the right.
4. Try to **+ Nova publicação** — you're nudged into **Login**.
5. Switch the modal to **Signup** via the inline link. Submit with too-short password → form errors. Submit valid → toast + nav shows a user chip.
6. Now reply on a forum thread. Try the **Road Map** page.
7. Hit the user chip → **Sair** → toast + back to anonymous.

## Caveats vs. the production site

- **No Lenis smooth scroll.** The original uses Lenis; we use native scroll. It's still fine on a modern browser.
- **The About "values" horizontal-scroll IS rebuilt** — sticky section + scroll-driven `translateX` on the track + closest-to-center card auto-focuses + progress dots. Native scroll, no Lenis dependency.
- **No letter-by-letter hero entrance** (handled differently in React; static is fine and matches the static snapshot of the hero in `reference/`).
- **`reveal` classes are visible-by-default** so the kit's preview screenshot is never blank — see `kit.css`.
- **No real backend.** Posts, replies, signups all live in component state and reset on reload.
