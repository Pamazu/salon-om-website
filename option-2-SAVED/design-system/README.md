# Salon OM — Option 2: "OM is everything."

OM is the first sound, the breath of everything: earth, water, fire, air and space, held as one. Option 2 turns that idea into a **cinematic slideshow through the five elements**. Every section fills the screen, slow-motion films loop behind lean classical headlines, and each section breathes in as it arrives. It sits beside Option 1 ("Embossed gold on warm paper") as a separate direction for the client to choose between.

_Version 2, 12 Oct 2026._ Read `shared.md` (rules and facts), `design.md` (decisions, layout, **motion rules**) and `specs.md` (status) before changing anything.

## Essence

- **Unity, felt rather than explained.** Five elements, one breath. The circle O of the logo, the breathing rings behind the manifesto and the slow loops of the films all say the same thing.
- **Alive, never busy.** Everything moves slowly, with an ease-in-out, like breathing. One idea moves at a time.
- **Warm and grounded.** Umber, bark and clay grounds; forest green as the one accent.

## Logo

The brand is registered as **SALON OM**. **SALON always comes first and stays small**: tracked above a lean classical **OM** (stacked) or before it, past a hairline (inline, "SALON | OM"). OM is outlined from Cormorant Garamond Light, with the O opened to a true circle. Ivory on dark and film, umber on clay, forest for a single accent use. On the homepage, OM draws itself as a fine outline and then fills in. Never add rings, glows or gradients, and never place SALON after OM.

## Colour

- **Grounds (about 70%):** umber `#15100C`, bark `#2A1E16`, clay `#E7D9C6`, deep clay `#D9C4A8`. Alternate dark and light so the page breathes.
- **Films (about 25%).**
- **Accent (about 5%), one per screen:** forest green `#276B45` fills the main buttons; forest-deep `#1E5A3A` sets accent words on clay; forest-light `#8FCBA4` marks on dark. Each element chapter has one soft accent of its own, used only on its number and the full stop of its title.
- **Never:** several accent colours side by side, multi-colour strips, coloured section borders, separator lines between sections.

## Type

**Cormorant Garamond** (Light for display, Regular for mid sizes, Light Italic for accent words) with **Instrument Sans** for small text and UI. Big headlines, small tracked labels: "Ground." at up to 280px above a 12px label.

## Motion

The page snaps from one full-screen slide to the next. Arriving slides play their entrances (films settle from big to normal, text slides in from a soft blur, headlines rise out of masks); leaving slides drift and darken under the next one. The manifesto writes itself in letter by letter. **Every transition eases in and out.** Films always loop in slow motion and can be paused from the header. With Reduce Motion on, the same choreography plays more gently. Full rules, tokens and timings: `design.md` → Motion rules.

## Voice

Warm, direct, hopeful. Short invitations in sentence case: "Begin.", "Return to yourself", "Ready to choose growth?". The coach speaks in the first person in her story. **Never use the word "home"** ("come home", "feel at home"): home is not a welcoming place for everyone. Use begin, return, reconnect, arrive, belong instead.

## Imagery

Our own films and photos only, generated on the client's Magnific account: a misty rainforest (hero), driftwood in golden light (Ground), a shoreline (Water), candles (Fire), curtains in the breeze (Air) and incense smoke (Ether). Natural light, slow movement, no people standing in for the coach. Text on film always sits on the defined scrim.

## Components

`Logo`, `Button`, `SiteHeader`, `Slide` (the full-screen building block with activation, film and leave effect), `Manifesto`, `ElementChapter`, `OfferTile`, `Quote`. All live in `window.SalonOM2`; styles in `components/bundle.css` match the live homepage.

## Files

- Homepage artifact: "Salon OM Option 2". Offline copy: `Maggie website/option-2/site/index.html`.
- Assets here: Logos (v2 vectors), Films (slow-motion loops + posters), Photography (shared with Option 1).
