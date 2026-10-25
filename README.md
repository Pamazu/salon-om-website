# Salon OM website

Homepage designs for Salon OM: Option 1 and four takes on Option 2 ("OM is everything."). Each one is a plain static site (HTML, CSS, JavaScript, films, photos and sound), so there is no build step to view it.

## Live

| Option | Live site | Code |
| --- | --- | --- |
| Option 1 | https://salon-om-option-1.web.app | [`option-1/site`](option-1/site) |
| Option 2 | https://salon-om-option-2.web.app | [`option-2/site`](option-2/site) |
| Option 2.2 | https://salon-om-2-2.web.app | [`option-2.2/site`](option-2.2/site) |
| Option 2.3 | https://salon-om-2-3.web.app | [`option-2.3/site`](option-2.3/site) |
| Option 2.4 | https://salon-om-2-4.web.app | [`option-2.4/site`](option-2.4/site) |

## The coach, in her own words

> My work as a Coach is deeply rooted in my own life experience, personal growth, and the challenges I have walked through and overcome. Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage. I know firsthand what it means to navigate difficult seasons and still choose growth, joy, peace, and purpose on the other side. Because of this, I guide others not only through education and training, but through lived understanding, deep empathy, and a genuine desire to help people create meaningful and lasting change in their lives.
>
> Helping others heal, grow, and transform is one of the greatest joys and purposes of my life. I am passionate about supporting people in breaking free from limiting beliefs, reconnecting with their inner wisdom, and discovering the strength and potential that already exists within them. My work is devoted to helping others not simply survive life’s challenges, but learn to thrive through them — creating lives that feel more aligned, empowered, fulfilling, and authentic. What continues to inspire me is witnessing the resilience of the human spirit and the profound transformation that becomes possible when people begin believing in themselves again.

## Inside every option: four memory files

Every option folder (`option-1`, `option-2`, `option-2.2`, `option-2.3`, `option-2.4`) holds the same four files. They are the project's persistent memory: whoever works on an option next (a designer, a developer or an AI assistant) reads them first, and updates them in the same session as any change, so nothing is lost between sessions.

| File | What it is for | Read it before… |
| --- | --- | --- |
| `shared.md` | **Facts and rules.** What we know about the business (Salon OM, the coach, Aveda, the team), the rules every page follows (brand name, logo, colour, never "home", real content only), the coach's own words kept verbatim, and the open questions still waiting on the client. | any work on the option |
| `design.md` | **Design and motion.** The direction, every design decision and why it was made, the slides or sections in order, colour, type and layout, and the **motion rules**: exactly how each part of the page animates (easing, timings, entrances, films, sound, reduced motion), checked against the live page. | changing how anything looks or moves |
| `specs.md` | **Status.** What is done, what is still a placeholder, what we need from the client, and what comes next. | planning the next step |
| `writing.md` | **How the words are written.** The voice, the words we use and avoid, the pattern and length of every kind of text on the page (with examples from the page), the rules for placeholders and facts, and a checklist before publishing. | writing or changing any copy |

Option 1 and Option 2 also carry the same four files inside their `design-system/` folder, as part of the design system copy.

## Resources

[`resources/`](resources) holds material from the client for use across the options:

- `coach-photo-beach.jpg`: a photo supplied on 13 Oct 2026 (960 × 1280).
- [`salon-photos/`](resources/salon-photos): seventeen real photos of the salon, supplied on 19 Oct 2026 (about 1280 × 854 or 854 × 1280). Portraits: `1-portrait-standing-product-wall`, `3-portrait-arms-crossed`, `5-portrait-seated-fireplace`, `13-portrait-outdoor-white-blazer`, `14-portrait-standing-shelves`, `16-portrait-team-member-mirror`; the team: `9-team-of-three`. The space: `2-lounge-fireplace`, `4-styling-chair-window`, `6-shampoo-basins` (use J's cleaned-up `6-shampoo-basins-edit.png`, his favourite, replaced 25 Oct 2026; the Rooted film's room reference), `7-aveda-product-shelves`, `8-glo-skincare-display`, `10-color-bar`, `11-styling-stations`, `12-shampoo-basins-backbar`, `15-aveda-plant-artwork`, `17-shampoo-basins-wide`. They replace the AI placeholder photos as each slide is updated.

## What else is in here

- `option-1/`: the first direction (embossed gold on warm paper): the hosted page (`site/`), the one-file offline homepage (`salon-om-homepage.html`), its design system and build scripts.
- `option-2/`: Option 2 with its design system (`design-system/`), original films (`media/raw/`) and build scripts (`source/`).
- `option-2.2/`, `option-2.3/`, `option-2.4/`: the three variations of Option 2, each with a ready-to-host `site/` and its four memory files.
- `option-2.x-shared/`: the engine, sources, shared photos, fonts and logos behind 2.2–2.4, and an overview of the three variations and their tweak panel (`README.md`).
- `option-2-SAVED/`: a frozen snapshot of Option 2 from 12 Oct 2026.

## Run it on your computer

Download the code (green **Code** button → **Download ZIP**), unzip it, and open any `site/index.html` in Chrome or Safari. Keep each `site` folder together: the page loads its films, fonts and photos from the folders next to it.

For 2.2, 2.3 and 2.4, browsers block the soundscapes and the saved tweaks on files opened by double-click. To hear the sound, use the live links above, or run `python3 -m http.server` inside the `site` folder and open http://localhost:8000.

## Publish to Firebase Hosting

Each `site/` folder has its own `firebase.json`. `deploy-all.sh` publishes all five sites to one Firebase project: `bash deploy-all.sh [project-id]` (default project: `salon-om-sites`).

Fonts: Cormorant Garamond, Instrument Sans and Jost, all under the SIL Open Font License.

## Checkpoints

| What | Git | Links |
| --- | --- | --- |
| Checkpoint, 19 Oct 2026 (frozen, never redeployed) | tag `checkpoint-2026-10-19` | https://salon-om-option-1.web.app · https://salon-om-option-2.web.app · https://salon-om-2-2.web.app · https://salon-om-2-3.web.app · https://salon-om-2-4.web.app |
| Development of 2.2 (new copy, Maggie's two practices) | branch `cro-copy-2-2` | https://salon-om-2-2-next.web.app |

Build 2.2 from the repo: `python3 option-2.x-shared/source/build.py 2.2` writes `option-2.2/site/index.html`; `python3 option-2.x-shared/source/build.py 2.2 2.3 2.4 --check` compares without writing (2.3 and 2.4 must stay identical to the checkpoint). Deploy from `option-2.2/site` (its `firebase.json` targets `salon-om-2-2-next` on this branch). Never deploy to the five checkpoint sites.
