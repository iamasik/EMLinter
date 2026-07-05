import React, { useState, useRef, useMemo, useCallback } from 'react';
import { UploadIcon, CopyIcon, CheckCircleIcon, CloseIcon, ScaleIcon } from '../Icons';
import PageHero from '../PageHero';
import SeoFaq from '../SeoFaq';

const faqs = [
    {
        question: 'What is a proportional image element scaler?',
        answer: 'A proportional image element scaler is a browser tool that resizes a set of smaller graphic elements by the exact same ratio you use to resize a larger parent image. You upload a "Mother Image", type the target width and height you want it displayed at, then drop in any number of child element images. The tool derives a horizontal and vertical scale factor from the parent and applies it to every child, so each element keeps its correct relative size and position inside the layout.',
    },
    {
        question: 'How does the relative image resizer calculate the new element sizes?',
        answer: 'The relative image resizer online works with two scale factors. The horizontal factor is the target width divided by the original width (SFx = W_target / W_orig) and the vertical factor is the target height divided by the original height (SFy = H_target / H_orig). Each element’s new width is its original width times SFx, and its new height is its original height times SFy. Because the same responsive image dimensions calculator math is applied to every asset, the whole composition scales in lockstep.',
    },
    {
        question: 'Can I scale multiple image elements at once?',
        answer: 'Yes. This is a batch element scaling tool — drop one file or dozens into the elements zone and each is measured automatically. The multi-image layout dimension calculator lists every asset with its original dimensions and its new relative dimensions side by side, updating in real time as you change the target size. You can copy any single result or remove elements you no longer need without re-uploading the rest.',
    },
    {
        question: 'Does it keep the aspect ratio when I change one dimension?',
        answer: 'It can. With the aspect-ratio lock enabled, editing the target width auto-fills a matching target height (and vice versa) so the parent frame never distorts. That makes it a reliable proportional layout size finder: lock the ratio for a clean uniform resize, or unlock it to stretch width and height independently when you deliberately want different horizontal and vertical scale factors.',
    },
    {
        question: 'What is the difference between the Mother Image and the chunk elements?',
        answer: 'The Mother Image is the parent canvas — the full artboard, banner, or bounding box whose size you are changing. The chunk elements are the child assets that live inside it: buttons, icons, logos, product shots, badges. This parent child image resizing web app treats the mother image as the reference frame and every chunk as a dynamic bounding box that must move with it, which is exactly how a real responsive layout behaves.',
    },
    {
        question: 'Is my image uploaded to a server?',
        answer: 'No. This UI asset relative scaling tool runs entirely client-side in your browser. Files are read locally with the FileReader and Image APIs and every calculation happens on your device — nothing is sent anywhere. That makes this graphic design asset ratio converter and canvas ratio asset calculator safe for confidential mockups, unreleased brand assets, and client work.',
    },
];

interface ChunkElement {
    id: string;
    src: string;
    name: string;
    wOrig: number;
    hOrig: number;
}

// Read an image file into a data URL + its natural dimensions.
function readImage(file: File): Promise<{ src: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const src = String(reader.result ?? '');
            const img = new Image();
            img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error('Could not read image'));
            img.src = src;
        };
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
}

const round = (n: number) => Math.round(n * 100) / 100;

const RelativeImageScalerPage: React.FC = () => {
    // Mother image
    const [mother, setMother] = useState<{ src: string; name: string; width: number; height: number } | null>(null);
    const [targetW, setTargetW] = useState<number>(0);
    const [targetH, setTargetH] = useState<number>(0);
    const [lockAspect, setLockAspect] = useState<boolean>(true);
    const aspectRef = useRef<number>(1);

    // Chunk elements
    const [chunks, setChunks] = useState<ChunkElement[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [dragZone, setDragZone] = useState<'mother' | 'chunks' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const motherInputRef = useRef<HTMLInputElement>(null);
    const chunksInputRef = useRef<HTMLInputElement>(null);

    // Scale factors — recomputed live (guard divide-by-zero when no mother image yet).
    const scale = useMemo(() => {
        if (!mother || mother.width === 0 || mother.height === 0) return { x: 1, y: 1 };
        return { x: targetW / mother.width, y: targetH / mother.height };
    }, [mother, targetW, targetH]);

    const ready = !!mother && targetW > 0 && targetH > 0;

    // Load the mother image and clone its dimensions into the target fields.
    const loadMother = useCallback(async (file: File) => {
        try {
            setError(null);
            const { src, width, height } = await readImage(file);
            setMother({ src, name: file.name, width, height });
            setTargetW(width);
            setTargetH(height);
            aspectRef.current = height ? width / height : 1;
        } catch {
            setError('That file could not be read as an image. Try a PNG, JPG, GIF, WebP, or SVG.');
        }
    }, []);

    // Load one or more chunk elements.
    const loadChunks = useCallback(async (files: FileList | File[]) => {
        const list = Array.from(files);
        if (!list.length) return;
        setError(null);
        const results = await Promise.allSettled(list.map(readImage));
        const next: ChunkElement[] = [];
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                next.push({
                    id: `${list[i].name}-${i}-${next.length}-${r.value.width}x${r.value.height}`,
                    src: r.value.src,
                    name: list[i].name,
                    wOrig: r.value.width,
                    hOrig: r.value.height,
                });
            }
        });
        if (!next.length) {
            setError('None of those files could be read as images.');
            return;
        }
        setChunks((prev) => [...prev, ...next]);
    }, []);

    const applyTargetW = (val: number) => {
        const w = Math.max(0, val || 0);
        setTargetW(w);
        if (lockAspect && aspectRef.current) setTargetH(Math.round(w / aspectRef.current));
    };
    const applyTargetH = (val: number) => {
        const h = Math.max(0, val || 0);
        setTargetH(h);
        if (lockAspect && aspectRef.current) setTargetW(Math.round(h * aspectRef.current));
    };

    const removeChunk = (id: string) => setChunks((prev) => prev.filter((c) => c.id !== id));

    const copyDims = (id: string, w: number, h: number) => {
        navigator.clipboard.writeText(`${round(w)} x ${round(h)} px`);
        setCopiedId(id);
        window.setTimeout(() => setCopiedId((k) => (k === id ? null : k)), 2000);
    };

    const inputCls =
        'w-full px-3 py-2 text-sm font-mono tabular-nums bg-ink-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent transition text-white';
    const readonlyCls =
        'w-full px-3 py-2 text-sm font-mono tabular-nums bg-white/5 border border-white/10 rounded-xl text-ink-300';

    return (
        <div>
            <PageHero
                eyebrow="Image Layout Toolkit"
                title={
                    <>
                        The free <span className="gradient-text">proportional image element scaler</span> for layouts.
                    </>
                }
                subtitle="Upload a parent image, set a target size, then drop in child elements to get every asset’s new relative dimensions in real time. Runs entirely in your browser."
            >
                <a href="#scaler" className="btn-primary">Open the scaler</a>
                <a href="/tools/svg-to-png" className="btn-secondary">SVG to PNG</a>
            </PageHero>

            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm max-w-5xl mx-auto">
                    {error}
                </div>
            )}

            {/* ============ Tool box: Mother Image + target size ============ */}
            <section id="scaler" className="card p-6 md:p-8 mb-8">
                <h2 className="text-lg font-display font-bold text-white mb-1">1. Mother Image</h2>
                <p className="text-sm text-ink-400 mb-4">The parent frame whose size you’re changing. Its scale factor drives every element.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* dropzone */}
                    <div>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragZone('mother');
                            }}
                            onDragLeave={() => setDragZone(null)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragZone(null);
                                const f = e.dataTransfer.files?.[0];
                                if (f) loadMother(f);
                            }}
                            onClick={() => motherInputRef.current?.click()}
                            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                                dragZone === 'mother' ? 'border-brand-400 bg-brand-500/10' : 'border-white/15 hover:border-white/30 bg-ink-950/40'
                            }`}
                        >
                            {mother ? (
                                <div className="flex items-center gap-4">
                                    <img src={mother.src} alt={mother.name} className="w-20 h-20 object-contain rounded-lg bg-checker" />
                                    <div className="text-left min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{mother.name}</p>
                                        <p className="text-xs text-ink-400 font-mono tabular-nums">
                                            {mother.width} × {mother.height} px
                                        </p>
                                        <p className="text-xs text-brand-300 mt-1">Click or drop to replace</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <UploadIcon className="w-8 h-8 text-ink-400" />
                                    <p className="text-sm text-ink-200 font-medium">Drop the Mother Image here</p>
                                    <p className="text-xs text-ink-400">or click to browse — PNG, JPG, GIF, WebP, SVG</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={motherInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) loadMother(f);
                                e.target.value = '';
                            }}
                        />
                    </div>

                    {/* dimensions */}
                    <div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-xs text-ink-400">Original Width</span>
                                <input type="text" readOnly value={mother ? `${mother.width}` : '—'} className={`${readonlyCls} mt-1`} aria-label="Original width" />
                            </label>
                            <label className="block">
                                <span className="text-xs text-ink-400">Original Height</span>
                                <input type="text" readOnly value={mother ? `${mother.height}` : '—'} className={`${readonlyCls} mt-1`} aria-label="Original height" />
                            </label>
                        </div>

                        <div className="flex items-end gap-2 mt-3">
                            <label className="block flex-1">
                                <span className="text-xs text-ink-400">Target Width</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={targetW || ''}
                                    onChange={(e) => applyTargetW(+e.target.value)}
                                    disabled={!mother}
                                    className={`${inputCls} mt-1 disabled:opacity-50`}
                                    aria-label="Target width"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => setLockAspect((v) => !v)}
                                className={`mb-0.5 px-2 py-2 rounded-lg border transition-colors ${
                                    lockAspect ? 'text-brand-300 border-brand-400/40 bg-brand-500/10' : 'text-ink-400 border-white/10 bg-white/5'
                                }`}
                                title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                                aria-label="Toggle aspect ratio lock"
                            >
                                {lockAspect ? '🔒' : '🔓'}
                            </button>
                            <label className="block flex-1">
                                <span className="text-xs text-ink-400">Target Height</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={targetH || ''}
                                    onChange={(e) => applyTargetH(+e.target.value)}
                                    disabled={!mother}
                                    className={`${inputCls} mt-1 disabled:opacity-50`}
                                    aria-label="Target height"
                                />
                            </label>
                        </div>

                        {mother && (
                            <p className="mt-3 text-xs text-ink-400 font-mono tabular-nums">
                                Scale factor: <span className="text-brand-300">SFx {round(scale.x)}</span> ·{' '}
                                <span className="text-accent-300">SFy {round(scale.y)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ============ Dedicated section: element upload + live results ============ */}
            <section id="elements" className="card p-6 md:p-8 mb-16">
                <div className="flex items-center gap-2 mb-1">
                    <ScaleIcon className="w-5 h-5 text-brand-300" />
                    <h2 className="text-lg font-display font-bold text-white">2. Elements &amp; new dimensions</h2>
                </div>
                <p className="text-sm text-ink-400 mb-4">
                    Upload one or more images. Each new width and height updates in real time — no button to press.
                </p>

                {/* dropzone */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragZone('chunks');
                    }}
                    onDragLeave={() => setDragZone(null)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragZone(null);
                        if (e.dataTransfer.files?.length) loadChunks(e.dataTransfer.files);
                    }}
                    onClick={() => chunksInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                        dragZone === 'chunks' ? 'border-brand-400 bg-brand-500/10' : 'border-white/15 hover:border-white/30 bg-ink-950/40'
                    }`}
                >
                    <div className="flex flex-col items-center gap-2 py-2">
                        <UploadIcon className="w-8 h-8 text-ink-400" />
                        <p className="text-sm text-ink-200 font-medium">Drop single or multiple images here</p>
                        <p className="text-xs text-ink-400">click to browse — they’ll list below with their new size</p>
                    </div>
                </div>
                <input
                    ref={chunksInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.length) loadChunks(e.target.files);
                        e.target.value = '';
                    }}
                />

                {!ready && chunks.length > 0 && (
                    <p className="mt-4 text-xs text-amber-300/90">
                        Upload a Mother Image and set a target size above to compute new dimensions.
                    </p>
                )}

                {chunks.length > 0 && (
                    <div className="mt-5 flex items-center justify-between">
                        <p className="text-xs text-ink-400">
                            {chunks.length} element{chunks.length > 1 ? 's' : ''}
                        </p>
                        <button
                            type="button"
                            onClick={() => setChunks([])}
                            className="text-xs font-semibold text-ink-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* results list */}
                <div className="mt-3 space-y-2">
                    {chunks.length === 0 ? (
                        <p className="text-sm text-ink-500 text-center py-8">No elements uploaded yet.</p>
                    ) : (
                        chunks.map((c) => {
                            const nw = c.wOrig * scale.x;
                            const nh = c.hOrig * scale.y;
                            return (
                                <div key={c.id} className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                    {/* left: thumbnail */}
                                    <img src={c.src} alt={c.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg bg-checker flex-shrink-0" />

                                    {/* middle: name + original size */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                        <p className="text-xs text-ink-400 font-mono tabular-nums">
                                            Original: {c.wOrig} × {c.hOrig} px
                                        </p>
                                    </div>

                                    {/* far right: new dimensions + copy — wraps to its own full-width row on mobile */}
                                    <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] uppercase tracking-wide text-ink-500">New size</p>
                                            <p className="text-sm font-mono tabular-nums text-brand-300">
                                                {ready ? `${round(nw)} × ${round(nh)} px` : '—'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyDims(c.id, nw, nh)}
                                            disabled={!ready}
                                            className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Copy new dimensions"
                                            aria-label="Copy new dimensions"
                                        >
                                            {copiedId === c.id ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeChunk(c.id)}
                                            className="p-2 rounded-lg text-ink-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                                            title="Remove element"
                                            aria-label="Remove element"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* SEO prose */}
            <section className="card p-8 md:p-12 max-w-5xl mx-auto mb-12">
                <h2 className="section-title mb-5">Scale every element in a layout by the same ratio</h2>
                <div className="text-ink-300 leading-relaxed space-y-4 text-sm md:text-base">
                    <p>
                        When you resize a banner, an artboard, or an email header, the graphics inside it have to move with it. Eyeballing
                        each one is slow and error-prone. This proportional image element scaler turns that job into arithmetic: it reads
                        the parent’s original size, compares it to your target size, and applies the resulting horizontal and vertical
                        scale factors to every child asset. As a relative image resizer online and responsive image dimensions
                        calculator, it gives you exact pixel values instead of guesses — and they update the instant you change the target.
                    </p>
                    <p>
                        Drop in a whole set of assets and the batch element scaling tool measures each automatically, listing original and
                        new dimensions together — a multi-image layout dimension calculator that keeps your whole composition in proportion.
                        Because it treats the Mother Image as the reference frame and every asset as a dynamic bounding box, it doubles as a
                        parent child image resizing web app and a proportional layout size finder. Lock the aspect ratio for a clean uniform
                        resize, or unlock it when you deliberately want independent horizontal and vertical scaling.
                    </p>
                    <p>
                        Whether you use it as a graphic design asset ratio converter, a UI asset relative scaling tool, a canvas ratio asset
                        calculator, or a dynamic bounding box resizer, everything runs locally in your browser — no uploads, no signup,
                        nothing leaves your device.
                    </p>
                </div>
            </section>

            <SeoFaq title="Proportional Image Element Scaler FAQs" items={faqs} />
        </div>
    );
};

export default RelativeImageScalerPage;
