Salon OM is a sanctuary for healing, growth and transformation, led by a coach whose work is rooted in her own lived experience. The brand should feel like embossed gold on warm paper: quiet, tactile, unhurried, with plenty of room to breathe. Everything here builds the Salon OM website.

## Voice and content

The voice is the coach's own: warm, honest, compassionate and grounded in lived experience. It speaks to someone who is ready to reconnect with themselves.

- Write in the first person ("I guide…", "I know firsthand…") when the coach speaks: About, Coaching, letters. Write in the second person ("you") to invite: heroes, CTAs, affirmations.
- Use her words: *heal, grow, transform, reconnect, inner wisdom, resilience, aligned, empowered, authentic, thrive, peace, purpose.* Real examples from her bio:
  > "Transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage."
  > "Not simply survive life's challenges, but learn to thrive through them."
- Keep sentences calm and short. Avoid hype, urgency ("Limited spots!"), exclamation marks, emoji and therapy jargon. Make no promises of cures or outcomes.
- Headlines are short invitations in sentence case ("Return to yourself", "Ready to choose growth?"). Never use the word "home" (no "come home", "feel at home"): home is not a welcoming place for everyone. Eyebrows and buttons are written in sentence case and uppercased by CSS.
- Affirmations are 2–8 words in italic ("Feel it to heal it.", "Soft & strong.").
- The name is always **Salon OM** in text. The logo itself reads "SALON Om".

## Colour proportions

Neutrals carry the page. Saturated colours are accents that catch the eye where it matters. The **MoodStrip** card shows the mix at its real proportions. Aim for this share of any page or screen:

| Tier | Colours | Share | Use |
| --- | --- | --- | --- |
| Neutrals | `surface` (ivory) 46%, `surface-sunken` (linen) 20%, `sand` 12%, `stone` 7% | **≈ 85%** | Backgrounds, sections, cards, image grounds |
| Naturals | `sage` 5%, `ink` 4% | **≈ 9%** | Text, one botanical tile or image |
| Accents | `gold` / `gold-ink` 3%, `forest` 1.5%, `ocean`, `clay`, `chestnut` 0.5% each | **≈ 6%** | The primary button, eyebrows, hairlines, the logo, one focused detail |

- Alternate full-width sections between `surface` and `surface-sunken`. Use `sand` for the closing CTA band and tiles. `surface-raised` (white) is the site header, cards and fields.
- Never fill a full-width section with `forest`, `chestnut`, `ocean`, `clay` or `sage`. A saturated colour earns its place by being small: a button, a badge, a hairline, a single tile.
- Text is `ink`, with secondary text in `ink-muted`. Gold text is always `gold-ink` (eyebrows, links, the primary button fill with `on-gold-ink` text). `gold` is for the mark, hairlines, numerals and display type 24px+, never body text.
- `success` and `danger` are for forms only, always with words.
- Focus: every focusable element shows `focus-ring`, a 2px surface gap then a solid 2px `ink` ring (13:1 in both themes).

## Type

- **Cormorant Garamond** (`--font-serif`) echoes the high-contrast O of the logo. Use it light and large for `display-xl` (one per page), `display-l`, `heading`, `title`, and italic only for `affirmation`. Never bold.
- **Jost** (`--font-sans`), a geometric sans like the logo's spaced SALON, sets `lead`, `body` (17px, 1.7), `small`, and the uppercase `eyebrow` (0.32em tracking) and `button` styles.
- Running text is max 68ch. Leads are max 60ch. Body is never smaller than 16px. Display sizes step down at tablet and mobile (for example the hero runs 88 → 64 → 50px).

## Responsive layout

Every section is responsive to **its own width** (CSS container queries), so a block behaves the same in a full page, a sidebar or a preview. There are three layouts:

| Layout | Width | What changes |
| --- | --- | --- |
| Desktop | ≥ 1024px | Header with links either side of the centred logo. Two-column hero and About. Three offering cards. Four journey steps. Four footer columns |
| Tablet | 640–1023px | Header with Book at left, logo centred, menu at right. Offering cards lie flat (image beside text). Steps in a 2×2 grid. Newsletter stacks |
| Mobile | < 640px | Header with logo centred and menu at right (Book moves into the menu). Everything stacks. The primary button goes full width. Affirmation tiles scroll sideways. Steps list with numbers at left |

Wrap page content in `Section` (it carries the container, the gutters and the vertical rhythm). Gutters are `space-6` desktop, `space-5` tablet, `space-4` mobile. Section padding is `space-9` desktop and `space-8` below. Content is max `width-content` (1160px), text max `width-text`.

## Space, shape, depth

- Most of the site is square-edged (`radius-none`): photography, bands, mood strips. Buttons and inputs take `radius-sm`, cards `radius-md`.
- **The arch** is the signature shape: `radius-arch` on the top corners of one image per view (`ArchImage`).
- Depth is nearly flat. Use hairlines in `line` and colour fields. `shadow-soft` is only for a hovered card, the header once the page scrolls and floating controls.
- Motion is slow, soft fades and 4px shifts (250–350ms ease), all disabled under `prefers-reduced-motion`. The one living element is the sea (`Shoreline`).

## Imagery and sound

All imagery and sound are **generated for Salon OM**, so there are no licensing questions:
- `Shoreline` draws a top-down sea washing over sand in real time (WebGL). Each wave lasts 8.5–12 seconds and reaches a different height. It renders a still frame under reduced motion and falls back to `shore-still.webp` without WebGL.
- `WaveSound` synthesises the surf in the browser (Web Audio): a distant bed of surf, the rush of each wave up the sand and the hiss of the backwash. It follows the same wave clock as `Shoreline`, so sound and picture breathe together. Sound **never autoplays**. It starts only when a visitor taps the control and fades in over a few seconds.
- The **Imagery** asset group holds generated textures: sand ripples, plaster with palm shadows, sage plaster, linen and travertine. Use them for cards, tiles and arches. Real photography (the coach's portrait, the space) replaces them where people expect to see a real thing.
- Mood: textures and natural light. Warm, desaturated, earthy, with soft shadows. Avoid stock smiles, saturated colour, gradients and busy backgrounds behind text.

## Logo

The mark is the full lockup: ring, SALON, Om and its flourish. **There is no separate monogram.** Use the full mark everywhere, in one of two cuts:
- **Master** (`salon-om-logo-*.svg`) at 240px wide and up: hero, About, print.
- **Small cut** (`salon-om-logo-small-*.svg`) under 240px: the site header (128px tall desktop, 104 tablet, 84 mobile), the footer, CTA bands. Its hairlines are heavier and SALON larger, so every detail stays visible.

The inks are `gold` (default), `ink` and `ivory`. `salon-om-logo-foil.svg` is for large decorative use on ivory only. Leave clear space equal to the height of the "m". Never stretch, outline or shadow the mark. The `Logo` component picks the cut from its size.

## Iconography

Salon OM has no icon set and uses none. A few typographic glyphs do the work: → for links (in `Button` `text`), a hairline + / − for disclosure (`FAQ`), ✓ for confirmations, and four swelling bars for the sound control. If icons become necessary, use a thin-stroke line set at 1px to match the hairlines, in `ink` or `gold-ink`. Never use emoji.

## Using the components

The components are React 18 and are exported on `window.SalonOM`. Load `tokens.css`, the fonts and `components/bundle.css` first. Page bands (`Hero`, `CTABand`, `SiteHeader`, `SiteFooter`) are full-bleed and set their own padding. Everything else goes inside a `Section`. Project memory lives in the **shared**, **design** and **specs** sections that follow this brand book.
