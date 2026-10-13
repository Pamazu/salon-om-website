# Section

The band every page block sits in. It sets the background tone, the responsive gutters and vertical rhythm, the content width, and the container that the components measure themselves against.

- **Provide:** `children`, `tone` (`surface` default, `linen`, `raised`, `sand`), `width` (`content` 1160px, `text` 680px, `wide` 1440px, `bleed` edge to edge), optional `id`, `label` (an accessible name when there's no heading), `flush` (no vertical padding).
- Alternate `surface` and `linen` down the page. Use `sand` sparingly.
- Helpers inside a section: `.om-stack` (a vertical stack with `space-7` gaps) and `.om-grid.om-grid--3` (three columns, stacking below 1024px). Use `.om-row` (equal tiles that scroll sideways on mobile) inside a `bleed` section.
