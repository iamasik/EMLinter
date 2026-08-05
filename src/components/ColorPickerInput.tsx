import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ColorPickerInputProps {
    value: string;
    onChange: (hex: string) => void;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const hexToRgb = (hex: string) => {
    let clean = hex.trim().replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) clean = '000000';
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
};

const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;

const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
};

const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};

const isValidHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
const normalizeHex = (v: string) => {
    const { r, g, b } = hexToRgb(v);
    return rgbToHex(r, g, b);
};

const POPOVER_HEIGHT_ESTIMATE = 260;

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hsv, setHsv] = useState(() => {
        const { r, g, b } = hexToRgb(value);
        return rgbToHsv(r, g, b);
    });
    const [hexInput, setHexInput] = useState(value);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const svRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<'sv' | 'hue' | null>(null);

    const reposition = useCallback(() => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const fitsBelow = rect.bottom + POPOVER_HEIGHT_ESTIMATE <= window.innerHeight;
        setCoords({
            top: fitsBelow ? rect.bottom + 8 : Math.max(8, rect.top - POPOVER_HEIGHT_ESTIMATE - 8),
            left: clamp(rect.left, 8, window.innerWidth - 232),
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const { r, g, b } = hexToRgb(value);
        setHsv(rgbToHsv(r, g, b));
        setHexInput(value);
        reposition();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen, reposition]);

    const commitHsv = useCallback((next: { h: number; s: number; v: number }) => {
        setHsv(next);
        const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
        const hex = rgbToHex(r, g, b);
        setHexInput(hex);
        onChange(hex);
    }, [onChange]);

    const updateFromSvPointer = useCallback((clientX: number, clientY: number) => {
        const el = svRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const s = clamp((clientX - rect.left) / rect.width, 0, 1);
        const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
        setHsv(prev => {
            const next = { h: prev.h, s, v };
            const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
            const hex = rgbToHex(r, g, b);
            setHexInput(hex);
            onChange(hex);
            return next;
        });
    }, [onChange]);

    const updateFromHuePointer = useCallback((clientX: number) => {
        const el = hueRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
        setHsv(prev => {
            const next = { h, s: prev.s, v: prev.v };
            const { r, g, b } = hsvToRgb(next.h, next.s, next.v);
            const hex = rgbToHex(r, g, b);
            setHexInput(hex);
            onChange(hex);
            return next;
        });
    }, [onChange]);

    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            if (draggingRef.current === 'sv') updateFromSvPointer(e.clientX, e.clientY);
            else if (draggingRef.current === 'hue') updateFromHuePointer(e.clientX);
        };
        const handleUp = () => { draggingRef.current = null; };
        document.addEventListener('pointermove', handleMove);
        document.addEventListener('pointerup', handleUp);
        return () => {
            document.removeEventListener('pointermove', handleMove);
            document.removeEventListener('pointerup', handleUp);
        };
    }, [updateFromSvPointer, updateFromHuePointer]);

    const handleHexInputChange = (v: string) => {
        setHexInput(v);
        if (isValidHex(v)) {
            const normalized = normalizeHex(v);
            const { r, g, b } = hexToRgb(normalized);
            setHsv(rgbToHsv(r, g, b));
            onChange(normalized);
        }
    };

    const handleHexBlur = () => {
        setHexInput(isValidHex(hexInput) ? normalizeHex(hexInput) : value);
    };

    const swatchHex = isValidHex(value) ? normalizeHex(value) : '#000000';
    const hueRgb = hsvToRgb(hsv.h, 1, 1);
    const hueColor = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);

    return (
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-pink-500 px-2 py-1.5">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className="w-8 h-8 rounded-md border border-gray-600 shadow-inner flex-shrink-0"
                style={{ backgroundColor: swatchHex }}
                aria-label="Open color picker"
            />
            <input
                type="text"
                value={hexInput}
                onChange={e => handleHexInputChange(e.target.value)}
                onBlur={handleHexBlur}
                spellCheck={false}
                className="w-full text-sm text-white bg-transparent focus:outline-none font-mono uppercase"
            />

            {isOpen && createPortal(
                <div
                    ref={popoverRef}
                    style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 100 }}
                    className="w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 space-y-3"
                >
                    <div
                        ref={svRef}
                        onPointerDown={(e) => {
                            draggingRef.current = 'sv';
                            updateFromSvPointer(e.clientX, e.clientY);
                        }}
                        className="relative w-full h-36 rounded-lg cursor-crosshair touch-none select-none"
                        style={{
                            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${hueColor}`,
                        }}
                    >
                        <div
                            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: swatchHex }}
                        />
                    </div>

                    <div
                        ref={hueRef}
                        onPointerDown={(e) => {
                            draggingRef.current = 'hue';
                            updateFromHuePointer(e.clientX);
                        }}
                        className="relative w-full h-3 rounded-full cursor-pointer touch-none select-none"
                        style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                    >
                        <div
                            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColor }}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-600 rounded-md px-2 py-1.5">
                        <span className="text-xs text-gray-500 font-mono">#</span>
                        <input
                            type="text"
                            value={hexInput.replace(/^#/, '')}
                            onChange={e => handleHexInputChange(`#${e.target.value}`)}
                            onBlur={handleHexBlur}
                            spellCheck={false}
                            maxLength={6}
                            className="w-full text-sm text-white bg-transparent focus:outline-none font-mono uppercase"
                        />
                        <div className="w-6 h-6 rounded border border-gray-600 flex-shrink-0" style={{ backgroundColor: swatchHex }} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ColorPickerInput;
