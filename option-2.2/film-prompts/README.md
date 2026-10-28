# Film prompts: Option 2.2

Video prompts for the films of Option 2.2, with the 3D blockout that sets the camera for the salon film. Prompts and renders only. The client's photos and reference images are kept privately and are never committed here.

## Files

| File | What it is |
| --- | --- |
| `01-salon-rooted-top-v9-CURRENT.md` | **The one to use.** The TOP film from the real basins photo (`@loc_basins`) plus the v9 Mixar previz (`@move`): the guest in the LEFT backwash chair, one slow pan left to right from the photo's own camera, so every frame is a part of the photo and the model has nothing to invent. |
| `01-salon-rooted-top-v9.1-5s.md`, `01-salon-rooted-top-v9.1-15s.md` | **The ones to use next.** v9 plus the three fixes from 5 s take 1: the right chair keeps its cushion, the posters' words unchanged, her feet on the left ottoman. Same previz. |
| `renders/take-v9-5s-1.mp4` | Dreamina take 1 of the 5 s test (28 Oct); what it got right and wrong is under WHAT CAME BACK in `01-salon-rooted-top-v9-5s.md`. |
| `01-salon-rooted-top-v9-5s.md` + `renders/salon-om-rooted-previz-v9-5s.mp4` | The 5-second TEST of v9 (J 28 Oct: test at 5 s before spending on 15 s). Same prompt, times only; same camera and same full 7.5 deg pan in 120 frames (`v9_build_render.py ... --full --frames 120`). |
| `01-salon-rooted-top-v8.md` | v8: the photo as a still edit, then a first/last-frame move. Replaced because J: no new picture, only the 3D camera at the photo's angle. |
| `01-salon-rooted-top-v7.md` | v7: Salon OM moment 01 "Rooted", the TOP film (the hair ritual at the backwash basin), driven by the Mixar camera move, with Maggie's notes from the 19 Oct stream: the stylist all in black, brown towels, a black smock, a right-handed stylist position, no back-of-house. Designer 1 masks it over the existing roots film (`../site/media/earth.mp4`). |
| `01b-salon-rooted-top-v6.md` | The version before v7. |
| `renders/salon-om-rooted-previz-v9-15s.mp4` | The v9 previz, 16:9, 15 s, 24 fps: the room at true scale as a grid set, seen from the photo's solved camera (30 mm full-frame, 0.47 m high, 5 deg up), a 42 mm window panning 7.5 deg left to right inside the photo, the guest whole in every frame. The green and red box is the guest. |
| `renders/v9-first-frame.png`, `v9-mid-frame.png`, `v9-last-frame.png`, `renders/v9-contact-1fps.jpg` | The previz frames 1, 180 and 360 and a 1 fps contact sheet. The match proofs drawn on the client's photo (the overlay of the set through the photo's camera, and every frame's window outlined on the photo) stay private, in `~/Downloads/salon-om-mixar/v9/`. |
| `02` to `05` | Earlier versions of the same prompt, kept to show what changed and why (each failure is described in the next version). |
| `06-inner-work-rooted-and-transform.md` | The two new Inner Work films: Rooted (feet on moss among roots) and Transform (a fern unfurling toward dawn light). |
| `renders/salon-om-side-orbit-v5-10s.mp4` | The 10 s camera move from Mixar: a slow arc around the guest's head, from three-quarter to side view. Grey blockout, for angle and motion only. |
| `renders/v5-first-frame.png`, `v5-last-frame.png` | The first and last frames of that move (the `@layout` reference). |
| `mixar/v9_photo_match.py`, `mixar/v9_build_render.py` | v9: the camera solved from the photo's vanishing lines and the set measured from it (method in the script header); `Mixar -b --factory-startup -P v9_build_render.py -- OUT --overlay --full`. |
| `mixar/*.py` (older) | The scripts that build the backwash area at real scale (metres) and the camera move. Run with Mixar or Blender: `Mixar -b --factory-startup -P salon_backwash.py -- --out DIR`, then `v2_side.py`, `v4_orbit.py`, `v5_bowl.py` on the saved `.blend`. GPL-3.0-or-later, because they import `bpy`. |

## Rules these prompts follow

- The room only ever shows the two walls we have photographed; nothing is invented behind the camera.
- The guest's head rests in the basin's neck cradle and never passes through the bowl (checked in Mixar: zero overlapping faces).
- The stylist's hands touch only the hair; her face is never in frame.
- Words follow `../writing.md` (no "therapy", "free call" or "home").
