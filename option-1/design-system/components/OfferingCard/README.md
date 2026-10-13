# OfferingCard

One service or offering: image, meta line (type · duration), serif title, short description, price and a link. The card responds to its own column: it stacks in a narrow column and lies flat (image at left) when the column is 560px or wider.

- **Provide:** `title`, optional `meta`, `description`, `price`, `href`, `actionLabel`, `image`/`imageAlt` (or `tone`/`imageLabel` for a placeholder), `eager` (load the image straight away).
- Put cards in `.om-grid.om-grid--3` inside a `Section`. That gives three columns on desktop and one column below, where tablet cards lie flat and mobile cards stack.
- Descriptions are one or two sentences about how the person will feel. Write "Price on request" rather than leaving the price empty.
