# Design — Option 2.4 "Held. Seen. Cared for."

The working design memory for Option 2.4: what the page is, how it is laid out and exactly how it moves. It builds on Option 2 ("OM is everything.", `option-2/design.md`) and shares its engine with 2.2, 2.3 and 2.4 (sources in `option-2.x-shared/source/`), but it is complete on its own. Update it in the same session as any design or motion change.

The four memory files work together: `shared.md` (facts and rules), `design.md` (design and motion), `specs.md` (what is done and what is pending) and `writing.md` (how the words are written).

_Motion checked against `site/index.html` on 13 Oct 2026._

## Direction

Leads with a dream and lets clients speak. "Held. Seen. Cared for." is written in word by word, then "Imagine walking out lighter…", Aveda early, the OM line on light, and the five rituals on the element films. Client voices rotate, Maggie appears full screen in window light, and the signature ritual is shown large with two beside it. Coaching world: **Night**, violet-umber with a lavender accent, smoke and water, OM-first breath.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| V-1 | Funnel structure: hook → pain or dream → five feature/benefit slides → Aveda → people → offer → bridge to coaching → call to action | Client: hook, tease, inform, then move people to act |
| V-2 | The element films stay but the copy speaks benefits, not elements | Client: "we don't have to be explicit about the elements" |
| V-3 | Two worlds in one page, Salon and Coaching, switched with a pill (header on desktop, docked at the bottom on phones), through a circular veil | Client: "a parallel world… similar style, not exactly the same" |
| V-4 | This variation's coaching look: **Night** (violet-umber, lavender, smoke and water); the tweak panel can switch to the other two looks | Three directions to compare |
| V-8 | Tweak panel; saving uses the artifact's own files (`tweaks.json` + `uploads/`), so the link stays shareable | Client: edit text, spacing, images and more ourselves |
| V-9 | OM in the manifesto stays upright (not italic) | Client |
| V-10 | Placeholder portraits of Maggie and her support person, always labelled "Placeholder portrait", until real photos arrive. Swap them in the tweak panel (Films & images) | Client asked for placeholder portraits |
| V-11 | Hosts and rituals look different in each variation (see Slides) | Client: these two sections must not look the same across options |
| V-12 | The OM line ("OM is the first sound, the breath of everything…") sits after the pain or dream slide and before the five films, written OM-first as in Option 2. It names the elements by design: it is the brand's own words | Client: "that phrase is valuable" |
| V-13 | Sound is on by default; it starts on the first gesture, then the button mutes and unmutes, remembered per visitor | Client |

## Slides, in order

**Salon world:** 1 Hero, written word by word ("Held. Seen. Cared for.") · 2 Dream: "Imagine walking out lighter than you came in…" · 3 Aveda, with numbers that count up ("There's a reason Aveda has a cult following.") · 4 OM line (light) · 5–9 The five rituals on the element films: Welcome, Scent, Release, Renew, Glow · 10 Client voices (rotating) · 11 Hosts: Maggie full screen in window light, [Name] in a card below ("Your space, held by Maggie.") · 12 Rituals: the signature ritual large, two beside it, on clay ("Choose your ritual") · 13 Bridge to coaching ("Some care goes deeper.") · 14 Call to action ("Be held.") · 15 Letters and footer.

**Coaching world:** 1 Hero, written word by word ("Inner work, held with care.") · 2 OM line · 3 Steps ("Gentle, honest, brave") · 4–6 Three films ("Lighter.", "Trust.", "Courage.") · 7 Story on dark ("Rooted in lived experience.") · 8 Offerings ("Ways to begin") · 9 Client voices · 10 Bridge back to the salon ("Ready to be cared for, head to toe?") · 11 Call to action ("Begin.") · 12 Letters and footer.

## Look

Salon world: the Option 2 grounds (umber, bark, clay) with the forest-green accent; the hosts slide is umber and the rituals slide clay. Coaching world, **Night**: violet-umber grounds, a lavender accent, smoke and water films. Type, logo and readability rules are Option 2's: Cormorant Garamond (Light for display) with Instrument Sans for small text, the SALON-above-OM logo, text on film always on the defined scrim, one accent per screen.

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

### What only Option 2.4 does

- **Hero, "Held. Seen. Cared for.":** written word by word from 1s, 380ms apart, so each of the three phrases lands on its own.
- **Client voices:** the quotes breathe from one to the next every 6.5s.
- **Hosts (Maggie full screen):** the portrait behaves like a film slide: it settles from 124% to 100% over 3s as the veil lifts.
- **Rituals (feature):** the tiles open upward with the offerings entrance (clip-path 1.7s, staggered), photos settling from 132% to 104%.
- **Coaching hero:** "Inner work, held with care." is written word by word from 0.5s, 200ms apart.
- **Coaching story:** the split photo opens from its side on a dark ground, then drifts (Ken Burns).

## Not yet decided

- How the films should change once the client's beach reference arrives (the water film is the place).
- Final copy, services and prices; the second person's name and role; real portraits.
