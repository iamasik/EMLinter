/**
 * Pixel Converter — single source of truth for all conversion pages.
 *
 * One config entry per conversion drives BOTH the crawlable server-side meta
 * (in `pages/solutions/pixel-converter/[slug].astro`) AND the client-side
 * converter UI (`PixelConverterPage.tsx`). This mirrors the detail-route
 * pattern used elsewhere, but the data is static so there is no Firebase call.
 *
 * Two UI modes:
 *  - 'numeric': a value input (+ optional base/viewport/dpi field) → live output
 *               plus a reference conversion table.
 *  - 'paper'  : a paper-size dropdown (+ dpi field) → width × height in pixels,
 *               plus a full table of every size in the series.
 */

export const CONVERTER_BASE_PATH = '/solutions/pixel-converter';

/** Default parent/root font-size used for em & rem math. */
export const DEFAULT_FONT_SIZE = 16;
/** Default viewport height (px) used for vh math — 1080p is the common baseline. */
export const DEFAULT_VIEWPORT_HEIGHT = 1080;
/** Default resolution used for physical-unit math (CSS reference pixel = 96 DPI). */
export const DEFAULT_DPI = 96;

export type ConverterMode = 'numeric' | 'paper';
/** Which secondary input (if any) a numeric converter exposes. */
export type SecondaryField = 'base' | 'viewport' | 'dpi' | null;
export type PaperSeries = 'A' | 'B' | 'C' | 'US';

export interface Faq {
    question: string;
    answer: string;
}

export interface NumericConverterConfig {
    mode: 'numeric';
    /** Extra input beside the main value, or null when the conversion is unit-only. */
    secondary: SecondaryField;
    /** Unit label of the value the user types in. */
    inputUnit: string;
    /** Unit label of the computed result. */
    outputUnit: string;
    /** value + secondary → result. `secondary` is the resolved secondary value (font size / viewport / dpi). */
    compute: (value: number, secondary: number) => number;
    /** Input values used to build the reference table. */
    tableValues: number[];
}

export interface PaperConverterConfig {
    mode: 'paper';
    series: PaperSeries;
}

export interface ConverterConfig {
    slug: string;
    /** Grouping shown on the hub, e.g. 'EM', 'REM', 'INCH'. */
    category: string;
    /** Short colored tone key for hub cards (Tailwind classes). */
    tone: string;
    /** Card / link label, e.g. 'px to em'. */
    label: string;
    // ---- SEO ----
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    // ---- On-page copy ----
    h1: string;
    subtitle: string;
    /** Human-readable formula shown in a highlighted callout. */
    formula: string;
    /** Long-form SEO prose paragraphs. */
    intro: string[];
    faqs: Faq[];
    // ---- Behavior ----
    numeric?: NumericConverterConfig;
    paper?: PaperConverterConfig;
}

/* ------------------------------------------------------------------ *
 * Physical-unit math helpers (all relative to the CSS reference px).
 * 1in = 96px, 1in = 25.4mm = 2.54cm, 1pt = 1/72in.
 * ------------------------------------------------------------------ */
const CM_PER_IN = 2.54;
const MM_PER_IN = 25.4;
const PT_PER_IN = 72;

/** Round to at most `dp` decimals, trimming trailing zeros. */
export function fmt(n: number, dp = 4): string {
    if (!isFinite(n)) return '0';
    const rounded = Math.round(n * 10 ** dp) / 10 ** dp;
    return String(rounded);
}

/* ------------------------------------------------------------------ *
 * Paper sizes. A/B/C series are defined in millimetres; US sizes in
 * inches. Everything converts to px through the DPI the user picks.
 * ------------------------------------------------------------------ */
export interface PaperSize {
    name: string;
    /** Width, in the series' native unit (mm for A/B/C, in for US). */
    w: number;
    h: number;
}

export const PAPER_UNIT: Record<PaperSeries, 'mm' | 'in'> = {
    A: 'mm',
    B: 'mm',
    C: 'mm',
    US: 'in',
};

export const PAPER_SIZES: Record<PaperSeries, PaperSize[]> = {
    A: [
        { name: 'A0', w: 841, h: 1189 },
        { name: 'A1', w: 594, h: 841 },
        { name: 'A2', w: 420, h: 594 },
        { name: 'A3', w: 297, h: 420 },
        { name: 'A4', w: 210, h: 297 },
        { name: 'A5', w: 148, h: 210 },
        { name: 'A6', w: 105, h: 148 },
        { name: 'A7', w: 74, h: 105 },
        { name: 'A8', w: 52, h: 74 },
        { name: 'A9', w: 37, h: 52 },
        { name: 'A10', w: 26, h: 37 },
    ],
    B: [
        { name: 'B0', w: 1000, h: 1414 },
        { name: 'B1', w: 707, h: 1000 },
        { name: 'B2', w: 500, h: 707 },
        { name: 'B3', w: 353, h: 500 },
        { name: 'B4', w: 250, h: 353 },
        { name: 'B5', w: 176, h: 250 },
        { name: 'B6', w: 125, h: 176 },
        { name: 'B7', w: 88, h: 125 },
        { name: 'B8', w: 62, h: 88 },
        { name: 'B9', w: 44, h: 62 },
        { name: 'B10', w: 31, h: 44 },
    ],
    C: [
        { name: 'C0', w: 917, h: 1297 },
        { name: 'C1', w: 648, h: 917 },
        { name: 'C2', w: 458, h: 648 },
        { name: 'C3', w: 324, h: 458 },
        { name: 'C4', w: 229, h: 324 },
        { name: 'C5', w: 162, h: 229 },
        { name: 'C6', w: 114, h: 162 },
        { name: 'C7', w: 81, h: 114 },
        { name: 'C8', w: 57, h: 81 },
        { name: 'C9', w: 40, h: 57 },
        { name: 'C10', w: 28, h: 40 },
    ],
    US: [
        { name: 'Letter', w: 8.5, h: 11 },
        { name: 'Legal', w: 8.5, h: 14 },
        { name: 'Tabloid', w: 11, h: 17 },
        { name: 'Ledger', w: 17, h: 11 },
        { name: 'Junior Legal', w: 5, h: 8 },
        { name: 'Half Letter', w: 5.5, h: 8.5 },
        { name: 'Government Letter', w: 8, h: 10.5 },
        { name: 'Government Legal', w: 8.5, h: 13 },
        { name: 'ANSI A', w: 8.5, h: 11 },
        { name: 'ANSI B', w: 11, h: 17 },
        { name: 'ANSI C', w: 17, h: 22 },
        { name: 'ANSI D', w: 22, h: 34 },
        { name: 'ANSI E', w: 34, h: 44 },
    ],
};

/** Convert one paper dimension (in its native unit) to pixels at the given DPI. */
export function paperDimToPx(nativeValue: number, series: PaperSeries, dpi: number): number {
    if (PAPER_UNIT[series] === 'in') return nativeValue * dpi;
    // mm → in → px
    return (nativeValue / MM_PER_IN) * dpi;
}

/* ------------------------------------------------------------------ *
 * The 18 converters.
 * ------------------------------------------------------------------ */
const TONE = {
    em: 'from-orange-500/20 to-orange-500/5 text-orange-300 ring-orange-400/20',
    rem: 'from-rose-500/20 to-rose-500/5 text-rose-300 ring-rose-400/20',
    pt: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-400/20',
    vh: 'from-teal-500/20 to-teal-500/5 text-teal-300 ring-teal-400/20',
    inch: 'from-amber-500/20 to-amber-500/5 text-amber-300 ring-amber-400/20',
    cm: 'from-sky-500/20 to-sky-500/5 text-sky-300 ring-sky-400/20',
    mm: 'from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300 ring-fuchsia-400/20',
    paper: 'from-green-500/20 to-green-500/5 text-green-300 ring-green-400/20',
};

const PX_STEPS = [1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96, 128];
const UNIT_STEPS_SMALL = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

export const CONVERTERS: ConverterConfig[] = [
    /* ------------------------------- EM ------------------------------- */
    {
        slug: 'px-to-em',
        category: 'EM',
        tone: TONE.em,
        label: 'px to em',
        metaTitle: 'PX to EM Converter — Pixels to em | EMLinter',
        metaDescription:
            'Free PX to EM converter for CSS. Enter a pixel value and a base font-size to get the exact em value instantly, with a full px-to-em reference table.',
        keywords: 'px to em, pixels to em, px to em converter, convert px to em, css px to em',
        h1: 'PX to EM Converter',
        subtitle: 'Convert pixels to em based on a parent font-size. em is a font-relative CSS unit, so the result scales with whatever base size you set.',
        formula: 'em = px ÷ base font-size (default 16px)',
        intro: [
            'The em is a font-relative CSS unit: 1em equals the font-size of the element’s parent. Because it is relative rather than absolute, em lets you build layouts that scale with the user’s text size — a core requirement for accessible, responsive email and web design.',
            'To convert px to em you divide the pixel value by the base font-size. With the browser default of 16px, 16px becomes 1em, 24px becomes 1.5em, and 8px becomes 0.5em. Change the base to match the font-size on the element you are styling and the em output updates live.',
            'Use this px to em converter when you are migrating a fixed pixel design to a fluid, accessible one, or when a design system mandates em-based spacing and typography.',
        ],
        faqs: [
            { question: 'How do I convert px to em?', answer: 'Divide the pixel value by the base font-size. At the default 16px base, em = px / 16 — so 16px = 1em and 32px = 2em. Set the base field to the font-size of the element you are styling for an exact result.' },
            { question: 'What is the default base font-size?', answer: 'Browsers default the root font-size to 16px, so this converter uses 16px as the base unless you change it. If the parent element sets a different font-size, enter that value in the Base field.' },
            { question: 'What is the difference between px and em?', answer: 'A pixel (px) is an absolute unit — it is always the same size. An em is relative to its parent element’s font-size, so it scales when the surrounding text scales. em is preferred for accessible, responsive layouts.' },
            { question: 'Should I use em or rem?', answer: 'Use rem when you want sizing relative to the single root font-size (predictable, no compounding). Use em when you want sizing relative to the local element’s font-size, which is useful for component-scoped spacing.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'base',
            inputUnit: 'px',
            outputUnit: 'em',
            compute: (px, base) => px / base,
            tableValues: PX_STEPS,
        },
    },
    {
        slug: 'em-to-px',
        category: 'EM',
        tone: TONE.em,
        label: 'em to px',
        metaTitle: 'EM to PX Converter — em to Pixels | EMLinter',
        metaDescription:
            'Free EM to PX converter for CSS. Enter an em value and a base font-size to get the exact pixel value instantly, with a full em-to-px reference table.',
        keywords: 'em to px, em to pixels, em to px converter, convert em to px, css em to px',
        h1: 'EM to PX Converter',
        subtitle: 'Convert em to pixels using a base font-size. Multiply the em value by the base to get an absolute pixel value.',
        formula: 'px = em × base font-size (default 16px)',
        intro: [
            'em is a font-relative unit — 1em equals the font-size of the parent element. Converting em to px turns that relative value into an absolute pixel measurement, which is handy when a tool, spec, or email client needs a fixed size.',
            'The math is a multiplication: px = em × base font-size. At the 16px default, 1em is 16px, 1.5em is 24px, and 0.5em is 8px. Adjust the base to the element’s actual font-size for an exact conversion.',
            'This em to px converter is useful when auditing a design, translating an em-based spec into fixed values for an email (where relative units are less reliable), or debugging why an em value renders at an unexpected size.',
        ],
        faqs: [
            { question: 'How do I convert em to px?', answer: 'Multiply the em value by the base font-size. At the default 16px base, px = em × 16 — so 1em = 16px and 2em = 32px.' },
            { question: 'Why convert em back to pixels?', answer: 'Absolute pixel values are easier to reason about when debugging, and some contexts — notably HTML email — render relative units inconsistently. Converting to px gives you a fixed, portable size.' },
            { question: 'Does the base font-size matter?', answer: 'Yes. em is relative to the parent element’s font-size, so the pixel result depends entirely on the base. Enter the font-size that applies to your element to get an accurate value.' },
            { question: 'Is 1em always 16px?', answer: 'Only when the applicable font-size is 16px (the browser default). If a parent sets font-size to 20px, then 1em = 20px. Set the Base field accordingly.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'base',
            inputUnit: 'em',
            outputUnit: 'px',
            compute: (em, base) => em * base,
            tableValues: UNIT_STEPS_SMALL,
        },
    },
    /* ------------------------------- REM ------------------------------ */
    {
        slug: 'px-to-rem',
        category: 'REM',
        tone: TONE.rem,
        label: 'px to rem',
        metaTitle: 'PX to REM Converter — Pixels to rem | EMLinter',
        metaDescription:
            'Free PX to REM converter for CSS. Enter a pixel value and root font-size to get the exact rem value instantly, with a full px-to-rem reference table.',
        keywords: 'px to rem, pixels to rem, px to rem converter, convert px to rem, css px to rem',
        h1: 'PX to REM Converter',
        subtitle: 'Convert pixels to rem based on the root font-size. rem is relative to the <html> element, so it stays consistent across your whole document.',
        formula: 'rem = px ÷ root font-size (default 16px)',
        intro: [
            'The rem (root em) is relative to the font-size of the root <html> element rather than the immediate parent. That single reference point makes rem predictable: there is no compounding as you nest elements, unlike em.',
            'Convert px to rem by dividing the pixel value by the root font-size. At the 16px default, 16px is 1rem, 24px is 1.5rem, and 8px is 0.5rem. If your design system sets the root to a different size, update the base field.',
            'rem is the go-to unit for accessible typography and spacing scales because a single root font-size change resizes the entire UI proportionally.',
        ],
        faqs: [
            { question: 'How do I convert px to rem?', answer: 'Divide the pixel value by the root font-size. At the default 16px root, rem = px / 16 — so 16px = 1rem and 32px = 2rem.' },
            { question: 'What is the difference between rem and em?', answer: 'rem is always relative to the root <html> font-size, so it never compounds. em is relative to the nearest parent’s font-size, so nested ems multiply. rem is more predictable for global scales.' },
            { question: 'What root font-size should I use?', answer: 'The browser default is 16px, which this tool uses unless you change it. If your CSS sets html { font-size: ... }, enter that value as the base.' },
            { question: 'Why use rem instead of px?', answer: 'rem respects the user’s browser font-size preference, making layouts more accessible. Changing one root value rescales the whole interface proportionally.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'base',
            inputUnit: 'px',
            outputUnit: 'rem',
            compute: (px, base) => px / base,
            tableValues: PX_STEPS,
        },
    },
    {
        slug: 'rem-to-px',
        category: 'REM',
        tone: TONE.rem,
        label: 'rem to px',
        metaTitle: 'REM to PX Converter — rem to Pixels | EMLinter',
        metaDescription:
            'Free REM to PX converter for CSS. Enter a rem value and root font-size to get the exact pixel value instantly, with a full rem-to-px reference table.',
        keywords: 'rem to px, rem to pixels, rem to px converter, convert rem to px, css rem to px',
        h1: 'REM to PX Converter',
        subtitle: 'Convert rem to pixels using the root font-size. Multiply the rem value by the root size to get an absolute pixel value.',
        formula: 'px = rem × root font-size (default 16px)',
        intro: [
            'rem is relative to the root <html> font-size. Converting rem to px resolves that relative value into a fixed pixel measurement — useful for specs, debugging, and contexts that need absolute sizes.',
            'The formula is px = rem × root font-size. At the 16px default, 1rem is 16px, 1.5rem is 24px, and 0.5rem is 8px. Change the base to match your document’s root font-size.',
            'Reach for this rem to px converter when translating a rem-based design token into a concrete pixel value, or when checking exactly how large a rem value will render.',
        ],
        faqs: [
            { question: 'How do I convert rem to px?', answer: 'Multiply the rem value by the root font-size. At the default 16px root, px = rem × 16 — so 1rem = 16px and 2rem = 32px.' },
            { question: 'Is 1rem always 16px?', answer: 'Only when the root font-size is 16px (the browser default). If html { font-size } is set to another value, 1rem equals that value instead.' },
            { question: 'When should I convert rem to px?', answer: 'When you need an absolute size — for a fixed-width asset, a spec that requires pixels, or debugging why a rem value renders at a certain size.' },
            { question: 'Does nesting affect rem?', answer: 'No. rem is always relative to the root font-size regardless of nesting, so the conversion depends only on the root value — not on parent elements.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'base',
            inputUnit: 'rem',
            outputUnit: 'px',
            compute: (rem, base) => rem * base,
            tableValues: UNIT_STEPS_SMALL,
        },
    },
    /* ------------------------------- PT ------------------------------- */
    {
        slug: 'px-to-pt',
        category: 'PT',
        tone: TONE.pt,
        label: 'px to pt',
        metaTitle: 'PX to PT Converter — Pixels to Points | EMLinter',
        metaDescription:
            'Free PX to PT converter. Enter a pixel value to get the exact point (pt) value instantly. 1px = 0.75pt at 96 DPI, with a full px-to-pt reference table.',
        keywords: 'px to pt, pixels to points, px to pt converter, convert px to pt, pixel to point',
        h1: 'PX to PT Converter',
        subtitle: 'Convert pixels to points. The point is a print typography unit — 1 point equals 1/72 inch — related to px through the 96 DPI CSS reference.',
        formula: 'pt = px × 72 ÷ 96  (i.e. px × 0.75)',
        intro: [
            'The point (pt) is a physical typography unit equal to 1/72 of an inch, used widely in print and word processors. In CSS the reference resolution is 96 pixels per inch, which fixes the relationship between px and pt.',
            'Because there are 72 points and 96 pixels per inch, converting px to pt means multiplying by 72/96 — that is, by 0.75. So 16px is 12pt, 12px is 9pt, and 24px is 18pt.',
            'This px to pt converter is handy when moving between screen and print specs, or when an email or document tool expects font sizes in points rather than pixels.',
        ],
        faqs: [
            { question: 'How do I convert px to pt?', answer: 'Multiply the pixel value by 0.75 (which is 72/96). So 16px = 12pt and 20px = 15pt. This assumes the CSS reference of 96 pixels per inch.' },
            { question: 'What is a point (pt)?', answer: 'A point is a print typography unit equal to 1/72 of an inch. It is the standard unit for font sizes in word processors and print design.' },
            { question: 'Why is 16px equal to 12pt?', answer: 'There are 96 px and 72 pt in one inch. 16px × (72/96) = 12pt. The 0.75 factor comes directly from the 72÷96 ratio.' },
            { question: 'Does DPI change the px-to-pt result?', answer: 'CSS defines the reference pixel at 96 DPI, so the standard conversion uses 96. On physical print output at a different DPI, the pixel count for a given point size changes, but the CSS px↔pt relationship stays fixed at 0.75.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: null,
            inputUnit: 'px',
            outputUnit: 'pt',
            compute: (px) => (px * PT_PER_IN) / DEFAULT_DPI,
            tableValues: PX_STEPS,
        },
    },
    {
        slug: 'pt-to-px',
        category: 'PT',
        tone: TONE.pt,
        label: 'pt to px',
        metaTitle: 'PT to PX Converter — Points to Pixels | EMLinter',
        metaDescription:
            'Free PT to PX converter. Enter a point value to get the exact pixel value instantly. 1pt = 1.3333px at 96 DPI, with a full pt-to-px reference table.',
        keywords: 'pt to px, points to pixels, pt to px converter, convert pt to px, point to pixel',
        h1: 'PT to PX Converter',
        subtitle: 'Convert points to pixels. A point is 1/72 inch; at the 96 DPI CSS reference, 1pt equals 1.3333px.',
        formula: 'px = pt × 96 ÷ 72  (i.e. pt × 1.3333)',
        intro: [
            'The point (pt) is a print unit equal to 1/72 inch. To render a point size on screen you convert it to pixels through the CSS reference of 96 pixels per inch.',
            'Since there are 96 pixels and 72 points per inch, px = pt × 96/72 = pt × 1.3333. So 12pt is 16px, 9pt is 12px, and 18pt is 24px.',
            'Use this pt to px converter to translate a print or word-processor font size into the pixel value you need for CSS, email, or on-screen design.',
        ],
        faqs: [
            { question: 'How do I convert pt to px?', answer: 'Multiply the point value by 1.3333 (which is 96/72). So 12pt = 16px and 9pt = 12px, using the CSS reference of 96 pixels per inch.' },
            { question: 'Why is 12pt equal to 16px?', answer: 'There are 72 points and 96 pixels in one inch. 12pt × (96/72) = 16px. The 1.3333 factor is the 96÷72 ratio.' },
            { question: 'When would I convert pt to px?', answer: 'When a spec, print layout, or word processor gives a font size in points and you need the pixel equivalent for CSS or on-screen rendering.' },
            { question: 'Is the conversion affected by screen resolution?', answer: 'The CSS px↔pt relationship is fixed at the 96 DPI reference, so 1pt is always 1.3333 CSS pixels regardless of the physical density of the display.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: null,
            inputUnit: 'pt',
            outputUnit: 'px',
            compute: (pt) => (pt * DEFAULT_DPI) / PT_PER_IN,
            tableValues: [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72],
        },
    },
    /* -------------------------- Viewport (VH) ------------------------- */
    {
        slug: 'px-to-vh',
        category: 'Viewport Height (VH)',
        tone: TONE.vh,
        label: 'px to vh',
        metaTitle: 'PX to VH Converter — Pixels to Viewport Height | EMLinter',
        metaDescription:
            'Free PX to VH converter. Enter a pixel value and viewport height to get the vh value instantly. 1vh = 1% of the viewport height, with a reference table.',
        keywords: 'px to vh, pixels to vh, px to vh converter, convert px to vh, viewport height unit',
        h1: 'PX to VH Converter',
        subtitle: 'Convert pixels to vh. 1vh equals 1% of the viewport height, so the result depends on the viewport size you set.',
        formula: 'vh = (px ÷ viewport height) × 100',
        intro: [
            'The vh unit is relative to the viewport: 1vh equals 1% of the browser window’s height. It is used to size elements as a proportion of the screen — full-height hero sections, for example, use height: 100vh.',
            'To convert px to vh you divide the pixel value by the viewport height and multiply by 100. On a 1080px-tall viewport, 108px is 10vh and 540px is 50vh. Change the viewport height field to match the device you are targeting.',
            'Because vh depends on the viewport, the same pixel value maps to different vh values across devices — this converter makes that relationship explicit for any viewport you choose.',
        ],
        faqs: [
            { question: 'How do I convert px to vh?', answer: 'Divide the pixel value by the viewport height, then multiply by 100. On a 1080px-tall viewport, 540px = (540/1080)×100 = 50vh.' },
            { question: 'What is 1vh?', answer: '1vh is 1% of the current viewport height. On an 800px-tall window, 1vh = 8px; on a 1080px window, 1vh = 10.8px.' },
            { question: 'What viewport height should I use?', answer: 'Use the height of the device or window you are designing for. This tool defaults to 1080px (a common desktop height); change it to match a phone, tablet, or specific breakpoint.' },
            { question: 'Does vh include the browser toolbar?', answer: 'On many mobile browsers 100vh historically included the area behind dynamic toolbars, which caused jumps. Newer units (svh, lvh, dvh) address this, but the px↔vh math here uses the viewport height you supply.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'viewport',
            inputUnit: 'px',
            outputUnit: 'vh',
            compute: (px, vp) => (px / vp) * 100,
            tableValues: [10, 20, 40, 54, 108, 216, 270, 324, 432, 540, 648, 756, 864, 972, 1080],
        },
    },
    {
        slug: 'vh-to-px',
        category: 'Viewport Height (VH)',
        tone: TONE.vh,
        label: 'vh to px',
        metaTitle: 'VH to PX Converter — Viewport Height to Pixels | EMLinter',
        metaDescription:
            'Free VH to PX converter. Enter a vh value and viewport height to get the pixel value instantly. 1vh = 1% of viewport height, with a reference table.',
        keywords: 'vh to px, vh to pixels, vh to px converter, convert vh to px, viewport height to pixels',
        h1: 'VH to PX Converter',
        subtitle: 'Convert vh to pixels. Since 1vh is 1% of the viewport height, the pixel result scales with the viewport size you set.',
        formula: 'px = (vh × viewport height) ÷ 100',
        intro: [
            'vh is a viewport-relative unit where 1vh equals 1% of the window height. Converting vh to px resolves that percentage into a concrete pixel value for a specific viewport.',
            'The formula is px = (vh × viewport height) / 100. On a 1080px viewport, 50vh is 540px and 10vh is 108px. Set the viewport height field to the screen size you are targeting.',
            'This vh to px converter is useful for checking how large a vh-based element will actually render on a given device, or for translating a viewport-relative design into fixed pixel values.',
        ],
        faqs: [
            { question: 'How do I convert vh to px?', answer: 'Multiply the vh value by the viewport height, then divide by 100. On a 1080px viewport, 50vh = (50×1080)/100 = 540px.' },
            { question: 'Why does the pixel value change per device?', answer: 'Because vh is a percentage of the viewport height, the same vh value equals different pixel counts on different screen sizes. Set the viewport height to match your target device.' },
            { question: 'What is 100vh in pixels?', answer: '100vh equals the full viewport height. On a 1080px-tall window it is 1080px; on an 800px window it is 800px.' },
            { question: 'What viewport height should I enter?', answer: 'Use the height of the device or window you are designing for. The tool defaults to 1080px; adjust it for mobile, tablet, or a specific breakpoint.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'viewport',
            inputUnit: 'vh',
            outputUnit: 'px',
            compute: (vh, vp) => (vh * vp) / 100,
            tableValues: [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100],
        },
    },
    /* ------------------------------ INCH ------------------------------ */
    {
        slug: 'px-to-inches',
        category: 'INCH',
        tone: TONE.inch,
        label: 'pixels to inches',
        metaTitle: 'Pixels to Inches Converter — px to in | EMLinter',
        metaDescription:
            'Free pixels to inches converter. Enter a pixel value and DPI to get the exact inch value. 96px = 1 inch at the CSS reference, with a full reference table.',
        keywords: 'pixels to inches, px to inches, px to in, pixels to inches converter, convert px to inches',
        h1: 'Pixels to Inches Converter',
        subtitle: 'Convert pixels to inches at a chosen resolution. At the 96 DPI CSS reference, 96px equals 1 inch.',
        formula: 'inches = px ÷ DPI (default 96)',
        intro: [
            'An inch is a physical length. On screen, the number of pixels per inch depends on the resolution (DPI/PPI). CSS defines a reference of 96 pixels per inch, which is the default this converter uses.',
            'To convert pixels to inches you divide the pixel count by the DPI. At 96 DPI, 96px is 1 inch, 48px is 0.5 inch, and 192px is 2 inches. For print, set the DPI to your export resolution — often 150 or 300.',
            'This pixels to inches converter is useful when preparing screen assets for print, sizing physical layouts, or checking the real-world dimensions of an image at a given resolution.',
        ],
        faqs: [
            { question: 'How do I convert pixels to inches?', answer: 'Divide the pixel count by the DPI. At the 96 DPI CSS reference, inches = px / 96 — so 96px = 1 inch and 192px = 2 inches.' },
            { question: 'How many pixels are in an inch?', answer: 'It depends on the resolution. The CSS reference is 96 pixels per inch. Print work often uses 150 or 300 pixels per inch — set the DPI field to match.' },
            { question: 'What DPI should I use for print?', answer: 'Most print work uses 300 DPI for high quality; 150 DPI is acceptable for larger formats viewed at a distance. Enter your export DPI to get accurate physical inches.' },
            { question: 'Why does the inch value change with DPI?', answer: 'Pixels are counts, not lengths. A higher DPI packs more pixels into each inch, so the same pixel count spans fewer inches. That is why DPI is required for an accurate conversion.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'px',
            outputUnit: 'in',
            compute: (px, dpi) => px / dpi,
            tableValues: [24, 48, 72, 96, 120, 144, 192, 240, 288, 384, 480, 576, 768, 960],
        },
    },
    {
        slug: 'inches-to-pixels',
        category: 'INCH',
        tone: TONE.inch,
        label: 'inches to pixels',
        metaTitle: 'Inches to Pixels Converter — in to px | EMLinter',
        metaDescription:
            'Free inches to pixels converter. Enter an inch value and DPI to get the exact pixel count. 1 inch = 96px at the CSS reference, with a reference table.',
        keywords: 'inches to pixels, in to px, inches to px, inches to pixels converter, convert inches to px',
        h1: 'Inches to Pixels Converter',
        subtitle: 'Convert inches to pixels at a chosen resolution. At the 96 DPI CSS reference, 1 inch equals 96px.',
        formula: 'px = inches × DPI (default 96)',
        intro: [
            'An inch is a physical length; a pixel is a screen dot. Converting inches to pixels requires a resolution (DPI) — the number of pixels packed into each inch. CSS uses a 96 DPI reference by default.',
            'The formula is px = inches × DPI. At 96 DPI, 1 inch is 96px, 0.5 inch is 48px, and 2 inches are 192px. For print exports, set the DPI to 150 or 300 to get the correct pixel dimensions.',
            'Use this inches to pixels converter when sizing an image for a physical print at a target resolution, or turning a real-world measurement into the pixel dimensions your design tool needs.',
        ],
        faqs: [
            { question: 'How do I convert inches to pixels?', answer: 'Multiply the inch value by the DPI. At the 96 DPI CSS reference, px = inches × 96 — so 1 inch = 96px and 2 inches = 192px.' },
            { question: 'How many pixels is 1 inch?', answer: 'At the 96 DPI CSS reference, 1 inch is 96 pixels. At 300 DPI (common for print), 1 inch is 300 pixels. Set the DPI field to your target resolution.' },
            { question: 'What DPI should I choose?', answer: 'Use 96 for on-screen CSS work, and 150–300 for print. A higher DPI produces more pixels for the same physical size, giving sharper print output.' },
            { question: 'Why do I need DPI to convert?', answer: 'Because an inch is a length and a pixel is a count, you need to know how many pixels fit in one inch. That ratio is the DPI, so it is required for an accurate conversion.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'in',
            outputUnit: 'px',
            compute: (inch, dpi) => inch * dpi,
            tableValues: [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 8.5, 10, 11, 12],
        },
    },
    /* ------------------------------- CM ------------------------------- */
    {
        slug: 'pixels-to-centimeters',
        category: 'CM',
        tone: TONE.cm,
        label: 'pixels to centimeters',
        metaTitle: 'Pixels to Centimeters Converter — px to cm | EMLinter',
        metaDescription:
            'Free pixels to centimeters converter. Enter a pixel value and DPI to get the exact cm value. 96px ≈ 2.54cm at the CSS reference, with a reference table.',
        keywords: 'pixels to centimeters, px to cm, pixels to cm, px to cm converter, convert px to cm',
        h1: 'Pixels to Centimeters Converter',
        subtitle: 'Convert pixels to centimeters at a chosen resolution. There are 2.54 cm per inch, and 96px equals 1 inch at the CSS reference.',
        formula: 'cm = (px ÷ DPI) × 2.54  (default DPI 96)',
        intro: [
            'A centimeter is a metric length. Converting pixels to centimeters goes through inches: divide the pixel count by the DPI to get inches, then multiply by 2.54 because there are 2.54 centimeters in one inch.',
            'At the 96 DPI CSS reference, 96px is 2.54cm, so roughly 37.8px make up 1cm. Set the DPI to your export resolution when preparing assets for print at 150 or 300 DPI.',
            'This pixels to centimeters converter is handy for print preparation, physical layout sizing, or understanding the real-world width of a screen element in metric units.',
        ],
        faqs: [
            { question: 'How do I convert pixels to centimeters?', answer: 'Divide the pixel count by the DPI to get inches, then multiply by 2.54. At 96 DPI, 96px = 2.54cm, so 1cm ≈ 37.8px.' },
            { question: 'How many pixels are in 1 cm?', answer: 'At the 96 DPI CSS reference, 1cm ≈ 37.8 pixels (96 ÷ 2.54). At 300 DPI, 1cm ≈ 118 pixels. It depends on the DPI you set.' },
            { question: 'Why does the conversion go through inches?', answer: 'The pixel-to-physical relationship is defined per inch (DPI). Centimeters relate to inches by the fixed factor 2.54, so px → inches → cm is the reliable path.' },
            { question: 'What DPI should I use for print?', answer: 'Use 300 DPI for high-quality print and 150 for larger formats. Enter your export DPI so the centimeter result matches the physical output.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'px',
            outputUnit: 'cm',
            compute: (px, dpi) => (px / dpi) * CM_PER_IN,
            tableValues: [38, 76, 96, 114, 151, 189, 227, 302, 378, 454, 567, 756, 945, 1134],
        },
    },
    {
        slug: 'centimeters-to-pixels',
        category: 'CM',
        tone: TONE.cm,
        label: 'centimeters to pixels',
        metaTitle: 'Centimeters to Pixels Converter — cm to px | EMLinter',
        metaDescription:
            'Free centimeters to pixels converter. Enter a cm value and DPI to get the exact pixel count. 2.54cm = 96px at the CSS reference, with a reference table.',
        keywords: 'centimeters to pixels, cm to px, cm to pixels, cm to px converter, convert cm to px',
        h1: 'Centimeters to Pixels Converter',
        subtitle: 'Convert centimeters to pixels at a chosen resolution. There are 2.54 cm per inch, and 1 inch equals 96px at the CSS reference.',
        formula: 'px = (cm ÷ 2.54) × DPI  (default DPI 96)',
        intro: [
            'A centimeter is a metric length; converting it to pixels goes through inches. Divide the centimeter value by 2.54 to get inches, then multiply by the DPI to get pixels.',
            'At the 96 DPI CSS reference, 2.54cm is 96px, so 1cm is about 37.8px. For print, set the DPI to 150 or 300 to compute the correct pixel dimensions.',
            'Use this centimeters to pixels converter when a physical measurement in metric units needs to become the pixel dimensions your design or print workflow requires.',
        ],
        faqs: [
            { question: 'How do I convert centimeters to pixels?', answer: 'Divide the cm value by 2.54 to get inches, then multiply by the DPI. At 96 DPI, 1cm ≈ 37.8px and 2.54cm = 96px.' },
            { question: 'How many pixels is 1 cm?', answer: 'At the 96 DPI CSS reference, 1cm ≈ 37.8 pixels. At 300 DPI it is about 118 pixels. The result depends on the DPI you enter.' },
            { question: 'What DPI should I use?', answer: 'Use 96 for on-screen CSS, and 150–300 for print. Higher DPI yields more pixels for the same physical size, producing sharper output.' },
            { question: 'Why is DPI required?', answer: 'A centimeter is a length and a pixel is a count, so you must know how many pixels fit per inch (the DPI) to convert accurately between them.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'cm',
            outputUnit: 'px',
            compute: (cm, dpi) => (cm / CM_PER_IN) * dpi,
            tableValues: [0.5, 1, 1.5, 2, 2.54, 3, 4, 5, 6, 8, 10, 15, 20, 21, 29.7, 30],
        },
    },
    /* ------------------------------- MM ------------------------------- */
    {
        slug: 'pixels-to-millimeters',
        category: 'MM',
        tone: TONE.mm,
        label: 'pixels to millimeters',
        metaTitle: 'Pixels to Millimeters Converter — px to mm | EMLinter',
        metaDescription:
            'Free pixels to millimeters converter. Enter a pixel value and DPI to get the exact mm value. 96px ≈ 25.4mm at the CSS reference, with a reference table.',
        keywords: 'pixels to millimeters, px to mm, pixels to mm, px to mm converter, convert px to mm',
        h1: 'Pixels to Millimeters Converter',
        subtitle: 'Convert pixels to millimeters at a chosen resolution. There are 25.4 mm per inch, and 96px equals 1 inch at the CSS reference.',
        formula: 'mm = (px ÷ DPI) × 25.4  (default DPI 96)',
        intro: [
            'A millimeter is a metric length. Converting pixels to millimeters goes through inches: divide the pixel count by the DPI to get inches, then multiply by 25.4 because there are 25.4 millimeters in one inch.',
            'At the 96 DPI CSS reference, 96px is 25.4mm, so roughly 3.78px make up 1mm. Set the DPI to your export resolution when preparing print assets at 150 or 300 DPI.',
            'This pixels to millimeters converter is useful for fine print work, physical component sizing, and translating on-screen pixels into precise metric measurements.',
        ],
        faqs: [
            { question: 'How do I convert pixels to millimeters?', answer: 'Divide the pixel count by the DPI to get inches, then multiply by 25.4. At 96 DPI, 96px = 25.4mm, so 1mm ≈ 3.78px.' },
            { question: 'How many pixels are in 1 mm?', answer: 'At the 96 DPI CSS reference, 1mm ≈ 3.78 pixels (96 ÷ 25.4). At 300 DPI, 1mm ≈ 11.8 pixels, depending on the DPI you set.' },
            { question: 'Why convert through inches?', answer: 'The pixel-to-physical relationship is defined per inch (DPI). Millimeters relate to inches by the fixed factor 25.4, so px → inches → mm is the accurate path.' },
            { question: 'What DPI should I use for print?', answer: 'Use 300 DPI for high-quality print, 150 for larger formats. Enter your export DPI so the millimeter result matches the physical output.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'px',
            outputUnit: 'mm',
            compute: (px, dpi) => (px / dpi) * MM_PER_IN,
            tableValues: [4, 8, 19, 38, 76, 96, 114, 151, 189, 227, 302, 378, 567, 756],
        },
    },
    {
        slug: 'millimeters-to-pixels',
        category: 'MM',
        tone: TONE.mm,
        label: 'millimeters to pixels',
        metaTitle: 'Millimeters to Pixels Converter — mm to px | EMLinter',
        metaDescription:
            'Free millimeters to pixels converter. Enter a mm value and DPI to get the exact pixel count. 25.4mm = 96px at the CSS reference, with a reference table.',
        keywords: 'millimeters to pixels, mm to px, mm to pixels, mm to px converter, convert mm to px',
        h1: 'Millimeters to Pixels Converter',
        subtitle: 'Convert millimeters to pixels at a chosen resolution. There are 25.4 mm per inch, and 1 inch equals 96px at the CSS reference.',
        formula: 'px = (mm ÷ 25.4) × DPI  (default DPI 96)',
        intro: [
            'A millimeter is a metric length; converting it to pixels goes through inches. Divide the millimeter value by 25.4 to get inches, then multiply by the DPI to get pixels.',
            'At the 96 DPI CSS reference, 25.4mm is 96px, so 1mm is about 3.78px. For print, set the DPI to 150 or 300 to compute the correct pixel dimensions.',
            'Use this millimeters to pixels converter when a precise metric measurement needs to become pixel dimensions for a design tool or print export.',
        ],
        faqs: [
            { question: 'How do I convert millimeters to pixels?', answer: 'Divide the mm value by 25.4 to get inches, then multiply by the DPI. At 96 DPI, 1mm ≈ 3.78px and 25.4mm = 96px.' },
            { question: 'How many pixels is 1 mm?', answer: 'At the 96 DPI CSS reference, 1mm ≈ 3.78 pixels. At 300 DPI it is about 11.8 pixels. The result depends on the DPI you enter.' },
            { question: 'What DPI should I use?', answer: 'Use 96 for on-screen CSS, 150–300 for print. A higher DPI produces more pixels for the same physical size, giving sharper print output.' },
            { question: 'Why is DPI required?', answer: 'A millimeter is a length and a pixel is a count, so you must know how many pixels fit per inch (the DPI) to convert between them accurately.' },
        ],
        numeric: {
            mode: 'numeric',
            secondary: 'dpi',
            inputUnit: 'mm',
            outputUnit: 'px',
            compute: (mm, dpi) => (mm / MM_PER_IN) * dpi,
            tableValues: [1, 2, 5, 10, 15, 20, 25, 25.4, 50, 100, 148, 210, 250, 297, 300, 500],
        },
    },
    /* -------------------------- Paper sizes --------------------------- */
    {
        slug: 'a-paper-sizes-to-pixels',
        category: 'A and B Paper Sizes',
        tone: TONE.paper,
        label: 'A Paper Sizes to pixels',
        metaTitle: 'A Paper Sizes to Pixels — A0–A10 in px | EMLinter',
        metaDescription:
            'Convert ISO A paper sizes (A0 to A10) to pixels at any DPI. A4 is 794 × 1123px at 96 DPI. Pick a size and resolution to get exact pixel dimensions.',
        keywords: 'a paper sizes to pixels, a4 to pixels, a4 in px, a3 to pixels, iso a series pixels, paper size to px',
        h1: 'A Paper Sizes to Pixels',
        subtitle: 'Convert ISO A-series paper sizes (A0 through A10) to pixel dimensions at any resolution. A4 is 794 × 1123px at 96 DPI.',
        formula: 'px = (mm ÷ 25.4) × DPI, per dimension (default DPI 96)',
        intro: [
            'The ISO 216 A series is the international standard for paper, from the large A0 (841 × 1189mm) down to A10. Each size is exactly half the previous one, so A4 is half of A3, and the aspect ratio stays constant at √2.',
            'To get pixel dimensions, each side (defined in millimetres) is converted through inches at your chosen DPI: px = (mm / 25.4) × DPI. At the 96 DPI screen reference, A4 (210 × 297mm) becomes 794 × 1123px. For print, switch to 300 DPI to get 2480 × 3508px.',
            'Pick a size and a resolution to get its exact width and height in pixels, and see the full A-series table update alongside — handy for setting up canvases, print templates, and export dimensions.',
        ],
        faqs: [
            { question: 'What is A4 in pixels?', answer: 'A4 is 210 × 297mm. At the 96 DPI screen reference that is 794 × 1123px; at 300 DPI (print) it is 2480 × 3508px. Set the DPI field to your target resolution.' },
            { question: 'How are A paper sizes converted to pixels?', answer: 'Each dimension in millimetres is divided by 25.4 to get inches, then multiplied by the DPI. So px = (mm / 25.4) × DPI for both width and height.' },
            { question: 'What DPI should I use for printing A-series paper?', answer: 'Use 300 DPI for high-quality print. 96 DPI matches on-screen CSS pixels. Choose the resolution that matches your output device.' },
            { question: 'Why is each A size half the previous one?', answer: 'The ISO 216 standard defines each size as half the area of the one before, achieved by halving the longer side. This keeps the √2 aspect ratio constant so scaling between sizes is distortion-free.' },
        ],
        paper: { mode: 'paper', series: 'A' },
    },
    {
        slug: 'b-paper-sizes-to-pixels',
        category: 'A and B Paper Sizes',
        tone: TONE.paper,
        label: 'B Paper Sizes to pixels',
        metaTitle: 'B Paper Sizes to Pixels — B0–B10 in px | EMLinter',
        metaDescription:
            'Convert ISO B paper sizes (B0 to B10) to pixels at any DPI. B4 is 945 × 1334px at 96 DPI. Pick a size and resolution for exact pixel dimensions.',
        keywords: 'b paper sizes to pixels, b4 to pixels, b5 in px, iso b series pixels, b paper size to px',
        h1: 'B Paper Sizes to Pixels',
        subtitle: 'Convert ISO B-series paper sizes (B0 through B10) to pixel dimensions at any resolution. B4 is 945 × 1334px at 96 DPI.',
        formula: 'px = (mm ÷ 25.4) × DPI, per dimension (default DPI 96)',
        intro: [
            'The ISO 216 B series sits between the A sizes, giving intermediate dimensions used for posters, books, envelopes, and passports. B0 is 1000 × 1414mm, and each subsequent size halves the area.',
            'Pixel dimensions come from converting each millimetre measurement through inches at your DPI: px = (mm / 25.4) × DPI. At 96 DPI, B4 (250 × 353mm) becomes 945 × 1334px; at 300 DPI it becomes 2953 × 4169px.',
            'Choose a B size and resolution to read its exact pixel width and height, with the full B-series table shown alongside for quick reference when building templates and canvases.',
        ],
        faqs: [
            { question: 'What is B4 in pixels?', answer: 'B4 is 250 × 353mm. At the 96 DPI screen reference that is 945 × 1334px; at 300 DPI it is 2953 × 4169px.' },
            { question: 'How are B paper sizes converted to pixels?', answer: 'Each millimetre dimension is divided by 25.4 to get inches, then multiplied by the DPI: px = (mm / 25.4) × DPI for width and height.' },
            { question: 'What is the difference between A and B paper sizes?', answer: 'B sizes are larger than the A size of the same number and sit between consecutive A sizes. B4, for example, is larger than A4 but smaller than A3. Both series share the √2 aspect ratio.' },
            { question: 'What DPI should I use?', answer: 'Use 300 DPI for print quality and 96 DPI for on-screen pixels. Set the DPI field to match your output.' },
        ],
        paper: { mode: 'paper', series: 'B' },
    },
    {
        slug: 'c-paper-sizes-to-pixels',
        category: 'C and US Paper Sizes',
        tone: TONE.paper,
        label: 'C Paper Sizes to pixels',
        metaTitle: 'C Paper Sizes to Pixels — C0–C10 in px | EMLinter',
        metaDescription:
            'Convert ISO C paper sizes (C0 to C10) to pixels at any DPI. C4 is 866 × 1225px at 96 DPI. Pick a size and resolution for exact pixel dimensions.',
        keywords: 'c paper sizes to pixels, c4 to pixels, c5 envelope px, iso c series pixels, c paper size to px',
        h1: 'C Paper Sizes to Pixels',
        subtitle: 'Convert ISO C-series paper sizes (C0 through C10) to pixel dimensions at any resolution. C4 is 866 × 1225px at 96 DPI.',
        formula: 'px = (mm ÷ 25.4) × DPI, per dimension (default DPI 96)',
        intro: [
            'The ISO 216 C series is used mainly for envelopes: a C-size envelope holds the matching A-size sheet unfolded. C4, for instance, fits an A4 sheet. C0 is 917 × 1297mm, with each size halving in area down to C10.',
            'Pixel dimensions come from each millimetre value converted through inches at your DPI: px = (mm / 25.4) × DPI. At 96 DPI, C4 (229 × 324mm) is 866 × 1225px; at 300 DPI it is 2705 × 3827px.',
            'Select a C size and resolution to get its exact pixel dimensions, with the full C-series table alongside — useful for designing envelope artwork and print templates.',
        ],
        faqs: [
            { question: 'What is C4 in pixels?', answer: 'C4 is 229 × 324mm. At the 96 DPI screen reference that is 866 × 1225px; at 300 DPI it is 2705 × 3827px.' },
            { question: 'What are C paper sizes used for?', answer: 'The C series is used for envelopes. A C-size envelope holds the matching A-size sheet — a C4 envelope fits an unfolded A4 sheet, and a C5 fits an A4 folded once.' },
            { question: 'How are C paper sizes converted to pixels?', answer: 'Each millimetre dimension is divided by 25.4 to get inches, then multiplied by the DPI: px = (mm / 25.4) × DPI for width and height.' },
            { question: 'What DPI should I use?', answer: 'Use 300 DPI for print and 96 DPI for on-screen pixels. Match the DPI field to your intended output resolution.' },
        ],
        paper: { mode: 'paper', series: 'C' },
    },
    {
        slug: 'us-paper-sizes-to-pixels',
        category: 'C and US Paper Sizes',
        tone: TONE.paper,
        label: 'US Paper Sizes to pixels',
        metaTitle: 'US Paper Sizes to Pixels — Letter, Legal & more | EMLinter',
        metaDescription:
            'Convert US paper sizes (Letter, Legal, Tabloid, ANSI) to pixels at any DPI. Letter is 816 × 1056px at 96 DPI. Pick a size and resolution for exact pixels.',
        keywords: 'us paper sizes to pixels, letter to pixels, letter size in px, legal to pixels, tabloid px, ansi paper size px',
        h1: 'US Paper Sizes to Pixels',
        subtitle: 'Convert US paper sizes (Letter, Legal, Tabloid, ANSI A–E) to pixel dimensions at any resolution. Letter is 816 × 1056px at 96 DPI.',
        formula: 'px = inches × DPI, per dimension (default DPI 96)',
        intro: [
            'US paper sizes are defined in inches rather than millimetres. Letter (8.5 × 11in) is the everyday standard, alongside Legal (8.5 × 14in), Tabloid (11 × 17in), and the ANSI A–E engineering series.',
            'Because these sizes are already in inches, converting to pixels is a single multiplication by the DPI: px = inches × DPI. At the 96 DPI screen reference, Letter becomes 816 × 1056px; at 300 DPI it is 2550 × 3300px.',
            'Pick a size and resolution to get its exact pixel width and height, with the full US-size table shown alongside — ideal for setting up print-ready documents and canvases in a design tool.',
        ],
        faqs: [
            { question: 'What is US Letter in pixels?', answer: 'Letter is 8.5 × 11in. At the 96 DPI screen reference that is 816 × 1056px; at 300 DPI (print) it is 2550 × 3300px.' },
            { question: 'How are US paper sizes converted to pixels?', answer: 'US sizes are defined in inches, so pixels = inches × DPI for each dimension. No millimetre step is needed. Set the DPI to your target resolution.' },
            { question: 'What is the difference between Letter and A4?', answer: 'Letter (8.5 × 11in ≈ 216 × 279mm) is slightly wider and shorter than A4 (210 × 297mm). Letter is the US standard; A4 is the ISO international standard.' },
            { question: 'What DPI should I use for printing?', answer: 'Use 300 DPI for high-quality print and 96 DPI for on-screen pixels. Enter the DPI that matches your output device.' },
        ],
        paper: { mode: 'paper', series: 'US' },
    },
];

/** Map for O(1) slug lookup (used by the [slug] shell and the React page). */
export const CONVERTER_BY_SLUG: Record<string, ConverterConfig> = Object.fromEntries(
    CONVERTERS.map((c) => [c.slug, c]),
);

export function getConverter(slug: string): ConverterConfig | undefined {
    return CONVERTER_BY_SLUG[slug];
}

/** Ordered category → converters, preserving declaration order for the hub. */
export function convertersByCategory(): { category: string; items: ConverterConfig[] }[] {
    const order: string[] = [];
    const groups: Record<string, ConverterConfig[]> = {};
    for (const c of CONVERTERS) {
        if (!groups[c.category]) {
            groups[c.category] = [];
            order.push(c.category);
        }
        groups[c.category].push(c);
    }
    return order.map((category) => ({ category, items: groups[category] }));
}
