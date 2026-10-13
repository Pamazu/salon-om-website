# Logos

Vector redraws of the Salon OM logo, made from the supplied mock-up. Every stroke is outlined into one filled path, so no fonts are needed. The mark is always the full lockup: ring, SALON, Om and its flourish. There is no monogram. Each file has one solid ink, named in the file name (an `<img>` can't inherit `color`; for a mark that follows text colour, use the `Logo` component).

**Master cut**, for 240px wide and up:
- `salon-om-logo-gold.svg`: gold #A8874F. The default on `surface`, `surface-raised` and `surface-sunken`.
- `salon-om-logo-ink.svg`: ink #2E2620, for one-colour print, stamps and documents.
- `salon-om-logo-ivory.svg`: ivory #F6F1EB, for dark grounds and the Evening theme.
- `salon-om-logo-foil.svg`: a gold-foil gradient. Decorative only, large sizes on ivory.

**Small cut**, under 240px (the header, footer and CTA band). Its hairlines are heavier and SALON is larger, so nothing is lost at small sizes:
- `salon-om-logo-small-gold.svg`, `salon-om-logo-small-ink.svg`, `salon-om-logo-small-ivory.svg`.

**Other:**
- `salon-om-favicon.svg`: the small cut in gold on an ivory rounded square, 512×512. The source for favicons and app icons.
- `salon-om-logo-original-mockup.jpg`: the supplied embossed mock-up, kept as the reference the vectors were drawn from. Don't use it on the site.

Both cuts share one frame (871×917), so they swap without shifting. Clear space is the height of the "m" on every side. Minimum size is 64px tall (small cut).
