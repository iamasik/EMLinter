import type { HtmlValidationError } from '../types';

const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * Validates attributes for missing quotes and checks inline CSS for common errors.
 * @param attrString The string of attributes from an HTML tag.
 * @param lineNumber The line number where the tag appears.
 * @param lineContent The full content of the line.
 * @param tagName The name of the HTML tag.
 * @returns An array of validation errors.
 */
function validateAttributesAndCss(
  attrString: string, 
  lineNumber: number, 
  lineContent: string,
  tagName: string
): HtmlValidationError[] {
  const errors: HtmlValidationError[] = [];
  
  // 1. Check for missing close quotes in the entire attribute string
  if ((attrString.match(/"/g) || []).length % 2 !== 0) {
    errors.push({
      lineNumber,
      lineContent: lineContent.trim(),
      errorTag: attrString.trim(),
      message: `Missing closing double quote (") in attributes.`,
    });
  }
  if ((attrString.match(/'/g) || []).length % 2 !== 0) {
    errors.push({
      lineNumber,
      lineContent: lineContent.trim(),
      errorTag: attrString.trim(),
      message: `Missing closing single quote (') in attributes.`,
    });
  }

  // Find the style attribute to validate its content
  const styleMatch = attrString.match(/style\s*=\s*(?:"([^"]*)"|'([^']*)')/i); // case-insensitive style attr
  if (styleMatch) {
    const styleValue = styleMatch[1] || styleMatch[2]; // styleValue will be content of "..." or '...'
    const cssDeclarations = styleValue.trim().replace(/;$/, '').split(';');

    cssDeclarations.forEach(declaration => {
      const trimmedDecl = declaration.trim();
      if (!trimmedDecl) return;
      
      // 2. Check for missing semicolons (heuristic: detects multiple colons in one declaration)
      if ((trimmedDecl.match(/:/g) || []).length > 1) {
        errors.push({
          lineNumber,
          lineContent: lineContent.trim(),
          errorTag: trimmedDecl,
          message: `Possible missing semicolon ';' in style attribute.`
        });
      }

      const cssParts = trimmedDecl.split(':');
      if (cssParts.length > 1) {
        const property = cssParts[0].trim();
        const value = cssParts.slice(1).join(':').trim();

        // 3. Check for uppercase CSS properties
        if (property && property !== property.toLowerCase()) {
          errors.push({
            lineNumber,
            lineContent: lineContent.trim(),
            errorTag: property,
            message: `CSS property "${property}" should be lowercase.`,
          });
        }
        
        // 4. Check for uppercase CSS units in the value
        const valueParts = value.split(/\s+/); // split by whitespace
        valueParts.forEach(part => {
          // Matches a number (including decimals/negatives) followed by uppercase letters
          const unitMatch = part.match(/^(-?[\d\.]+)([A-Z]+)$/);
          if(unitMatch) {
            const unit = unitMatch[2];
            const commonUnits = ['PX', 'EM', 'REM', 'VH', 'VW', '%', 'PT', 'CM', 'MM', 'IN', 'PC'];
            if(commonUnits.includes(unit.toUpperCase())){
              errors.push({
                lineNumber,
                lineContent: lineContent.trim(),
                errorTag: part,
                message: `CSS unit "${unit}" in "${part}" should be lowercase.`,
              });
            }
          }
        });

        // 5. Check for missing '#' in CSS color properties
        if (property.toLowerCase().includes('color')) {
            const trimmedValue = value.replace(/!important/i, '').trim();
            if (/^([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i.test(trimmedValue)) {
              errors.push({
                lineNumber,
                lineContent: lineContent.trim(),
                errorTag: `${property}: ${value}`,
                message: `Hex color value "${trimmedValue}" in style attribute is missing a leading '#'.`,
              });
            }
        }
      }
    });
  }

  // 6. Check for missing '#' in legacy color attributes (e.g., bgcolor)
  const legacyColorRegex = /(bgcolor|color|text|link|vlink|alink)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let legacyMatch;
  while ((legacyMatch = legacyColorRegex.exec(attrString)) !== null) {
      const attrName = legacyMatch[1];
      const attrValue = (legacyMatch[2] || legacyMatch[3] || '').trim();
      
      if (/^([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/i.test(attrValue)) {
          errors.push({
              lineNumber,
              lineContent: lineContent.trim(),
              errorTag: `${attrName}="${attrValue}"`,
              message: `Hex color value "${attrValue}" in ${attrName} attribute is missing a leading '#'.`,
          });
      }
  }

  // 7. Check for missing protocol in <a> tag hrefs
  if (tagName === 'a') {
    const hrefMatch = attrString.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (hrefMatch) {
      const hrefValue = (hrefMatch[1] || hrefMatch[2] || '').trim();
      
      // A valid link should have a protocol, be a mailto/tel link, an anchor link, or a template variable.
      const isValidHref = /^(https?:\/\/|mailto:|tel:|#|\[.*?\]|\{.*?})/i.test(hrefValue);
      
      if (hrefValue && !isValidHref) {
        errors.push({
          lineNumber,
          lineContent: lineContent.trim(),
          errorTag: `href="${hrefValue}"`,
          message: `The link URL "${hrefValue}" is missing a protocol (http:// or https://). Relative links can cause issues in email clients.`,
        });
      }
    }
  }

  return errors;
}


export function validateHtml(html: string): HtmlValidationError[] {
  // This regex finds opening or closing tags.
  // Group 1: optional '/' for closing tags
  // Group 2: tag name (updated to include colons for VML/Office tags)
  // It is defined inside the function to avoid state issues with the 'g' flag.
  const TAG_REGEX = /<(\/)?([a-zA-Z0-9:]+)([^>]*)>/g;
  
  const lines = html.split('\n');
  const stack: { tagName: string; lineNumber: number; lineContent: string }[] = [];
  const errors: HtmlValidationError[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let match;
    // We ignore comments
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<!--') || trimmedLine.startsWith('<!DOCTYPE')) {
        return;
    }
    while ((match = TAG_REGEX.exec(line)) !== null) {
      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();
      const attrString = match[3];
      const isSelfClosing = SELF_CLOSING_TAGS.has(tagName) || attrString.trim().endsWith('/');

      // New validation for attributes and inline CSS on opening tags
      if (!isClosing && attrString) {
          const attrErrors = validateAttributesAndCss(attrString, lineNumber, line, tagName);
          errors.push(...attrErrors);
      }

      if (isClosing) {
        if (stack.length === 0) {
          errors.push({
            lineNumber,
            lineContent: line,
            errorTag: `</${tagName}>`,
            message: `Unexpected closing tag </${tagName}> with no corresponding opening tag.`,
          });
        } else {
          const lastOpenTag = stack[stack.length - 1];
          if (lastOpenTag.tagName === tagName) {
            stack.pop(); // Correctly matched tag
          } else {
            // Mismatch found. Implement "inside-out" error detection.
            let matchingOpenerIndex = -1;
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tagName === tagName) {
                    matchingOpenerIndex = i;
                    break;
                }
            }
            
            if (matchingOpenerIndex !== -1) {
              // A matching opener was found, but other tags were opened after it and not closed.
              // Report these inner tags as the root cause of the error.
              const tagsToCloseCount = stack.length - matchingOpenerIndex - 1;
              for (let i = 0; i < tagsToCloseCount; i++) {
                const unclosedTag = stack.pop();
                if (unclosedTag) {
                   errors.push({
                    lineNumber: unclosedTag.lineNumber,
                    lineContent: unclosedTag.lineContent,
                    errorTag: `<${unclosedTag.tagName}>`,
                    message: `The tag <${unclosedTag.tagName}> was not closed before </${tagName}> was found.`,
                  });
                }
              }
              // Now, pop the actual matching tag from the stack
              stack.pop(); 
            } else {
              // No matching opener was found in the stack at all. This is a true mismatch.
              errors.push({
                lineNumber,
                lineContent: line,
                errorTag: `</${tagName}>`,
                message: `Mismatched closing tag. Expected </${lastOpenTag.tagName}> but found </${tagName}>.`,
              });
            }
          }
        }
      } else if (!isSelfClosing) {
        stack.push({ tagName, lineNumber, lineContent: line });
      }
    }
  });

  // After checking all lines, any remaining tags on the stack are unclosed.
  stack.forEach(unclosedTag => {
    errors.push({
      lineNumber: unclosedTag.lineNumber,
      lineContent: unclosedTag.lineContent,
      errorTag: `<${unclosedTag.tagName}>`,
      message: `The tag <${unclosedTag.tagName}> on line ${unclosedTag.lineNumber} was never closed.`,
    });
  });

  return errors;
}