# SiteHeader

The white site header (`surface-raised`). It is tall enough to carry the full logo with every detail, with links either side of the centred mark.

- **Provide:** `links` (`{label, href}[]`; the first half sits left of the logo, the rest right), `current` (active href), `cta` (`{label, href}`), `homeHref`, optional `extra` (a node placed before the button).
- **Desktop (≥ 1024px):** links split around a 128px-tall logo; the header is about 160px tall.
- **Tablet (640–1023px):** Book at left, logo (104px) centred, menu toggle at right. The menu opens a two-column link drawer.
- **Mobile (< 640px):** logo (84px) centred, menu at right. Book moves to a full-width button in the drawer.
- **Scroll:** make the header sticky in the page (`position: sticky; top: env(safe-area-inset-top, 0px)`) and set `compact` once the page scrolls (about 40px). The logo eases down a size and a soft shadow appears.
- `transparent` drops the white only over a full-bleed image hero. Keep the default elsewhere.
