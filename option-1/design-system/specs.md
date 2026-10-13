# Specs — features, sections and status

This is the build plan and progress log for the Salon OM website. Status is one of **Done**, **In progress**, **Pending** or **Blocked** (waiting on an answer in shared.md → Open questions). Update a row whenever work starts or finishes, and add new items at the bottom of the right table.

_Last updated: 12 Oct 2026, third session._

## Changelog

- **13 Oct 2026:** hosted at https://salon-om-option-1.web.app (`site/`, made from `homepage-artifact/` plus a mobile viewport tag). Added `writing.md` and the Motion rules in `design.md`.
- **12 Oct, session 3:** connected Magnific. Generated 14 placeholder photos (Nano Banana 2, 2K) and chose 7. Saved web copies to `Maggie website/images` and put them on the homepage: offering cards, affirmation tiles (with a new `photo-veil` token) and the About arch. Saved the single-file homepage and these notes to the Mac folder.
- **12 Oct, session 2:** dropped the monogram and added a small-size cut of the full logo. Built the tall white desktop header with the full logo. Set the colour proportions (MoodStrip, token notes, neutral CTA). Made all sections responsive (desktop / tablet / mobile container queries). Added `Section`, `Shoreline` (living generated sea) and `WaveSound` (generated surf, opt-in). Generated copyright-free textures. Built the homepage draft.
- **12 Oct, session 1:** reviewed both boards, vectorised the logo, created tokens, the brand book, 17 components and these memory files.

## Waiting on the client

| Item | Why it matters |
| --- | --- |
| **Beach reference image + notes on the waves' movement** | Tune `Shoreline` (wave speed and size, foam, colour, camera angle) and decide arch vs full-bleed hero |
| Answers in shared.md → Open questions | Services, prices, booking tool, email tool, address, coach name and portrait |

## Foundation

| Item | Status | Notes |
| --- | --- | --- |
| Review both Pinterest boards | Done | |
| Vectorise the logo | Done | Master + small cut, gold / ink / ivory / foil, favicon. **Monogram removed** (client feedback). Check against an original file if one exists |
| Design tokens | Done | Daylight + Evening. Colour notes carry page-share proportions |
| Colour proportions | Done | Neutrals 85% · Naturals 9% · Accents 6% (MoodStrip, README) |
| Responsive system | Done | Container queries: desktop ≥ 1024, tablet 640–1023, mobile < 640 |
| Brand book (README) | Done | |
| Memory files | Done | Kept current each session |
| Generated imagery | Done | Code textures (Imagery group) + 7 Magnific placeholder photos (`Maggie website/images`) |
| Real photography | Pending | Replace the placeholders, starting with the coach's portrait for About |
| Living sea + sound | In progress | v1 works. To tune against the client's beach reference |
| Choose platform / stack | Blocked | Decides how components are ported (React/Next.js directly, or rebuilt in Webflow/Squarespace/WordPress) |
| Favicon set (ICO/PNG sizes, apple-touch-icon) | Pending | Export from `salon-om-favicon.svg` (now the full mark, small cut) |
| Social share image (Open Graph 1200×630) | Pending | Logo on ivory beside the sea still |

## Components (20)

| Component | Status | Notes |
| --- | --- | --- |
| Logo | Done | Full mark only. `cut` master / small, picked from size |
| Button | Done | primary / outline / text / light |
| Section | Done | New. Tone, width, gutters, rhythm, container |
| SectionHeading | Done | Responsive sizes |
| SiteHeader | Done | White, tall, full logo centred, `compact` on scroll, tablet + mobile drawer |
| Hero | Done | Media slot (the living sea) + footnote. Responsive |
| ArchImage | Done | Accepts media children |
| Shoreline | In progress | Generated WebGL sea. Tune to the reference |
| WaveSound | Done | Generated surf, opt-in, synced instances, compact variant |
| OfferingCard | Done | Stacks / lies flat by its own width |
| Affirmation | Done | Neutral tones and textures. Mobile scroll-snap row |
| Testimonial | Done | Needs real quotes |
| AboutStory | Done | Responsive. Needs the coach's portrait |
| JourneySteps | Done | 4 / 2×2 / list. Step copy is a placeholder |
| MoodStrip | Done | Proportional bands + legend |
| CTABand | Done | Neutral by default (sand) |
| TextField | Done | |
| NewsletterForm | Done | **Pending:** wire `onSubmit` to the email tool |
| FAQ | Done | Needs real questions and answers |
| SiteFooter | Done | Responsive. Needs address, hours and social links |
| ContactForm | Pending | Built from TextField + Button. Needs a form endpoint |
| BookingEmbed | Blocked | Needs the booking tool |
| Gallery / texture grid | Pending | For a Salon page if salon services are confirmed |
| JournalCard + article layout | Pending | Only if a blog/journal is wanted |
| Theme toggle (Daylight / Evening) | Pending | Optional. Pages follow the system setting today |

## Pages

| Page | Sections | Status |
| --- | --- | --- |
| Home | Draft note · Header · Hero (living sea + sound) · Welcome · Offerings (3) · Affirmations row · About · Approach (journey) · Testimonial · CTA (book) · Letters · Footer · floating sound control | **Draft built**, with Magnific placeholder photos. Single-file copy in `Maggie website/salon-om-homepage.html`. Placeholders: services, prices, testimonial, photos, contact details. Sea to tune |
| Coaching | Hero · Who it's for · JourneySteps · Offerings · FAQ · Testimonial · CTABand | Pending |
| Salon | Hero · Services grid · MoodStrip (textures) · Gallery · CTABand | Blocked: are salon services offered? |
| About | Hero (portrait) · AboutStory (full bio) · Values / Affirmations · Credentials · CTABand | Pending: needs the portrait |
| Journal | Index + article template | Pending (optional) |
| Contact / Book | Hero · BookingEmbed · ContactForm · Location & hours · FAQ | Blocked: booking tool |
| Legal | Privacy policy, Terms, Cookie notice | Pending: client to supply the text |

## Functionality

| Feature | Status | Notes |
| --- | --- | --- |
| Responsive layout (360px → 1440px+) | Done | Homepage checked at 1440, 820 and 390 in both themes, with no horizontal scroll |
| Daylight / Evening theme | Done (system setting) | Page tokens follow `prefers-color-scheme` and `data-theme` |
| Sticky header compacting on scroll | Done | |
| Ambient sea sound | Done | Opt-in, fades in/out, synced to the visual waves |
| Reduced motion | Done | Still sea, no swelling bars, no transitions |
| Online booking | Blocked | Booking tool (TBC). The homepage CTA points to the letters list for now |
| Newsletter sign-up | Pending | Email tool (TBC). The preview says nothing was sent |
| Contact form with spam protection | Pending | |
| SEO: titles, meta, Open Graph, schema.org (LocalBusiness / ProfessionalService) | Pending | Needs address and services |
| Analytics (privacy-friendly) and cookie consent | Pending | |
| Accessibility audit (WCAG 2.2 AA) | Pending | Before launch |
| Performance | Partly | Images are small WebP (≤ 60 KB). The sea pauses off-screen. **Pending:** self-host fonts in production |

## Content needed from the client

Beach reference and wave notes; coach name and portrait; services, durations and prices; address, hours and service area; booking and email tools; approved testimonials; credentials; social links; photography; legal text; domain.
