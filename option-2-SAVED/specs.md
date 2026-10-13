# Specs — Option 2 features, sections and status

The build plan and progress log for **Option 2, "OM is everything."** Status is **Done**, **In progress**, **Pending** or **Blocked** (waiting on an answer in shared.md → Open questions).

_Last updated: 12 Oct 2026 (saved reference version)._

## Changelog

- **12 Oct, final (saved as the reference Option 2):**
  - **Soundscapes:** five element soundscapes plus a background bed, crossfading with the slides. Off until the visitor turns them on.
  - **Phone fixes:** the menu's Book button is a normal button again (it had inherited the big serif link style); the header icons sit at the far right; the hamburger has three lines and eases into an X; no sticky hover ring on touch.
  - **Story photo** now waits until it has loaded, then fades and slides in while it opens. Posters and photos load with the page, so reveals never play on an empty frame.
  - SALON is a little smaller and closer to OM.
  - Firebase Hosting config added (`site/firebase.json`, `.firebaserc`). The deploy has to run from the client's Mac because this workspace can't reach Firebase.
- **12 Oct, v2.1 (client comment):** OM now sounds first in the manifesto, on its own, with a slow ease-in-out breath and a held pause before the rest is written in.
- **12 Oct, v2 (client review):**
  - Rebuilt the homepage as a full-screen **slideshow** that snaps section to section, with entrances on arrival and a parallax/shade as each section leaves.
  - **Films now always loop on their own, in slow motion** (re-encoded at 0.5–0.6× with interpolated frames, seamless loops). Scroll scrubbing removed. Pause button added.
  - Found why the client saw no films or motion: the Mac has **Reduce Motion** on and v1 switched everything off for it. v2 keeps a gentler version of all motion instead.
  - New **rainforest hero** film. The driftwood film moved to **Ground**; the sand dunes are retired.
  - New logo: **SALON above OM**, leaner OM (Cormorant Garamond). Headings in Cormorant Garamond Light.
  - Accent changed from ember orange to **forest green**. Multi-colour strip, coloured dots, coloured rules and section separator lines removed everywhere.
  - Manifesto now **writes itself in**, letter by letter, with two rings drawing and breathing behind it.
  - Removed every use of the word "home" ("Come home." is now "Begin."; "At home" is now "Whole"; the hero line was rewritten).
- **12 Oct, v1:** saved Option 1 to `Maggie website/option-1/`. Started Option 2: OM logo, element palette, type, 6 films in Magnific, scroll-scrubbed homepage, this design system and the memory files.

## Foundation

| Item | Status | Notes |
| --- | --- | --- |
| Option 1 saved | Done | Folder `option-1/`; artifacts titled "Option 1" |
| Logo v2 | Done | Stacked (SALON above OM), inline (SALON │ OM), OM only; ivory / umber / forest |
| Tokens v2 | Done | Grounds, forest accent, chapter accents, Cormorant + Instrument Sans, motion tokens |
| Motion rules v2 | Done | design.md → Motion rules |
| Films v2 | Done | Rainforest hero, Ground (driftwood), water, fire, air, ether. Slow-motion seamless loops, H.264, ~4–7 MB each, WebP posters |
| Favicon | Done | OM in forest (SVG) |
| Soundscapes | Done | 6 seamless 90s loops (Lyria 3 Pro + ElevenLabs layers), Web Audio crossfades |
| Beach reference | Blocked | Waiting for the client's reference and notes. Then regenerate the water film to match |

## Homepage slides

| # | Slide | Status | Notes |
| --- | --- | --- | --- |
| 1 | Hero: rainforest film, SALON + drawn OM, tagline, CTAs | Done | Intro sequence once on load |
| 2 | Manifesto (written in) | Done | Copy to approve |
| 3–7 | Earth "Ground.", Water "Flow.", Fire "Transform.", Air "Breathe.", Ether "Unite." | Done | Copy, Sanskrit names and specs to approve |
| 8 | Offerings: 3 tiles (carousel below 1024px) | Done | Services and prices are placeholders |
| 9 | Story: framed photo + copy | Done | Placeholder photo until the coach's portrait arrives |
| 10 | Testimonial | Done | Sample, to replace |
| 11 | Closing film "Begin." | Done | |
| 12 | Letters + footer | Done (UI) | **Pending:** connect to an email tool. Address, hours, socials TBC |
| — | Header (tone follows slide), menu, chapter rail, pause-films | Done | |

## Quality checks

| Check | Status | Notes |
| --- | --- | --- |
| Desktop 1440 / tablet 820 / phone 390 | Done | No horizontal scroll; every slide checked at rest and mid-transition |
| Films play and loop | Done | Verified headless (all six playing). Client check in their browser pending |
| Contrast on film | Done | Strong bottom scrim; water and air (brightest) checked |
| Reduced motion | Done | Gentler choreography; films keep looping with a pause control |
| Lighthouse / performance pass | Pending | Before launch. Consider AV1/WebM alternates for smaller films |

## Next

1. Option 2 is saved as `option-2-SAVED/`. New work continues as variations 2.2, 2.3 and 2.4: Aveda concept salon copy, a coaching "parallel world" and the team.
2. Deploy to Firebase from the client's Mac (command in the README).
3. Beach reference → refine the water film.
