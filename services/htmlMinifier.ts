import type { MinifyOptions } from '../types';

function minifyCss(css: string): string {
  // A simple and safe CSS minifier
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/[\r\n\t]+/g, '')   // remove newlines and tabs
    .replace(/\s*([;:{},])\s*/g, '$1') // remove whitespace around delimiters
    .replace(/\s\s+/g, ' ') // collapse multiple spaces
    .trim();
}

export function minifyHtml(html: string, options: MinifyOptions): string {
  let processedHtml = html;

  // Preserve <head> content if the option is checked
  let headContent: string | null = null;
  if (options.keepHead) {
    processedHtml = processedHtml.replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
      headContent = match;
      return '<!--EMLINTER_HEAD_PLACEHOLDER-->';
    });
  }

  // Preserve or minify <style> blocks and replace with placeholders
  const styleBlocks = new Map<string, string>();
  let styleCounter = 0;
  processedHtml = processedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
    const placeholder = `<!--EMLINTER_STYLE_PLACEHOLDER_${styleCounter}-->`;
    if (options.keepStyles) {
      // Store the original, un-touched style block
      styleBlocks.set(placeholder, match);
    } else {
      // Minify the CSS content within the style block and store the new block
      const minifiedBlock = match.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/i, (full, startTag, content, endTag) => {
        return `${startTag}${minifyCss(content)}${endTag}`;
      });
      styleBlocks.set(placeholder, minifiedBlock);
    }
    styleCounter++;
    return placeholder;
  });
  
  // 1. Remove HTML comments (except placeholders and Outlook conditional comments)
  processedHtml = processedHtml.replace(/<!--(?!(\[if gte mso 9\]|\[endif\]|EMLINTER_HEAD_PLACEHOLDER|EMLINTER_STYLE_PLACEHOLDER_))[\s\S]*?-->/g, '');
  
  // 2. Replace all newlines, tabs, and carriage returns with a single space.
  processedHtml = processedHtml.replace(/[\r\n\t]+/g, ' ');
  
  // 3. Collapse multiple spaces into one.
  processedHtml = processedHtml.replace(/\s{2,}/g, ' ');
  
  // 4. Remove spaces between tags.
  processedHtml = processedHtml.replace(/>\s+</g, '><');
  
  // 5. Remove leading/trailing whitespace from the whole string
  processedHtml = processedHtml.trim();

  // Restore the preserved <head> content
  if (headContent) {
    processedHtml = processedHtml.replace('<!--EMLINTER_HEAD_PLACEHOLDER-->', headContent);
  }

  // Restore the style blocks (which are now either original or minified)
  styleBlocks.forEach((block, placeholder) => {
    processedHtml = processedHtml.replace(placeholder, block);
  });

  return processedHtml;
}