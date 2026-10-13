# Design — Option 2 decisions, layout and motion

This is the working design memory for **Option 2, "OM is everything."** Option 1 ("Embossed gold on warm paper") is saved separately in `Maggie website/option-1/` and in the "Salon OM Option 1" design system. Update this file whenever a design or motion decision changes.

_Saved reference version, 12 Oct 2026 (after the client's second review, the OM-first comment and the mobile/sound review). New directions continue as variations 2.2, 2.3 and 2.4._

## Direction

OM is unity: the first sound, everything at once. The site is a **cinematic slideshow through the five elements**. Every section fills the screen, and the page settles from one to the next like a slideshow (Tesla-style). Films loop slowly in the background, and each section animates in as it arrives. A lean classical serif carries the headlines and the OM mark, with small tracked sans labels. The grounds are warm and earthy (umber, bark, clay), never flat grey. The brand accent is **forest green**, used with restraint. Everything moves with an ease-in-out curve, slowly, like breath.

## Decisions log

| # | Decision | Why |
| --- | --- | --- |
| O2-1 | Logo: **"SALON" tracked small above a lean classical "OM"** (stacked), or "SALON │ OM" (inline, for the header). OM is outlined from Cormorant Garamond Light (master) or Regular (small cut); SALON from Medium/SemiBold. The O is opened to a true circle | Client: the brand is registered as SALON OM, so SALON comes first and stays the small text. Client asked for a sleeker, leaner OM |
| O2-2 | Brand accent: **forest green** `#276B45` (fills), `#1E5A3A` (text on clay), `#8FCBA4` (text on dark/film). Replaces the ember orange | Client, v2 review |
| O2-3 | Grounds: umber `#15100C`, bark `#2A1E16`, clay `#E7D9C6`, deep clay `#D9C4A8` | Neutral but warm and present ("not too neutral") |
| O2-4 | Type: **Cormorant Garamond** (Light 300 for display, 400 for mid sizes, Light Italic for accent words) + Instrument Sans for small text and UI | Client asked for sleeker, leaner headings. Replaces Gilda Display |
| O2-5 | **Slideshow layout**: every section is one full screen and the page snaps to each one (`scroll-snap-type: y mandatory`, `scroll-snap-stop: always`) | Client: "scroll and it transitions to the next section filling the viewport, like Tesla" |
| O2-6 | Films: hero = **misty rainforest** (Seedance 2.5, 10s); Ground = the driftwood film (formerly the hero); water shoreline, fire candles, air curtains, ether smoke (Kling 2.5). The sand-dune film is retired | Client: "Ground should not be sand"; "rainforest behind the hero" |
| O2-7 | **Films always loop on their own, in slow motion** (0.5–0.6× speed with motion-interpolated in-between frames, 30fps). No scroll scrubbing | Client: "videos need to auto play in a loop, slow motion like" |
| O2-8 | **No multi-colour strips, no coloured section borders, no separator lines.** One accent per screen | Client: "all colours in a single line looks childish"; "avoid the colourful lines between sections" |
| O2-9 | Single visual world (umber + clay), not tied to the OS light/dark setting | The films carry the page |
| O2-10 | Photography from Option 1 (Magnific placeholders) reused for offerings and story | Same resources across options |
| O2-11 | **The word "home" is never used** in brand copy (no "come home", "at home", "feel at home") | Client: home is not a welcoming place for everyone |
| O2-12 | **Soundscapes**: one per element plus a background bed, crossfading with the slides; off until the visitor turns it on | Client: "soundscapes that feel calm, very soothing and introspective" |
| O2-13 | Logo: SALON set a little smaller (0.09 of the OM cap height) and closer (0.2 cap heights above OM) | Client, mobile/hero review |

## Colour use

- **Grounds carry about 70%** of the page: umber and bark for films, offerings, the testimonial and the footer; clay and deep clay for the manifesto, story and letters. Alternate dark and light so the page breathes.
- **Films carry about 25%.**
- **Accent about 5%, one per screen.** Forest green fills the main buttons (ivory text, 5.5:1), the accent words of the manifesto (italic, forest-deep), the signature and the testimonial quote mark. Each element chapter has one soft accent of its own, used **only** on its number and the full stop of its title: Earth `#8FCBA4` (sage), Water `#8DB2F7`, Fire `#F2956B`, Air `#E8C26E`, Ether `#BBA5FA`. These never appear together, never as a strip, never as a border.
- On film, the hero's main button is ivory with ink text; ghost buttons are glass with an ivory outline.
- Text on film is always ivory on a scrim (see Readability). Text on clay is ink `#17110D` or ink-soft `#5E4E40` (5.7:1).

## Type scale

| Role | Face | Size | Notes |
| --- | --- | --- | --- |
| Chapter word | Cormorant Garamond 300 | clamp(78px, 15vw, 280px) / 0.82, −0.025em | One word + an accent full stop: "Ground." Phones: clamp(64px, 19vw, 120px) |
| Hero mark | Logo SVG | min(58vw, 660px) | 70vw tablet, 80vw phone |
| Closing word | Cormorant Garamond 300 | clamp(104px, 18vw, 320px) / 0.82 | "Begin." |
| Manifesto | Cormorant Garamond 300 | clamp(38px, 6.1vw, 112px) / 1.02 | Accent words in Light Italic, forest-deep |
| Section title | Cormorant Garamond 300 | clamp(46px, 6.4vw, 116px) / 0.92 | |
| Quote | Cormorant Garamond 300 | clamp(34px, 4.6vw, 78px) / 1.08 | |
| Tile title | Cormorant Garamond 300 | clamp(34px, 3.1vw, 54px) | |
| Spec value / lead | Cormorant Garamond 400 | 20–28px | Mid sizes use 400 so hairlines hold |
| Body | Instrument Sans 400 | 17px / 1.65 (16px phones) | Max 40ch on film, 56ch on clay |
| Label | Instrument Sans 500 | 12px, +0.22em, uppercase | Eyebrows, nav, spec names |
| Button | Instrument Sans 600 | 12.5px, +0.16em, uppercase | Pill, 50px tall (42px small) |

## Layout

- **Breakpoints:** desktop ≥ 1024px, tablet 640–1023px, phone < 640px. Gutter `clamp(18px, 4vw, 64px)`. Copy sits `clamp(30px, 6.5vh, 72px)` above the bottom of a slide, the same on every slide, and always starts on the gutter (aligned with the logo).
- **Slides, in order:** 1 hero (rainforest) · 2 manifesto (clay) · 3–7 Earth, Water, Fire, Air, Ether (films) · 8 offerings (bark) · 9 story (clay) · 10 testimonial (umber) · 11 closing film "Begin." · 12 letters + footer. Each is `100svh` (min 540px). The last slide may grow taller on phones.
- **Header:** fixed and transparent. Its ink follows the slide beneath it (ivory on dark and film, ink on clay), changing with an ease-in-out. Desktop: inline logo left, nav centre, pause-films button + Book pill right. Below 1024px: logo, pause, menu button; the full-screen menu lists numbered elements in large serif.
- **Chapter rail:** desktop only, right edge, numbers 01–05; the current one shows its name. Monochrome.
- **Chapter anatomy:** full-bleed film; bottom-left copy: meta row (italic number in the chapter accent, "/ 05", element · Sanskrit name), the huge word, then body + three specs (Focus / Practice / You feel). Phones show two specs; short screens hide them.
- **Offerings:** heading row, then three tiles filling the rest of the screen (desktop). Tablet and phone: a horizontal swipe carousel with a peek of the next tile.
- **Story:** a framed photo (inset from the header and the gutter, 4px radius) beside the copy; stacked below 1024px.

## Motion rules

**Principles.** Motion is breath, not decoration. **Every transition eases in and out** (no linear, no bounce, no ease-out-only snaps). Slow and continuous. One idea moves at a time. Everything readable is readable at rest.

**Easing and timing tokens**

| Token | Value | Use |
| --- | --- | --- |
| `--io` | `cubic-bezier(.65, 0, .35, 1)` | Text, UI, hovers, menu |
| `--io-soft` | `cubic-bezier(.37, 0, .63, 1)` | Ambient loops (breathing ring, aura, Ken Burns), colour changes |
| `--io-strong` | `cubic-bezier(.76, 0, .24, 1)` | Films scaling in, masks, clip reveals |
| `--t-ui` | 0.6s | Hovers, header colour, underlines |
| `--t-text` | 1.3s | Text sliding in |
| `--t-title` | 1.6s | Masked headline rise |
| `--t-film` | 3s | Film settling from big to its normal scale |

**The slideshow**

- The page snaps to each slide (`scroll-snap-type: y mandatory` on the page, `scroll-snap-align: start` and `scroll-snap-stop: always` on each slide), so one scroll gesture moves exactly one slide.
- A slide becomes **active** when 40% of it is on screen; its entrances play then. It resets only once it is fully off screen, so a reset is never seen. Coming back to a slide plays its entrance again.
- **Leaving:** as a slide scrolls away, its film drifts down at about half speed (parallax, `--q`), its copy rises and fades, and a dark shade grows over it (up to 72%), so the next slide seems to pass over it.

**Entrances (on activation)**

- *Films:* start at 124% scale and settle to 100% over 3s (`--io-strong`), while a dark veil lifts over 2.2s.
- *Text:* slides in 64px with a 12px blur clearing, 1.3s (`--io`). Meta rows come from the left, story copy from the right, everything else rises. Stagger: meta 0.2s, headline 0.35s, body 0.75s, specs 0.95 / 1.07 / 1.19s.
- *Headlines:* rise out of a mask (108% → 0), 1.6s (`--io-strong`).
- *Manifesto:* **OM sounds first, alone.** Its two letters drift together from either side (±0.16em) out of a soft blur and settle from 92% scale, 2.8s from 0.4s (`--io`), then a faint forest glow swells and fades like a hum (2.6s, `--io-soft`). After a held pause, the rest is **written in letter by letter** from 3.8s: each letter clears from blur and rises 0.22em, 1.5s each, 20ms apart. Two thin rings draw themselves behind it as OM sounds (4.6s from 0.4s, 5.4s from 1.1s), then breathe (scale 1 → 1.045, 9s, alternate, forever).
- *Offerings:* tiles open upward (clip-path, 1.7s, staggered 0.15s) while their photos settle from 132% to 104% (2.8s).
- *Story:* the photo opens left to right (clip-path, 2s), then drifts slowly (Ken Burns, 22s alternate).
- *Testimonial:* words appear one by one (70ms apart); a soft forest-green aura drifts behind (16s alternate).

**Hero intro (once, on load):** the umber veil lifts (2s); the film settles from 120% (4.2s); SALON rises into place (from 0.35s); **OM draws itself as a thin outline** (stroke, 2.4s from 0.7s), then fills in (1.5s from 2.3s); the header settles in (2.3s); the tagline, buttons and scroll cue rise (2.5 / 2.7 / 2.95s).

**Films**

- Encode: H.264 High, yuv420p, `+faststart`, no audio, keyframe every 2s. Slowed to 0.5× (elements) or 0.6× (camera moves) with motion-compensated interpolation to 30fps (`minterpolate … mi_mode=mci`). Hero 1920px wide; chapters 1440–1600px. About 4–7 MB each.
- Seamless loops: films with a camera move (Ground) play forward then back (palindrome); elemental films (water, fire, air, ether) and the rainforest loop with a 2.5–3s crossfade from their end into their start.
- Each film loads when its slide is within two screens, plays whenever its slide is on screen, and pauses off screen. The poster (first frame, WebP) shows underneath until it plays, then the film fades in (1.2s).
- Loading: streamed from its URL; if the host refuses it, or it hasn't started after 4.5s, it is fetched whole and played from memory. Hero and closing films share one download.
- A **pause-films button** in the header stops and restarts every film (accessibility: moving content can be paused).

**Soundscapes**

- Each element slide has its own soundscape; every other slide shares a soft background bed (ambient pads with a faint rainforest layer). All are in D so crossfades stay in harmony.
  - Ground: low cello drones with a quiet forest.
  - Flow: glassy pads and harp ripples over small waves.
  - Transform: warm swells over soft embers.
  - Breathe: airy flute pads over a breeze.
  - Unite: singing bowls and a humming choir.
- Sources: Google Lyria 3 Pro (music) and ElevenLabs sound effects (nature), on the client's Magnific account. Each soundscape is loudness-matched (about −22 LUFS), made into a seamless 90s loop with an equal-power crossfade, padded 0.5s each side and encoded as MP3 at 112 kbps (1.2 MB each).
- **Sound is off until the visitor turns it on** (browsers require a tap). There's a bars button in the header and a "Turn on sound" link under the hero line. A returning visitor who chose sound gets it back on their first tap or key.
- Playback uses Web Audio. Each track loops [0.5s, 90.5s] of its buffer. When the slide that fills most of the screen settles (350ms), its soundscape crossfades in over 3s on a sine ease-in-out while the previous one fades out. Master fades in over 2.5s and out over 1.2s, then the audio pauses. Sound fades out when the tab is hidden.
- Memory: only the bed, the current and the next soundscape stay decoded.

**Reduced motion** (`prefers-reduced-motion: reduce`): the same choreography, gentler. Films still loop (they can be paused from the header). Film scale-in drops to 106%, text slides 14px with a 4px blur, the leave parallax drops to a quarter, anchor scrolling is instant.

**Performance budget:** at most two films decoding (only during a transition). Posters under 100 KB. Page HTML/CSS/JS about 70 KB. Fonts: 7 woff2 files (~150 KB). Animations use transform, opacity, filter and clip-path only.

## Readability on film

- Ivory text always sits on a **scrim**: bottom gradient 88% → 58% (at 30%) → 14% (at 58%) → 0 (at 74%), a left gradient 42% → 0 over 56%, and a top gradient 48% → 0 for the header.
- Body text on film gets a soft text-shadow (0 1px 18px rgba(0,0,0,.35)).
- Check the **brightest frame** of every film (water sand, air curtains) before shipping: the copy area must stay at 4.5:1 or more.

## Not yet decided

- How the films should change once the client's beach reference arrives (the water chapter is the place).
- Final copy, services and prices. The Sanskrit element names need the client's approval.
