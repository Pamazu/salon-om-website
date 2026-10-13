import type * as React from 'react';
type Element = 'earth' | 'water' | 'fire' | 'air' | 'ether';
interface Link { label: string; href: string }
export interface LogoProps { variant?: 'stacked' | 'inline' | 'om'; width?: number; height?: number; draw?: boolean; title?: string; className?: string }
/** SALON above (stacked) or before (inline) a lean OM. `draw` plays the hero intro. */
export declare function Logo(props: LogoProps): React.ReactElement;
export interface ButtonProps { children?: React.ReactNode; href?: string; variant?: 'primary' | 'light' | 'ghost' | 'ink' | 'line'; size?: 'small'; arrow?: boolean; type?: 'button' | 'submit'; onClick?: () => void; className?: string }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface SiteHeaderProps { links: Link[]; cta?: Link; tone?: 'dark' | 'light'; logoHref?: string; onPauseChange?: (paused: boolean) => void; onMenu?: () => void; className?: string }
export declare function SiteHeader(props: SiteHeaderProps): React.ReactElement;
export interface SlideProps { children?: React.ReactNode; tone?: 'dark' | 'light'; video?: string; poster?: string; scrim?: string; active?: boolean; id?: string; label?: string; className?: string; style?: React.CSSProperties }
/** One full-screen slide: activates at 40% on screen, plays its entrances, loops its film. */
export declare function Slide(props: SlideProps): React.ReactElement;
export interface ManifestoProps { text: string; accents?: string[]; eyebrow?: string; label?: string; active?: boolean; id?: string }
export declare function Manifesto(props: ManifestoProps): React.ReactElement;
export interface ElementChapterProps { element: Element; index?: number; total?: number; name: string; sanskrit?: string; title: string; body: string; specs?: { label: string; value: string }[]; video?: string; poster?: string; id?: string; active?: boolean }
export declare function ElementChapter(props: ElementChapterProps): React.ReactElement;
export interface OfferTileProps { image: string; alt?: string; tag?: string; title: string; text?: string; primary?: Link; secondary?: Link; delay?: string }
export declare function OfferTile(props: OfferTileProps): React.ReactElement;
export interface QuoteProps { text: string; name?: string; note?: string; active?: boolean }
export declare function Quote(props: QuoteProps): React.ReactElement;
declare global { interface Window { SalonOM2: { Logo: typeof Logo; Button: typeof Button; SiteHeader: typeof SiteHeader; Slide: typeof Slide; Manifesto: typeof Manifesto; ElementChapter: typeof ElementChapter; OfferTile: typeof OfferTile; Quote: typeof Quote } } }
