# Salon OM website

Homepage designs for Salon OM: one first option and four takes on Option 2 ("OM is everything."). Plain static sites (HTML, CSS, JavaScript, films, photos, sound), no build step needed to view them.

## Live

| Option | Live site | Code |
| --- | --- | --- |
| Option 2 | https://salon-om-option-2.web.app | [`option-2/site`](option-2/site) |
| Option 2.2 | https://salon-om-2-2.web.app | [`option-2.2/site`](option-2.2/site) |
| Option 2.3 | https://salon-om-2-3.web.app | [`option-2.3/site`](option-2.3/site) |
| Option 2.4 | https://salon-om-2-4.web.app | [`option-2.4/site`](option-2.4/site) |

## Run it on your computer

Download the code (green **Code** button → **Download ZIP**), unzip it, and open any `site/index.html` in Chrome or Safari. Keep each `site` folder together: the page loads its films, fonts and photos from the folders next to it.

## What's in here

- `option-1/`: the first direction (embossed gold on warm paper) with its design system.
- `option-2/`: Option 2 with its design system (`design-system/`), original films (`media/raw/`) and build scripts (`source/`).
- `option-2.2/`, `option-2.3/`, `option-2.4/`: the three Option 2 variations, each a ready-to-host `site/`.
- `option-2.x-shared/`: the shared assets, raw images and build scripts behind 2.2–2.4.
- `option-2-SAVED/`: a saved snapshot of Option 2.
- Each option's `README.md`, `design.md`, `shared.md` and `specs.md` explain the design decisions, motion rules and status.

## Publish to Firebase Hosting

Each `site/` folder has its own `firebase.json`. `deploy-all.sh` publishes all four Option 2 sites to one Firebase project: `bash deploy-all.sh [project-id]`.

Fonts: Cormorant Garamond, Instrument Sans and Jost, all under the SIL Open Font License.
