# Design — Option 2.2, 2.3, 2.4

Builds on Option 2 (see `option-2-SAVED/design.md` for the full visual and motion system, which still applies). This file records what the variations add.

## Decisions

| # | Decision | Why |
| --- | --- | --- |
| V-1 | Funnel structure: hook (salon benefits) → pain or dream → five feature/benefit slides → Aveda → people → offer → bridge to coaching → call to action | Client: hook, tease, inform, then move people to act |
| V-2 | The element films stay but the copy speaks benefits, not elements | Client: "we don't have to be explicit about the elements" |
| V-3 | Two worlds in one page, Salon and Coaching, switched with a pill (header on desktop, docked at the bottom on phones). A circular veil in the target world's ground colour grows from the switch over 1.05s (`--io-strong`), the world changes beneath it, and the veil fades over 1.2s | Client: "a parallel world… similar style, not exactly the same" |
| V-4 | Coaching looks: **Dawn** (2.2, light linen and sage, italic headlines, light veils), **Clay** (2.3, warm daylight, arch frames), **Night** (2.4, violet-umber, lavender, smoke and water). Switchable in the tweak panel | Three directions to compare |
| V-5 | "Everything stops" (2.3): the hero film eases from 1× to stillness over 3.6s (sine ease-in-out) and pauses; the still frame keeps breathing (1 → 1.035, 14s) | Client: walking in feels transcendent, everything stops |
| V-6 | Walking in (2.3): the doorway photo slowly scales to 142% over 7s on arrival, as if you are stepping through | Same idea, continued |
| V-7 | New slide types: split (photo + copy, flip), facts (count-up numbers), team (portrait placeholders, never AI faces for Maggie), steps, bridge, doors, walk-in, rotating quotes, arch hero | Content needs |
| V-8 | Tweak panel on every variation; saving uses the artifact's own files (`tweaks.json` + `uploads/`), so the link stays shareable | Client: edit text, spacing, images and more ourselves |
| V-9 | OM in the manifesto stays upright (not italic) | Client |
| V-10 | Placeholder portraits of Maggie and her support person (Magnific, Nano Banana 2), always labelled "Placeholder portrait"; this replaces V-7's lettered placeholders until real photos arrive. Swap them in the tweak panel (Films & images) | Client asked for placeholder portraits |
| V-11 | Hosts and rituals differ per variation. 2.2: a portrait beside a letter from Maggie, and a quiet menu where one ritual opens at a time and the photo follows it (deep forest ground). 2.3: two arched doorways that open from the centre, and the visit measured on a three-hour line (bars fill 0 → length over 2.6s). 2.4: Maggie full screen in window light with her support person signed in below, and the signature ritual large with two beside it (clay ground) | Client: these two sections must not look the same across options |
| V-12 | The OM line ("OM is the first sound, the breath of everything…") sits after the pain or dream slide and before the five films in every variation, written in OM-first as in Option 2. Dark ground in 2.2 and 2.3 (it follows a light slide), light in 2.4 (it follows the dark Aveda slide). It names the elements by design: it is the brand's own words | Client: "that phrase is valuable" |
| V-13 | Sound is on by default in Option 2 and all variations. Browsers only allow sound after a first tap, click or key, so the soundscape starts on that first gesture (a first press on the sound button also starts it rather than muting). The button then mutes, and a second press unmutes; the choice is remembered per visitor. Muted, the three bars settle flat and a fine line crosses them | Client |

## New photography (Magnific, Nano Banana 2)

Eight placeholder photos: scalp ritual, styling, botanicals, colour, rest, coaching room, meadow, arrival. People are shown from behind or as hands where possible; none stands in for Maggie.
