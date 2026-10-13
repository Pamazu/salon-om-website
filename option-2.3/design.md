# Design — Option 2.3 "Everything stops."

The working design memory for Option 2.3: what the page is, how it is laid out and exactly how it moves. It builds on Option 2 ("OM is everything.", `option-2/design.md`) and shares its engine with 2.2, 2.3 and 2.4 (sources in `option-2.x-shared/source/`), but it is complete on its own. Update it in the same session as any design or motion change.

The four memory files work together: `shared.md` (facts and rules), `design.md` (design and motion), `specs.md` (what is done and what is pending) and `writing.md` (how the words are written).

_Motion checked against `site/index.html` on 13 Oct 2026._

## Direction

Time slows down. The hero film eases to stillness as "Everything stops." is written in, a doorway opens around you ("The world can wait."), and the visit is told hour by hour on the element films. The hosts appear in two arched doorways and the rituals are measured on a three-hour line. Coaching world: **Clay**, warm daylight, arch-framed photos and a split hero.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| V-1 | Funnel structure: hook → pain or dream → five feature/benefit slides → Aveda → people → offer → bridge to coaching → call to action | Client: hook, tease, inform, then move people to act |
| V-2 | The element films stay but the copy speaks benefits, not elements | Client: "we don't have to be explicit about the elements" |
| V-3 | Two worlds in one page, Salon and Coaching, switched with a pill (header on desktop, docked at the bottom on phones), through a circular veil | Client: "a parallel world… similar style, not exactly the same" |
| V-4 | This variation's coaching look: **Clay** (warm daylight, arch frames, a split hero); the tweak panel can switch to the other two looks | Three directions to compare |
| V-5 | "Everything stops": the hero film eases from 1× to stillness over 3.6s and pauses; the still frame keeps breathing | Client: walking in feels transcendent, everything stops |
| V-6 | Walking in: the doorway photo slowly scales to 142% over 7s on arrival, as if you are stepping through | Same idea, continued |
| V-8 | Tweak panel; saving uses the artifact's own files (`tweaks.json` + `uploads/`), so the link stays shareable | Client: edit text, spacing, images and more ourselves |
| V-9 | OM in the manifesto stays upright (not italic) | Client |
| V-10 | Placeholder portraits of Maggie and her support person, always labelled "Placeholder portrait", until real photos arrive. Swap them in the tweak panel (Films & images) | Client asked for placeholder portraits |
| V-11 | Hosts and rituals look different in each variation (see Slides) | Client: these two sections must not look the same across options |
| V-12 | The OM line ("OM is the first sound, the breath of everything…") sits after the pain or dream slide and before the five films, written OM-first as in Option 2. It names the elements by design: it is the brand's own words | Client: "that phrase is valuable" |
| V-13 | Sound is on by default; it starts on the first gesture, then the button mutes and unmutes, remembered per visitor | Client |

## Slides, in order

**Salon world:** 1 Hero, written word by word ("Everything stops."), the film slowing to stillness · 2 Walk in: the doorway ("The world can wait.") · 3 Remember: "Think of the last time you had nowhere else to be." (clay) · 4 OM line (dark) · 5–9 The visit hour by hour on the element films: 0:00 Arrive, 0:20 Breathe, 0:40 Let go, 1:15 Become, 2:45 Rise · 10 Split: "Cry, laugh, or say nothing at all." · 11 Aveda on light, with numbers that count up ("Rituals people fall in love with.") · 12 Hosts: two arched doorways open on Maggie and [Name] · 13 Rituals on a three-hour line ("Choose your time") · 14 Two doors: "Be cared for." and "Begin again." · 15 Call to action ("Step in.") · 16 Letters and footer.

**Coaching world:** 1 Arch hero ("Begin again, gently.") · 2 OM line · 3 Steps on light ("Four quiet movements") · 4 Split ("A safe, quiet place to begin.") · 5 One film ("Lighter.") · 6 Story, photo on the right ("Rooted in lived experience.") · 7 Offerings ("Ways to begin") · 8 Call to action ("Begin.") · 9 Letters and footer.

## Look

Salon world: the Option 2 grounds (umber, bark, clay) with the forest-green accent; the Aveda slide is light. Coaching world, **Clay**: warm daylight grounds, photos framed in arches, a split hero. Type, logo and readability rules are Option 2's: Cormorant Garamond (Light for display) with Instrument Sans for small text, the SALON-above-OM logo, text on film always on the defined scrim, one accent per screen.

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

### What only Option 2.3 does

- **Hero, "Everything stops.":** the headline is written word by word from 1.2s, 420ms apart. At 2.2s the rainforest film slows from full speed to stillness over 3.6s (sine ease-in-out) and pauses; the still frame keeps breathing (scale 1 → 1.035, 14s, `--io-soft`, alternate). It plays again from the start each time the salon world opens.
- **Walk in:** the doorway photo slowly scales to 142% over 7s (`--io`) as the slide arrives, as if you are stepping through.
- **Split ("Cry, laugh…"):** the photo opens left to right, then drifts (Ken Burns).
- **Hosts (arches):** the two arches open (clip-path 2.3s, `--io-strong`) as their photos settle (3.4s), one after the other.
- **Rituals on a three-hour line:** the photo opens (clip-path 2.3s from 0.2s) and settles (3.4s); each ritual's bar fills from 0 to its length on the three-hour line (2.6s, `--io-strong`, staggered).
- **Two doors:** the door photos ease to 104% on arrival (3s, `--io-strong`); on hover they move again over 1.6s.
- **Coaching arch hero:** the arch opens (clip-path 2.4s, `--io-strong`, from 0.3s) as its photo settles (4s).

## Not yet decided

- How the films should change once the client's beach reference arrives (the water film is the place).
- Final copy, services and prices; the second person's name and role; real portraits.
