# Shared — facts and rules

This is the project's persistent memory: facts we know and rules we follow. Read it before any work on the Salon OM website and update it when a fact is confirmed or a rule changes. Mark anything unconfirmed **(TBC)**.

## Rules (always apply)

1. **Brand name:** write **Salon OM** in text and code. The logo artwork reads "SALON Om". Never write "Salon Om", "SalonOM" (except the JS namespace `window.SalonOM`) or "OM Salon".
2. **Logo:** always the full mark (ring, SALON, Om, flourish), never a cropped "Om" monogram (the client rejected it on 12 Oct 2026 because it loses detail). Use the master cut at 240px+ and the small cut below. Use only the vector files in the Logos group. Never redraw, stretch, outline, shadow or recolour the mark outside `gold`, `ink` or `ivory`.
3. **Tokens only:** every colour, size, space, radius and shadow comes from `tokens.json` / `tokens.css`. Never hard-code a hex value in a page.
4. **Colour proportions:** neutrals (ivory, linen, sand, stone) are about 85% of every page. Sage and ink are about 9%. Gold, forest, ocean, clay and chestnut are accents only (about 6% together). Never fill a full-width section with a saturated colour.
5. **Contrast:** body text is `ink` or `ink-muted`, never `gold`. Text meets WCAG AA (4.5:1, or 3:1 at 24px+) in both the Daylight and Evening themes.
6. **Voice:** warm, honest, compassionate, first person for the coach. No hype, urgency, exclamation marks or emoji. No promises of cures or guaranteed outcomes.
7. **Real content only:** never publish invented testimonials, prices, credentials, addresses or hours. Placeholder copy in the component previews is marked as placeholder and must be replaced before launch.
8. **Accessibility:** semantic HTML, visible labels on every field, `focus-ring` on every focusable element, alt text on every meaningful image, and all motion disabled under `prefers-reduced-motion`.
9. **Responsive:** every section has a desktop (≥ 1024px), tablet (640–1023px) and mobile (< 640px) layout, driven by container queries. Test all three before calling a section done.
10. **Own imagery and sound only:** use only images and audio we generate ourselves (in code, or with Magnific on the client's account) or that the client owns or licenses. Never use Pinterest images or anything else from the web. AI photos are placeholders until real photography replaces them, and must never stand in for the coach. The sea sound never autoplays; it starts only from a visitor's tap.
11. **Memory files:** keep `shared.md` (facts and rules), `design.md` (design decisions) and `specs.md` (features and status) current. When work finishes or a decision is made, update the right file in the same session.
12. **Never use the word "home"** in brand copy ("come home", "at home", "feel at home", "home to yourself"). Home is not a welcoming place for everyone (client, 12 Oct 2026). This applies to both options.

## Facts

| Topic | Fact | Source |
| --- | --- | --- |
| Business | Salon OM: a coaching practice (and possibly salon services, **TBC**) devoted to healing, growth and transformation | Client brief |
| Project | Build the Salon OM website: the design system and components first, then the pages | Client brief, 12 Oct 2026 |
| Logo | Gold "Om" in a high-contrast serif with a calligraphic flourish, a broken ring and "SALON" in spaced sans caps along the ring, shown embossed on ivory paper | Supplied logo mock-up |
| Logo vectors | Redrawn as SVG from the mock-up: full lockup, monogram and favicon, in gold, ink, ivory and foil | Design system, Logos group |
| Fonts | Cormorant Garamond (serif) and Jost (sans), both SIL Open Font License, self-hosted woff2 | Chosen to match the logo |
| Mood board 1 | "Website design inspiration", 13 pins: earthy palette boards (sand, stone, sage, olive, moss, clay, chestnut, charcoal, petrol blue) and luxury-spa page layouts | https://pin.it/5Z4k01edd |
| Mood board 2 | "Website inspo", 56 pins (about 25 visible signed out): wood, sand and plaster textures, an "Organic Hair Salon" palette, water and light, lotus and Om imagery, affirmation tiles ("Feel it to heal it", "Soft & Strong", "grounded", "Wellness begins in stillness"), arched spa interiors, monogram logos, editorial wellness sites | https://pin.it/72zenNEJp |
| Homepage draft | Built 12 Oct 2026 as a private preview page: tall white header with the full logo, a living generated sea in the hero, optional sea sound, offerings, affirmations, About, approach, testimonial (sample), CTA, letters sign-up, footer | Homepage artifact "Salon OM" |
| Imagery | Generated in code (sand ripples, plaster with palm shadow, sage plaster, linen, travertine, the living sea). No photographs | Design system, Imagery group |
| Sound | The sea is synthesised in the browser (Web Audio), synced to the visual waves. No audio files | `WaveSound` component |
| Image generation | Magnific is connected (12 Oct 2026). Placeholder photos are made with Google Nano Banana 2 at 2K and kept in the Magnific project "Salon OM Website". The cloud workspace can't reach Magnific's image server, so images come through the in-app browser into the Mac folder below | Magnific |
| Project folder | `~/j-workspace/Maggie website` on the client's Mac: `images/` (web-ready photos), the single-file homepage, and copies of these memory files | Client, 12 Oct |
| Board owners | Both boards are curated by Maggie Woodward (pinterest.com/msbliss1). Rozetree Marketing collaborates on board 2 | Pinterest |

## The coach's own words (source text, keep verbatim)

> My work as a Coach is deeply rooted in my own life experience, personal growth, and the challenges I have walked through and overcome. Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage. I know firsthand what it means to navigate difficult seasons and still choose growth, joy, peace, and purpose on the other side. Because of this, I guide others not only through education and training, but through lived understanding, deep empathy, and a genuine desire to help people create meaningful and lasting change in their lives.
>
> Helping others heal, grow, and transform is one of the greatest joys and purposes of my life. I am passionate about supporting people in breaking free from limiting beliefs, reconnecting with their inner wisdom, and discovering the strength and potential that already exists within them. My work is devoted to helping others not simply survive life’s challenges, but learn to thrive through them — creating lives that feel more aligned, empowered, fulfilling, and authentic. What continues to inspire me is witnessing the resilience of the human spirit and the profound transformation that becomes possible when people begin believing in themselves again.

## Open questions (move to Facts once answered)

- What is the coach's name, and should it appear on the site? (The boards are curated by Maggie Woodward. Is that the coach?)
- Is Salon OM coaching only, or also hair or beauty salon services? Which services, durations and prices?
- Where is it: city, address, in person and/or online, opening hours?
- Which booking tool (Calendly, Acuity, Square, Fresha…) and which email tool for the newsletter?
- Website platform and stack (custom React / Next.js, Webflow, Squarespace, WordPress…)? Domain?
- Photography: is there a shoot planned, or a licensed stock library?
- Is there an original vector or high-resolution file of the logo to check the redraw against?
- **Beach reference (pending from the client):** a reference image of a beach plus notes on how the waves should move. The hero sea will be tuned to it, possibly moving to a full-bleed hero.
- Approved testimonials, credentials and certifications to show?
- Social links (Instagram, Pinterest, other)?
