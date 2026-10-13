# Design — Option 2.2 "This is your space."

The working design memory for Option 2.2: what the page is, how it is laid out and exactly how it moves. It builds on Option 2 ("OM is everything.", `option-2/design.md`) and shares its engine with 2.2, 2.3 and 2.4 (sources in `option-2.x-shared/source/`), but it is complete on its own. Update it in the same session as any design or motion change.

The four memory files work together: `shared.md` (facts and rules), `design.md` (design and motion), `specs.md` (what is done and what is pending) and `writing.md` (how the words are written).

_Motion checked against `site/index.html` on 13 Oct 2026._

## Direction

The visit told as five moments, with a letter from Maggie. It opens on a hook ("Leave held, seen and beautifully cared for."), asks the pain question, sounds the OM line, then walks through the five moments of a visit on the element films. Aveda comes after the visit, then the hosts, the rituals and client voices, and a bridge to coaching. Coaching world: **Dawn**, light linen and sage, italic headlines, light veils over the films.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| V-1 | Funnel structure: hook → pain or dream → five feature/benefit slides → Aveda → people → offer → bridge to coaching → call to action | Client: hook, tease, inform, then move people to act |
| V-2 | The element films stay but the copy speaks benefits, not elements | Client: "we don't have to be explicit about the elements" |
| V-3 | Two worlds in one page, Salon and Coaching, switched with a pill (header on desktop, docked at the bottom on phones), through a circular veil | Client: "a parallel world… similar style, not exactly the same" |
| V-4 | This variation's coaching look: **Dawn** (light linen and sage, italic headlines, light veils); the tweak panel can switch to the other two looks | Three directions to compare |
| V-8 | Tweak panel; saving uses the artifact's own files (`tweaks.json` + `uploads/`), so the link stays shareable | Client: edit text, spacing, images and more ourselves |
| V-9 | OM in the manifesto stays upright (not italic) | Client |
| V-10 | Placeholder portraits of Maggie and her support person, always labelled "Placeholder portrait", until real photos arrive. Swap them in the tweak panel (Films & images) | Client asked for placeholder portraits |
| V-11 | Hosts and rituals look different in each variation (see Slides) | Client: these two sections must not look the same across options |
| V-12 | The OM line ("OM is the first sound, the breath of everything…") sits after the pain or dream slide and before the five films, written OM-first as in Option 2. It names the elements by design: it is the brand's own words | Client: "that phrase is valuable" |
| V-13 | Sound is on by default; it starts on the first gesture, then the button mutes and unmutes, remembered per visitor | Client |

## Slides, in order

**Salon world:** 1 Hero: rainforest film, OM draws itself, the hook · 2 Pain question (clay) · 3 OM line (dark) · 4–8 The five moments on the element films: Welcome, Release, Transform, Breathe, Glow · 9 Aveda, with numbers that count up · 10 Hosts: a portrait beside a letter from Maggie, [Name] signed in below · 11 Rituals: a quiet menu on deep green, one ritual open at a time, the photo following it · 12 Client voices (rotating) · 13 Bridge to coaching ("Some things go deeper than hair.") · 14 Call to action ("Begin.") · 15 Letters and footer.

**Coaching world:** 1 Hero, written word by word ("Return to yourself.") · 2 OM line · 3 Steps on light ("Three gentle steps") · 4–6 Three films ("Lighter.", "Clear.", "Brave.") · 7 Story, photo on the right ("Rooted in lived experience.") · 8 Offerings · 9 Client voices · 10 Bridge back to the salon ("Let yourself be cared for.") · 11 Call to action · 12 Letters and footer.

## Look

Salon world: the Option 2 grounds (umber, bark, clay) with the forest-green accent; the rituals menu sits on deep forest green. Coaching world, **Dawn**: light linen and sage grounds, italic headlines, light veils over the films. Type, logo and readability rules are Option 2's: Cormorant Garamond (Light for display) with Instrument Sans for small text, the SALON-above-OM logo, text on film always on the defined scrim, one accent per screen.

## Motion rules

### The shared engine (the same in 2.2, 2.3 and 2.4, and as in Option 2)

**Principles.** Motion is breath, not decoration. **Every transition eases in and out** (no linear, no bounce, no ease-out-only snaps). Slow and continuous. One idea moves at a time. Everything readable is readable at rest.

| Token | Value | Use |
| --- | --- | --- |
| `--io` | `cubic-bezier(.65, 0, .35, 1)` | Text, UI, hovers, menu |
| `--io-soft` | `cubic-bezier(.37, 0, .63, 1)` | Ambient loops (breathing, aura, Ken Burns), colour changes |
| `--io-strong` | `cubic-bezier(.76, 0, .24, 1)` | Films and photos scaling in, masks, clip reveals |
| `--t-ui` | 0.6s | Hovers, header colour, underlines |
| `--t-text` | 1.3s | Text sliding in |
| `--t-title` | 1.6s | Masked headline rise |
| `--t-film` | 3s | Film settling from big to its normal scale |
| `--m-film` / `--m-slide` / `--m-blur` / `--m-par` | 1.24 / 64px / 12px / 1 | How far things move (smaller under reduced motion) |

**The slideshow.** The page snaps to each slide (one scroll gesture moves exactly one slide). A slide turns **active** when 40% of it is on screen and its entrances play; it resets only once it is fully off screen, so a reset is never seen, and coming back plays the entrance again. **Leaving:** the film drifts down at about half speed, the copy rises and fades, and a dark shade grows over it (up to 72%), so the next slide seems to pass over it.

**Entrances (on activation)**

- *Films and full-screen photos:* settle from 124% to 100% over 3s (`--io-strong`) while a dark veil lifts over 2.2s.
- *Text:* slides in 64px with a 12px blur clearing, 1.3s (`--io`). Meta rows come from the left, story copy from the right, everything else rises. Stagger: meta 0.2s, headline 0.35s, body 0.75s, specs 0.95 / 1.07 / 1.19s.
- *Headlines:* rise out of a mask (108% → 0), 1.6s (`--io-strong`).
- *Headlines written word by word* (`data-write="words"`): each word clears from blur and rises, 1.4s (`--io`); by default from 0.3s, 70ms apart (the heroes set their own pace, below).
- *The OM line:* OM sounds first, alone: its two letters drift together out of a soft blur (2.8s from 0.4s), a faint forest glow swells and fades like a hum, then the rest is written in letter by letter (each 1.5s, 20ms apart) while two thin rings draw themselves and then breathe (1 → 1.045, 9s, forever).
- *Offerings:* tiles open upward (clip-path, 1.7s, 0.15s apart) while their photos settle from 132% to 104% (2.8s).
- *Facts:* numbers count up from 0 over 1.8s (ease-in-out) when their slide arrives.
- *Rotating quotes:* the quote breathes into the next every 6.5s while its slide is on screen (opacity, blur and rise, 1.4s, `--io`).
- *Split slides:* the photo opens from its side (clip-path 2.2s `--io-strong`, sliding 64px, from 0.15s), then drifts slowly (Ken Burns, 22s, alternate).
- *Bridge slides:* the background photo settles to 102% over 3.2s (`--io-strong`).

**The world switch (Salon | Coaching).** The pill slides across (0.9s, `--io`). A circular veil in the target world's ground colour grows from the switch (clip-path 1.05s, `--io-strong`), the world changes beneath it, and the veil fades (1.2s, `--io-soft`). On phones the switch is docked at the bottom of the screen and fades and rises in (0.6s).

**Films.** Each loops on its own in slow motion (0.5–0.6× with interpolated frames), loads when its slide is within two screens, plays while on screen and pauses off screen. The poster shows underneath until it plays, then the film fades in (1.2s). A film that hasn't started after 4.5s is fetched whole. The pause-films button in the header stops and restarts every film.

**Sound.** On by default: the soundscape starts on the first tap, click or key (browsers allow nothing sooner). Each element film has its own soundscape over a shared background bed; when a slide settles (350ms) its soundscape crossfades in over 3s (sine ease-in-out). The sound button mutes and unmutes; muted, its three bars settle flat and a fine line crosses them (0.6s). The choice is remembered on the device.

**Reduced motion** (`prefers-reduced-motion: reduce`): the same choreography, gentler. Films scale in from 106%, text slides 14px with a 4px blur, the leave parallax drops to a quarter, anchor scrolling is instant. Films still loop and can be paused from the header.

**Performance.** At most two films decode at once (only during a transition). Animations use transform, opacity, filter and clip-path only.

### What only Option 2.2 does

- **Hero intro (once, on load):** the umber veil lifts (2s); the rainforest film settles from 120% (4.2s); SALON rises into place (from 0.35s); **OM draws itself as a thin outline** (2.4s from 0.7s), then fills in (1.5s from 2.3s); the header settles in (2.3s); the hook, buttons and scroll cue rise (2.5 / 2.7 / 2.95s).
- **Hosts (letter):** Maggie's portrait opens (clip-path 1.9s, `--io-strong`, from 0.15s) as the photo settles (3.2s).
- **Rituals menu:** the photo opens (clip-path 1.9s from 0.3s). Choosing a ritual draws its row's line (1.4s), moves its title and arrow (1s), opens its details (1.1s) and crossfades the photo (1.4s), which then drifts slowly (7s, `--io-soft`). The menu moves to the next ritual by itself every 7s while on screen, unless the visitor is using it.
- **Coaching hero:** "Return to yourself." is written word by word from 0.5s, 260ms apart.
- **Coaching story:** the split photo opens from the right (it is a flipped split), then drifts (Ken Burns).

## Not yet decided

- How the films should change once the client's beach reference arrives (the water film is the place).
- Final copy, services and prices; the second person's name and role; real portraits.
