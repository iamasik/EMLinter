import React, { useState, useMemo, useCallback } from 'react';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';
import { CopyIcon, CheckCircleIcon } from '../Icons';
import {
    CONVERTER_BASE_PATH,
    DEFAULT_FONT_SIZE,
    DEFAULT_VIEWPORT_HEIGHT,
    DEFAULT_DPI,
    getConverter,
    convertersByCategory,
    fmt,
    PAPER_SIZES,
    PAPER_UNIT,
    paperDimToPx,
    type ConverterConfig,
    type SecondaryField,
} from '../../lib/pixelConverters';

interface Props {
    slug: string;
}

/** Label + default + hint for the optional secondary numeric input. */
const SECONDARY_META: Record<Exclude<SecondaryField, null>, { label: string; def: number; hint: string }> = {
    base: { label: 'Base font-size (px)', def: DEFAULT_FONT_SIZE, hint: 'Parent/root font-size the relative unit is measured against.' },
    viewport: { label: 'Viewport height (px)', def: DEFAULT_VIEWPORT_HEIGHT, hint: '1vh equals 1% of this height.' },
    dpi: { label: 'Resolution (DPI)', def: DEFAULT_DPI, hint: 'Pixels per inch — 96 for screen, 150–300 for print.' },
};

const inputCls =
    'w-full px-4 py-3 text-base font-mono tabular-nums bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition text-white';

const NumericConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
    const nc = config.numeric!;
    const secMeta = nc.secondary ? SECONDARY_META[nc.secondary] : null;

    const [value, setValue] = useState<string>('16');
    const [secondary, setSecondary] = useState<number>(secMeta?.def ?? 1);
    const [copied, setCopied] = useState(false);

    const numValue = parseFloat(value);
    const result = useMemo(() => {
        if (!isFinite(numValue)) return null;
        const sec = secMeta ? (secondary || secMeta.def) : 1;
        const r = nc.compute(numValue, sec);
        return isFinite(r) ? r : null;
    }, [numValue, secondary, nc, secMeta]);

    const copyResult = useCallback(() => {
        if (result == null) return;
        navigator.clipboard.writeText(`${fmt(result)}${nc.outputUnit}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }, [result, nc.outputUnit]);

    const secForTable = secMeta ? (secondary || secMeta.def) : 1;

    return (
        <>
            {/* Converter */}
            <section className="card p-6 md:p-8 mb-8 max-w-3xl mx-auto">
                <div className={`grid gap-4 ${secMeta ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                    <label className="block">
                        <span className="text-xs text-ink-400">Value ({nc.inputUnit})</span>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={`${inputCls} mt-1`}
                            aria-label={`Value in ${nc.inputUnit}`}
                        />
                    </label>
                    {secMeta && (
                        <label className="block">
                            <span className="text-xs text-ink-400">{secMeta.label}</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                value={secondary}
                                onChange={(e) => setSecondary(parseFloat(e.target.value) || 0)}
                                className={`${inputCls} mt-1`}
                                aria-label={secMeta.label}
                            />
                        </label>
                    )}
                </div>
                {secMeta && <p className="mt-2 text-xs text-ink-500">{secMeta.hint}</p>}

                {/* Result */}
                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-ink-500">Result</p>
                        <p className="text-2xl md:text-3xl font-display font-bold text-brand-300 font-mono tabular-nums truncate">
                            {result == null ? '—' : fmt(result)}
                            <span className="text-lg text-ink-400 ml-1">{nc.outputUnit}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={copyResult}
                        disabled={result == null}
                        className="flex-shrink-0 p-3 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Copy result"
                        aria-label="Copy result"
                    >
                        {copied ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Formula */}
                <div className="mt-5 rounded-xl bg-ink-950/60 border border-white/10 px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-ink-500 mb-1">Formula</p>
                    <code className="text-sm text-accent-200 font-mono">{config.formula}</code>
                </div>
            </section>

            {/* Reference table */}
            <section className="card p-6 md:p-8 mb-16 max-w-3xl mx-auto">
                <h2 className="text-lg font-display font-bold text-white mb-1">Conversion table</h2>
                <p className="text-sm text-ink-400 mb-4">
                    {secMeta ? `${nc.inputUnit} → ${nc.outputUnit} at ${secMeta.label.toLowerCase()} = ${fmt(secForTable)}.` : `${nc.inputUnit} → ${nc.outputUnit}.`}
                </p>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm font-mono tabular-nums">
                        <thead>
                            <tr className="text-left text-ink-400 border-b border-white/10">
                                <th className="py-2 pr-4 font-medium">{nc.inputUnit}</th>
                                <th className="py-2 font-medium">{nc.outputUnit}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nc.tableValues.map((v) => (
                                <tr key={v} className="border-b border-white/5 last:border-0">
                                    <td className="py-2 pr-4 text-ink-200">{fmt(v)}{nc.inputUnit}</td>
                                    <td className="py-2 text-brand-300">{fmt(nc.compute(v, secForTable))}{nc.outputUnit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

const PaperConverter: React.FC<{ config: ConverterConfig }> = ({ config }) => {
    const series = config.paper!.series;
    const sizes = PAPER_SIZES[series];
    const unit = PAPER_UNIT[series];

    const [sizeName, setSizeName] = useState<string>(sizes.find((s) => /4|Letter/.test(s.name))?.name ?? sizes[0].name);
    const [dpi, setDpi] = useState<number>(DEFAULT_DPI);
    const [copied, setCopied] = useState(false);

    const dpiVal = dpi || DEFAULT_DPI;
    const selected = sizes.find((s) => s.name === sizeName) ?? sizes[0];
    const wPx = paperDimToPx(selected.w, series, dpiVal);
    const hPx = paperDimToPx(selected.h, series, dpiVal);

    const copyResult = useCallback(() => {
        navigator.clipboard.writeText(`${Math.round(wPx)} × ${Math.round(hPx)} px`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }, [wPx, hPx]);

    return (
        <>
            <section className="card p-6 md:p-8 mb-8 max-w-3xl mx-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-xs text-ink-400">Paper size</span>
                        <select
                            value={sizeName}
                            onChange={(e) => setSizeName(e.target.value)}
                            className={`${inputCls} mt-1`}
                            aria-label="Paper size"
                        >
                            {sizes.map((s) => (
                                <option key={s.name} value={s.name} className="bg-ink-900">
                                    {s.name} ({fmt(s.w)} × {fmt(s.h)} {unit})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-xs text-ink-400">Resolution (DPI)</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={dpi}
                            onChange={(e) => setDpi(parseFloat(e.target.value) || 0)}
                            className={`${inputCls} mt-1`}
                            aria-label="Resolution in DPI"
                        />
                    </label>
                </div>
                <p className="mt-2 text-xs text-ink-500">96 DPI for screen, 150–300 for print.</p>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-ink-500">{selected.name} at {fmt(dpiVal)} DPI</p>
                        <p className="text-2xl md:text-3xl font-display font-bold text-brand-300 font-mono tabular-nums truncate">
                            {Math.round(wPx)} × {Math.round(hPx)}
                            <span className="text-lg text-ink-400 ml-1">px</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={copyResult}
                        className="flex-shrink-0 p-3 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Copy dimensions"
                        aria-label="Copy dimensions"
                    >
                        {copied ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="mt-5 rounded-xl bg-ink-950/60 border border-white/10 px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-ink-500 mb-1">Formula</p>
                    <code className="text-sm text-accent-200 font-mono">{config.formula}</code>
                </div>
            </section>

            <section className="card p-6 md:p-8 mb-16 max-w-3xl mx-auto">
                <h2 className="text-lg font-display font-bold text-white mb-1">{series} series at {fmt(dpiVal)} DPI</h2>
                <p className="text-sm text-ink-400 mb-4">Every {series}-series size in pixels at the current resolution.</p>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm font-mono tabular-nums">
                        <thead>
                            <tr className="text-left text-ink-400 border-b border-white/10">
                                <th className="py-2 pr-4 font-medium">Size</th>
                                <th className="py-2 pr-4 font-medium">{unit}</th>
                                <th className="py-2 font-medium">pixels</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map((s) => (
                                <tr
                                    key={s.name}
                                    className={`border-b border-white/5 last:border-0 ${s.name === sizeName ? 'bg-brand-500/10' : ''}`}
                                >
                                    <td className="py-2 pr-4 text-ink-100 font-semibold">{s.name}</td>
                                    <td className="py-2 pr-4 text-ink-300">{fmt(s.w)} × {fmt(s.h)}</td>
                                    <td className="py-2 text-brand-300">
                                        {Math.round(paperDimToPx(s.w, series, dpiVal))} × {Math.round(paperDimToPx(s.h, series, dpiVal))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

const PixelConverterPage: React.FC<Props> = ({ slug }) => {
    const config = getConverter(slug);

    if (!config) {
        return (
            <div className="py-20 text-center">
                <PageHero
                    title="Converter not found"
                    subtitle="That conversion doesn’t exist. Browse the full list of pixel converters instead."
                >
                    <a href={CONVERTER_BASE_PATH} className="btn-primary">All pixel converters</a>
                </PageHero>
            </div>
        );
    }

    // Sibling converters for cross-linking (same category, excluding current).
    const related = convertersByCategory()
        .flatMap((g) => g.items)
        .filter((c) => c.slug !== config.slug)
        .slice(0, 6);

    return (
        <div>
            <PageHero
                eyebrow="Pixel Converter"
                title={config.h1}
                subtitle={config.subtitle}
            >
                <a href={CONVERTER_BASE_PATH} className="btn-secondary">All converters</a>
            </PageHero>

            {config.numeric ? <NumericConverter config={config} /> : <PaperConverter config={config} />}

            {/* SEO prose */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">About the {config.h1.replace(' Converter', '')} conversion</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    {config.intro.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </section>

            {/* Related converters */}
            <section className="max-w-5xl mx-auto mb-12">
                <h2 className="text-sm font-display font-bold uppercase tracking-wider text-ink-400 mb-4">Related converters</h2>
                <div className="flex flex-wrap gap-3">
                    {related.map((c) => (
                        <a key={c.slug} href={`${CONVERTER_BASE_PATH}/${c.slug}`} className="chip hover:border-white/30 hover:text-white transition-colors">
                            {c.label}
                        </a>
                    ))}
                </div>
            </section>

            <SeoFaq title={`${config.h1} FAQs`} items={config.faqs} />
        </div>
    );
};

export default PixelConverterPage;
