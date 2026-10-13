import type * as React from 'react';

type Tone = 'sand' | 'sage' | 'stone' | 'linen' | 'clay' | 'chestnut' | 'forest' | 'ocean';
interface Link { label: string; href: string }

export interface LogoProps { cut?: 'master' | 'small'; tone?: 'gold' | 'ink' | 'ivory' | 'current'; size?: number; height?: number; title?: string; className?: string }
/** The full Salon OM mark as inline SVG. `size` = width in px (picks the small cut under 240), or size it with CSS and pass `cut`. */
export declare function Logo(props: LogoProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'outline' | 'text' | 'light'; size?: 'default' | 'small'; href?: string; children?: React.ReactNode }
/** Renders an <a> when `href` is given, else a <button>. */
export declare function Button(props: ButtonProps): React.ReactElement;

export interface SectionProps { children?: React.ReactNode; tone?: 'surface' | 'linen' | 'raised' | 'sand'; width?: 'content' | 'text' | 'wide' | 'bleed'; id?: string; label?: string; flush?: boolean; className?: string }
/** A page band: background tone, responsive gutters and rhythm, and the container the components measure. */
export declare function Section(props: SectionProps): React.ReactElement;

export interface SectionHeadingProps { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; align?: 'start' | 'center'; size?: 'default' | 'large'; ornament?: boolean; as?: 'h1' | 'h2' | 'h3'; className?: string }
export declare function SectionHeading(props: SectionHeadingProps): React.ReactElement;

export interface SiteHeaderProps { links: Link[]; current?: string; cta?: Link; compact?: boolean; transparent?: boolean; defaultOpen?: boolean; extra?: React.ReactNode; homeHref?: string; className?: string }
export declare function SiteHeader(props: SiteHeaderProps): React.ReactElement;

export interface HeroProps { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; primary?: Link; secondary?: Link; footnote?: React.ReactNode; media?: React.ReactNode; mediaCaption?: React.ReactNode; image?: string; imageAlt?: string; imageTone?: Tone; imageLabel?: string; className?: string }
export declare function Hero(props: HeroProps): React.ReactElement;

export interface ArchImageProps { src?: string; alt?: string; shape?: 'arch' | 'square'; ratio?: string; tone?: Tone; label?: string; caption?: React.ReactNode; eager?: boolean; children?: React.ReactNode; className?: string }
/** An image (or any media passed as children) with an arched top. Without either it renders a tinted placeholder slot labelled with `label`. */
export declare function ArchImage(props: ArchImageProps): React.ReactElement;

export interface ShorelineProps { still?: boolean; time?: number; fallbackSrc?: string; label?: string; className?: string }
/** A generated, living sea (WebGL) washing over sand. Fills its container. */
export declare function Shoreline(props: ShorelineProps): React.ReactElement;

export interface WaveSoundProps { compact?: boolean; onLabel?: string; offLabel?: string; stopOnUnmount?: boolean; className?: string }
/** Toggle for the synthesised sound of the sea. Never autoplays; all instances stay in sync. */
export declare function WaveSound(props: WaveSoundProps): React.ReactElement;

export interface OfferingCardProps { title: string; meta?: string; description?: string; price?: string; href?: string; actionLabel?: string; image?: string; imageAlt?: string; imageLabel?: string; tone?: Tone; eager?: boolean; className?: string }
export declare function OfferingCard(props: OfferingCardProps): React.ReactElement;

export interface AffirmationProps { text: string; attribution?: string; tone?: Tone | 'surface'; image?: string; className?: string }
export declare function Affirmation(props: AffirmationProps): React.ReactElement;

export interface TestimonialProps { quote: string; name: string; detail?: string; className?: string }
export declare function Testimonial(props: TestimonialProps): React.ReactElement;

export interface AboutStoryProps { eyebrow?: string; title: React.ReactNode; paragraphs: string[]; signature?: string; action?: Link; image?: string; imageAlt?: string; imageTone?: Tone; imageLabel?: string; reverse?: boolean; eager?: boolean; className?: string }
export declare function AboutStory(props: AboutStoryProps): React.ReactElement;

export interface JourneyStepsProps { steps: { title: string; text?: string }[]; className?: string }
export declare function JourneySteps(props: JourneyStepsProps): React.ReactElement;

export interface MoodBand { name: string; token?: string; weight?: number; tier?: 'Neutral' | 'Natural' | 'Accent'; image?: string }
export interface MoodStripProps { bands?: MoodBand[]; height?: number; legend?: boolean; labels?: boolean; className?: string }
export declare function MoodStrip(props: MoodStripProps): React.ReactElement;

export interface CTABandProps { eyebrow?: string; title: React.ReactNode; text?: React.ReactNode; action?: Link; extra?: React.ReactNode; tone?: 'sand' | 'linen' | 'forest'; logo?: boolean; className?: string }
export declare function CTABand(props: CTABandProps): React.ReactElement;

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; hint?: string; error?: string; multiline?: boolean }
export declare function TextField(props: TextFieldProps): React.ReactElement;

export interface NewsletterFormProps { eyebrow?: string; title?: string; text?: string; buttonLabel?: string; doneText?: string; fieldId?: string; onSubmit?: (email: string) => void | Promise<unknown>; className?: string }
export declare function NewsletterForm(props: NewsletterFormProps): React.ReactElement;

export interface FAQProps { items: { q: string; a: string }[]; openFirst?: boolean; className?: string }
export declare function FAQ(props: FAQProps): React.ReactElement;

export interface SiteFooterProps { tagline?: string; note?: string; year?: number; columns: { title: string; links: { label: string; href?: string }[] }[] }
export declare function SiteFooter(props: SiteFooterProps): React.ReactElement;

declare global {
  interface Window {
    SalonOM: { Logo: typeof Logo; Button: typeof Button; Section: typeof Section; Shoreline: typeof Shoreline; WaveSound: typeof WaveSound; SectionHeading: typeof SectionHeading; SiteHeader: typeof SiteHeader; Hero: typeof Hero; ArchImage: typeof ArchImage; OfferingCard: typeof OfferingCard; Affirmation: typeof Affirmation; Testimonial: typeof Testimonial; AboutStory: typeof AboutStory; JourneySteps: typeof JourneySteps; MoodStrip: typeof MoodStrip; CTABand: typeof CTABand; TextField: typeof TextField; NewsletterForm: typeof NewsletterForm; FAQ: typeof FAQ; SiteFooter: typeof SiteFooter };
  }
}
