# Slide

The building block of the page: one full screen (100svh, min 540px). The page snaps to each slide, one scroll per slide.

- **Provide:** `children`, `tone` (`dark` | `light`, used by the header), and optionally `video` + `poster` (a film background with a scrim), `scrim` (`ch__scrim` bottom-weighted for copy at the bottom; `cta__scrim` centred), `className` for the section style.
- **Becomes active** when 40% of it is on screen, then its entrances play: the film settles from 124% to 100% over 3s while a dark veil lifts; children with `a-up` / `a-left` / `a-right` / `a-fade` slide in with a clearing blur (delay via `--d`); `mask > mask__in` headlines rise out of a mask. It resets only once fully off screen.
- **Leaving:** the film drifts at half speed, copy inside `s__leave` rises and fades, and a shade darkens the slide (the page writes `--q`, 0 to 1).
- Films loop by themselves while on screen and pause off screen. `active` forces the state (previews).
