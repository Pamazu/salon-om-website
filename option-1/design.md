# Design — decisions for building the site

This is the working design memory. The README (brand book) holds the full rules. This file records **how we build pages** and **why** each choice was made. Update it whenever a design decision changes.

## Direction

**"Embossed gold on warm paper."** Ivory ground, gold hairlines, a light high-contrast serif, spaced sans caps and whole fields of earth colour taken from the mood boards (sand, stone, sage, forest, clay, chestnut, ocean). The feel is a calm luxury spa, editorial and unhurried. Everything comes from the logo (gold, ivory, the serif O, spaced SALON) and the two Pinterest boards (earth palettes, textures, arches, affirmation tiles, spa layouts).

## Decisions log

| # | Decision | Why |
| --- | --- | --- |
| D1 | Two themes: **Daylight** (ivory, default) and **Evening** (deep earth) | The logo lives on ivory. A dark theme gives evening and candle-light moods (board 2) and honours `prefers-color-scheme` |
| D2 | Gold splits into `gold` (marks, 24px+) and `gold-ink` (readable text, buttons) | The logo gold is only 3:1 on ivory, which is too low for text |
| D3 | Cormorant Garamond + Jost, self-hosted | Cormorant matches the logo's thin-thick O. Jost matches the geometric SALON caps. Both are OFL |
| D4 | ~~Earth colours used only as full fields~~ Superseded by D12: saturated earth colours are small accents; neutrals carry the area | Client feedback, 12 Oct |
| D5 | The arch (`radius-arch` top corners) is the signature image shape, one per view | Arched alcoves recur on board 2 |
| D6 | Square photography and bands, `radius-sm` controls, `radius-md` cards | Editorial, not "app-like" |
| D7 | Almost no shadow: hairlines and colour fields carry structure | The embossed-paper feel |
| D8 | No icon set. A few typographic glyphs (→ + − ✓). No emoji | Keeps it calm. The boards show no iconography |
| D9 | Logo redrawn as outlined SVG paths (no live fonts) | Scales and recolours anywhere: web, print, signage, embroidery |
| D10 | **No monogram.** The full mark everywhere, in two cuts: master (240px+) and a small cut with heavier hairlines and a larger SALON | Client feedback, 12 Oct: the small "Om" lost the logo's details |
| D11 | Header is white (`surface-raised`), tall (about 160px desktop) and sticky, with the full logo (small cut, 128px) centred and links split either side. It compacts on scroll | Client asked for the white desktop header to fit the real logo with all its details |
| D12 | **Colour proportions:** Neutrals 85% · Naturals 9% · Accents 6%, shown in the MoodStrip. CTA band moved from forest to sand. Affirmation tiles use neutrals plus at most one sage | Client: mostly neutral backgrounds, saturated colour only to catch attention |
| D13 | Three layouts per section: desktop ≥ 1024, tablet 640–1023, mobile < 640, by **container queries** | Client asked for responsive sections. Container queries make each block responsive wherever it is placed |
| D14 | The hero media is a **generated, living sea** (WebGL) in the arch, with a generated surf sound (Web Audio) on the same wave clock. Sound is opt-in | Client wants a beach that feels alive, plus calm, restorative wave sound, with no copyright issues |
| D15 | Textures for cards and tiles are generated in code (sand, plaster and palm shadow, sage plaster, linen, travertine) | No licensing risk. Matches the boards' textures |
| D16 | Placeholder **photography** generated with Magnific (Nano Banana 2, 2K): a coaching corner, the salon, a healing circle, a woman walking the shoreline (seen from behind), sand, linen and plaster with palm shadow. Web copies are 1600px WebP | The client asked for high-quality generated placeholders. Real photos replace them before launch |
| D17 | Photos that carry text get a `photo-veil` wash (faint ivory by day, deep earth by evening) | Keeps affirmation text legible in both themes |

## Page anatomy

Each page follows the same rhythm, alternating `surface` and `surface-sunken` (linen) sections:

1. `SiteHeader`: white and sticky. `compact` after about 40px of scroll.
2. `Hero`: text plus an arch holding the living sea (Home) or an image (inner pages). `WaveSound` sits in its footnote, with a compact copy floating bottom-right after the hero.
3. Content sections, each opened by `SectionHeading`, `space-9` vertical padding.
4. A pause: `Affirmation` (one tile or a row of three) or `MoodStrip`. Use one per page.
5. Proof: `Testimonial` (real quotes only).
6. `CTABand` (sand) as the closing invitation, one per page.
7. `NewsletterForm` (on surface), then `SiteFooter` (linen).

## Layout

- Container `width-content` 1160px, centred. Text column `width-text` 680px. Header inner width `width-wide` 1440px.
- Three layouts, by container width: **desktop ≥ 1024px**, **tablet 640–1023px**, **mobile < 640px**. `Section` sets the container. Components such as `OfferingCard` and `Affirmation` also measure themselves.
- Offerings: 3 columns on desktop. On tablet, 1 column with cards lying flat (image beside text). On mobile, 1 column with cards stacked.
- Affirmations: 3 tiles in a row, scrolling sideways with snap on mobile.
- No horizontal page scroll at 360px. The sticky header needs `scroll-padding-top` (about 132px) so anchors land below it.

## Component map

| Need | Component |
| --- | --- |
| Brand mark | `Logo` (full mark; master or small cut) |
| Navigation | `SiteHeader`, `SiteFooter` |
| Page opening | `Hero` |
| Section title | `SectionHeading` |
| Services | `OfferingCard` grid |
| Coach story | `AboutStory` |
| How it works | `JourneySteps` |
| Page band | `Section` |
| Pause / mood | `Affirmation`, `MoodStrip`, `ArchImage` |
| Living sea | `Shoreline` (picture), `WaveSound` (sound) |
| Social proof | `Testimonial` |
| Conversion | `Button`, `CTABand`, `NewsletterForm`, `TextField` |
| Questions | `FAQ` |

## Imagery direction

Choose textures over faces: sand ripples, wood grain, palm and monstera leaves, cracked plaster, water with sun glints, candles and smoke, linen, hands, arched interiors. Use warm, desaturated colour and natural light. Faces, when used, are calm and unposed. Until real photography exists, use the Magnific placeholder photos (`Maggie website/images`) or the generated textures in the Imagery group. Prompts that worked: warm desaturated palette of ivory, linen, sand, stone and muted sage; soft natural light; editorial interior photography; no people, text or logos. The coach's portrait must be a real photo.

## Not yet decided

- How the waves should move: waiting for the client's reference beach image and notes. Then tune `Shoreline` (speed, wave size, colour, foam, camera angle) and possibly go full-bleed.
- The final photography set and art direction for a shoot.
- Whether a Contact page needs a map (a styled static map would fit better than a default Google embed).
- How the booking widget is styled: it depends on which tool is chosen (see specs.md).
