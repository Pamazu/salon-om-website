# Shoreline

A living sea, generated in real time: a top-down view of waves washing in and out over rippled sand, with foam lace, wet sand that dries as the water draws back, and small sun glints. Nothing is a photograph.

- **Provide:** nothing required. Optional `still` (render one frame), `time` (which moment of the wave to freeze, in seconds), `fallbackSrc` (an image used when WebGL is missing; `shore-still.webp` in Imagery), `label` (alt text).
- Give its container a size. Inside `Hero` or `ArchImage` it fills the arch.
- Each wave lasts 8.5–12 seconds and reaches a different height. The page pauses drawing when the sea scrolls out of view. Under `prefers-reduced-motion` it shows one calm still frame. In the Evening theme it dims slightly.
- It shares its wave clock with `WaveSound`, so the surf you hear rises as the water runs up the sand.
- **Draft:** the movement will be tuned to the client's reference beach image.
