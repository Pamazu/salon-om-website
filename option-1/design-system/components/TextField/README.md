# TextField

A labelled text input or textarea with an optional hint and error.

- **Provide:** `label`, optional `hint`, `error`, `multiline`, `required`, plus any input attributes (`type`, `name`, `autoComplete`, `value`/`onChange`).
- Labels sit above the field, always visible. Never use placeholder-only labels.
- Error messages say how to fix the problem, kindly ("Please enter an email address like name@example.com."). An error sets a 2px `danger` border plus the written message.
