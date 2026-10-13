# Salon OM — Option 2.2, 2.3 and 2.4 (variations)

Three variations that develop Option 2 towards the real business: **Salon OM, an Aveda concept salon**, with **coaching** as a sister service anyone can use. Option 2 itself is frozen in `option-2-SAVED/`.

All three share the Option 2 engine: full-screen slideshow, slow-motion looping films, soundscapes, ease-in-out motion, forest green accent and the SALON-above-OM logo. They differ in **story, structure and the look of the coaching world**. A **Salon | Coaching** switch (header on desktop, bottom of the screen on phones) moves you into the coaching world through a soft circular veil.

| | 2.2 "This is your space." | 2.3 "Everything stops." | 2.4 "Held. Seen. Cared for." |
| --- | --- | --- | --- |
| Hero | Rainforest film, OM draws itself, hook: "Leave held, seen and beautifully cared for." | The rainforest film slows to stillness as "Everything stops." writes in | "Held. Seen. Cared for." word by word |
| Second slide (pain or dream) | Pain: "When did someone last take care of you, without rushing you…" | A doorway opens around you ("The world can wait."), then "Think of the last time you had nowhere else to be." | Dream: "Imagine walking out lighter than you came in…" |
| The five element films | The five moments of a visit: Welcome, Release, Transform, Breathe, Glow | The visit hour by hour: 0:00 Arrive, 0:20 Breathe, 0:40 Let go, 1:15 Become, 2:45 Rise | The five rituals: Welcome, Scent, Release, Renew, Glow |
| Aveda | After the visit: "Beauty with a conscience, and a cult following." | Light slide: "Rituals people fall in love with." | Early, right after the hook: "There's a reason Aveda has a cult following." |
| People | "Held by Maggie." + [Name] | "Your space" (cry, laugh, or say nothing) + "Maggie holds the space." | Client voices (rotating) + "Your space, held by Maggie." |
| Hosts | A portrait beside a letter from Maggie, [Name] signed in below | Two arched doorways that open on Maggie and [Name] | Maggie full screen in window light, [Name] in a card below |
| Rituals | A quiet menu on deep green: one ritual opens at a time and the photo follows it | The visit measured on a three-hour line, bars filling as you arrive | The signature ritual large, two beside it, on clay |
| OM line | After the pain slide, dark | After "Remember", dark | After the Aveda slide, light |
| Coaching world | **Dawn**: light linen and sage, italic headlines, light veils over films | **Clay**: warm daylight, arch-framed photos, a split hero | **Night**: violet-umber, lavender accent, smoke and water, OM-first breath |

**Copy rules:** the elements stay in the films and the structure, not in the words. Never "home". Aveda facts come from aveda.com (mission "care for the world we live in", founded 1978 by Horst Rechelbacher, the name means "knowledge of the whole", 100% vegan formulas, first beauty company manufacturing with 100% wind power, B Corp, Leaping Bunny). Placeholders: the second person in the salon ([Name]), services, prices, testimonials.

## The tweak panel

The small round button at the bottom left opens **Tweak**. Changes preview instantly:

- **Text:** rewrite any line on the page.
- **Layout & spacing:** margins, the copy distance from the bottom, header height, hero logo size and position, the gap under the logo, tile gap, corner radius, button roundness and height.
- **Typography:** headline and chapter-word size, headline weight, body size and line height, label letter-spacing and size.
- **Colour:** accent, grounds, text and the five chapter accents.
- **Motion:** overall speed, film zoom on arrival, text slide distance and blur, leaving parallax, writing speed, slideshow snap or free scrolling.
- **Films & images:** film playback speed, brightness, saturation and the shade behind text. Each photo can be replaced (upload or link) and refocused, and each film replaced by link.
- **Sound:** volume and crossfade length.
- **Sections:** show or hide any slide.
- **Coaching world:** choose Dawn, Clay or Night.

**Saving:**

- On the Claude link, **Save for everyone** writes the settings (and any uploaded photos) into the page's own `tweaks.json`, so everyone who opens the link sees them.
- Anywhere else (the files on your Mac, Firebase), changes stay on that device; **Copy settings** gives you the settings to paste into `site/tweaks.json` or to send to Claude.
- **Reset all** goes back to the original.

## Sound

Sound is on by default. Browsers only allow a page to play sound after the first tap, click or key, so the soundscape begins then. The sound button (three bars, top right) mutes it; press again to bring it back. Each visitor's choice is remembered.

## Portraits

The portraits of Maggie and [Name] are AI placeholders, labelled on the page. Replace them in the tweak panel (Films & images) or swap the files `img/portrait-maggie.webp`, `img/portrait-maggie-window.webp` and `img/portrait-support.webp`.

## Folders

`option-2.2/site`, `option-2.3/site`, `option-2.4/site`: each is a complete website (page, films, sound, photos, fonts, logo). Double-clicking `index.html` shows the page and films; browsers block the soundscapes and `tweaks.json` on files opened that way, so for sound open it from Firebase, or run `python3 -m http.server` in the `site` folder and visit http://localhost:8000.

`option-2.x-shared/`: these notes, the sources (`source/`) and the shared photos, fonts and logos (`assets/`). The films and sound are the same files as `option-2-SAVED/site/media` and `sound`.

## Publishing on Firebase

One Firebase project (`salon-om-sites`) with four sites:

| Folder | Site | Address |
| --- | --- | --- |
| `option-2/site` | `salon-om-option-2` | https://salon-om-option-2.web.app |
| `option-2.2/site` | `salon-om-2-2` | https://salon-om-2-2.web.app |
| `option-2.3/site` | `salon-om-2-3` | https://salon-om-2-3.web.app |
| `option-2.4/site` | `salon-om-2-4` | https://salon-om-2-4.web.app |

From Terminal on this Mac: `cd ~/j-workspace/"Maggie website" && ./deploy-all.sh` (or pass another project id: `./deploy-all.sh my-project-id`). The script installs the Firebase CLI if needed, signs in, creates the project and sites if missing, and deploys all four. `DEPLOY-HANDOFF.md` has a ready-to-paste message for Claude Code in the terminal.

Firebase serves from a global CDN, so the sites are fast in the US and everywhere else. The free Spark plan allows 360 MB of transfer a day per project and one full visit with films is roughly 25 to 30 MB, so switch the project to Blaze (pay as you go, $0.15 per GB after the free 360 MB/day) before sharing widely.
