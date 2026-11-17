# Walks in a person's own Safari (task b36dde1f, 17 Nov 2026)

WebDriver (safaridriver) cannot open a session in Safari 27 ("timed out while connecting to a Safari instance"), so these
drive the person's own Safari on their Mac, run from a StoryMind shell terminal there (`storymind pane new --harness shell --host mac --launch ...`).

- `clean-walk.py [m|g]`: the instrument that counts. No page JavaScript while the page lives; real wheel scrolls
  (peekaboo `scroll --foreground`); window frames 1.5 s and 6 s after each stop (`screencapture -l`); one read of every
  film's played ranges after the walk. Closes its window and gives focus back.
- `scripted-walk.js`: AppleScript `do JavaScript` walk with film clocks per step. CAUTION: on J's Mac every film moved in
  this walk while none moved in the clean one: a scripted action seems to count as the person's action and unlocks media.
  Use it for timing questions only, never as proof that films start by themselves.
- `lpm-film-test.html`: a `<video>` asked to play beside the same film in `<img src=…mp4>`, with a CSS control.

Found with them on J's MacBook (Safari 27.0): Low Power Mode is on (pmset powermode 1, battery and power adapter) and
Safari refuses every film's play() (NotAllowedError) until a click, tap or key; scrolling never counts.
