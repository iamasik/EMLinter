// Type definition for the analysis results
export interface AnalysisResult {
  originalTextColor: string;
  originalBgColor: string;
  lightModeContrast: number;
  darkModeContrast: number;
  passesLight: boolean;
  passesDark: boolean;
  suggestion: string;
  elementTag: string;
  elementText: string;
}

const WCAG_MIN_CONTRAST = 4.5; // AA for normal text

// --- Color Conversion and Calculation Utilities ---

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Handle 3-digit hex
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (!shortResult) return null;
    return [
      parseInt(shortResult[1] + shortResult[1], 16),
      parseInt(shortResult[2] + shortResult[2], 16),
      parseInt(shortResult[3] + shortResult[3], 16),
    ];
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function rgbStringToHex(rgb: string): string {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const sep = rgb.includes(",") ? "," : " ";
    const rgbValues = rgb.substr(4).split(")")[0].split(sep);
    
    let r = (+rgbValues[0]).toString(16).padStart(2, '0');
    let g = (+rgbValues[1]).toString(16).padStart(2, '0');
    let b = (+rgbValues[2]).toString(16).padStart(2, '0');

    return "#" + r + g + b;
}

function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function invertHex(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000'; // Fallback
  const [r, g, b] = rgb.map(c => 255 - c);
  return rgbStringToHex(`rgb(${r}, ${g}, ${b})`);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// --- Analysis Logic ---

function getEffectiveBackgroundColor(element: Element, computedStyles: Window): string {
  let current = element;
  while (current) {
    const style = computedStyles.getComputedStyle(current);
    const bgColor = style.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return rgbStringToHex(bgColor);
    }
    if (current.tagName === 'BODY' || current.tagName === 'HTML') {
      return '#ffffff'; // Assume white if we reach the top
    }
    current = current.parentElement as Element;
  }
  return '#ffffff'; // Default fallback
}

function findBestUniversalColor(textColor: string, bgColor: string): string {
    const bgRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);
    if (!bgRgb || !textRgb) return textColor;

    const invertedBgRgb = bgRgb.map(c => 255 - c) as [number, number, number];
    const [h, s] = rgbToHsl(...textRgb);
    
    let bestL = -1;
    let maxMinContrast = 0;

    // Iterate through lightness values to find the best fit for both modes
    for (let l = 0; l <= 1; l += 0.01) {
        const newRgb = hslToRgb(h, s, l);
        const invertedNewRgb = newRgb.map(c => 255 - c) as [number, number, number];
        
        const lightContrast = getContrast(newRgb, bgRgb);
        const darkContrast = getContrast(invertedNewRgb, invertedBgRgb);
        
        const minContrast = Math.min(lightContrast, darkContrast);
        
        if (minContrast > maxMinContrast) {
            maxMinContrast = minContrast;
            bestL = l;
        }
    }

    if (bestL === -1) return textColor; // Should not happen

    const bestRgb = hslToRgb(h, s, bestL);
    return rgbStringToHex(`rgb(${bestRgb.join(', ')})`);
}

export async function analyzeHtmlColors(doc: Document): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    const processedPairs = new Set<string>();
    const allElements = doc.querySelectorAll('*:not(script):not(style):not(meta):not(link)');

    for (const el of Array.from(allElements)) {
        // Only check elements that directly contain text nodes
        const hasText = Array.from(el.childNodes).some(node => node.nodeType === 3 && node.textContent?.trim());
        if (!hasText) continue;

        const computedStyles = el.ownerDocument.defaultView;
        if (!computedStyles) continue;
        
        const style = computedStyles.getComputedStyle(el);
        const textColor = rgbStringToHex(style.color);
        const bgColor = getEffectiveBackgroundColor(el, computedStyles);
        
        const key = `${textColor}|${bgColor}`;
        if (processedPairs.has(key)) continue;
        processedPairs.add(key);
        
        const textRgb = hexToRgb(textColor);
        const bgRgb = hexToRgb(bgColor);
        if (!textRgb || !bgRgb) continue;

        const invertedTextColor = invertHex(textColor);
        const invertedBgColor = invertHex(bgColor);
        const invertedTextRgb = hexToRgb(invertedTextColor);
        const invertedBgRgb = hexToRgb(invertedBgColor);
        if(!invertedTextRgb || !invertedBgRgb) continue;

        const lightModeContrast = getContrast(textRgb, bgRgb);
        const darkModeContrast = getContrast(invertedTextRgb, invertedBgRgb);

        const passesLight = lightModeContrast >= WCAG_MIN_CONTRAST;
        const passesDark = darkModeContrast >= WCAG_MIN_CONTRAST;

        if (!passesLight || !passesDark) {
            const suggestion = findBestUniversalColor(textColor, bgColor);
            results.push({
                originalTextColor: textColor,
                originalBgColor: bgColor,
                lightModeContrast: parseFloat(lightModeContrast.toFixed(2)),
                darkModeContrast: parseFloat(darkModeContrast.toFixed(2)),
                passesLight,
                passesDark,
                suggestion,
                elementTag: el.tagName.toLowerCase(),
                elementText: el.textContent?.trim().substring(0, 50) + (el.textContent && el.textContent.trim().length > 50 ? '...' : '') || '',
            });
        }
    }

    return results;
}