# Film prompts: Option 2.2

Video prompts for the films of Option 2.2, with the 3D blockout that sets the camera for the salon film. Prompts and renders only. The client's photos and reference images are kept privately and are never committed here.

## Files

| File | What it is |
| --- | --- |
| `01-salon-rooted-top-v7-CURRENT.md` | **The one to use.** Salon OM moment 01 "Rooted", the TOP film (the hair ritual at the backwash basin), driven by the Mixar camera move, with Maggie's notes from the 19 Oct stream: the stylist all in black, brown towels, a black smock, a right-handed stylist position, no back-of-house. Designer 1 masks it over the existing roots film (`../site/media/earth.mp4`). |
| `01b-salon-rooted-top-v6.md` | The version before v7. |
| `02` to `05` | Earlier versions of the same prompt, kept to show what changed and why (each failure is described in the next version). |
| `06-inner-work-rooted-and-transform.md` | The two new Inner Work films: Rooted (feet on moss among roots) and Transform (a fern unfurling toward dawn light). |
| `renders/salon-om-side-orbit-v5-10s.mp4` | The 10 s camera move from Mixar: a slow arc around the guest's head, from three-quarter to side view. Grey blockout, for angle and motion only. |
| `renders/v5-first-frame.png`, `v5-last-frame.png` | The first and last frames of that move (the `@layout` reference). |
| `mixar/*.py` | The scripts that build the backwash area at real scale (metres) and the camera move. Run with Mixar or Blender: `Mixar -b --factory-startup -P salon_backwash.py -- --out DIR`, then `v2_side.py`, `v4_orbit.py`, `v5_bowl.py` on the saved `.blend`. GPL-3.0-or-later, because they import `bpy`. |

## Rules these prompts follow

- The room only ever shows the two walls we have photographed; nothing is invented behind the camera.
- The guest's head rests in the basin's neck cradle and never passes through the bowl (checked in Mixar: zero overlapping faces).
- The stylist's hands touch only the hair; her face is never in frame.
- Words follow `../writing.md` (no "therapy", "free call" or "home").
