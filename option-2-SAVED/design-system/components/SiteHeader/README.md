# SiteHeader

The fixed, transparent header. It has no background of its own: its ink follows the slide beneath it (ivory over film and dark grounds, ink over clay), changing with an ease-in-out.

- **Provide:** `links` (label + href), `cta` (the Book pill), and `tone` (`dark` | `light`) from the slide currently under the header.
- Desktop: inline logo left, nav centre, pause-films button and Book pill right. Below 1024px the nav and Book move into the full-screen menu; the header shows the logo on the left and sound, pause and a three-line menu button on the far right (the lines ease into an X).
- The sound button (bars that breathe while playing; `sound`, `onSoundChange`) turns the soundscapes on and off. Sound is always off until the visitor turns it on.
- The pause button (`onPauseChange`) stops and restarts every film on the page. Keep it: moving content must be pausable.
- On the page it settles in at 2.3s, after the logo has drawn.
