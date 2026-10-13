# WaveSound

A control that plays a calm, restorative sea in the background: the surf is synthesised in the browser (Web Audio), with no audio file.

- **Provide:** optional `compact` (a round icon-only button, for a floating control), `onLabel`, `offLabel`, `stopOnUnmount`.
- **Never autoplay.** Browsers block sound until a visitor interacts, and an uninvited sound is unkind. The sea starts only when someone taps the control, fades in over about three seconds and fades out when turned off.
- Three layers: a soft distant surf, the rush of each wave up the sand, and the hiss of the backwash. They follow the same wave clock as `Shoreline`.
- All instances stay in sync. Put the full button in the hero and a `compact` one fixed at the bottom-right once the hero scrolls away, so the sound can always be turned off.
- The four bars swell while it plays. Under reduced motion they stay still.
