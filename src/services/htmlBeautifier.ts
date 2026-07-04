

const selfClosingTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Tags where content formatting should be preserved
const rawContentTags = new Set(['script', 'style', 'pre', 'textarea']);


/**
 * Beautifies a string of CSS for use within a <style> tag.
 * This function was updated to handle nested rules and complex selectors correctly.
 * @param css The CSS string to format.
 * @param baseIndent The base indentation string to prefix each line with.
 * @returns A formatted CSS string.
 */
function beautifyCss(css: string, baseIndent: string = ''): string {
    const tab = '  ';
    let indentLevel = 0;
    const lines: string[] = [];
    let currentLine = '';

    // Pre-processing to remove comments and normalize whitespace.
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();

    for (const char of css) {
        if (char === '{') {
            currentLine = currentLine.trim();
            // Push selector line
            if (currentLine) {
                 lines.push(baseIndent + tab.repeat(indentLevel) + currentLine + ' {');
            } else {
                // If there's no selector, it's likely a mistake, but we handle it.
                 lines.push(baseIndent + tab.repeat(indentLevel) + '{');
            }
            currentLine = '';
            indentLevel++;
        } else if (char === '}') {
            // Push any remaining declaration on the current line
            if (currentLine.trim()) {
                lines.push(baseIndent + tab.repeat(indentLevel) + currentLine.trim());
                currentLine = '';
            }
            indentLevel = Math.max(0, indentLevel - 1);
            lines.push(baseIndent + tab.repeat(indentLevel) + '}');
        } else if (char === ';') {
            currentLine = currentLine.trim();
            if (currentLine) {
                 lines.push(baseIndent + tab.repeat(indentLevel) + currentLine + ';');
            }
            currentLine = '';
        } else {
            currentLine += char;
        }
    }

    // Post-processing to fix spacing in declarations
    return lines.map(line => {
        if (line.includes(':') && !line.includes('{')) {
            const parts = line.split(':');
            const property = parts[0];
            const value = parts.slice(1).join(':');
            // Add a space after the colon, preserving indentation
            return property.trimEnd() + ': ' + value.trimStart();
        }
        return line;
    }).join('\n');
}


/**
 * Beautifies a string of CSS for use in an inline style attribute.
 * @param css The inline CSS string to format.
 * @returns A formatted single-line CSS string.
 */
function beautifyInlineCss(css: string): string {
    const hadTrailingSemicolon = css.trim().endsWith(';');
    const declarations = css
        .split(';')
        .filter(decl => decl.trim())
        .map(decl => {
            const parts = decl.split(':');
            if (parts.length < 2) return null;
            const prop = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            return `${prop}: ${val}`;
        })
        // FIX: Replaced incorrect type assertion with a proper type guard to filter out null values.
        .filter((value): value is string => !!value);

    if (declarations.length === 0) return '';
    
    const joined = declarations.join('; ');
    return joined + (hadTrailingSemicolon && joined ? ';' : '');
}


export function beautifyHtml(html: string): string {
  const tab = '  '; // Two-space indentation
  let result = '';
  let indentLevel = 0;
  let inRawTag: string | false = false;

  const tokens = html.split(/(<[^>]+>)/).filter(token => token.trim() !== '');

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.startsWith('<') && token.endsWith('>')) { // It's a tag
      const tagNameMatch = token.match(/<\/?([a-zA-Z0-9:]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';

      if (inRawTag) {
        result += token;
        if (token.startsWith('</') && tagName === inRawTag) {
          inRawTag = false;
        }
        continue;
      }
      
      if (token.startsWith('</')) { // Closing tag
        indentLevel = Math.max(0, indentLevel - 1);
        result += '\n' + tab.repeat(indentLevel) + token;
      } else if (token.startsWith('<!--') || token.startsWith('<!')) { // Comment or Doctype
        result += (result.length > 0 ? '\n' : '') + tab.repeat(indentLevel) + token;
      } else { // Opening or self-closing tag
        let processedToken = token;

        const styleRegex = /style\s*=\s*(["'])(.*?)\1/i;
        const styleMatch = processedToken.match(styleRegex);
        if (styleMatch) {
            const originalAttribute = styleMatch[0];
            const quote = styleMatch[1];
            const inlineCss = styleMatch[2];
            const beautifiedInlineCss = beautifyInlineCss(inlineCss);
            const newAttribute = `style=${quote}${beautifiedInlineCss}${quote}`;
            processedToken = processedToken.replace(originalAttribute, newAttribute);
        }
        
        if (result.length > 0 && !result.endsWith('\n')) {
          result += '\n' + tab.repeat(indentLevel) + processedToken;
        } else {
            result += (result.length > 0 ? '\n' : '') + tab.repeat(indentLevel) + processedToken;
        }

        const isSelfClosing = selfClosingTags.has(tagName) || processedToken.endsWith('/>');
        if (!isSelfClosing) {
          indentLevel++;
          if (rawContentTags.has(tagName)) {
            inRawTag = tagName;
          }
        }
      }
    } else { // It's a text node
      const trimmedText = token.trim();
      if (trimmedText) {
        if (inRawTag === 'style') {
            const beautifiedCss = beautifyCss(token, tab.repeat(indentLevel));
            result += '\n' + beautifiedCss;
        } else if (inRawTag) {
          result += token;
        } else {
          result += '\n' + tab.repeat(indentLevel) + trimmedText;
        }
      }
    }
  }

  return result.trim();
}